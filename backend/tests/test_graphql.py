from django.test import TestCase
from graphene.test import Client
from graphql_api.schema import schema
from apps.organizations.models import Organization
from apps.projects.models import Project
from apps.tasks.models import Task, TaskComment


class GraphQLQueryTests(TestCase):
    def setUp(self):
        self.client = Client(schema)
        
        self.org1 = Organization.objects.create(
            name='Test Org 1',
            contact_email='test1@example.com'
        )
        self.org2 = Organization.objects.create(
            name='Test Org 2', 
            contact_email='test2@example.com'
        )
        
        self.project1 = Project.objects.create(
            organization=self.org1,
            name='Project 1',
            description='First project'
        )
        self.project2 = Project.objects.create(
            organization=self.org2,
            name='Project 2',
            description='Second project'
        )
        
        self.task1 = Task.objects.create(
            project=self.project1,
            title='Task 1',
            description='First task'
        )
        self.task2 = Task.objects.create(
            project=self.project2,
            title='Task 2',
            description='Second task'
        )

    def test_organizations_query(self):
        query = '''
        {
            organizations {
                id
                name
                slug
                projectCount
                activeProjectCount
            }
        }
        '''
        result = self.client.execute(query)
        
        self.assertIsNone(result.get('errors'))
        data = result['data']['organizations']
        self.assertEqual(len(data), 2)
        
        org_names = [org['name'] for org in data]
        self.assertIn('Test Org 1', org_names)
        self.assertIn('Test Org 2', org_names)

    def test_organization_by_slug_query(self):
        query = '''
        {
            organization(slug: "test-org-1") {
                id
                name
                slug
                projectCount
                canBeDeleted
            }
        }
        '''
        result = self.client.execute(query)
        
        self.assertIsNone(result.get('errors'))
        data = result['data']['organization']
        self.assertEqual(data['name'], 'Test Org 1')
        self.assertEqual(data['projectCount'], 1)
        self.assertFalse(data['canBeDeleted'])

    def test_projects_query_with_organization_filter(self):
        query = '''
        {
            projects(organizationSlug: "test-org-1") {
                id
                name
                organization {
                    name
                }
                taskCount
                completionPercentage
            }
        }
        '''
        result = self.client.execute(query)
        
        self.assertIsNone(result.get('errors'))
        data = result['data']['projects']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Project 1')
        self.assertEqual(data[0]['organization']['name'], 'Test Org 1')


class GraphQLMutationTests(TestCase):
    def setUp(self):
        self.client = Client(schema)
        
        self.org = Organization.objects.create(
            name='Test Organization',
            contact_email='test@example.com'
        )
        
        self.project = Project.objects.create(
            organization=self.org,
            name='Test Project',
            description='A test project'
        )

    def test_create_project_mutation(self):
        mutation = '''
        mutation {
            createProject(input: {
                organizationSlug: "test-organization"
                name: "New Project"
                description: "A new project"
                status: "ACTIVE"
            }) {
                project {
                    id
                    name
                    organization {
                        name
                    }
                }
                success
                errors
            }
        }
        '''
        result = self.client.execute(mutation)
        
        self.assertIsNone(result.get('errors'))
        data = result['data']['createProject']
        self.assertTrue(data['success'])
        self.assertEqual(data['errors'], [])
        self.assertEqual(data['project']['name'], 'New Project')
        self.assertEqual(data['project']['organization']['name'], 'Test Organization')

    def test_create_project_invalid_organization(self):
        mutation = '''
        mutation {
            createProject(input: {
                organizationSlug: "nonexistent-org"
                name: "New Project"
                description: "A new project"
            }) {
                project {
                    id
                    name
                }
                success
                errors
            }
        }
        '''
        result = self.client.execute(mutation)
        
        self.assertIsNone(result.get('errors'))
        data = result['data']['createProject']
        self.assertFalse(data['success'])
        self.assertIn('Organization not found', data['errors'])
        self.assertIsNone(data['project'])