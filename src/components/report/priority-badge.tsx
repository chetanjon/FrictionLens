import { priorityColor } from "@/lib/constants";

type PriorityBadgeProps = {
  priority: "P0" | "P1" | "P2" | "P3";
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const color = priorityColor(priority);

  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-bold"
      style={{
        background: `${color}12`,
        color,
      }}
    >
      {priority}
    </span>
  );
}
