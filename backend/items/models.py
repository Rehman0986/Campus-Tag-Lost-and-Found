import uuid
from django.db import models
from django.conf import settings
from core.models import Organization


class Category(models.Model):
    """Item categories."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Item(models.Model):
    """A lost-and-found item owned by a customer organization."""
    STATUS_ACTIVE = 'active'
    STATUS_LOST = 'lost'
    STATUS_RECOVERED = 'recovered'
    STATUS_DISABLED = 'disabled'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_LOST, 'Lost'),
        (STATUS_RECOVERED, 'Recovered'),
        (STATUS_DISABLED, 'Disabled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    public_item_id = models.CharField(max_length=32, unique=True, db_index=True, help_text='Short public ID used in QR codes')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='items')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    is_lost_mode = models.BooleanField(default=False)
    last_reported_location = models.TextField(blank=True, help_text='Last known location description')
    last_reported_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_reported_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_reported_at = models.DateTimeField(null=True, blank=True)
    last_reported_source = models.CharField(max_length=20, blank=True, help_text='Owner or Finder')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['public_item_id']),
        ]
        verbose_name = 'Item'
        verbose_name_plural = 'Items'

    def __str__(self):
        return self.name

    @property
    def is_publicly_visible(self):
        """Public QR finder pages remain active even if subscription expires, unless disabled."""
        return self.status != self.STATUS_DISABLED


class ItemPhoto(models.Model):
    """Photos attached to an item."""
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='item_photos/')
    caption = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
        verbose_name = 'Item Photo'
        verbose_name_plural = 'Item Photos'

    def __str__(self):
        return f'Photo for {self.item.name}'
