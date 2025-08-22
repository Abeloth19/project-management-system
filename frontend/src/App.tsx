import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ORGANIZATIONS } from "./graphql/queries";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";

function App() {
  const { loading, error, data } = useQuery(GET_ORGANIZATIONS);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Connection Error
          </h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <p className="text-sm text-gray-500">
            Make sure the Django backend is running at http://localhost:8000
          </p>
        </div>
      </div>
    );
  }

  const organizations = data?.organizations || [];

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={
              organizations.length > 0 ? (
                <Navigate to={`/${organizations[0].slug}`} replace />
              ) : (
                <WelcomePage />
              )
            }
          />
          <Route path="/:organizationSlug" element={<Dashboard />} />
          <Route
            path="/:organizationSlug/projects/:projectId"
            element={<ProjectDetail />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function WelcomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Project Management System
          </h1>
          <p className="text-lg text-gray-600">
            Built with React, TypeScript, and GraphQL
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No Organizations Found
            </h2>
            <p className="text-gray-600 mb-6">
              It looks like there are no organizations set up yet. Create your
              first organization in the Django admin panel to get started.
            </p>
            <div className="space-y-4">
              <a
                href="http://localhost:8000/admin/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full"
              >
                Open Django Admin
              </a>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary w-full"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-600 text-xl">📁</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Projects</h3>
            <p className="text-xs text-gray-500">Organize your work</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-success-600 text-xl">✅</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Tasks</h3>
            <p className="text-xs text-gray-500">Track progress</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-warning-600 text-xl">💬</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Comments</h3>
            <p className="text-xs text-gray-500">Collaborate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <button onClick={() => window.history.back()} className="btn-primary">
          Go Back
        </button>
      </div>
    </div>
  );
}

export default App;
