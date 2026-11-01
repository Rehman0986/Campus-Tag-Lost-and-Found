from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from campus_tag.permissions import IsSuperAdminUser
from .models import Plan, Subscription
from .serializers import PlanSerializer, SubscriptionSerializer

class PlanViewSet(viewsets.ModelViewSet):
    """
    Public read-only for customers; full write access for Super Admin.
    """
    queryset = Plan.objects.all().order_by('price')
    serializer_class = PlanSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsSuperAdminUser()]


class TenantSubscriptionView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if not request.user.tenant:
            return Response({'error': 'No tenant bound to user'}, status=status.HTTP_400_BAD_REQUEST)
        sub = getattr(request.user.tenant, 'subscription', None)
        if not sub:
            return Response({'error': 'No active subscription found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SubscriptionSerializer(sub).data)

    def post(self, request):
        """
        Simulates secure upgrade / webhook activation.
        """
        tenant = request.user.tenant
        plan_id = request.data.get('plan_id')
        plan = Plan.objects.get(id=plan_id)

        now = timezone.now()
        end = now + timedelta(days=30 if plan.billing_cycle == 'Monthly' else (365 if plan.billing_cycle == 'Yearly' else 7))

        sub, _ = Subscription.objects.update_or_create(
            tenant=tenant,
            defaults={
                'plan': plan,
                'status': 'active',
                'current_period_start': now,
                'current_period_end': end,
                'cancel_at_period_end': False
            }
        )

        tenant.item_limit = plan.item_limit
        tenant.save()

        return Response(SubscriptionSerializer(sub).data)
