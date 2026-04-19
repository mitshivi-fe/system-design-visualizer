"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/lib/simulation/store";
import {
  urlShortenerComponents,
  urlShortenerScenarios,
  urlShortenerEducationalContent,
} from "@/lib/simulation/scenarios/url-shortener";
import { ShortenerFlow } from "./ShortenerFlow";
import { ControlPanel } from "@/components/simulation/ControlPanel";
import { Timeline } from "@/components/simulation/Timeline";
import { EnhancedStepIndicator, EnhancedStep } from "@/components/simulation/EnhancedStepIndicator";
import { EducationalIntro, ArchitectureOverview, SummaryTakeaways } from "@/components/simulation/EducationalIntro";
import { ComponentInfoModal } from "@/components/simulation/ComponentInfoModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Link as LinkIcon,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  BookOpen,
  PlayCircle,
  Server,
  Database,
  Zap,
  Hash
} from "lucide-react";
import { ComponentType } from "@/types/simulation";

type ViewMode = "learn" | "simulate";

export function UrlShortenerViz() {
  const { setComponents, setEvents, reset } = useSimulationStore();
  const [selectedScenario, setSelectedScenario] = useState<string>("create-url");
  const [currentSteps, setCurrentSteps] = useState<EnhancedStep[]>([]);
  const [keyInsight, setKeyInsight] = useState<string>("");
  const [selectedComponent, setSelectedComponent] = useState<{
    type: ComponentType;
    label: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("learn");
  const [showIntro, setShowIntro] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setComponents(urlShortenerComponents);
    loadScenario("create-url");

    return () => {
      reset();
    };
  }, []);

  const loadScenario = (scenarioKey: string) => {
    const scenario = urlShortenerScenarios[scenarioKey as keyof typeof urlShortenerScenarios];
    if (scenario) {
      reset();
      setComponents(urlShortenerComponents);
      setEvents(scenario.getEvents());
      setSelectedScenario(scenarioKey);
      setCurrentSteps(scenario.steps || []);
      setKeyInsight(scenario.keyInsight || "");
      setShowSummary(false);
    }
  };

  const handleComponentClick = (type: ComponentType, label: string) => {
    setSelectedComponent({ type, label });
  };

  const currentEducation = urlShortenerEducationalContent[selectedScenario as keyof typeof urlShortenerEducationalContent];

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setViewMode("learn")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === "learn"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Learn Mode
          </button>
          <button
            onClick={() => setViewMode("simulate")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === "simulate"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            Simulate Mode
          </button>
        </div>

        <button
          onClick={() => setShowIntro(!showIntro)}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          {showIntro ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showIntro ? "Hide Intro" : "Show Intro"}
        </button>
      </div>

      {/* Educational Introduction */}
      <AnimatePresence>
        {showIntro && viewMode === "learn" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <EducationalIntro
              title="URL Shortener (Bitly)"
              icon={<LinkIcon className="w-8 h-8 text-white" />}
              iconBgColor="bg-blue-500"
              problemStatement="How do you turn a 200-character URL into a 7-character code that redirects instantly? And how do you handle billions of redirects per day?"
              realWorldExample="Bitly shortens 600 million links per month and handles 10 billion+ clicks. Each redirect must happen in under 100ms."
              scale="~300 redirects per second, 99.9% uptime requirement"
              learningGoals={currentEducation?.learningGoals || []}
              prerequisites={["HTTP basics", "Databases", "Caching"]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simplified Architecture Overview (Learn Mode) */}
      {viewMode === "learn" && (
        <ArchitectureOverview
          title="The Key Components"
          description="A URL shortener is elegantly simple. Here are the main pieces - click on any component in the diagram to learn more!"
          components={[
            {
              name: "Load Balancer",
              role: "Traffic director",
              icon: <Server className="w-6 h-6 text-blue-500" />,
              color: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
            },
            {
              name: "Hash Generator",
              role: "Creates short codes",
              icon: <Hash className="w-6 h-6 text-purple-500" />,
              color: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20",
            },
            {
              name: "Redis Cache",
              role: "Fast lookups",
              icon: <Zap className="w-6 h-6 text-green-500" />,
              color: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
            },
            {
              name: "PostgreSQL",
              role: "Permanent storage",
              icon: <Database className="w-6 h-6 text-orange-500" />,
              color: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20",
            },
          ]}
        />
      )}

      {/* Scenario Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Choose a Scenario</CardTitle>
          <CardDescription>
            Pick a user action to see how the system handles it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {Object.entries(urlShortenerScenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => loadScenario(key)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedScenario === key
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                    : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {scenario.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {scenario.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insight Banner */}
      {keyInsight && (
        <motion.div
          key={keyInsight}
          className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 flex items-center gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-2 bg-amber-500 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm uppercase tracking-wide">
              Key Insight
            </h3>
            <p className="text-amber-800 dark:text-amber-300">{keyInsight}</p>
          </div>
        </motion.div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Step Indicator - Left Column */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">What's Happening</CardTitle>
              <CardDescription>
                Click each step to see the What, Why, and How
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedStepIndicator steps={currentSteps} showDetails={viewMode === "learn"} />
            </CardContent>
          </Card>
        </div>

        {/* Visualization - Right Column */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>
                Click any component to learn what it does
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShortenerFlow onComponentClick={handleComponentClick} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <ControlPanel />

      {/* Timeline */}
      <Card>
        <CardContent className="pt-6">
          <Timeline />
        </CardContent>
      </Card>

      {/* Show Summary Toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          {showSummary ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Hide Key Takeaways
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              Show Key Takeaways & Summary
            </>
          )}
        </button>
      </div>

      {/* Summary Section */}
      <AnimatePresence>
        {showSummary && currentEducation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <SummaryTakeaways
              keyTakeaways={currentEducation.keyTakeaways}
              designDecisions={currentEducation.designDecisions}
              interviewTips={currentEducation.interviewTips}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Educational Content (simplified for simulate mode) */}
      {viewMode === "simulate" && (
        <Card>
          <CardHeader>
            <CardTitle>Understanding URL Shorteners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2 text-lg">
                  Hash Generation
                </h3>
                <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                  Uses <strong>Base62 encoding</strong> (a-z, A-Z, 0-9) to create
                  7-character codes. That's 3.5 trillion possible URLs!
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
                  Example: abc123X → https://long-url.com/page
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-100 dark:border-green-800">
                <h3 className="font-bold text-green-900 dark:text-green-200 mb-2 text-lg">
                  Redis Cache
                </h3>
                <p className="text-green-800 dark:text-green-300 leading-relaxed">
                  Popular URLs are stored in Redis for <strong>instant lookups</strong>.
                  Cache hit = 1ms, Database = 50ms+
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-3">
                  Cache hit rate: typically 95%+
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800">
                <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-2 text-lg">
                  Database (PostgreSQL)
                </h3>
                <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                  Permanent storage for all URL mappings. Indexed by short_code
                  for fast lookups even with <strong>billions of URLs</strong>.
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-3">
                  Sharded across multiple servers
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5 border border-orange-100 dark:border-orange-800">
                <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-2 text-lg">
                  301 Redirect
                </h3>
                <p className="text-orange-800 dark:text-orange-300 leading-relaxed">
                  When you click a short link, the server sends a <strong>301 redirect</strong>.
                  Your browser automatically goes to the original URL.
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-3">
                  301 = "Moved Permanently"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Info Modal */}
      {selectedComponent && (
        <ComponentInfoModal
          componentType={selectedComponent.type}
          componentLabel={selectedComponent.label}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
}
