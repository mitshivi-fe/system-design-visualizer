"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Zap,
  Database,
  Clock,
} from "lucide-react";
import { useSimulationStore } from "@/lib/simulation/store";
import { formatNumber, formatDuration, cn } from "@/lib/utils";

interface MetricsDisplayProps {
  className?: string;
}

export function MetricsDisplay({ className }: MetricsDisplayProps) {
  const { metrics } = useSimulationStore();

  const metricsData = [
    {
      label: "Requests",
      value: metrics.totalRequests,
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Successful",
      value: metrics.successfulRequests,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Failed",
      value: metrics.failedRequests,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      hide: metrics.failedRequests === 0,
    },
    {
      label: "Cache Hits",
      value: metrics.cacheHits,
      icon: Zap,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      hide: metrics.cacheHits === 0 && metrics.cacheMisses === 0,
    },
    {
      label: "DB Queries",
      value: metrics.dbQueries,
      icon: Database,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      hide: metrics.dbQueries === 0,
    },
    {
      label: "Avg Latency",
      value: formatDuration(metrics.averageLatency),
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      hide: metrics.averageLatency === 0,
    },
  ];

  const visibleMetrics = metricsData.filter((m) => !m.hide);

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Metrics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {visibleMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className={cn(
                "rounded-lg p-3 border border-slate-200 dark:border-slate-700",
                metric.bgColor
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn("w-4 h-4", metric.color)} />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {metric.label}
                </span>
              </div>
              <motion.div
                className={cn("text-2xl font-bold", metric.color)}
                key={String(metric.value)}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {typeof metric.value === "number" ? formatNumber(metric.value) : metric.value}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Cache hit rate */}
      {(metrics.cacheHits > 0 || metrics.cacheMisses > 0) && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-900 dark:text-amber-300">
              Cache Hit Rate
            </span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-amber-200 dark:bg-amber-900/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500 dark:bg-amber-400"
              initial={{ width: 0 }}
              animate={{
                width: `${(metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
