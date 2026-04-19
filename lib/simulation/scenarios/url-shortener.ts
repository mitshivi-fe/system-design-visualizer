import { Component, SimulationEvent } from "@/types/simulation";
import {
  createHttpRequest,
  createHttpResponse,
  createLoadBalance,
  createCacheCheck,
  createCacheHit,
  createCacheMiss,
  createCacheWrite,
  createDbQuery,
  createDbResponse,
  createHashGenerate,
  createRateLimitCheck,
  createAnalyticsTrack,
} from "../events";
import { EnhancedStep } from "@/components/simulation/EnhancedStepIndicator";

export const urlShortenerComponents: Component[] = [
  {
    id: "client",
    type: "client",
    label: "Client",
    state: "idle",
    position: { x: 50, y: 200 },
  },
  {
    id: "load-balancer",
    type: "load_balancer",
    label: "Load Balancer",
    state: "idle",
    position: { x: 250, y: 200 },
  },
  {
    id: "api-server",
    type: "server",
    label: "API Server",
    state: "idle",
    position: { x: 450, y: 200 },
  },
  {
    id: "cache",
    type: "cache",
    label: "Redis Cache",
    state: "idle",
    position: { x: 650, y: 100 },
  },
  {
    id: "database",
    type: "database",
    label: "PostgreSQL",
    state: "idle",
    position: { x: 650, y: 300 },
  },
  {
    id: "hash-gen",
    type: "hash_generator",
    label: "Hash Generator",
    state: "idle",
    position: { x: 450, y: 50 },
  },
];

export function createShortUrlScenario(): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  let time = 0;

  // 1. Client sends request to create short URL
  events.push(createHttpRequest("client", "load-balancer", time, {
    url: "https://verylongurl.com/path/to/resource",
    method: "POST",
  }));
  time += 500;

  // 2. Load balancer forwards to API server
  events.push(createLoadBalance("load-balancer", "api-server", time));
  time += 50;

  events.push(createHttpRequest("load-balancer", "api-server", time, {
    url: "https://verylongurl.com/path/to/resource",
  }));
  time += 300;

  // 3. Rate limit check
  events.push(createRateLimitCheck("api-server", time, "client-123"));
  time += 100;

  // 4. Generate hash for the URL
  events.push(createHashGenerate("hash-gen", time, "https://verylongurl.com/path/to/resource"));
  time += 150;

  // 5. Check if hash already exists in cache
  events.push(createCacheCheck("api-server", "cache", time, "abc123"));
  time += 100;

  // 6. Cache miss
  events.push(createCacheMiss("cache", "api-server", time));
  time += 50;

  // 7. Check database for existing hash
  events.push(createDbQuery("api-server", "database", time, "SELECT * FROM urls WHERE short_code='abc123'"));
  time += 800;

  // 8. DB returns no results
  events.push(createDbResponse("database", "api-server", time, { exists: false }));
  time += 400;

  // 9. Insert new URL mapping into database
  events.push(createDbQuery("api-server", "database", time, "INSERT INTO urls (short_code, long_url) VALUES ('abc123', '...')"));
  time += 800;

  // 10. DB confirms insert
  events.push(createDbResponse("database", "api-server", time, { success: true }));
  time += 400;

  // 11. Write to cache
  events.push(createCacheWrite("api-server", "cache", time, {
    key: "abc123",
    value: "https://verylongurl.com/path/to/resource",
  }));
  time += 100;

  // 12. Track analytics
  events.push(createAnalyticsTrack("api-server", "database", time, {
    event: "url_created",
    code: "abc123",
  }));
  time += 200;

  // 13. Return response to client
  events.push(createHttpResponse("api-server", "load-balancer", time, {
    shortUrl: "https://short.ly/abc123",
  }));
  time += 300;

  events.push(createHttpResponse("load-balancer", "client", time, {
    shortUrl: "https://short.ly/abc123",
  }));

  return events;
}

