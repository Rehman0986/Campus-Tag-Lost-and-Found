from rest_framework import serializers
from .models import Category, Item, ItemPhoto


class ItemPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemPhoto
        fields = ['id', 'image', 'caption', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'created_at']


class ItemSerializer(serializers.ModelSerializer):
    photos = ItemPhotoSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = Item
        fields = [
            'id', 'public_item_id', 'organization', 'organization_name', 'category', 'category_name',
            'name', 'description', 'status', 'is_lost_mode', 'last_reported_location',
            'last_reported_latitude', 'last_reported_longitude', 'last_reported_at',
            'last_reported_source', 'photos', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'public_item_id', 'created_at', 'updated_at']

    def validate_public_item_id(self, value):
        # public_item_id is auto-generated, read-only effectively
        return value
