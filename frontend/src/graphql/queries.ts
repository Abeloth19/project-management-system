import { gql } from "@apollo/client";

export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      slug
      contactEmail
      isActive
      projectCount
      activeProjectCount
      canBeDeleted
      createdAt
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query GetOrganization($slug: String!) {
    organization(slug: $slug) {
      id
      name
      slug
      contactEmail
      isActive
      projectCount
      activeProjectCount
      projectCompletionRate
      canBeDeleted
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects(
    $organizationSlug: String
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
      canBeCompleted
      canAddTasks
      statusColor
      createdAt
      updatedAt
      organization {
        id
        name
        slug
      }
    }
  }
`;

export const GET_PROJECT = gql`
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
      canBeCompleted
      canAddTasks
      statusColor
      createdAt
      updatedAt
      organization {
        id
        name
        slug
      }
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks(
    $organizationSlug: String
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
      priorityWeight
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
`;

export const GET_TASK = gql`
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
      priorityWeight
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
`;

export const GET_TASK_COMMENTS = gql`
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
`;

export const GET_ORGANIZATION_STATS = gql`
  query GetOrganizationStats($organizationSlug: String!) {
    organizationStats(organizationSlug: $organizationSlug) {
      projectStats {
        totalProjects
        activeProjects
        completedProjects
        onHoldProjects
        cancelledProjects
        completionRate
      }
      taskStats {
        totalTasks
        todoTasks
        inProgressTasks
        doneTasks
        blockedTasks
        overdueTasks
        completionRate
      }
      recentActivityCount
      activeUsersCount
    }
  }
`;

export const GET_PROJECT_STATS = gql`
  query GetProjectStats($organizationSlug: String!, $projectId: ID) {
    projectStats(organizationSlug: $organizationSlug, projectId: $projectId) {
      totalProjects
      activeProjects
      completedProjects
      onHoldProjects
      cancelledProjects
      completionRate
    }
  }
`;

export const GET_TASK_STATS = gql`
  query GetTaskStats($organizationSlug: String!, $projectId: ID) {
    taskStats(organizationSlug: $organizationSlug, projectId: $projectId) {
      totalTasks
      todoTasks
      inProgressTasks
      doneTasks
      blockedTasks
      overdueJasks
      completionRate
    }
  }
`;
