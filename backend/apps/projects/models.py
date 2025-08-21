from django.db import models
from django.core.validators import MinLengthValidator
from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_due_date(value):
    """Custom validator to ensure due date is not in the past"""
    if value and value < timezone.now().date():
        raise ValidationError('Due date cannot be in the past.')


class Project(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('ON_HOLD', 'On Hold'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    organization = models.ForeignKey(
        'organizations.Organization', 
        on_delete=models.CASCADE,
        related_name='projects'
    )
    name = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(2)]
    )
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )
    due_date = models.DateField(
        null=True, 
        blank=True,
        validators=[validate_due_date]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        unique_together = ['organization', 'name']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['due_date']),
        ]
    
    def clean(self):
        """Additional model validation"""
        super().clean()
        if self.name:
            self.name = self.name.strip()
        
        # Validate status transitions
        if self.pk:  # Only for existing projects
            old_project = Project.objects.get(pk=self.pk)
            if old_project.status == 'COMPLETED' and self.status != 'COMPLETED':
                raise ValidationError('Cannot change status of completed project.')
            
            if old_project.status == 'CANCELLED' and self.status not in ['CANCELLED', 'ACTIVE']:
                raise ValidationError('Cancelled projects can only be reactivated or remain cancelled.')
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.organization.name} - {self.name}"
    
    @property
    def task_count(self):
        return self.tasks.count()
    
    @property
    def completed_task_count(self):
        return self.tasks.filter(status='DONE').count()
    
    @property
    def completion_percentage(self):
        total = self.task_count
        if total == 0:
            return 0
        return round((self.completed_task_count / total) * 100, 1)
    
    @property
    def is_overdue(self):
        if not self.due_date:
            return False
        return self.due_date < timezone.now().date() and self.status != 'COMPLETED'
    
    @property
    def active_tasks(self):
        return self.tasks.exclude(status='DONE')
    
    def can_be_completed(self):
        """Check if project can be marked as completed"""
        if self.status == 'COMPLETED':
            return False
        return self.tasks.exclude(status='DONE').count() == 0
    
    def can_add_tasks(self):
        """Check if new tasks can be added to this project"""
        return self.status in ['ACTIVE', 'ON_HOLD']
    
    def get_status_color(self):
        """Return color code for project status"""
        colors = {
            'ACTIVE': '#28a745',
            'COMPLETED': '#007bff',
            'ON_HOLD': '#ffc107', 
            'CANCELLED': '#dc3545'
        }
        return colors.get(self.status, '#6c757d')