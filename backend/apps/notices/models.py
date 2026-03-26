"""
Notice models for commercial operations platform.
Handles warning/fine notifications to outlets.
No payment workflow is included in MVP.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.mail import send_mail
import uuid


class Notice(models.Model):
    """
    Warning or fine notice issued to an outlet.
    Creates a timestamped record accessible to outlet managers.
    Triggers email notification on creation.
    """
    
    NOTICE_TYPE_CHOICES = [
        ('warning', _('Warning')),
        ('fine', _('Fine')),
        ('violation', _('Violation')),
        ('notice', _('Notice')),
    ]
    
    PRIORITY_CHOICES = [
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('high', _('High')),
        ('urgent', _('Urgent')),
    ]
    
    SEND_STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('sent', _('Sent')),
        ('failed', _('Failed')),
        ('retry', _('Retry Needed')),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    outlet = models.ForeignKey(
        'outlets.Outlet',
        verbose_name=_('outlet'),
        on_delete=models.CASCADE,
        related_name='notices'
    )
    
    # Notice details
    notice_type = models.CharField(
        _('notice type'),
        max_length=20,
        choices=NOTICE_TYPE_CHOICES
    )
    
    reason = models.TextField(_('reason/description'))
    
    priority = models.CharField(
        _('priority'),
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    
    amount = models.DecimalField(
        _('amount (if applicable)'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_('Fine amount if applicable')
    )
    
    # Reference to visit or issue
    visit = models.ForeignKey(
        'visits.Visit',
        verbose_name=_('related visit'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notices'
    )
    
    # Creator (field agent or manager)
    created_by = models.ForeignKey(
        'users.User',
        verbose_name=_('created by'),
        on_delete=models.PROTECT,
        related_name='notices_created'
    )
    
    # Evidence
    evidence_photo = models.ImageField(
        _('evidence photo'),
        upload_to='notice_evidence/%Y/%m/%d/',
        null=True,
        blank=True
    )
    
    attachment = models.FileField(
        _('attachment'),
        upload_to='notice_attachments/%Y/%m/%d/',
        null=True,
        blank=True
    )
    
    # Email notification
    send_status = models.CharField(
        _('send status'),
        max_length=20,
        choices=SEND_STATUS_CHOICES,
        default='pending'
    )
    
    sent_at = models.DateTimeField(_('sent at'), null=True, blank=True)
    sent_to_emails = models.TextField(
        _('sent to emails'),
        blank=True,
        help_text=_('Comma-separated list of recipients')
    )
    send_error_message = models.TextField(_('send error message'), blank=True)
    
    # Timestamps
    issued_at = models.DateTimeField(_('issued at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'notices_notice'
        verbose_name = _('Notice')
        verbose_name_plural = _('Notices')
        indexes = [
            models.Index(fields=['outlet']),
            models.Index(fields=['notice_type']),
            models.Index(fields=['priority']),
            models.Index(fields=['send_status']),
            models.Index(fields=['issued_at']),
        ]
        ordering = ['-issued_at']
    
    def __str__(self):
        return f"{self.outlet.name} - {self.get_notice_type_display()} ({self.issued_at.date()})"
    
    def send_notification(self):
        """
        Send email notification to outlet manager.
        Call this after creating the notice.
        """
        from django.conf import settings
        
        recipients = []
        
        # Add outlet manager user email
        if self.outlet.outlet_manager_user:
            recipients.append(self.outlet.outlet_manager_user.email)
        
        # Add outlet contact email
        if self.outlet.email:
            recipients.append(self.outlet.email)
        
        if not recipients:
            self.send_status = 'failed'
            self.send_error_message = 'No recipient email addresses found'
            self.save()
            return False
        
        try:
            subject = f"[{self.get_notice_type_display()}] {self.outlet.name}"
            message = f"""
Dear {self.outlet.contact_person or 'Outlet Manager'},

A new {self.get_notice_type_display().lower()} has been issued for {self.outlet.name}.

Details:
- Type: {self.get_notice_type_display()}
- Priority: {self.get_priority_display()}
- Reason: {self.reason}
{"- Amount: " + str(self.amount) if self.amount else ""}

Please log in to your portal to view full details and any supporting evidence.

Best regards,
Commercial Operations Team
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipients,
                fail_silently=False,
            )
            
            self.send_status = 'sent'
            self.sent_at = models.functions.Now()
            self.sent_to_emails = ', '.join(recipients)
            self.send_error_message = ''
            self.save()
            return True
            
        except Exception as e:
            self.send_status = 'retry'
            self.send_error_message = str(e)
            self.save()
            return False
