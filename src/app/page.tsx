import Link from "next/link";
import { AnimateOnScroll } from "@/components/marketing/animate-on-scroll";
import { MobileNav } from "@/components/marketing/mobile-nav";
import { LandingNav } from "@/components/marketing/landing-nav";

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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 relative overflow-hidden">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Ambient background ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[700px] w-[700px] rounded-full bg-friction-blue/[0.04] blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-friction-amber/[0.05] blur-3xl" />
        <div className="absolute top-[40%] left-[60%] h-[400px] w-[400px] rounded-full bg-friction-red/[0.03] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
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
          <div className="hero-fade mb-8 inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm text-slate-600 backdrop-blur-sm shadow-sm">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-friction-blue" />
            Now analyzing 500+ reviews in under 60 seconds
          </div>

          {/* Headline */}
          <h1 id="hero-heading" className="hero-fade-1 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight">
            <span className="font-light text-slate-900">Stop reading</span>
            <br />
            <span className="font-serif italic text-friction-blue">app reviews.</span>
            <br />
            <span className="font-bold text-slate-900">Start acting on them.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-fade-2 mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
            FrictionLens synthesizes hundreds of app store reviews into one
            shareable <span className="font-medium text-slate-700">Vibe Report</span> &mdash;
            sentiment scores, churn signals, and the action items your roadmap is missing.
          </p>

          {/* Search input */}
          <div className="hero-fade-3 mt-10 flex max-w-lg items-center gap-0 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
            <div className="flex items-center flex-1 min-w-0">
              <svg className="ml-3 mr-2 h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                readOnly
                placeholder="Search any app or paste reviews..."
                aria-label="Search for an app to analyze"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>
            <Link
              href={ctaHref}
              className="shrink-0 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              {isLoggedIn ? "Go to Dashboard \u2192" : "Analyze Free \u2192"}
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-fade-4 mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-slate-700">2,847</span>
              reviews analyzed
            </div>
            <div className="hidden sm:block h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-slate-700">&lt; 60s</span>
              per report
            </div>
            <div className="hidden sm:block h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-slate-700">$0</span>
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400">
            <span className="font-medium uppercase tracking-widest text-slate-300 font-mono">
              Built for teams at
            </span>
            {["Product Managers", "Growth Teams", "Mobile Devs", "CX Leaders"].map((role) => (
              <span
                key={role}
                className="rounded-full border border-slate-200/60 bg-white/60 px-3 py-1 text-slate-500 backdrop-blur-sm"
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
          <div className="rounded-2xl border border-slate-200/60 bg-white/65 p-1 shadow-2xl shadow-slate-300/20 backdrop-blur-xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 rounded-t-xl bg-slate-50/80 px-4 py-3 border-b border-slate-100">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 rounded-md bg-white/90 border border-slate-200/60 px-3 py-1.5 text-xs text-slate-400 font-mono">
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
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">Spotify</h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-mono">
                      iOS &amp; Android &middot; 2,847 reviews
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[2px] font-mono">Vibe Score</div>
                    <div className="font-serif text-3xl sm:text-4xl font-bold text-friction-amber tracking-tight">72</div>
                  </div>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Churn Risk", value: "18%", color: "text-friction-red", sub: "+3.2% vs prev" },
                  { label: "Top Friction", value: "8.2", color: "text-friction-red", sub: "Shuffle Algorithm" },
                  { label: "Release Grade", value: "D+", color: "text-friction-amber", sub: "v8.9.42" },
                  { label: "Momentum", value: "4.1", color: "text-friction-amber", sub: "Trending down" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-4 text-center"
                  >
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[1px] font-mono">
                      {stat.label}
                    </div>
                    <div className={`font-mono text-xl sm:text-2xl font-bold mt-1 ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Sentiment Radar */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
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
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
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
                        <div className="w-20 sm:w-24 text-xs text-slate-500 text-right shrink-0 truncate font-mono">
                          {item.label}
                        </div>
                        <div className="flex-1 h-[3px] rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all`}
                            style={{ width: `${(item.score / 10) * 100}%` }}
                          />
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-600 w-8 text-right">
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
                  <div className="text-sm font-semibold text-slate-800">
                    Shuffle algorithm feels non-random
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">342 mentions &middot; Critical severity</div>
                </div>
                <span className="inline-flex items-center rounded-md bg-friction-red px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wide font-mono">
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
            <h2 className="text-3xl md:text-[46px] md:leading-[1.1] font-bold tracking-tight text-slate-900 max-w-lg">
              <span className="font-light">The report your team</span>
              <br />
              <span className="font-serif italic">actually reads.</span>
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              num: "01",
              title: "Vibe Reports",
              desc: "Five sentiment dimensions distilled into one shareable page. No dashboards to learn, no setup wizards to click through.",
            },
            {
              num: "02",
              title: "Friction Scores",
              desc: "Per-feature heatmap that tells engineering exactly what's broken. Each feature scored, trended, and ranked by severity.",
            },
            {
              num: "03",
              title: "Churn Signals",
              desc: "AI extracts the patterns hiding in 2-3 star reviews that nobody reads manually. The reviews that predict users leaving.",
            },
            {
              num: "04",
              title: "Release Impact",
              desc: "Automatic before-and-after for every app version. Did the fix work? Did it break something new? Letter grades in seconds.",
            },
            {
              num: "05",
              title: "Competitor Battles",
              desc: "Head-to-head dimension scores against up to three competitors. Know where you lead and where you're vulnerable.",
            },
            {
              num: "06",
              title: "AI Actions",
              desc: "Prioritized recommendations with impact and effort estimates. Copy directly into Jira or Linear. Ship, measure, repeat.",
            },
          ].map((feature, i) => (
            <AnimateOnScroll key={feature.num} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-slate-200/60 bg-white/65 backdrop-blur-xl p-6 hover:bg-white/90 hover:shadow-lg hover:shadow-slate-200/40 hover:border-friction-blue/20 transition-all duration-300">
                <div className="font-mono text-xs font-semibold text-friction-blue/60 mb-3">
                  {feature.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-slate-500">{feature.desc}</p>
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
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[3px] text-slate-400 mb-3">
              Process
            </div>
            <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900">
              <span className="font-light">Input.</span>{" "}
              <span className="font-serif italic">Insight.</span>{" "}
              <span className="font-bold">Action.</span>
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="relative grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

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
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm mb-5">
                  <span className={`font-mono text-xl font-bold ${s.color}`}>
                    {s.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-[240px] mx-auto">
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
            <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900">
              <span className="font-light">Free until you&apos;re</span>{" "}
              <span className="font-serif italic">hooked.</span>
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              name: "Free",
              price: "$0",
              period: "forever",
              popular: false,
              dark: false,
              features: [
                "1 app",
                "100 reviews per report",
                "Basic Vibe Report",
                "Shareable link",
                "3 reports per day",
              ],
              cta: "Start Free",
            },
            {
              name: "Pro",
              price: "$29",
              period: "/mo",
              popular: true,
              dark: true,
              features: [
                "Unlimited apps",
                "500+ reviews per report",
                "Friction Scores & Churn Signals",
                "Competitor Battles",
                "Slack alerts",
                "PDF export",
              ],
              cta: "Start Pro Trial",
            },
            {
              name: "Team",
              price: "$99",
              period: "/mo",
              popular: false,
              dark: false,
              features: [
                "Everything in Pro",
                "5 team seats",
                "Jira integration",
                "Team dashboard",
                "API access",
                "Priority support",
              ],
              cta: "Contact Us",
            },
          ].map((tier, i) => (
            <AnimateOnScroll key={tier.name} delay={i * 100}>
              <div
                className={`relative rounded-2xl border p-7 flex flex-col h-full ${
                  tier.dark
                    ? "border-slate-700 bg-slate-900 shadow-xl shadow-slate-900/20"
                    : "border-slate-200/60 bg-white/65 backdrop-blur-xl"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 right-5 inline-flex items-center rounded-lg bg-friction-blue px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white font-mono">
                    Popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className={`text-sm font-medium ${tier.dark ? "text-slate-400" : "text-slate-500"}`}>
                    {tier.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className={`font-mono text-[40px] font-bold tracking-tight ${tier.dark ? "text-white" : "text-slate-900"}`}>
                      {tier.price}
                    </span>
                    <span className={`text-sm ${tier.dark ? "text-slate-500" : "text-slate-400"}`}>
                      {tier.period}
                    </span>
                  </div>
                </div>
                <ul className="flex-1 space-y-3 mb-7">
                  {tier.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-[13.5px] ${tier.dark ? "text-slate-300" : "text-slate-600"}`}>
                      <svg className={`mt-0.5 h-4 w-4 shrink-0 ${tier.dark ? "text-friction-blue" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={ctaHref}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                    tier.dark
                      ? "bg-friction-blue text-white hover:bg-friction-blue/90"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. CTA
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
        <AnimateOnScroll>
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center md:px-16">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-friction-blue/20 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-friction-amber/15 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                <span className="font-light">Your first Vibe Report.</span>
                <br />
                <span className="font-serif italic text-friction-blue">Sixty seconds.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base text-slate-400">
                No credit card required. Just paste an app name and see what your users really think.
              </p>
              <Link
                href={ctaHref}
                className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-7 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors shadow-lg shadow-black/20"
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
      <footer className="relative z-10 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm" role="contentinfo">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900">
              <svg width="16" height="16" viewBox="0 0 500 500" fill="none">
                <path d="M102 82 C118 98,138 126,155 150 C168 170,182 190,198 210 C210 226,222 237,236 244 C244 248,252 249,260 252 C272 257,284 268,300 290 C318 316,340 348,360 376 C374 396,390 414,410 436 C406 440,400 442,394 444 C374 422,358 400,340 374 C322 348,304 322,288 298 C276 280,266 268,256 260 C248 254,240 252,232 250 C222 248,212 238,198 222 C180 200,165 178,150 156 C136 134,122 112,110 94Z" fill="white" opacity="0.92"/>
                <ellipse cx="250" cy="251" rx="7" ry="6.5" fill="#4A90D9"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">FrictionLens</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-600 transition-colors">GitHub</a>
          </div>
          <p className="text-xs text-slate-400 font-mono">
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
