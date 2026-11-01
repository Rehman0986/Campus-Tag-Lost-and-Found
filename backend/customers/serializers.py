from rest_framework import serializers
from .models import CustomerProfile
from core.serializers import OrganizationSerializer


class CustomerProfileSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = CustomerProfile
        fields = ['id', 'organization', 'phone', 'address', 'created_at', 'updated_at']
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']
