"""
Reporting models for commercial operations platform.
Provides audit trail and operational analytics.
Every important action is timestamped and traceable.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid


class AuditLog(models.Model):
    """
    Complete audit trail of all important actions.
    Provides traceability and compliance record.
    """
    
    ACTION_CHOICES = [
        ('create', _('Created')),
        ('update', _('Updated')),
        ('delete', _('Deleted')),
        ('view', _('Viewed')),
        ('login', _('Login')),
        ('export', _('Exported')),
        ('send_notice', _('Notice Sent')),
        ('create_ticket', _('Ticket Created')),
        ('check_in', _('Check In')),
        ('check_out', _('Check Out')),
        ('start_shift', _('Shift Started')),
        ('end_shift', _('Shift Ended')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # User and action
    user = models.ForeignKey(
        'users.User',
        verbose_name=_('user'),
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    
    action = models.CharField(
        _('action'),
        max_length=20,
        choices=ACTION_CHOICES
    )
    
    # Generic object reference
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    object_id = models.CharField(_('object ID'), max_length=255, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Details
    description = models.TextField(_('description'), blank=True)
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True)
    user_agent = models.CharField(_('user agent'), max_length=500, blank=True)
    
    # Old and new values for updates
    old_values = models.JSONField(_('old values'), default=dict, blank=True)
    new_values = models.JSONField(_('new values'), default=dict, blank=True)
    
    # Timestamp
    timestamp = models.DateTimeField(_('timestamp'), auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'reporting_audit_log'
        verbose_name = _('Audit Log')
        verbose_name_plural = _('Audit Logs')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['action']),
            models.Index(fields=['timestamp']),
        ]
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.user} - {self.timestamp}"


class DailyReport(models.Model):
    """
    Daily operational summary for managers.
    Aggregated KPIs calculated nightly or on-demand.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_date = models.DateField(_('report date'), unique=True, db_index=True)
    
    # Route metrics
    total_routes = models.PositiveIntegerField(_('total routes'), default=0)
    completed_routes = models.PositiveIntegerField(_('completed routes'), default=0)
    routes_in_progress = models.PositiveIntegerField(_('routes in progress'), default=0)
    routes_pending = models.PositiveIntegerField(_('routes pending'), default=0)
    
    # Stop/visit metrics
    total_planned_stops = models.PositiveIntegerField(_('total planned stops'), default=0)
    total_completed_stops = models.PositiveIntegerField(_('total completed stops'), default=0)
    total_skipped_stops = models.PositiveIntegerField(_('total skipped stops'), default=0)
    
    # Issues
    total_notices_issued = models.PositiveIntegerField(_('notices issued'), default=0)
    total_tickets_created = models.PositiveIntegerField(_('tickets created'), default=0)
    
    # Operational health
    on_time_completion_rate = models.DecimalField(
        _('on-time completion rate (%)'),
        max_digits=5,
        decimal_places=2,
        default=0
    )
    
    # Agent performance
    agent_count = models.PositiveIntegerField(_('active agents'), default=0)
    avg_stops_per_agent = models.DecimalField(
        _('average stops per agent'),
        max_digits=6,
        decimal_places=2,
        default=0
    )
    
    # Generated and updated
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'reporting_daily_report'
        verbose_name = _('Daily Report')
        verbose_name_plural = _('Daily Reports')
        ordering = ['-report_date']
    
    def __str__(self):
        return f"Daily Report - {self.report_date}"


class OutletPerformance(models.Model):
    """
    Performance history per outlet.
    Tracks compliance, visit frequency, and issue trends.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    outlet = models.ForeignKey(
        'outlets.Outlet',
        verbose_name=_('outlet'),
        on_delete=models.CASCADE,
        related_name='performance_records'
    )
    
    report_period_start = models.DateField(_('period start'))
    report_period_end = models.DateField(_('period end'))
    
    # Visit history
    scheduled_visits = models.PositiveIntegerField(_('scheduled visits'), default=0)
    completed_visits = models.PositiveIntegerField(_('completed visits'), default=0)
    skipped_visits = models.PositiveIntegerField(_('skipped visits'), default=0)
    
    visit_completion_rate = models.DecimalField(
        _('completion rate (%)'),
        max_digits=5,
        decimal_places=2,
        default=0
    )
    
    # Issues
    notice_count = models.PositiveIntegerField(_('notices issued'), default=0)
    repeated_violations = models.BooleanField(_('repeated violations'), default=False)
    
    # Notes
    notes = models.TextField(_('notes'), blank=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'reporting_outlet_performance'
        verbose_name = _('Outlet Performance')
        verbose_name_plural = _('Outlet Performance Records')
        indexes = [
            models.Index(fields=['outlet']),
            models.Index(fields=['report_period_start']),
        ]
        unique_together = [['outlet', 'report_period_start', 'report_period_end']]
        ordering = ['-report_period_end']
    
    def __str__(self):
        return f"{self.outlet.name} - {self.report_period_start} to {self.report_period_end}"


class AgentPerformance(models.Model):
    """
    Performance metrics per field agent.
    Tracks productivity, compliance, and quality metrics.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(
        'users.User',
        verbose_name=_('agent'),
        on_delete=models.CASCADE,
        related_name='performance_records',
        limit_choices_to={'role': 'field_agent'}
    )
    
    report_period_start = models.DateField(_('period start'))
    report_period_end = models.DateField(_('period end'))
    
    # Route execution
    assigned_routes = models.PositiveIntegerField(_('assigned routes'), default=0)
    completed_routes = models.PositiveIntegerField(_('completed routes'), default=0)
    route_completion_rate = models.DecimalField(
        _('completion rate (%)'),
        max_digits=5,
        decimal_places=2,
        default=0
    )
    
    # Stops/visits
    assigned_stops = models.PositiveIntegerField(_('assigned stops'), default=0)
    completed_stops = models.PositiveIntegerField(_('completed stops'), default=0)
    skipped_stops = models.PositiveIntegerField(_('skipped stops'), default=0)
    
    avg_visit_duration = models.DurationField(
        _('average visit duration'),
        null=True,
        blank=True
    )
    
    # Quality metrics
    issues_reported = models.PositiveIntegerField(_('issues reported'), default=0)
    tickets_created = models.PositiveIntegerField(_('tickets created'), default=0)
    
    # Compliance
    on_time_rate = models.DecimalField(
        _('on-time rate (%)'),
        max_digits=5,
        decimal_places=2,
        default=0
    )
    
    notes = models.TextField(_('notes'), blank=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'reporting_agent_performance'
        verbose_name = _('Agent Performance')
        verbose_name_plural = _('Agent Performance Records')
        indexes = [
            models.Index(fields=['agent']),
            models.Index(fields=['report_period_start']),
        ]
        unique_together = [['agent', 'report_period_start', 'report_period_end']]
        ordering = ['-report_period_end']
    
    def __str__(self):
        return f"{self.agent.get_full_name()} - {self.report_period_start} to {self.report_period_end}"
