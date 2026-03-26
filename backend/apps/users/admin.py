from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import User, Team


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Admin interface for User model."""
    list_display = ('email', 'get_full_name', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    readonly_fields = ('id', 'date_joined', 'updated_at', 'last_login')
    
    fieldsets = (
        (_('Personal Info'), {
            'fields': ('id', 'email', 'first_name', 'last_name', 'phone')
        }),
        (_('Role & Permissions'), {
            'fields': ('role', 'manager', 'is_active', 'is_staff', 'is_superuser')
        }),
        (_('Important Dates'), {
            'fields': ('date_joined', 'last_login', 'updated_at')
        }),
    )
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = _('Full Name')


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    """Admin interface for Team model."""
    list_display = ('name', 'manager', 'member_count', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'manager__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        (_('Team Info'), {
            'fields': ('id', 'name', 'manager', 'description', 'is_active')
        }),
        (_('Members'), {
            'fields': ('members',),
            'description': _('Select field agents and managers for this team')
        }),
        (_('Important Dates'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = _('Members')
