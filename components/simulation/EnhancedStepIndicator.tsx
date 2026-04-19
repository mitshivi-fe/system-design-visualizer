"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/lib/simulation/store";
import { CheckCircle2, Circle, PlayCircle, ArrowRight, Info, Lightbulb, HelpCircle } from "lucide-react";
import { useMemo, useState } from "react";

export interface EnhancedStep {
  id: string;
  title: string;
  what: string;      // What is happening
  why: string;       // Why is this step important
  how: string;       // How does it work technically
  eventTypes: string[];
  analogy?: string;  // Real-world analogy for beginners
}

interface EnhancedStepIndicatorProps {
  steps: EnhancedStep[];
  showDetails?: boolean;
}

export function EnhancedStepIndicator({ steps, showDetails = true }: EnhancedStepIndicatorProps) {
  const { currentEventIndex, events, isPlaying } = useSimulationStore();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Determine which step is active based on current event
  const activeStepIndex = useMemo(() => {
    if (events.length === 0) return 0;

    const currentEvent = events[currentEventIndex];
    if (!currentEvent) return steps.length - 1;

    // Find the step that matches the current event type
    for (let i = steps.length - 1; i >= 0; i--) {
      const step = steps[i];
      if (step.eventTypes.includes(currentEvent.type)) {
        return i;
      }
    }

    // Default to first step
    return 0;
  }, [currentEventIndex, events, steps]);

  const getStepStatus = (index: number) => {
    if (index < activeStepIndex) return "completed";
    if (index === activeStepIndex) return "active";
    return "pending";
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: "0%" }}
            animate={{ width: `${((activeStepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>Start</span>
          <span>Step {activeStepIndex + 1} of {steps.length}</span>
          <span>Complete</span>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isExpanded = expandedStep === step.id;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                  status === "active"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20"
                    : status === "completed"
                    ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                }`}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                {/* Step Header */}
                <div className="p-4 flex items-start gap-3">
                  {/* Step Number/Status Icon */}
                  <div className="flex-shrink-0">
                    {status === "completed" ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.div>
                    ) : status === "active" ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center"
                      >
                        {isPlaying ? (
                          <PlayCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </motion.div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 text-slate-400 flex items-center justify-center">
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-semibold ${
                          status === "active"
                            ? "text-blue-900 dark:text-blue-100"
                            : status === "completed"
                            ? "text-green-800 dark:text-green-200"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        className="text-slate-400"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>

                    {/* Brief "What" preview */}
                    <p
                      className={`text-sm mt-1 ${
                        status === "active"
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {step.what}
                    </p>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-200 dark:border-slate-700"
                    >
                      <div className="p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
                        {/* Why */}
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                              Why This Matters
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                              {step.why}
                            </p>
                          </div>
                        </div>

                        {/* How */}
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                              How It Works
                            </h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                              {step.how}
                            </p>
                          </div>
                        </div>

                        {/* Analogy (if provided) */}
                        {step.analogy && (
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                                Think of it like...
                              </h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 italic">
                                {step.analogy}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
