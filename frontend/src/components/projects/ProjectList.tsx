import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PROJECTS } from '../../graphql/queries';
import { type Project } from '../../types';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import SkeletonLoader from '../ui/SkeletonLoader';
import EmptyState from '../ui/EmptyState';
import ErrorAlert from '../ui/ErrorAlert';

interface ProjectListProps {
  organizationSlug: string;
}

const ProjectList: React.FC<ProjectListProps> = ({ organizationSlug }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
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

  const { 
    data, 
    loading: queryLoading, 
    error, 
    refetch 
  } = useQuery(GET_PROJECTS, {
    variables: { 
      organizationSlug,
      search: debouncedSearch || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined
    },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  const projects: Project[] = data?.projects || [];
  const isInitialLoad = queryLoading && projects.length === 0 && !debouncedSearch && statusFilter === 'ALL';
  const hasFilters = debouncedSearch || statusFilter !== 'ALL';

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !debouncedSearch || 
      project.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      project.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRetry = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert
          title="Failed to load projects"
          message={error.message}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage and track your organization's projects
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Project
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                Search Projects
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or description..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isSearching ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                    Searching...
                  </span>
                ) : (
                  `Showing ${filteredProjects.length} of ${projects.length} projects`
                )}
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div>
          {isInitialLoad ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonLoader type="card" count={6} />
            </div>
          ) : filteredProjects.length === 0 && !isSearching ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <EmptyState
                title={hasFilters ? 'No projects found' : 'No projects yet'}
                description={
                  hasFilters
                    ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                    : 'Get started by creating your first project to organize and track your work.'
                }
                action={{
                  label: hasFilters ? 'Clear Filters' : 'Create Your First Project',
                  onClick: () => hasFilters ? (setSearchTerm(''), setStatusFilter('ALL')) : setIsCreating(true)
                }}
                icon={
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                    <svg
                      className="h-8 w-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={hasFilters ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" : "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"}
                      />
                    </svg>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="space-y-6">
              {queryLoading && !isInitialLoad && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                    <span className="text-blue-800 font-medium">Refreshing projects...</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="transition-all duration-200"
                  >
                    <ProjectCard
                      project={project}
                      organizationSlug={organizationSlug}
                      onUpdate={() => refetch()}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isCreating && (
        <ProjectForm
          organizationSlug={organizationSlug}
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

export default ProjectList;