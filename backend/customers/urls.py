from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'profiles', views.CustomerProfileViewSet, basename='customerprofile')
router.register(r'me', views.CustomerProfileViewSet, basename='customerprofile-me')


urlpatterns = [
    path('', include(router.urls)),
]
