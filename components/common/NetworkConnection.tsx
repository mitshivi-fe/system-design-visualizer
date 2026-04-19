"use client";

import { motion } from "framer-motion";
import { useId } from "react";

interface NetworkConnectionProps {
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  active?: boolean;
  bidirectional?: boolean;
  className?: string;
  label?: string;
}

export function NetworkConnection({
  sourcePosition,
  targetPosition,
  active = false,
  bidirectional = false,
  className = "",
  label,
}: NetworkConnectionProps) {
  // Use React's useId for stable, hydration-safe unique IDs
  const uniqueId = useId();

  // Calculate SVG dimensions and positions with extra padding
  const padding = 80;
  const minX = Math.min(sourcePosition.x, targetPosition.x);
  const minY = Math.min(sourcePosition.y, targetPosition.y);
  const maxX = Math.max(sourcePosition.x, targetPosition.x);
  const maxY = Math.max(sourcePosition.y, targetPosition.y);

  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  // Adjust coordinates relative to SVG viewBox
  const x1 = sourcePosition.x - minX + padding;
  const y1 = sourcePosition.y - minY + padding;
  const x2 = targetPosition.x - minX + padding;
  const y2 = targetPosition.y - minY + padding;

  // Calculate connection angle and distance
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const isHorizontal = Math.abs(dx) > Math.abs(dy);
  const isDownward = dy > 0;
  const isRightward = dx > 0;

  // Adaptive curve control point - curves perpendicular to the line
  // This creates more natural-looking curves
  const curveIntensity = Math.min(distance * 0.15, 40);

  let controlX: number;
  let controlY: number;

  if (isHorizontal) {
    // For horizontal connections, curve up or down
    controlX = (x1 + x2) / 2;
    controlY = (y1 + y2) / 2 - curveIntensity;
  } else {
    // For vertical connections, curve left or right
    controlX = (x1 + x2) / 2 + (isRightward ? -curveIntensity : curveIntensity);
    controlY = (y1 + y2) / 2;
  }

  // For very short connections, use straight lines
  const usesStraightLine = distance < 60;
  const pathD = usesStraightLine
    ? `M ${x1} ${y1} L ${x2} ${y2}`
    : `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;

  // Calculate midpoint for label
  const midX = usesStraightLine ? (x1 + x2) / 2 : controlX;
  const midY = usesStraightLine ? (y1 + y2) / 2 : controlY;

  return (
    <svg
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: minX - padding,
        top: minY - padding,
        width,
        height,
        zIndex: 0,
      }}
    >
      <defs>
        {/* Gradient for active state */}
        <linearGradient id={`gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={active ? "#3b82f6" : "#94a3b8"} />
          <stop offset="100%" stopColor={active ? "#60a5fa" : "#cbd5e1"} />
        </linearGradient>

        {/* Glow filter for active state */}
        <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Forward arrow marker - improved design */}
        <marker
          id={`arrow-${uniqueId}`}
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0 1 L 10 6 L 0 11 L 3 6 Z"
            className={
              active
                ? "fill-blue-500 dark:fill-blue-400"
                : "fill-slate-400 dark:fill-slate-500"
            }
          />
        </marker>

        {/* Reverse arrow marker for bidirectional */}
        <marker
          id={`arrow-reverse-${uniqueId}`}
          markerWidth="12"
          markerHeight="12"
          refX="2"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 12 1 L 2 6 L 12 11 L 9 6 Z"
            className={
              active
                ? "fill-blue-500 dark:fill-blue-400"
                : "fill-slate-400 dark:fill-slate-500"
            }
          />
        </marker>

        {/* Animated dot gradient */}
        <radialGradient id={`dot-gradient-${uniqueId}`}>
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </radialGradient>
      </defs>

      {/* Shadow/glow path for active state */}
      {active && (
        <motion.path
          d={pathD}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={6}
          strokeOpacity={0.2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main connection line */}
      <motion.path
        d={pathD}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={
          active
            ? "stroke-blue-500 dark:stroke-blue-400"
            : "stroke-slate-300 dark:stroke-slate-600"
        }
        strokeWidth={active ? 2.5 : 1.5}
        strokeDasharray={active ? "none" : "none"}
        markerEnd={`url(#arrow-${uniqueId})`}
        markerStart={bidirectional ? `url(#arrow-reverse-${uniqueId})` : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: 1,
        }}
        transition={{
          pathLength: { duration: 0.4, ease: "easeOut" },
          opacity: { duration: 0.2 },
        }}
      />

      {/* Animated flow particles when active - stream effect */}
      {active && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              r={3}
              fill={`url(#dot-gradient-${uniqueId})`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "linear",
              }}
            >
              <animateMotion
                dur="1.5s"
                repeatCount="indefinite"
                begin={`${i * 0.5}s`}
              >
                <mpath href={`#motion-path-${uniqueId}`} />
              </animateMotion>
            </motion.circle>
          ))}

          {/* Hidden path for motion */}
          <path
            id={`motion-path-${uniqueId}`}
            d={pathD}
            fill="none"
            stroke="none"
          />
        </>
      )}

      {/* Optional label */}
      {label && (
        <g transform={`translate(${midX}, ${midY - 10})`}>
          <rect
            x={-20}
            y={-8}
            width={40}
            height={16}
            rx={4}
            className="fill-white dark:fill-slate-800"
            stroke={active ? "#3b82f6" : "#e2e8f0"}
            strokeWidth={1}
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-[10px] font-medium ${
              active
                ? "fill-blue-600 dark:fill-blue-400"
                : "fill-slate-500 dark:fill-slate-400"
            }`}
          >
            {label}
          </text>
        </g>
      )}
    </svg>
  );
}
