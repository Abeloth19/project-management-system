import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

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
          <p className="text-lg text-red-700">
            Built with Vite + React + TypeScript + Tailwind CSS
          </p>
        </div>

        <div className="card max-w-md mx-auto">
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
