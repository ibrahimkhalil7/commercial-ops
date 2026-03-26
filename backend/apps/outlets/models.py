"""
Outlet models for commercial operations platform.
Stores outlet master data, locations, contacts, and operating notes.
"""
from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
import uuid


class OutletCategory(models.Model):
    """Classification for outlets."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('category name'), max_length=100, unique=True)
    description = models.TextField(_('description'), blank=True)
    is_active = models.BooleanField(_('active'), default=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'outlets_category'
        verbose_name = _('Outlet Category')
        verbose_name_plural = _('Outlet Categories')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Outlet(models.Model):
    """
    Master database for commercial outlets.
    Central record for each outlet location with contact details and operating notes.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('outlet name'), max_length=255)
    category = models.ForeignKey(
        OutletCategory,
        verbose_name=_('category'),
        on_delete=models.PROTECT,
        related_name='outlets'
    )
    
    # Location information
    address = models.TextField(_('address'))
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
    
    # Contact information
    contact_person = models.CharField(_('contact person'), max_length=100, blank=True)
    email = models.EmailField(_('email'), blank=True)
    phone = models.CharField(
        _('phone number'),
        max_length=20,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Phone number must be entered in the format: +999999999'
            )
        ]
    )
    
    # Operating notes
    operating_notes = models.TextField(_('operating notes'), blank=True)
    
    # Assigned manager (internal user responsible for this outlet)
    assigned_manager = models.ForeignKey(
        'users.User',
        verbose_name=_('assigned manager'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_outlets',
        limit_choices_to={'role__in': ['admin', 'manager']}
    )
    
    # External contact for outlet manager
    outlet_manager_user = models.OneToOneField(
        'users.User',
        verbose_name=_('outlet manager user'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_outlet',
        limit_choices_to={'role': 'outlet_manager'}
    )
    
    # Status
    is_active = models.BooleanField(_('active'), default=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'outlets_outlet'
        verbose_name = _('Outlet')
        verbose_name_plural = _('Outlets')
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
            models.Index(fields=['latitude', 'longitude']),
        ]
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"
    
    def get_category_display(self):
        return self.category.name if self.category else "N/A"
    
    @property
    def location_tuple(self):
        """Return latitude, longitude as tuple for distance calculations."""
        return (float(self.latitude), float(self.longitude))


class LegacyNotice(models.Model):
    """
    Import and storage of historical warning/fine records from before platform launch.
    Maintains audit trail of historical notices issued.
    """
    NOTICE_TYPE_CHOICES = [
        ('warning', _('Warning')),
        ('fine', _('Fine')),
        ('violation', _('Violation')),
        ('notice', _('Notice')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    outlet = models.ForeignKey(
        Outlet,
        verbose_name=_('outlet'),
        on_delete=models.CASCADE,
        related_name='legacy_notices'
    )
    
    notice_type = models.CharField(
        _('notice type'),
        max_length=20,
        choices=NOTICE_TYPE_CHOICES
    )
    reason = models.TextField(_('reason'))
    amount = models.DecimalField(
        _('amount (if applicable)'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    source = models.CharField(
        _('source'),
        max_length=255,
        help_text=_('Original source system or reference')
    )
    
    issued_date = models.DateField(_('issued date'))
    created_at = models.DateTimeField(_('imported at'), auto_now_add=True)
    
    # Evidence
    attachment = models.FileField(
        _('attachment'),
        upload_to='legacy_notices/%Y/%m/%d/',
        null=True,
        blank=True
    )
    
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        db_table = 'outlets_legacy_notice'
        verbose_name = _('Legacy Notice')
        verbose_name_plural = _('Legacy Notices')
        indexes = [
            models.Index(fields=['outlet']),
            models.Index(fields=['notice_type']),
            models.Index(fields=['issued_date']),
        ]
        ordering = ['-issued_date']
    
    def __str__(self):
        return f"{self.outlet.name} - {self.get_notice_type_display()} ({self.issued_date})"
