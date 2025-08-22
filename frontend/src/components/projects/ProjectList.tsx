import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_PROJECTS } from "../../graphql/queries";
import type { Project, ProjectStatus } from "../../types";
import ProjectCard from "./ProjectCard";
import ProjectForm from "./ProjectForm";
import LoadingSpinner from "../common/LoadingSpinner";

interface ProjectListProps {
  organizationSlug: string;
}

export default function ProjectList({ organizationSlug }: ProjectListProps) {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">(
    "ALL"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_PROJECTS, {
    variables: {
      organizationSlug,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: searchTerm || undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) {
    return <LoadingSpinner text="Loading projects..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium">Error loading projects</p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </div>
        <button onClick={() => refetch()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const projects: Project[] = data?.projects || [];
  const statusCounts = getStatusCounts(projects);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600">Manage your organization's projects</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Project
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          {(
            ["ALL", "ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"] as const
          ).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                statusFilter === status
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status === "ALL" ? "All" : status.replace("_", " ")}
              {status !== "ALL" && (
                <span className="ml-1 text-xs">
                  ({statusCounts[status] || 0})
                </span>
              )}
              {status === "ALL" && (
                <span className="ml-1 text-xs">({projects.length})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 max-w-xs">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {loading && data && (
        <div className="text-center py-4">
          <LoadingSpinner size="sm" text="Updating..." />
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your filters or search terms."
              : "Get started by creating your first project."}
          </p>
          {!searchTerm && statusFilter === "ALL" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              organizationSlug={organizationSlug}
              onUpdate={() => refetch()}
            />
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <ProjectForm
          organizationSlug={organizationSlug}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function getStatusCounts(projects: Project[]) {
  return projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<ProjectStatus, number>);
}
