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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
            <svg width="20" height="20" viewBox="0 0 500 500" fill="none">
              <path d="M78 430 C82 426,88 418,90 412 C96 394,108 370,124 346 C142 318,162 294,184 272 C200 256,216 246,234 240 C242 238,248 238,256 236 C268 232,280 224,296 208 C316 184,338 156,356 130 C370 112,382 96,394 80 C398 74,402 70,404 66 C400 64,396 64,392 66 C382 78,370 94,356 114 C340 142,320 168,300 196 C284 214,272 226,260 234 C252 238,244 240,236 242 C224 246,210 254,192 268 C170 288,150 310,132 336 C116 360,104 382,96 400 C90 414,88 420,84 428 C80 436,76 438,72 440Z" fill="white" opacity="0.94"/>
              <ellipse cx="249" cy="238" rx="6" ry="5.5" fill="#4A90D9"/>
              <circle cx="238" cy="246" r="2" fill="#4A90D9" opacity="0.3"/>
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
