"use client";

import { useSimulationStore } from "@/lib/simulation/store";
import { Client } from "@/components/common/Client";
import { LoadBalancer } from "@/components/common/LoadBalancer";
import { Server } from "@/components/common/Server";
import { Cache } from "@/components/common/Cache";
import { Database } from "@/components/common/Database";
import { DataPacket } from "@/components/common/DataPacket";
import { NetworkConnection } from "@/components/common/NetworkConnection";
import { AnimatePresence } from "framer-motion";
import { ComponentType } from "@/types/simulation";

interface TwitterFlowProps {
  onComponentClick?: (type: ComponentType, label: string, customInfo?: CustomComponentInfo) => void;
}

export interface CustomComponentInfo {
  name: string;
  description: string;
  purpose: string;
  keyFeatures: string[];
}

const twitterComponentInfo: Record<string, CustomComponentInfo> = {
  "user": {
    name: "You (The User)",
    description: "That's you! Opening Twitter to post a tweet or check your home feed.",
    purpose: "You interact with Twitter through the mobile app or website",
    keyFeatures: [
      "Post tweets to share with followers",
      "View your home timeline",
      "Like, retweet, and reply to tweets",
      "Follow other users",
    ],
  },
  "api-gateway": {
    name: "API Gateway",
    description: "The front door to Twitter - all requests come through here first",
    purpose: "Routes your requests to the right internal service and handles authentication",
    keyFeatures: [
      "Authenticates your login session",
      "Rate limits to prevent spam/abuse",
      "Routes to Tweet Service or Timeline Service",
      "Load balances across thousands of servers",
    ],
  },
  "tweet-service": {
    name: "Tweet Service",
    description: "Handles creating, storing, and retrieving individual tweets",
    purpose: "When you post a tweet, this service saves it and notifies other services",
    keyFeatures: [
      "Validates tweet content (280 char limit)",
      "Stores tweets in the database",
      "Generates unique tweet IDs",
      "Triggers fan-out to distribute tweets",
    ],
  },
  "timeline-service": {
    name: "Timeline Service",
    description: "Builds and delivers your personalized home feed",
    purpose: "When you open Twitter, this service gets your timeline from cache or builds it",
    keyFeatures: [
      "Fetches pre-computed timeline from Redis",
      "Merges tweets for 'fan-out on read'",
      "Handles infinite scroll pagination",
      "Personalizes feed with algorithms",
    ],
  },
  "fanout-service": {
    name: "Fan-out Service",
    description: "Distributes new tweets to followers' timelines",
    purpose: "When someone tweets, this pushes it to all their followers' cached timelines",
    keyFeatures: [
      "Looks up follower list",
      "Pushes tweet ID to each follower's timeline cache",
      "Handles celebrities differently (fan-out on read)",
      "Processes millions of updates per second",
    ],
  },
  "redis-cache": {
    name: "Redis (Timeline Cache)",
    description: "Super-fast in-memory storage for pre-built timelines",
    purpose: "Stores your home timeline so it loads instantly when you open Twitter",
    keyFeatures: [
      "Holds last ~800 tweet IDs per user",
      "Sub-millisecond read times",
      "Updated instantly when someone you follow tweets",
      "Enables Twitter's snappy user experience",
    ],
  },
  "tweets-db": {
    name: "Tweets Database",
    description: "Permanent storage for all tweets ever posted",
    purpose: "Every tweet is stored here forever (until deleted)",
    keyFeatures: [
      "Billions of tweets stored",
      "Indexed by tweet_id and user_id",
      "Replicated for reliability",
      "Used for search and historical lookups",
    ],
  },
  "followers-db": {
    name: "Followers Database",
    description: "Stores the social graph - who follows whom",
    purpose: "Knows all follow relationships to determine who sees what",
    keyFeatures: [
      "Stores billions of follow relationships",
      "Quickly answers 'who follows user X?'",
      "Quickly answers 'who does user X follow?'",
      "Critical for fan-out service",
    ],
  },
};

