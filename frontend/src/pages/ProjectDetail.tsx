import { useQuery } from "@apollo/client";
import { useParams, Link } from "react-router-dom";
import { GET_PROJECT } from "../graphql/queries";
import type { Project } from "../types";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import TaskBoard from "../components/tasks/TaskBoard";

interface ProjectDetailParams {
  organizationSlug: string;
  projectId: string;
  [key: string]: string | undefined;
}

export default function ProjectDetail() {
  const { organizationSlug, projectId } = useParams<ProjectDetailParams>();

  const {
    loading: projectLoading,
    error: projectError,
    data: projectData,
  } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
    skip: !projectId,
  });

  if (projectLoading) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <LoadingSpinner fullScreen text="Loading project..." />
      </Layout>
    );
  }

  if (projectError) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{projectError?.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const project: Project = projectData?.project;

  if (!project) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Project Not Found
            </h1>
            <Link to={`/${organizationSlug}`} className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout organizationSlug={organizationSlug}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to={`/${organizationSlug}`} className="hover:text-gray-700">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900">{project.name}</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {project.name}
              </h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                {project.status}
              </span>
              {project.dueDate && (
                <span className="text-sm text-gray-500">
                  Due: {new Date(project.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-primary-600">
                {project.taskCount}
              </div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-success-600">
                {project.completedTaskCount}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-warning-600">
                {project.taskCount - project.completedTaskCount}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <div className="text-2xl font-bold text-primary-600">
                {project.completionPercentage}%
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Task Board</h2>
          </div>
          <div className="card-body">
            <TaskBoard
              organizationSlug={organizationSlug!}
              projectId={project.id}
            />
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