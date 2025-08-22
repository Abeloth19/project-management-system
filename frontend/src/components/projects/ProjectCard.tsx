import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { DELETE_PROJECT } from "../../graphql/mutations";
import type { Project } from "../../types";

interface ProjectCardProps {
  project: Project;
  organizationSlug: string;
  onUpdate: () => void;
}

export default function ProjectCard({
  project,
  organizationSlug,
  onUpdate,
}: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteProject] = useMutation(DELETE_PROJECT);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteProject({
        variables: { id: project.id },
      });

      if (result.data?.deleteProject?.success) {
        onUpdate();
      } else {
        alert(
          "Failed to delete project: " +
            (result.data?.deleteProject?.errors?.join(", ") || "Unknown error")
        );
      }
    } catch (error: any) {
      alert("Error deleting project: " + error.message);
    } finally {
      setIsDeleting(false);
      setIsMenuOpen(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
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
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = project.isOverdue;
  const completionPercentage = project.completionPercentage;

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="card-body">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <Link
              to={`/${organizationSlug}/projects/${project.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors block truncate"
            >
              {project.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                {project.status.replace("_", " ")}
              </span>
              {isOverdue && <span className="badge-danger">Overdue</span>}
            </div>
          </div>

          <div className="relative ml-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              disabled={isDeleting}
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                ></div>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <div className="py-1">
                    <Link
                      to={`/${organizationSlug}/projects/${project.id}/edit`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Edit Project
                    </Link>
                    <Link
                      to={`/${organizationSlug}/projects/${project.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View Details
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete Project"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {project.description}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium text-gray-900">
              {completionPercentage}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                completionPercentage === 100 ? "bg-green-500" : "bg-primary-600"
              }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tasks</span>
              <div className="font-medium text-gray-900">
                {project.completedTaskCount} / {project.taskCount}
              </div>
            </div>
            {project.dueDate && (
              <div>
                <span className="text-gray-500">Due Date</span>
                <div
                  className={`font-medium ${
                    isOverdue ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {formatDate(project.dueDate)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Updated {formatDate(project.updatedAt)}
            </div>

            <Link
              to={`/${organizationSlug}/projects/${project.id}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
