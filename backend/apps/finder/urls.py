from django.urls import path
from .views import PublicFinderItemView, PublicSubmitReportView, PublicRelayMessagesView, AdminReportListView

urlpatterns = [
    path('reports/', AdminReportListView.as_view(), name='admin-reports'),
    path('<str:public_id>/', PublicFinderItemView.as_view(), name='public-finder-item'),
    path('<str:public_id>/report/', PublicSubmitReportView.as_view(), name='public-submit-report'),
    path('<str:public_id>/messages/', PublicRelayMessagesView.as_view(), name='public-relay-messages'),
]
