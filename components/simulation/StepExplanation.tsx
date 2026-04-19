"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/lib/simulation/store";
import { Info } from "lucide-react";
import { EventType } from "@/types/simulation";

interface StepExplanationProps {
  explanations?: Record<EventType, string>;
}

const defaultExplanations: Record<EventType, string> = {
  HTTP_REQUEST: "Client sends an HTTP request to the server",
  HTTP_RESPONSE: "Server responds with the requested data",
  DB_QUERY: "Server queries the database to retrieve or store data",
  DB_RESPONSE: "Database returns the query results",
  CACHE_CHECK: "Server checks if data exists in the cache for faster retrieval",
  CACHE_HIT: "Data found in cache! No database query needed - very fast response",
  CACHE_MISS: "Data not in cache - need to query the database",
  CACHE_WRITE: "Writing data to cache for future fast access",
  COMPUTE: "Server performing computation or business logic",
  HASH_GENERATE: "Generating a unique hash/short code for the URL",
  LOAD_BALANCE: "Load balancer distributes request across available servers",
  RATE_LIMIT_CHECK: "Checking if client has exceeded rate limits to prevent abuse",
  ANALYTICS_TRACK: "Tracking analytics data for monitoring and insights",
  MESSAGE_QUEUE: "Sending message to queue for asynchronous processing",
  FAN_OUT: "Broadcasting message to multiple recipients simultaneously",
};

export function StepExplanation({ explanations = {} }: StepExplanationProps) {
  const { processedEvents, timeline } = useSimulationStore();

  // Get the most recent event based on current time
  const currentEvent = processedEvents
    .filter((e) => e.timestamp <= timeline.currentTime)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

  const allExplanations = { ...defaultExplanations, ...explanations };

  return (
    <AnimatePresence mode="wait">
      {currentEvent ? (
        <motion.div
          key={currentEvent.id}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                What's Happening Now
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {allExplanations[currentEvent.type]}
              </p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 font-medium">
                  {currentEvent.type.replace(/_/g, " ")}
                </span>
                <span className="text-slate-500 dark:text-slate-500">
                  {currentEvent.source} → {currentEvent.target}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="waiting"
          className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="text-slate-500 dark:text-slate-500">
            Press Play to start the simulation and see step-by-step explanations
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
