from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Outlet, OutletCategory, LegacyNotice


@admin.register(OutletCategory)
class OutletCategoryAdmin(admin.ModelAdmin):
    """Admin interface for Outlet Category."""
    list_display = ('name', 'is_active', 'outlet_count')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    def outlet_count(self, obj):
        return obj.outlets.count()
    outlet_count.short_description = _('Outlets')


@admin.register(Outlet)
class OutletAdmin(admin.ModelAdmin):
    """Admin interface for Outlet model."""
    list_display = ('name', 'category', 'phone', 'is_active', 'assigned_manager')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name', 'address', 'email', 'phone', 'contact_person')
    readonly_fields = ('id', 'created_at', 'updated_at', 'location_display')
    
    fieldsets = (
        (_('Outlet Information'), {
            'fields': ('id', 'name', 'category', 'is_active')
        }),
        (_('Location'), {
            'fields': ('address', 'latitude', 'longitude', 'location_display')
        }),
        (_('Contact Details'), {
            'fields': ('contact_person', 'email', 'phone')
        }),
        (_('Management'), {
            'fields': ('assigned_manager', 'outlet_manager_user')
        }),
        (_('Notes'), {
            'fields': ('operating_notes',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def location_display(self, obj):
        return f"{obj.latitude}, {obj.longitude}"
    location_display.short_description = _('Location Coordinates')


@admin.register(LegacyNotice)
class LegacyNoticeAdmin(admin.ModelAdmin):
    """Admin interface for Legacy Notice model."""
    list_display = ('outlet', 'notice_type', 'issued_date', 'amount')
    list_filter = ('notice_type', 'issued_date', 'created_at')
    search_fields = ('outlet__name', 'reason', 'source')
    readonly_fields = ('id', 'created_at')
    
    fieldsets = (
        (_('Notice Information'), {
            'fields': ('id', 'outlet', 'notice_type', 'reason')
        }),
        (_('Financial'), {
            'fields': ('amount',)
        }),
        (_('Source'), {
            'fields': ('source', 'issued_date')
        }),
        (_('Evidence'), {
            'fields': ('attachment', 'notes')
        }),
        (_('Timestamps'), {
            'fields': ('created_at',)
        }),
    )
