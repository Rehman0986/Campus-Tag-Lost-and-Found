from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.conf import settings
from django.db import models
from django.utils import timezone

from .managers import UserManager


class Organization(models.Model):
    """A tenant/organization. Each customer belongs to exactly one organization."""
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'

    def __str__(self):
        return self.name


class SiteContent(models.Model):
    """Dynamic website content editable by Super Admin from the dashboard."""
    key = models.SlugField(max_length=100, unique=True, help_text='Unique content key (e.g. site_name, footer_text)')
    value = models.TextField(blank=True, help_text='Content value')
    value_type = models.CharField(max_length=20, default='text', choices=[
        ('text', 'Text'),
        ('html', 'HTML'),
        ('url', 'URL'),
        ('color', 'Color'),
    ])
    is_public = models.BooleanField(default=True, help_text='Visible on public website')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['key']
        verbose_name = 'Site Content'
        verbose_name_plural = 'Site Content'

    def __str__(self):
        return self.key


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model with role-based access control.

    Roles:
        SUPER_ADMIN - Platform owner, full access across all organizations.
        CUSTOMER    - Belongs to one organization, isolated from others.
    """
    ROLE_SUPER_ADMIN = 'super_admin'
    ROLE_CUSTOMER = 'customer'
    ROLE_CHOICES = [
        (ROLE_SUPER_ADMIN, 'Super Admin'),
        (ROLE_CUSTOMER, 'Customer'),
    ]

    email = models.EmailField(unique=True, db_index=True)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_CUSTOMER)
    organization = models.ForeignKey(
        Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='users'
    )
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        ordering = ['-date_joined']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

    @property
    def is_super_admin(self):
        return self.role == self.ROLE_SUPER_ADMIN

    @property
    def is_customer(self):
        return self.role == self.ROLE_CUSTOMER

    def has_organization_access(self, org):
        """Check if user can access the given organization."""
        if self.is_super_admin:
            return True
        return self.organization_id == org.id
