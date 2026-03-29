"""Serializers for route planning and daily route execution."""
from rest_framework import serializers
from .models import RouteTemplate, RouteStop, DailyRoute


class RouteStopSerializer(serializers.ModelSerializer):
    outlet_name = serializers.CharField(source='outlet.name', read_only=True)

    class Meta:
        model = RouteStop
        fields = ['id', 'route_template', 'outlet', 'outlet_name', 'stop_order', 'notes', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class RouteTemplateSerializer(serializers.ModelSerializer):
    assigned_agent_name = serializers.CharField(source='assigned_agent.get_full_name', read_only=True)
    stops = RouteStopSerializer(many=True, read_only=True)

    class Meta:
        model = RouteTemplate
        fields = [
            'id', 'name', 'zone', 'assigned_agent', 'assigned_agent_name',
            'recurring_days', 'is_active', 'stops', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DailyRouteSerializer(serializers.ModelSerializer):
    route_template_name = serializers.CharField(source='route_template.name', read_only=True)
    assigned_agent_name = serializers.CharField(source='assigned_agent.get_full_name', read_only=True)

    class Meta:
        model = DailyRoute
        fields = [
            'id', 'route_template', 'route_template_name', 'route_date',
            'assigned_agent', 'assigned_agent_name', 'status',
            'planned_stops', 'completed_stops', 'skipped_stops',
            'started_at', 'completed_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
