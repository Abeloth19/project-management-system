import { useQuery } from "@apollo/client";
import { GET_PROJECT_STATS } from "../../graphql/queries";
import type { ProjectStats } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";

interface ProjectStatsProps {
  organizationSlug: string;
  projectId?: string;
}

export default function ProjectStats({
  organizationSlug,
  projectId,
}: ProjectStatsProps) {
  const { loading, error, data } = useQuery(GET_PROJECT_STATS, {
    variables: {
      organizationSlug,
      projectId,
    },
  });

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <LoadingSpinner size="sm" text="Loading stats..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p className="text-red-600 text-sm">Error loading stats</p>
        </div>
      </div>
    );
  }

  const stats: ProjectStats = data?.projectStats;

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      label: "Total Projects",
      value: stats.totalProjects,
      color: "text-gray-900",
      bgColor: "bg-gray-100",
      icon: "📁",
    },
    {
      label: "Active",
      value: stats.activeProjects,
      color: "text-green-700",
      bgColor: "bg-green-100",
      icon: "🚀",
    },
    {
      label: "Completed",
      value: stats.completedProjects,
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      icon: "✅",
    },
    {
      label: "On Hold",
      value: stats.onHoldProjects,
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      icon: "⏸️",
    },
    {
      label: "Cancelled",
      value: stats.cancelledProjects,
      color: "text-red-700",
      bgColor: "bg-red-100",
      icon: "❌",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            {projectId ? "Project Statistics" : "Organization Statistics"}
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statItems.map((item) => (
              <div key={item.label} className="text-center">
                <div
                  className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center mx-auto mb-2`}
                >
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {stats.totalProjects > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Completion Rate
            </h3>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.completionRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  stats.completionRate >= 75
                    ? "bg-green-500"
                    : stats.completionRate >= 50
                    ? "bg-yellow-500"
                    : stats.completionRate >= 25
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {stats.completedProjects} of {stats.totalProjects} projects
              completed
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
