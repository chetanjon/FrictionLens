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
              <path d="M102 82 C118 98,138 126,155 150 C168 170,182 190,198 210 C210 226,222 237,236 244 C244 248,252 249,260 252 C272 257,284 268,300 290 C318 316,340 348,360 376 C374 396,390 414,410 436 C406 440,400 442,394 444 C374 422,358 400,340 374 C322 348,304 322,288 298 C276 280,266 268,256 260 C248 254,240 252,232 250 C222 248,212 238,198 222 C180 200,165 178,150 156 C136 134,122 112,110 94Z" fill="white" opacity="0.92"/>
              <ellipse cx="250" cy="251" rx="5.5" ry="5" fill="#4A90D9"/>
              <ellipse cx="236" cy="240" rx="2.2" ry="1.8" fill="#4A90D9" opacity="0.3"/>
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
