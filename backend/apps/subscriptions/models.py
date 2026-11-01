import uuid
from django.db import models
from apps.accounts.models import Tenant

class Plan(models.Model):
    CYCLE_CHOICES = (
        ('7-Day Pass', '7-Day Pass'),
        ('Monthly', 'Monthly'),
        ('Yearly', 'Yearly'),
    )

    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=150)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    billing_cycle = models.CharField(max_length=30, choices=CYCLE_CHOICES, default='Monthly')
    item_limit = models.PositiveIntegerField(default=25)
    trial_days = models.PositiveIntegerField(default=7)
    features = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False)
    badge = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'campus_subscription_plans'

    def __str__(self):
        return f"{self.name} (${self.price})"


class Subscription(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('trial', 'Trial'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name='subscriptions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='trial')
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    cancel_at_period_end = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'campus_subscriptions'

    def __str__(self):
        return f"{self.tenant.name} - {self.plan.name} ({self.status})"
