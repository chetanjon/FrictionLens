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
        "rounded-2xl border border-gray-200 bg-white px-4 py-[18px] text-center"
      )}
    >
      <div
        className="font-mono text-2xl font-extrabold tracking-tight"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="mt-[3px] font-mono text-[10px] uppercase tracking-[1px] text-gray-500">
        {label}
      </div>
      {subtitle && (
        <div className="mt-0.5 text-[11px] text-gray-600">{subtitle}</div>
      )}
    </div>
  );
}
