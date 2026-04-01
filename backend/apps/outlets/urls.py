"""URL routing for outlets app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OutletViewSet, OutletCategoryViewSet

app_name = 'outlets'

router = DefaultRouter()
router.register(r'categories', OutletCategoryViewSet, basename='category')
router.register(r'', OutletViewSet, basename='outlet')

urlpatterns = [
    path('', include(router.urls)),
]
