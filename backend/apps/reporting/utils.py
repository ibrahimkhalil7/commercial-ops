"""Utility helpers for writing operational audit events."""
from django.contrib.contenttypes.models import ContentType

from .models import AuditLog


def log_audit_event(*, user=None, action, description='', obj=None, old_values=None, new_values=None, request=None):
    """Best-effort audit log writer for critical operational actions."""

    content_type = None
    object_id = ''
    if obj is not None:
        content_type = ContentType.objects.get_for_model(obj.__class__)
        object_id = str(obj.pk)

    AuditLog.objects.create(
        user=user,
        action=action,
        content_type=content_type,
        object_id=object_id,
        description=description,
        old_values=old_values or {},
        new_values=new_values or {},
        ip_address=(request.META.get('REMOTE_ADDR') if request else None),
        user_agent=(request.META.get('HTTP_USER_AGENT', '')[:500] if request else ''),
    )
