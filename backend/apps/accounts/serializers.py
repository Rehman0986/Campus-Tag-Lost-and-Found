from rest_framework import serializers
from .models import User, Tenant, SiteSettings

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    tenant = TenantSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'status', 'tenant', 'created_at')
        read_only_fields = ('id', 'created_at')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    campus_name = serializers.CharField(write_only=True)
    org_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'campus_name', 'org_name')

    def create(self, validated_data):
        campus_name = validated_data.pop('campus_name')
        org_name = validated_data.pop('org_name')
        password = validated_data.pop('password')

        # Create isolated tenant workspace
        import uuid
        tenant = Tenant.objects.create(
            name=org_name,
            campus_name=campus_name,
            slug=f"org-{uuid.uuid4().hex[:8]}",
            contact_email=validated_data['email']
        )

        user = User.objects.create_user(
            role='customer',
            tenant=tenant,
            status='active',
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'

