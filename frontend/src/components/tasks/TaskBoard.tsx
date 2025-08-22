import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_TASKS } from "../../graphql/queries";
import type { Task, TaskStatus, TaskPriority } from "../../types";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import LoadingSpinner from "../common/LoadingSpinner";

interface TaskBoardProps {
  organizationSlug: string;
  projectId?: string;
}

interface TaskColumn {
  status: TaskStatus;
  title: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

const columns: TaskColumn[] = [
  {
    status: "TODO",
    title: "To Do",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    icon: "📝",
  },
  {
    status: "IN_PROGRESS",
    title: "In Progress",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    icon: "🚀",
  },
  {
    status: "DONE",
    title: "Done",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    icon: "✅",
  },
  {
    status: "BLOCKED",
    title: "Blocked",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    icon: "🚫",
  },
];

export default function TaskBoard({
  organizationSlug,
  projectId,
}: TaskBoardProps) {
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">(
    "ALL"
  );
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>("TODO");

  const { loading, error, data, refetch } = useQuery(GET_TASKS, {
    variables: {
      organizationSlug,
      projectId,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      assigneeEmail: assigneeFilter || undefined,
      search: searchTerm || undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner text="Loading task board..." />
      </div>
    );
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
          <p className="text-lg font-medium">Error loading tasks</p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </div>
        <button onClick={() => refetch()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const tasks: Task[] = data?.tasks || [];
  const tasksByStatus = groupTasksByStatus(tasks);
  const uniqueAssignees = getUniqueAssignees(tasks);

  const handleCreateTask = (status: TaskStatus) => {
    setSelectedStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
          <p className="text-gray-600">Manage tasks across different stages</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as TaskPriority | "ALL")
            }
            className="input text-sm"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="input text-sm"
          >
            <option value="">All Assignees</option>
            {uniqueAssignees.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>

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
              placeholder="Search tasks..."
              className="input pl-10 text-sm"
            />
          </div>
        </div>
      </div>

      {loading && data && (
        <div className="text-center py-2">
          <LoadingSpinner size="sm" text="Updating..." />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            column={column}
            tasks={tasksByStatus[column.status] || []}
            onCreateTask={() => handleCreateTask(column.status)}
            onUpdateTask={() => refetch()}
            organizationSlug={organizationSlug}
            projectId={projectId}
          />
        ))}
      </div>

      {isCreateModalOpen && (
        <TaskForm
          organizationSlug={organizationSlug}
          projectId={projectId}
          initialStatus={selectedStatus}
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

interface TaskColumnProps {
  column: TaskColumn;
  tasks: Task[];
  onCreateTask: () => void;
  onUpdateTask: () => void;
  organizationSlug: string;
  projectId?: string;
}

function TaskColumn({
  column,
  tasks,
  onCreateTask,
  onUpdateTask,
  organizationSlug,
}: TaskColumnProps) {
  return (
    <div className={`${column.bgColor} rounded-lg p-4 h-fit min-h-96`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-xl mr-2">{column.icon}</span>
          <h3 className={`font-semibold ${column.textColor}`}>
            {column.title}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
            {tasks.length}
          </span>
          <button
            onClick={onCreateTask}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
            title="Add task"
          >
            <svg
              className="w-4 h-4 text-gray-600"
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
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-8 h-8 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No tasks</p>
            <button
              onClick={onCreateTask}
              className="text-xs text-gray-400 hover:text-gray-600 mt-2"
            >
              Add the first task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              organizationSlug={organizationSlug}
            />
          ))
        )}
      </div>
    </div>
  );
}

function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  return tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);
}

function getUniqueAssignees(tasks: Task[]): string[] {
  const assignees = tasks
    .map((task) => task.assigneeEmail)
    .filter((email) => email && email.trim() !== "");
  return Array.from(new Set(assignees));
}
