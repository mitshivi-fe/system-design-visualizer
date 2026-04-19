import { Component, SimulationEvent } from "@/types/simulation";
import {
  createHttpRequest,
  createHttpResponse,
  createDbQuery,
  createDbResponse,
  createCacheCheck,
  createCacheHit,
  createCacheMiss,
  createCacheWrite,
  createMessageQueue,
  createFanOut,
} from "../events";
import { EnhancedStep } from "@/components/simulation/EnhancedStepIndicator";

// Twitter components positioned for clear visual flow
export const twitterComponents: Component[] = [
  {
    id: "user",
    type: "client",
    label: "User (You)",
    state: "idle",
    position: { x: 50, y: 220 },
  },
  {
    id: "api-gateway",
    type: "load_balancer",
    label: "API Gateway",
    state: "idle",
    position: { x: 220, y: 220 },
  },
  {
    id: "tweet-service",
    type: "server",
    label: "Tweet Service",
    state: "idle",
    position: { x: 400, y: 120 },
  },
  {
    id: "timeline-service",
    type: "server",
    label: "Timeline Service",
    state: "idle",
    position: { x: 400, y: 320 },
  },
  {
    id: "fanout-service",
    type: "server",
    label: "Fan-out Service",
    state: "idle",
    position: { x: 580, y: 220 },
  },
  {
    id: "redis-cache",
    type: "cache",
    label: "Redis (Timelines)",
    state: "idle",
    position: { x: 580, y: 380 },
  },
  {
    id: "tweets-db",
    type: "database",
    label: "Tweets DB",
    state: "idle",
    position: { x: 580, y: 60 },
  },
  {
    id: "followers-db",
    type: "database",
    label: "Followers DB",
    state: "idle",
    position: { x: 750, y: 220 },
  },
];

// ============ SCENARIO 1: Post a Tweet ============
export function postTweetScenario(): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  let time = 0;

  // Step 1: User posts tweet
  events.push(
    createHttpRequest("user", "api-gateway", time, {
      action: "POST /tweet",
      content: "Hello Twitter! 🐦",
    })
  );
  time += 400;

  // Step 2: API Gateway routes to Tweet Service
  events.push(
    createHttpRequest("api-gateway", "tweet-service", time, {
      action: "createTweet",
    })
  );
  time += 300;

  // Step 3: Tweet Service saves to database
  events.push(
    createDbQuery("tweet-service", "tweets-db", time, "INSERT INTO tweets (user_id, content, timestamp)")
  );
  time += 600;

  events.push(
    createDbResponse("tweets-db", "tweet-service", time, {
      tweet_id: "123456789",
      success: true,
    })
  );
  time += 300;

  // Step 4: Tweet Service sends to Fan-out Service
  events.push(
    createMessageQueue("tweet-service", "fanout-service", time, {
      tweet_id: "123456789",
      action: "distribute",
    })
  );
  time += 300;

  // Step 5: Fan-out Service gets follower list
  events.push(
    createDbQuery("fanout-service", "followers-db", time, "SELECT follower_id FROM followers WHERE user_id = ?")
  );
  time += 500;

  events.push(
    createDbResponse("followers-db", "fanout-service", time, {
      followers: ["user_A", "user_B", "user_C"],
      count: 3,
    })
  );
  time += 300;

  // Step 6: Fan-out to each follower's timeline cache
  const fanOutEvents = createFanOut(
    "fanout-service",
    ["redis-cache", "redis-cache", "redis-cache"],
    time,
    { tweet_id: "123456789", action: "prepend_to_timeline" }
  );
  events.push(...fanOutEvents);
  time += 400;

  // Step 7: Response back to user
  events.push(
    createHttpResponse("tweet-service", "api-gateway", time, {
      status: "Tweet posted successfully!",
    })
  );
  time += 300;

  events.push(
    createHttpResponse("api-gateway", "user", time, {
      tweet_id: "123456789",
      message: "Tweet posted!",
    })
  );

  return events;
}