export function TwitterFlow({ onComponentClick }: TwitterFlowProps) {
  const { components, activePackets, metrics } = useSimulationStore();

  const getComponent = (id: string) =>
    components.find((c) => c.id === id) || {
      id,
      type: "server" as const,
      label: "",
      state: "idle" as const,
      position: { x: 0, y: 0 },
    };

  const user = getComponent("user");
  const apiGateway = getComponent("api-gateway");
  const tweetService = getComponent("tweet-service");
  const timelineService = getComponent("timeline-service");
  const fanoutService = getComponent("fanout-service");
  const redisCache = getComponent("redis-cache");
  const tweetsDb = getComponent("tweets-db");
  const followersDb = getComponent("followers-db");

  const isConnectionActive = (source: string, target: string) =>
    activePackets.some(
      (p) =>
        (p.source === source && p.target === target) ||
        (p.source === target && p.target === source)
    );

  const handleClick = (id: string, type: ComponentType, label: string) => {
    const customInfo = twitterComponentInfo[id];
    onComponentClick?.(type, label, customInfo);
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/30 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl" />
      </div>

      {/* Network Connections */}
      <NetworkConnection
        sourcePosition={user.position}
        targetPosition={apiGateway.position}
        active={isConnectionActive("user", "api-gateway")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={apiGateway.position}
        targetPosition={tweetService.position}
        active={isConnectionActive("api-gateway", "tweet-service")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={apiGateway.position}
        targetPosition={timelineService.position}
        active={isConnectionActive("api-gateway", "timeline-service")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={tweetService.position}
        targetPosition={tweetsDb.position}
        active={isConnectionActive("tweet-service", "tweets-db")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={tweetService.position}
        targetPosition={fanoutService.position}
        active={isConnectionActive("tweet-service", "fanout-service")}
      />
      <NetworkConnection
        sourcePosition={fanoutService.position}
        targetPosition={followersDb.position}
        active={isConnectionActive("fanout-service", "followers-db")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={fanoutService.position}
        targetPosition={redisCache.position}
        active={isConnectionActive("fanout-service", "redis-cache")}
      />
      <NetworkConnection
        sourcePosition={timelineService.position}
        targetPosition={redisCache.position}
        active={isConnectionActive("timeline-service", "redis-cache")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={timelineService.position}
        targetPosition={followersDb.position}
        active={isConnectionActive("timeline-service", "followers-db")}
        bidirectional
      />
      <NetworkConnection
        sourcePosition={timelineService.position}
        targetPosition={tweetsDb.position}
        active={isConnectionActive("timeline-service", "tweets-db")}
        bidirectional
      />

      {/* Components */}
      <Client
        id={user.id}
        label={user.label}
        state={user.state}
        position={user.position}
        onClick={() => handleClick("user", user.type, user.label)}
      />

      <LoadBalancer
        id={apiGateway.id}
        label={apiGateway.label}
        state={apiGateway.state}
        position={apiGateway.position}
        onClick={() => handleClick("api-gateway", apiGateway.type, apiGateway.label)}
      />

      <Server
        id={tweetService.id}
        label={tweetService.label}
        state={tweetService.state}
        position={tweetService.position}
        onClick={() => handleClick("tweet-service", tweetService.type, tweetService.label)}
      />

      <Server
        id={timelineService.id}
        label={timelineService.label}
        state={timelineService.state}
        position={timelineService.position}
        onClick={() => handleClick("timeline-service", timelineService.type, timelineService.label)}
      />

      <Server
        id={fanoutService.id}
        label={fanoutService.label}
        state={fanoutService.state}
        position={fanoutService.position}
        onClick={() => handleClick("fanout-service", fanoutService.type, fanoutService.label)}
      />

      <Cache
        id={redisCache.id}
        label={redisCache.label}
        state={redisCache.state}
        position={redisCache.position}
        hits={metrics.cacheHits}
        misses={metrics.cacheMisses}
        onClick={() => handleClick("redis-cache", redisCache.type, redisCache.label)}
      />

      <Database
        id={tweetsDb.id}
        label={tweetsDb.label}
        state={tweetsDb.state}
        position={tweetsDb.position}
        onClick={() => handleClick("tweets-db", tweetsDb.type, tweetsDb.label)}
      />

      <Database
        id={followersDb.id}
        label={followersDb.label}
        state={followersDb.state}
        position={followersDb.position}
        onClick={() => handleClick("followers-db", followersDb.type, followersDb.label)}
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
