import uuid
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone

from .models import Category, Item, ItemPhoto
from .serializers import CategorySerializer, ItemSerializer, ItemPhotoSerializer


class IsSuperAdminOrCustomerOwner(permissions.BasePermission):
    """Super admin can access all; customer only their own organization's items."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_super_admin:
            return True
        return obj.organization_id == user.organization_id


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin:
            return Category.objects.all()
        # Customers see active categories (shared catalog)
        return Category.objects.filter(is_active=True)


class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrCustomerOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_lost_mode', 'category', 'organization']
    search_fields = ['name', 'description', 'public_item_id']
    ordering_fields = ['created_at', 'name', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = Item.objects.all().prefetch_related('photos', 'category')
        if user.is_super_admin:
            return qs
        return qs.filter(organization=user.organization)

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_super_admin:
            # Super admin must specify organization
            org = serializer.validated_data.get('organization')
            if not org:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'organization': 'Super admin must specify an organization.'})
            serializer.save()
        else:
            # Customer creates under their own organization
            if not user.organization:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'organization': 'User has no organization.'})
            serializer.save(organization=user.organization)

    @action(detail=True, methods=['post'], url_path='toggle-lost-mode')
    def toggle_lost_mode(self, request, pk=None):
        item = self.get_object()
        item.is_lost_mode = not item.is_lost_mode
        if item.is_lost_mode:
            item.status = Item.STATUS_LOST
        item.save()
        return Response({'is_lost_mode': item.is_lost_mode, 'status': item.status})

    @action(detail=True, methods=['post'], url_path='mark-recovered')
    def mark_recovered(self, request, pk=None):
        item = self.get_object()
        item.status = Item.STATUS_RECOVERED
        item.is_lost_mode = False
        item.save()
        return Response({'status': item.status})
