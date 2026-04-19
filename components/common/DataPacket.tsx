"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DataPacket as DataPacketType, EventType } from "@/types/simulation";
import { cn } from "@/lib/utils";

interface DataPacketProps {
  packet: DataPacketType;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
}

const eventTypeColors: Record<EventType, string> = {
  HTTP_REQUEST: "bg-blue-500 border-blue-600",
  HTTP_RESPONSE: "bg-cyan-500 border-cyan-600",
  DB_QUERY: "bg-purple-500 border-purple-600",
  DB_RESPONSE: "bg-violet-500 border-violet-600",
  CACHE_CHECK: "bg-amber-500 border-amber-600",
  CACHE_HIT: "bg-green-500 border-green-600",
  CACHE_MISS: "bg-orange-500 border-orange-600",
  CACHE_WRITE: "bg-yellow-500 border-yellow-600",
  COMPUTE: "bg-indigo-500 border-indigo-600",
  HASH_GENERATE: "bg-pink-500 border-pink-600",
  LOAD_BALANCE: "bg-teal-500 border-teal-600",
  RATE_LIMIT_CHECK: "bg-rose-500 border-rose-600",
  ANALYTICS_TRACK: "bg-slate-500 border-slate-600",
  MESSAGE_QUEUE: "bg-fuchsia-500 border-fuchsia-600",
  FAN_OUT: "bg-emerald-500 border-emerald-600",
};

const eventTypeLabels: Record<EventType, string> = {
  HTTP_REQUEST: "HTTP",
  HTTP_RESPONSE: "Response",
  DB_QUERY: "Query",
  DB_RESPONSE: "DB Data",
  CACHE_CHECK: "Cache?",
  CACHE_HIT: "Hit!",
  CACHE_MISS: "Miss",
  CACHE_WRITE: "Write",
  COMPUTE: "Compute",
  HASH_GENERATE: "Hash",
  LOAD_BALANCE: "Balance",
  RATE_LIMIT_CHECK: "RateLimit",
  ANALYTICS_TRACK: "Analytics",
  MESSAGE_QUEUE: "Message",
  FAN_OUT: "Fan-out",
};

export function DataPacket({
  packet,
  sourcePosition,
  targetPosition,
}: DataPacketProps) {
  // Calculate position based on progress
  const x = sourcePosition.x + (targetPosition.x - sourcePosition.x) * packet.progress;
  const y = sourcePosition.y + (targetPosition.y - sourcePosition.y) * packet.progress;

  // Calculate angle for rotation
  const angle = Math.atan2(
    targetPosition.y - sourcePosition.y,
    targetPosition.x - sourcePosition.x
  ) * (180 / Math.PI);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full border-2 shadow-lg",
          eventTypeColors[packet.type]
        )}
      >
        <span className="text-xs font-bold text-white whitespace-nowrap">
          {eventTypeLabels[packet.type]}
        </span>
        <ArrowRight className="w-3 h-3 text-white" />
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-md -z-10"
        style={{
          background: eventTypeColors[packet.type].split(" ")[0].replace("bg-", ""),
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.div>
  );
}
