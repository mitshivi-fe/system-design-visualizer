"use client";

import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import { ComponentState } from "@/types/simulation";
import { cn } from "@/lib/utils";

interface HashGeneratorProps {
  id: string;
  label: string;
  state?: ComponentState;
  position?: { x: number; y: number };
  currentHash?: string;
  className?: string;
  onClick?: () => void;
}

const stateColors = {
  idle: "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600",
  processing: "bg-pink-100 border-pink-400 dark:bg-pink-900/30 dark:border-pink-500",
  success: "bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-500",
  error: "bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-500",
};

const stateIconColors = {
  idle: "text-slate-600 dark:text-slate-400",
  processing: "text-pink-600 dark:text-pink-400",
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
};

export function HashGenerator({
  id,
  label,
  state = "idle",
  position,
  currentHash,
  className,
  onClick,
}: HashGeneratorProps) {
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
          onClick && "cursor-pointer hover:shadow-lg hover:border-pink-500 dark:hover:border-pink-400"
        )}
        onClick={onClick}
        title={onClick ? "Click to learn more" : undefined}
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={
              state === "processing"
                ? {
                    rotate: [0, 180, 360],
                  }
                : {}
            }
            transition={{
              duration: 1,
              repeat: state === "processing" ? Infinity : 0,
              ease: "linear",
            }}
          >
            <Hash className={cn("w-8 h-8", stateIconColors[state])} />
          </motion.div>

          <div className="text-center">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {label}
            </p>
            {currentHash && (
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
                {currentHash}
              </p>
            )}
          </div>
        </div>

        {state === "processing" && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 bg-pink-500"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
