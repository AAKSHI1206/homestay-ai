import { Link } from "react-router-dom";
import { Button } from "../components/ui";

/**
 * Hero
 * ────
 * Landing page hero section with gradient background,
 * headline, description, and CTA buttons.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-pine-50 dark:from-stone-925 dark:via-stone-900 dark:to-stone-925" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-700/10" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-pine-100/40 blur-3xl dark:bg-pine-700/10" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-700/40 dark:bg-brand-900/30 dark:text-brand-300 animate-fade-in">
          ✨ Powered by Google Gemini AI
        </span>

        {/* Headline */}
        <h1 className="max-w-4xl text-4xl font-bold leading-tight text-stone-900 dark:text-white sm:text-5xl lg:text-6xl animate-fade-in">
          Understand Your Guest Reviews{" "}
          <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-600">
            with AI
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl text-lg text-stone-600 dark:text-stone-300 animate-fade-in">
          HomestayAI analyzes guest reviews using AI sentiment analysis, giving
          homestay owners actionable insights to improve their properties and
          boost guest satisfaction.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3 animate-fade-in">
          <Link to="/register">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 flex flex-wrap justify-center gap-8 text-center animate-fade-in">
          {[
            { value: "AI-Powered", label: "Sentiment Analysis" },
            { value: "Real-time", label: "Review Insights" },
            { value: "Actionable", label: "Business Suggestions" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
