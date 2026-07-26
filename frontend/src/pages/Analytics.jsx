import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button, Loader, useToast, EmptyState } from "../components/ui";
import Card from "../components/Card";
import { fetchAnalytics, fetchReviewHistory } from "../api/reviewApi";
import { fetchListings } from "../api/listingsApi";

const COLORS = {
  positive: "#10b981", // emerald-500
  negative: "#ef4444", // red-500
  neutral: "#78716c",  // stone-500
  mixed: "#f59e0b",    // amber-500
};

export default function Analytics() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [listings, setListings] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(searchParams.get("property") || "");
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty]);

  async function loadData() {
    setLoading(true);
    try {
      // Load general analytics, listings, and filtered reviews
      const [analyticsRes, listingsRes, historyRes] = await Promise.all([
        fetchAnalytics(selectedProperty ? { listingId: selectedProperty } : undefined),
        fetchListings().catch(() => ({ data: [] })),
        fetchReviewHistory({ limit: 50, listingId: selectedProperty || undefined }).catch(() => ({ data: [] })),
      ]);

      setAnalytics(analyticsRes.data || null);
      setListings(listingsRes.data || []);
      setRecentReviews(historyRes.data || []);
    } catch (err) {
      toast(err.message || "Failed to load analytics data.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-36">
        <Loader size="lg" label="Aggregating AI Sentiment Analytics…" />
      </div>
    );
  }

  const totalReviews = analytics?.totalReviews || 0;
  const dist = analytics?.distribution || { positive: 0, negative: 0, neutral: 0, mixed: 0 };

  // Format pie chart data
  const pieData = [
    { name: "Positive", value: dist.positive || 0, color: COLORS.positive },
    { name: "Negative", value: dist.negative || 0, color: COLORS.negative },
    { name: "Neutral", value: dist.neutral || 0, color: COLORS.neutral },
    { name: "Mixed", value: dist.mixed || 0, color: COLORS.mixed },
  ].filter((item) => item.value > 0);

  // Compute theme frequencies from recent reviews or backend themes
  const themeCounts = {};
  recentReviews.forEach((rev) => {
    (rev.themes || []).forEach((t) => {
      const clean = t.trim().toLowerCase();
      themeCounts[clean] = (themeCounts[clean] || 0) + 1;
    });
  });

  const barData = Object.entries(themeCounts)
    .map(([theme, count]) => ({ theme: theme.charAt(0).toUpperCase() + theme.slice(1), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // Calculate sentiment percentages
  const posRate = totalReviews > 0 ? Math.round(((dist.positive || 0) / totalReviews) * 100) : 0;
  const negRate = totalReviews > 0 ? Math.round(((dist.negative || 0) / totalReviews) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Header with property filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
            Sentiment Analytics & Insights
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Deep-dive operational metrics, sentiment ratios, and guest feedback trends across your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Filter analytics by property"
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-sm focus:border-brand-500 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <option value="">All Homestays (Combined Portfolio)</option>
            {listings.map((l) => (
              <option key={l.id || l._id} value={l.id || l._id}>
                {l.title} ({l.location})
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={loadData}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Zero data state */}
      {totalReviews === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon="📈"
            title="No sentiment analytics available yet"
            description="Run AI evaluations on your guest reviews to generate automated sentiment distribution charts and operational topic frequency meters."
            action={
              <Link to="/reviews">
                <Button>✨ Analyze First Review</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {/* Glassmorphic Stat summary cards with proper boundary spacing */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card variant="stat" className="flex min-h-[9.5rem] flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Evaluated Reviews
                </p>
                <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                  {totalReviews}
                </p>
              </div>
              <p className="text-[11px] font-medium text-stone-400 pt-2 border-t border-stone-200/50 dark:border-white/[0.06]">Total processed by Gemini</p>
            </Card>
            <Card variant="stat" className="flex min-h-[9.5rem] flex-col justify-between border-l-4 border-l-emerald-500 dark:border-l-emerald-400">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Positive Approval Rate
                </p>
                <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {posRate}%
                </p>
              </div>
              <p className="text-[11px] font-medium text-stone-400 pt-2 border-t border-stone-200/50 dark:border-white/[0.06]">{dist.positive || 0} positive evaluations</p>
            </Card>
            <Card variant="stat" className="flex min-h-[9.5rem] flex-col justify-between border-l-4 border-l-red-500 dark:border-l-red-400">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Negative Friction Rate
                </p>
                <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-red-600 dark:text-red-400">
                  {negRate}%
                </p>
              </div>
              <p className="text-[11px] font-medium text-stone-400 pt-2 border-t border-stone-200/50 dark:border-white/[0.06]">{dist.negative || 0} critical evaluations</p>
            </Card>
            <Card variant="stat" className="flex min-h-[9.5rem] flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Prominent Topic
                </p>
                <p className="mt-1.5 text-xl font-bold tracking-tight truncate text-brand-600 dark:text-brand-400">
                  {barData[0] ? `#${barData[0].theme}` : "Various"}
                </p>
              </div>
              <p className="text-[11px] font-medium text-stone-400 pt-2 border-t border-stone-200/50 dark:border-white/[0.06]">Most discussed by guests</p>
            </Card>
          </div>

          {/* Charts glassmorphic section */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Pie Chart: Sentiment Distribution */}
            <section className="lg:col-span-5 rounded-3xl border border-stone-200/80 bg-white/70 p-6 sm:p-8 shadow-md backdrop-blur-xl dark:border-white/[0.08] dark:bg-stone-900/45 dark:backdrop-blur-2xl dark:shadow-[0_8px_32px_rgb(0,0,0,0.35)]">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Sentiment Breakdown
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Proportion of guest sentiment across all reviews
              </p>
              <div className="h-72 w-full mt-6 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1c1917", borderColor: "rgba(255,255,255,0.1)", borderRadius: "0.75rem", color: "#f5f5f4", backdropFilter: "blur(12px)" }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Bar Chart: Operational Themes */}
            <section className="lg:col-span-7 rounded-3xl border border-stone-200/80 bg-white/70 p-6 sm:p-8 shadow-md backdrop-blur-xl dark:border-white/[0.08] dark:bg-stone-900/45 dark:backdrop-blur-2xl dark:shadow-[0_8px_32px_rgb(0,0,0,0.35)]">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Top Guest Discussion Themes
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Frequency of specific keywords and topics identified by Gemini AI
              </p>
              {barData.length === 0 ? (
                <div className="flex h-72 items-center justify-center text-xs text-stone-400">
                  Not enough theme data to generate histogram yet.
                </div>
              ) : (
                <div className="h-72 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="theme" tick={{ fontSize: 11, fill: "#78716c" }} angle={-25} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11, fill: "#78716c" }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1c1917", borderColor: "#44403c", borderRadius: "0.5rem", color: "#f5f5f4" }}
                        cursor={{ fill: "rgba(120, 113, 108, 0.1)" }}
                      />
                      <Bar dataKey="count" fill="#d98a1f" radius={[6, 6, 0, 0]} name="Frequency Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
