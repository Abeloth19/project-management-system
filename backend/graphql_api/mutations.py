import graphene
from graphene_django import DjangoObjectType
from django.core.exceptions import ValidationError
from apps.organizations.models import Organization
from apps.projects.models import Project
from apps.tasks.models import Task, TaskComment
from .types import OrganizationType, ProjectType, TaskType, TaskCommentType


class ProjectInput(graphene.InputObjectType):
    organization_slug = graphene.String(required=True)
    name = graphene.String(required=True)
    description = graphene.String()
    status = graphene.String()
    due_date = graphene.Date()


class ProjectUpdateInput(graphene.InputObjectType):
    name = graphene.String()
    description = graphene.String()
    status = graphene.String()
    due_date = graphene.Date()


class TaskInput(graphene.InputObjectType):
    project_id = graphene.ID(required=True)
    title = graphene.String(required=True)
    description = graphene.String()
    status = graphene.String()
    priority = graphene.String()
    assignee_email = graphene.String()
    due_date = graphene.DateTime()


class TaskUpdateInput(graphene.InputObjectType):
    title = graphene.String()
    description = graphene.String()
    status = graphene.String()
    priority = graphene.String()
    assignee_email = graphene.String()
    due_date = graphene.DateTime()


class TaskCommentInput(graphene.InputObjectType):
    task_id = graphene.ID(required=True)
    content = graphene.String(required=True)
    author_email = graphene.String(required=True)

class CreateProject(graphene.Mutation):
    class Arguments:
        input = ProjectInput(required=True)
    
    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, input):
        try:
            organization = Organization.objects.get(
                slug=input.organization_slug, 
                is_active=True
            )
            
            project = Project(
                organization=organization,
                name=input.name,
                description=input.get('description', ''),
                status=input.get('status', 'ACTIVE'),
                due_date=input.get('due_date')
            )
            
            project.full_clean()
            project.save()
            
            return CreateProject(
                project=project,
                success=True,
                errors=[]
            )
            
        except Organization.DoesNotExist:
            return CreateProject(
                project=None,
                success=False,
                errors=['Organization not found']
            )
        except ValidationError as e:
            return CreateProject(
                project=None,
                success=False,
                errors=[str(e)]
            )
        except Exception as e:
            return CreateProject(
                project=None,
                success=False,
                errors=[f'Unexpected error: {str(e)}']
            )


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = ProjectUpdateInput(required=True)
    
    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, id, input):
        try:
            project = Project.objects.get(id=id)
            
            if hasattr(input, 'name') and input.name is not None:
                project.name = input.name
            if hasattr(input, 'description') and input.description is not None:
                project.description = input.description
            if hasattr(input, 'status') and input.status is not None:
                project.status = input.status
            if hasattr(input, 'due_date') and input.due_date is not None:
                project.due_date = input.due_date
            
            project.full_clean()
            project.save()
            
            return UpdateProject(
                project=project,
                success=True,
                errors=[]
            )
            
        except Project.DoesNotExist:
            return UpdateProject(
                project=None,
                success=False,
                errors=['Project not found']
            )
        except ValidationError as e:
            return UpdateProject(
                project=None,
                success=False,
                errors=[str(e)]
            )
        except Exception as e:
            return UpdateProject(
                project=None,
                success=False,
                errors=[f'Unexpected error: {str(e)}']
            )


class DeleteProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, id):
        try:
            project = Project.objects.get(id=id)
            project.delete()
            
            return DeleteProject(
                success=True,
                errors=[]
            )
            
        except Project.DoesNotExist:
            return DeleteProject(
                success=False,
                errors=['Project not found']
            )
        except Exception as e:
            return DeleteProject(
                success=False,
                errors=[f'Error deleting project: {str(e)}']
            )


