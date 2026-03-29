"""Serializers for incidents and maintenance tickets."""
from rest_framework import serializers

from .models import MaintenanceCategory, MaintenanceTicket, FieldIncident


class MaintenanceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceCategory
        fields = ['id', 'name', 'description', 'recipient_team', 'is_active']


class FieldIncidentSerializer(serializers.ModelSerializer):
    outlet_name = serializers.CharField(source='outlet.name', read_only=True)

    class Meta:
        model = FieldIncident
        fields = [
            'id', 'outlet', 'outlet_name', 'visit', 'reported_by', 'title',
            'description', 'severity', 'status', 'occurred_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MaintenanceTicketSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    outlet_name = serializers.CharField(source='outlet.name', read_only=True)

    class Meta:
        model = MaintenanceTicket
        fields = [
            'id', 'ticket_number', 'category', 'category_name', 'outlet', 'outlet_name',
            'location_latitude', 'location_longitude', 'location_description',
            'description', 'priority', 'status', 'reported_by',
            'evidence_photo', 'additional_attachments', 'assigned_recipient',
            'sent_to_recipients', 'completed_at', 'completion_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ticket_number', 'sent_to_recipients', 'created_at', 'updated_at']
