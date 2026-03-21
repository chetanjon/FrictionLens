import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-fade-up {
          animation: fadeUp 0.7s ease-out both;
        }
        .animate-fade-up-delay-1 {
          animation: fadeUp 0.7s ease-out 0.1s both;
        }
        .animate-fade-up-delay-2 {
          animation: fadeUp 0.7s ease-out 0.2s both;
        }
        .animate-fade-up-delay-3 {
          animation: fadeUp 0.7s ease-out 0.3s both;
        }
        .animate-fade-up-delay-4 {
          animation: fadeUp 0.7s ease-out 0.4s both;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out both;
        }
        .animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 relative overflow-hidden">
        {/* ── Ambient background ── */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] h-[700px] w-[700px] rounded-full bg-friction-blue/[0.04] blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-friction-amber/[0.05] blur-3xl" />
          <div className="absolute top-[40%] left-[60%] h-[400px] w-[400px] rounded-full bg-friction-red/[0.03] blur-3xl" />
          {/* Subtle grid */}
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
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold tracking-wide select-none">
                FL
              </div>
              <span className="text-[17px] font-semibold tracking-tight text-slate-900">
                FrictionLens
              </span>
            </Link>

            {/* Center links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Features
              </a>
              <a href="#demo" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Demo
              </a>
              <a href="#pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Pricing
              </a>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* ══════════════════════════════════════════════
            2. HERO
        ══════════════════════════════════════════════ */}
        <section className="relative z-10 mx-auto max-w-4xl px-6 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="animate-fade-up mb-8 inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm text-slate-600 backdrop-blur-sm shadow-sm">
            <span className="animate-pulse-dot inline-block h-2 w-2 rounded-full bg-friction-blue" />
            Now analyzing 500+ reviews in under 60 seconds
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-delay-1 mx-auto max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight">
            <span className="font-light text-slate-400">Stop reading</span>{" "}
            <span className="font-serif italic text-friction-blue">app reviews.</span>
            <br />
            <span className="font-bold text-slate-900">Start acting on them.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
            FrictionLens synthesizes hundreds of app store reviews into one
            shareable <span className="font-medium text-slate-700">Vibe Report</span> &mdash;
            sentiment scores, churn signals, and prioritized action items.
          </p>

          {/* Search input */}
          <div className="animate-fade-up-delay-3 mx-auto mt-10 flex max-w-lg items-center gap-0 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-lg shadow-slate-200/40 backdrop-blur-sm">
            <input
              type="text"
              readOnly
              placeholder="Paste an App Store or Play Store URL..."
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
            <button className="shrink-0 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
              Analyze Free&nbsp;&rarr;
            </button>
          </div>

          {/* Stats */}
          <div className="animate-fade-up-delay-4 mt-12 flex items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-slate-700">2,847</span>
              reviews analyzed
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-slate-700">&lt; 60s</span>
              per report
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold text-slate-700">$0</span>
              to start
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            3. DEMO SECTION
        ══════════════════════════════════════════════ */}
        <section id="demo" className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
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
            <div className="p-6 md:p-8 space-y-6">
              {/* App header row */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1DB954] text-white text-xl font-bold shadow-md">
                    S
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Spotify Music</h3>
                    <p className="text-sm text-slate-400">
                      Vibe Report &middot; 1,247 reviews &middot; Last 30 days
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vibe Score</div>
                    <div className="font-mono text-3xl font-bold text-friction-amber">72</div>
                  </div>
                  <div className="h-12 w-12 rounded-full border-4 border-friction-amber/30 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-friction-amber/20" />
                  </div>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Churn Risk", value: "18%", color: "text-friction-red", sub: "+3.2% vs prev" },
                  { label: "Top Friction", value: "8.2", color: "text-friction-red", sub: "Shuffle Algorithm" },
                  { label: "Release Grade", value: "D+", color: "text-friction-amber", sub: "v8.9.42" },
                  { label: "Momentum", value: "4.1", color: "text-friction-blue", sub: "Trending down" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {stat.label}
                    </div>
                    <div className={`font-mono text-2xl font-bold mt-1 ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Sentiment Radar */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">Sentiment Radar</h4>
                  <svg viewBox="0 0 200 200" className="mx-auto w-48 h-48">
                    {/* Pentagon grid lines */}
                    {[1, 0.66, 0.33].map((scale) => (
                      <polygon
                        key={scale}
                        points={pentagonPoints(100, 100, 80 * scale)}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                    ))}
                    {/* Axis lines */}
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
                    {/* Data polygon */}
                    <polygon
                      points={radarDataPoints(100, 100, 80, [0.82, 0.35, 0.71, 0.41, 0.63])}
                      fill="rgba(74,144,217,0.15)"
                      stroke="#4A90D9"
                      strokeWidth="2"
                    />
                    {/* Data dots */}
                    {radarVertices(100, 100, 80, [0.82, 0.35, 0.71, 0.41, 0.63]).map((p, i) => (
                      <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#4A90D9" />
                    ))}
                    {/* Labels */}
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
                            className="text-[9px] fill-slate-400 font-sans"
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
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">Friction Heatmap</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Shuffle Algorithm", score: 8.2, color: "bg-friction-red" },
                      { label: "Ad Frequency", score: 7.1, color: "bg-friction-red" },
                      { label: "UI Navigation", score: 5.4, color: "bg-friction-amber" },
                      { label: "Offline Mode", score: 4.8, color: "bg-friction-amber" },
                      { label: "Audio Quality", score: 2.9, color: "bg-friction-blue" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="w-28 text-xs text-slate-500 text-right shrink-0 truncate">
                          {item.label}
                        </div>
                        <div className="flex-1 h-5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all`}
                            style={{ width: `${(item.score / 10) * 100}%` }}
                          />
                        </div>
                        <div className="font-mono text-xs font-semibold text-slate-600 w-8 text-right">
                          {item.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Churn Driver alert */}
              <div className="rounded-xl border border-friction-red/20 bg-friction-red/[0.04] px-5 py-4 flex items-center gap-4 flex-wrap">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-friction-red/10">
                  <svg className="h-4 w-4 text-friction-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Top Churn Driver</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">
                    Shuffle algorithm not randomizing properly &mdash; users report hearing same songs repeatedly
                  </div>
                </div>
                <span className="inline-flex items-center rounded-md bg-friction-red/10 px-2.5 py-1 text-xs font-bold text-friction-red uppercase tracking-wide">
                  P0
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4. FEATURES
        ══════════════════════════════════════════════ */}
        <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Everything you need to{" "}
              <span className="font-serif italic text-friction-blue">understand</span> your users
            </h2>
            <p className="mt-4 text-base text-slate-500 max-w-xl mx-auto">
              Six powerful analysis dimensions in every Vibe Report, generated in under a minute.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                num: "01",
                title: "Vibe Reports",
                desc: "A single, shareable page that captures the full emotional fingerprint of your app's user base.",
              },
              {
                num: "02",
                title: "Friction Scores",
                desc: "Every feature scored 0-10 on user frustration. See exactly what's broken and how badly.",
              },
              {
                num: "03",
                title: "Churn Signals",
                desc: "Surface the reviews most likely to precede an uninstall. Catch problems before they cost you users.",
              },
              {
                num: "04",
                title: "Release Impact",
                desc: "Compare sentiment before and after each release. Know if that update helped or made things worse.",
              },
              {
                num: "05",
                title: "Competitor Battles",
                desc: "Stack your Vibe Report against any competitor. Find gaps and opportunities they're missing.",
              },
              {
                num: "06",
                title: "AI Actions",
                desc: "Prioritized, actionable recommendations generated from pattern analysis across all reviews.",
              },
            ].map((feature) => (
              <div
                key={feature.num}
                className="group rounded-2xl border border-slate-200/60 bg-white/65 backdrop-blur-xl p-6 hover:bg-white/90 hover:shadow-lg hover:shadow-slate-200/40 hover:border-slate-200 transition-all duration-300"
              >
                <div className="font-mono text-xs font-semibold text-friction-blue/60 mb-3">
                  {feature.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            5. HOW IT WORKS
        ══════════════════════════════════════════════ */}
        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Three steps.{" "}
              <span className="font-serif italic text-friction-blue">Sixty seconds.</span>
            </h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-friction-blue/30 via-friction-amber/30 to-friction-blue/30" />

            {[
              {
                step: "1",
                title: "Enter an app",
                desc: "Paste an App Store or Google Play URL, or upload a CSV of reviews.",
              },
              {
                step: "2",
                title: "AI analyzes",
                desc: "Gemini classifies every review across 5 sentiment dimensions and scores each feature.",
              },
              {
                step: "3",
                title: "Get your report",
                desc: "A shareable Vibe Report with scores, charts, churn signals, and action items.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center relative">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm mb-5">
                  <span className="font-mono text-2xl font-bold text-friction-blue">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[240px] mx-auto">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            6. PRICING
        ══════════════════════════════════════════════ */}
        <section id="pricing" className="relative z-10 mx-auto max-w-5xl px-6 pb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Simple,{" "}
              <span className="font-serif italic text-friction-blue">transparent</span> pricing
            </h2>
            <p className="mt-4 text-base text-slate-500 max-w-lg mx-auto">
              Start free. Upgrade when your app needs deeper intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                popular: false,
                features: [
                  "3 Vibe Reports / month",
                  "Up to 200 reviews per report",
                  "Basic sentiment analysis",
                  "Shareable report URLs",
                ],
                cta: "Get Started",
              },
              {
                name: "Pro",
                price: "$29",
                period: "/mo",
                popular: true,
                features: [
                  "Unlimited Vibe Reports",
                  "Up to 2,000 reviews per report",
                  "Friction Scores & Churn Signals",
                  "Release Impact tracking",
                  "Competitor Battles",
                  "Priority support",
                ],
                cta: "Start Pro Trial",
              },
              {
                name: "Team",
                price: "$99",
                period: "/mo",
                popular: false,
                features: [
                  "Everything in Pro",
                  "5 team members",
                  "Up to 10,000 reviews per report",
                  "Auto-pull new reviews (weekly)",
                  "API access",
                  "Custom branding on reports",
                  "Slack / Jira integration",
                ],
                cta: "Contact Sales",
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-7 flex flex-col ${
                  tier.popular
                    ? "border-friction-blue/30 bg-white/90 shadow-xl shadow-friction-blue/[0.08] backdrop-blur-xl"
                    : "border-slate-200/60 bg-white/65 backdrop-blur-xl"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-friction-blue px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    Popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-bold text-slate-900">{tier.price}</span>
                    <span className="text-sm text-slate-400">{tier.period}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-3 mb-7">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-friction-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                    tier.popular
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            7. CTA
        ══════════════════════════════════════════════ */}
        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center md:px-16">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-friction-blue/20 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-friction-amber/15 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Your first Vibe Report.
                <br />
                <span className="font-serif italic text-friction-blue">Sixty seconds.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base text-slate-400">
                No credit card required. Paste a URL and see what your users really think.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-7 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Generate Your Vibe Report&nbsp;&rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            8. FOOTER
        ══════════════════════════════════════════════ */}
        <footer className="relative z-10 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white text-[10px] font-bold tracking-wide select-none">
                FL
              </div>
              <span className="text-sm font-semibold text-slate-700">FrictionLens</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Twitter</a>
              <a href="#" className="hover:text-slate-600 transition-colors">GitHub</a>
            </div>
            <p className="text-xs text-slate-400">
              Built by Chetan Jonnalagadda
            </p>
          </div>
        </footer>
      </div>
    </>
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
