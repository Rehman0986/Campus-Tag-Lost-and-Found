from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.utils import timezone

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, OrganizationSerializer, SiteContentSerializer
from core.models import Organization, SiteContent

User = get_user_model()


# === Auth Views ===

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class FirstAdminCheckView(APIView):
    """Check if any super admin exists. Used for first-run setup flow."""
    permission_classes = [AllowAny]

    def get(self, request):
        exists = User.objects.filter(role=User.ROLE_SUPER_ADMIN, is_active=True).exists()
        return Response({'super_admin_exists': exists})


class FirstSuperAdminRegisterView(APIView):
    """First-run registration for the platform Super Admin.
    Only works when no super admin exists yet."""
    permission_classes = [AllowAny]

    def post(self, request):
        if User.objects.filter(role=User.ROLE_SUPER_ADMIN, is_active=True).exists():
            return Response({'error': 'Super admin already exists.'}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=User.ROLE_SUPER_ADMIN,
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )

        # Create a default organization for the platform
        org, _ = Organization.objects.get_or_create(
            slug='platform',
            defaults={
                'name': 'Platform',
                'contact_email': email,
                'is_active': True,
            }
        )
        user.organization = org
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


# === Super Admin Views ===

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_super_admin


class SuperAdminOrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    queryset = Organization.objects.all()
    filterset_fields = ['is_active']
    search_fields = ['name', 'slug']
    ordering = ['name']

    def get_queryset(self):
        return Organization.objects.all()


class SuperAdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    queryset = User.objects.all()
    filterset_fields = ['role', 'is_active', 'organization']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']

    def get_queryset(self):
        return User.objects.all()

    @action(detail=True, methods=['post'], url_path='suspend')
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'is_active': False})

    @action(detail=True, methods=['post'], url_path='reactivate')
    def reactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'is_active': True})


class SuperAdminSiteContentViewSet(viewsets.ModelViewSet):
    """Super Admin CRUD for dynamic website content."""
    serializer_class = SiteContentSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    queryset = SiteContent.objects.all()
    filterset_fields = ['is_public', 'value_type']
    search_fields = ['key', 'value']
    ordering = ['key']

    def get_queryset(self):
        return SiteContent.objects.all()

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
