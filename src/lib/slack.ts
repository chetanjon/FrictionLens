/* ─────────────────────────────────────────────────────────
 * Slack incoming-webhook helper.
 *
 * Sends a notification when an analysis completes.
 * Silently no-ops if SLACK_WEBHOOK_URL is not set.
 * ───────────────────────────────────────────────────────── */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

type AnalysisNotification = {
  appName: string;
  vibeScore: number;
  reviewCount: number;
  competitorCount: number;
  analysisId: string;
  userEmail?: string;
};

export async function notifySlackAnalysisComplete(
  data: AnalysisNotification
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) return;

  const vibeEmoji =
    data.vibeScore >= 75 ? ":large_blue_circle:" :
    data.vibeScore >= 50 ? ":large_yellow_circle:" :
    ":red_circle:";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const payload = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${vibeEmoji} New Vibe Report: ${data.appName}`,
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Vibe Score:*\n${data.vibeScore}/100` },
          { type: "mrkdwn", text: `*Reviews:*\n${data.reviewCount}` },
          { type: "mrkdwn", text: `*Competitors:*\n${data.competitorCount}` },
          ...(data.userEmail
            ? [{ type: "mrkdwn", text: `*User:*\n${data.userEmail}` }]
            : []),
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "View Report", emoji: true },
            url: `${appUrl}/dashboard/analysis/${data.analysisId}`,
            style: "primary",
          },
        ],
      },
    ],
  };

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Never let Slack failures break the analysis pipeline
    console.error("Slack notification failed:", err);
  }
}
