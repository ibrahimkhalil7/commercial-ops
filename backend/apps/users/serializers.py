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
        read_only_fields = ['id', 'date_joined', 'last_login', 'updated_at']


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model."""
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'leader', 'members', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
