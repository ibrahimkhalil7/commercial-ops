"""Serializers for admin KPI and outlet timeline reporting."""
from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'action', 'description', 'user_name', 'timestamp']

    def get_user_name(self, obj):
        if not obj.user:
            return 'System'
        return obj.user.get_full_name() or obj.user.email
