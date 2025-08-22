import React, { useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_ORGANIZATIONS } from '../../graphql/queries';
import { type Organization } from '../../types';

interface HeaderParams {
  organizationSlug: string;
  [key: string]: string | undefined;
}

const Header: React.FC = () => {
  const { organizationSlug } = useParams<HeaderParams>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: orgsData } = useQuery(GET_ORGANIZATIONS);
  const organizations: Organization[] = orgsData?.organizations || [];
  const currentOrg = organizations.find(org => org.slug === organizationSlug);

  if (!organizationSlug) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === 'overview') {
      return location.pathname === `/${organizationSlug}`;
    }
    return location.pathname.includes(path);
  };

  const navItems = [
    { label: 'Overview', path: 'overview', href: `/${organizationSlug}` },
    { label: 'Projects', path: 'projects', href: `/${organizationSlug}/projects` },
    { label: 'Tasks', path: 'tasks', href: `/${organizationSlug}/tasks` }
  ];

  const handleOrgSwitch = (orgSlug: string) => {
    setIsDropdownOpen(false);
    const currentPath = location.pathname.replace(`/${organizationSlug}`, '');
    navigate(`/${orgSlug}${currentPath}`);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/"
              className="text-xl font-bold text-gray-900 hover:text-gray-700"
            >
              Project Manager
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {currentOrg?.name.charAt(0).toUpperCase() || organizationSlug.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block">
                  {currentOrg?.name || organizationSlug.replace(/-/g, ' ')}
                </span>
                <svg
                  className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Switch Organization
                    </div>
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => handleOrgSwitch(org.slug)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                          org.slug === organizationSlug ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          org.slug === organizationSlug ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          <span className="text-xs font-bold text-white">
                            {org.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{org.name}</div>
                          <div className="text-xs text-gray-500">{org.projectCount} projects</div>
                        </div>
                        {org.slug === organizationSlug && (
                          <div className="ml-auto">
                            <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link
                        to="/"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>All Organizations</span>
                      </Link>
                      <a
                        href="http://localhost:8000/admin/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Django Admin</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <nav className="flex space-x-4 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;