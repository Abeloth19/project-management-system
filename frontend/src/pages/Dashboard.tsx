import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_ORGANIZATION_STATS } from "../graphql/queries";
import type { OrganizationStats } from "../types";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProjectList from "../components/projects/ProjectList";

interface DashboardParams {
  organizationSlug: string;
  [key: string]: string | undefined;
}

export default function Dashboard() {
  const { organizationSlug } = useParams<DashboardParams>();

  const {
    loading: statsLoading,
    error: statsError,
    data: statsData,
  } = useQuery(GET_ORGANIZATION_STATS, {
    variables: { organizationSlug },
    skip: !organizationSlug,
  });

  if (!organizationSlug) {
    return (
      <Layout showHeader={false}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Project Management
            </h1>
            <p className="text-gray-600">
              Please select an organization to get started.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (statsLoading) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <LoadingSpinner fullScreen text="Loading dashboard..." />
      </Layout>
    );
  }

  if (statsError) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{statsError?.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats: OrganizationStats = statsData?.organizationStats;

  return (
    <Layout organizationSlug={organizationSlug}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your projects and tasks for {organizationSlug}
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      Total Projects
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.projectStats.totalProjects}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 text-sm">📁</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      Active Projects
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.projectStats.activeProjects}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                      <span className="text-success-600 text-sm">🚀</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      Total Tasks
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.taskStats.totalTasks}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                      <span className="text-warning-600 text-sm">✅</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.taskStats.completionRate}%
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 text-sm">📊</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <ProjectList organizationSlug={organizationSlug} />
      </div>
    </Layout>
  );
}
