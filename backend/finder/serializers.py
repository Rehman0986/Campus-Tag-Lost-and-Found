from rest_framework import serializers
from .models import FinderReport
from items.models import Item


class FinderReportSerializer(serializers.ModelSerializer):
    item_public_id = serializers.CharField(source='item.public_item_id', read_only=True)

    class Meta:
        model = FinderReport
        fields = [
            'id', 'item', 'item_public_id', 'message', 'finder_name', 'finder_contact',
            'location', 'latitude', 'longitude', 'photo_evidence', 'created_at', 'is_read',
        ]
        read_only_fields = ['id', 'created_at', 'is_read']


class FinderReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinderReport
        fields = [
            'item', 'message', 'finder_name', 'finder_contact', 'location', 'latitude', 'longitude', 'photo_evidence',
        ]
