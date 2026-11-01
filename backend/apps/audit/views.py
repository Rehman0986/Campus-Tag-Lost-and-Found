from rest_framework import serializers, viewsets
from campus_tag.permissions import IsSuperAdminUser
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Super Admin only: immutable chronological security logs.
    """
    queryset = AuditLog.objects.all().order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = (IsSuperAdminUser,)
    filterset_fields = ('target_type', 'action')
    search_fields = ('actor_email', 'details', 'target_id')
