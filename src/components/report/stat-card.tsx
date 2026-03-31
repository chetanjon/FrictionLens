import { cn } from "@/lib/utils";

type StatCardProps = {
  value: string;
  label: string;
  subtitle?: string;
  color?: string;
};

export function StatCard({ value, label, subtitle, color }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-[18px] text-center backdrop-blur-md"
      )}
    >
      <div
        className="font-mono text-2xl font-extrabold tracking-tight"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="mt-[3px] font-mono text-[10px] uppercase tracking-[1px] text-slate-400">
        {label}
      </div>
      {subtitle && (
        <div className="mt-0.5 text-[11px] text-slate-300">{subtitle}</div>
      )}
    </div>
  );
}
