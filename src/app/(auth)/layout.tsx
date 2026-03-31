export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen font-sans">
      {/* Left panel — dark branding (hidden on mobile) */}
      <div className="hidden md:flex md:w-[45%] flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-12 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-friction-blue/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-friction-amber/10 blur-3xl" />

        <div className="relative text-center">
          <svg width="56" height="56" viewBox="-32 -32 64 64" fill="none" className="mx-auto mb-6">
            <ellipse cx="0" cy="0" rx="30" ry="29.5" fill="none" stroke="#ffffff" strokeWidth="1.2"/>
            <ellipse cx="0" cy="0" rx="24" ry="23.5" fill="#ffffff"/>
            <path d="M -7 -12 L 7 -12 L 7 -8.5 L -3 -8.5 L -3 -1.5 L 5 -1.5 L 5 1.5 L -3 1.5 L -3 13 L -7 13 Z" fill="#0f172a"/>
          </svg>
          <h2 className="text-2xl font-bold text-white tracking-tight">FrictionLens</h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
            Synthesize hundreds of app reviews into one actionable Vibe Report.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 md:bg-white">
        {/* Mobile: show subtle bg */}
        <div className="relative z-10 w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
