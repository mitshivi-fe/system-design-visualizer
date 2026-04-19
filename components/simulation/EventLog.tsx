"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/lib/simulation/store";
import { EventType } from "@/types/simulation";
import { formatDuration, cn } from "@/lib/utils";
import { Filter } from "lucide-react";

interface EventLogProps {
  className?: string;
  maxHeight?: string;
}

const eventTypeColors: Record<EventType, string> = {
  HTTP_REQUEST: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  HTTP_RESPONSE: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  DB_QUERY: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  DB_RESPONSE: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  CACHE_CHECK: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  CACHE_HIT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  CACHE_MISS: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  CACHE_WRITE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  COMPUTE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  HASH_GENERATE: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  LOAD_BALANCE: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  RATE_LIMIT_CHECK: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  ANALYTICS_TRACK: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
  MESSAGE_QUEUE: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
  FAN_OUT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export function EventLog({ className, maxHeight = "400px" }: EventLogProps) {
  const { processedEvents, seekTo } = useSimulationStore();
  const [selectedTypes, setSelectedTypes] = useState<Set<EventType>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events are added
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [processedEvents.length]);

  const uniqueEventTypes = Array.from(
    new Set(processedEvents.map((e) => e.type))
  );

  const filteredEvents =
    selectedTypes.size > 0
      ? processedEvents.filter((e) => selectedTypes.has(e.type))
      : processedEvents;

  const toggleEventType = (type: EventType) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedTypes(newSet);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Event Log ({filteredEvents.length})
        </h3>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            showFilter
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          )}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showFilter && (
          <motion.div
            className="mb-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Filter by event type:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {uniqueEventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleEventType(type)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium transition-all",
                    selectedTypes.has(type)
                      ? eventTypeColors[type]
                      : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                  )}
                >
                  {type}
                </button>
              ))}
              {selectedTypes.size > 0 && (
                <button
                  onClick={() => setSelectedTypes(new Set())}
                  className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={logRef}
        className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-2 space-y-1"
        style={{ maxHeight }}
      >
        <AnimatePresence initial={false}>
          {filteredEvents.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 dark:text-slate-600 text-sm">
              No events yet
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className="flex items-start gap-2 p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => seekTo(event.timestamp)}
              >
                <span className="text-xs font-mono text-slate-500 dark:text-slate-500 min-w-[60px]">
                  {formatDuration(event.timestamp)}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
                    eventTypeColors[event.type]
                  )}
                >
                  {event.type}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">
                  {event.source} → {event.target}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
