/**
 * Color and scoring constants for FrictionLens UI.
 */

export function scoreColor(score: number): string {
  if (score > 7) return "#C47070";
  if (score > 4) return "#C9B06A";
  return "#6B9FD4";
}

export function severityColor(severity: string): string {
  switch (severity) {
    case "Critical":
      return "#C47070";
    case "High":
      return "#C9B06A";
    case "Medium":
      return "#6B9FD4";
    case "Low":
      return "#94A3B8";
    default:
      return "#94A3B8";
  }
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case "P0":
      return "#C47070";
    case "P1":
      return "#C9B06A";
    case "P2":
      return "#6B9FD4";
    case "P3":
      return "#94A3B8";
    default:
      return "#94A3B8";
  }
}

export function vibeColor(score: number): string {
  if (score >= 75) return "#6B9FD4";
  if (score >= 50) return "#C9B06A";
  return "#C47070";
}

export function trendIcon(trend: string): string {
  switch (trend) {
    case "rising":
      return "↑";
    case "falling":
      return "↓";
    case "stable":
      return "→";
    default:
      return "→";
  }
}

export const PLATFORMS = ["ios", "android", "reddit"] as const;
export type Platform = (typeof PLATFORMS)[number];

export function platformLabel(platform: string): string {
  switch (platform) {
    case "ios":
      return "iOS";
    case "android":
      return "Android";
    case "reddit":
      return "Reddit";
    default:
      return platform;
  }
}

export function platformBadgeClasses(platform: string): string {
  switch (platform) {
    case "ios":
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    case "android":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "reddit":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

export function trendColor(trend: string): string {
  switch (trend) {
    case "rising":
      return "#C47070";
    case "falling":
      return "#6B9FD4";
    case "stable":
      return "#94A3B8";
    default:
      return "#94A3B8";
  }
}
