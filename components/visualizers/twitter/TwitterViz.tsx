"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSimulationStore } from "@/lib/simulation/store";
import {
  twitterComponents,
  twitterScenarios,
  twitterEducationalContent,
} from "@/lib/simulation/scenarios/twitter";
import { TwitterFlow, CustomComponentInfo } from "./TwitterFlow";
import { ControlPanel } from "@/components/simulation/ControlPanel";
import { Timeline } from "@/components/simulation/Timeline";
import { EnhancedStepIndicator, EnhancedStep } from "@/components/simulation/EnhancedStepIndicator";
import { EducationalIntro, ArchitectureOverview, SummaryTakeaways } from "@/components/simulation/EducationalIntro";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  MessageCircle,
  X,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Users,
  Database,
  Server,
  Zap,
  Eye,
  EyeOff,
  BookOpen,
  PlayCircle
} from "lucide-react";
import { ComponentType } from "@/types/simulation";

// Custom Info Modal for Twitter components
function TwitterInfoModal({
  info,
  onClose,
}: {
  info: CustomComponentInfo;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold">{info.name}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sky-100 leading-relaxed">{info.description}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Purpose */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wide">
                What it does
              </h3>
              <p className="text-blue-900 dark:text-blue-100 leading-relaxed">
                {info.purpose}
              </p>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                Key Features
              </h3>
              <ul className="space-y-2">
                {info.keyFeatures.map((feature, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3 text-slate-700 dark:text-slate-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

type ViewMode = "learn" | "simulate";

export function TwitterViz() {
  const { setComponents, setEvents, reset } = useSimulationStore();
  const [selectedScenario, setSelectedScenario] = useState<string>("post-tweet");
  const [currentSteps, setCurrentSteps] = useState<EnhancedStep[]>([]);
  const [selectedInfo, setSelectedInfo] = useState<CustomComponentInfo | null>(null);
  const [keyInsight, setKeyInsight] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("learn");
  const [showIntro, setShowIntro] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setComponents(twitterComponents);
    loadScenario("post-tweet");

    return () => {
      reset();
    };
  }, []);

  const loadScenario = (scenarioKey: string) => {
    const scenario = twitterScenarios[scenarioKey as keyof typeof twitterScenarios];
    if (scenario) {
      reset();
      setComponents(twitterComponents);
      setEvents(scenario.getEvents());
      setSelectedScenario(scenarioKey);
      setCurrentSteps(scenario.steps);
      setKeyInsight(scenario.keyInsight);
      setShowSummary(false);
    }
  };

  const handleComponentClick = (
    type: ComponentType,
    label: string,
    customInfo?: CustomComponentInfo
  ) => {
    if (customInfo) {
      setSelectedInfo(customInfo);
    }
  };

  const currentEducation = twitterEducationalContent[selectedScenario as keyof typeof twitterEducationalContent];

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
              title="Design Twitter/X"
              icon={<MessageCircle className="w-8 h-8 text-white" />}
              iconBgColor="bg-sky-500"
              problemStatement="How do you deliver tweets to hundreds of millions of users in real-time? When someone with 50 million followers posts, how do all those people see it instantly?"
              realWorldExample="Twitter handles 500 million tweets per day, with some users having over 100 million followers. Your timeline needs to load in under 200ms."
              scale="~6,000 tweets per second, 800 billion timeline requests per day"
              learningGoals={currentEducation.learningGoals}
              prerequisites={["HTTP basics", "Databases (SQL)", "Caching concepts"]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simplified Architecture Overview (Learn Mode) */}
      {viewMode === "learn" && (
        <ArchitectureOverview
          title="The Key Components"
          description="Twitter's architecture can be simplified to these main pieces. Click on any component in the diagram below to learn more!"
          components={[
            {
              name: "API Gateway",
              role: "Front door",
              icon: <Server className="w-6 h-6 text-blue-500" />,
              color: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
            },
            {
              name: "Tweet Service",
              role: "Saves tweets",
              icon: <MessageCircle className="w-6 h-6 text-sky-500" />,
              color: "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-900/20",
            },
            {
              name: "Fan-out Service",
              role: "Distributes to followers",
              icon: <Users className="w-6 h-6 text-purple-500" />,
              color: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20",
            },
            {
              name: "Redis Cache",
              role: "Fast timeline storage",
              icon: <Zap className="w-6 h-6 text-green-500" />,
              color: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
            },
          ]}
        />
      )}

      {/* Scenario Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Choose a Scenario</CardTitle>
          <CardDescription>
            Pick a user action to see how Twitter handles it behind the scenes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {Object.entries(twitterScenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => loadScenario(key)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedScenario === key
                    ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-lg"
                    : "border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700"
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
              <TwitterFlow onComponentClick={handleComponentClick} />
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
            <CardTitle>Understanding Twitter's Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2 text-lg">
                  Fan-out on Write
                </h3>
                <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                  When you tweet, your message is <strong>pushed</strong> to every
                  follower's timeline cache immediately. This makes reading timelines
                  super fast, but posting is more work.
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
                  Best for: Users with fewer followers
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800">
                <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-2 text-lg">
                  Fan-out on Read
                </h3>
                <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                  For celebrities, tweets are <strong>pulled</strong> when followers
                  load their timeline. No need to push to millions of caches!
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-3">
                  Best for: Celebrities with millions of followers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Info Modal */}
      {selectedInfo && (
        <TwitterInfoModal
          info={selectedInfo}
          onClose={() => setSelectedInfo(null)}
        />
      )}
    </div>
  );
}
