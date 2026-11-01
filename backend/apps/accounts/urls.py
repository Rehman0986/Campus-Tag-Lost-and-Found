from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, CurrentUserView, AdminUserViewSet, TenantViewSet, SiteSettingsViewSet

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'tenants', TenantViewSet, basename='tenants')
router.register(r'settings', SiteSettingsViewSet, basename='settings')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('', include(router.urls)),
]
