"""URL routing for visits app."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ShiftViewSet, VisitViewSet, GPSLogViewSet

app_name = 'visits'

router = DefaultRouter()
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'visits', VisitViewSet, basename='visit')
router.register(r'gps-logs', GPSLogViewSet, basename='gps-log')

urlpatterns = [
    path('', include(router.urls)),
]
