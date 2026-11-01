from rest_framework import serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'
        read_only_fields = ('id', 'tenant', 'public_id', 'scan_count', 'last_scanned_at', 'qr_code_image', 'created_at', 'updated_at')


class PublicItemSerializer(serializers.ModelSerializer):
    """
    STRICT PRIVACY SERIALIZER: Exposes ONLY safe public attributes.
    Zero owner email, zero owner phone number, zero private tenant details.
    """
    class Meta:
        model = Item
        fields = (
            'public_id',
            'name',
            'category',
            'description',
            'photo',
            'is_lost',
            'lost_note',
            'reward_offered',
            'is_recovered',
            'scan_count',
            'created_at'
        )
