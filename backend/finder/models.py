import uuid
from django.db import models
from django.conf import settings
from items.models import Item


class FinderReport(models.Model):
    """A report submitted by a finder who scanned a QR code."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='finder_reports')
    message = models.TextField()
    finder_name = models.CharField(max_length=255, blank=True)
    finder_contact = models.CharField(max_length=255, blank=True, help_text='Optional contact info from finder')
    location = models.TextField(blank=True, help_text='Dropped pin or typed address')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    photo_evidence = models.ImageField(upload_to='finder_evidence/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Finder Report'
        verbose_name_plural = 'Finder Reports'

    def __str__(self):
        return f'Report for {self.item.name} at {self.created_at}'
