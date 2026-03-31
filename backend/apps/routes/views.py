"""Views for route planning and daily route execution."""
from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.reporting.utils import log_audit_event
from .models import RouteTemplate, RouteStop, DailyRoute
from .serializers import RouteTemplateSerializer, RouteStopSerializer, DailyRouteSerializer


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_superuser or request.user.role == 'admin'
        ))


class IsAdminOrFieldAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_superuser or request.user.role in ['admin', 'manager', 'field_agent']
        ))


class RouteTemplateViewSet(viewsets.ModelViewSet):
    queryset = RouteTemplate.objects.all().select_related('assigned_agent')
    serializer_class = RouteTemplateSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdminOrFieldAgent()]
        return [IsAdminUserRole()]


class RouteStopViewSet(viewsets.ModelViewSet):
    queryset = RouteStop.objects.all().select_related('route_template', 'outlet')
    serializer_class = RouteStopSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdminOrFieldAgent()]
        return [IsAdminUserRole()]


class DailyRouteViewSet(viewsets.ModelViewSet):
    queryset = DailyRoute.objects.all().select_related('route_template', 'assigned_agent')
    serializer_class = DailyRouteSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'my_routes']:
            return [IsAdminOrFieldAgent()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.role in ['admin', 'manager']:
            return qs
        if user.role == 'field_agent':
            return qs.filter(assigned_agent=user)
        return qs.none()

    @action(detail=False, methods=['get'])
    def my_routes(self, request):
        qs = self.get_queryset().order_by('-route_date')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        daily_route = self.get_object()
        if daily_route.status == 'completed':
            return Response({'detail': 'Completed route cannot be restarted.'}, status=status.HTTP_400_BAD_REQUEST)
        daily_route.status = 'in_progress'
        if not daily_route.started_at:
            from django.utils import timezone
            daily_route.started_at = timezone.now()
        daily_route.save(update_fields=['status', 'started_at'])
        log_audit_event(user=request.user, action='update', obj=daily_route, description='Daily route started', request=self.request)
        return Response(self.get_serializer(daily_route).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        daily_route = self.get_object()
        from django.utils import timezone
        daily_route.status = 'completed'
        daily_route.completed_at = timezone.now()
        daily_route.save(update_fields=['status', 'completed_at'])
        log_audit_event(user=request.user, action='update', obj=daily_route, description='Daily route completed', request=self.request)
        return Response(self.get_serializer(daily_route).data)
