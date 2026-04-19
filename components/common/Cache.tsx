"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { ComponentState } from "@/types/simulation";
import { cn } from "@/lib/utils";

interface CacheProps {
  id: string;
  label: string;
  state?: ComponentState;
  position?: { x: number; y: number };
  hits?: number;
  misses?: number;
  entryCount?: number;
  className?: string;
  onClick?: () => void;
}

const stateColors = {
  idle: "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600",
  processing: "bg-amber-100 border-amber-400 dark:bg-amber-900/30 dark:border-amber-500",
  success: "bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-500",
  error: "bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-500",
};

const stateIconColors = {
  idle: "text-slate-600 dark:text-slate-400",
  processing: "text-amber-600 dark:text-amber-400",
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
};

export function Cache({
  id,
  label,
  state = "idle",
  position,
  hits = 0,
  misses = 0,
  entryCount,
  className,
  onClick,
}: CacheProps) {
  const total = hits + misses;
  const hitRate = total > 0 ? ((hits / total) * 100).toFixed(0) : 0;

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
          onClick && "cursor-pointer hover:shadow-lg hover:border-amber-500 dark:hover:border-amber-400"
        )}
        onClick={onClick}
        title={onClick ? "Click to learn more" : undefined}
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={
              state === "processing"
                ? {
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{ duration: 0.3, repeat: state === "processing" ? Infinity : 0 }}
          >
            <Zap
              className={cn("w-8 h-8", stateIconColors[state])}
              fill={state === "processing" ? "currentColor" : "none"}
            />
          </motion.div>

          <div className="text-center">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {label}
            </p>
            <div className="flex flex-col gap-0.5 mt-1">
              {total > 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {hitRate}% hit rate
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
          <motion.div
            className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: [0, 1] }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
    </motion.div>
  );
}
