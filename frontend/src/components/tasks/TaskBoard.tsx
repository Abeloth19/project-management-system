import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TASKS } from '../../graphql/queries';
import { type Task } from '../../types';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import SkeletonLoader from '../ui/SkeletonLoader';
import EmptyState from '../ui/EmptyState';
import ErrorAlert from '../ui/ErrorAlert';

interface TaskBoardProps {
  organizationSlug: string;
  projectId?: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ organizationSlug, projectId }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchTerm !== debouncedSearch) {
      setIsSearching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  const { data, loading: queryLoading, error, refetch } = useQuery(GET_TASKS, {
    variables: { 
      organizationSlug,
      projectId: projectId || undefined,
      search: debouncedSearch || undefined,
      priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
      assigneeEmail: assigneeFilter || undefined
    },
    fetchPolicy: 'cache-and-network'
  });

  const tasks: Task[] = data?.tasks || [];
  const isInitialLoad = queryLoading && tasks.length === 0 && !debouncedSearch && priorityFilter === 'ALL' && !assigneeFilter;
  const hasFilters = debouncedSearch || priorityFilter !== 'ALL' || assigneeFilter;

  const columns = [
    { 
      id: 'TODO', 
      title: 'To Do', 
      bgColor: 'from-slate-50 to-slate-100', 
      borderColor: 'border-slate-200',
      iconColor: 'text-slate-500',
      countBg: 'bg-slate-500'
    },
    { 
      id: 'IN_PROGRESS', 
      title: 'In Progress', 
      bgColor: 'from-blue-50 to-blue-100', 
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      countBg: 'bg-blue-500'
    },
    { 
      id: 'DONE', 
      title: 'Done', 
      bgColor: 'from-green-50 to-green-100', 
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      countBg: 'bg-green-500'
    },
    { 
      id: 'BLOCKED', 
      title: 'Blocked', 
      bgColor: 'from-red-50 to-red-100', 
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      countBg: 'bg-red-500'
    }
  ];

  const getTasksForColumn = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert
          title="Failed to load tasks"
          message={error.message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const totalTasks = tasks.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
            <p className="mt-2 text-lg text-gray-600">
              {totalTasks} tasks across all stages
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <label htmlFor="task-search" className="block text-sm font-semibold text-gray-700 mb-2">
                Search Tasks
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  id="task-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or description..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="assignee" className="block text-sm font-semibold text-gray-700 mb-2">
                Assignee
              </label>
              <input
                type="email"
                id="assignee"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                placeholder="Filter by email..."
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {hasFilters && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isSearching ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full mr-2"></div>
                    Searching tasks...
                  </span>
                ) : (
                  `Found ${totalTasks} tasks`
                )}
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPriorityFilter('ALL');
                  setAssigneeFilter('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {isInitialLoad ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonLoader type="card" count={4} />
          </div>
        ) : totalTasks === 0 && !isSearching ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <EmptyState
              title={hasFilters ? 'No tasks found' : 'No tasks yet'}
              description={
                hasFilters
                  ? 'Try adjusting your search or filter criteria to find tasks.'
                  : 'Create your first task to start organizing and tracking your project work.'
              }
              action={{
                label: hasFilters ? 'Clear Filters' : 'Create Your First Task',
                onClick: () => hasFilters ? (setSearchTerm(''), setPriorityFilter('ALL'), setAssigneeFilter('')) : setIsCreating(true)
              }}
              icon={
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200">
                  <svg
                    className="h-8 w-8 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={hasFilters ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"}
                    />
                  </svg>
                </div>
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            {queryLoading && !isInitialLoad && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full mr-3"></div>
                  <span className="text-indigo-800 font-medium">Refreshing tasks...</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {columns.map((column, columnIndex) => {
                const columnTasks = getTasksForColumn(column.id);
                return (
                  <div
                    key={column.id}
                    className={`bg-gradient-to-br ${column.bgColor} ${column.borderColor} border rounded-2xl p-6 min-h-96 transform transition-all duration-300 hover:shadow-lg`}
                    style={{ animationDelay: `${columnIndex * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-white/80 ${column.iconColor}`}>
                          {column.id === 'TODO' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          )}
                          {column.id === 'IN_PROGRESS' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {column.id === 'DONE' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {column.id === 'BLOCKED' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900">{column.title}</h4>
                      </div>
                      <span className={`${column.countBg} text-white text-sm px-3 py-1 rounded-full font-medium shadow-sm`}>
                        {columnTasks.length}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {columnTasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/80 ${column.iconColor} mb-3`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium">No tasks</p>
                          <p className="text-xs">in {column.title.toLowerCase()}</p>
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <div
                            key={task.id}
                            className="transition-all duration-200"
                          >
                            <TaskCard
                              task={task}
                              organizationSlug={organizationSlug}
                              onUpdate={() => refetch()}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isCreating && (
        <TaskForm
          organizationSlug={organizationSlug}
          projectId={projectId}
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default TaskBoard;