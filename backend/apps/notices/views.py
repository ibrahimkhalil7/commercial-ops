"""Views for violation/notice workflow."""
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.reporting.utils import log_audit_event
from .models import Notice
from .serializers import NoticeSerializer


class IsAdminOrFieldAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_superuser or request.user.role in ['admin', 'field_agent']
        ))


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().select_related('outlet', 'visit', 'created_by')
    serializer_class = NoticeSerializer
    permission_classes = [IsAdminOrFieldAgent]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return qs
        return qs.filter(created_by=user)

    def perform_create(self, serializer):
        notice = serializer.save(created_by=self.request.user)
        notice.send_notification()
        log_audit_event(
            user=self.request.user,
            action='send_notice',
            obj=notice,
            description=f"Notice issued for outlet {notice.outlet.name}",
            request=self.request,
        )

    @action(detail=True, methods=['post'])
    def resend(self, request, pk=None):
        notice = self.get_object()
        sent = notice.send_notification()
        if not sent:
            return Response({'detail': 'Notice notification failed to send.'}, status=status.HTTP_400_BAD_REQUEST)

        log_audit_event(
            user=request.user,
            action='send_notice',
            obj=notice,
            description=f"Notice resent for outlet {notice.outlet.name}",
            request=self.request,
        )
        return Response(self.get_serializer(notice).data)