export function redirectScenarioCacheHit(): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  let time = 0;

  // 1. Client requests short URL
  events.push(createHttpRequest("client", "load-balancer", time, {
    url: "https://short.ly/abc123",
    method: "GET",
  }));
  time += 500;

  // 2. Load balancer forwards to API server
  events.push(createLoadBalance("load-balancer", "api-server", time));
  time += 50;

  events.push(createHttpRequest("load-balancer", "api-server", time, {
    url: "https://short.ly/abc123",
  }));
  time += 300;

  // 3. Check cache for short code
  events.push(createCacheCheck("api-server", "cache", time, "abc123"));
  time += 100;

  // 4. Cache HIT! - Return immediately
  events.push(createCacheHit("cache", "api-server", time, {
    url: "https://verylongurl.com/path/to/resource",
  }));
  time += 50;

  // 5. Track analytics (async)
  events.push(createAnalyticsTrack("api-server", "database", time, {
    event: "url_accessed",
    code: "abc123",
  }));
  time += 200;

  // 6. Return redirect response
  events.push(createHttpResponse("api-server", "load-balancer", time, {
    redirect: "https://verylongurl.com/path/to/resource",
    status: 301,
  }));
  time += 300;

  events.push(createHttpResponse("load-balancer", "client", time, {
    redirect: "https://verylongurl.com/path/to/resource",
    status: 301,
  }));

  return events;
}

export function redirectScenarioCacheMiss(): SimulationEvent[] {
  const events: SimulationEvent[] = [];
  let time = 0;

  // 1. Client requests short URL
  events.push(createHttpRequest("client", "load-balancer", time, {
    url: "https://short.ly/xyz789",
    method: "GET",
  }));
  time += 500;

  // 2. Load balancer forwards to API server
  events.push(createLoadBalance("load-balancer", "api-server", time));
  time += 50;

  events.push(createHttpRequest("load-balancer", "api-server", time, {
    url: "https://short.ly/xyz789",
  }));
  time += 300;

  // 3. Check cache for short code
  events.push(createCacheCheck("api-server", "cache", time, "xyz789"));
  time += 100;

  // 4. Cache MISS
  events.push(createCacheMiss("cache", "api-server", time));
  time += 50;

  // 5. Query database
  events.push(createDbQuery("api-server", "database", time, "SELECT long_url FROM urls WHERE short_code='xyz789'"));
  time += 800;

  // 6. DB returns the URL
  events.push(createDbResponse("database", "api-server", time, {
    url: "https://anotherlongurl.com/page",
  }));
  time += 400;

  // 7. Write to cache for next time
  events.push(createCacheWrite("api-server", "cache", time, {
    key: "xyz789",
    value: "https://anotherlongurl.com/page",
  }));
  time += 100;

  // 8. Track analytics
  events.push(createAnalyticsTrack("api-server", "database", time, {
    event: "url_accessed",
    code: "xyz789",
  }));
  time += 200;

  // 9. Return redirect response
  events.push(createHttpResponse("api-server", "load-balancer", time, {
    redirect: "https://anotherlongurl.com/page",
    status: 301,
  }));
  time += 300;

  events.push(createHttpResponse("load-balancer", "client", time, {
    redirect: "https://anotherlongurl.com/page",
    status: 301,
  }));

  return events;
}

