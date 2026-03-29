"""
Target data model blueprint for a scalable Commercial Operations platform.

This module intentionally focuses on normalized, operations-grade entities that
support route adherence, field accountability, outlet history, tickets,
violations, and analytics-ready event capture.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class TimeStampedModel(models.Model):
    """Reusable timestamps for all core entities."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class OpsZone(TimeStampedModel):
    """Operational geography for assignment, filtering, and reporting."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=120)
    parent_zone = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.PROTECT, related_name='children'
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ops_zone'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name


class OpsOutletCategory(TimeStampedModel):
    """Normalized outlet segment/classification."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ops_outlet_category'


class OpsOutlet(TimeStampedModel):
    """Core tenant/outlet master record (single source of truth)."""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('temporary_closed', 'Temporary Closed'),
        ('closed', 'Closed'),
        ('suspended', 'Suspended'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    external_code = models.CharField(max_length=60, unique=True)
    legal_name = models.CharField(max_length=255)
    display_name = models.CharField(max_length=255)
    category = models.ForeignKey(OpsOutletCategory, on_delete=models.PROTECT, related_name='outlets')
    zone = models.ForeignKey(OpsZone, on_delete=models.PROTECT, related_name='outlets')

    address_line = models.CharField(max_length=255)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(-90), MaxValueValidator(90)],
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[MinValueValidator(-180), MaxValueValidator(180)],
    )

    contact_name = models.CharField(max_length=120, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='active')

    class Meta:
        db_table = 'ops_outlet'
        indexes = [
            models.Index(fields=['external_code']),
            models.Index(fields=['display_name']),
            models.Index(fields=['zone']),
            models.Index(fields=['status']),
            models.Index(fields=['latitude', 'longitude']),
        ]


class OpsOutletAssignment(TimeStampedModel):
    """Historical manager ownership of outlets (SCD type 2 style)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    outlet = models.ForeignKey(OpsOutlet, on_delete=models.CASCADE, related_name='manager_assignments')
    manager = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='ops_outlet_assignments')
    valid_from = models.DateField()
    valid_to = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=True)

    class Meta:
        db_table = 'ops_outlet_assignment'
        indexes = [
            models.Index(fields=['outlet', 'is_current']),
            models.Index(fields=['manager', 'is_current']),
            models.Index(fields=['valid_from']),
        ]


class OpsRoutePlan(TimeStampedModel):
    """Reusable route definition."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    zone = models.ForeignKey(OpsZone, on_delete=models.PROTECT, related_name='route_plans')
    assigned_agent = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='ops_route_plans')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ops_route_plan'
        indexes = [
            models.Index(fields=['assigned_agent']),
            models.Index(fields=['zone']),
            models.Index(fields=['is_active']),
        ]


