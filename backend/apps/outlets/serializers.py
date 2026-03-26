"""
Serializers for outlets app.
Handles serialization of outlet data for API endpoints.
"""
from rest_framework import serializers
from .models import Outlet, OutletCategory


class OutletCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OutletCategory
        fields = ['id', 'name', 'description']


class OutletSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Outlet
        fields = [
            'id',
            'name',
            'category',
            'category_name',
            'address',
            'latitude',
            'longitude',
            'contact_person',
            'email',
            'phone',
            'operating_notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_category(self, value):
        """Ensure category exists."""
        if not value:
            raise serializers.ValidationError("Category is required.")
        return value
