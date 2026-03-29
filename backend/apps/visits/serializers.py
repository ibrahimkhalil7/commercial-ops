"""Serializers for shift, visit and GPS execution workflows."""
from rest_framework import serializers
from .models import Shift, Visit, GPSLog


class ShiftSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.get_full_name', read_only=True)

    class Meta:
        model = Shift
        fields = [
            'id', 'agent', 'agent_name', 'daily_route', 'status',
            'start_time', 'end_time', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class VisitSerializer(serializers.ModelSerializer):
    outlet_name = serializers.CharField(source='outlet.name', read_only=True)

    class Meta:
        model = Visit
        fields = [
            'id', 'daily_route', 'outlet', 'outlet_name', 'agent', 'status',
            'check_in_time', 'check_in_latitude', 'check_in_longitude', 'check_in_accuracy',
            'check_out_time', 'check_out_latitude', 'check_out_longitude',
            'notes', 'within_proximity', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GPSLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = GPSLog
        fields = [
            'id', 'agent', 'shift', 'latitude', 'longitude',
            'accuracy', 'altitude', 'timestamp', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
