"""Admin KPI and reporting endpoints."""
from rest_framework import permissions, views
from rest_framework.response import Response

from apps.maintenance.models import MaintenanceTicket
from apps.notices.models import Notice
from apps.routes.models import DailyRoute
from apps.visits.models import Visit, Shift
from .models import AuditLog
from .serializers import AuditLogSerializer


class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_superuser or request.user.role in ['admin', 'manager']
        ))


class AdminKPIView(views.APIView):
    permission_classes = [IsAdminOrManager]

    def get(self, request):
        total_routes = DailyRoute.objects.count()
        completed_routes = DailyRoute.objects.filter(status='completed').count()
        active_shifts = Shift.objects.filter(status='active').count()
        visits_completed = Visit.objects.filter(status='checked_out').count()
        visits_skipped = Visit.objects.filter(status='skipped').count()
        open_tickets = MaintenanceTicket.objects.filter(status__in=['open', 'acknowledged', 'in_progress']).count()
        notices_issued = Notice.objects.count()

        recent_logs = AuditLog.objects.select_related('user').order_by('-timestamp')[:20]

        return Response({
            'kpis': {
                'total_routes': total_routes,
                'completed_routes': completed_routes,
                'active_shifts': active_shifts,
                'visits_completed': visits_completed,
                'visits_skipped': visits_skipped,
                'open_tickets': open_tickets,
                'notices_issued': notices_issued,
            },
            'recent_activity': AuditLogSerializer(recent_logs, many=True).data,
        })
