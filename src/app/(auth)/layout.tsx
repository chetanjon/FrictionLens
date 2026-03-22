export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 font-sans">
      {/* Ambient background — matches landing page */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[700px] w-[700px] rounded-full bg-friction-blue/[0.04] blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-friction-amber/[0.05] blur-3xl" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
