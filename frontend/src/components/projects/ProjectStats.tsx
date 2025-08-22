import { useQuery } from "@apollo/client";
import { GET_ORGANIZATION_STATS } from "../../graphql/queries";
import type { OrganizationStats } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";

interface ProjectStatsProps {
  organizationSlug: string;
}

export default function ProjectStats({ organizationSlug }: ProjectStatsProps) {
  const { loading, error, data } = useQuery(GET_ORGANIZATION_STATS, {
    variables: {
      organizationSlug,
    },
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center">
          <LoadingSpinner size="sm" text="Loading stats..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center">
          <p className="text-red-600 text-sm">
            Error loading stats: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const stats: OrganizationStats = data?.organizationStats;

  if (!stats?.projectStats) {
    return null;
  }

  const projectStats = stats.projectStats;
  const taskStats = stats.taskStats;

  
  const completionRate = taskStats?.completionRate || 0;
  const completedTasks = taskStats?.doneTasks || 0;
  const totalTasks = taskStats?.totalTasks || 0;

  const statItems = [
    {
      label: "Total Projects",
      value: projectStats.totalProjects,
      color: "text-gray-900",
      bgColor: "bg-gray-100",
      icon: "📁",
    },
    {
      label: "Active",
      value: projectStats.activeProjects,
      color: "text-green-700",
      bgColor: "bg-green-100",
      icon: "🚀",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">
            Organization Statistics
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8">
            {statItems.map((item) => (
              <div key={item.label} className="text-center">
                <div
                  className={`w-16 h-16 ${item.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}
                >
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className={`text-3xl font-bold ${item.color} mb-1`}>
                  {item.value}
                </div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {totalTasks > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">
              Completion Rate
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress
              </span>
              <span className="text-lg font-bold text-gray-900">
                {Math.round(completionRate)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  completionRate >= 75
                    ? "bg-gradient-to-r from-green-500 to-green-600"
                    : completionRate >= 50
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                    : completionRate >= 25
                    ? "bg-gradient-to-r from-orange-500 to-orange-600"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                }`}
                style={{
                  width: `${Math.max(0, Math.min(completionRate, 100))}%`,
                }}
              ></div>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              {completedTasks} of {totalTasks} tasks completed across all
              projects
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
