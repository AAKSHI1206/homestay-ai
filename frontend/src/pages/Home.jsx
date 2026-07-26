import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import Hero from "../components/Hero";
import Card from "../components/Card";

/**
 * Home — SaaS Landing Page
 * ────────────────────────
 * Sections: Hero, Features, How AI Works, Demo Preview,
 * Benefits, Testimonials, CTA.
 */

const FEATURES = [
  {
    icon: "🤖",
    title: "AI Sentiment Analysis",
    desc: "Powered by Google Gemini AI to classify reviews as positive, negative, neutral, or mixed with confidence scores.",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    desc: "Track sentiment trends, top themes, and review statistics across all your properties in one place.",
  },
  {
    icon: "🏡",
    title: "Property Management",
    desc: "Manage multiple homestays with full CRUD operations — create, edit, and organize your listings effortlessly.",
  },
  {
    icon: "💬",
    title: "Smart Responses",
    desc: "Get AI-generated professional response suggestions for every guest review to save time and improve communication.",
  },
  {
    icon: "🔖",
    title: "Review History",
    desc: "Save, bookmark, search, and export your review analyses. Build a knowledge base of guest feedback over time.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "JWT authentication, protected routes, and user-scoped data ensure your reviews and properties stay private.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Paste a Guest Review",
    desc: "Copy any guest review from your booking platform and paste it into the analyzer.",
  },
  {
    step: "02",
    title: "AI Analyzes Sentiment",
    desc: "Google Gemini AI processes the review, identifying sentiment, themes, and key insights.",
  },
  {
    step: "03",
    title: "Get Actionable Insights",
    desc: "Receive a sentiment score, theme classification, summary, and a suggested professional response.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "HomestayAI transformed how I handle guest feedback. The AI responses save me hours every week!",
    name: "Ramesh Sharma",
    role: "Homestay Owner, Mussoorie",
  },
  {
    quote:
      "The analytics dashboard helps me identify recurring issues across my properties instantly.",
    name: "Sunita Rawat",
    role: "Property Manager, Rishikesh",
  },
  {
    quote:
      "Finally, a tool that understands Indian hospitality context. The sentiment analysis is incredibly accurate.",
    name: "Kavya Nair",
    role: "Eco-Lodge Owner, Coorg",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <Hero />

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
            Everything You Need to Manage Guest Reviews
          </h2>
          <p className="mt-3 text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
            From AI-powered analysis to comprehensive analytics, HomestayAI
            gives you the tools to improve guest satisfaction.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="p-6 group">
              <span className="text-3xl" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-stone-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                {feature.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* How AI Works */}
      <section className="bg-stone-50 dark:bg-stone-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-3 text-stone-500 dark:text-stone-400">
              Three simple steps to unlock the power of AI for your reviews.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.step} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-px w-full bg-gradient-to-r from-brand-300 to-transparent md:block" />
                )}
                <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-xl font-bold text-brand-700 dark:bg-brand-800/40 dark:text-brand-200">
                  {step.step}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-stone-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-brand-50 to-pine-50 dark:border-stone-700 dark:from-stone-800 dark:to-stone-900">
          <div className="p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
              See AI Analysis in Action
            </h2>
            <p className="mt-3 max-w-xl text-stone-600 dark:text-stone-300">
              Paste any guest review and get instant sentiment analysis,
              key themes, a summary, and a professional response suggestion.
            </p>

            <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-600 dark:bg-stone-800">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-stone-500 dark:text-stone-400">
                    Sample Input
                  </p>
                  <p className="mt-2 rounded-lg bg-stone-50 p-3 text-sm italic text-stone-600 dark:bg-stone-900 dark:text-stone-300">
                    "What an incredible stay! The mountain views were breathtaking
                    and the host was so welcoming. The homemade breakfast was
                    a highlight…"
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-stone-500 dark:text-stone-400">
                    AI Output
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-200">
                        Positive — 94%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {["hospitality", "food quality", "scenery"].map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-800/40 dark:text-brand-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/reviews">
                <Button>Try It Now →</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-stone-50 dark:bg-stone-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
            What Homestay Owners Say
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6">
                <p className="text-sm italic text-stone-600 dark:text-stone-300 leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-800/40 dark:text-brand-200">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-white">
                      {t.name}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {t.role}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 px-8 py-12 text-center text-white sm:px-16 sm:py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to Transform Your Guest Reviews?
          </h2>
          <p className="mt-3 text-brand-100 max-w-xl mx-auto">
            Join homestay owners who use AI to understand their guests better
            and improve their properties.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button
                size="lg"
                className="!bg-white !text-brand-700 hover:!bg-brand-50"
              >
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="!border-white/40 !text-white hover:!bg-white/10"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
