"use client";

import { useSimulationStore } from "@/lib/simulation/store";
import { Client } from "@/components/common/Client";
import { LoadBalancer } from "@/components/common/LoadBalancer";
import { Server } from "@/components/common/Server";
import { Cache } from "@/components/common/Cache";
import { Database } from "@/components/common/Database";
import { DataPacket } from "@/components/common/DataPacket";
import { NetworkConnection } from "@/components/common/NetworkConnection";
import { HashGenerator } from "./components/HashGenerator";
import { AnimatePresence } from "framer-motion";
import { ComponentType } from "@/types/simulation";

interface ShortenerFlowProps {
  onComponentClick?: (type: ComponentType, label: string) => void;
}

export function ShortenerFlow({ onComponentClick }: ShortenerFlowProps) {
  const { components, activePackets, metrics } = useSimulationStore();

  // Get component states and positions
  const getComponent = (id: string) =>
    components.find((c) => c.id === id) || {
      id,
      type: "server" as const,
      label: "",
      state: "idle" as const,
      position: { x: 0, y: 0 },
    };

  const client = getComponent("client");
  const loadBalancer = getComponent("load-balancer");
  const apiServer = getComponent("api-server");
  const cache = getComponent("cache");
  const database = getComponent("database");
  const hashGen = getComponent("hash-gen");

  // Check if connections are active based on packets
  const isConnectionActive = (source: string, target: string) =>
    activePackets.some((p) => p.source === source && p.target === target);

  return (
    <div className="relative w-full h-[500px] bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Network Connections */}
      <NetworkConnection
        sourcePosition={client.position}
        targetPosition={loadBalancer.position}
        active={isConnectionActive("client", "load-balancer")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={loadBalancer.position}
        targetPosition={apiServer.position}
        active={isConnectionActive("load-balancer", "api-server")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={apiServer.position}
        targetPosition={cache.position}
        active={isConnectionActive("api-server", "cache")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={apiServer.position}
        targetPosition={database.position}
        active={isConnectionActive("api-server", "database")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={apiServer.position}
        targetPosition={hashGen.position}
        active={isConnectionActive("api-server", "hash-gen")}
      />

      {/* Components */}
      <Client
        id={client.id}
        label={client.label}
        state={client.state}
        position={client.position}
        onClick={() => onComponentClick?.(client.type, client.label)}
      />

      <LoadBalancer
        id={loadBalancer.id}
        label={loadBalancer.label}
        state={loadBalancer.state}
        position={loadBalancer.position}
        onClick={() => onComponentClick?.(loadBalancer.type, loadBalancer.label)}
      />

      <Server
        id={apiServer.id}
        label={apiServer.label}
        state={apiServer.state}
        position={apiServer.position}
        requestCount={metrics.totalRequests}
        onClick={() => onComponentClick?.(apiServer.type, apiServer.label)}
      />

      <Cache
        id={cache.id}
        label={cache.label}
        state={cache.state}
        position={cache.position}
        hits={metrics.cacheHits}
        misses={metrics.cacheMisses}
        onClick={() => onComponentClick?.(cache.type, cache.label)}
      />

      <Database
        id={database.id}
        label={database.label}
        state={database.state}
        position={database.position}
        queryCount={metrics.dbQueries}
        onClick={() => onComponentClick?.(database.type, database.label)}
      />

      <HashGenerator
        id={hashGen.id}
        label={hashGen.label}
        state={hashGen.state}
        position={hashGen.position}
        onClick={() => onComponentClick?.(hashGen.type, hashGen.label)}
      />

      {/* Animated Data Packets */}
      <AnimatePresence>
        {activePackets.map((packet) => {
          const source = getComponent(packet.source);
          const target = getComponent(packet.target);

          return (
            <DataPacket
              key={packet.id}
              packet={packet}
              sourcePosition={source.position}
              targetPosition={target.position}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
