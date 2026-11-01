from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'plans', views.PlanViewSet, basename='plan')
router.register(r'subscriptions', views.SubscriptionViewSet, basename='subscription')
router.register(r'payments', views.PaymentTransactionViewSet, basename='payment')


urlpatterns = [
    path('', include(router.urls)),
    path('create-checkout-session/', views.create_checkout_session, name='create-checkout-session'),
    path('webhook/', views.stripe_webhook, name='stripe-webhook'),
    path('success/', views.payment_success, name='payment-success'),
    path('cancel/', views.payment_cancel, name='payment-cancel'),
]
