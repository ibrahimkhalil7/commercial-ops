"""URL routing for maintenance app."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MaintenanceCategoryViewSet, MaintenanceTicketViewSet, FieldIncidentViewSet

app_name = 'maintenance'

router = DefaultRouter()
router.register(r'categories', MaintenanceCategoryViewSet, basename='maintenance-category')
router.register(r'incidents', FieldIncidentViewSet, basename='field-incident')
router.register(r'tickets', MaintenanceTicketViewSet, basename='maintenance-ticket')

urlpatterns = [
    path('', include(router.urls)),
]
