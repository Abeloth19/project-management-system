import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_ORGANIZATION, GET_ORGANIZATION_STATS } from '../graphql/queries';
import { type Organization, type OrganizationStats } from '../types';
import Layout from '../components/common/Layout';
import ProjectList from '../components/projects/ProjectList';
import ProjectStats from '../components/projects/ProjectStats';
import TaskBoard from '../components/tasks/TaskBoard';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface DashboardParams {
  organizationSlug: string;
  [key: string]: string | undefined;
}

const Dashboard: React.FC = () => {
  const { organizationSlug } = useParams<DashboardParams>();
  const location = useLocation();
  
  const { data: orgData, loading: orgLoading, error: orgError } = useQuery(GET_ORGANIZATION, {
    variables: { slug: organizationSlug },
    skip: !organizationSlug
  });

  const { data: statsData, loading: statsLoading } = useQuery(GET_ORGANIZATION_STATS, {
    variables: { organizationSlug },
    skip: !organizationSlug
  });

  if (!organizationSlug) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Organization Not Found</h1>
          <p className="text-gray-600">No organization specified in the URL.</p>
        </div>
      </Layout>
    );
  }

  if (orgLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading organization..." />
        </div>
      </Layout>
    );
  }

  if (orgError || !orgData?.organization) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Organization Not Found</h1>
          <p className="text-gray-600 mb-4">
            The organization "{organizationSlug}" could not be found or may not be active.
          </p>
          <a href="/" className="btn-primary">
            Back to Organizations
          </a>
        </div>
      </Layout>
    );
  }

  const organization: Organization = orgData.organization;
  const stats: OrganizationStats = statsData?.organizationStats;
  
  const currentView = location.pathname.includes('/projects') ? 'projects' : 
                     location.pathname.includes('/tasks') ? 'tasks' : 'overview';

  const renderContent = () => {
    switch (currentView) {
      case 'projects':
        return <ProjectList organizationSlug={organizationSlug} />;
      case 'tasks':
        return <TaskBoard organizationSlug={organizationSlug} />;
      default:
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-lg border p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to {organization.name}
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your projects and tasks efficiently.
              </p>
            </div>

            {stats && !statsLoading && (
              <ProjectStats 
                organizationSlug={organizationSlug} 
              />
            )}

            <ProjectList organizationSlug={organizationSlug} />
          </div>
        );
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

export default Dashboard;