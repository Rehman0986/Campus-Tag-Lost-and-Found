from rest_framework import serializers
from .models import Plan, Subscription, PaymentTransaction


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'name', 'slug', 'price', 'currency', 'trial_days', 'item_limit', 'features', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(queryset=Plan.objects.all(), source='plan', write_only=True, required=False)

    class Meta:
        model = Subscription
        fields = [
            'id', 'organization', 'plan', 'plan_id', 'status', 'started_at', 'expires_at',
            'trial_ends_at', 'auto_renew', 'stripe_subscription_id', 'stripe_customer_id',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'started_at', 'created_at', 'updated_at', 'stripe_subscription_id', 'stripe_customer_id']


class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'organization', 'plan', 'stripe_payment_intent_id', 'stripe_checkout_session_id',
            'amount', 'currency', 'status', 'description', 'metadata', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'stripe_payment_intent_id', 'stripe_checkout_session_id', 'created_at', 'updated_at']


class CreateCheckoutSessionSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()
    success_url = serializers.URLField(required=False)
    cancel_url = serializers.URLField(required=False)
