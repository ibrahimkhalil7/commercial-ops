"""Views for outlets app."""
from itertools import chain

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Outlet, OutletCategory
from .serializers import OutletSerializer, OutletCategorySerializer
from apps.visits.models import Visit
from apps.maintenance.models import FieldIncident, MaintenanceTicket
from apps.notices.models import Notice
from apps.outlets.models import LegacyNotice


class IsAdminOrFieldAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (
            user.is_superuser or user.role in ['admin', 'manager', 'field_agent']
        ))


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_superuser or user.role in ['admin', 'manager']))


class OutletViewSet(viewsets.ModelViewSet):
    """API endpoint for outlet management."""

    queryset = Outlet.objects.all().select_related('category')
    serializer_class = OutletSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdminOrFieldAgent()]
        return [IsAdminUserRole()]

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """Unified operational timeline per outlet."""
        outlet = self.get_object()
        event_type_filter = request.query_params.get('type')
        try:
            page = max(int(request.query_params.get('page', 1)), 1)
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = min(max(int(request.query_params.get('page_size', 20)), 1), 100)
        except (TypeError, ValueError):
            page_size = 20

        visits = Visit.objects.filter(outlet=outlet).values(
            'id', 'status', 'check_in_time', 'check_out_time', 'created_at'
        )
        incidents = FieldIncident.objects.filter(outlet=outlet).values(
            'id', 'status', 'title', 'severity', 'created_at'
        )
        tickets = MaintenanceTicket.objects.filter(outlet=outlet).values(
            'id', 'ticket_number', 'status', 'priority', 'created_at'
        )
        notices = Notice.objects.filter(outlet=outlet).values(
            'id', 'notice_type', 'priority', 'issued_at'
        )
        legacy_notices = LegacyNotice.objects.filter(outlet=outlet).values(
            'id', 'notice_type', 'issued_date', 'created_at'
        )

        items = []
        items.extend([{
            'type': 'visit',
            'event_at': item.get('check_in_time') or item.get('check_out_time') or item.get('created_at'),
            'data': item,
        } for item in visits])
        items.extend([{
            'type': 'incident',
            'event_at': item.get('created_at'),
            'data': item,
        } for item in incidents])
        items.extend([{
            'type': 'ticket',
            'event_at': item.get('created_at'),
            'data': item,
        } for item in tickets])
        items.extend([{
            'type': 'notice',
            'event_at': item.get('issued_at'),
            'data': item,
        } for item in notices])
        items.extend([{
            'type': 'legacy_notice',
            'event_at': item.get('created_at'),
            'data': item,
        } for item in legacy_notices])

        items = [item for item in items if item['event_at']]
        if event_type_filter:
            items = [item for item in items if item['type'] == event_type_filter]
        items.sort(key=lambda x: x['event_at'], reverse=True)
        total_count = len(items)
        start = (page - 1) * page_size
        end = start + page_size
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'results': items[start:end],
        })


class OutletCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only category endpoint for authenticated internal roles."""

    queryset = OutletCategory.objects.filter(is_active=True)
    serializer_class = OutletCategorySerializer
    permission_classes = [IsAdminOrFieldAgent]
