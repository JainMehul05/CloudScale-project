"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Edit,
  Trash2,
  Archive,
  Rocket,
  CheckCircle2,
  XCircle,
  Square,
  RotateCcw,
  Key,
  Activity,
  Loader2,
} from "lucide-react";
import { cn, componentStyles } from "@/lib/design-system";
import { ActivityAction, getActivityActionLabel, getActivityActionIcon, getActivityActionColor } from "@/lib/activity";

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  metadata: unknown;
  createdAt: string;
}

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  Plus,
  Edit,
  Trash2,
  Archive,
  Rocket,
  CheckCircle2,
  XCircle,
  Square,
  RotateCcw,
  Key,
  Activity,
  Loader2,
};

export function ActivityFeed({ limit = 10, showHeader = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchActivities = useCallback(async (reset = false) => {
    try {
      const newOffset = reset ? 0 : offset;
      const params = new URLSearchParams({
        limit: String(limit + 1),
        offset: String(newOffset),
      });
      const res = await fetch(`/api/activity?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const logs = data.logs || [];

      if (reset) {
        setActivities(logs.slice(0, limit));
      } else {
        setActivities((prev) => [...prev, ...logs.slice(0, limit)]);
      }

      setHasMore(logs.length > limit);
      if (!reset) setOffset((prev) => prev + limit);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [offset, limit]);

  useEffect(() => {
    fetchActivities(true);
  }, [fetchActivities]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchActivities(false);
    }
  };

  const getIcon = (action: string) => {
    const iconName = getActivityActionIcon(action as ActivityAction);
    return ICON_COMPONENTS[iconName] || Activity;
  };

  const getColor = (action: string) => getActivityActionColor(action as ActivityAction);

  if (isLoading && activities.length === 0) {
    return (
      <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-4")}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-1/4 bg-white/5 rounded" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "p-8 text-center")}>
        <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">No activity yet</p>
        <p className="text-xs text-zinc-600 mt-1">Your recent actions will appear here</p>
      </div>
    );
  }

  return (
    <div className={cn(componentStyles.card.base, componentStyles.card.elevated, "overflow-hidden")}>
      {showHeader && (
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white">Recent Activity</h3>
        </div>
      )}
      <div className="divide-y divide-white/5">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                `bg-[${getColor(activity.action)}]/15 border border-[${getColor(activity.action)}]/30`
              )}
            >
              {(() => {
                const IconComponent = getIcon(activity.action);
                return <IconComponent className={cn("w-4 h-4", getColor(activity.action))} />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {getActivityActionLabel(activity.action as ActivityAction)}
              </p>
              {(() => {
                const meta = activity.metadata;
                if (meta && typeof meta === "object" && meta !== null && "name" in meta) {
                  return <p className="text-xs text-zinc-400 mt-0.5 font-mono">{String((meta as Record<string, unknown>).name)}</p>;
                }
                return null;
              })()}
              <p className="text-xs text-zinc-500 mt-1">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      {hasMore && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium",
              "text-zinc-400 hover:text-white hover:bg-white/5 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}