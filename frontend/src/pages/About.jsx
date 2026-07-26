import { Link } from "react-router-dom";
import { Button, Badge } from "../components/ui";
import Card from "../components/Card";

/**
 * About Page
 * ──────────
 * Provides full context on the HomestayAI project, architecture,
 * technology stack, and AI workflow.
 */

const TECH_STACK = [
  {
    category: "Frontend",
    title: "React & Tailwind CSS v4",
    desc: "Modern React architecture using Vite, Context API for authentication & theming, and custom Himalayan-inspired vanilla & Tailwind tokens.",
    icon: "⚛️",
    tags: ["React 19", "Vite", "Tailwind v4", "Responsive"],
  },
  {
    category: "Backend API",
    title: "Node.js & Express",
    desc: "RESTful backend architecture with JWT authentication, custom role/owner scoping, robust error handling, and rate limiting.",
    icon: "🟢",
    tags: ["Express", "JWT", "Security", "Rate Limiting"],
  },
  {
    category: "Database",
    title: "MongoDB & Mongoose",
    desc: "Document database storing user accounts, properties, and persisted AI review analyses for historical tracking and trends.",
    icon: "🍃",
    tags: ["MongoDB", "Mongoose", "Schema Validation"],
  },
  {
    category: "Artificial Intelligence",
    title: "Google Gemini AI",
    desc: "Integration with @google/genai SDK using structured schema prompts to evaluate guest review sentiment, themes, and responses.",
    icon: "✨",
    tags: ["Gemini 1.5/2.0", "Prompt Engineering", "JSON Schema"],
  },
];

const WORKFLOW_STEPS = [
  {
    step: "1. Data Ingestion",
    desc: "Guest feedback is submitted via the frontend analyzer or API.",
  },
  {
    step: "2. Prompt Synthesis",
    desc: "Backend constructs a strict schema-enforced JSON prompt with timeout protection.",
  },
  {
    step: "3. Gemini Execution",
    desc: "AI classifies sentiment (positive, negative, neutral, mixed) with confidence scores.",
  },
  {
    step: "4. Actionable Response",
    desc: "System formats a polite host response, identifies key themes, and persists to history.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      {/* Header */}
      <div className="text-center">
        <Badge variant="featured" className="mb-3">
          Week 8 Complete Implementation
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">
          About Homestay<span className="text-brand-500">AI</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-stone-600 dark:text-stone-300">
          An AI-powered hospitality platform designed to help homestay owners
          manage listings, decipher guest reviews, and optimize guest experiences through
          state-of-the-art Natural Language Processing.
        </p>
      </div>

      {/* Vision Section */}
      <div className="mt-12 overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-brand-50/60 via-white to-pine-50/60 p-8 dark:border-stone-700 dark:from-stone-800 dark:via-stone-900 dark:to-stone-850">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-white">
          Our Vision & Mission
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          In rural and scenic tourist destinations—from the foothills of the Himalayas to the backwaters of Kerala—local hosts provide authentic experiences but frequently struggle with manual review analysis and online communication. HomestayAI bridges traditional hospitality with cutting-edge AI, enabling property managers to extract actionable business metrics, identify operational friction points (e.g., WiFi, cleanliness, dining), and automatically draft polite, context-aware responses to guest evaluations.
        </p>
      </div>

      {/* Technology Stack */}
      <div className="mt-14">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white text-center sm:text-2xl">
          Architecture & Technology Stack
        </h2>
        <p className="mt-2 text-center text-sm text-stone-500 dark:text-stone-400">
          Built using industry best practices for modularity, security, and aesthetics.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {TECH_STACK.map((tech) => (
            <Card key={tech.title} className="p-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {tech.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">
                    {tech.category}
                  </p>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    {tech.title}
                  </h3>
                </div>
              </div>
              <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">
                {tech.desc}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tech.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Workflow */}
      <div className="mt-14 rounded-2xl border border-stone-200 bg-stone-50 p-8 dark:border-stone-700 dark:bg-stone-850">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white text-center">
          How the AI Sentiment Engine Works
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                {step.step}
              </span>
              <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Ready to experience AI-powered homestay management?
        </p>
        <div className="flex gap-3">
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link to="/reviews">
            <Button variant="outline">Test Review Analyzer</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