export const postTweetSteps: EnhancedStep[] = [
  {
    id: "step-1",
    title: "You tap 'Tweet'",
    what: "Your tweet leaves your phone and travels to Twitter's servers",
    why: "The app needs to send your tweet text to Twitter so they can store and share it",
    how: "Your phone sends an HTTP POST request to Twitter's API Gateway with your tweet text",
    analogy: "Like dropping a letter in a mailbox - it leaves your hands and enters the postal system",
    eventTypes: ["HTTP_REQUEST"],
  },
  {
    id: "step-2",
    title: "Tweet is saved permanently",
    what: "Twitter saves your tweet in their database so it never gets lost",
    why: "Without saving to a database, your tweet would disappear when servers restart",
    how: "The Tweet Service runs an INSERT SQL query to store your tweet with a unique ID",
    analogy: "Like writing your message in a permanent record book that's backed up multiple times",
    eventTypes: ["DB_QUERY"],
  },
  {
    id: "step-3",
    title: "Fan-out Service is notified",
    what: "A background job is created to distribute your tweet to followers",
    why: "Separating 'save' from 'distribute' lets you see 'Tweet posted!' faster",
    how: "A message is placed in a queue for the Fan-out Service to process",
    analogy: "Like telling the mailroom 'I have 1000 copies to send' - you don't wait for delivery",
    eventTypes: ["MESSAGE_QUEUE"],
  },
  {
    id: "step-4",
    title: "Finding your followers",
    what: "Twitter looks up everyone who follows you",
    why: "To know whose timelines need to be updated with your new tweet",
    how: "The Followers database is queried to get a list of all your follower IDs",
    analogy: "Like checking an address book to see who needs a copy of your newsletter",
    eventTypes: ["DB_RESPONSE"],
  },
  {
    id: "step-5",
    title: "Pushing to all timelines",
    what: "Your tweet ID is added to the top of each follower's cached timeline",
    why: "This is 'Fan-out on Write' - work now so followers see tweets instantly later",
    how: "Redis LPUSH adds your tweet ID to the front of each follower's timeline list",
    analogy: "Like placing your letter on top of everyone's inbox pile simultaneously",
    eventTypes: ["FAN_OUT"],
  },
  {
    id: "step-6",
    title: "Success confirmation",
    what: "You see 'Tweet posted!' on your screen",
    why: "Feedback that your action was successful",
    how: "The server sends back HTTP 200 with the new tweet's ID",
    analogy: "Like getting a receipt that your package was accepted for delivery",
    eventTypes: ["HTTP_RESPONSE"],
  },
];

// ============ SCENARIO 2: Load Home Timeline ============
export function loadTimelineScenario(): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  let time = 0;

  // Step 1: User opens home timeline
  events.push(
    createHttpRequest("user", "api-gateway", time, {
      action: "GET /home_timeline",
    })
  );
  time += 400;

  // Step 2: Route to Timeline Service
  events.push(
    createHttpRequest("api-gateway", "timeline-service", time, {
      action: "getTimeline",
      user_id: "current_user",
    })
  );
  time += 300;

  // Step 3: Check Redis cache for timeline
  events.push(
    createCacheCheck("timeline-service", "redis-cache", time, "timeline:current_user")
  );
  time += 100;

  // Step 4: Cache HIT! Timeline is pre-computed
  events.push(
    createCacheHit("redis-cache", "timeline-service", time, {
      tweets: ["tweet_1", "tweet_2", "tweet_3"],
      cached: true,
    })
  );
  time += 100;

  // Step 5: Return timeline to user
  events.push(
    createHttpResponse("timeline-service", "api-gateway", time, {
      tweets: [
        { id: "1", content: "First tweet in your feed!" },
        { id: "2", content: "Another great tweet" },
        { id: "3", content: "More content..." },
      ],
    })
  );
  time += 300;

  events.push(
    createHttpResponse("api-gateway", "user", time, {
      timeline_loaded: true,
      tweet_count: 3,
    })
  );

  return events;
}

export const loadTimelineSteps: EnhancedStep[] = [
  {
    id: "step-1",
    title: "You open Twitter",
    what: "Your app requests your personalized home timeline",
    why: "You want to see the latest tweets from people you follow",
    how: "HTTP GET request sent to /home_timeline endpoint",
    analogy: "Like walking to your mailbox to check for new mail",
    eventTypes: ["HTTP_REQUEST"],
  },
  {
    id: "step-2",
    title: "Checking the cache",
    what: "Twitter checks if your timeline is already prepared in Redis",
    why: "Looking in fast cache is much quicker than building from scratch",
    how: "Redis GET command checks for key 'timeline:your_user_id'",
    analogy: "Like checking if someone already sorted your mail on your desk",
    eventTypes: ["CACHE_CHECK"],
  },
  {
    id: "step-3",
    title: "Cache HIT - Found it!",
    what: "Your timeline was already pre-built! The fan-out service did the work earlier",
    why: "This is why Twitter loads so fast - your feed is always ready",
    how: "Redis returns the list of tweet IDs, already sorted chronologically",
    analogy: "Your mail is already sorted and waiting - just pick it up!",
    eventTypes: ["CACHE_HIT"],
  },
  {
    id: "step-4",
    title: "Tweets appear instantly",
    what: "Your home feed loads with the latest tweets",
    why: "The pre-computation strategy pays off with fast load times",
    how: "Tweet data is sent back as JSON to your app for rendering",
    analogy: "You grab your sorted mail and start reading immediately",
    eventTypes: ["HTTP_RESPONSE"],
  },
];

