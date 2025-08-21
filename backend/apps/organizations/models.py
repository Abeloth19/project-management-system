from django.db import models
from django.utils.text import slugify
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError


def validate_organization_name(value):
    """Custom validator to ensure organization name is appropriate"""
    if len(value.strip()) < 2:
        raise ValidationError('Organization name must be at least 2 characters long.')
    
    forbidden_words = ['admin', 'api', 'www', 'test', 'demo']
    if value.lower() in forbidden_words:
        raise ValidationError(f'"{value}" is not allowed as an organization name.')


class Organization(models.Model):
    name = models.CharField(
        max_length=100, 
        unique=True,
        validators=[validate_organization_name]
    )
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    contact_email = models.EmailField(validators=[EmailValidator()])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'organizations'
        ordering = ['name']
        
    def clean(self):
        """Additional model validation"""
        super().clean()
        if self.name:
            self.name = self.name.strip()
            if not self.is_active and self.projects.filter(status='ACTIVE').exists():
                raise ValidationError(
                    'Cannot deactivate organization with active projects.'
                )
    
    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Organization.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    @property
    def project_count(self):
        return self.projects.count()
    
    @property
    def active_project_count(self):
        return self.projects.filter(status='ACTIVE').count()
    
    def can_be_deleted(self):
        """Check if organization can be safely deleted"""
        return not self.projects.exists()
    
    def get_project_completion_rate(self):
        """Calculate overall project completion rate"""
        total_projects = self.project_count
        if total_projects == 0:
            return 0
        completed_projects = self.projects.filter(status='COMPLETED').count()
        return round((completed_projects / total_projects) * 100, 1)