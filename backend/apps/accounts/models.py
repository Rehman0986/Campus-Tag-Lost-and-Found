import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class Tenant(models.Model):
    """
    Multi-tenant organization boundary representing a university department,
    student research cohort, or campus laboratory.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text="e.g. Bio-Robotics Research Group")
    campus_name = models.CharField(max_length=200, help_text="e.g. Stanford University")
    slug = models.SlugField(max_length=100, unique=True)
    item_limit = models.PositiveIntegerField(default=5)
    contact_email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, null=True)
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'campus_tenants'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.campus_name})"


class User(AbstractUser):
    """
    Custom user model supporting Super Admin and Customer roles.
    """
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin (Platform Owner)'),
        ('customer', 'Customer (Campus User / Manager)'),
    )

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('disabled', 'Disabled'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    tenant = models.ForeignKey(Tenant, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'campus_users'

    def __str__(self):
        return f"{self.email} ({self.role})"


class SiteSettings(models.Model):
    id = models.AutoField(primary_key=True)
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'campus_site_settings'

