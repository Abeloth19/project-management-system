# API Documentation

This document provides comprehensive documentation for the Project Management System GraphQL API.

## 🌐 API Overview

- **Endpoint**: `http://localhost:8000/graphql/`
- **Type**: GraphQL API
- **Interactive Explorer**: `http://localhost:8000/graphql/` (GraphiQL)
- **Authentication**: None (development mode)
- **Multi-tenancy**: Organization-based data isolation

## 📋 Core Concepts

### Multi-Tenancy
All data operations are scoped by organization. Use `organizationSlug` parameter to access organization-specific data.

### Data Models
- **Organization**: Top-level tenant container
- **Project**: Belongs to organization, contains tasks
- **Task**: Belongs to project, has status workflow
- **TaskComment**: Belongs to task, enables collaboration

## 🔍 GraphQL Schema

### Core Types

#### Organization
```graphql
type Organization {
  id: ID!
  name: String!
  slug: String!
  contactEmail: String!
  projectCount: Int!
  activeProjectCount: Int!
  canBeDeleted: Boolean!
  createdAt: DateTime!
}
```

#### Project
```graphql
type Project {
  id: ID!
  organization: Organization!
  name: String!
  description: String!
  status: ProjectStatus!
  dueDate: Date
  taskCount: Int!
  completedTaskCount: Int!
  completionPercentage: Float!
  isOverdue: Boolean!
  canAddTasks: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ON_HOLD
  CANCELLED
}
```

