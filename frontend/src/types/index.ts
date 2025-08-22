export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  isActive: boolean;
  projectCount: number;
  activeProjectCount: number;
  projectCompletionRate?: number;
  canBeDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  organization: Organization;
  name: string;
  description: string;
  status: ProjectStatus;
  dueDate?: string;
  taskCount: number;
  completedTaskCount: number;
  completionPercentage: number;
  isOverdue: boolean;
  canBeCompleted: boolean;
  canAddTasks: boolean;
  statusColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  project: Project;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeEmail: string;
  dueDate?: string;
  commentCount: number;
  isOverdue: boolean;
  canStart: boolean;
  isCompleted: boolean;
  priorityWeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  task: Task;
  content: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  cancelledProjects: number;
  completionRate: number;
}

export interface TaskStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface OrganizationStats {
  projectStats: ProjectStats;
  taskStats: TaskStats;
  recentActivityCount: number;
  activeUsersCount: number;
}

export interface ProjectInput {
  organizationSlug: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
}

export interface TaskInput {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeEmail?: string;
  dueDate?: string;
}

export interface TaskCommentInput {
  taskId: string;
  content: string;
  authorEmail: string;
}

export interface MutationResponse<T = any> {
  success: boolean;
  errors: string[];
  data?: T;
}

export interface ProjectMutationResponse extends MutationResponse {
  project?: Project;
}

export interface TaskMutationResponse extends MutationResponse {
  task?: Task;
}

export interface TaskCommentMutationResponse extends MutationResponse {
  comment?: TaskComment;
}

export interface QueryFilters {
  organizationSlug?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeEmail?: string;
  search?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LoadingState {
  loading: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string[];
}

export interface User {
  email: string;
  name?: string;
  avatar?: string;
}

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AppContext {
  currentOrganization?: Organization;
  currentUser?: User;
  notifications: NotificationItem[];
  theme: 'light' | 'dark';
}

export interface RouteParams {
  organizationSlug?: string;
  projectId?: string;
  taskId?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: MenuItem[];
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'datetime' | 'number';
  placeholder?: string;
  options?: SelectOption[];
  validation?: ValidationRule;
  helpText?: string;
}

export interface DragDropItem {
  id: string;
  type: string;
  data: any;
}

export interface StatusBadgeProps {
  status: ProjectStatus | TaskStatus;
  size?: 'sm' | 'md' | 'lg';
}

export interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md' | 'lg';
}

export interface ProgressBarProps {
  value: number;
  max: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}