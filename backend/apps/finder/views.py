from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.items.models import Item
from apps.items.serializers import PublicItemSerializer
from .models import FinderReport, FinderMessage
from .serializers import FinderReportSerializer, FinderMessageSerializer

class PublicFinderItemView(views.APIView):
    """
    Public rate-limited endpoint accessed when an anonymous finder scans a QR code:
    GET /api/v1/f/{public_id}/
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request, public_id):
        item = get_object_or_404(Item, public_id__iexact=public_id)
        
        # Increment scan count and log timestamp
        item.scan_count += 1
        item.last_scanned_at = timezone.now()
        item.save(update_fields=['scan_count', 'last_scanned_at'])

        serializer = PublicItemSerializer(item, context={'request': request})
        return Response(serializer.data)


class PublicSubmitReportView(views.APIView):
    """
    Allows anonymous finder to submit safe report + coordinates + photo evidence.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, public_id):
        item = get_object_or_404(Item, public_id__iexact=public_id)
        
        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        address = request.data.get('address', '')
        contact_note = request.data.get('finder_contact_note', '')
        photo = request.FILES.get('evidence_photo')

        report = FinderReport.objects.create(
            item=item,
            message=message_text,
            finder_contact_note=contact_note,
            evidence_photo=photo,
            latitude=float(lat) if lat else None,
            longitude=float(lng) if lng else None,
            address=address,
            ip_address=request.META.get('REMOTE_ADDR')
        )

        # Update item last known location if coordinates provided
        if lat and lng:
            item.last_latitude = float(lat)
            item.last_longitude = float(lng)
            item.last_address = address
            item.save(update_fields=['last_latitude', 'last_longitude', 'last_address'])

        # Create initial relay message
        FinderMessage.objects.create(
            item=item,
            session_id=request.data.get('session_id', 'anon_session'),
            sender='finder',
            text=f"Report: {message_text}"
        )

        # Trigger asynchronous email task if tenant has a contact email
        try:
            from .tasks import send_finder_report_notification_email
            owner_email = item.tenant.contact_email
            if owner_email:
                send_finder_report_notification_email.delay(
                    item_id=str(item.id),
                    report_id=str(report.id),
                    recipient_email=owner_email,
                    item_name=item.name,
                    message=message_text,
                    address=address
                )
        except Exception:
            pass

        return Response(FinderReportSerializer(report).data, status=status.HTTP_201_CREATED)


class PublicRelayMessagesView(views.APIView):
    """
    Two-way anonymous relay messages between finder and owner.
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request, public_id):
        item = get_object_or_404(Item, public_id__iexact=public_id)
        messages = FinderMessage.objects.filter(item=item).order_by('created_at')
        return Response(FinderMessageSerializer(messages, many=True).data)

    def post(self, request, public_id):
        item = get_object_or_404(Item, public_id__iexact=public_id)
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)

        # If user is authenticated and matches tenant owner -> sender is 'owner'
        # Otherwise anonymous finder -> sender is 'finder'
        sender = 'finder'
        if request.user.is_authenticated and request.user.tenant == item.tenant:
            sender = 'owner'

        msg = FinderMessage.objects.create(
            item=item,
            session_id=request.data.get('session_id', 'anon_session'),
            sender=sender,
            text=text
        )
        return Response(FinderMessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class AdminReportListView(generics.ListAPIView):
    serializer_class = FinderReportSerializer
    permission_classes = (permissions.IsAuthenticated,)
    def get_queryset(self):
        if self.request.user.is_superuser or getattr(self.request.user,'role',None)=='super_admin':
            return FinderReport.objects.all().select_related('item').order_by('-created_at')
        return FinderReport.objects.filter(item__tenant=self.request.user.tenant).order_by('-created_at')

