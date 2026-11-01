import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.utils import timezone
from django.db import transaction as db_transaction
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Plan, Subscription, PaymentTransaction
from .serializers import PlanSerializer, SubscriptionSerializer, PaymentTransactionSerializer, CreateCheckoutSessionSerializer
from core.models import Organization

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class PlanViewSet(viewsets.ModelViewSet):
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_active']
    ordering_fields = ['price', 'name', 'created_at']
    ordering = ['price']

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin:
            return Plan.objects.all()
        return Plan.objects.filter(is_active=True)


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'organization']
    ordering_fields = ['started_at', 'expires_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin:
            return Subscription.objects.all()
        return Subscription.objects.filter(organization=user.organization)

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_super_admin:
            serializer.save()
        else:
            serializer.save(organization=user.organization)

    @action(detail=False, methods=['get'], url_path='my-subscription')
    def my_subscription(self, request):
        user = request.user
        if user.is_super_admin:
            return Response({'detail': 'Super admin does not have a personal subscription.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            subscription = Subscription.objects.get(organization=user.organization)
        except Subscription.DoesNotExist:
            return Response({'detail': 'No subscription found for your organization.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)


class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'organization', 'plan']
    ordering_fields = ['created_at', 'amount', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin:
            return PaymentTransaction.objects.all()
        return PaymentTransaction.objects.filter(organization=user.organization)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_checkout_session(request):
    """Create a Stripe Checkout session for plan subscription."""
    serializer = CreateCheckoutSessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    plan_id = serializer.validated_data['plan_id']
    success_url = serializer.validated_data.get('success_url') or f"{settings.SITE_URL}/dashboard/subscription/success"
    cancel_url = serializer.validated_data.get('cancel_url') or f"{settings.SITE_URL}/dashboard/subscription/cancel"

    try:
        plan = Plan.objects.get(id=plan_id, is_active=True)
    except Plan.DoesNotExist:
        return Response({'error': 'Plan not found or inactive.'}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if user.is_super_admin:
        return Response({'error': 'Super admin cannot purchase subscriptions.'}, status=status.HTTP_400_BAD_REQUEST)

    organization = user.organization
    if not organization:
        return Response({'error': 'User has no organization.'}, status=status.HTTP_400_BAD_REQUEST)

    # Create a pending payment transaction record
    payment_tx = PaymentTransaction.objects.create(
        organization=organization,
        plan=plan,
        amount=plan.price,
        currency=plan.currency,
        status=PaymentTransaction.STATUS_PENDING,
        description=f'Subscription to {plan.name} plan',
        metadata={
            'plan_id': str(plan.id),
            'plan_name': plan.name,
            'organization_id': str(organization.id),
            'organization_name': organization.name,
            'user_email': user.email,
        },
    )

    # Create or retrieve Stripe customer
    subscription = Subscription.objects.filter(organization=organization).first()
    stripe_customer_id = subscription.stripe_customer_id if subscription else None

    if not stripe_customer_id:
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=organization.name,
                metadata={
                    'organization_id': str(organization.id),
                    'user_email': user.email,
                },
            )
            stripe_customer_id = customer.id
            # Save customer id to subscription if exists, or create one
            if subscription:
                subscription.stripe_customer_id = stripe_customer_id
                subscription.save()
            else:
                Subscription.objects.create(
                    organization=organization,
                    plan=plan,
                    status=Subscription.STATUS_TRIAL,
                    stripe_customer_id=stripe_customer_id,
                )
        except stripe.error.StripeError as e:
            payment_tx.status = PaymentTransaction.STATUS_FAILED
            payment_tx.metadata = {**payment_tx.metadata, 'stripe_error': str(e)}
            payment_tx.save()
            return Response({'error': f'Stripe error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        checkout_session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': plan.currency.lower(),
                    'product_data': {
                        'name': plan.name,
                        'description': f'Subscription to {plan.name} plan - {plan.item_limit} items limit, {plan.trial_days} day trial',
                    },
                    'unit_amount': int(plan.price * 100),  # Stripe uses cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'payment_tx_id': str(payment_tx.id),
                'plan_id': str(plan.id),
                'organization_id': str(organization.id),
            },
            payment_intent_data={
                'metadata': {
                    'payment_tx_id': str(payment_tx.id),
                }
            },
        )

        payment_tx.stripe_checkout_session_id = checkout_session.id
        payment_tx.save()

        return Response({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id,
            'payment_tx_id': str(payment_tx.id),
        })

    except stripe.error.StripeError as e:
        payment_tx.status = PaymentTransaction.STATUS_FAILED
        payment_tx.metadata = {**payment_tx.metadata, 'stripe_error': str(e)}
        payment_tx.save()
        return Response({'error': f'Stripe error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@permission_classes([])  # Webhook - authenticated by Stripe signature
def stripe_webhook(request):
    """Handle Stripe webhook events."""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError as e:
        return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

    # Handle the event
    if event.type == 'checkout.session.completed':
        session = event.data.object
        handle_checkout_completed(session)
    elif event.type == 'payment_intent.payment_failed':
        intent = event.data.object
        handle_payment_failed(intent)
    elif event.type == 'payment_intent.canceled':
        intent = event.data.object
        handle_payment_canceled(intent)

    return Response({'status': 'received'})


def handle_checkout_completed(session):
    """Process a completed checkout session."""
    payment_tx_id = session.metadata.get('payment_tx_id')
    plan_id = session.metadata.get('plan_id')
    organization_id = session.metadata.get('organization_id')

    try:
        payment_tx = PaymentTransaction.objects.get(id=payment_tx_id)
    except PaymentTransaction.DoesNotExist:
        return

    if payment_tx.status == PaymentTransaction.STATUS_SUCCESS:
        return  # Already processed

    try:
        plan = Plan.objects.get(id=plan_id)
        organization = Organization.objects.get(id=organization_id)
    except (Plan.DoesNotExist, Organization.DoesNotExist):
        payment_tx.status = PaymentTransaction.STATUS_FAILED
        payment_tx.save()
        return

    # Retrieve the payment intent to get status
    payment_intent = stripe.PaymentIntent.retrieve(session.payment_intent)

    with db_transaction.atomic():
        payment_tx.stripe_payment_intent_id = payment_intent.id
        payment_tx.amount = payment_intent.amount / 100
        payment_tx.currency = payment_intent.currency.upper()
        payment_tx.metadata = {
            **payment_tx.metadata,
            'stripe_payment_intent': payment_intent.id,
            'stripe_charge': payment_intent.latest_charge,
        }

        if payment_intent.status == 'succeeded':
            payment_tx.status = PaymentTransaction.STATUS_SUCCESS

            # Activate or update subscription
            subscription, created = Subscription.objects.get_or_create(
                organization=organization,
                defaults={
                    'plan': plan,
                    'status': Subscription.STATUS_ACTIVE,
                    'stripe_customer_id': session.customer,
                    'started_at': timezone.now(),
                }
            )
            if not created:
                subscription.plan = plan
                subscription.status = Subscription.STATUS_ACTIVE
                subscription.stripe_customer_id = session.customer
                subscription.started_at = timezone.now()
                # Calculate expiry date
                from datetime import timedelta
                subscription.expires_at = timezone.now() + timedelta(days=365)
                subscription.save()
        else:
            payment_tx.status = PaymentTransaction.STATUS_FAILED

        payment_tx.save()

def handle_payment_failed(intent):
    """Process a failed payment intent."""
    payment_tx_id = intent.metadata.get('payment_tx_id')
    if not payment_tx_id:
        return
    try:
        payment_tx = PaymentTransaction.objects.get(id=payment_tx_id)
        payment_tx.status = PaymentTransaction.STATUS_FAILED
        payment_tx.stripe_payment_intent_id = intent.id
        payment_tx.metadata = {
            **payment_tx.metadata,
            'failure_reason': intent.last_payment_error.get('message') if intent.last_payment_error else 'Payment failed',
        }
        payment_tx.save()
    except PaymentTransaction.DoesNotExist:
        pass


def handle_payment_canceled(intent):
    """Process a canceled payment intent."""
    payment_tx_id = intent.metadata.get('payment_tx_id')
    if not payment_tx_id:
        return
    try:
        payment_tx = PaymentTransaction.objects.get(id=payment_tx_id)
        payment_tx.status = PaymentTransaction.STATUS_CANCELLED
        payment_tx.stripe_payment_intent_id = intent.id
        payment_tx.save()
    except PaymentTransaction.DoesNotExist:
        pass


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_success(request):
    """Handle successful payment return."""
    session_id = request.query_params.get('session_id')
    if not session_id:
        return Response({'error': 'Session ID required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payment_tx = PaymentTransaction.objects.get(stripe_checkout_session_id=session_id)
    except PaymentTransaction.DoesNotExist:
        return Response({'error': 'Payment transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if not user.is_super_admin and payment_tx.organization_id != user.organization_id:
        return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = PaymentTransactionSerializer(payment_tx)
    return Response({
        'status': payment_tx.status,
        'transaction': serializer.data,
        'message': 'Payment successful.' if payment_tx.status == PaymentTransaction.STATUS_SUCCESS else 'Payment pending.',
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_cancel(request):
    """Handle canceled payment return."""
    session_id = request.query_params.get('session_id')
    if not session_id:
        return Response({'error': 'Session ID required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payment_tx = PaymentTransaction.objects.get(stripe_checkout_session_id=session_id)
    except PaymentTransaction.DoesNotExist:
        return Response({'error': 'Payment transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if not user.is_super_admin and payment_tx.organization_id != user.organization_id:
        return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = PaymentTransactionSerializer(payment_tx)
    return Response({
        'status': payment_tx.status,
        'transaction': serializer.data,
        'message': 'Payment was canceled.',
    })
