"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/lib/simulation/store";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  title: string;
  description: string;
  eventTypes: string[]; // Events that trigger this step
}

interface StepIndicatorProps {
  steps: Step[];
  className?: string;
}

export function StepIndicator({ steps, className }: StepIndicatorProps) {
  const { processedEvents, timeline } = useSimulationStore();

  // Determine which step we're on based on processed events
  const getCurrentStepIndex = () => {
    let currentIndex = -1;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const hasMatchingEvent = processedEvents.some((event) =>
        step.eventTypes.includes(event.type)
      );
      if (hasMatchingEvent) {
        currentIndex = i;
      }
    }

    return currentIndex;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Request Flow
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Step {Math.max(1, currentStepIndex + 1)} of {steps.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <motion.div
              key={step.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300",
                isCompleted && "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
                isCurrent && "bg-blue-50 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500 shadow-lg",
                isPending && "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 opacity-60"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isPending ? 0.6 : 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Step Number/Icon */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </motion.div>
                ) : isCurrent ? (
                  <motion.div
                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </motion.div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                    <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                      {index + 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "font-semibold text-base mb-1",
                    isCompleted && "text-green-700 dark:text-green-400",
                    isCurrent && "text-blue-700 dark:text-blue-400",
                    isPending && "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {step.title}
                </h4>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    isCompleted && "text-green-600 dark:text-green-500",
                    isCurrent && "text-blue-600 dark:text-blue-300",
                    isPending && "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {step.description}
                </p>
              </div>

              {/* Arrow for current step */}
              {isCurrent && (
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
