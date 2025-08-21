import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from apps.organizations.models import Organization
from apps.projects.models import Project
from apps.tasks.models import Task, TaskComment


class OrganizationType(DjangoObjectType):
    """GraphQL type for Organization model"""
    
    # Custom fields
    project_count = graphene.Int()
    active_project_count = graphene.Int()
    project_completion_rate = graphene.Float()
    can_be_deleted = graphene.Boolean()
    
    class Meta:
        model = Organization
        fields = (
            'id', 
            'name', 
            'slug', 
            'contact_email', 
            'is_active',
            'created_at', 
            'updated_at'
        )
        filter_fields = {
            'name': ['exact', 'icontains'],
            'slug': ['exact'],
            'is_active': ['exact'],
            'created_at': ['gte', 'lte'],
        }
    
    def resolve_project_count(self, info):
        return self.project_count
    
    def resolve_active_project_count(self, info):
        return self.active_project_count
    
    def resolve_project_completion_rate(self, info):
        return self.get_project_completion_rate()
    
    def resolve_can_be_deleted(self, info):
        return self.can_be_deleted()


class ProjectType(DjangoObjectType):
    """GraphQL type for Project model"""
    
    # Custom fields
    task_count = graphene.Int()
    completed_task_count = graphene.Int()
    completion_percentage = graphene.Float()
    is_overdue = graphene.Boolean()
    can_be_completed = graphene.Boolean()
    can_add_tasks = graphene.Boolean()
    status_color = graphene.String()
    
    class Meta:
        model = Project
        fields = (
            'id',
            'organization',
            'name',
            'description', 
            'status',
            'due_date',
            'created_at',
            'updated_at'
        )
        filter_fields = {
            'name': ['exact', 'icontains'],
            'status': ['exact', 'in'],
            'organization': ['exact'],
            'organization__name': ['icontains'],
            'due_date': ['gte', 'lte'],
            'created_at': ['gte', 'lte'],
        }
    
    def resolve_task_count(self, info):
        return self.task_count
    
    def resolve_completed_task_count(self, info):
        return self.completed_task_count
    
    def resolve_completion_percentage(self, info):
        return self.completion_percentage
    
    def resolve_is_overdue(self, info):
        return self.is_overdue
    
    def resolve_can_be_completed(self, info):
        return self.can_be_completed()
    
    def resolve_can_add_tasks(self, info):
        return self.can_add_tasks()
    
    def resolve_status_color(self, info):
        return self.get_status_color()


class TaskType(DjangoObjectType):
    """GraphQL type for Task model"""
    
    # Custom fields
    comment_count = graphene.Int()
    is_overdue = graphene.Boolean()
    can_start = graphene.Boolean()
    is_completed = graphene.Boolean()
    priority_weight = graphene.Int()
    
    class Meta:
        model = Task
        fields = (
            'id',
            'project',
            'title',
            'description',
            'status',
            'priority',
            'assignee_email',
            'due_date',
            'created_at',
            'updated_at'
        )
        filter_fields = {
            'title': ['exact', 'icontains'],
            'status': ['exact', 'in'],
            'priority': ['exact', 'in'],
            'project': ['exact'],
            'project__organization': ['exact'],
            'project__organization__slug': ['exact'],
            'assignee_email': ['exact', 'icontains'],
            'due_date': ['gte', 'lte'],
            'created_at': ['gte', 'lte'],
        }
    
    def resolve_comment_count(self, info):
        return self.comment_count
    
    def resolve_is_overdue(self, info):
        return self.is_overdue
    
    def resolve_can_start(self, info):
        return self.can_start
    
    def resolve_is_completed(self, info):
        return self.is_completed
    
    def resolve_priority_weight(self, info):
        return self.get_priority_weight()


class TaskCommentType(DjangoObjectType):
    """GraphQL type for TaskComment model"""
    
    class Meta:
        model = TaskComment
        fields = (
            'id',
            'task',
            'content',
            'author_email',
            'created_at',
            'updated_at'
        )
        filter_fields = {
            'task': ['exact'],
            'task__project': ['exact'],
            'task__project__organization': ['exact'],
            'author_email': ['exact', 'icontains'],
            'created_at': ['gte', 'lte'],
        }


# Custom scalar types for choices
class ProjectStatusEnum(graphene.Enum):
    ACTIVE = 'ACTIVE'
    COMPLETED = 'COMPLETED'
    ON_HOLD = 'ON_HOLD'
    CANCELLED = 'CANCELLED'


class TaskStatusEnum(graphene.Enum):
    TODO = 'TODO'
    IN_PROGRESS = 'IN_PROGRESS'
    DONE = 'DONE'
    BLOCKED = 'BLOCKED'


class TaskPriorityEnum(graphene.Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'
    URGENT = 'URGENT'


# Statistics types for dashboard
class ProjectStatsType(graphene.ObjectType):
    """Project statistics for dashboard"""
    total_projects = graphene.Int()
    active_projects = graphene.Int()
    completed_projects = graphene.Int()
    on_hold_projects = graphene.Int()
    cancelled_projects = graphene.Int()
    completion_rate = graphene.Float()


class TaskStatsType(graphene.ObjectType):
    """Task statistics for dashboard"""
    total_tasks = graphene.Int()
    todo_tasks = graphene.Int()
    in_progress_tasks = graphene.Int()
    done_tasks = graphene.Int()
    blocked_tasks = graphene.Int()
    overdue_tasks = graphene.Int()
    completion_rate = graphene.Float()


class OrganizationStatsType(graphene.ObjectType):
    """Organization statistics for dashboard"""
    project_stats = graphene.Field(ProjectStatsType)
    task_stats = graphene.Field(TaskStatsType)
    recent_activity_count = graphene.Int()
    active_users_count = graphene.Int()