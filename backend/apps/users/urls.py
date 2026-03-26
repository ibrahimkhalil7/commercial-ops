"""URL routing for users app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, TeamViewSet

app_name = 'users'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')
router.register(r'teams', TeamViewSet, basename='team')

urlpatterns = [
    path('', include(router.urls)),
]
