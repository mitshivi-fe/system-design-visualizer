import { UrlShortenerViz } from "@/components/visualizers/url-shortener/UrlShortenerViz";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function UrlShortenerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <UrlShortenerViz />
      </div>
    </div>
  );
}
