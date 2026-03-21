/**
 * Color and scoring constants for FrictionLens UI.
 */

export function scoreColor(score: number): string {
  if (score > 7) return "#D94F4F";
  if (score > 4) return "#D4A843";
  return "#4A90D9";
}

export function severityColor(severity: string): string {
  switch (severity) {
    case "Critical":
      return "#D94F4F";
    case "High":
      return "#D4A843";
    case "Medium":
      return "#4A90D9";
    case "Low":
      return "#94A3B8";
    default:
      return "#94A3B8";
  }
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case "P0":
      return "#D94F4F";
    case "P1":
      return "#D4A843";
    case "P2":
      return "#4A90D9";
    case "P3":
      return "#94A3B8";
    default:
      return "#94A3B8";
  }
}

export function vibeColor(score: number): string {
  if (score >= 75) return "#4A90D9";
  if (score >= 50) return "#D4A843";
  return "#D94F4F";
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

export function trendColor(trend: string): string {
  switch (trend) {
    case "rising":
      return "#D94F4F";
    case "falling":
      return "#4A90D9";
    case "stable":
      return "#94A3B8";
    default:
      return "#94A3B8";
  }
}
