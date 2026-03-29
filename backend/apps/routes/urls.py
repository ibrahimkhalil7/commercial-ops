"""URL routing for routes app."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import RouteTemplateViewSet, RouteStopViewSet, DailyRouteViewSet

app_name = 'routes'

router = DefaultRouter()
router.register(r'templates', RouteTemplateViewSet, basename='route-template')
router.register(r'stops', RouteStopViewSet, basename='route-stop')
router.register(r'daily', DailyRouteViewSet, basename='daily-route')

urlpatterns = [
    path('', include(router.urls)),
]