// Enhanced step definitions with What/Why/How
export const createShortUrlSteps: EnhancedStep[] = [
  {
    id: "step-1",
    title: "You submit a long URL",
    what: "You paste a long URL and click 'Shorten'. The request travels to Bitly's servers.",
    why: "The load balancer distributes traffic across many servers so no single server gets overwhelmed.",
    how: "HTTP POST request with your URL is sent to the load balancer, which picks an available API server.",
    analogy: "Like a restaurant host directing you to an available waiter instead of everyone crowding one server.",
    eventTypes: ["HTTP_REQUEST", "LOAD_BALANCE"],
  },
  {
    id: "step-2",
    title: "Rate limit check",
    what: "The server checks if you've made too many requests recently.",
    why: "Prevents spam, abuse, and protects the system from being overwhelmed.",
    how: "Your IP/user ID is checked against a counter (often in Redis) tracking recent requests.",
    analogy: "Like a bouncer checking if you've already been in line too many times today.",
    eventTypes: ["RATE_LIMIT_CHECK"],
  },
  {
    id: "step-3",
    title: "Generate unique short code",
    what: "A hash function creates a unique 7-character code like 'abc123X'.",
    why: "7 characters with Base62 (a-z, A-Z, 0-9) gives us 3.5 trillion possible codes!",
    how: "Either hash the URL content, or use an auto-incrementing ID converted to Base62.",
    analogy: "Like assigning a unique license plate number to each car.",
    eventTypes: ["HASH_GENERATE"],
  },
  {
    id: "step-4",
    title: "Check if code exists",
    what: "Verify this short code isn't already taken (hash collision check).",
    why: "Two different URLs can't share the same short code - we need uniqueness.",
    how: "Check Redis cache first (fast), then database if not in cache.",
    analogy: "Like checking if a username is already taken before letting you register.",
    eventTypes: ["CACHE_CHECK", "CACHE_MISS", "DB_QUERY"],
  },
  {
    id: "step-5",
    title: "Save to database",
    what: "Store the mapping: 'abc123' → 'https://your-long-url.com/...'",
    why: "Database is permanent storage. If servers restart, your URLs still work.",
    how: "INSERT INTO urls (short_code, long_url, created_at) VALUES (...)",
    analogy: "Writing in a permanent record book that survives even if the office burns down (backups!).",
    eventTypes: ["DB_RESPONSE"],
  },
  {
    id: "step-6",
    title: "Cache for fast lookups",
    what: "Copy the mapping to Redis cache for blazing-fast future access.",
    why: "Cache lookup: ~1ms. Database lookup: ~50ms. That's 50x faster!",
    how: "Redis SET with a TTL (time-to-live), so popular URLs stay cached.",
    analogy: "Keeping a sticky note on your desk instead of walking to the filing cabinet each time.",
    eventTypes: ["CACHE_WRITE"],
  },
  {
    id: "step-7",
    title: "Return your short URL!",
    what: "You receive: https://short.ly/abc123 - ready to share!",
    why: "The full round trip completed. Your short URL is now live.",
    how: "HTTP 200 response with JSON containing your new short URL.",
    analogy: "The chef rings the bell - your order is ready to be served!",
    eventTypes: ["HTTP_RESPONSE"],
  },
];

export const redirectCacheHitSteps: EnhancedStep[] = [
  {
    id: "step-1",
    title: "Someone clicks your link",
    what: "A friend clicks https://short.ly/abc123 in your message.",
    why: "They want to visit the original destination without seeing the ugly long URL.",
    how: "Browser sends HTTP GET request to short.ly with path '/abc123'.",
    analogy: "Calling a phone number that automatically forwards to another number.",
    eventTypes: ["HTTP_REQUEST", "LOAD_BALANCE"],
  },
  {
    id: "step-2",
    title: "Check the cache",
    what: "Look up 'abc123' in Redis cache.",
    why: "Cache is in-memory (RAM) - literally millions of times faster than disk.",
    how: "Redis GET command: GET 'url:abc123'",
    analogy: "Checking your pocket for your keys instead of searching the whole house.",
    eventTypes: ["CACHE_CHECK"],
  },
  {
    id: "step-3",
    title: "Cache HIT - Found instantly!",
    what: "The URL was in cache! We found it in ~1 millisecond.",
    why: "Popular URLs are accessed frequently, so they stay 'hot' in cache.",
    how: "Redis returns the long URL immediately from memory.",
    analogy: "Your keys were in your pocket! No need to search anywhere else.",
    eventTypes: ["CACHE_HIT"],
  },
  {
    id: "step-4",
    title: "Track the click",
    what: "Record analytics: time, location, device, referrer.",
    why: "Bitly sells this data as a feature - 'see who's clicking your links!'",
    how: "Fire-and-forget async write to analytics database (doesn't slow response).",
    analogy: "A security camera recording who entered, without making them wait.",
    eventTypes: ["ANALYTICS_TRACK"],
  },
  {
    id: "step-5",
    title: "Redirect to original URL",
    what: "Send HTTP 301 redirect. Browser automatically goes to destination.",
    why: "301 means 'Moved Permanently' - browsers can cache this redirect too.",
    how: "Response header: Location: https://original-long-url.com/...",
    analogy: "The receptionist says 'They moved to Room 205' and you walk there.",
    eventTypes: ["HTTP_RESPONSE"],
  },
];

