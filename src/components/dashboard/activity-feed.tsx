"use client";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type ActivityEventType = "completed" | "started" | "shared" | "failed";

type ActivityEvent = {
  id: string;
  type: ActivityEventType;
  appName: string;
  vibeScore?: number | null;
  timestamp: string;
};

type ActivityFeedProps = {
  events: ActivityEvent[];
};

const EVENT_DOT_COLOR: Record<ActivityEventType, string> = {
  completed: "bg-emerald-400",
  started: "bg-friction-blue",
  shared: "bg-purple-400",
  failed: "bg-friction-red",
};

const MAX_EVENTS = 8;

function buildEventText(event: ActivityEvent): string {
  switch (event.type) {
    case "completed":
      return event.vibeScore != null
        ? `${event.appName} analysis completed — Vibe ${Math.round(event.vibeScore)}`
        : `${event.appName} analysis completed`;
    case "started":
      return `${event.appName} analysis started`;
    case "shared":
      return `${event.appName} report shared publicly`;
    case "failed":
      return `${event.appName} analysis failed`;
  }
}

function relativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const dotColor = EVENT_DOT_COLOR[event.type];
  const text = buildEventText(event);

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span
        className={cn(
          "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
          dotColor
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-300 leading-snug">{text}</p>
        <time
          dateTime={event.timestamp}
          className="mt-0.5 block font-mono text-[10px] text-slate-400"
        >
          {relativeTime(event.timestamp)}
        </time>
      </div>
    </div>
  );
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const visible = events.slice(0, MAX_EVENTS);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111111] p-5">
      {/* Section label */}
      <span className="mb-3 block font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-friction-blue">
        Activity
      </span>

      {visible.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">
          No activity yet.
        </p>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          <ul
            className="divide-y divide-white/[0.06]"
            aria-label="Recent activity"
          >
            {visible.map((event) => (
              <li key={event.id}>
                <ActivityRow event={event} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export type { ActivityEvent, ActivityFeedProps };
