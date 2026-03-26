"""
Views for outlets app.
Provides API endpoints for outlet management.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Outlet, OutletCategory
from .serializers import OutletSerializer, OutletCategorySerializer


class OutletViewSet(viewsets.ModelViewSet):
    """
    API endpoint for outlet management.
    Allows anyone to create, view, and list outlets.
    """
    queryset = Outlet.objects.all()
    serializer_class = OutletSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """Allow anyone to create outlets via API."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        """List all outlets (public view)."""
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """Retrieve single outlet details."""
        return super().retrieve(request, *args, **kwargs)


class OutletCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for outlet categories.
    Read-only for public use.
    """
    queryset = OutletCategory.objects.filter(is_active=True)
    serializer_class = OutletCategorySerializer
    permission_classes = [permissions.AllowAny]
