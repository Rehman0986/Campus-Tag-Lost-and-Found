from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import CustomerProfile
from .serializers import CustomerProfileSerializer


class IsCustomerOrSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class CustomerProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin:
            return CustomerProfile.objects.all()
        return CustomerProfile.objects.filter(organization=user.organization)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        profile = get_object_or_404(CustomerProfile, user=request.user)
        return Response(self.get_serializer(profile).data)
