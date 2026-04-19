import Link from "next/link";
import { ArrowRight, Link as LinkIcon, MessageCircle } from "lucide-react";

const visualizers = [
  {
    id: "url-shortener",
    title: "URL Shortener (Bitly)",
    description: "Explore URL shortening with hash generation, caching, and analytics. Learn about distributed systems and database design.",
    href: "/visualizers/url-shortener",
    icon: LinkIcon,
    topics: ["Hashing", "Caching", "Rate Limiting", "Analytics"],
  },
  {
    id: "twitter",
    title: "Design Twitter/X",
    description: "Visualize tweet posting, timeline generation, and fan-out patterns. Understand social media architecture at scale.",
    href: "/visualizers/twitter",
    icon: MessageCircle,
    topics: ["Fan-out", "Timelines", "Sharding", "Message Queue"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
            System Design Visualizer
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Interactive, real-time simulations of popular system design problems.
            Watch data flow through distributed systems with animated visualizations.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {visualizers.map((viz) => {
            const Icon = viz.icon;
            return (
              <Link
                key={viz.id}
                href={viz.href}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {viz.title}
                    </h2>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {viz.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {viz.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        <footer className="text-center mt-16 text-slate-500 dark:text-slate-500">
          <p className="text-sm">
            Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion
          </p>
        </footer>
      </div>
    </div>
  );
}
