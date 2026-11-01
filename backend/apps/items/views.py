from rest_framework import viewsets, permissions, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from campus_tag.permissions import IsSuperAdminUser
from .models import Item
from .serializers import ItemSerializer

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filterset_fields = ('category', 'is_lost', 'is_recovered')
    search_fields = ('name', 'public_id', 'serial_number')

    def get_queryset(self):
        user = self.request.user
        # Super Admins have global audit oversight
        if user.is_superuser or user.role == 'super_admin':
            return Item.objects.all().select_related('tenant').order_by('-created_at')
        
        # Strict Multi-Tenant Query Isolation: only objects of current tenant
        if not user.tenant:
            return Item.objects.none()
        return Item.objects.filter(tenant=user.tenant).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if not user.tenant:
            raise exceptions.PermissionDenied("You must belong to an active campus tenant workspace.")
        
        # Verify item quota
        current_count = Item.objects.filter(tenant=user.tenant).count()
        if current_count >= user.tenant.item_limit:
            raise exceptions.ValidationError(f"Item limit of {user.tenant.item_limit} reached. Upgrade plan to add more.")

        serializer.save(tenant=user.tenant)

    @action(detail=True, methods=['post'])
    def toggle_lost(self, request, pk=None):
        item = self.get_object()
        item.is_lost = not item.is_lost
        if item.is_lost:
            item.lost_date = timezone.now()
            item.lost_note = request.data.get('lost_note', '')
            item.is_recovered = False
        item.save()
        return Response(self.get_serializer(item).data)

    @action(detail=True, methods=['post'])
    def mark_recovered(self, request, pk=None):
        item = self.get_object()
        item.is_recovered = True
        item.is_lost = False
        item.recovered_date = timezone.now()
        item.save()
        return Response(self.get_serializer(item).data)
