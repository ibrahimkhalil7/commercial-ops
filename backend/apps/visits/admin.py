from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import Shift, Visit, GPSLog


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    """Admin interface for Shift."""
    list_display = ('agent', 'status_badge', 'start_time', 'duration_display')
    list_filter = ('status', 'start_time', 'agent')
    search_fields = ('agent__email', 'agent__first_name')
    readonly_fields = ('id', 'created_at', 'duration')
    
    fieldsets = (
        (_('Shift Information'), {
            'fields': ('id', 'agent', 'daily_route', 'status')
        }),
        (_('Timing'), {
            'fields': ('start_time', 'end_time', 'duration')
        }),
        (_('Timestamps'), {
            'fields': ('created_at',)
        }),
    )
    
    def status_badge(self, obj):
        colors = {'pending': '#FFA500', 'active': '#00CC00', 'completed': '#0066CC', 'cancelled': '#CC0000'}
        color = colors.get(obj.status, '#CCCCCC')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def duration_display(self, obj):
        return obj.duration if obj.duration else 'N/A'
    duration_display.short_description = _('Duration')


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    """Admin interface for Visit."""
    list_display = ('outlet', 'agent', 'status', 'check_in_time', 'proximity_badge')
    list_filter = ('status', 'within_proximity', 'check_in_time')
    search_fields = ('outlet__name', 'agent__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'visit_duration')
    
    fieldsets = (
        (_('Visit Information'), {
            'fields': ('id', 'daily_route', 'outlet', 'agent', 'status')
        }),
        (_('Check-In'), {
            'fields': ('check_in_time', 'check_in_latitude', 'check_in_longitude', 'check_in_accuracy')
        }),
        (_('Check-Out'), {
            'fields': ('check_out_time', 'check_out_latitude', 'check_out_longitude', 'visit_duration')
        }),
        (_('Validation'), {
            'fields': ('within_proximity', 'notes')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def proximity_badge(self, obj):
        if obj.within_proximity:
            return format_html('<span style="color: green; font-weight: bold;">✓ Within</span>')
        else:
            return format_html('<span style="color: red; font-weight: bold;">✗ Outside</span>')
    proximity_badge.short_description = _('Proximity')


@admin.register(GPSLog)
class GPSLogAdmin(admin.ModelAdmin):
    """Admin interface for GPS Log."""
    list_display = ('agent', 'timestamp', 'accuracy_display', 'latitude', 'longitude')
    list_filter = ('agent', 'timestamp')
    search_fields = ('agent__email', 'latitude', 'longitude')
    readonly_fields = ('id', 'created_at', 'location_display')
    
    fieldsets = (
        (_('Location Data'), {
            'fields': ('id', 'agent', 'shift')
        }),
        (_('Coordinates'), {
            'fields': ('latitude', 'longitude', 'altitude', 'accuracy', 'location_display')
        }),
        (_('Timestamps'), {
            'fields': ('timestamp', 'created_at')
        }),
    )
    
    def location_display(self, obj):
        return f"{obj.latitude}, {obj.longitude}"
    location_display.short_description = _('Location')
    
    def accuracy_display(self, obj):
        if obj.accuracy:
            return f"{obj.accuracy}m"
        return "N/A"
    accuracy_display.short_description = _('Accuracy')
