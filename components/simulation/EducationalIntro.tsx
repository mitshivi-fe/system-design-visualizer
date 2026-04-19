"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import {
  Target,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface LearningGoal {
  title: string;
  description: string;
}

interface EducationalIntroProps {
  title: string;
  icon: ReactNode;
  iconBgColor: string;
  problemStatement: string;
  realWorldExample: string;
  scale: string;
  learningGoals: LearningGoal[];
  prerequisites?: string[];
}

export function EducationalIntro({
  title,
  icon,
  iconBgColor,
  problemStatement,
  realWorldExample,
  scale,
  learningGoals,
  prerequisites,
}: EducationalIntroProps) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 ${iconBgColor} rounded-2xl`}>
              {icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-slate-300 mt-1">System Design Deep Dive</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* The Problem */}
            <div className="bg-white/5 backdrop-blur rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-amber-400">The Problem</h3>
              </div>
              <p className="text-slate-200 leading-relaxed">{problemStatement}</p>
            </div>

            {/* Real World Scale */}
            <div className="bg-white/5 backdrop-blur rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-green-400">Real World Scale</h3>
              </div>
              <p className="text-slate-200 leading-relaxed">{realWorldExample}</p>
              <p className="text-sm text-slate-400 mt-2">{scale}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            What You'll Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {learningGoals.map((goal, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">{goal.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{goal.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites (optional) */}
      {prerequisites && prerequisites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              Good to Know First
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {prerequisites.map((prereq, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                >
                  {prereq}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Simplified Architecture Overview Component
interface ArchitectureOverviewProps {
  title: string;
  description: string;
  components: {
    name: string;
    role: string;
    icon: ReactNode;
    color: string;
  }[];
}

export function ArchitectureOverview({ title, description, components }: ArchitectureOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {components.map((comp, index) => (
            <motion.div
              key={index}
              className={`p-4 rounded-xl border-2 ${comp.color} text-center`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex justify-center mb-2">{comp.icon}</div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{comp.name}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{comp.role}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Summary/Takeaways Component
interface TakeawayProps {
  keyTakeaways: string[];
  designDecisions: {
    decision: string;
    reason: string;
  }[];
  interviewTips?: string[];
}

export function SummaryTakeaways({ keyTakeaways, designDecisions, interviewTips }: TakeawayProps) {
  return (
    <div className="space-y-6">
      {/* Key Takeaways */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {keyTakeaways.map((takeaway, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300">{takeaway}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Design Decisions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Why We Made These Choices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {designDecisions.map((decision, index) => (
              <motion.div
                key={index}
                className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  {decision.decision}
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {decision.reason}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interview Tips */}
      {interviewTips && interviewTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Interview Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {interviewTips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-slate-700 dark:text-slate-300"
                >
                  <span className="text-purple-500 font-bold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
