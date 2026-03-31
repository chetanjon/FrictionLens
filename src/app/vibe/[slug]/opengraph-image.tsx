import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FrictionLens Vibe Report";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function vibeColor(score: number): string {
  if (score >= 75) return "#6B9FD4";
  if (score >= 50) return "#C9B06A";
  return "#C47070";
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch analysis data
  let appName = "FrictionLens";
  let vibeScore = 0;
  let reviewCount = 0;
  let summary = "";
  let topFriction = "";

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/analyses?slug=eq.${encodeURIComponent(slug)}&is_public=eq.true&select=app_name,vibe_score,review_count,results`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      const data = await res.json();
      if (data && data[0]) {
        appName = data[0].app_name ?? appName;
        vibeScore = Math.round(data[0].vibe_score ?? 0);
        reviewCount = data[0].review_count ?? 0;
        const results = data[0].results;
        if (results) {
          summary = results.summary ?? "";
          const frictionScores = results.friction_scores ?? [];
          if (frictionScores[0]) {
            topFriction = frictionScores[0].feature ?? "";
          }
        }
      }
    }
  } catch {
    // Use defaults
  }

  const color = vibeColor(vibeScore);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)",
          padding: "60px 70px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="44" height="44" viewBox="-32 -32 64 64" fill="none">
            <ellipse cx="0" cy="0" rx="30" ry="29.5" fill="none" stroke="white" stroke-width="1.4"/>
            <ellipse cx="0" cy="0" rx="24" ry="23.5" fill="white"/>
            <path d="M -7 -12 L 7 -12 L 7 -8.5 L -3 -8.5 L -3 -1.5 L 5 -1.5 L 5 1.5 L -3 1.5 L -3 13 L -7 13 Z" fill="#0f0f0f"/>
          </svg>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#0F172A",
              letterSpacing: "-0.5px",
            }}
          >
            FrictionLens
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              fontWeight: 600,
              color: "#94A3B8",
              textTransform: "uppercase" as const,
              letterSpacing: 2,
            }}
          >
            Vibe Report
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 60,
            marginTop: 20,
          }}
        >
          {/* Vibe Score circle */}
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              border: `8px solid ${color}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: color,
                lineHeight: 1,
              }}
            >
              {vibeScore}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#94A3B8",
                textTransform: "uppercase" as const,
                letterSpacing: 2,
                marginTop: 4,
              }}
            >
              Vibe Score
            </span>
          </div>

          {/* App info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              flex: 1,
            }}
          >
            <h1
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: "-1px",
              }}
            >
              {appName}
            </h1>

            {summary && (
              <p
                style={{
                  fontSize: 18,
                  color: "#64748B",
                  lineHeight: 1.5,
                  margin: 0,
                  maxWidth: 500,
                }}
              >
                {summary.length > 120
                  ? summary.slice(0, 120) + "..."
                  : summary}
              </p>
            )}

            {/* Stats row */}
            <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  {reviewCount}
                </span>
                <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>
                  Reviews
                </span>
              </div>
              {topFriction && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#C47070",
                    }}
                  >
                    {topFriction}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#94A3B8",
                      fontWeight: 600,
                    }}
                  >
                    Top Friction
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #E2E8F0",
            paddingTop: 20,
          }}
        >
          <span style={{ fontSize: 14, color: "#94A3B8" }}>
            frictionlens.com/vibe/{slug}
          </span>
          <span style={{ fontSize: 14, color: "#94A3B8" }}>
            AI-Powered Review Intelligence
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
