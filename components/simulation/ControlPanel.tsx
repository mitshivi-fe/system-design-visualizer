"use client";

import { Play, Pause, RotateCcw, SkipForward, SkipBack } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSimulationStore } from "@/lib/simulation/store";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  className?: string;
}

const speedOptions = [
  { value: 0.5, label: "0.5x" },
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 4, label: "4x" },
];

export function ControlPanel({ className }: ControlPanelProps) {
  const {
    timeline,
    playbackState,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
    setSpeed,
  } = useSimulationStore();

  const isPlaying = timeline.isPlaying;
  const isCompleted = playbackState === "completed";
  const isIdle = playbackState === "idle";
  const canStepBack = timeline.currentTime > 0;
  const canStepForward = timeline.currentTime < timeline.maxTime;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm",
        className
      )}
    >
      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={stepBackward}
          disabled={!canStepBack || isPlaying}
          title="Step backward"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        {isPlaying ? (
          <Button
            variant="primary"
            size="md"
            onClick={pause}
            className="min-w-[100px]"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={play}
            disabled={isCompleted && timeline.currentTime >= timeline.maxTime}
            className="min-w-[100px]"
          >
            <Play className="w-4 h-4 mr-2" />
            {isCompleted ? "Replay" : "Play"}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={stepForward}
          disabled={!canStepForward || isPlaying}
          title="Step forward"
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          disabled={isIdle && timeline.currentTime === 0}
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Speed controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Speed:
        </span>
        <div className="flex gap-1">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSpeed(option.value)}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                timeline.speed === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
