import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      // Auth check failed silently
    }
  }

  const ctaHref = isLoggedIn ? "/dashboard" : "/signup";

  return (
    <div className="min-h-screen bg-[#B8C5D3] font-sans text-[#0F172A] relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#0F172A]/8">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-serif italic text-lg tracking-tight text-[#0F172A]">
              FrictionLens
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[13px] text-[#0F172A]/60 hover:text-[#0F172A] transition-colors tracking-wide">
              Features
            </a>
            <a href="#process" className="text-[13px] text-[#0F172A]/60 hover:text-[#0F172A] transition-colors tracking-wide">
              Process
            </a>
            <a href="#pricing" className="text-[13px] text-[#0F172A]/60 hover:text-[#0F172A] transition-colors tracking-wide">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-[13px] text-[#0F172A]/60 hover:text-[#0F172A] transition-colors flex items-center gap-1.5">
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden md:inline text-[13px] text-[#0F172A]/60 hover:text-[#0F172A] transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="text-[13px] text-[#0F172A]/80 hover:text-[#0F172A] transition-colors flex items-center gap-1.5">
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="main-content" className="relative z-10 mx-auto max-w-7xl px-8 pt-32 pb-40 lg:pt-40 lg:pb-48">
        {/* Decorative numeral */}
        <div className="absolute top-20 right-12 lg:right-24 font-serif text-[clamp(8rem,20vw,16rem)] leading-none text-[#0F172A]/[0.04] select-none pointer-events-none">
          01
        </div>

        <div className="relative max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[4px] text-[#0F172A]/40 mb-8">
            App Review Intelligence
          </p>

          <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.95] tracking-tight">
            <span className="font-serif italic font-normal text-[#0F172A]">
              The signal hiding
            </span>
            <br />
            <span className="font-serif italic font-normal text-[#0F172A]">
              in your reviews.
            </span>
          </h1>

          <p className="mt-10 max-w-lg text-[17px] leading-[1.7] text-[#0F172A]/55">
            FrictionLens reads hundreds of app store reviews and distills them
            into one shareable report&mdash;sentiment scores, friction heatmaps,
            churn signals, and the action items your roadmap is missing.
          </p>

          <Link
            href={ctaHref}
            className="mt-12 inline-flex items-center gap-2 text-[15px] text-[#0F172A]/80 hover:text-[#0F172A] transition-colors group"
          >
            {isLoggedIn ? "Open Dashboard" : "Try your first analysis free"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── EDITORIAL DIVIDER ── */}
      <div className="mx-auto max-w-7xl px-8">
        <div className="h-px bg-[#0F172A]/10" />
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-8 py-32">
        {/* Decorative numeral */}
        <div className="absolute top-16 left-8 lg:left-24 font-serif text-[clamp(6rem,15vw,12rem)] leading-none text-[#0F172A]/[0.04] select-none pointer-events-none">
          02
        </div>

        <div className="relative grid lg:grid-cols-2 gap-20 lg:gap-32">
          {/* Left: editorial intro */}
          <div className="max-w-md">
            <p className="font-mono text-[11px] uppercase tracking-[4px] text-[#0F172A]/40 mb-6">
              What you get
            </p>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight font-serif italic">
              Six dimensions of clarity.
            </h2>
            <p className="mt-8 text-[15px] leading-[1.8] text-[#0F172A]/50">
              Every analysis produces a Vibe Report&mdash;a single page your
              entire team can read. No dashboards to configure, no SQL to
              write, no meetings to schedule.
            </p>
          </div>

          {/* Right: feature list */}
          <div className="space-y-10 lg:pt-8">
            {[
              {
                num: "01",
                title: "Vibe Reports",
                desc: "Five sentiment dimensions distilled into one shareable page.",
              },
              {
                num: "02",
                title: "Friction Scores",
                desc: "Per-feature heatmap ranked by severity. Engineering knows exactly what to fix.",
              },
              {
                num: "03",
                title: "Churn Signals",
                desc: "AI extracts patterns from the 2-3 star reviews nobody reads manually.",
              },
              {
                num: "04",
                title: "Release Impact",
                desc: "Before-and-after for every version. Letter grades in seconds.",
              },
              {
                num: "05",
                title: "Competitor Battles",
                desc: "Head-to-head dimension scores against up to three competitors.",
              },
              {
                num: "06",
                title: "AI Actions",
                desc: "Prioritized recommendations with impact and effort estimates.",
              },
            ].map((feature) => (
              <div key={feature.num} className="flex gap-6 group">
                <span className="font-mono text-xs text-[#0F172A]/25 pt-1 shrink-0 w-6">
                  {feature.num}
                </span>
                <div className="border-t border-[#0F172A]/10 pt-4 flex-1">
                  <h3 className="text-[15px] font-semibold text-[#0F172A] mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-[14px] leading-[1.7] text-[#0F172A]/45">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="mx-auto max-w-7xl px-8">
        <div className="h-px bg-[#0F172A]/10" />
      </div>

      {/* ── PROCESS ── */}
      <section id="process" className="relative z-10 mx-auto max-w-7xl px-8 py-32">
        <div className="absolute top-16 right-8 lg:right-24 font-serif text-[clamp(6rem,15vw,12rem)] leading-none text-[#0F172A]/[0.04] select-none pointer-events-none">
          03
        </div>

        <div className="relative max-w-md mb-20">
          <p className="font-mono text-[11px] uppercase tracking-[4px] text-[#0F172A]/40 mb-6">
            Process
          </p>
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight font-serif italic">
            Input. Insight. Action.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-16 md:gap-12">
          {[
            {
              step: "01",
              title: "Enter an app",
              desc: "Search by name, upload a CSV, or paste reviews directly. We handle both stores.",
            },
            {
              step: "02",
              title: "AI analyzes",
              desc: "Every review classified across five sentiment dimensions and scored for churn risk.",
            },
            {
              step: "03",
              title: "Get your report",
              desc: "A shareable Vibe Report with friction heatmaps and prioritized action items.",
            },
          ].map((s) => (
            <div key={s.step}>
              <span className="font-mono text-xs text-[#0F172A]/25 block mb-4">
                {s.step}
              </span>
              <h3 className="text-[17px] font-semibold text-[#0F172A] mb-3">
                {s.title}
              </h3>
              <p className="text-[14px] leading-[1.7] text-[#0F172A]/45">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="mx-auto max-w-7xl px-8">
        <div className="h-px bg-[#0F172A]/10" />
      </div>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-8 py-32">
        <div className="relative max-w-md mb-20">
          <p className="font-mono text-[11px] uppercase tracking-[4px] text-[#0F172A]/40 mb-6">
            Pricing
          </p>
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] leading-[1.05] tracking-tight font-serif italic">
            Completely free.
          </h2>
          <p className="mt-6 text-[15px] leading-[1.7] text-[#0F172A]/50">
            Bring your own Gemini API key from Google AI Studio, or try two
            analyses on us.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl">
          <div className="border-t border-[#0F172A]/10 pt-8">
            <p className="font-mono text-xs text-[#0F172A]/30 mb-3">Try it</p>
            <p className="font-mono text-4xl font-bold text-[#0F172A] mb-4">2</p>
            <p className="text-[14px] text-[#0F172A]/45 mb-6">free analyses, no key needed</p>
            <ul className="space-y-2.5 mb-8">
              {["Full Vibe Report", "100 reviews per analysis", "Shareable public link"].map((f) => (
                <li key={f} className="text-[14px] text-[#0F172A]/55 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#4A90D9] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 text-[14px] text-[#0F172A]/70 hover:text-[#0F172A] transition-colors group"
            >
              Start free <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="border-t border-[#4A90D9]/30 pt-8">
            <p className="font-mono text-xs text-[#4A90D9] mb-3">Unlimited</p>
            <p className="font-mono text-4xl font-bold text-[#0F172A] mb-4">$0</p>
            <p className="text-[14px] text-[#0F172A]/45 mb-6">forever, with your own key</p>
            <ul className="space-y-2.5 mb-8">
              {["200 reviews per analysis", "All 5 dimensions", "Competitor Battles", "Friction Scores & Churn Signals"].map((f) => (
                <li key={f} className="text-[14px] text-[#0F172A]/55 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#4A90D9] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="https://aistudio.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[14px] text-[#4A90D9] hover:text-[#0F172A] transition-colors group"
            >
              Get your free API key <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-8 pb-32">
        <div className="border-t border-[#0F172A]/10 pt-20">
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight font-serif italic max-w-lg">
            Your first Vibe Report. Sixty seconds.
          </h2>
          <Link
            href={ctaHref}
            className="mt-10 inline-flex items-center gap-2 text-[15px] text-[#0F172A]/70 hover:text-[#0F172A] transition-colors group"
          >
            {isLoggedIn ? "Open Dashboard" : "Generate your report"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── APP SHELF (magazine rack) ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-8 pb-20">
        <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { name: "Spotify", color: "#1DB954", emoji: "🎵" },
            { name: "Duolingo", color: "#58CC02", emoji: "🦉" },
            { name: "Notion", color: "#000000", emoji: "📝" },
            { name: "Figma", color: "#A259FF", emoji: "🎨" },
            { name: "Slack", color: "#4A154B", emoji: "💬" },
            { name: "Linear", color: "#5E6AD2", emoji: "📊" },
          ].map((app) => (
            <div
              key={app.name}
              className="shrink-0 flex items-center gap-3 rounded-xl bg-[#0F172A]/[0.06] px-4 py-3 backdrop-blur-sm"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                style={{ backgroundColor: app.color + "20" }}
              >
                {app.emoji}
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#0F172A]">{app.name}</p>
                <p className="text-[11px] text-[#0F172A]/35 font-mono">Vibe Report</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-[#0F172A]/8 py-8 px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-serif italic text-sm text-[#0F172A]/50">
            FrictionLens
          </span>
          <div className="flex items-center gap-6 text-[12px] text-[#0F172A]/35">
            <a href="#" className="hover:text-[#0F172A]/70 transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#0F172A]/70 transition-colors">Terms</a>
            <a href="#" className="hover:text-[#0F172A]/70 transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#0F172A]/70 transition-colors">GitHub</a>
          </div>
          <span className="text-[11px] text-[#0F172A]/30 font-mono">
            Built by Chetan Jonnalagadda
          </span>
        </div>
      </footer>
    </div>
  );
}
