from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'reports', views.FinderReportViewSet, basename='finderreport')


urlpatterns = [
    path('', include(router.urls)),
    path('public/<str:public_item_id>/', views.public_item_page, name='public-item-page'),
    path('public/<str:public_item_id>/report/', views.submit_finder_report, name='submit-finder-report'),
]
