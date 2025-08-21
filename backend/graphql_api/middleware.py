from django.core.exceptions import PermissionDenied
from apps.organizations.models import Organization


class OrganizationMiddleware:
    def __init__(self, get_response=None):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def resolve(self, next, root, info, **args):
        context = info.context
        request = context if hasattr(context, 'META') else context.get('request')
        
        organization_slug = self._extract_organization_slug(args, info)
        
        if organization_slug:
            try:
                organization = Organization.objects.get(
                    slug=organization_slug, 
                    is_active=True
                )
                request.organization = organization
            except Organization.DoesNotExist:
                raise PermissionDenied("Organization not found or inactive")
        
        return next(root, info, **args)

    def _extract_organization_slug(self, args, info):
        if 'organization_slug' in args:
            return args['organization_slug']
        
        if hasattr(args.get('input'), 'organization_slug'):
            return args['input'].organization_slug
        
        field_name = info.field_name
        parent_type = str(info.parent_type)
        
        if field_name in ['projects', 'tasks', 'organization_stats', 'project_stats', 'task_stats']:
            return args.get('organization_slug')
        
        return None


class DataIsolationMiddleware:
    def __init__(self, get_response=None):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def resolve(self, next, root, info, **args):
        context = info.context
        request = context if hasattr(context, 'META') else context.get('request')
        
        if hasattr(request, 'organization'):
            self._apply_organization_filter(root, info, request.organization)
        
        return next(root, info, **args)

    def _apply_organization_filter(self, root, info, organization):
        field_name = info.field_name
        
        if field_name == 'projects' and root is None:
            info.context.organization_filter = {'organization': organization}
        elif field_name == 'tasks' and root is None:
            info.context.organization_filter = {'project__organization': organization}
        elif field_name == 'task_comments' and root is None:
            info.context.organization_filter = {'task__project__organization': organization}


class PermissionMiddleware:
    def __init__(self, get_response=None):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def resolve(self, next, root, info, **args):
        context = info.context
        request = context if hasattr(context, 'META') else context.get('request')
        
        self._check_permissions(info, request, args)
        
        return next(root, info, **args)

    def _check_permissions(self, info, request, args):
        field_name = info.field_name
        operation_type = info.operation.operation
        
        if operation_type == 'mutation':
            self._check_mutation_permissions(field_name, request, args)
        else:
            self._check_query_permissions(field_name, request, args)

    def _check_mutation_permissions(self, field_name, request, args):
        mutation_permissions = {
            'create_project': self._can_create_project,
            'update_project': self._can_update_project,
            'delete_project': self._can_delete_project,
            'create_task': self._can_create_task,
            'update_task': self._can_update_task,
            'delete_task': self._can_delete_task,
            'create_task_comment': self._can_create_comment,
            'update_task_comment': self._can_update_comment,
            'delete_task_comment': self._can_delete_comment,
        }
        
        permission_check = mutation_permissions.get(field_name)
        if permission_check and not permission_check(request, args):
            raise PermissionDenied(f"Permission denied for {field_name}")

    def _check_query_permissions(self, field_name, request, args):
        protected_queries = [
            'organization', 'organizations', 'projects', 'tasks', 
            'task_comments', 'organization_stats', 'project_stats', 'task_stats'
        ]
        
        if field_name in protected_queries:
            if not hasattr(request, 'organization') and 'organization_slug' in args:
                organization_slug = args.get('organization_slug')
                if not self._can_access_organization(request, organization_slug):
                    raise PermissionDenied("Access denied to organization data")

    def _can_create_project(self, request, args):
        if hasattr(args.get('input'), 'organization_slug'):
            org_slug = args['input'].organization_slug
            return self._can_access_organization(request, org_slug)
        return True

    def _can_update_project(self, request, args):
        return True

    def _can_delete_project(self, request, args):
        return True

    def _can_create_task(self, request, args):
        return True

    def _can_update_task(self, request, args):
        return True

    def _can_delete_task(self, request, args):
        return True

    def _can_create_comment(self, request, args):
        return True

    def _can_update_comment(self, request, args):
        return True

    def _can_delete_comment(self, request, args):
        return True

    def _can_access_organization(self, request, organization_slug):
        try:
            Organization.objects.get(slug=organization_slug, is_active=True)
            return True
        except Organization.DoesNotExist:
            return False


class GraphQLMiddleware:
    def __init__(self, get_response=None):
        self.get_response = get_response
        self.organization_middleware = OrganizationMiddleware()
        self.data_isolation_middleware = DataIsolationMiddleware()
        self.permission_middleware = PermissionMiddleware()

    def __call__(self, request):
        return self.get_response(request)

    def resolve(self, next, root, info, **args):
        result = self.organization_middleware.resolve(next, root, info, **args)
        result = self.data_isolation_middleware.resolve(lambda *a, **k: result, root, info, **args)
        result = self.permission_middleware.resolve(lambda *a, **k: result, root, info, **args)
        return result