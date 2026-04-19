"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSimulationStore } from "@/lib/simulation/store";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TimelineProps {
  className?: string;
}

export function Timeline({ className }: TimelineProps) {
  const { timeline, seekTo, events, processedEvents } = useSimulationStore();
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const progress =
    timeline.maxTime > 0 ? (timeline.currentTime / timeline.maxTime) * 100 : 0;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * timeline.maxTime;

    seekTo(Math.max(0, Math.min(newTime, timeline.maxTime)));
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineRef.current) return;
    handleTimelineClick(e);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // Calculate event marker positions
  const allEvents = [...events, ...processedEvents];
  const eventMarkers = allEvents
    .filter((event, index, self) =>
      index === self.findIndex((e) => Math.abs(e.timestamp - event.timestamp) < 100)
    )
    .map((event) => ({
      position: timeline.maxTime > 0 ? (event.timestamp / timeline.maxTime) * 100 : 0,
      type: event.type,
    }));

  return (
    <div className={cn("space-y-2", className)}>
      {/* Time display */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600 dark:text-slate-400 font-medium">
          {formatDuration(timeline.currentTime)}
        </span>
        <span className="text-slate-500 dark:text-slate-500">
          {formatDuration(timeline.maxTime)}
        </span>
      </div>

      {/* Timeline bar */}
      <div
        ref={timelineRef}
        className="relative h-12 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer overflow-visible"
        onClick={handleTimelineClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Event markers */}
        {eventMarkers.map((marker, index) => (
          <div
            key={index}
            className="absolute top-0 w-0.5 h-full bg-slate-300 dark:bg-slate-600 opacity-50"
            style={{ left: `${marker.position}%` }}
          />
        ))}

        {/* Progress bar */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />

        {/* Playhead */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-200 border-2 border-blue-600 rounded-full shadow-lg cursor-grab active:cursor-grabbing"
          style={{ left: `${progress}%`, x: "-50%" }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
        </motion.div>

        {/* Current time tooltip */}
        {isDragging && (
          <motion.div
            className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded shadow-lg whitespace-nowrap"
            style={{ left: `${progress}%`, x: "-50%" }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {formatDuration(timeline.currentTime)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
