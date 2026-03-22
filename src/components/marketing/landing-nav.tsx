import Link from "next/link";
import { MobileNav } from "@/components/marketing/mobile-nav";

type LandingNavProps = {
  isLoggedIn: boolean;
};

export function LandingNav({ isLoggedIn }: LandingNavProps) {
  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-slate-900">
            FrictionLens
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#demo"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Demo
          </a>
          <a
            href="#pricing"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="hidden md:inline-flex h-9 items-center rounded-lg bg-friction-blue px-4 text-sm font-medium text-white hover:bg-friction-blue/90 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden md:inline-flex h-9 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </nav>
  );
}
