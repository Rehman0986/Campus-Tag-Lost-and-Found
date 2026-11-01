from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from campus_tag.permissions import IsSuperAdminUser
from .models import User, Tenant, SiteSettings
from .serializers import UserSerializer, RegisterSerializer, TenantSerializer, SiteSettingsSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Super Admin only: full oversight of all platform accounts.
    """
    queryset = User.objects.all().select_related('tenant').order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = (IsSuperAdminUser,)
    filterset_fields = ('role', 'status')
    search_fields = ('email', 'username', 'first_name', 'last_name')


class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all().order_by('-created_at')
    serializer_class = TenantSerializer
    permission_classes = (IsSuperAdminUser,)



class SiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = (IsSuperAdminUser,)