export const redirectCacheMissSteps: EnhancedStep[] = [
  {
    id: "step-1",
    title: "Someone clicks a less popular link",
    what: "A rarely-clicked link like xyz789 is accessed.",
    why: "Links that aren't clicked often get evicted from cache to save memory.",
    how: "Same HTTP GET request, but this URL hasn't been accessed recently.",
    analogy: "Looking for a rarely-used tool that's not in your everyday toolbox.",
    eventTypes: ["HTTP_REQUEST", "LOAD_BALANCE"],
  },
  {
    id: "step-2",
    title: "Check the cache",
    what: "Look up 'xyz789' in Redis...",
    why: "We always check cache first because it's so much faster.",
    how: "Redis GET 'url:xyz789'",
    analogy: "Checking your desk for the file before going to the storage room.",
    eventTypes: ["CACHE_CHECK"],
  },
  {
    id: "step-3",
    title: "Cache MISS - not found",
    what: "The URL isn't in cache. It expired or was evicted.",
    why: "Cache has limited memory. Old/unpopular items get removed (LRU policy).",
    how: "Redis returns nil/null - we need to check the database.",
    analogy: "The file isn't on your desk - time to check the filing cabinet.",
    eventTypes: ["CACHE_MISS"],
  },
  {
    id: "step-4",
    title: "Query the database",
    what: "Look up the short code in PostgreSQL.",
    why: "Database is the 'source of truth' - it has ALL URLs, not just popular ones.",
    how: "SELECT long_url FROM urls WHERE short_code = 'xyz789'",
    analogy: "Walking to the filing cabinet and searching alphabetically.",
    eventTypes: ["DB_QUERY"],
  },
  {
    id: "step-5",
    title: "Database returns the URL",
    what: "Found it! The database returns the original long URL.",
    why: "The permanent storage never forgets (unless explicitly deleted).",
    how: "Query returns one row with the long_url column.",
    analogy: "Found the file! Now you have the information you need.",
    eventTypes: ["DB_RESPONSE"],
  },
  {
    id: "step-6",
    title: "Cache for next time",
    what: "Store in Redis so future clicks are instant.",
    why: "Since someone clicked it, they (or others) might click again soon.",
    how: "Redis SET 'url:xyz789' with TTL of 24 hours.",
    analogy: "Making a copy for your desk so you don't have to walk to storage again.",
    eventTypes: ["CACHE_WRITE"],
  },
  {
    id: "step-7",
    title: "Redirect to original URL",
    what: "Send 301 redirect - slightly slower but still fast!",
    why: "Total time: ~50ms instead of ~1ms. Still feels instant to humans.",
    how: "HTTP 301 with Location header pointing to original URL.",
    analogy: "You found what you needed - just took a bit longer this time.",
    eventTypes: ["HTTP_RESPONSE"],
  },
];

