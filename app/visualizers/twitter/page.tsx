import { TwitterViz } from "@/components/visualizers/twitter/TwitterViz";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TwitterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <TwitterViz />
      </div>
    </div>
  );
}
