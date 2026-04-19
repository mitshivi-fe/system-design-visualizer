"use client";

import { motion } from "framer-motion";
import { Database as DatabaseIcon } from "lucide-react";
import { ComponentState } from "@/types/simulation";
import { cn } from "@/lib/utils";

interface DatabaseProps {
  id: string;
  label: string;
  state?: ComponentState;
  position?: { x: number; y: number };
  queryCount?: number;
  entryCount?: number;
  className?: string;
  onClick?: () => void;
}

const stateColors = {
  idle: "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600",
  processing: "bg-purple-100 border-purple-400 dark:bg-purple-900/30 dark:border-purple-500",
  success: "bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-500",
  error: "bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-500",
};

const stateIconColors = {
  idle: "text-slate-600 dark:text-slate-400",
  processing: "text-purple-600 dark:text-purple-400",
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
};

export function Database({
  id,
  label,
  state = "idle",
  position,
  queryCount = 0,
  entryCount,
  className,
  onClick,
}: DatabaseProps) {
  return (
    <motion.div
      className={cn("inline-block", className)}
      style={position ? { position: "absolute", left: position.x, top: position.y } : {}}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      <div
        className={cn(
          "relative rounded-xl border-2 p-4 min-w-[140px] transition-all duration-300",
          stateColors[state],
          onClick && "cursor-pointer hover:shadow-lg hover:border-purple-500 dark:hover:border-purple-400"
        )}
        onClick={onClick}
        title={onClick ? "Click to learn more" : undefined}
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={
              state === "processing"
                ? {
                    y: [0, -2, 0],
                  }
                : {}
            }
            transition={{ duration: 0.6, repeat: state === "processing" ? Infinity : 0 }}
          >
            <DatabaseIcon className={cn("w-8 h-8", stateIconColors[state])} />
          </motion.div>

          <div className="text-center">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {label}
            </p>
            <div className="flex flex-col gap-0.5 mt-1">
              {queryCount > 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {queryCount} queries
                </p>
              )}
              {entryCount !== undefined && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {entryCount} entries
                </p>
              )}
            </div>
          </div>
        </div>

        {state === "processing" && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
