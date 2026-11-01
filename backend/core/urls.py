from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'organizations', views.SuperAdminOrganizationViewSet, basename='superadmin-organization')
router.register(r'users', views.SuperAdminUserViewSet, basename='superadmin-user')
router.register(r'site-content', views.SuperAdminSiteContentViewSet, basename='superadmin-site-content')


urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.MeView.as_view(), name='me'),
    path('first-admin-check/', views.FirstAdminCheckView.as_view(), name='first-admin-check'),
    path('first-super-admin-register/', views.FirstSuperAdminRegisterView.as_view(), name='first-super-admin-register'),
    path('', include(router.urls)),
]
