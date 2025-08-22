import { gql } from "@apollo/client";

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      project {
        id
        name
        description
        status
        dueDate
        organization {
          id
          name
          slug
        }
      }
      success
      errors
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: ProjectUpdateInput!) {
    updateProject(id: $id, input: $input) {
      project {
        id
        name
        description
        status
        dueDate
        taskCount
        completionPercentage
        isOverdue
        canBeCompleted
        canAddTasks
        statusColor
        updatedAt
      }
      success
      errors
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      success
      errors
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
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
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
    updateTask(id: $id, input: $input) {
      task {
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
        updatedAt
      }
      success
      errors
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      success
      errors
    }
  }
`;

export const CREATE_TASK_COMMENT = gql`
  mutation CreateTaskComment($input: TaskCommentInput!) {
    createTaskComment(input: $input) {
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
`;

export const UPDATE_TASK_COMMENT = gql`
  mutation UpdateTaskComment($id: ID!, $content: String!) {
    updateTaskComment(id: $id, content: $content) {
      comment {
        id
        content
        authorEmail
        updatedAt
      }
      success
      errors
    }
  }
`;

export const DELETE_TASK_COMMENT = gql`
  mutation DeleteTaskComment($id: ID!) {
    deleteTaskComment(id: $id) {
      success
      errors
    }
  }
`;
