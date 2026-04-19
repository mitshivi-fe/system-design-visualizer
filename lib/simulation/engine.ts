import {
  SimulationEvent,
  SimulationState,
  SimulationSnapshot,
  DataPacket,
  Component,
  Metrics,
} from "@/types/simulation";

export class SimulationEngine {
  private snapshots: SimulationSnapshot[] = [];
  private snapshotInterval = 1000; // Take snapshot every 1 second

  /**
   * Sort events by timestamp and priority
   */
  sortEvents(events: SimulationEvent[]): SimulationEvent[] {
    return [...events].sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      // Higher priority first if timestamps are equal
      return (b.priority || 0) - (a.priority || 0);
    });
  }

  /**
   * Get events that should be processed at current time
   */
  getEventsAtTime(
    events: SimulationEvent[],
    currentTime: number,
    tolerance: number = 50
  ): SimulationEvent[] {
    return events.filter(
      (event) =>
        event.timestamp <= currentTime &&
        event.timestamp > currentTime - tolerance
    );
  }

  /**
   * Get next event to process
   */
  getNextEvent(
    events: SimulationEvent[],
    currentTime: number
  ): SimulationEvent | null {
    const futureEvents = events.filter((e) => e.timestamp > currentTime);
    return futureEvents.length > 0 ? futureEvents[0] : null;
  }

  /**
   * Get previous event
   */
  getPreviousEvent(
    processedEvents: SimulationEvent[],
    currentTime: number
  ): SimulationEvent | null {
    const pastEvents = processedEvents.filter((e) => e.timestamp < currentTime);
    return pastEvents.length > 0 ? pastEvents[pastEvents.length - 1] : null;
  }

  /**
   * Create a data packet from an event
   */
  createDataPacket(event: SimulationEvent): DataPacket {
    return {
      id: `packet-${event.id}`,
      eventId: event.id,
      type: event.type,
      source: event.source,
      target: event.target,
      progress: 0,
      data: event.data,
    };
  }

  /**
   * Update data packet progress based on elapsed time
   */
  updatePacketProgress(
    packet: DataPacket,
    event: SimulationEvent,
    currentTime: number
  ): DataPacket {
    const elapsed = currentTime - event.timestamp;
    const duration = event.duration || 1000;
    const progress = Math.min(1, Math.max(0, elapsed / duration));

    return {
      ...packet,
      progress,
    };
  }

  /**
   * Get active packets at current time
   */
  getActivePackets(
    events: SimulationEvent[],
    processedEvents: SimulationEvent[],
    currentTime: number
  ): DataPacket[] {
    // Find events that are in progress (started but not completed)
    const inProgressEvents = processedEvents.filter((event) => {
      const startTime = event.timestamp;
      const endTime = startTime + (event.duration || 1000);
      return currentTime >= startTime && currentTime < endTime;
    });

    return inProgressEvents.map((event) => {
      const packet = this.createDataPacket(event);
      return this.updatePacketProgress(packet, event, currentTime);
    });
  }

  /**
   * Update component states based on events
   */
  updateComponentStates(
    components: Component[],
    activePackets: DataPacket[],
    currentTime: number
  ): Component[] {
    return components.map((component) => {
      // Check if component is involved in any active packet
      const isProcessing = activePackets.some(
        (packet) =>
          packet.source === component.id || packet.target === component.id
      );

      if (isProcessing) {
        return { ...component, state: "processing" };
      } else {
        return { ...component, state: "idle" };
      }
    });
  }

  /**
   * Calculate metrics from processed events
   */
  calculateMetrics(
    processedEvents: SimulationEvent[],
    currentTime: number
  ): Metrics {
    const requests = processedEvents.filter((e) => e.type === "HTTP_REQUEST");
    const responses = processedEvents.filter((e) => e.type === "HTTP_RESPONSE");
    const cacheHits = processedEvents.filter((e) => e.type === "CACHE_HIT");
    const cacheMisses = processedEvents.filter((e) => e.type === "CACHE_MISS");
    const dbQueries = processedEvents.filter((e) => e.type === "DB_QUERY");

    // Calculate average latency from request/response pairs
    const latencies: number[] = [];
    requests.forEach((req) => {
      const resp = responses.find(
        (r) => r.source === req.target && r.target === req.source
      );
      if (resp) {
        latencies.push(resp.timestamp - req.timestamp);
      }
    });

    const averageLatency =
      latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 0;

    // Get current latency (last request)
    const currentLatency = latencies.length > 0 ? latencies[latencies.length - 1] : 0;

    return {
      totalRequests: requests.length,
      successfulRequests: responses.length,
      failedRequests: Math.max(0, requests.length - responses.length),
      cacheHits: cacheHits.length,
      cacheMisses: cacheMisses.length,
      dbQueries: dbQueries.length,
      averageLatency: Math.round(averageLatency),
      currentLatency: Math.round(currentLatency),
    };
  }

  /**
   * Process simulation to a specific time
   */
  processToTime(state: SimulationState, targetTime: number): SimulationState {
    const sortedEvents = this.sortEvents(state.events);

    // Get events that should be processed by target time
    const eventsToProcess = sortedEvents.filter(
      (e) => e.timestamp <= targetTime
    );
    const remainingEvents = sortedEvents.filter((e) => e.timestamp > targetTime);

    // Get active packets
    const activePackets = this.getActivePackets(
      remainingEvents,
      eventsToProcess,
      targetTime
    );

    // Update component states
    const updatedComponents = this.updateComponentStates(
      state.components,
      activePackets,
      targetTime
    );

    // Calculate metrics
    const metrics = this.calculateMetrics(eventsToProcess, targetTime);

    // Calculate max time
    const maxTime =
      sortedEvents.length > 0
        ? sortedEvents[sortedEvents.length - 1].timestamp +
          (sortedEvents[sortedEvents.length - 1].duration || 1000)
        : 0;

    return {
      ...state,
      components: updatedComponents,
      events: remainingEvents,
      processedEvents: eventsToProcess,
      activePackets,
      metrics,
      timeline: {
        ...state.timeline,
        currentTime: targetTime,
        maxTime,
      },
    };
  }

  /**
   * Step forward by one event
   */
  stepForward(state: SimulationState): SimulationState {
    const nextEvent = this.getNextEvent(
      state.events,
      state.timeline.currentTime
    );

    if (!nextEvent) {
      return state;
    }

    return this.processToTime(state, nextEvent.timestamp);
  }

  /**
   * Step backward by one event
   */
  stepBackward(state: SimulationState): SimulationState {
    const prevEvent = this.getPreviousEvent(
      state.processedEvents,
      state.timeline.currentTime
    );

    if (!prevEvent) {
      return this.processToTime(state, 0);
    }

    return this.processToTime(state, prevEvent.timestamp);
  }

  /**
   * Reset simulation to beginning
   */
  reset(state: SimulationState): SimulationState {
    const allEvents = [...state.events, ...state.processedEvents];
    const sortedEvents = this.sortEvents(allEvents);

    return {
      ...state,
      events: sortedEvents,
      processedEvents: [],
      activePackets: [],
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        dbQueries: 0,
        averageLatency: 0,
        currentLatency: 0,
      },
      timeline: {
        ...state.timeline,
        currentTime: 0,
        isPlaying: false,
      },
      components: state.components.map((c) => ({ ...c, state: "idle" })),
    };
  }

  /**
   * Create snapshot of current state
   */
  createSnapshot(state: SimulationState): SimulationSnapshot {
    return {
      timestamp: state.timeline.currentTime,
      state: JSON.parse(JSON.stringify(state)), // Deep clone
    };
  }

  /**
   * Save snapshot if interval reached
   */
  saveSnapshot(state: SimulationState): void {
    const lastSnapshot =
      this.snapshots.length > 0
        ? this.snapshots[this.snapshots.length - 1]
        : null;

    if (
      !lastSnapshot ||
      state.timeline.currentTime - lastSnapshot.timestamp >=
        this.snapshotInterval
    ) {
      this.snapshots.push(this.createSnapshot(state));
    }
  }

  /**
   * Get snapshot closest to target time
   */
  getClosestSnapshot(targetTime: number): SimulationSnapshot | null {
    if (this.snapshots.length === 0) return null;

    let closest = this.snapshots[0];
    let minDiff = Math.abs(targetTime - closest.timestamp);

    for (const snapshot of this.snapshots) {
      const diff = Math.abs(targetTime - snapshot.timestamp);
      if (diff < minDiff && snapshot.timestamp <= targetTime) {
        closest = snapshot;
        minDiff = diff;
      }
    }

    return closest;
  }

  /**
   * Clear snapshots
   */
  clearSnapshots(): void {
    this.snapshots = [];
  }
}

// Singleton instance
export const simulationEngine = new SimulationEngine();