class CreateTask(graphene.Mutation):
    class Arguments:
        input = TaskInput(required=True)
    
    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, input):
        try:
            project = Project.objects.get(id=input.project_id)
            
            task = Task(
                project=project,
                title=input.title,
                description=input.get('description', ''),
                status=input.get('status', 'TODO'),
                priority=input.get('priority', 'MEDIUM'),
                assignee_email=input.get('assignee_email', ''),
                due_date=input.get('due_date')
            )
            
            task.full_clean()
            task.save()
            
            return CreateTask(
                task=task,
                success=True,
                errors=[]
            )
            
        except Project.DoesNotExist:
            return CreateTask(
                task=None,
                success=False,
                errors=['Project not found']
            )
        except ValidationError as e:
            return CreateTask(
                task=None,
                success=False,
                errors=[str(e)]
            )
        except Exception as e:
            return CreateTask(
                task=None,
                success=False,
                errors=[f'Unexpected error: {str(e)}']
            )


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = TaskUpdateInput(required=True)
    
    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, id, input):
        try:
            task = Task.objects.get(id=id)
            
            if hasattr(input, 'title') and input.title is not None:
                task.title = input.title
            if hasattr(input, 'description') and input.description is not None:
                task.description = input.description
            if hasattr(input, 'status') and input.status is not None:
                task.status = input.status
            if hasattr(input, 'priority') and input.priority is not None:
                task.priority = input.priority
            if hasattr(input, 'assignee_email') and input.assignee_email is not None:
                task.assignee_email = input.assignee_email
            if hasattr(input, 'due_date') and input.due_date is not None:
                task.due_date = input.due_date
            
            task.full_clean()
            task.save()
            
            return UpdateTask(
                task=task,
                success=True,
                errors=[]
            )
            
        except Task.DoesNotExist:
            return UpdateTask(
                task=None,
                success=False,
                errors=['Task not found']
            )
        except ValidationError as e:
            return UpdateTask(
                task=None,
                success=False,
                errors=[str(e)]
            )
        except Exception as e:
            return UpdateTask(
                task=None,
                success=False,
                errors=[f'Unexpected error: {str(e)}']
            )


class DeleteTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, id):
        try:
            task = Task.objects.get(id=id)
            task.delete()
            
            return DeleteTask(
                success=True,
                errors=[]
            )
            
        except Task.DoesNotExist:
            return DeleteTask(
                success=False,
                errors=['Task not found']
            )
        except Exception as e:
            return DeleteTask(
                success=False,
                errors=[f'Error deleting task: {str(e)}']
            )

   
class CreateTaskComment(graphene.Mutation):
    class Arguments:
        input = TaskCommentInput(required=True)
    
    comment = graphene.Field(TaskCommentType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, input):
        try:
            task = Task.objects.get(id=input.task_id)
            
            comment = TaskComment(
                task=task,
                content=input.content,
                author_email=input.author_email
            )
            
            comment.full_clean()
            comment.save()
            
            return CreateTaskComment(
                comment=comment,
                success=True,
                errors=[]
            )
            
        except Task.DoesNotExist:
            return CreateTaskComment(
                comment=None,
                success=False,
                errors=['Task not found']
            )
        except ValidationError as e:
            return CreateTaskComment(
                comment=None,
                success=False,
                errors=[str(e)]
            )
        except Exception as e:
            return CreateTaskComment(
                comment=None,
                success=False,
                errors=[f'Unexpected error: {str(e)}']
            )


class UpdateTaskComment(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        content = graphene.String(required=True)
    
    comment = graphene.Field(TaskCommentType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, id, content):
        try:
            comment = TaskComment.objects.get(id=id)
            comment.content = content
            
            comment.full_clean()
            comment.save()
            
            return UpdateTaskComment(
                comment=comment,
                success=True,
                errors=[]
            )
            
        except TaskComment.DoesNotExist:
            return UpdateTaskComment(
                comment=None,
                success=False,
                errors=['Comment not found']
            )
        except ValidationError as e:
            return UpdateTaskComment(
                comment=None,
                success=False,
                errors=[str(e)]
            )
        except Exception as e:
            return UpdateTaskComment(
                comment=None,
                success=False,
                errors=[f'Unexpected error: {str(e)}']
            )


class DeleteTaskComment(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
    
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, id):
        try:
            comment = TaskComment.objects.get(id=id)
            comment.delete()
            
            return DeleteTaskComment(
                success=True,
                errors=[]
            )
            
        except TaskComment.DoesNotExist:
            return DeleteTaskComment(
                success=False,
                errors=['Comment not found']
            )
        except Exception as e:
            return DeleteTaskComment(
                success=False,
                errors=[f'Error deleting comment: {str(e)}']
            )


class Mutation(graphene.ObjectType):
    """Root GraphQL mutation"""
    
    create_project = CreateProject.Field()  
    update_project = UpdateProject.Field()
    delete_project = DeleteProject.Field()
    
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    
    create_task_comment = CreateTaskComment.Field()
    update_task_comment = UpdateTaskComment.Field()
    delete_task_comment = DeleteTaskComment.Field()