"""Serializers for compliance notices."""
from rest_framework import serializers

from .models import Notice


class NoticeSerializer(serializers.ModelSerializer):
    outlet_name = serializers.CharField(source='outlet.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Notice
        fields = [
            'id', 'outlet', 'outlet_name', 'notice_type', 'reason', 'priority',
            'amount', 'visit', 'created_by', 'created_by_name',
            'evidence_photo', 'attachment', 'send_status', 'sent_at',
            'sent_to_emails', 'send_error_message', 'issued_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'send_status', 'sent_at', 'sent_to_emails',
            'send_error_message', 'issued_at', 'updated_at'
        ]
