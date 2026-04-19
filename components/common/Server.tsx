"use client";

import { motion } from "framer-motion";
import { Server as ServerIcon } from "lucide-react";
import { ComponentState } from "@/types/simulation";
import { cn } from "@/lib/utils";

interface ServerProps {
  id: string;
  label: string;
  state?: ComponentState;
  position?: { x: number; y: number };
  requestCount?: number;
  className?: string;
  onClick?: () => void;
}

const stateColors = {
  idle: "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600",
  processing: "bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500",
  success: "bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-500",
  error: "bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-500",
};

const stateIconColors = {
  idle: "text-slate-600 dark:text-slate-400",
  processing: "text-blue-600 dark:text-blue-400",
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
};

export function Server({
  id,
  label,
  state = "idle",
  position,
  requestCount = 0,
  className,
  onClick,
}: ServerProps) {
  return (
    <motion.div
      className={cn("inline-block", className)}
      style={position ? { position: "absolute", left: position.x, top: position.y } : {}}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        ...(state === "processing" && {
          boxShadow: [
            "0 0 0 0 rgba(59, 130, 246, 0)",
            "0 0 0 10px rgba(59, 130, 246, 0.1)",
            "0 0 0 0 rgba(59, 130, 246, 0)",
          ],
        }),
      }}
      transition={{
        scale: { type: "spring", stiffness: 260, damping: 20 },
        boxShadow: { duration: 1.5, repeat: Infinity },
      }}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      <div
        className={cn(
          "relative rounded-xl border-2 p-4 min-w-[140px] transition-all duration-300",
          stateColors[state],
          onClick && "cursor-pointer hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400"
        )}
        onClick={onClick}
        title={onClick ? "Click to learn more" : undefined}
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={
              state === "processing"
                ? {
                    rotate: [0, 5, -5, 0],
                  }
                : {}
            }
            transition={{ duration: 0.5, repeat: state === "processing" ? Infinity : 0 }}
          >
            <ServerIcon className={cn("w-8 h-8", stateIconColors[state])} />
          </motion.div>

          <div className="text-center">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {label}
            </p>
            {requestCount > 0 && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {requestCount} requests
              </p>
            )}
          </div>
        </div>

        {state === "processing" && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}
