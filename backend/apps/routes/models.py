"""
Route models for commercial operations platform.
Implements recurring route templates and daily route generation.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
import uuid


class RouteTemplate(models.Model):
    """
    Reusable route definition for recurring days.
    System generates daily route instances from these templates.
    """
    # Day of week choices (0=Monday, 6=Sunday)
    WEEKDAY_CHOICES = [
        (0, _('Monday')),
        (1, _('Tuesday')),
        (2, _('Wednesday')),
        (3, _('Thursday')),
        (4, _('Friday')),
        (5, _('Saturday')),
        (6, _('Sunday')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('template name'), max_length=255)
    zone = models.CharField(_('zone/area'), max_length=100)
    
    # Assignment
    assigned_agent = models.ForeignKey(
        'users.User',
        verbose_name=_('assigned agent'),
        on_delete=models.CASCADE,
        related_name='route_templates',
        limit_choices_to={'role': 'field_agent'}
    )
    
    # Recurring schedule - select applicable days
    recurring_days = models.CharField(
        _('recurring days'),
        max_length=7,
        help_text=_('Binary string: 1=applies on that day. Format: MTWTFSS (e.g., 1111100 = Mon-Fri)')
    )
    
    # Status
    is_active = models.BooleanField(_('active'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'routes_template'
        verbose_name = _('Route Template')
        verbose_name_plural = _('Route Templates')
        indexes = [
            models.Index(fields=['assigned_agent']),
            models.Index(fields=['is_active']),
        ]
        ordering = ['name']
        unique_together = [['name', 'assigned_agent']]
    
    def __str__(self):
        return f"{self.name} - {self.assigned_agent.get_full_name()}"
    
    def applies_on_weekday(self, weekday):
        """Check if route applies on given weekday (0=Monday, 6=Sunday)."""
        try:
            return self.recurring_days[weekday] == '1'
        except (IndexError, TypeError):
            return False
    
    def get_applicable_days(self):
        """Return list of weekday numbers when this route applies."""
        days = []
        for i, applies in enumerate(self.recurring_days):
            if applies == '1':
                days.append(i)
        return days


class RouteStop(models.Model):
    """
    Stop order and outlet details for a route template.
    Defines the sequence of outlets to visit on this route.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route_template = models.ForeignKey(
        RouteTemplate,
        verbose_name=_('route template'),
        on_delete=models.CASCADE,
        related_name='stops'
    )
    
    outlet = models.ForeignKey(
        'outlets.Outlet',
        verbose_name=_('outlet'),
        on_delete=models.CASCADE,
        related_name='route_stops'
    )
    
    # Stop sequence order
    stop_order = models.PositiveIntegerField(
        _('stop order'),
        validators=[MinValueValidator(1)]
    )
    
    # Notes specific to this outlet on this route
    notes = models.TextField(_('stop notes'), blank=True)
    
    # Status
    is_active = models.BooleanField(_('active'), default=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'routes_stop'
        verbose_name = _('Route Stop')
        verbose_name_plural = _('Route Stops')
        indexes = [
            models.Index(fields=['route_template']),
            models.Index(fields=['outlet']),
        ]
        unique_together = [['route_template', 'outlet']]
        ordering = ['route_template', 'stop_order']
    
    def __str__(self):
        return f"{self.route_template.name} - Stop {self.stop_order}: {self.outlet.name}"


class DailyRoute(models.Model):
    """
    Daily route instance generated from template.
    Represents one day's route execution with planned stops.
    """
    COMPLETION_STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('partial', _('Partially Completed')),
        ('cancelled', _('Cancelled')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route_template = models.ForeignKey(
        RouteTemplate,
        verbose_name=_('route template'),
        on_delete=models.PROTECT,
        related_name='daily_routes'
    )
    
    # Execution details
    route_date = models.DateField(_('route date'), db_index=True)
    assigned_agent = models.ForeignKey(
        'users.User',
        verbose_name=_('assigned agent'),
        on_delete=models.SET_NULL,
        null=True,
        related_name='daily_routes',
        limit_choices_to={'role': 'field_agent'}
    )
    
    # Status tracking
    status = models.CharField(
        _('completion status'),
        max_length=20,
        choices=COMPLETION_STATUS_CHOICES,
        default='pending'
    )
    
    # Counts
    planned_stops = models.PositiveIntegerField(
        _('planned stops'),
        validators=[MinValueValidator(0)],
        default=0
    )
    completed_stops = models.PositiveIntegerField(
        _('completed stops'),
        validators=[MinValueValidator(0)],
        default=0
    )
    skipped_stops = models.PositiveIntegerField(
        _('skipped stops'),
        validators=[MinValueValidator(0)],
        default=0
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    started_at = models.DateTimeField(_('started at'), null=True, blank=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    
    class Meta:
        db_table = 'routes_daily'
        verbose_name = _('Daily Route')
        verbose_name_plural = _('Daily Routes')
        indexes = [
            models.Index(fields=['route_date']),
            models.Index(fields=['assigned_agent']),
            models.Index(fields=['status']),
        ]
        unique_together = [['route_template', 'route_date']]
        ordering = ['-route_date']
    
    def __str__(self):
        return f"{self.route_template.name} - {self.route_date}"
    
    @property
    def completion_percentage(self):
        """Calculate completion percentage."""
        if self.planned_stops == 0:
            return 0
        return int((self.completed_stops / self.planned_stops) * 100)
    
    @property
    def is_overdue(self):
        """Check if route is overdue (incomplete and past today)."""
        from datetime import date
        return self.status != 'completed' and self.route_date < date.today()
