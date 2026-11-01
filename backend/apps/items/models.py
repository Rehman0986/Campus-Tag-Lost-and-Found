import uuid
import io
import qrcode
from django.db import models
from django.core.files.base import ContentFile
from apps.accounts.models import Tenant

class Item(models.Model):
    CATEGORY_CHOICES = (
        ('Electronics & Laptops', 'Electronics & Laptops'),
        ('Lab & Research Equipment', 'Lab & Research Equipment'),
        ('Textbooks & Notebooks', 'Textbooks & Notebooks'),
        ('Keys & Access Badges', 'Keys & Access Badges'),
        ('Bicycles & Scooters', 'Bicycles & Scooters'),
        ('Musical Instruments', 'Musical Instruments'),
        ('Bags & Backpacks', 'Bags & Backpacks'),
        ('Other Essentials', 'Other Essentials'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='items')
    public_id = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=60, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    reward_offered = models.CharField(max_length=150, blank=True, null=True)
    
    # Lost & Recovery status
    is_lost = models.BooleanField(default=False, db_index=True)
    lost_date = models.DateTimeField(null=True, blank=True)
    lost_note = models.TextField(blank=True, null=True)
    is_recovered = models.BooleanField(default=False)
    recovered_date = models.DateTimeField(null=True, blank=True)

    # Scans & Location
    scan_count = models.PositiveIntegerField(default=0)
    last_scanned_at = models.DateTimeField(null=True, blank=True)
    last_latitude = models.FloatField(null=True, blank=True)
    last_longitude = models.FloatField(null=True, blank=True)
    last_address = models.CharField(max_length=500, blank=True, null=True)

    # QR Code Asset & Photo
    photo = models.ImageField(upload_to='item_photos/', blank=True, null=True)
    qr_code_image = models.ImageField(upload_to='qr_codes/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'campus_items'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.public_id})"

    def generate_qr_code(self, base_url="http://localhost:3000"):
        """
        Generates physical QR Code image and binds to instance.
        """
        scan_url = f"{base_url}/f/{self.public_id}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=2,
        )
        qr.add_data(scan_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#0f172a", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        filename = f"qr_{self.public_id}.png"
        self.qr_code_image.save(filename, ContentFile(buffer.getvalue()), save=False)

    def save(self, *args, **kwargs):
        if not self.public_id:
            self.public_id = f"cpt-{uuid.uuid4().hex[:4]}-{uuid.uuid4().hex[:4]}"
        if not self.qr_code_image:
            self.generate_qr_code()
        super().save(*args, **kwargs)
