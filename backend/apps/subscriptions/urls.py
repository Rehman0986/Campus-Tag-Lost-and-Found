from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanViewSet, TenantSubscriptionView

router = DefaultRouter()
router.register(r'plans', PlanViewSet, basename='plans')

urlpatterns = [
    path('current/', TenantSubscriptionView.as_view(), name='tenant-subscription'),
    path('', include(router.urls)),
]
