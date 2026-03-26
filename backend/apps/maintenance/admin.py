from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import MaintenanceCategory, MaintenanceTicket


@admin.register(MaintenanceCategory)
class MaintenanceCategoryAdmin(admin.ModelAdmin):
    """Admin interface for Maintenance Category."""
    list_display = ('name', 'recipient_team', 'is_active', 'ticket_count')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'recipient_team')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    def ticket_count(self, obj):
        return obj.tickets.count()
    ticket_count.short_description = _('Tickets')


@admin.register(MaintenanceTicket)
class MaintenanceTicketAdmin(admin.ModelAdmin):
    """Admin interface for Maintenance Ticket."""
    list_display = ('ticket_number', 'category', 'priority_badge', 'status_badge', 'created_at')
    list_filter = ('category', 'priority', 'status', 'created_at')
    search_fields = ('ticket_number', 'description', 'reported_by__email')
    readonly_fields = ('id', 'ticket_number', 'created_at', 'updated_at', 'location_display')
    
    fieldsets = (
        (_('Ticket Information'), {
            'fields': ('id', 'ticket_number', 'category', 'priority', 'status')
        }),
        (_('Location'), {
            'fields': ('outlet', 'location_description', 'location_latitude', 'location_longitude', 'location_display')
        }),
        (_('Issue Details'), {
            'fields': ('description', 'reported_by')
        }),
        (_('Evidence'), {
            'fields': ('evidence_photo', 'additional_attachments')
        }),
        (_('Assignment'), {
            'fields': ('assigned_recipient', 'sent_to_recipients')
        }),
        (_('Completion'), {
            'fields': ('completed_at', 'completion_notes')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def priority_badge(self, obj):
        colors = {
            'low': '#00CC00',
            'medium': '#FFA500',
            'high': '#FF6600',
            'critical': '#CC0000',
        }
        color = colors.get(obj.priority, '#CCCCCC')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_badge.short_description = _('Priority')
    
    def status_badge(self, obj):
        colors = {
            'open': '#FFA500',
            'acknowledged': '#0066CC',
            'in_progress': '#FF6600',
            'completed': '#00CC00',
            'cancelled': '#CCCCCC',
        }
        color = colors.get(obj.status, '#CCCCCC')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = _('Status')
    
    def location_display(self, obj):
        return f"{obj.location_latitude}, {obj.location_longitude}"
    location_display.short_description = _('Coordinates')
