export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 font-sans">
      {children}
    </div>
  );
}
