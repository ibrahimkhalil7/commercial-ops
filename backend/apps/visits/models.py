"""
Visit models for commercial operations platform.
Handles field agent shifts, outlet check-ins, and GPS location tracking.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Shift(models.Model):
    """
    Work shift tracking for field agents.
    Controls when location tracking is active.
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('active', _('Active')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(
        'users.User',
        verbose_name=_('field agent'),
        on_delete=models.CASCADE,
        related_name='shifts',
        limit_choices_to={'role': 'field_agent'}
    )
    
    daily_route = models.ForeignKey(
        'routes.DailyRoute',
        verbose_name=_('daily route'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='shifts'
    )
    
    # Status
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Timestamps
    start_time = models.DateTimeField(_('start time'), null=True, blank=True)
    end_time = models.DateTimeField(_('end time'), null=True, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        db_table = 'visits_shift'
        verbose_name = _('Shift')
        verbose_name_plural = _('Shifts')
        indexes = [
            models.Index(fields=['agent']),
            models.Index(fields=['status']),
            models.Index(fields=['start_time']),
        ]
        ordering = ['-start_time']
    
    def __str__(self):
        return f"{self.agent.get_full_name()} - {self.start_time}"
    
    @property
    def duration(self):
        """Calculate shift duration."""
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        return None
    
    @property
    def is_active(self):
        """Check if shift is currently active."""
        return self.status == 'active'


class Visit(models.Model):
    """
    Outlet check-in/check-out record.
    Evidence of stop execution at a specific outlet.
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('checked_in', _('Checked In')),
        ('checked_out', _('Checked Out')),
        ('skipped', _('Skipped')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Route and outlet
    daily_route = models.ForeignKey(
        'routes.DailyRoute',
        verbose_name=_('daily route'),
        on_delete=models.CASCADE,
        related_name='visits'
    )
    
    outlet = models.ForeignKey(
        'outlets.Outlet',
        verbose_name=_('outlet'),
        on_delete=models.CASCADE,
        related_name='visits'
    )
    
    agent = models.ForeignKey(
        'users.User',
        verbose_name=_('agent'),
        on_delete=models.SET_NULL,
        null=True,
        related_name='visits'
    )
    
    # Status
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Check-in/out details
    check_in_time = models.DateTimeField(_('check-in time'), null=True, blank=True)
    check_in_latitude = models.DecimalField(
        _('check-in latitude'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    check_in_longitude = models.DecimalField(
        _('check-in longitude'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    check_in_accuracy = models.FloatField(
        _('check-in accuracy (meters)'),
        null=True,
        blank=True
    )
    
    check_out_time = models.DateTimeField(_('check-out time'), null=True, blank=True)
    check_out_latitude = models.DecimalField(
        _('check-out latitude'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    check_out_longitude = models.DecimalField(
        _('check-out longitude'),
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    
    # Visit notes
    notes = models.TextField(_('visit notes'), blank=True)
    
    # Location validation
    within_proximity = models.BooleanField(
        _('within location proximity'),
        default=False,
        help_text=_('Checked automatically based on GPS proximity')
    )
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'visits_visit'
        verbose_name = _('Visit')
        verbose_name_plural = _('Visits')
        indexes = [
            models.Index(fields=['daily_route']),
            models.Index(fields=['outlet']),
            models.Index(fields=['agent']),
            models.Index(fields=['status']),
            models.Index(fields=['check_in_time']),
        ]
        unique_together = [['daily_route', 'outlet']]
        ordering = ['-check_in_time']
    
    def __str__(self):
        return f"{self.outlet.name} - {self.check_in_time}"
    
    @property
    def visit_duration(self):
        """Calculate time spent at outlet."""
        if self.check_in_time and self.check_out_time:
            return self.check_out_time - self.check_in_time
        return None


class GPSLog(models.Model):
    """
    Location tracking records for field agents.
    Captured every 3 minutes during active shift.
    Provides near-live visibility and trail history.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    agent = models.ForeignKey(
        'users.User',
        verbose_name=_('field agent'),
        on_delete=models.CASCADE,
        related_name='gps_logs',
        limit_choices_to={'role': 'field_agent'}
    )
    
    shift = models.ForeignKey(
        Shift,
        verbose_name=_('shift'),
        on_delete=models.CASCADE,
        related_name='gps_logs'
    )
    
    # Location data
    latitude = models.DecimalField(
        _('latitude'),
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = models.DecimalField(
        _('longitude'),
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )
    
    # GPS accuracy/signal quality
    accuracy = models.FloatField(
        _('accuracy (meters)'),
        null=True,
        blank=True,
        help_text=_('GPS accuracy radius in meters')
    )
    altitude = models.FloatField(
        _('altitude (meters)'),
        null=True,
        blank=True
    )
    
    # Timestamp (when location was captured)
    timestamp = models.DateTimeField(_('timestamp'), db_index=True)
    
    # When log was recorded (may differ from timestamp)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        db_table = 'visits_gps_log'
        verbose_name = _('GPS Log')
        verbose_name_plural = _('GPS Logs')
        indexes = [
            models.Index(fields=['agent']),
            models.Index(fields=['shift']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.agent.get_full_name()} - {self.timestamp}"
    
    @property
    def location_tuple(self):
        """Return latitude, longitude as tuple."""
        return (float(self.latitude), float(self.longitude))
