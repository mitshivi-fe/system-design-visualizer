"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Server as ServerIcon, Database as DatabaseIcon, Zap, Network, User, Hash } from "lucide-react";
import { ComponentType } from "@/types/simulation";

interface ComponentInfo {
  name: string;
  description: string;
  purpose: string;
  keyFeatures: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const componentInfoData: Record<ComponentType, ComponentInfo> = {
  client: {
    name: "Client",
    description: "The user or application making requests to the system",
    purpose: "Initiates requests to create short URLs or access existing ones",
    keyFeatures: [
      "Sends HTTP requests to the load balancer",
      "Receives shortened URLs or redirects",
      "Subject to rate limiting to prevent abuse",
    ],
    icon: User,
  },
  server: {
    name: "API Server",
    description: "Application server that handles business logic and coordinates between components",
    purpose: "Processes requests, manages URL creation/retrieval, and coordinates with cache and database",
    keyFeatures: [
      "Validates incoming requests",
      "Checks cache before database",
      "Generates/validates short codes",
      "Tracks analytics events",
    ],
    icon: ServerIcon,
  },
  database: {
    name: "Database (PostgreSQL)",
    description: "Persistent storage for URL mappings and analytics data",
    purpose: "Stores the permanent mapping between short codes and original URLs",
    keyFeatures: [
      "Indexed short_code column for fast lookups",
      "Stores URL metadata (creation time, user, etc.)",
      "Handles billions of records with sharding",
      "Tracks analytics and click data",
    ],
    icon: DatabaseIcon,
  },
  cache: {
    name: "Redis Cache",
    description: "In-memory data store for frequently accessed URL mappings",
    purpose: "Dramatically speeds up redirects by avoiding database queries",
    keyFeatures: [
      "Sub-millisecond lookup times",
      "Cache-aside pattern (check cache first)",
      "TTL-based expiration for popular URLs",
      "Reduces database load by 80-90%",
    ],
    icon: Zap,
  },
  load_balancer: {
    name: "Load Balancer",
    description: "Distributes incoming traffic across multiple API servers",
    purpose: "Ensures high availability and even distribution of load",
    keyFeatures: [
      "Round-robin or least-connections algorithm",
      "Health checks on backend servers",
      "SSL termination",
      "Horizontal scaling support",
    ],
    icon: Network,
  },
  queue: {
    name: "Message Queue",
    description: "Asynchronous messaging system for background tasks",
    purpose: "Handles non-critical tasks without blocking the main request",
    keyFeatures: [
      "Decouples services",
      "Ensures reliable delivery",
      "Enables horizontal scaling",
      "Handles analytics and notifications",
    ],
    icon: Network,
  },
  hash_generator: {
    name: "Hash Generator",
    description: "Service that creates unique short codes for URLs",
    purpose: "Generates collision-free, short, URL-safe identifiers",
    keyFeatures: [
      "Base62 encoding (a-z, A-Z, 0-9)",
      "7-character codes = 3.5 trillion combinations",
      "MD5 hash with collision detection",
      "Can also use auto-incrementing IDs",
    ],
    icon: Hash,
  },
};

interface ComponentInfoModalProps {
  componentType: ComponentType | null;
  componentLabel: string;
  onClose: () => void;
}

export function ComponentInfoModal({
  componentType,
  componentLabel,
  onClose,
}: ComponentInfoModalProps) {
  if (!componentType) return null;

  const info = componentInfoData[componentType];
  const Icon = info.icon;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{info.name}</h2>
                  <p className="text-blue-100 text-sm">{componentLabel}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-blue-50 leading-relaxed">{info.description}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Purpose */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                Purpose
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {info.purpose}
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">
                Key Features
              </h3>
              <ul className="space-y-2">
                {info.keyFeatures.map((feature, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3 text-slate-600 dark:text-slate-400"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                    <span className="leading-relaxed">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-500 text-center">
                Click anywhere outside this panel to close
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
