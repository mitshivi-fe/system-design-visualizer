import { EventType, SimulationEvent } from "@/types/simulation";

let eventCounter = 0;

export function generateEventId(): string {
  return `event-${Date.now()}-${eventCounter++}`;
}

export function createEvent(
  type: EventType,
  source: string,
  target: string,
  timestamp: number,
  data?: Record<string, unknown>,
  duration: number = 1000,
  priority: number = 0
): SimulationEvent {
  return {
    id: generateEventId(),
    type,
    timestamp,
    source,
    target,
    data,
    duration,
    priority,
  };
}

// Event creators for common patterns
export function createHttpRequest(
  source: string,
  target: string,
  timestamp: number,
  data?: Record<string, unknown>
): SimulationEvent {
  return createEvent("HTTP_REQUEST", source, target, timestamp, data, 500, 1);
}

export function createHttpResponse(
  source: string,
  target: string,
  timestamp: number,
  data?: Record<string, unknown>
): SimulationEvent {
  return createEvent("HTTP_RESPONSE", source, target, timestamp, data, 300, 1);
}

export function createDbQuery(
  source: string,
  target: string,
  timestamp: number,
  query?: string
): SimulationEvent {
  return createEvent(
    "DB_QUERY",
    source,
    target,
    timestamp,
    { query },
    800,
    2
  );
}

export function createDbResponse(
  source: string,
  target: string,
  timestamp: number,
  data?: Record<string, unknown>
): SimulationEvent {
  return createEvent("DB_RESPONSE", source, target, timestamp, data, 400, 2);
}

export function createCacheCheck(
  source: string,
  target: string,
  timestamp: number,
  key?: string
): SimulationEvent {
  return createEvent(
    "CACHE_CHECK",
    source,
    target,
    timestamp,
    { key },
    100,
    3
  );
}

export function createCacheHit(
  source: string,
  target: string,
  timestamp: number,
  data?: Record<string, unknown>
): SimulationEvent {
  return createEvent("CACHE_HIT", source, target, timestamp, data, 50, 3);
}

export function createCacheMiss(
  source: string,
  target: string,
  timestamp: number
): SimulationEvent {
  return createEvent("CACHE_MISS", source, target, timestamp, {}, 50, 3);
}

export function createCacheWrite(
  source: string,
  target: string,
  timestamp: number,
  data?: Record<string, unknown>
): SimulationEvent {
  return createEvent("CACHE_WRITE", source, target, timestamp, data, 100, 2);
}

export function createCompute(
  componentId: string,
  timestamp: number,
  operation?: string
): SimulationEvent {
  return createEvent(
    "COMPUTE",
    componentId,
    componentId,
    timestamp,
    { operation },
    200,
    1
  );
}

export function createHashGenerate(
  componentId: string,
  timestamp: number,
  input?: string
): SimulationEvent {
  return createEvent(
    "HASH_GENERATE",
    componentId,
    componentId,
    timestamp,
    { input },
    150,
    1
  );
}

export function createLoadBalance(
  source: string,
  target: string,
  timestamp: number
): SimulationEvent {
  return createEvent("LOAD_BALANCE", source, target, timestamp, {}, 50, 3);
}

export function createRateLimitCheck(
  componentId: string,
  timestamp: number,
  clientId?: string
): SimulationEvent {
  return createEvent(
    "RATE_LIMIT_CHECK",
    componentId,
    componentId,
    timestamp,
    { clientId },
    100,
    3
  );
}

export function createAnalyticsTrack(
  source: string,
  target: string,
  timestamp: number,
  eventData?: Record<string, unknown>
): SimulationEvent {
  return createEvent(
    "ANALYTICS_TRACK",
    source,
    target,
    timestamp,
    eventData,
    200,
    0
  );
}

export function createMessageQueue(
  source: string,
  target: string,
  timestamp: number,
  message?: Record<string, unknown>
): SimulationEvent {
  return createEvent(
    "MESSAGE_QUEUE",
    source,
    target,
    timestamp,
    message,
    300,
    1
  );
}

export function createFanOut(
  source: string,
  targets: string[],
  timestamp: number,
  data?: Record<string, unknown>
): SimulationEvent[] {
  return targets.map((target, index) =>
    createEvent(
      "FAN_OUT",
      source,
      target,
      timestamp + index * 50, // Stagger fan-out
      data,
      200,
      1
    )
  );
}
