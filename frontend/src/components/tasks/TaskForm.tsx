import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_TASK, UPDATE_TASK } from "../../graphql/mutations";
import { GET_PROJECTS } from "../../graphql/queries";
import type {
  Task,
  TaskInput,
  TaskUpdateInput,
  TaskStatus,
  TaskPriority,
  Project,
} from "../../types";

interface TaskFormProps {
  organizationSlug: string;
  projectId?: string;
  task?: Task;
  initialStatus?: TaskStatus;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskForm({
  organizationSlug,
  projectId,
  task,
  initialStatus = "TODO",
  isOpen,
  onClose,
  onSuccess,
}: TaskFormProps) {
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    projectId: projectId || task?.project.id || "",
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || initialStatus,
    priority: task?.priority || ("MEDIUM" as TaskPriority),
    assigneeEmail: task?.assigneeEmail || "",
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: projectsData } = useQuery(GET_PROJECTS, {
    variables: { organizationSlug },
    skip: !!projectId || isEditing,
  });

  const [createTask] = useMutation(CREATE_TASK);
  const [updateTask] = useMutation(UPDATE_TASK);

  useEffect(() => {
    if (task) {
      setFormData({
        projectId: task.project.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeEmail: task.assigneeEmail,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      if (isEditing) {
        const updateInput: TaskUpdateInput = {
          title: formData.title,
          description: formData.description,
          status: formData.status as TaskStatus,
          priority: formData.priority,
          assigneeEmail: formData.assigneeEmail,
          dueDate: formData.dueDate || undefined,
        };

        const result = await updateTask({
          variables: {
            id: task.id,
            input: updateInput,
          },
        });

        if (result.data?.updateTask?.success) {
          onSuccess();
        } else {
          setErrors(
            result.data?.updateTask?.errors || ["Failed to update task"]
          );
        }
      } else {
        const createInput: TaskInput = {
          projectId: formData.projectId,
          title: formData.title,
          description: formData.description,
          status: formData.status as TaskStatus,
          priority: formData.priority,
          assigneeEmail: formData.assigneeEmail,
          dueDate: formData.dueDate || undefined,
        };

        const result = await createTask({
          variables: { input: createInput },
        });

        if (result.data?.createTask?.success) {
          onSuccess();
          if (!isEditing) {
            setFormData({
              projectId: projectId || "",
              title: "",
              description: "",
              status: initialStatus,
              priority: "MEDIUM",
              assigneeEmail: "",
              dueDate: "",
            });
          }
        } else {
          setErrors(
            result.data?.createTask?.errors || ["Failed to create task"]
          );
        }
      }
    } catch (error: any) {
      setErrors([error.message]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  if (!isOpen) return null;

  const projects: Project[] = projectsData?.projects || [];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? "Edit Task" : "Create New Task"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2 flex-shrink-0"
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
                  <div className="text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!projectId && !isEditing && (
              <div>
                <label className="label">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleChange("projectId", e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="input"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="input"
                rows={3}
                placeholder="Enter task description (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="input"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>

              <div>
                <label className="label">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  className="input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Assignee Email</label>
              <input
                type="email"
                value={formData.assigneeEmail}
                onChange={(e) => handleChange("assigneeEmail", e.target.value)}
                className="input"
                placeholder="Enter assignee email (optional)"
              />
            </div>

            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="input"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={
                isSubmitting ||
                !formData.title.trim() ||
                (!isEditing && !formData.projectId)
              }
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