#### Task
```graphql
type Task {
  id: ID!
  project: Project!
  title: String!
  description: String!
  status: TaskStatus!
  priority: TaskPriority!
  assigneeEmail: String!
  dueDate: DateTime
  commentCount: Int!
  isOverdue: Boolean!
  canStart: Boolean!
  isCompleted: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
  BLOCKED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### TaskComment
```graphql
type TaskComment {
  id: ID!
  task: Task!
  content: String!
  authorEmail: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Statistics Types

#### OrganizationStats
```graphql
type OrganizationStats {
  projectStats: ProjectStatsType!
  taskStats: TaskStatsType!
  recentActivityCount: Int!
  activeUsersCount: Int!
}

type ProjectStatsType {
  totalProjects: Int!
  activeProjects: Int!
  completedProjects: Int!
  onHoldProjects: Int!
  cancelledProjects: Int!
  completionRate: Float!
}

type TaskStatsType {
  totalTasks: Int!
  todoTasks: Int!
  inProgressTasks: Int!
  doneTasks: Int!
  blockedTasks: Int!
  overdueTasks: Int!
  completionRate: Float!
}
```

## 🔍 Queries

### Organization Queries

#### Get Single Organization
```graphql
query GetOrganization($slug: String!) {
  organization(slug: $slug) {
    id
    name
    slug
    contactEmail
    projectCount
    activeProjectCount
    canBeDeleted
    createdAt
  }
}
```

#### Get All Organizations
```graphql
query GetOrganizations {
  organizations {
    id
    name
    slug
    contactEmail
    projectCount
    activeProjectCount
    canBeDeleted
    createdAt
  }
}
```

#### Get Organization Statistics
```graphql
query GetOrganizationStats($organizationSlug: String!) {
  organizationStats(organizationSlug: $organizationSlug) {
    projectStats {
      totalProjects
      activeProjects
      completedProjects
      completionRate
    }
    taskStats {
      totalTasks
      todoTasks
      inProgressTasks
      doneTasks
      completionRate
    }
    recentActivityCount
    activeUsersCount
  }
}
```

### Project Queries

#### Get Projects for Organization
```graphql
query GetProjects(
  $organizationSlug: String!
  $status: String
  $search: String
) {
  projects(
    organizationSlug: $organizationSlug
    status: $status
    search: $search
  ) {
    id
    name
    description
    status
    dueDate
    taskCount
    completedTaskCount
    completionPercentage
    isOverdue
    canAddTasks
    createdAt
    updatedAt
    organization {
      id
      name
      slug
    }
  }
}
```

#### Get Single Project
```graphql
query GetProject($id: ID!) {
  project(id: $id) {
    id
    name
    description
    status
    dueDate
    taskCount
    completedTaskCount
    completionPercentage
    isOverdue
    canAddTasks
    createdAt
    updatedAt
    organization {
      id
      name
      slug
    }
  }
}
```

### Task Queries

#### Get Tasks for Organization/Project
```graphql
query GetTasks(
  $organizationSlug: String!
  $projectId: ID
  $status: String
  $priority: String
  $assigneeEmail: String
  $search: String
) {
  tasks(
    organizationSlug: $organizationSlug
    projectId: $projectId
    status: $status
    priority: $priority
    assigneeEmail: $assigneeEmail
    search: $search
  ) {
    id
    title
    description
    status
    priority
    assigneeEmail
    dueDate
    commentCount
    isOverdue
    canStart
    isCompleted
    createdAt
    updatedAt
    project {
      id
      name
      organization {
        slug
      }
    }
  }
}
```

#### Get Single Task
```graphql
query GetTask($id: ID!) {
  task(id: $id) {
    id
    title
    description
    status
    priority
    assigneeEmail
    dueDate
    commentCount
    isOverdue
    canStart
    isCompleted
    createdAt
    updatedAt
    project {
      id
      name
      organization {
        id
        name
        slug
      }
    }
  }
}
```

#### Get Task Comments
```graphql
query GetTaskComments($taskId: ID!) {
  taskComments(taskId: $taskId) {
    id
    content
    authorEmail
    createdAt
    updatedAt
    task {
      id
      title
    }
  }
}
```

## ✏️ Mutations

### Project Mutations

#### Create Project
```graphql
mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    project {
      id
      name
      description
      status
      dueDate
      organization {
        slug
      }
    }
    success
    errors
  }
}

# Input Type
input CreateProjectInput {
  organizationSlug: String!
  name: String!
  description: String
  status: String
  dueDate: Date
}
```

#### Update Project
```graphql
mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
  updateProject(id: $id, input: $input) {
    project {
      id
      name
      description
      status
      dueDate
      updatedAt
    }
    success
    errors
  }
}

# Input Type
input UpdateProjectInput {
  name: String
  description: String
  status: String
  dueDate: Date
}
```

#### Delete Project
```graphql
mutation DeleteProject($id: ID!) {
  deleteProject(id: $id) {
    success
    errors
  }
}
```

### Task Mutations

#### Create Task
```graphql
mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    task {
      id
      title
      description
      status
      priority
      assigneeEmail
      dueDate
      project {
        id
        name
      }
    }
    success
    errors
  }
}

# Input Type
input CreateTaskInput {
  projectId: ID!
  title: String!
  description: String
  status: String
  priority: String
  assigneeEmail: String
  dueDate: DateTime
}
```

#### Update Task
```graphql
mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
  updateTask(id: $id, input: $input) {
    task {
      id
      title
      description
      status
      priority
      assigneeEmail
      dueDate
      updatedAt
    }
    success
    errors
  }
}

# Input Type
input UpdateTaskInput {
  title: String
  description: String
  status: String
  priority: String
  assigneeEmail: String
  dueDate: DateTime
}
```

#### Delete Task
```graphql
mutation DeleteTask($id: ID!) {
  deleteTask(id: $id) {
    success
    errors
  }
}
```

### Comment Mutations

#### Create Comment
```graphql
mutation CreateComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    comment {
      id
      content
      authorEmail
      createdAt
      task {
        id
        title
      }
    }
    success
    errors
  }
}

# Input Type
input CreateCommentInput {
  taskId: ID!
  content: String!
  authorEmail: String!
}
```

#### Update Comment
```graphql
mutation UpdateComment($id: ID!, $input: UpdateCommentInput!) {
  updateComment(id: $id, input: $input) {
    comment {
      id
      content
      updatedAt
    }
    success
    errors
  }
}

# Input Type
input UpdateCommentInput {
  content: String!
}
```

#### Delete Comment
```graphql
mutation DeleteComment($id: ID!) {
  deleteComment(id: $id) {
    success
    errors
  }
}
```

## 🔄 Status Transitions

### Task Status Workflow
Tasks follow a specific status transition workflow:

```
TODO → IN_PROGRESS → DONE
  ↓         ↓         ↑
BLOCKED ────┘         │
  ↓                   │
TODO ─────────────────┘
```

**Valid Transitions:**
- `TODO` → `IN_PROGRESS`, `BLOCKED`
- `IN_PROGRESS` → `DONE`, `BLOCKED`, `TODO`
- `BLOCKED` → `TODO`
- `DONE` → (No transitions - completed tasks are final)

## 📝 Usage Examples

### Complete Workflow Example

```graphql
# 1. Get organizations
query {
  organizations {
    id
    name
    slug
  }
}

# 2. Create a project
mutation {
  createProject(input: {
    organizationSlug: "acme-corporation"
    name: "Website Redesign"
    description: "Complete overhaul of company website"
    status: "ACTIVE"
    dueDate: "2024-12-31"
  }) {
    project {
      id
      name
    }
    success
    errors
  }
}

# 3. Create a task
mutation {
  createTask(input: {
    projectId: "1"
    title: "Design wireframes"
    description: "Create detailed wireframes for all main pages"
    status: "TODO"
    priority: "HIGH"
    assigneeEmail: "designer@acme.com"
    dueDate: "2024-09-15T10:00:00Z"
  }) {
    task {
      id
      title
      status
    }
    success
    errors
  }
}

# 4. Update task status
mutation {
  updateTask(id: "1", input: {
    status: "IN_PROGRESS"
  }) {
    task {
      id
      status
      updatedAt
    }
    success
    errors
  }
}

# 5. Add comment
mutation {
  createComment(input: {
    taskId: "1"
    content: "Starting work on the wireframes today"
    authorEmail: "designer@acme.com"
  }) {
    comment {
      id
      content
      createdAt
    }
    success
    errors
  }
}
```

### Search and Filter Examples

```graphql
# Search projects
query {
  projects(
    organizationSlug: "acme-corporation"
    search: "website"
    status: "ACTIVE"
  ) {
    id
    name
    status
  }
}

# Filter tasks by priority and assignee
query {
  tasks(
    organizationSlug: "acme-corporation"
    priority: "HIGH"
    assigneeEmail: "designer@acme.com"
    status: "IN_PROGRESS"
  ) {
    id
    title
    priority
    assigneeEmail
    status
  }
}
```

## ⚠️ Error Handling

### Error Response Format
```json
{
  "data": {
    "createProject": {
      "project": null,
      "success": false,
      "errors": [
        "Project name is required",
        "Due date cannot be in the past"
      ]
    }
  }
}
```

### Common Error Types
- **Validation Errors**: Field validation failures
- **Permission Errors**: Organization access denied
- **Not Found Errors**: Resource doesn't exist
- **Business Logic Errors**: Status transition violations

## 🔒 Multi-Tenancy & Security

### Organization Isolation
- All queries filter by `organizationSlug`
- Data is completely isolated between organizations
- No cross-organization data access possible

### Data Access Patterns
```graphql
# ✅ Correct: Organization scoped
query {
  projects(organizationSlug: "acme-corporation") {
    id
    name
  }
}

# ❌ Not allowed: Cross-organization access
query {
  project(id: "other-org-project-id") {
    id
    name
  }
}
```

## 🧪 Testing with GraphiQL

Access the interactive GraphQL explorer at `http://localhost:8000/graphql/`

### Features:
- **Schema Explorer**: Browse all available types and fields
- **Query Builder**: Autocomplete and syntax highlighting
- **Documentation**: Inline documentation for all fields
- **History**: Save and replay queries

### Sample Test Queries:
1. Start with simple organization query
2. Create a project using mutations
3. Add tasks and comments
4. Test filtering and search
5. Verify data isolation between organizations

## 📊 Performance Considerations

### Query Optimization
- Use specific field selection
- Avoid deep nesting when possible
- Leverage GraphQL query complexity analysis
- Use database indexes for filtered fields

### Caching
- Apollo Client caches responses automatically
- Use cache-first policy for static data
- Implement cache invalidation on mutations

## 🔄 API Versioning

Currently using a single GraphQL endpoint without versioning. Future considerations:
- Schema evolution through field deprecation
- Additive changes (new fields/types)
- Breaking changes require new endpoint or versioned schema