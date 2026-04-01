import Link from "next/link";
import {
  BarChart3,
  Flame,
  AlertTriangle,
  GitCompare,
  Sparkles,
  FileText,
} from "lucide-react";
import { AnimateOnScroll } from "@/components/marketing/animate-on-scroll";
import { MobileNav } from "@/components/marketing/mobile-nav";
import { LandingNav } from "@/components/marketing/landing-nav";
import { DemoStats, DemoVibeScore } from "@/components/marketing/demo-stats";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FrictionLens",
  applicationCategory: "BusinessApplication",
  description:
    "Synthesize hundreds of app store reviews into one shareable Vibe Report with sentiment scores, churn signals, and action items.",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Chetan Jonnalagadda",
  },
};

export default async function LandingPage() {
  // Check if user is logged in
  let isLoggedIn = false;
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      isLoggedIn = !!user;
    } catch {
      // Auth check failed silently — treat as logged out
    }
  }

  const ctaHref = isLoggedIn ? "/dashboard" : "/signup";

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans text-white relative overflow-hidden">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Aurora gradient blobs ── */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      </div>

      {/* ══════════════════════════════════════════════
          1. NAVIGATION
      ══════════════════════════════════════════════ */}
      <LandingNav isLoggedIn={isLoggedIn} />

      {/* ══════════════════════════════════════════════
          2. HERO
      ══════════════════════════════════════════════ */}
      <section id="main-content" className="relative z-10 mx-auto max-w-6xl px-6 pt-28 pb-20 lg:pt-32" aria-labelledby="hero-heading">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="hero-fade mb-8 inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-friction-blue" />
            Analyze up to 200 reviews in under 60 seconds
          </div>

          {/* Headline */}
          <h1 id="hero-heading" className="hero-fade-1 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight">
            <span className="font-light text-gray-600">Stop reading</span>
            <br />
            <span className="font-serif italic gradient-text">app reviews.</span>
            <br />
            <span className="font-bold text-gray-900">Start acting on them.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-fade-2 mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
            FrictionLens synthesizes hundreds of app store reviews into one
            shareable <span className="font-medium text-gray-900">Vibe Report</span> &mdash;
            sentiment scores, churn signals, and the action items your roadmap is missing.
          </p>

          {/* Search input */}
          <div className="hero-fade-3 mt-10 flex max-w-lg items-center gap-0 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-[0_0_40px_rgba(107,159,212,0.06)]">
            <div className="flex items-center flex-1 min-w-0">
              <svg className="ml-3 mr-2 h-4 w-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                readOnly
                placeholder="Search any app or paste reviews..."
                aria-label="Search for an app to analyze"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-gray-600 placeholder:text-gray-500 outline-none"
              />
            </div>
            <Link
              href={ctaHref}
              className="shimmer-btn shrink-0 rounded-xl bg-friction-blue px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-friction-blue/90 transition-colors"
            >
              {isLoggedIn ? "Go to Dashboard \u2192" : "Analyze Free \u2192"}
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-fade-4 mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-gray-900">200</span>
              reviews per report
            </div>
            <div className="hidden sm:block h-4 w-px bg-white/[0.12]" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-gray-900">&lt; 60s</span>
              per report
            </div>
            <div className="hidden sm:block h-4 w-px bg-white/[0.12]" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-gray-900">$0</span>
              to start
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2B. SOCIAL PROOF
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
        <AnimateOnScroll>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-gray-500">
            <span className="font-medium uppercase tracking-widest text-gray-500 font-mono">
              Built for teams at
            </span>
            {["Product Managers", "Growth Teams", "Mobile Devs", "CX Leaders"].map((role) => (
              <span
                key={role}
                className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-gray-600"
              >
                {role}
              </span>
            ))}
          </div>
        </AnimateOnScroll>
      </section>

      {/* ══════════════════════════════════════════════
          3. DEMO SECTION
      ══════════════════════════════════════════════ */}
      <section id="demo" className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
        <AnimateOnScroll>
          <div className="rounded-2xl border border-gray-200 bg-white p-1 shadow-2xl shadow-gray-200/50">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 rounded-t-xl bg-white px-4 py-3 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 rounded-md bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-gray-500 font-mono">
                frictionlens.app/vibe/spotify-music
              </div>
            </div>

            {/* Report content */}
            <div className="p-4 sm:p-6 md:p-8 space-y-6">
              {/* App header row */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#1DB954] text-white text-lg sm:text-xl font-bold shadow-md">
                    &#x1F3B5;
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Spotify</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-mono">
                      iOS &amp; Android &middot; 200 reviews
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DemoVibeScore />
                </div>
              </div>

              {/* Stat cards — animated counters */}
              <DemoStats />

              {/* Charts row */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Sentiment Radar */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <h4 className="text-[9px] font-semibold text-friction-blue uppercase tracking-[2px] font-mono mb-4">Sentiment Radar</h4>
                  <svg viewBox="0 0 200 200" className="mx-auto w-40 h-40 sm:w-48 sm:h-48">
                    {[1, 0.66, 0.33].map((scale) => (
                      <polygon
                        key={scale}
                        points={pentagonPoints(100, 100, 80 * scale)}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                    ))}
                    {pentagonVertices(100, 100, 80).map((p, i) => (
                      <line
                        key={i}
                        x1="100"
                        y1="100"
                        x2={p[0]}
                        y2={p[1]}
                        stroke="#e2e8f0"
                        strokeWidth="0.5"
                      />
                    ))}
                    <defs>
                      <linearGradient id="rf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.03" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={radarDataPoints(100, 100, 80, [0.78, 0.46, 0.72, 0.41, 0.65])}
                      fill="url(#rf)"
                      stroke="#4A90D9"
                      strokeWidth="1.5"
                    />
                    {radarVertices(100, 100, 80, [0.78, 0.46, 0.72, 0.41, 0.65]).map((p, i) => (
                      <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#4A90D9" stroke="white" strokeWidth="1.5" />
                    ))}
                    {(["Love", "Frustration", "Loyalty", "Momentum", "WoM"] as const).map(
                      (label, i) => {
                        const lp = pentagonVertices(100, 100, 96);
                        return (
                          <text
                            key={label}
                            x={lp[i][0]}
                            y={lp[i][1]}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="text-[8px] fill-slate-400 font-sans font-medium"
                          >
                            {label}
                          </text>
                        );
                      }
                    )}
                  </svg>
                </div>

                {/* Friction Heatmap */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <h4 className="text-[9px] font-semibold text-friction-blue uppercase tracking-[2px] font-mono mb-4">Friction Heatmap</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Shuffle", score: 8.2, color: "bg-friction-red" },
                      { label: "Downloads", score: 7.1, color: "bg-friction-red" },
                      { label: "Home Feed", score: 6.4, color: "bg-friction-amber" },
                      { label: "Search", score: 4.2, color: "bg-friction-amber" },
                      { label: "Discovery", score: 1.8, color: "bg-friction-blue" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="w-20 sm:w-24 text-xs text-gray-500 text-right shrink-0 truncate font-mono">
                          {item.label}
                        </div>
                        <div className="flex-1 h-[3px] rounded-full bg-gray-50 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all`}
                            style={{ width: `${(item.score / 10) * 100}%` }}
                          />
                        </div>
                        <div className="font-mono text-xs font-bold text-gray-600 w-8 text-right">
                          {item.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Churn Driver alert */}
              <div className="rounded-xl border border-friction-red/20 bg-friction-red/[0.04] px-4 sm:px-5 py-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-semibold text-friction-red uppercase tracking-[2px] font-mono mb-1">Top Churn Driver</div>
                  <div className="text-sm font-semibold text-gray-600">
                    Shuffle algorithm feels non-random
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">342 mentions &middot; Critical severity</div>
                </div>
                <span className="pulse-glow inline-flex items-center rounded-md bg-friction-red px-2.5 py-1 text-[10px] font-bold text-gray-900 uppercase tracking-wide font-mono">
                  P0
                </span>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ══════════════════════════════════════════════
          4. FEATURES
      ══════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
        <AnimateOnScroll>
          <div className="mb-16">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[3px] text-friction-blue mb-3">
              Features
            </div>
            <h2 className="text-3xl md:text-[46px] md:leading-[1.1] font-bold tracking-tight text-white max-w-lg">
              <span className="font-light text-gray-600">The report your team</span>
              <br />
              <span className="font-serif italic">actually reads.</span>
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {([
            {
              num: "01",
              title: "Vibe Reports",
              desc: "Five sentiment dimensions distilled into one shareable page. No dashboards to learn, no setup wizards to click through.",
              icon: FileText,
              iconColor: "text-friction-blue",
              iconBg: "bg-friction-blue/10",
            },
            {
              num: "02",
              title: "Friction Scores",
              desc: "Per-feature heatmap that tells engineering exactly what's broken. Each feature scored, trended, and ranked by severity.",
              icon: Flame,
              iconColor: "text-friction-red",
              iconBg: "bg-friction-red/10",
            },
            {
              num: "03",
              title: "Churn Signals",
              desc: "AI extracts the patterns hiding in 2-3 star reviews that nobody reads manually. The reviews that predict users leaving.",
              icon: AlertTriangle,
              iconColor: "text-friction-amber",
              iconBg: "bg-friction-amber/10",
            },
            {
              num: "04",
              title: "Release Impact",
              desc: "Automatic before-and-after for every app version. Did the fix work? Did it break something new? Letter grades in seconds.",
              icon: BarChart3,
              iconColor: "text-[#22C55E]",
              iconBg: "bg-[#22C55E]/10",
            },
            {
              num: "05",
              title: "Competitor Battles",
              desc: "Head-to-head dimension scores against up to three competitors. Know where you lead and where you're vulnerable.",
              icon: GitCompare,
              iconColor: "text-[#7C3AED]",
              iconBg: "bg-[#7C3AED]/10",
            },
            {
              num: "06",
              title: "AI Actions",
              desc: "Prioritized recommendations with impact and effort estimates. Copy directly into Jira or Linear. Ship, measure, repeat.",
              icon: Sparkles,
              iconColor: "text-[#06B6D4]",
              iconBg: "bg-[#06B6D4]/10",
            },
          ] as const).map((feature, i) => (
            <AnimateOnScroll key={feature.num} delay={i * 100}>
              <div className="gradient-border-hover group h-full rounded-2xl border border-gray-200/60 bg-white p-6 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${feature.iconBg}`}>
                    <feature.icon className={`h-4.5 w-4.5 ${feature.iconColor}`} />
                  </div>
                  <span className="font-mono text-xs font-semibold text-gray-500">
                    {feature.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5. HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[3px] text-gray-500 mb-3">
              Process
            </div>
            <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-gray-900">
              <span className="font-light">Input.</span>{" "}
              <span className="font-serif italic">Insight.</span>{" "}
              <span className="font-bold">Action.</span>
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="relative grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

          {[
            {
              step: "01",
              title: "Enter an app",
              desc: "Search by name or paste a CSV of reviews. We handle both stores automatically.",
              color: "text-friction-blue",
            },
            {
              step: "02",
              title: "AI analyzes",
              desc: "Every review classified across five sentiment dimensions and scored for churn risk.",
              color: "text-slate-900",
            },
            {
              step: "03",
              title: "Get your report",
              desc: "A shareable Vibe Report with friction heatmaps and prioritized action items.",
              color: "text-friction-blue",
            },
          ].map((s, i) => (
            <AnimateOnScroll key={s.step} delay={i * 120}>
              <div className="text-center relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white mb-5">
                  <span className="font-mono text-xl font-bold text-friction-blue">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-[13.5px] text-gray-500 leading-relaxed max-w-[240px] mx-auto">
                  {s.desc}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          6. PRICING
      ══════════════════════════════════════════════ */}
      <section id="pricing" className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[3px] text-friction-blue mb-3">
              Pricing
            </div>
            <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-gray-900">
              <span className="font-light text-gray-600">Completely</span>{" "}
              <span className="font-serif italic">free.</span>
            </h2>
            <p className="mt-4 text-base text-gray-500 max-w-lg mx-auto">
              FrictionLens is free to use. Bring your own Gemini API key from Google AI Studio, or try 2 analyses on us — no key needed.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <AnimateOnScroll>
            <div className="relative rounded-2xl border border-gray-200/60 bg-white p-7 flex flex-col h-full">
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-500">Try It</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono text-[40px] font-bold tracking-tight text-gray-900">2</span>
                  <span className="text-sm text-gray-500">free analyses</span>
                </div>
              </div>
              <ul className="flex-1 space-y-3 mb-7">
                {["No API key needed", "100 reviews per analysis", "Full Vibe Report", "Shareable public link"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-gray-600">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-friction-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={ctaHref}
                className="block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors bg-friction-blue text-white hover:bg-friction-blue/90"
              >
                Try Free
              </Link>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <div className="relative rounded-2xl border border-friction-blue/30 bg-white p-7 flex flex-col h-full shadow-[0_0_40px_rgba(107,159,212,0.08)] scale-[1.02]">
              <div className="absolute -top-3 right-5 inline-flex items-center rounded-lg bg-friction-blue px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white font-mono">
                Unlimited
              </div>
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-500">Bring Your Key</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono text-[40px] font-bold tracking-tight text-gray-900">$0</span>
                  <span className="text-sm text-gray-500">forever</span>
                </div>
              </div>
              <ul className="flex-1 space-y-3 mb-7">
                {["Unlimited analyses", "200 reviews per analysis", "All 5 sentiment dimensions", "Friction Scores & Churn Signals", "Competitor Battles", "Shareable Vibe Reports"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-gray-600">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-friction-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={ctaHref}
                className="block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors border border-gray-200 bg-gray-50 text-white hover:bg-[#2A3040]"
              >
                Get Your Free API Key &rarr;
              </Link>
              <p className="mt-3 text-center text-[11px] text-gray-500">
                Free from <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-friction-blue hover:underline">Google AI Studio</a> — takes 30 seconds
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. CTA
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
        <AnimateOnScroll>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A] px-8 py-20 text-center md:px-16 border border-gray-200 shadow-[0_0_60px_rgba(107,159,212,0.05)]">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-friction-blue/10 blur-[60px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                <span className="font-light">Your first Vibe Report.</span>
                <br />
                <span className="font-serif italic gradient-text">Sixty seconds.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base text-gray-500 leading-relaxed">
                No credit card required. Just search an app and see what your users really think.
              </p>
              <Link
                href={ctaHref}
                className="shimmer-btn mt-10 inline-flex h-13 items-center rounded-xl bg-friction-blue px-8 text-base font-semibold text-gray-900 hover:bg-friction-blue/90 transition-colors shadow-[0_0_30px_rgba(107,159,212,0.15)]"
              >
                {isLoggedIn ? "Go to Dashboard \u2192" : "Generate Your Vibe Report \u2192"}
              </Link>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ══════════════════════════════════════════════
          8. FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-gray-200 bg-[#F2F2F7]" role="contentinfo">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="-32 -32 64 64" fill="none">
              <ellipse cx="0" cy="0" rx="30" ry="29.5" fill="none" stroke="#ffffff" strokeWidth="1.2"/>
              <ellipse cx="0" cy="0" rx="24" ry="23.5" fill="#ffffff"/>
              <path d="M -7 -12 L 7 -12 L 7 -8.5 L -3 -8.5 L -3 -1.5 L 5 -1.5 L 5 1.5 L -3 1.5 L -3 13 L -7 13 Z" fill="#0f172a"/>
            </svg>
            <span className="text-sm font-semibold text-gray-600">FrictionLens</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            Built by Chetan Jonnalagadda
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── SVG helper functions for the radar chart ─── */

function pentagonVertices(
  cx: number,
  cy: number,
  r: number
): [number, number][] {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as [number, number];
  });
}

function pentagonPoints(cx: number, cy: number, r: number): string {
  return pentagonVertices(cx, cy, r)
    .map((p) => `${p[0]},${p[1]}`)
    .join(" ");
}

function radarVertices(
  cx: number,
  cy: number,
  r: number,
  values: number[]
): [number, number][] {
  return values.map((v, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return [cx + r * v * Math.cos(angle), cy + r * v * Math.sin(angle)] as [number, number];
  });
}

function radarDataPoints(
  cx: number,
  cy: number,
  r: number,
  values: number[]
): string {
  return radarVertices(cx, cy, r, values)
    .map((p) => `${p[0]},${p[1]}`)
    .join(" ");
}
