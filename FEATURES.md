# System Design Visualizer - Interactive Features

## New Interactive Enhancements

### 1. **Step-by-Step Explanations** 📖
A real-time explanation panel shows what's happening at each stage of the simulation:
- Located between the scenario selector and the visualization
- Updates automatically as the simulation plays
- Explains the purpose of each event (HTTP request, cache check, database query, etc.)
- Shows the data flow path (source → target)

### 2. **Interactive Components** 🖱️
**Click on any component** in the architecture diagram to learn more about it:
- **Client** - Learn about user requests and rate limiting
- **Load Balancer** - Understand traffic distribution algorithms
- **API Server** - See how business logic is coordinated
- **Cache (Redis)** - Discover caching strategies and hit rates
- **Database** - Understand persistence and sharding
- **Hash Generator** - Learn about URL shortening algorithms

**Features:**
- Hover effect shows the component is clickable
- Click to open a detailed information modal
- Modal includes:
  - Component description and purpose
  - Key features and capabilities
  - Technical details specific to that component

### 3. **Visual Flow Indicators** ✨
- **Active connections** light up when data flows through them
- **Animated data packets** show requests moving between components
- **Component states** change color based on activity:
  - Idle: Gray
  - Processing: Blue/Purple/Amber (depending on component type)
  - Success: Green
  - Error: Red

### 4. **Real-Time Metrics Dashboard** 📊
Live updates showing:
- Total requests processed
- Successful vs failed requests
- Cache hit rate with percentage
- Database queries executed
- Average latency

### 5. **Interactive Timeline** ⏱️
- Scrub through the simulation by dragging the playhead
- Click anywhere on the timeline to jump to that moment
- Event markers show when key actions occur
- Hover to see exact timestamps

### 6. **Filterable Event Log** 📝
- See all events in chronological order
- Filter by event type (HTTP, Cache, Database, etc.)
- Click on an event to jump to that point in the timeline
- Color-coded by event type

## How to Use

### Getting Started
1. **Select a Scenario**: Choose from Create URL, Redirect (Cache Hit), or Redirect (Cache Miss)
2. **Press Play**: Watch the simulation animate in real-time
3. **Read the Explanation**: See what's happening at each step
4. **Click Components**: Learn about each part of the system
5. **Adjust Speed**: Use 0.5x, 1x, 2x, or 4x playback speed
6. **Explore Timeline**: Scrub back and forth to review specific moments

### Learning Path
1. Start with "Create Short URL" to see the full process
2. Click on each component to understand its role
3. Try "Redirect (Cache Hit)" to see the fast path
4. Compare with "Redirect (Cache Miss)" to see the difference
5. Watch the metrics to understand performance implications

## Key Concepts Explained

### Cache Hit vs Cache Miss
- **Cache Hit**: Data found in cache = fast response (~50ms)
- **Cache Miss**: Need to query database = slower (~800ms+)
- Watch how the cache hit rate affects overall system performance

### Request Flow
1. Client → Load Balancer (traffic distribution)
2. Load Balancer → API Server (request routing)
3. API Server → Cache (fast lookup)
4. If cache miss → Database (persistent storage)
5. Response back to client

### Why This Matters
- **Caching** reduces database load by 80-90%
- **Load balancing** enables horizontal scaling
- **Hash generation** creates collision-free short codes
- **Analytics** track usage without blocking main flow

## Technical Implementation

### Built With
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Architecture
- Event-driven simulation engine
- Component-based visualization
- Reusable animation system
- Modal-based educational content
- Real-time metrics calculation

## Future Enhancements
- Twitter/X visualizer with fan-out patterns
- More system design problems (YouTube, Instagram, Uber)
- Code view showing actual implementation
- Export simulation as video/GIF
- Mobile responsive design
- Dark mode toggle
