import React from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_ORGANIZATIONS } from '../graphql/queries';
import { type Organization } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrganizationSelect: React.FC = () => {
  const { data, loading, error } = useQuery(GET_ORGANIZATIONS);

  const organizations: Organization[] = data?.organizations || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading organizations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Organizations</h1>
          <p className="text-gray-600">{error.message}</p>
          <a 
            href="http://localhost:8000/admin/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 inline-block btn-primary"
          >
            Open Django Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Project Management System
          </h1>
          <p className="text-xl text-gray-600">
            Select an organization to manage projects and tasks
          </p>
        </div>

        {organizations.length === 0 ? (
          <div className="text-center bg-white rounded-lg border p-12">
            <div className="mb-6">
              <svg
                className="h-16 w-16 text-gray-400 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0v-4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Organizations Found</h2>
            <p className="text-gray-600 mb-8">
              Create your first organization to get started with project management.
            </p>
            <div className="space-y-4">
              <a 
                href="http://localhost:8000/admin/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Open Django Admin to Create Organization
              </a>
              <div className="text-sm text-gray-500">
                <p>Or run the sample data command:</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  python manage.py create_sample_data
                </code>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Link
                key={org.id}
                to={`/${org.slug}`}
                className="bg-white rounded-lg border hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-6 block"
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {org.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {org.contactEmail}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Projects:</span>
                    <span className="font-medium">{org.projectCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Projects:</span>
                    <span className="font-medium">{org.activeProjectCount || 0}</span>
                  </div>
                </div>

                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Enter Organization →
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <a 
            href="http://localhost:8000/admin/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Django Admin Panel →
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSelect;