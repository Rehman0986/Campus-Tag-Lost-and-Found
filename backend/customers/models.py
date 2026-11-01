from django.db import models
from django.conf import settings
from core.models import Organization


class CustomerProfile(models.Model):
    """Extended profile for customer users."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer_profile'
    )
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='customer_profiles'
    )
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['user__email']
        verbose_name = 'Customer Profile'
        verbose_name_plural = 'Customer Profiles'

    def __str__(self):
        return f'{self.user.email} - {self.organization.name}'
