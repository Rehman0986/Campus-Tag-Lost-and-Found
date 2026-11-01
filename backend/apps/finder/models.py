import uuid
from django.db import models
from apps.items.models import Item

class FinderReport(models.Model):
    STATUS_CHOICES = (
        ('unread', 'Unread'),
        ('read', 'Read'),
        ('resolved', 'Resolved'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='finder_reports')
    message = models.TextField(help_text="Finder notes on where the item was left or found")
    finder_contact_note = models.CharField(max_length=255, blank=True, null=True, help_text="Optional note")
    evidence_photo = models.ImageField(upload_to='finder_evidence/', blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    address = models.CharField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unread')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'campus_finder_reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"Report for {self.item.name} at {self.created_at}"


class FinderMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='messages')
    session_id = models.CharField(max_length=100, db_index=True)
    sender = models.CharField(max_length=20, choices=(('finder', 'Finder'), ('owner', 'Owner')))
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'campus_finder_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender}: {self.text[:30]}"
