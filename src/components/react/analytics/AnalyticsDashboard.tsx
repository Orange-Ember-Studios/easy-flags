import { useState, useEffect } from "react";
import type {
  FlagUsageMetric,
  PerformanceMetric,
  FlagImpactAnalysis,
} from "@domain/entities";

interface AnalyticsDashboardProps {
  spaceId: string | undefined;
  environmentId?: string | undefined;
}

interface MetricsData {
  usageMetrics: FlagUsageMetric[];
  performanceMetrics: PerformanceMetric[];
  flagImpact?: FlagImpactAnalysis | null;
  loading: boolean;
  error?: string;
}

export default function AnalyticsDashboard({
  spaceId,
  environmentId,
}: AnalyticsDashboardProps) {
  const [metricsData, setMetricsData] = useState<MetricsData>({
    usageMetrics: [],
    performanceMetrics: [],
    loading: true,
  });

  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!spaceId) return;

    const fetchMetrics = async () => {
      try {
        setMetricsData((prev) => ({ ...prev, loading: true }));

        const params = new URLSearchParams({
          space_id: spaceId,
          metric_type: "usage",
          date_from: dateRange.from,
          date_to: dateRange.to,
          ...(environmentId && { environment_id: environmentId }),
        });

        const response = await fetch(`/api/analytics/metrics?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }

        const usageMetrics = await response.json();

        setMetricsData((prev) => ({
          ...prev,
          usageMetrics,
          loading: false,
        }));
      } catch (error) {
        setMetricsData((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          loading: false,
        }));
      }
    };

    fetchMetrics();
  }, [spaceId, environmentId, dateRange]);

  const calculateTotalStats = () => {
    if (metricsData.usageMetrics.length === 0) {
      return {
        totalEvaluations: 0,
        enabledPercentage: 0,
        avgResponseTime: 0,
        errorRate: 0,
      };
    }

    const total = metricsData.usageMetrics.reduce(
      (sum, m) => sum + m.total_evaluations,
      0,
    );
    const enabled = metricsData.usageMetrics.reduce(
      (sum, m) => sum + m.enabled_count,
      0,
    );
    const errors = metricsData.usageMetrics.reduce(
      (sum, m) => sum + m.error_count,
      0,
    );
    const avgTime =
      metricsData.usageMetrics.reduce(
        (sum, m) => sum + m.avg_evaluation_time_ms,
        0,
      ) / metricsData.usageMetrics.length;

    return {
      totalEvaluations: total,
      enabledPercentage: total > 0 ? ((enabled / total) * 100).toFixed(2) : 0,
      avgResponseTime: avgTime.toFixed(2),
      errorRate: total > 0 ? ((errors / total) * 100).toFixed(2) : 0,
    };
  };

  const stats = calculateTotalStats();

  return (
    <div className="space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-slate-400">
              Track and analyze feature flag usage and performance
            </p>
          </div>

          {/* Date Range Picker */}
          <div className="flex gap-4">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            />
          </div>
        </div>

        {/* Error State */}
        {metricsData.error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-300">Error: {metricsData.error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total Evaluations"
            value={metricsData.usageMetrics
              .reduce((sum, m) => sum + m.total_evaluations, 0)
              .toLocaleString()}
            subtext="Over selected period"
            icon="📊"
          />
          <StatCard
            title="Enabled %"
            value={`${stats.enabledPercentage}%`}
            subtext="Percentage enabled"
            icon="✅"
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats.avgResponseTime}ms`}
            subtext="Average latency"
            icon="⚡"
          />
          <StatCard
            title="Error Rate"
            value={`${stats.errorRate}%`}
            subtext="Errors in period"
            icon="⚠️"
          />
        </div>

        {/* Loading State */}
        {metricsData.loading && (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <p className="text-slate-400">Loading analytics data...</p>
          </div>
        )}

        {/* Metrics Table */}
        {!metricsData.loading && metricsData.usageMetrics.length > 0 && (
          <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-900">
              <h2 className="text-lg font-semibold text-white">
                Usage by Feature & Environment
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900">
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Metric Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Total Evals
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Enabled
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Disabled
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Errors
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">
                      Avg Time (ms)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metricsData.usageMetrics
                    .slice(0, 20)
                    .map((metric, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                      >
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {metric.metric_date}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {metric.total_evaluations.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-300">
                          {metric.enabled_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {metric.disabled_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-300">
                          {metric.error_count}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {metric.avg_evaluation_time_ms.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!metricsData.loading && metricsData.usageMetrics.length === 0 && (
          <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
            <p className="text-slate-400 mb-2">No analytics data available</p>
            <p className="text-slate-500 text-sm">
              Start using feature flags to see analytics data appear here
            </p>
          </div>
        )}
      </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: string;
}

function StatCard({ title, value, subtext, icon }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500">{subtext}</p>
    </div>
  );
}
