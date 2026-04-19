// Core simulation types and interfaces

export type EventType =
  | "HTTP_REQUEST"
  | "HTTP_RESPONSE"
  | "DB_QUERY"
  | "DB_RESPONSE"
  | "CACHE_CHECK"
  | "CACHE_HIT"
  | "CACHE_MISS"
  | "CACHE_WRITE"
  | "COMPUTE"
  | "HASH_GENERATE"
  | "LOAD_BALANCE"
  | "RATE_LIMIT_CHECK"
  | "ANALYTICS_TRACK"
  | "MESSAGE_QUEUE"
  | "FAN_OUT";

export type ComponentType =
  | "client"
  | "server"
  | "database"
  | "cache"
  | "load_balancer"
  | "queue"
  | "hash_generator";

export type ComponentState = "idle" | "processing" | "success" | "error";

export interface Position {
  x: number;
  y: number;
}

export interface Component {
  id: string;
  type: ComponentType;
  label: string;
  state: ComponentState;
  position: Position;
  data?: Record<string, unknown>;
}

export interface SimulationEvent {
  id: string;
  type: EventType;
  timestamp: number;
  source: string; // component id
  target: string; // component id
  data?: Record<string, unknown>;
  duration?: number; // ms
  priority?: number; // higher = more priority
}

export interface DataPacket {
  id: string;
  eventId: string;
  type: EventType;
  source: string;
  target: string;
  progress: number; // 0 to 1
  data?: Record<string, unknown>;
}

export interface Metrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  cacheMisses: number;
  dbQueries: number;
  averageLatency: number;
  currentLatency: number;
}

export interface TimelineState {
  currentTime: number;
  maxTime: number;
  isPlaying: boolean;
  speed: number; // 0.5x, 1x, 2x, 4x
}

export interface SimulationState {
  components: Component[];
  events: SimulationEvent[];
  activePackets: DataPacket[];
  processedEvents: SimulationEvent[];
  metrics: Metrics;
  timeline: TimelineState;
  scenario?: string;
}

export interface SimulationSnapshot {
  timestamp: number;
  state: SimulationState;
}

export type PlaybackState = "idle" | "playing" | "paused" | "completed";
