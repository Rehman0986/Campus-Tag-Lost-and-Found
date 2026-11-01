from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from items.models import Item
from .models import FinderReport
from .serializers import FinderReportSerializer, FinderReportCreateSerializer


class FinderReportViewSet(viewsets.ModelViewSet):
    serializer_class = FinderReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_read', 'item']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin:
            return FinderReport.objects.all()
        return FinderReport.objects.filter(item__organization=user.organization)

    def get_serializer_class(self):
        if self.action == 'create':
            return FinderReportCreateSerializer
        return FinderReportSerializer

    def perform_create(self, serializer):
        user = self.request.user
        item = serializer.validated_data.get('item')
        if not user.is_super_admin and item.organization_id != user.organization_id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only report on your own organization items.')
        serializer.save()

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        report = self.get_object()
        report.is_read = True
        report.save()
        return Response({'is_read': True})


@api_view(['GET'])
@permission_classes([AllowAny])
def public_item_page(request, public_item_id):
    """Privacy-first public finder page. No login required.

    Shows only safe public info: name, photo, short description, category, lost status.
    Finder never sees owner private data.
    """
    item = get_object_or_404(Item, public_item_id=public_item_id)

    data = {
        'public_item_id': item.public_item_id,
        'name': item.name,
        'description': item.description,
        'category': item.category.name if item.category else None,
        'status': item.status,
        'is_lost_mode': item.is_lost_mode,
        'last_reported_location': item.last_reported_location,
        'last_reported_at': item.last_reported_at,
        'last_reported_source': item.last_reported_source,
        'photos': [
            {
                'id': str(p.id),
                'image': request.build_absolute_uri(p.image.url) if p.image else None,
                'caption': p.caption,
                'is_primary': p.is_primary,
            }
            for p in item.photos.all()
        ],
    }
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_finder_report(request, public_item_id):
    """Finder submits a message + optional location + optional photo evidence."""
    item = get_object_or_404(Item, public_item_id=public_item_id)

    message = request.data.get('message', '')
    finder_name = request.data.get('finder_name', '')
    finder_contact = request.data.get('finder_contact', '')
    location = request.data.get('location', '')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')

    report = FinderReport.objects.create(
        item=item,
        message=message,
        finder_name=finder_name,
        finder_contact=finder_contact,
        location=location,
        latitude=latitude,
        longitude=longitude,
    )

    photo = request.FILES.get('photo_evidence')
    if photo:
        report.photo_evidence.save(photo.name, photo)
        report.save()

    return Response({'id': str(report.id), 'message': 'Report submitted successfully.'}, status=201)
