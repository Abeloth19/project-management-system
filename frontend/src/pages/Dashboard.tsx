import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_PROJECTS, GET_ORGANIZATION_STATS } from "../graphql/queries";
import type { Project, OrganizationStats } from "../types";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";

interface DashboardParams {
  organizationSlug: string;
  [key: string]: string | undefined;
}

export default function Dashboard() {
  const { organizationSlug } = useParams<DashboardParams>();

  const {
    loading: projectsLoading,
    error: projectsError,
    data: projectsData,
  } = useQuery(GET_PROJECTS, {
    variables: { organizationSlug },
    skip: !organizationSlug,
  });

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

  if (projectsLoading || statsLoading) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <LoadingSpinner fullScreen text="Loading dashboard..." />
      </Layout>
    );
  }

  if (projectsError || statsError) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">
              {projectsError?.message || statsError?.message}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const projects: Project[] = projectsData?.projects || [];
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

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Projects
            </h2>
          </div>
          <div className="card-body">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No projects found. Create your first project to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 6).map((project) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <span
                        className={`badge ${getStatusBadgeClass(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {project.taskCount} tasks
                      </span>
                      <span className="text-gray-500">
                        {project.completionPercentage}% complete
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "badge-success";
    case "COMPLETED":
      return "badge-primary";
    case "ON_HOLD":
      return "badge-warning";
    case "CANCELLED":
      return "badge-danger";
    default:
      return "badge-gray";
  }
}