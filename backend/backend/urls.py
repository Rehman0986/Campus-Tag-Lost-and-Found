"""campus_tag URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/', include('core.urls')),

    # Customers
    path('api/customers/', include('customers.urls')),

    # Items
    path('api/items/', include('items.urls')),

    # Subscriptions
    path('api/subscriptions/', include('subscriptions.urls')),

    # Finder (public)
    path('api/finder/', include('finder.urls')),

    # Notifications
    path('api/notifications/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