class OpsRoutePlanStop(TimeStampedModel):
    """Ordered stops for each route plan."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route_plan = models.ForeignKey(OpsRoutePlan, on_delete=models.CASCADE, related_name='stops')
    outlet = models.ForeignKey(OpsOutlet, on_delete=models.PROTECT, related_name='planned_stops')
    stop_order = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    expected_service_minutes = models.PositiveIntegerField(default=10)
    is_mandatory = models.BooleanField(default=True)

    class Meta:
        db_table = 'ops_route_plan_stop'
        unique_together = [['route_plan', 'outlet'], ['route_plan', 'stop_order']]
        indexes = [
            models.Index(fields=['route_plan', 'stop_order']),
            models.Index(fields=['outlet']),
        ]


class OpsRouteRun(TimeStampedModel):
    """Daily execution instance of a route plan."""

    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('partial', 'Partial'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route_plan = models.ForeignKey(OpsRoutePlan, on_delete=models.PROTECT, related_name='runs')
    route_date = models.DateField(db_index=True)
    assigned_agent = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='ops_route_runs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')

    planned_stop_count = models.PositiveIntegerField(default=0)
    completed_stop_count = models.PositiveIntegerField(default=0)
    skipped_stop_count = models.PositiveIntegerField(default=0)

    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'ops_route_run'
        unique_together = [['route_plan', 'route_date']]
        indexes = [
            models.Index(fields=['route_date']),
            models.Index(fields=['assigned_agent', 'route_date']),
            models.Index(fields=['status']),
        ]


class OpsRouteRunStop(TimeStampedModel):
    """Materialized stop list for each route run (immutable plan snapshot)."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('visited', 'Visited'),
        ('skipped', 'Skipped'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route_run = models.ForeignKey(OpsRouteRun, on_delete=models.CASCADE, related_name='run_stops')
    route_plan_stop = models.ForeignKey(OpsRoutePlanStop, on_delete=models.PROTECT, related_name='run_occurrences')
    outlet = models.ForeignKey(OpsOutlet, on_delete=models.PROTECT, related_name='run_stops')
    stop_order = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    expected_arrival_at = models.DateTimeField(null=True, blank=True)
    actual_arrival_at = models.DateTimeField(null=True, blank=True)
    skipped_reason = models.TextField(blank=True)

    class Meta:
        db_table = 'ops_route_run_stop'
        unique_together = [['route_run', 'stop_order']]
        indexes = [
            models.Index(fields=['route_run', 'status']),
            models.Index(fields=['outlet']),
        ]


class OpsShift(TimeStampedModel):
    """Agent shift control and attendance foundation."""

    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('active', 'Active'),
        ('ended', 'Ended'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='ops_shifts')
    route_run = models.ForeignKey(OpsRouteRun, null=True, blank=True, on_delete=models.SET_NULL, related_name='shifts')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')

    shift_start_at = models.DateTimeField(null=True, blank=True)
    shift_end_at = models.DateTimeField(null=True, blank=True)
    start_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    start_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    end_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    end_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        db_table = 'ops_shift'
        indexes = [
            models.Index(fields=['agent', 'status']),
            models.Index(fields=['shift_start_at']),
        ]


class OpsLocationPing(TimeStampedModel):
    """Near-live location feed for operational oversight."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='ops_location_pings')
    shift = models.ForeignKey(OpsShift, on_delete=models.CASCADE, related_name='location_pings')

    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    accuracy_m = models.FloatField(null=True, blank=True)
    captured_at = models.DateTimeField(db_index=True)

    class Meta:
        db_table = 'ops_location_ping'
        indexes = [
            models.Index(fields=['agent', 'captured_at']),
            models.Index(fields=['shift', 'captured_at']),
        ]


class OpsVisit(TimeStampedModel):
    """Proof-of-visit and adherence evaluation."""

    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('checked_in', 'Checked In'),
        ('checked_out', 'Checked Out'),
        ('skipped', 'Skipped'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route_run_stop = models.OneToOneField(OpsRouteRunStop, on_delete=models.PROTECT, related_name='visit')
    agent = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='ops_visits')
    outlet = models.ForeignKey(OpsOutlet, on_delete=models.PROTECT, related_name='visits')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')

    check_in_at = models.DateTimeField(null=True, blank=True)
    check_out_at = models.DateTimeField(null=True, blank=True)

    check_in_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    check_in_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    check_in_accuracy_m = models.FloatField(null=True, blank=True)

    check_out_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    check_out_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    check_out_accuracy_m = models.FloatField(null=True, blank=True)

    distance_from_outlet_m = models.FloatField(null=True, blank=True)
    within_allowed_radius = models.BooleanField(default=False)
    manual_override = models.BooleanField(default=False)
    override_reason = models.TextField(blank=True)

    notes = models.TextField(blank=True)
    skip_reason = models.TextField(blank=True)

    class Meta:
        db_table = 'ops_visit'
        indexes = [
            models.Index(fields=['agent', 'status']),
            models.Index(fields=['outlet']),
            models.Index(fields=['check_in_at']),
        ]


class OpsAttachment(TimeStampedModel):
    """Reusable attachment table for evidence across domains."""

    DOMAIN_CHOICES = [
        ('visit', 'Visit'),
        ('incident', 'Incident'),
        ('ticket', 'Ticket'),
        ('violation', 'Violation'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    domain = models.CharField(max_length=20, choices=DOMAIN_CHOICES)
    object_id = models.UUIDField()

    file = models.FileField(upload_to='ops_attachments/%Y/%m/%d/')
    file_type = models.CharField(max_length=80, blank=True)
    original_name = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='ops_attachments')

    class Meta:
        db_table = 'ops_attachment'
        indexes = [
            models.Index(fields=['domain', 'object_id']),
            models.Index(fields=['uploaded_by']),
        ]


class OpsIncident(TimeStampedModel):
    """Field incident/observation captured during visits."""

    TYPE_CHOICES = [
        ('observation', 'Observation'),
        ('issue', 'Issue'),
        ('risk', 'Risk'),
        ('escalation', 'Escalation'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_review', 'In Review'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visit = models.ForeignKey(OpsVisit, null=True, blank=True, on_delete=models.SET_NULL, related_name='incidents')
    outlet = models.ForeignKey(OpsOutlet, on_delete=models.PROTECT, related_name='incidents')
    reported_by = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='reported_incidents')

    incident_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    severity = models.PositiveSmallIntegerField(default=2, validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')

    class Meta:
        db_table = 'ops_incident'
        indexes = [
            models.Index(fields=['outlet', 'status']),
            models.Index(fields=['reported_by']),
            models.Index(fields=['incident_type']),
        ]


class OpsServiceTicket(TimeStampedModel):
    """Internal service request lifecycle (maintenance/follow-up workflow)."""

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('acknowledged', 'Acknowledged'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_no = models.CharField(max_length=40, unique=True)
    outlet = models.ForeignKey(OpsOutlet, on_delete=models.PROTECT, related_name='service_tickets')
    incident = models.ForeignKey(OpsIncident, null=True, blank=True, on_delete=models.SET_NULL, related_name='service_tickets')

    created_by = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='created_service_tickets')
    assigned_to = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_service_tickets')

    category = models.CharField(max_length=80)
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')

    due_at = models.DateTimeField(null=True, blank=True)
    first_response_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'ops_service_ticket'
        indexes = [
            models.Index(fields=['ticket_no']),
            models.Index(fields=['outlet', 'status']),
            models.Index(fields=['priority', 'status']),
            models.Index(fields=['assigned_to', 'status']),
        ]


class OpsViolationCase(TimeStampedModel):
    """Compliance case that can result in warning/fine actions."""

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('under_review', 'Under Review'),
        ('issued', 'Issued'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case_no = models.CharField(max_length=40, unique=True)
    outlet = models.ForeignKey(OpsOutlet, on_delete=models.PROTECT, related_name='violation_cases')
    visit = models.ForeignKey(OpsVisit, null=True, blank=True, on_delete=models.SET_NULL, related_name='violation_cases')

    violation_type = models.CharField(max_length=80)
    severity = models.PositiveSmallIntegerField(default=2, validators=[MinValueValidator(1), MaxValueValidator(5)])
    description = models.TextField()

    proposed_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    approved_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_by = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='created_violation_cases')
    approved_by = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_violation_cases')

    class Meta:
        db_table = 'ops_violation_case'
        indexes = [
            models.Index(fields=['case_no']),
            models.Index(fields=['outlet', 'status']),
            models.Index(fields=['violation_type']),
        ]


class OpsStatusHistory(TimeStampedModel):
    """Generic status timeline for ticket/violation/incident/visit governance."""

    DOMAIN_CHOICES = [
        ('visit', 'Visit'),
        ('incident', 'Incident'),
        ('ticket', 'Ticket'),
        ('violation', 'Violation'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    domain = models.CharField(max_length=20, choices=DOMAIN_CHOICES)
    object_id = models.UUIDField()

    from_status = models.CharField(max_length=40, blank=True)
    to_status = models.CharField(max_length=40)
    reason = models.TextField(blank=True)

    changed_by = models.ForeignKey('users.User', null=True, on_delete=models.SET_NULL, related_name='ops_status_changes')
    changed_at = models.DateTimeField(db_index=True)

    class Meta:
        db_table = 'ops_status_history'
        indexes = [
            models.Index(fields=['domain', 'object_id', 'changed_at']),
            models.Index(fields=['changed_by']),
        ]


class OpsAuditEvent(models.Model):
    """Immutable audit/event ledger for operations and analytics."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    event_name = models.CharField(max_length=120, db_index=True)
    domain = models.CharField(max_length=40, db_index=True)
    object_id = models.UUIDField(null=True, blank=True)

    actor = models.ForeignKey('users.User', null=True, on_delete=models.SET_NULL, related_name='ops_audit_events')
    outlet = models.ForeignKey(OpsOutlet, null=True, blank=True, on_delete=models.SET_NULL, related_name='audit_events')
    agent = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='ops_agent_events')

    route_run = models.ForeignKey(OpsRouteRun, null=True, blank=True, on_delete=models.SET_NULL, related_name='audit_events')
    visit = models.ForeignKey(OpsVisit, null=True, blank=True, on_delete=models.SET_NULL, related_name='audit_events')

    payload = models.JSONField(default=dict, blank=True)
    event_at = models.DateTimeField(db_index=True)

    source = models.CharField(max_length=40, default='web')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    request_id = models.CharField(max_length=80, blank=True)

    class Meta:
        db_table = 'ops_audit_event'
        indexes = [
            models.Index(fields=['event_name', 'event_at']),
            models.Index(fields=['domain', 'object_id', 'event_at']),
            models.Index(fields=['outlet', 'event_at']),
            models.Index(fields=['agent', 'event_at']),
        ]


class OpsDailyKPI(models.Model):
    """Daily aggregated facts powering management dashboards."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kpi_date = models.DateField(db_index=True)
    zone = models.ForeignKey(OpsZone, null=True, blank=True, on_delete=models.SET_NULL, related_name='daily_kpis')

    planned_visits = models.PositiveIntegerField(default=0)
    completed_visits = models.PositiveIntegerField(default=0)
    skipped_visits = models.PositiveIntegerField(default=0)

    route_adherence_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    avg_visit_duration_minutes = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    open_tickets = models.PositiveIntegerField(default=0)
    tickets_created = models.PositiveIntegerField(default=0)
    tickets_resolved = models.PositiveIntegerField(default=0)

    violations_created = models.PositiveIntegerField(default=0)
    violations_issued = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'ops_daily_kpi'
        unique_together = [['kpi_date', 'zone']]
        indexes = [
            models.Index(fields=['kpi_date']),
            models.Index(fields=['zone', 'kpi_date']),
        ]
