import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import  client from './graphql/client';
import OrganizationSelect from './pages/OrganizationSelect';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import TaskDetail from './pages/TaskDetail';
import ErrorBoundary from './components/common/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<OrganizationSelect />} />
              <Route path="/:organizationSlug" element={<Dashboard />} />
              <Route path="/:organizationSlug/projects" element={<Dashboard />} />
              <Route path="/:organizationSlug/tasks" element={<Dashboard />} />
              <Route path="/:organizationSlug/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/:organizationSlug/projects/:projectId/tasks/:taskId" element={<TaskDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    </ApolloProvider>
  );
};

export default App;