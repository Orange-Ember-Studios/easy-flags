import React, { useState, useEffect } from "react";
import type { AnalyticsFilters } from "../AnalyticsManager";

interface ComparisonMetrics {
  evaluations: { current: number; previous: number; change: number };
  errorRate: { current: number; previous: number; change: number };
  responseTime: { current: number; previous: number; change: number };
  criticalEvents: { current: number; previous: number; change: number };
  failedOperations: { current: number; previous: number; change: number };
  avgActiveUsers: { current: number; previous: number; change: number };
}

interface ComparisonViewProps {
  filters: AnalyticsFilters;
}

const MetricCard: React.FC<{
  title: string;
  current: number;
  previous: number;
  change: number;
  unit: string;
  format?: (n: number) => string;
}> = ({ title, current, previous, change, unit, format = (n) => n.toString() }) => {
  const isPositive = change >= 0;
  const isGoodChange =
    title.includes("Error") || title.includes("Failed") ? !isPositive : isPositive;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h4 className="text-slate-400 text-sm mb-3">{title}</h4>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-slate-500">Current Period</p>
          <p className="text-2xl font-bold text-white">
            {format(current)}{unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Previous Period</p>
          <p className="text-lg text-slate-400">
            {format(previous)}{unit}
          </p>
        </div>
        <div
          className={`flex items-center gap-1 p-2 rounded ${
            isGoodChange
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">
            {isPositive ? "+" : ""}{change.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ComparisonView({ filters }: ComparisonViewProps) {
  const [metrics, setMetrics] = useState<ComparisonMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisonType, setComparisonType] = useState<
    "week_over_week" | "month_over_month" | "quarter_over_quarter"
  >("month_over_month");

  useEffect(() => {
    fetchComparisonData();
  }, [filters, comparisonType]);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        dateFrom: filters.dateRange.startDate,
        dateTo: filters.dateRange.endDate,
        comparisonType,
        ...(filters.spaceId && { spaceId: filters.spaceId }),
      });

      const response = await fetch(`/api/analytics/comparison?${params}`);
      if (!response.ok) throw new Error("Failed to fetch comparison data");

      const data = await response.json();
      setMetrics(data.metrics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-slate-400 flex items-center gap-2">
          <div className="animate-spin">⏳</div>
          Loading comparison data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Period Comparison Analysis</h2>
        <div className="flex gap-2">
          {(
            [
              "week_over_week",
              "month_over_month",
              "quarter_over_quarter",
            ] as const
          ).map((type) => (
            <button
              key={type}
              onClick={() => setComparisonType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                comparisonType === type
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {type === "week_over_week"
                ? "Week over Week"
                : type === "month_over_month"
                ? "Month over Month"
                : "Quarter over Quarter"}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Metrics Grid */}
      {metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Total Evaluations"
            current={metrics.evaluations.current}
            previous={metrics.evaluations.previous}
            change={metrics.evaluations.change}
            unit=""
            format={(n) => n.toLocaleString()}
          />
          <MetricCard
            title="Error Rate"
            current={metrics.errorRate.current}
            previous={metrics.errorRate.previous}
            change={metrics.errorRate.change}
            unit="%"
            format={(n) => n.toFixed(2)}
          />
          <MetricCard
            title="Avg Response Time"
            current={metrics.responseTime.current}
            previous={metrics.responseTime.previous}
            change={metrics.responseTime.change}
            unit="ms"
            format={(n) => n.toFixed(2)}
          />
          <MetricCard
            title="Critical Events"
            current={metrics.criticalEvents.current}
            previous={metrics.criticalEvents.previous}
            change={metrics.criticalEvents.change}
            unit=""
            format={(n) => n.toLocaleString()}
          />
          <MetricCard
            title="Failed Operations"
            current={metrics.failedOperations.current}
            previous={metrics.failedOperations.previous}
            change={metrics.failedOperations.change}
            unit=""
            format={(n) => n.toLocaleString()}
          />
          <MetricCard
            title="Avg Active Users"
            current={metrics.avgActiveUsers.current}
            previous={metrics.avgActiveUsers.previous}
            change={metrics.avgActiveUsers.change}
            unit=""
            format={(n) => n.toLocaleString()}
          />
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
          <p className="text-slate-400">No comparison data available</p>
        </div>
      )}

      {/* Insights */}
      {metrics && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
          <div className="space-y-3 text-slate-300 text-sm">
            {metrics.evaluations.change > 10 && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded border border-green-500/30">
                <span className="text-green-400 font-bold">+</span>
                <p>
                  Evaluations increased by{" "}
                  <span className="font-semibold">
                    {metrics.evaluations.change.toFixed(1)}%
                  </span>
                  compared to the previous period, indicating growing system usage
                </p>
              </div>
            )}

            {metrics.errorRate.change > 5 && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded border border-red-500/30">
                <span className="text-red-400 font-bold">⚠</span>
                <p>
                  Error rate increased by{" "}
                  <span className="font-semibold">
                    {metrics.errorRate.change.toFixed(1)}%
                  </span>
                  . Investigate potential issues in recent deployments
                </p>
              </div>
            )}

            {metrics.responseTime.change > 10 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded border border-yellow-500/30">
                <span className="text-yellow-400 font-bold">📊</span>
                <p>
                  Response time increased by{" "}
                  <span className="font-semibold">
                    {metrics.responseTime.change.toFixed(1)}%
                  </span>
                  . Consider performance optimization
                </p>
              </div>
            )}

            {metrics.criticalEvents.current > metrics.criticalEvents.previous * 1.5 && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded border border-red-500/30">
                <span className="text-red-400 font-bold">🚨</span>
                <p>
                  Critical events have increased significantly. Review security logs
                  and recent administrative changes
                </p>
              </div>
            )}

            {metrics.responseTime.change < -10 && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded border border-green-500/30">
                <span className="text-green-400 font-bold">✓</span>
                <p>
                  Response time improved by{" "}
                  <span className="font-semibold">
                    {Math.abs(metrics.responseTime.change).toFixed(1)}%
                  </span>
                  . Performance optimizations are effective
                </p>
              </div>
            )}

            {metrics.errorRate.change < -5 && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded border border-green-500/30">
                <span className="text-green-400 font-bold">✓</span>
                <p>
                  Error rate decreased by{" "}
                  <span className="font-semibold">
                    {Math.abs(metrics.errorRate.change).toFixed(1)}%
                  </span>
                  . System stability has improved
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
