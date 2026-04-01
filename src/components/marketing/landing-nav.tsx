import Link from "next/link";
import { MobileNav } from "@/components/marketing/mobile-nav";

type LandingNavProps = {
  isLoggedIn: boolean;
};

export function LandingNav({ isLoggedIn }: LandingNavProps) {
  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="36" height="36" viewBox="-32 -32 64 64" fill="none">
            <ellipse cx="0" cy="0" rx="30" ry="29.5" fill="none" stroke="#4A90D9" strokeWidth="1.2"/>
            <ellipse cx="0" cy="0" rx="24" ry="23.5" fill="#4A90D9"/>
            <path d="M -7 -12 L 7 -12 L 7 -8.5 L -3 -8.5 L -3 -1.5 L 5 -1.5 L 5 1.5 L -3 1.5 L -3 13 L -7 13 Z" fill="white"/>
          </svg>
          <span className="text-[17px] font-semibold tracking-tight text-gray-900">
            FrictionLens
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#demo"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Demo
          </a>
          <a
            href="#pricing"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
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
                className="hidden md:inline text-sm text-gray-500 hover:text-slate-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden md:inline-flex h-9 items-center rounded-lg bg-friction-blue px-4 text-sm font-medium text-white hover:bg-friction-blue/90 transition-colors"
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
