from django.db import models
from django.core.validators import MinLengthValidator


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
    due_date = models.DateField(null=True, blank=True)
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
        from django.utils import timezone
        return self.due_date < timezone.now().date() and self.status != 'COMPLETED'
    
    @property
    def active_tasks(self):
        return self.tasks.exclude(status='DONE')