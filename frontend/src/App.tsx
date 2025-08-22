import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORGANIZATIONS } from "./graphql/queries";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);
  const { loading, error, data } = useQuery(GET_ORGANIZATIONS);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-4 mb-6">
            <a
              href="https://vitejs.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={viteLogo}
                className="h-16 w-16 hover:animate-bounce"
                alt="Vite logo"
              />
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={reactLogo}
                className="h-16 w-16 animate-spin"
                alt="React logo"
              />
            </a>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Project Management System
          </h1>
          <p className="text-lg text-gray-600">
            Built with Vite + React + TypeScript + Tailwind CSS + Apollo GraphQL
          </p>
        </div>

        <div className="card max-w-md mx-auto mb-8">
          <div className="card-body text-center">
            <button
              className="btn-primary mb-4"
              onClick={() => setCount((count) => count + 1)}
            >
              Count is {count}
            </button>
            <p className="text-gray-600 text-sm mb-4">
              Edit{" "}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                src/App.tsx
              </code>{" "}
              and save to test HMR
            </p>
          </div>
        </div>

        <div className="card mb-8">
          <div className="card-header">
            <h3 className="font-medium">GraphQL API Test</h3>
          </div>
          <div className="card-body">
            {loading && (
              <p className="text-gray-600">Loading organizations...</p>
            )}
            {error && <p className="text-red-600">Error: {error.message}</p>}
            {data && (
              <div>
                <p className="text-green-600 mb-2">
                  ✅ GraphQL connection successful!
                </p>
                <p className="text-sm text-gray-600">
                  Found {data.organizations.length} organizations
                </p>
                {data.organizations.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {data.organizations.map((org: any) => (
                      <div key={org.id} className="p-2 bg-gray-100 rounded">
                        <span className="font-medium">{org.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({org.slug})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="font-medium">Frontend</h3>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                <div className="badge-primary">React 18</div>
                <div className="badge-primary">TypeScript</div>
                <div className="badge-primary">Vite</div>
                <div className="badge-primary">Tailwind CSS</div>
                <div className="badge-primary">Apollo Client</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-medium">Backend</h3>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                <div className="badge-success">Django</div>
                <div className="badge-success">GraphQL</div>
                <div className="badge-success">PostgreSQL</div>
                <div className="badge-success">Multi-tenant</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-medium">Features</h3>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                <div className="badge-warning">Projects</div>
                <div className="badge-warning">Tasks</div>
                <div className="badge-warning">Comments</div>
                <div className="badge-warning">Dashboard</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
