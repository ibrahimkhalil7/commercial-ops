"""URL routing for reporting app."""
from django.urls import path

from .views import AdminKPIView

app_name = 'reporting'

urlpatterns = [
    path('admin-kpis/', AdminKPIView.as_view(), name='admin-kpis'),
]
