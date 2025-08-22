import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { UPDATE_TASK, DELETE_TASK } from "../../graphql/mutations";
import type { Task, TaskStatus, TaskPriority } from "../../types";
import TaskForm from "./TaskForm";

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  organizationSlug: string;
}

export default function TaskCard({
  task,
  onUpdate,
  organizationSlug,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);

  const canChangeStatusTo = (newStatus: TaskStatus): boolean => {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      'TODO': ['IN_PROGRESS', 'BLOCKED'],
      'IN_PROGRESS': ['DONE', 'BLOCKED', 'TODO'],
      'BLOCKED': ['TODO'],
      'DONE': []
    };
    return validTransitions[task.status]?.includes(newStatus) || false;
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status || !canChangeStatusTo(newStatus)) return;

    setIsUpdating(true);
    try {
      const result = await updateTask({
        variables: {
          id: task.id,
          input: { status: newStatus },
        },
      });

      if (result.data?.updateTask?.success) {
        onUpdate();
      } else {
        alert(
          "Failed to update task: " +
            (result.data?.updateTask?.errors?.join(", ") || "Unknown error")
        );
      }
    } catch (error: any) {
      alert("Error updating task: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const result = await deleteTask({
        variables: { id: task.id },
      });

      if (result.data?.deleteTask?.success) {
        onUpdate();
      } else {
        alert(
          "Failed to delete task: " +
            (result.data?.deleteTask?.errors?.join(", ") || "Unknown error")
        );
      }
    } catch (error: any) {
      alert("Error deleting task: " + error.message);
    } finally {
      setIsMenuOpen(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = task.isOverdue;

  return (
    <>
      <div
        className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200/60 hover:shadow-md hover:border-gray-300/60 transition-all duration-200 relative ${
          isUpdating ? "opacity-50" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <Link
            to={`/${organizationSlug}/projects/${task.project.id}/tasks/${task.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 flex-1 leading-relaxed"
          >
            {task.title}
          </Link>
          <div className="relative ml-2 flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isUpdating}
            >
              <svg
                className="w-4 h-4 text-gray-500"
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
                  className="fixed inset-0 z-30"
                  onClick={() => setIsMenuOpen(false)}
                ></div>
                <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg z-40 border border-gray-200 overflow-hidden">
                  <div className="py-1">
                    <Link
                      to={`/${organizationSlug}/projects/${task.project.id}/tasks/${task.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => {
                        setIsEditModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit Task
                    </button>

                    {canChangeStatusTo("IN_PROGRESS") && (
                      <button
                        onClick={() => handleStatusChange("IN_PROGRESS")}
                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        Start Task
                      </button>
                    )}

                    {canChangeStatusTo("DONE") && (
                      <button
                        onClick={() => handleStatusChange("DONE")}
                        className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}

                    {canChangeStatusTo("TODO") && task.status !== "TODO" && (
                      <button
                        onClick={() => handleStatusChange("TODO")}
                        className="block w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        Move to Todo
                      </button>
                    )}

                    {canChangeStatusTo("BLOCKED") && (
                      <button
                        onClick={() => handleStatusChange("BLOCKED")}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Mark Blocked
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleDelete}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete Task
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {isOverdue && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-red-600 bg-red-100">
              Overdue
            </span>
          )}
        </div>

        <div className="space-y-2">
          {task.assigneeEmail && (
            <div className="flex items-center text-xs text-gray-600">
              <svg
                className="w-3 h-3 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="truncate">{task.assigneeEmail}</span>
            </div>
          )}

          {task.dueDate && (
            <div
              className={`flex items-center text-xs ${
                isOverdue ? "text-red-600" : "text-gray-600"
              }`}
            >
              <svg
                className="w-3 h-3 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}

          {task.commentCount > 0 && (
            <Link
              to={`/${organizationSlug}/projects/${task.project.id}/tasks/${task.id}`}
              className="flex items-center text-xs text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg
                className="w-3 h-3 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{task.commentCount} comments</span>
            </Link>
          )}
        </div>

        {isUpdating && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <TaskForm
          organizationSlug={organizationSlug}
          task={task}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
}