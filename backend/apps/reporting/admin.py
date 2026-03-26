from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import AuditLog, DailyReport, OutletPerformance, AgentPerformance


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin interface for Audit Log."""
    list_display = ('user', 'action', 'content_type', 'timestamp')
    list_filter = ('action', 'timestamp', 'user')
    search_fields = ('user__email', 'description')
    readonly_fields = ('id', 'timestamp')
    
    fieldsets = (
        (_('Action'), {
            'fields': ('id', 'user', 'action', 'timestamp')
        }),
        (_('Object'), {
            'fields': ('content_type', 'object_id')
        }),
        (_('Details'), {
            'fields': ('description', 'ip_address', 'user_agent')
        }),
        (_('Changes'), {
            'fields': ('old_values', 'new_values')
        }),
    )
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(DailyReport)
class DailyReportAdmin(admin.ModelAdmin):
    """Admin interface for Daily Report."""
    list_display = ('report_date', 'total_routes', 'completed_routes', 'on_time_completion_rate')
    list_filter = ('report_date',)
    search_fields = ('report_date',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        (_('Report Period'), {
            'fields': ('id', 'report_date')
        }),
        (_('Routes'), {
            'fields': ('total_routes', 'completed_routes', 'routes_in_progress', 'routes_pending')
        }),
        (_('Stops/Visits'), {
            'fields': ('total_planned_stops', 'total_completed_stops', 'total_skipped_stops')
        }),
        (_('Issues'), {
            'fields': ('total_notices_issued', 'total_tickets_created')
        }),
        (_('Performance'), {
            'fields': ('on_time_completion_rate', 'agent_count', 'avg_stops_per_agent')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(OutletPerformance)
class OutletPerformanceAdmin(admin.ModelAdmin):
    """Admin interface for Outlet Performance."""
    list_display = ('outlet', 'report_period_start', 'visit_completion_rate', 'notice_count')
    list_filter = ('report_period_start', 'repeated_violations')
    search_fields = ('outlet__name',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        (_('Outlet & Period'), {
            'fields': ('id', 'outlet', 'report_period_start', 'report_period_end')
        }),
        (_('Visits'), {
            'fields': ('scheduled_visits', 'completed_visits', 'skipped_visits', 'visit_completion_rate')
        }),
        (_('Issues'), {
            'fields': ('notice_count', 'repeated_violations')
        }),
        (_('Notes'), {
            'fields': ('notes',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(AgentPerformance)
class AgentPerformanceAdmin(admin.ModelAdmin):
    """Admin interface for Agent Performance."""
    list_display = ('agent', 'report_period_start', 'route_completion_rate', 'assigned_stops')
    list_filter = ('report_period_start', 'agent')
    search_fields = ('agent__email', 'agent__first_name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        (_('Agent & Period'), {
            'fields': ('id', 'agent', 'report_period_start', 'report_period_end')
        }),
        (_('Routes'), {
            'fields': ('assigned_routes', 'completed_routes', 'route_completion_rate')
        }),
        (_('Stops/Visits'), {
            'fields': ('assigned_stops', 'completed_stops', 'skipped_stops', 'avg_visit_duration')
        }),
        (_('Quality'), {
            'fields': ('issues_reported', 'tickets_created')
        }),
        (_('Compliance'), {
            'fields': ('on_time_rate', 'notes')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
