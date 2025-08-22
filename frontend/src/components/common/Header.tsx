import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ORGANIZATIONS } from "../../graphql/queries";
import type { Organization } from "../../types";

interface HeaderProps {
  organizationSlug?: string;
}

export default function Header({ organizationSlug }: HeaderProps) {
  const navigate = useNavigate();
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);

  const { data } = useQuery(GET_ORGANIZATIONS);
  const organizations: Organization[] = data?.organizations || [];
  const currentOrg = organizations.find((org) => org.slug === organizationSlug);

  const handleOrgChange = (newOrgSlug: string) => {
    setIsOrgMenuOpen(false);
    navigate(`/${newOrgSlug}`);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">PM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Project Manager
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {organizationSlug && (
              <>
                <Link
                  to={`/${organizationSlug}`}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to={`/${organizationSlug}/projects`}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Projects
                </Link>
                <Link
                  to={`/${organizationSlug}/tasks`}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Tasks
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {organizations.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200"
                >
                  <span>{currentOrg?.name || "Select Organization"}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isOrgMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsOrgMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                      <div className="py-1">
                        {organizations.map((org) => (
                          <button
                            key={org.id}
                            onClick={() => handleOrgChange(org.slug)}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                              org.slug === organizationSlug
                                ? "bg-primary-50 text-primary-700"
                                : "text-gray-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{org.name}</div>
                                <div className="text-xs text-gray-500">
                                  {org.projectCount} projects
                                </div>
                              </div>
                              {org.slug === organizationSlug && (
                                <svg
                                  className="w-4 h-4 text-primary-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 py-1">
                        <a
                          href="http://localhost:8000/admin/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Admin Panel
                          </div>
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">👤</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
