import { useQuery } from "@apollo/client";
import { useParams, Link } from "react-router-dom";
import { GET_TASK } from "../graphql/queries";
import type { Task } from "../types";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CommentSection from "../components/tasks/CommentSection";

interface TaskDetailParams {
  organizationSlug: string;
  projectId: string;
  taskId: string;
  [key: string]: string | undefined;
}

export default function TaskDetail() {
  const { organizationSlug, projectId, taskId } = useParams<TaskDetailParams>();

  const { loading, error, data } = useQuery(GET_TASK, {
    variables: { id: taskId },
    skip: !taskId,
  });

  if (loading) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <LoadingSpinner fullScreen text="Loading task..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const task: Task = data?.task;

  if (!task) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Task Not Found
            </h1>
            <Link
              to={`/${organizationSlug}/projects/${projectId}`}
              className="btn-primary"
            >
              Back to Project
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600 bg-red-100";
      case "HIGH":
        return "text-orange-600 bg-orange-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "LOW":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "text-gray-700 bg-gray-100";
      case "IN_PROGRESS":
        return "text-blue-700 bg-blue-100";
      case "DONE":
        return "text-green-700 bg-green-100";
      case "BLOCKED":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  return (
    <Layout organizationSlug={organizationSlug}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to={`/${organizationSlug}`} className="hover:text-gray-700">
            Dashboard
          </Link>
          <span>/</span>
          <Link
            to={`/${organizationSlug}/projects/${task.project.id}`}
            className="hover:text-gray-700"
          >
            {task.project.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{task.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {task.title}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${getStatusColor(task.status)}`}>
                      {task.status.replace("_", " ")}
                    </span>
                    <span
                      className={`badge ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>

                {task.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {task.assigneeEmail && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Assignee
                      </h4>
                      <p className="text-gray-700">{task.assigneeEmail}</p>
                    </div>
                  )}

                  {task.dueDate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Due Date
                      </h4>
                      <p
                        className={`${
                          task.isOverdue ? "text-red-600" : "text-gray-700"
                        }`}
                      >
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        {task.isOverdue && (
                          <span className="ml-2 text-red-600 font-medium">
                            (Overdue)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Created {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Last updated{" "}
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <CommentSection taskId={task.id} taskTitle={task.title} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Project Info
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Project
                    </h4>
                    <Link
                      to={`/${organizationSlug}/projects/${task.project.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {task.project.name}
                    </Link>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Organization
                    </h4>
                    <p className="text-gray-700">
                      {task.project.organization.name}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Task Actions
                    </h4>
                    <div className="space-y-2">
                      {task.canStart && (
                        <button className="btn-primary w-full text-sm">
                          Start Task
                        </button>
                      )}

                      {task.status === "IN_PROGRESS" && (
                        <button className="btn-success w-full text-sm">
                          Mark Complete
                        </button>
                      )}

                      <Link
                        to={`/${organizationSlug}/projects/${task.project.id}`}
                        className="btn-secondary w-full text-sm inline-block text-center"
                      >
                        Back to Project
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
