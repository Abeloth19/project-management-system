import { useQuery } from "@apollo/client";
import { useParams, Link } from "react-router-dom";
import { GET_PROJECT, GET_TASKS } from "../graphql/queries";
import type { Project, Task } from "../types";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";

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

  const {
    loading: tasksLoading,
    error: tasksError,
    data: tasksData,
  } = useQuery(GET_TASKS, {
    variables: { projectId },
    skip: !projectId,
  });

  if (projectLoading || tasksLoading) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <LoadingSpinner fullScreen text="Loading project..." />
      </Layout>
    );
  }

  if (projectError || tasksError) {
    return (
      <Layout organizationSlug={organizationSlug}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">
              {projectError?.message || tasksError?.message}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const project: Project = projectData?.project;
  const tasks: Task[] = tasksData?.tasks || [];

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

  const todoTasks = tasks.filter((task) => task.status === "TODO");
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((task) => task.status === "DONE");
  const blockedTasks = tasks.filter((task) => task.status === "BLOCKED");

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TaskColumn
                title="To Do"
                tasks={todoTasks}
                bgColor="bg-gray-50"
              />
              <TaskColumn
                title="In Progress"
                tasks={inProgressTasks}
                bgColor="bg-blue-50"
              />
              <TaskColumn
                title="Done"
                tasks={doneTasks}
                bgColor="bg-green-50"
              />
              <TaskColumn
                title="Blocked"
                tasks={blockedTasks}
                bgColor="bg-red-50"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  bgColor: string;
}

function TaskColumn({ title, tasks, bgColor }: TaskColumnProps) {
  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {task.title}
              </h4>
              <span
                className={`badge-sm ${getPriorityBadgeClass(task.priority)}`}
              >
                {task.priority}
              </span>
            </div>
            {task.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              {task.assigneeEmail && (
                <span className="truncate">{task.assigneeEmail}</span>
              )}
              {task.commentCount > 0 && (
                <span className="flex items-center">
                  💬 {task.commentCount}
                </span>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No tasks</p>
          </div>
        )}
      </div>
    </div>
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

function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case "URGENT":
      return "badge-danger";
    case "HIGH":
      return "badge-warning";
    case "MEDIUM":
      return "badge-primary";
    case "LOW":
      return "badge-gray";
    default:
      return "badge-gray";
  }
}
