"""Serializers for users app."""
from rest_framework import serializers
from .models import User, Team


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone',
            'role', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'updated_at'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'updated_at', 'is_superuser']


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model."""

    manager_details = UserSerializer(source='manager', read_only=True)
    members_details = UserSerializer(source='members', many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=[User.FIELD_AGENT, User.MANAGER, User.ADMIN]),
        many=True,
        write_only=True,
        required=False,
        source='members'
    )

    class Meta:
        model = Team
        fields = [
            'id', 'name', 'manager', 'manager_details',
            'members_details', 'member_ids', 'description', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
