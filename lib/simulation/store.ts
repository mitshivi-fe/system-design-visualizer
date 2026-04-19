import { create } from "zustand";
import {
  SimulationState,
  SimulationEvent,
  Component,
  PlaybackState,
} from "@/types/simulation";
import { simulationEngine } from "./engine";

interface SimulationStore extends SimulationState {
  playbackState: PlaybackState;

  // Actions
  setComponents: (components: Component[]) => void;
  addEvent: (event: SimulationEvent) => void;
  addEvents: (events: SimulationEvent[]) => void;
  setEvents: (events: SimulationEvent[]) => void;

  // Playback controls
  play: () => void;
  pause: () => void;
  reset: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  seekTo: (time: number) => void;
  setSpeed: (speed: number) => void;

  // Scenario management
  setScenario: (scenario: string) => void;

  // Internal
  tick: () => void;
}

const initialMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  dbQueries: 0,
  averageLatency: 0,
  currentLatency: 0,
};

const initialTimeline = {
  currentTime: 0,
  maxTime: 0,
  isPlaying: false,
  speed: 1,
};

export const useSimulationStore = create<SimulationStore>((set, get) => {
  let animationFrameId: number | null = null;
  let lastTickTime = 0;

  const startAnimation = () => {
    if (animationFrameId !== null) return;

    const animate = (currentTime: number) => {
      const state = get();

      if (!state.timeline.isPlaying) {
        animationFrameId = null;
        return;
      }

      // Calculate delta time
      if (lastTickTime === 0) {
        lastTickTime = currentTime;
      }
      const deltaTime = currentTime - lastTickTime;
      lastTickTime = currentTime;

      // Update simulation
      get().tick();

      // Check if simulation is complete
      if (state.timeline.currentTime >= state.timeline.maxTime) {
        set({ playbackState: "completed", timeline: { ...state.timeline, isPlaying: false } });
        animationFrameId = null;
        lastTickTime = 0;
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      lastTickTime = 0;
    }
  };

  return {
    components: [],
    events: [],
    activePackets: [],
    processedEvents: [],
    metrics: initialMetrics,
    timeline: initialTimeline,
    playbackState: "idle",
    scenario: undefined,

    setComponents: (components) => {
      set({ components });
    },

    addEvent: (event) => {
      const state = get();
      const newEvents = simulationEngine.sortEvents([...state.events, event]);
      set({ events: newEvents });
    },

    addEvents: (events) => {
      const state = get();
      const newEvents = simulationEngine.sortEvents([...state.events, ...events]);
      set({ events: newEvents });
    },

    setEvents: (events) => {
      const sortedEvents = simulationEngine.sortEvents(events);
      const maxTime =
        sortedEvents.length > 0
          ? sortedEvents[sortedEvents.length - 1].timestamp +
            (sortedEvents[sortedEvents.length - 1].duration || 1000)
          : 0;

      set({
        events: sortedEvents,
        processedEvents: [],
        activePackets: [],
        timeline: { ...get().timeline, maxTime, currentTime: 0 },
        playbackState: "idle",
      });
    },

    play: () => {
      const state = get();

      // If completed, reset first
      if (state.playbackState === "completed") {
        get().reset();
      }

      set({
        timeline: { ...state.timeline, isPlaying: true },
        playbackState: "playing",
      });
      startAnimation();
    },

    pause: () => {
      set((state) => ({
        timeline: { ...state.timeline, isPlaying: false },
        playbackState: "paused",
      }));
      stopAnimation();
    },

    reset: () => {
      stopAnimation();
      const state = get();
      const resetState = simulationEngine.reset(state);
      set({
        ...resetState,
        playbackState: "idle",
      });
      simulationEngine.clearSnapshots();
    },

    stepForward: () => {
      const state = get();
      const newState = simulationEngine.stepForward(state);
      set({
        ...newState,
        playbackState: newState.timeline.currentTime >= newState.timeline.maxTime ? "completed" : "paused",
      });
    },

    stepBackward: () => {
      const state = get();
      const newState = simulationEngine.stepBackward(state);
      set({
        ...newState,
        playbackState: "paused",
      });
    },

    seekTo: (time) => {
      const state = get();
      const wasPlaying = state.timeline.isPlaying;

      if (wasPlaying) {
        stopAnimation();
      }

      const newState = simulationEngine.processToTime(state, time);
      set({
        ...newState,
        playbackState: time >= newState.timeline.maxTime ? "completed" : wasPlaying ? "playing" : "paused",
      });

      if (wasPlaying && time < newState.timeline.maxTime) {
        startAnimation();
      }
    },

    setSpeed: (speed) => {
      set((state) => ({
        timeline: { ...state.timeline, speed },
      }));
    },

    setScenario: (scenario) => {
      set({ scenario });
    },

    tick: () => {
      const state = get();
      const deltaMs = 16.67 * state.timeline.speed; // ~60fps adjusted by speed
      const newTime = Math.min(
        state.timeline.currentTime + deltaMs,
        state.timeline.maxTime
      );

      const newState = simulationEngine.processToTime(state, newTime);

      // Save snapshot periodically
      simulationEngine.saveSnapshot(newState);

      set(newState);
    },
  };
});
