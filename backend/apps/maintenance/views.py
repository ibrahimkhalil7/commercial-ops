"""Views for incident capture and maintenance ticket workflows."""
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.reporting.utils import log_audit_event
from .models import MaintenanceCategory, MaintenanceTicket, FieldIncident
from .serializers import (
    MaintenanceCategorySerializer,
    MaintenanceTicketSerializer,
    FieldIncidentSerializer,
)


class IsAdminOrFieldAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_superuser or request.user.role in ['admin', 'field_agent']
        ))


class MaintenanceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MaintenanceCategory.objects.filter(is_active=True)
    serializer_class = MaintenanceCategorySerializer
    permission_classes = [IsAdminOrFieldAgent]


class FieldIncidentViewSet(viewsets.ModelViewSet):
    queryset = FieldIncident.objects.all().select_related('outlet', 'visit', 'reported_by')
    serializer_class = FieldIncidentSerializer
    permission_classes = [IsAdminOrFieldAgent]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return qs
        return qs.filter(reported_by=user)

    def perform_create(self, serializer):
        incident = serializer.save(reported_by=self.request.user)
        log_audit_event(
            user=self.request.user,
            action='create',
            obj=incident,
            description=f"Field incident created: {incident.title}",
            request=self.request,
        )

    @action(detail=True, methods=['post'])
    def create_ticket(self, request, pk=None):
        incident = self.get_object()
        if incident.status == 'converted_to_ticket':
            return Response({'detail': 'Incident already converted to ticket.'}, status=status.HTTP_400_BAD_REQUEST)

        category_id = request.data.get('category')
        if not category_id:
            return Response({'detail': 'category is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            category = MaintenanceCategory.objects.get(id=category_id, is_active=True)
        except MaintenanceCategory.DoesNotExist:
            return Response({'detail': 'Invalid maintenance category.'}, status=status.HTTP_400_BAD_REQUEST)

        ticket = MaintenanceTicket.objects.create(
            category=category,
            outlet=incident.outlet,
            location_latitude=incident.outlet.latitude,
            location_longitude=incident.outlet.longitude,
            location_description=f"Outlet: {incident.outlet.name}",
            description=f"{incident.title}\n\n{incident.description}",
            priority=incident.severity if incident.severity in ['low', 'medium', 'high', 'critical'] else 'medium',
            reported_by=incident.reported_by,
            status='open',
        )

        incident.status = 'converted_to_ticket'
        incident.save(update_fields=['status', 'updated_at'])

        log_audit_event(
            user=request.user,
            action='create_ticket',
            obj=ticket,
            description=f"Maintenance ticket {ticket.ticket_number} created from incident {incident.id}",
            request=self.request,
        )

        return Response(MaintenanceTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)


class MaintenanceTicketViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceTicket.objects.all().select_related('category', 'outlet', 'reported_by')
    serializer_class = MaintenanceTicketSerializer
    permission_classes = [IsAdminOrFieldAgent]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return qs
        return qs.filter(reported_by=user)

    def perform_create(self, serializer):
        ticket = serializer.save(reported_by=self.request.user)
        log_audit_event(
            user=self.request.user,
            action='create_ticket',
            obj=ticket,
            description=f"Maintenance ticket created: {ticket.ticket_number}",
            request=self.request,
        )

    @action(detail=True, methods=['post'])
    def set_status(self, request, pk=None):
        ticket = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(MaintenanceTicket.STATUS_CHOICES):
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = ticket.status
        ticket.status = new_status
        ticket.completion_notes = request.data.get('completion_notes', ticket.completion_notes)
        if new_status == 'completed':
            from django.utils import timezone
            ticket.completed_at = timezone.now()
        ticket.save()

        log_audit_event(
            user=request.user,
            action='update',
            obj=ticket,
            description=f"Ticket {ticket.ticket_number} status changed {old_status} -> {new_status}",
            old_values={'status': old_status},
            new_values={'status': new_status},
            request=self.request,
        )

        return Response(self.get_serializer(ticket).data)
