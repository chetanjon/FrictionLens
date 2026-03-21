import { severityColor } from "@/lib/constants";

type SeverityBadgeProps = {
  severity: "Critical" | "High" | "Medium" | "Low";
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const color = severityColor(severity);

  return (
    <span
      className="inline-block rounded-lg px-2 py-0.5 font-mono text-[10px] font-semibold"
      style={{
        background: `${color}10`,
        color,
      }}
    >
      {severity}
    </span>
  );
}