// Educational content for each scenario
export const urlShortenerEducationalContent = {
  "create-url": {
    learningGoals: [
      {
        title: "Hash/ID Generation",
        description: "How to create unique short codes that never collide",
      },
      {
        title: "Write-through Caching",
        description: "Cache data as you write it for fast future reads",
      },
      {
        title: "Rate Limiting",
        description: "Protect your API from abuse and spam",
      },
      {
        title: "Database Design",
        description: "Simple key-value mapping with proper indexing",
      },
    ],
    keyTakeaways: [
      "Base62 encoding with 7 characters = 3.5 trillion possible URLs",
      "Write to database FIRST (durability), then cache (speed)",
      "Rate limiting protects against both abuse and accidental overload",
      "Hash collisions are rare but must be handled (regenerate if collision)",
    ],
    designDecisions: [
      {
        decision: "Base62 instead of Base64",
        reason: "Base64 includes +/ which cause URL encoding issues. Base62 is URL-safe.",
      },
      {
        decision: "7 character codes",
        reason: "62^7 = 3.5 trillion codes. Enough for centuries of URLs!",
      },
      {
        decision: "Write-through cache",
        reason: "Every new URL is immediately cached, preventing first-access latency.",
      },
    ],
    interviewTips: [
      "Always discuss trade-offs: short codes vs. collision probability",
      "Mention alternatives: sequential IDs vs. hashing",
      "Discuss scaling: database sharding by short_code prefix",
    ],
  },
  "redirect-hit": {
    learningGoals: [
      {
        title: "Cache-First Architecture",
        description: "Always check fast cache before slow database",
      },
      {
        title: "301 vs 302 Redirects",
        description: "When to use permanent vs temporary redirects",
      },
      {
        title: "Async Analytics",
        description: "Track data without slowing user experience",
      },
    ],
    keyTakeaways: [
      "Cache hit = ~1ms response. This is why Bitly feels instant!",
      "301 (permanent) redirects can be cached by browsers",
      "Analytics tracking happens asynchronously - doesn't block response",
      "Popular URLs stay 'hot' in cache, rarely need database",
    ],
    designDecisions: [
      {
        decision: "301 Permanent Redirect",
        reason: "Allows browser caching. But use 302 if you want to track every click.",
      },
      {
        decision: "Async analytics write",
        reason: "User experience > analytics. Fire-and-forget to not slow redirect.",
      },
    ],
    interviewTips: [
      "Discuss cache eviction policies (LRU, TTL)",
      "Mention 301 vs 302 trade-off (caching vs analytics accuracy)",
      "Consider cache warm-up strategies for popular URLs",
    ],
  },
  "redirect-miss": {
    learningGoals: [
      {
        title: "Cache Miss Handling",
        description: "What happens when data isn't in cache",
      },
      {
        title: "Cache Population",
        description: "Loading cache on-demand when misses occur",
      },
      {
        title: "Performance Degradation",
        description: "Graceful slowdown, not failure",
      },
    ],
    keyTakeaways: [
      "Cache miss adds ~50ms latency - still fast for humans!",
      "After miss, data is cached for next request (lazy loading)",
      "System still works without cache - just slower",
      "TTL expiration causes predictable misses over time",
    ],
    designDecisions: [
      {
        decision: "Cache on miss (lazy loading)",
        reason: "Only cache what's actually needed. Saves memory for rarely-used URLs.",
      },
      {
        decision: "24-hour TTL",
        reason: "Balance between memory usage and hit rate. Adjust based on access patterns.",
      },
    ],
    interviewTips: [
      "Discuss cache stampede prevention (locking, probabilistic expiration)",
      "Mention cold start problem after cache restart",
      "Consider pre-warming cache with popular URLs",
    ],
  },
};

export const urlShortenerScenarios = {
  "create-url": {
    name: "Create Short URL",
    description: "Generate a new short URL with hash creation, database storage, and caching",
    getEvents: createShortUrlScenario,
    steps: createShortUrlSteps,
    keyInsight: "Hash Function: Creates a unique 7-character code from any URL instantly.",
  },
  "redirect-hit": {
    name: "Redirect (Cache Hit)",
    description: "Fast redirect using cached URL mapping - no database query needed",
    steps: redirectCacheHitSteps,
    keyInsight: "Cache Hit: ~1ms response time. This is why Bitly feels instant!",
    getEvents: redirectScenarioCacheHit,
  },
  "redirect-miss": {
    name: "Redirect (Cache Miss)",
    description: "Redirect with cache miss - requires database query and cache update",
    getEvents: redirectScenarioCacheMiss,
    steps: redirectCacheMissSteps,
    keyInsight: "Cache Miss: ~50ms response. Still fast, but 50x slower than cache hit!",
  },
};
