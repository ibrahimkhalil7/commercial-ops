"""Views for field execution workflows: shift, visit and GPS."""
import math

from django.utils import timezone
from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.reporting.utils import log_audit_event
from .models import Shift, Visit, GPSLog
from .serializers import ShiftSerializer, VisitSerializer, GPSLogSerializer


class IsAdminOrFieldAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_superuser or request.user.role in ['admin', 'manager', 'field_agent']
        ))


class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all().select_related('agent', 'daily_route')
    serializer_class = ShiftSerializer
    permission_classes = [IsAdminOrFieldAgent]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.role in ['admin', 'manager']:
            return qs
        return qs.filter(agent=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'field_agent':
            shift = serializer.save(agent=user)
            log_audit_event(
                user=user,
                action='create',
                obj=shift,
                description='Shift created',
                request=self.request,
            )
            return
        shift = serializer.save()
        log_audit_event(user=user, action='create', obj=shift, description='Shift created', request=self.request)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        shift = self.get_object()
        if shift.status == 'active':
            return Response({'detail': 'Shift already active.'}, status=status.HTTP_400_BAD_REQUEST)
        if shift.status == 'completed':
            return Response({'detail': 'Completed shift cannot be started.'}, status=status.HTTP_400_BAD_REQUEST)
        shift.status = 'active'
        shift.start_time = timezone.now()
        shift.save(update_fields=['status', 'start_time'])
        log_audit_event(user=request.user, action='start_shift', obj=shift, description='Shift started', request=self.request)
        return Response(self.get_serializer(shift).data)

    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        shift = self.get_object()
        if shift.status != 'active':
            return Response({'detail': 'Only active shifts can be ended.'}, status=status.HTTP_400_BAD_REQUEST)
        shift.status = 'completed'
        shift.end_time = timezone.now()
        shift.save(update_fields=['status', 'end_time'])
        log_audit_event(user=request.user, action='end_shift', obj=shift, description='Shift ended', request=self.request)
        return Response(self.get_serializer(shift).data)


class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all().select_related('daily_route', 'outlet', 'agent')
    serializer_class = VisitSerializer
    permission_classes = [IsAdminOrFieldAgent]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.role in ['admin', 'manager']:
            return qs
        return qs.filter(agent=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'field_agent':
            visit = serializer.save(agent=user)
            log_audit_event(user=user, action='create', obj=visit, description='Visit created', request=self.request)
            return
        visit = serializer.save()
        log_audit_event(user=user, action='create', obj=visit, description='Visit created', request=self.request)

    def _calculate_distance_meters(self, lat1, lon1, lat2, lon2):
        """Haversine distance in meters."""
        r = 6371000  # Earth radius (m)
        phi1 = math.radians(float(lat1))
        phi2 = math.radians(float(lat2))
        d_phi = math.radians(float(lat2) - float(lat1))
        d_lambda = math.radians(float(lon2) - float(lon1))
        a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return r * c

    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        visit = self.get_object()
        if visit.status in ['checked_in', 'checked_out']:
            return Response({'detail': 'Visit already checked in/out.'}, status=status.HTTP_400_BAD_REQUEST)

        lat = request.data.get('latitude')
        lon = request.data.get('longitude')
        accuracy = request.data.get('accuracy')
        if lat is None or lon is None:
            return Response({'detail': 'latitude and longitude are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if accuracy is None:
            return Response({'detail': 'accuracy is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lat = float(lat)
            lon = float(lon)
            accuracy = float(accuracy)
        except (TypeError, ValueError):
            return Response({'detail': 'latitude, longitude and accuracy must be numeric.'}, status=status.HTTP_400_BAD_REQUEST)

        visit.check_in_time = timezone.now()
        visit.check_in_latitude = lat
        visit.check_in_longitude = lon
        visit.check_in_accuracy = accuracy
        visit.notes = request.data.get('notes', visit.notes)
        visit.status = 'checked_in'
        distance = self._calculate_distance_meters(lat, lon, visit.outlet.latitude, visit.outlet.longitude)
        visit.within_proximity = distance <= 100
        visit.save()
        log_audit_event(user=request.user, action='check_in', obj=visit, description='Visit checked in', request=self.request)
        return Response(self.get_serializer(visit).data)

    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        visit = self.get_object()
        if visit.status != 'checked_in':
            return Response({'detail': 'Visit must be checked in before check out.'}, status=status.HTTP_400_BAD_REQUEST)

        lat = request.data.get('latitude')
        lon = request.data.get('longitude')
        if lat is None or lon is None:
            return Response({'detail': 'latitude and longitude are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            lat = float(lat)
            lon = float(lon)
        except (TypeError, ValueError):
            return Response({'detail': 'latitude and longitude must be numeric.'}, status=status.HTTP_400_BAD_REQUEST)

        visit.check_out_time = timezone.now()
        visit.check_out_latitude = lat
        visit.check_out_longitude = lon
        visit.notes = request.data.get('notes', visit.notes)
        visit.status = 'checked_out'
        visit.save()

        daily_route = visit.daily_route
        if daily_route:
            daily_route.completed_stops = Visit.objects.filter(daily_route=daily_route, status='checked_out').count()
            daily_route.skipped_stops = Visit.objects.filter(daily_route=daily_route, status='skipped').count()
            daily_route.save(update_fields=['completed_stops', 'skipped_stops'])

        log_audit_event(user=request.user, action='check_out', obj=visit, description='Visit checked out', request=self.request)
        return Response(self.get_serializer(visit).data)

    @action(detail=True, methods=['post'])
    def skip(self, request, pk=None):
        visit = self.get_object()
        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({'detail': 'Skip reason is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if visit.status == 'checked_out':
            return Response({'detail': 'Completed visit cannot be skipped.'}, status=status.HTTP_400_BAD_REQUEST)

        visit.status = 'skipped'
        visit.notes = reason
        visit.save(update_fields=['status', 'notes', 'updated_at'])

        daily_route = visit.daily_route
        if daily_route:
            daily_route.skipped_stops = Visit.objects.filter(daily_route=daily_route, status='skipped').count()
            daily_route.save(update_fields=['skipped_stops'])

        log_audit_event(user=request.user, action='update', obj=visit, description=f'Visit skipped: {reason}', request=self.request)
        return Response(self.get_serializer(visit).data)


class GPSLogViewSet(viewsets.ModelViewSet):
    queryset = GPSLog.objects.all().select_related('agent', 'shift')
    serializer_class = GPSLogSerializer
    permission_classes = [IsAdminOrFieldAgent]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.role in ['admin', 'manager']:
            return qs
        return qs.filter(agent=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'field_agent':
            gps_log = serializer.save(agent=user)
            log_audit_event(user=user, action='update', obj=gps_log, description='GPS log captured', request=self.request)
            return
        gps_log = serializer.save()
        log_audit_event(user=user, action='update', obj=gps_log, description='GPS log captured', request=self.request)
