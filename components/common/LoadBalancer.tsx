"use client";

import { motion } from "framer-motion";
import { Network } from "lucide-react";
import { ComponentState } from "@/types/simulation";
import { cn } from "@/lib/utils";

interface LoadBalancerProps {
  id: string;
  label: string;
  state?: ComponentState;
  position?: { x: number; y: number };
  algorithm?: string;
  className?: string;
  onClick?: () => void;
}

const stateColors = {
  idle: "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600",
  processing: "bg-indigo-100 border-indigo-400 dark:bg-indigo-900/30 dark:border-indigo-500",
  success: "bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-500",
  error: "bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-500",
};

const stateIconColors = {
  idle: "text-slate-600 dark:text-slate-400",
  processing: "text-indigo-600 dark:text-indigo-400",
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
};

export function LoadBalancer({
  id,
  label,
  state = "idle",
  position,
  algorithm = "Round Robin",
  className,
  onClick,
}: LoadBalancerProps) {
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
          onClick && "cursor-pointer hover:shadow-lg hover:border-indigo-500 dark:hover:border-indigo-400"
        )}
        onClick={onClick}
        title={onClick ? "Click to learn more" : undefined}
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={
              state === "processing"
                ? {
                    rotate: 360,
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: state === "processing" ? Infinity : 0,
              ease: "linear",
            }}
          >
            <Network className={cn("w-8 h-8", stateIconColors[state])} />
          </motion.div>

          <div className="text-center">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {label}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {algorithm}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
