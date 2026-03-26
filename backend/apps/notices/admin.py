from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import Notice


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    """Admin interface for Notice model."""
    list_display = ('outlet', 'notice_type_badge', 'priority_badge', 'send_status_badge', 'issued_at')
    list_filter = ('notice_type', 'priority', 'send_status', 'issued_at')
    search_fields = ('outlet__name', 'reason', 'created_by__email')
    readonly_fields = ('id', 'issued_at', 'updated_at', 'sent_at')
    
    fieldsets = (
        (_('Notice Information'), {
            'fields': ('id', 'outlet', 'notice_type', 'reason', 'priority')
        }),
        (_('Amount'), {
            'fields': ('amount',)
        }),
        (_('Related Information'), {
            'fields': ('visit', 'created_by')
        }),
        (_('Evidence'), {
            'fields': ('evidence_photo', 'attachment')
        }),
        (_('Notification'), {
            'fields': ('send_status', 'sent_to_emails', 'send_error_message', 'sent_at')
        }),
        (_('Timestamps'), {
            'fields': ('issued_at', 'updated_at')
        }),
    )
    
    actions = ['resend_notifications']
    
    def notice_type_badge(self, obj):
        colors = {
            'warning': '#FFA500',
            'fine': '#CC0000',
            'violation': '#FF6600',
            'notice': '#0066CC',
        }
        color = colors.get(obj.notice_type, '#CCCCCC')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_notice_type_display()
        )
    notice_type_badge.short_description = _('Type')
    
    def priority_badge(self, obj):
        colors = {
            'low': '#00CC00',
            'medium': '#FFA500',
            'high': '#FF6600',
            'urgent': '#CC0000',
        }
        color = colors.get(obj.priority, '#CCCCCC')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_badge.short_description = _('Priority')
    
    def send_status_badge(self, obj):
        colors = {
            'pending': '#FFA500',
            'sent': '#00CC00',
            'failed': '#CC0000',
            'retry': '#FF6600',
        }
        color = colors.get(obj.send_status, '#CCCCCC')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_send_status_display()
        )
    send_status_badge.short_description = _('Send Status')
    
    def resend_notifications(self, request, queryset):
        """Admin action to resend failed notifications."""
        count = 0
        for notice in queryset.filter(send_status__in=['failed', 'retry']):
            if notice.send_notification():
                count += 1
        
        self.message_user(request, f'{count} notification(s) resent successfully.')
    
    resend_notifications.short_description = _('Resend failed notifications')
