"""URL routing for notices app."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import NoticeViewSet

app_name = 'notices'

router = DefaultRouter()
router.register(r'', NoticeViewSet, basename='notice')

urlpatterns = [
    path('', include(router.urls)),
]
