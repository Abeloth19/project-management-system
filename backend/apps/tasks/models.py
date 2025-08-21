from django.db import models
from django.core.validators import EmailValidator, MinLengthValidator
from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_assignee_email(value):
    """Custom validator for assignee email"""
    if value:
        # Could add domain restrictions here if needed
        blocked_domains = ['tempmail.com', '10minutemail.com']
        domain = value.split('@')[1].lower()
        if domain in blocked_domains:
            raise ValidationError(f'Email domain "{domain}" is not allowed.')


class Task(models.Model):
    TASK_STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
        ('BLOCKED', 'Blocked'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(2)]
    )
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=TASK_STATUS_CHOICES,
        default='TODO'
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='MEDIUM'
    )
    assignee_email = models.EmailField(
        blank=True,
        validators=[EmailValidator(), validate_assignee_email]
    )
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tasks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['assignee_email']),
            models.Index(fields=['due_date']),
            models.Index(fields=['priority', 'status']),
        ]
    
    def clean(self):
        """Additional model validation"""
        super().clean()
        if self.title:
            self.title = self.title.strip()
        
        # Validate that tasks can only be added to active projects
        if self.project and not self.project.can_add_tasks():
            raise ValidationError('Cannot add tasks to completed or cancelled projects.')
        
        # Validate status transitions
        if self.pk:  # Only for existing tasks
            old_task = Task.objects.get(pk=self.pk)
            
            # Don't allow moving from DONE back to other statuses
            if old_task.status == 'DONE' and self.status != 'DONE':
                raise ValidationError('Cannot reopen completed tasks.')
            
            # BLOCKED tasks can only move to TODO or remain BLOCKED
            if old_task.status == 'BLOCKED' and self.status not in ['BLOCKED', 'TODO']:
                raise ValidationError('Blocked tasks must be unblocked before changing status.')
        
        # Validate due date
        if self.due_date and self.due_date < timezone.now():
            if not self.pk or self.status != 'DONE':  # Allow past due dates for completed tasks
                raise ValidationError('Due date cannot be in the past for active tasks.')
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.project.name} - {self.title}"
    
    @property
    def comment_count(self):
        return self.comments.count()
    
    @property
    def is_overdue(self):
        if not self.due_date:
            return False
        return self.due_date < timezone.now() and self.status != 'DONE'
    
    @property
    def can_start(self):
        return self.status == 'TODO'
    
    @property
    def is_completed(self):
        return self.status == 'DONE'
    
    def can_change_status_to(self, new_status):
        """Check if task status can be changed to the given status"""
        valid_transitions = {
            'TODO': ['IN_PROGRESS', 'BLOCKED'],
            'IN_PROGRESS': ['DONE', 'BLOCKED', 'TODO'],
            'BLOCKED': ['TODO'],
            'DONE': []  # Completed tasks cannot be changed
        }
        return new_status in valid_transitions.get(self.status, [])
    
    def get_priority_weight(self):
        """Return numeric weight for priority sorting"""
        weights = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'URGENT': 4}
        return weights.get(self.priority, 2)
    
    def auto_assign_priority(self):
        """Auto-assign priority based on due date"""
        if not self.due_date:
            return
        
        days_until_due = (self.due_date.date() - timezone.now().date()).days
        
        if days_until_due < 0:  # Overdue
            self.priority = 'URGENT'
        elif days_until_due <= 1:  # Due within 1 day
            self.priority = 'HIGH'
        elif days_until_due <= 3:  # Due within 3 days
            self.priority = 'MEDIUM'
        else:
            self.priority = 'LOW'


class TaskComment(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    content = models.TextField(validators=[MinLengthValidator(1)])
    author_email = models.EmailField(
        validators=[EmailValidator(), validate_assignee_email]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'task_comments'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['task', 'created_at']),
            models.Index(fields=['author_email']),
        ]
    
    def clean(self):
        """Additional model validation"""
        super().clean()
        if self.content:
            self.content = self.content.strip()
            if not self.content:
                raise ValidationError('Comment content cannot be empty.')
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Comment on {self.task.title} by {self.author_email}"