// ============ SCENARIO 3: Load Timeline (Cache Miss - Celebrity) ============
export function loadTimelineCelebrityScenario(): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  let time = 0;

  // Step 1: User opens home timeline
  events.push(
    createHttpRequest("user", "api-gateway", time, {
      action: "GET /home_timeline",
      note: "Following a celebrity with millions of followers",
    })
  );
  time += 400;

  // Step 2: Route to Timeline Service
  events.push(
    createHttpRequest("api-gateway", "timeline-service", time, {
      action: "getTimeline",
    })
  );
  time += 300;

  // Step 3: Check Redis cache
  events.push(
    createCacheCheck("timeline-service", "redis-cache", time, "timeline:user")
  );
  time += 100;

  // Step 4: Cache MISS - need to build timeline
  events.push(
    createCacheMiss("redis-cache", "timeline-service", time)
  );
  time += 100;

  // Step 5: Get list of people user follows
  events.push(
    createDbQuery("timeline-service", "followers-db", time, "SELECT following_id FROM following WHERE user_id = ?")
  );
  time += 500;

  events.push(
    createDbResponse("followers-db", "timeline-service", time, {
      following: ["celebrity_1", "friend_1", "friend_2"],
    })
  );
  time += 300;

  // Step 6: Get tweets from each person
  events.push(
    createDbQuery("timeline-service", "tweets-db", time, "SELECT * FROM tweets WHERE user_id IN (...) ORDER BY timestamp DESC")
  );
  time += 800;

  events.push(
    createDbResponse("tweets-db", "timeline-service", time, {
      tweets: ["tweet_1", "tweet_2", "tweet_3"],
      merged: true,
    })
  );
  time += 300;

  // Step 7: Cache the result for next time
  events.push(
    createCacheWrite("timeline-service", "redis-cache", time, {
      key: "timeline:user",
      ttl: "5 minutes",
    })
  );
  time += 100;

  // Step 8: Return to user
  events.push(
    createHttpResponse("timeline-service", "api-gateway", time, {
      tweets: ["merged timeline"],
    })
  );
  time += 300;

  events.push(
    createHttpResponse("api-gateway", "user", time, {
      timeline_loaded: true,
    })
  );

  return events;
}

export const loadTimelineCelebritySteps: EnhancedStep[] = [
  {
    id: "step-1",
    title: "You open Twitter (following celebrities)",
    what: "You request your home timeline, but you follow some mega-popular accounts",
    why: "When you follow celebrities with millions of followers, Twitter handles it differently",
    how: "Same HTTP GET request, but the backend detects celebrity content",
    analogy: "Imagine getting a newspaper that includes sections from famous columnists",
    eventTypes: ["HTTP_REQUEST"],
  },
  {
    id: "step-2",
    title: "Cache MISS - not pre-built",
    what: "Your timeline isn't sitting ready in Redis",
    why: "Celebrity tweets aren't fanned-out to millions of caches - it would be too slow!",
    how: "Redis returns null for your timeline key",
    analogy: "The newspaper office doesn't pre-print millions of custom editions for each reader",
    eventTypes: ["CACHE_MISS"],
  },
  {
    id: "step-3",
    title: "Looking up who you follow",
    what: "Twitter checks its database to see all the accounts you follow",
    why: "To know whose tweets to include in your personal timeline",
    how: "SQL query to the followers/following table",
    analogy: "Checking your subscription list to know which magazines to include",
    eventTypes: ["DB_QUERY"],
  },
  {
    id: "step-4",
    title: "Fetching their recent tweets",
    what: "Twitter pulls recent tweets from everyone you follow",
    why: "These tweets need to be merged and sorted by time",
    how: "Query tweets table with user_id IN (your following list), sorted by timestamp",
    analogy: "Gathering all the articles from your subscribed columnists",
    eventTypes: ["DB_RESPONSE"],
  },
  {
    id: "step-5",
    title: "Saving for next time",
    what: "Your newly-built timeline is cached in Redis",
    why: "If you refresh in 30 seconds, we won't rebuild from scratch",
    how: "Redis SET with a TTL (time-to-live) of a few minutes",
    analogy: "Keeping your custom newspaper on the desk for quick re-reading",
    eventTypes: ["CACHE_WRITE"],
  },
  {
    id: "step-6",
    title: "Timeline delivered",
    what: "Your feed appears, slightly slower than a cache hit",
    why: "Fan-out on Read means more work at read-time, but less at write-time for celebrities",
    how: "JSON response with merged, sorted tweet data",
    analogy: "Your custom newspaper is assembled and handed to you",
    eventTypes: ["HTTP_RESPONSE"],
  },
];

