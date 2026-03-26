"""
Maintenance models for commercial operations platform.
Handles public-realm and infrastructure issue reporting from field.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.mail import send_mail
import uuid


class MaintenanceCategory(models.Model):
    """Classification for maintenance issues."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('category name'), max_length=100, unique=True)
    description = models.TextField(_('description'), blank=True)
    recipient_team = models.CharField(
        _('recipient team'),
        max_length=100,
        help_text=_('Which team/department should handle this')
    )
    is_active = models.BooleanField(_('active'), default=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'maintenance_category'
        verbose_name = _('Maintenance Category')
        verbose_name_plural = _('Maintenance Categories')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class MaintenanceTicket(models.Model):
    """
    Infrastructure or public-realm issue ticket.
    Created by field agents with location and photo evidence.
    Dispatched to maintenance teams via email.
    """
    
    PRIORITY_CHOICES = [
        ('low', _('Low - Can wait')),
        ('medium', _('Medium - Schedule soon')),
        ('high', _('High - Urgent')),
        ('critical', _('Critical - Immediate')),
    ]
    
    STATUS_CHOICES = [
        ('open', _('Open')),
        ('acknowledged', _('Acknowledged')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(
        _('ticket number'),
        max_length=50,
        unique=True,
        help_text=_('Auto-generated ticket ID for reference')
    )
    
    # Issue classification
    category = models.ForeignKey(
        MaintenanceCategory,
        verbose_name=_('category'),
        on_delete=models.PROTECT,
        related_name='tickets'
    )
    
    # Location
    outlet = models.ForeignKey(
        'outlets.Outlet',
        verbose_name=_('outlet location'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='maintenance_tickets'
    )
    
    location_latitude = models.DecimalField(
        _('latitude'),
        max_digits=9,
        decimal_places=6
    )
    location_longitude = models.DecimalField(
        _('longitude'),
        max_digits=9,
        decimal_places=6
    )
    location_description = models.CharField(
        _('location description'),
        max_length=255,
        help_text=_('Specific location details (e.g., "North side of building, near entrance")')
    )
    
    # Issue details
    description = models.TextField(_('issue description'))
    priority = models.CharField(
        _('priority'),
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    
    # Status
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )
    
    # Creator (field agent)
    reported_by = models.ForeignKey(
        'users.User',
        verbose_name=_('reported by'),
        on_delete=models.SET_NULL,
        null=True,
        related_name='reported_tickets',
        limit_choices_to={'role': 'field_agent'}
    )
    
    # Evidence
    evidence_photo = models.ImageField(
        _('evidence photo'),
        upload_to='maintenance_evidence/%Y/%m/%d/'
    )
    
    additional_attachments = models.FileField(
        _('additional attachments'),
        upload_to='maintenance_attachments/%Y/%m/%d/',
        null=True,
        blank=True
    )
    
    # Maintenance team assignment
    assigned_recipient = models.CharField(
        _('assigned to'),
        max_length=255,
        blank=True,
        help_text=_('Maintenance team or individual responsible')
    )
    
    # Email notification
    sent_to_recipients = models.TextField(
        _('sent to emails'),
        blank=True,
        help_text=_('Comma-separated recipient emails')
    )
    
    # Completion details
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    completion_notes = models.TextField(_('completion notes'), blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'maintenance_ticket'
        verbose_name = _('Maintenance Ticket')
        verbose_name_plural = _('Maintenance Tickets')
        indexes = [
            models.Index(fields=['ticket_number']),
            models.Index(fields=['category']),
            models.Index(fields=['priority']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"[{self.ticket_number}] {self.category.name} - {self.get_status_display()}"
    
    def save(self, *args, **kwargs):
        """Auto-generate ticket number if new."""
        if not self.ticket_number:
            from datetime import datetime
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            self.ticket_number = f"MNT-{timestamp}"
        super().save(*args, **kwargs)
    
    def send_notification(self):
        """
        Send email to maintenance team with ticket details.
        """
        from django.conf import settings
        
        recipients = []
        
        # Use category recipient team if configured
        if self.category.recipient_team:
            # This would typically be looked up from a team config
            # For now, we'd need to extend with actual email addresses
            recipients.append(self.category.recipient_team)
        
        if not recipients:
            return False
        
        try:
            subject = f"[{self.ticket_number}] Maintenance Request - {self.category.name}"
            message = f"""
MAINTENANCE TICKET NOTIFICATION

Ticket: {self.ticket_number}
Category: {self.category.name}
Priority: {self.get_priority_display()}
Status: {self.get_status_display()}

LOCATION:
{self.location_description}
Coordinates: {self.location_latitude}, {self.location_longitude}
{"Outlet: " + self.outlet.name if self.outlet else ""}

ISSUE DESCRIPTION:
{self.description}

REPORTED BY:
{self.reported_by.get_full_name() if self.reported_by else 'Unknown'}

Please log in to the platform to view complete details and evidence photo.

Ticket Created: {self.created_at}
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipients,
                fail_silently=False,
            )
            
            self.sent_to_recipients = ', '.join(recipients)
            self.save()
            return True
            
        except Exception as e:
            return False
