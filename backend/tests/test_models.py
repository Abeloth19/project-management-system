from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
from apps.organizations.models import Organization
from apps.projects.models import Project
from apps.tasks.models import Task, TaskComment


class OrganizationModelTest(TestCase):
    def setUp(self):
        self.org_data = {
            'name': 'Test Organization',
            'contact_email': 'test@example.com'
        }

    def test_organization_creation(self):
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(org.name, 'Test Organization')
        self.assertEqual(org.contact_email, 'test@example.com')
        self.assertTrue(org.is_active)
        self.assertIsNotNone(org.created_at)

    def test_slug_auto_generation(self):
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(org.slug, 'test-organization')

    def test_slug_uniqueness(self):
        org1 = Organization.objects.create(**self.org_data)
        self.assertEqual(org1.slug, 'test-organization')
        
        org2 = Organization.objects.create(
            name='Test Organization!',
            contact_email='test2@example.com'
        )
        self.assertEqual(org2.slug, 'test-organization-1')

    def test_custom_slug_validation(self):
        with self.assertRaises(ValidationError):
            org = Organization(name='admin', contact_email='test@example.com')
            org.full_clean()

    def test_name_length_validation(self):
        with self.assertRaises(ValidationError):
            org = Organization(name='a', contact_email='test@example.com')
            org.full_clean()

    def test_project_count_property(self):
        org = Organization.objects.create(**self.org_data)
        self.assertEqual(org.project_count, 0)
        
        Project.objects.create(
            organization=org,
            name='Test Project',
            description='A test project'
        )
        self.assertEqual(org.project_count, 1)

    def test_active_project_count_property(self):
        org = Organization.objects.create(**self.org_data)
        
        Project.objects.create(
            organization=org,
            name='Active Project',
            status='ACTIVE'
        )
        Project.objects.create(
            organization=org,
            name='Completed Project',
            status='COMPLETED'
        )
        
        self.assertEqual(org.active_project_count, 1)

    def test_can_be_deleted_method(self):
        org = Organization.objects.create(**self.org_data)
        self.assertTrue(org.can_be_deleted())
        
        Project.objects.create(
            organization=org,
            name='Test Project'
        )
        self.assertFalse(org.can_be_deleted())

    def test_project_completion_rate(self):
        org = Organization.objects.create(**self.org_data)
        
        Project.objects.create(
            organization=org,
            name='Project 1',
            status='COMPLETED'
        )
        Project.objects.create(
            organization=org,
            name='Project 2',
            status='ACTIVE'
        )
        
        self.assertEqual(org.get_project_completion_rate(), 50.0)


class ProjectModelTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Org',
            contact_email='test@example.com'
        )
        self.project_data = {
            'organization': self.org,
            'name': 'Test Project',
            'description': 'A test project'
        }

    def test_project_creation(self):
        project = Project.objects.create(**self.project_data)
        self.assertEqual(project.name, 'Test Project')
        self.assertEqual(project.organization, self.org)
        self.assertEqual(project.status, 'ACTIVE')
        self.assertIsNotNone(project.created_at)

    def test_project_str_method(self):
        project = Project.objects.create(**self.project_data)
        expected = f"{self.org.name} - {project.name}"
        self.assertEqual(str(project), expected)

    def test_task_count_property(self):
        project = Project.objects.create(**self.project_data)
        self.assertEqual(project.task_count, 0)
        
        Task.objects.create(
            project=project,
            title='Test Task',
            description='A test task'
        )
        self.assertEqual(project.task_count, 1)

    def test_completion_percentage(self):
        project = Project.objects.create(**self.project_data)
        
        Task.objects.create(
            project=project,
            title='Task 1',
            status='DONE'
        )
        Task.objects.create(
            project=project,
            title='Task 2',
            status='TODO'
        )
        
        self.assertEqual(project.completion_percentage, 50.0)

    def test_is_overdue_property(self):
        project = Project.objects.create(**self.project_data)
        yesterday = timezone.now().date() - timedelta(days=1)
        
        Project.objects.filter(id=project.id).update(due_date=yesterday)
        project.refresh_from_db()
        self.assertTrue(project.is_overdue)
        
        completed_project = Project.objects.create(
            organization=self.org,
            name='Completed Project',
            status='COMPLETED'
        )
        Project.objects.filter(id=completed_project.id).update(due_date=yesterday)
        completed_project.refresh_from_db()
        self.assertFalse(completed_project.is_overdue)

    def test_can_be_completed_method(self):
        project = Project.objects.create(**self.project_data)
        self.assertTrue(project.can_be_completed())
        
        Task.objects.create(
            project=project,
            title='Incomplete Task',
            status='TODO'
        )
        self.assertFalse(project.can_be_completed())

    def test_can_add_tasks_method(self):
        project = Project.objects.create(**self.project_data)
        self.assertTrue(project.can_add_tasks())
        
        project.status = 'COMPLETED'
        project.save()
        self.assertFalse(project.can_add_tasks())

    def test_unique_together_constraint(self):
        Project.objects.create(**self.project_data)
        
        with self.assertRaises(Exception):
            Project.objects.create(**self.project_data)

    def test_status_transition_validation(self):
        project = Project.objects.create(
            **self.project_data,
            status='COMPLETED'
        )
        
        project.status = 'ACTIVE'
        with self.assertRaises(ValidationError):
            project.full_clean()


class TaskModelTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project'
        )
        self.task_data = {
            'project': self.project,
            'title': 'Test Task',
            'description': 'A test task'
        }

    def test_task_creation(self):
        task = Task.objects.create(**self.task_data)
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.project, self.project)
        self.assertEqual(task.status, 'TODO')
        self.assertEqual(task.priority, 'MEDIUM')

    def test_task_str_method(self):
        task = Task.objects.create(**self.task_data)
        expected = f"{self.project.name} - {task.title}"
        self.assertEqual(str(task), expected)

    def test_comment_count_property(self):
        task = Task.objects.create(**self.task_data)
        self.assertEqual(task.comment_count, 0)
        
        TaskComment.objects.create(
            task=task,
            content='Test comment',
            author_email='test@example.com'
        )
        self.assertEqual(task.comment_count, 1)

    def test_is_overdue_property(self):
        task = Task.objects.create(**self.task_data)
        yesterday = timezone.now() - timedelta(days=1)
        
        Task.objects.filter(id=task.id).update(due_date=yesterday)
        task.refresh_from_db()
        self.assertTrue(task.is_overdue)
        
        completed_task = Task.objects.create(
            project=self.project,
            title='Completed Task',
            status='DONE'
        )
        Task.objects.filter(id=completed_task.id).update(due_date=yesterday)
        completed_task.refresh_from_db()
        self.assertFalse(completed_task.is_overdue)

    def test_can_start_property(self):
        task = Task.objects.create(**self.task_data)
        self.assertTrue(task.can_start)
        
        task.status = 'IN_PROGRESS'
        task.save()
        self.assertFalse(task.can_start)

    def test_is_completed_property(self):
        task = Task.objects.create(**self.task_data)
        self.assertFalse(task.is_completed)
        
        task.status = 'DONE'
        task.save()
        self.assertTrue(task.is_completed)

    def test_can_change_status_to_method(self):
        task = Task.objects.create(**self.task_data)
        
        self.assertTrue(task.can_change_status_to('IN_PROGRESS'))
        self.assertTrue(task.can_change_status_to('BLOCKED'))
        self.assertFalse(task.can_change_status_to('DONE'))

    def test_get_priority_weight_method(self):
        task = Task.objects.create(**self.task_data)
        self.assertEqual(task.get_priority_weight(), 2)
        
        task.priority = 'URGENT'
        self.assertEqual(task.get_priority_weight(), 4)

    def test_auto_assign_priority_method(self):
        tomorrow = timezone.now() + timedelta(days=1)
        task = Task.objects.create(
            **self.task_data,
            due_date=tomorrow
        )
        
        task.auto_assign_priority()
        self.assertEqual(task.priority, 'HIGH')

    def test_status_transition_validation(self):
        task = Task.objects.create(
            **self.task_data,
            status='DONE'
        )
        
        task.status = 'TODO'
        with self.assertRaises(ValidationError):
            task.full_clean()

    def test_assignee_email_validation(self):
        with self.assertRaises(ValidationError):
            task = Task(
                **self.task_data,
                assignee_email='test@tempmail.com'
            )
            task.full_clean()


class TaskCommentModelTest(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Org',
            contact_email='test@example.com'
        )
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project'
        )
        self.task = Task.objects.create(
            project=self.project,
            title='Test Task'
        )
        self.comment_data = {
            'task': self.task,
            'content': 'This is a test comment',
            'author_email': 'test@example.com'
        }

    def test_comment_creation(self):
        comment = TaskComment.objects.create(**self.comment_data)
        self.assertEqual(comment.content, 'This is a test comment')
        self.assertEqual(comment.task, self.task)
        self.assertEqual(comment.author_email, 'test@example.com')

    def test_comment_str_method(self):
        comment = TaskComment.objects.create(**self.comment_data)
        expected = f"Comment on {self.task.title} by {comment.author_email}"
        self.assertEqual(str(comment), expected)

    def test_empty_content_validation(self):
        with self.assertRaises(ValidationError):
            comment = TaskComment(
                task=self.task,
                content='   ',
                author_email='test@example.com'
            )
            comment.full_clean()

    def test_content_stripping(self):
        comment = TaskComment.objects.create(
            task=self.task,
            content='  Test content  ',
            author_email='test@example.com'
        )
        self.assertEqual(comment.content, 'Test content')