// Educational content for each scenario
export const twitterEducationalContent = {
  "post-tweet": {
    learningGoals: [
      {
        title: "Fan-out on Write",
        description: "Learn how Twitter pushes tweets to followers immediately when posted",
      },
      {
        title: "Message Queues",
        description: "Understand async processing for better user experience",
      },
      {
        title: "Cache Pre-computation",
        description: "See why pre-building timelines makes reading fast",
      },
      {
        title: "Trade-offs",
        description: "More work on write = faster reads for followers",
      },
    ],
    keyTakeaways: [
      "Tweets are saved to database FIRST for durability, then distributed",
      "Fan-out happens asynchronously - you don't wait for all followers to be updated",
      "Each follower's timeline is a pre-built list in Redis (very fast memory storage)",
      "This approach trades write-time complexity for read-time speed",
    ],
    designDecisions: [
      {
        decision: "Async fan-out via message queue",
        reason: "If we waited for all 1M followers to be updated, posting would take minutes!",
      },
      {
        decision: "Store timeline as list of tweet IDs, not full tweets",
        reason: "Saves massive storage space - full tweet content is fetched separately",
      },
      {
        decision: "Pre-compute timelines (fan-out on write)",
        reason: "Reading your feed happens way more often than posting, so optimize for reads",
      },
    ],
    interviewTips: [
      "Always mention the trade-off: fan-out on write vs read",
      "Discuss why async processing improves user experience",
      "Consider what happens with 100M followers (hint: hybrid approach)",
    ],
  },
  "load-timeline": {
    learningGoals: [
      {
        title: "Cache-First Strategy",
        description: "Why checking cache before database is crucial for speed",
      },
      {
        title: "Pre-computation Benefits",
        description: "See the payoff of doing work upfront during writes",
      },
      {
        title: "Redis for Speed",
        description: "Understand why in-memory storage is essential here",
      },
    ],
    keyTakeaways: [
      "Your timeline is already built and waiting in Redis cache",
      "Cache lookup takes ~1ms vs ~50-100ms for database queries",
      "This is the benefit of fan-out on write - reads are instant",
      "Twitter users read timelines far more often than they post",
    ],
    designDecisions: [
      {
        decision: "Redis for timeline storage",
        reason: "In-memory storage gives sub-millisecond reads - essential for snappy UX",
      },
      {
        decision: "Store recent 800 tweets per user",
        reason: "Balance between completeness and memory usage",
      },
    ],
    interviewTips: [
      "Emphasize the read:write ratio (100:1 or more)",
      "Explain cache hit rates and their impact",
      "Discuss what happens on cache miss",
    ],
  },
  "load-timeline-celebrity": {
    learningGoals: [
      {
        title: "Fan-out on Read",
        description: "Alternative strategy for users with millions of followers",
      },
      {
        title: "Hybrid Architecture",
        description: "Using different strategies for different user types",
      },
      {
        title: "Scale Trade-offs",
        description: "Why one-size-fits-all doesn't work at massive scale",
      },
    ],
    keyTakeaways: [
      "Celebrities with millions of followers use 'fan-out on read' instead",
      "Pushing to millions of timelines for each celebrity tweet would be too slow",
      "The timeline is built on-demand when you request it",
      "Twitter uses BOTH strategies - hybrid approach",
    ],
    designDecisions: [
      {
        decision: "Fan-out on read for 10K+ followers",
        reason: "Pushing to millions of caches per tweet would overwhelm the system",
      },
      {
        decision: "Cache the built timeline briefly",
        reason: "Reduces repeated work if user refreshes quickly",
      },
      {
        decision: "Merge celebrity tweets at read time",
        reason: "Pull model instead of push - works better for very popular accounts",
      },
    ],
    interviewTips: [
      "ALWAYS mention the hybrid approach in Twitter interviews",
      "Define the threshold (~10K followers) for switching strategies",
      "Explain the hotspot problem with pure fan-out on write",
    ],
  },
};

export const twitterScenarios = {
  "post-tweet": {
    name: "Post a Tweet",
    description: "See how your tweet is saved and pushed to all your followers' feeds instantly",
    getEvents: postTweetScenario,
    steps: postTweetSteps,
    keyInsight: "Fan-out on Write: Your tweet is pushed to each follower's cached timeline immediately.",
  },
  "load-timeline": {
    name: "Load Home Feed (Fast)",
    description: "Open Twitter and see your home timeline load instantly from cache",
    getEvents: loadTimelineScenario,
    steps: loadTimelineSteps,
    keyInsight: "Pre-computed Timeline: Your feed is already built and waiting in Redis cache!",
  },
  "load-timeline-celebrity": {
    name: "Follow a Celebrity",
    description: "What happens when you follow someone with millions of followers",
    getEvents: loadTimelineCelebrityScenario,
    steps: loadTimelineCelebritySteps,
    keyInsight: "Fan-out on Read: Celebrity tweets are fetched on-demand to avoid pushing to millions of timelines.",
  },
};
