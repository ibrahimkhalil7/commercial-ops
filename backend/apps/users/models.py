"""
User models for commercial operations platform.
Implements custom User with role-based access: Admin, Manager, Field Agent, Outlet Manager.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser, AbstractBaseUser, BaseUserManager
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
import uuid


class UserManager(BaseUserManager):
    """Custom user manager for User model."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user."""
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_staffuser(self, email, password=None, **extra_fields):
        """Create and save a staff user."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', User.ADMIN)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    """
    Custom User model for commercial operations platform.
    Supports internal staff and external outlet managers.
    """
    
    # Role choices
    ADMIN = 'admin'
    MANAGER = 'manager'
    FIELD_AGENT = 'field_agent'
    OUTLET_MANAGER = 'outlet_manager'
    
    ROLE_CHOICES = [
        (ADMIN, _('Administrator')),
        (MANAGER, _('Manager')),
        (FIELD_AGENT, _('Field Agent')),
        (OUTLET_MANAGER, _('Outlet Manager')),
    ]
    
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True, db_index=True)
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
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
    
    # Role and permissions
    role = models.CharField(
        _('user role'),
        max_length=20,
        choices=ROLE_CHOICES,
        default=FIELD_AGENT
    )
    
    # Status fields
    is_active = models.BooleanField(_('active'), default=True)
    is_staff = models.BooleanField(_('staff status'), default=False)
    is_superuser = models.BooleanField(_('superuser status'), default=False)
    
    # Timestamps
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True)
    last_login = models.DateTimeField(_('last login'), null=True, blank=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    # Optional: Manager reference for internal users
    manager = models.ForeignKey(
        'self',
        verbose_name=_('manager'),
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='subordinates'
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'users_user'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    def get_full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_role_display(self):
        """Return the display name for user's role."""
        return dict(self.ROLE_CHOICES).get(self.role, self.role)
    
    @property
    def is_internal_user(self):
        """Check if user is internal staff."""
        return self.role in [self.ADMIN, self.MANAGER, self.FIELD_AGENT]
    
    @property
    def is_outlet_user(self):
        """Check if user is an external outlet manager."""
        return self.role == self.OUTLET_MANAGER
    
    def has_perm(self, perm, obj=None):
        """Check permissions based on role."""
        if self.is_superuser:
            return True
        return False
    
    def has_module_perms(self, app_label):
        """Check module permissions."""
        if self.is_superuser or self.is_staff:
            return True
        return False


class Team(models.Model):
    """
    Operational grouping for field teams.
    Used for visibility control and performance tracking.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('team name'), max_length=100, unique=True)
    manager = models.OneToOneField(
        User,
        verbose_name=_('manager'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_team'
    )
    members = models.ManyToManyField(
        User,
        verbose_name=_('team members'),
        related_name='teams',
        limit_choices_to={'role__in': [User.FIELD_AGENT, User.MANAGER]}
    )
    description = models.TextField(_('description'), blank=True)
    is_active = models.BooleanField(_('active'), default=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        db_table = 'users_team'
        verbose_name = _('Team')
        verbose_name_plural = _('Teams')
        ordering = ['name']
    
    def __str__(self):
        return self.name
