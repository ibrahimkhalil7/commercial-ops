from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import RouteTemplate, RouteStop, DailyRoute


@admin.register(RouteTemplate)
class RouteTemplateAdmin(admin.ModelAdmin):
    """Admin interface for Route Template."""
    list_display = ('name', 'assigned_agent', 'zone', 'is_active', 'stop_count')
    list_filter = ('is_active', 'created_at', 'assigned_agent')
    search_fields = ('name', 'zone', 'assigned_agent__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        (_('Template Information'), {
            'fields': ('id', 'name', 'zone', 'is_active')
        }),
        (_('Assignment'), {
            'fields': ('assigned_agent',)
        }),
        (_('Schedule'), {
            'fields': ('recurring_days',),
            'description': _('Binary format (MTWTFSS): 1=applies, 0=skips. Example: 1111100 = Mon-Fri')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def stop_count(self, obj):
        return obj.stops.count()
    stop_count.short_description = _('Stops')


@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    """Admin interface for Route Stop."""
    list_display = ('route_template', 'stop_order', 'outlet', 'is_active')
    list_filter = ('route_template', 'is_active')
    search_fields = ('route_template__name', 'outlet__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        (_('Stop Information'), {
            'fields': ('id', 'route_template', 'outlet', 'stop_order', 'is_active')
        }),
        (_('Notes'), {
            'fields': ('notes',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(DailyRoute)
class DailyRouteAdmin(admin.ModelAdmin):
    """Admin interface for Daily Route."""
    list_display = ('route_template', 'route_date', 'assigned_agent', 'status_badge', 'completion_display')
    list_filter = ('status', 'route_date', 'assigned_agent')
    search_fields = ('route_template__name', 'assigned_agent__email', 'route_date')
    readonly_fields = ('id', 'created_at', 'started_at', 'completed_at', 'completion_percentage')
    
    fieldsets = (
        (_('Route Information'), {
            'fields': ('id', 'route_template', 'route_date', 'assigned_agent')
        }),
        (_('Status'), {
            'fields': ('status', 'completion_percentage')
        }),
        (_('Stop Tracking'), {
            'fields': ('planned_stops', 'completed_stops', 'skipped_stops')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'started_at', 'completed_at')
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'in_progress': '#0066CC',
            'completed': '#00CC00',
            'partial': '#FFCC00',
            'cancelled': '#CC0000',
        }
        color = colors.get(obj.status, '#CCCCCC')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def completion_display(self, obj):
        return f"{obj.completed_stops}/{obj.planned_stops} ({obj.completion_percentage}%)"
    completion_display.short_description = _('Progress')
