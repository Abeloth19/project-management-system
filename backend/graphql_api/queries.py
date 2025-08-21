import graphene
from graphene_django.filter import DjangoFilterConnectionField
from django.db.models import Q, Count, Case, When, IntegerField
from apps.organizations.models import Organization
from apps.projects.models import Project
from apps.tasks.models import Task, TaskComment
from .types import (
    OrganizationType, 
    ProjectType, 
    TaskType, 
    TaskCommentType,
    ProjectStatsType,
    TaskStatsType,
    OrganizationStatsType
)


class Query(graphene.ObjectType):
    """Root GraphQL query"""
    
    organization = graphene.Field(OrganizationType, slug=graphene.String(required=True))
    organizations = DjangoFilterConnectionField(OrganizationType)
    
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))
    projects = DjangoFilterConnectionField(
        ProjectType,
        organization_slug=graphene.String(),
        status=graphene.String(),
        search=graphene.String()
    )

    task = graphene.Field(TaskType, id=graphene.ID(required=True))
    tasks = DjangoFilterConnectionField(
        TaskType,
        organization_slug=graphene.String(),
        project_id=graphene.ID(),
        status=graphene.String(),
        priority=graphene.String(),
        assignee_email=graphene.String(),
        search=graphene.String()
    )
    
    task_comments = DjangoFilterConnectionField(
        TaskCommentType,
        task_id=graphene.ID(required=True)
    )
    
    organization_stats = graphene.Field(
        OrganizationStatsType,
        organization_slug=graphene.String(required=True)
    )
    project_stats = graphene.Field(
        ProjectStatsType,
        organization_slug=graphene.String(required=True),
        project_id=graphene.ID()
    )
    task_stats = graphene.Field(
        TaskStatsType,
        organization_slug=graphene.String(required=True),
        project_id=graphene.ID()
    )
    
    def resolve_organization(self, info, slug):
        """Get single organization by slug"""
        try:
            return Organization.objects.get(slug=slug, is_active=True)
        except Organization.DoesNotExist:
            return None
    
    def resolve_organizations(self, info, **kwargs):
        """Get all organizations with filtering"""
        return Organization.objects.filter(is_active=True)
    
    def resolve_project(self, info, id):
        """Get single project by ID"""
        try:
            project = Project.objects.select_related('organization').get(id=id)
            return project
        except Project.DoesNotExist:
            return None
    
    def resolve_projects(self, info, organization_slug=None, status=None, search=None, **kwargs):
        """Get projects with filtering and search"""
        queryset = Project.objects.select_related('organization').prefetch_related('tasks')
        
        if organization_slug:
            queryset = queryset.filter(organization__slug=organization_slug)
        
        if status:
            queryset = queryset.filter(status=status)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def resolve_task(self, info, id):
        """Get single task by ID"""
        try:
            task = Task.objects.select_related('project__organization').prefetch_related('comments').get(id=id)
            return task
        except Task.DoesNotExist:
            return None
    
    def resolve_tasks(self, info, organization_slug=None, project_id=None, status=None, 
                     priority=None, assignee_email=None, search=None, **kwargs):
        """Get tasks with comprehensive filtering"""
        queryset = Task.objects.select_related('project__organization').prefetch_related('comments')
        
        if organization_slug:
            queryset = queryset.filter(project__organization__slug=organization_slug)
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        if status:
            queryset = queryset.filter(status=status)
        
        if priority:
            queryset = queryset.filter(priority=priority)
        
        if assignee_email:
            queryset = queryset.filter(assignee_email__icontains=assignee_email)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def resolve_task_comments(self, info, task_id, **kwargs):
        """Get comments for a specific task"""
        return TaskComment.objects.filter(task_id=task_id).order_by('created_at')
    
    def resolve_organization_stats(self, info, organization_slug):
        """Get comprehensive organization statistics"""
        try:
            org = Organization.objects.get(slug=organization_slug, is_active=True)
        except Organization.DoesNotExist:
            return None
        
        project_stats = self._get_project_stats(org)
        
        task_stats = self._get_task_stats(org)
        
        return OrganizationStatsType(
            project_stats=project_stats,
            task_stats=task_stats,
            recent_activity_count=self._get_recent_activity_count(org),
            active_users_count=self._get_active_users_count(org)
        )
    
    def resolve_project_stats(self, info, organization_slug, project_id=None):
        """Get project statistics"""
        try:
            org = Organization.objects.get(slug=organization_slug, is_active=True)
        except Organization.DoesNotExist:
            return None
        
        return self._get_project_stats(org, project_id)
    
    def resolve_task_stats(self, info, organization_slug, project_id=None):
        """Get task statistics"""
        try:
            org = Organization.objects.get(slug=organization_slug, is_active=True)
        except Organization.DoesNotExist:
            return None
        
        return self._get_task_stats(org, project_id)
    
    def _get_project_stats(self, organization, project_id=None):
        """Calculate project statistics"""
        queryset = organization.projects.all()
        if project_id:
            queryset = queryset.filter(id=project_id)
        
        stats = queryset.aggregate(
            total=Count('id'),
            active=Count(Case(When(status='ACTIVE', then=1), output_field=IntegerField())),
            completed=Count(Case(When(status='COMPLETED', then=1), output_field=IntegerField())),
            on_hold=Count(Case(When(status='ON_HOLD', then=1), output_field=IntegerField())),
            cancelled=Count(Case(When(status='CANCELLED', then=1), output_field=IntegerField()))
        )
        
        completion_rate = 0
        if stats['total'] > 0:
            completion_rate = round((stats['completed'] / stats['total']) * 100, 1)
        
        return ProjectStatsType(
            total_projects=stats['total'],
            active_projects=stats['active'],
            completed_projects=stats['completed'],
            on_hold_projects=stats['on_hold'],
            cancelled_projects=stats['cancelled'],
            completion_rate=completion_rate
        )
    
    def _get_task_stats(self, organization, project_id=None):
        """Calculate task statistics"""
        queryset = Task.objects.filter(project__organization=organization)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        stats = queryset.aggregate(
            total=Count('id'),
            todo=Count(Case(When(status='TODO', then=1), output_field=IntegerField())),
            in_progress=Count(Case(When(status='IN_PROGRESS', then=1), output_field=IntegerField())),
            done=Count(Case(When(status='DONE', then=1), output_field=IntegerField())),
            blocked=Count(Case(When(status='BLOCKED', then=1), output_field=IntegerField()))
        )
        
        from django.utils import timezone
        overdue_count = queryset.filter(
            due_date__lt=timezone.now(),
            status__in=['TODO', 'IN_PROGRESS', 'BLOCKED']
        ).count()
        
        completion_rate = 0
        if stats['total'] > 0:
            completion_rate = round((stats['done'] / stats['total']) * 100, 1)
        
        return TaskStatsType(
            total_tasks=stats['total'],
            todo_tasks=stats['todo'],
            in_progress_tasks=stats['in_progress'],
            done_tasks=stats['done'],
            blocked_tasks=stats['blocked'],
            overdue_tasks=overdue_count,
            completion_rate=completion_rate
        )
    
    def _get_recent_activity_count(self, organization):
        """Count recent activity (tasks and comments from last 7 days)"""
        from django.utils import timezone
        from datetime import timedelta
        
        week_ago = timezone.now() - timedelta(days=7)
        
        recent_tasks = Task.objects.filter(
            project__organization=organization,
            created_at__gte=week_ago
        ).count()
        
        recent_comments = TaskComment.objects.filter(
            task__project__organization=organization,
            created_at__gte=week_ago
        ).count()
        
        return recent_tasks + recent_comments
    
    def _get_active_users_count(self, organization):
        """Count unique active users (people who commented or are assigned tasks)"""
        assignees = set(Task.objects.filter(
            project__organization=organization,
            assignee_email__isnull=False
        ).exclude(assignee_email='').values_list('assignee_email', flat=True))
        
        commenters = set(TaskComment.objects.filter(
            task__project__organization=organization
        ).values_list('author_email', flat=True))
        
        all_users = assignees.union(commenters)
        return len(all_users)