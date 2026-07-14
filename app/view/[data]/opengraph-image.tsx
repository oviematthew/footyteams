import { ImageResponse } from "next/og";
import { decodeTeamsFromUrl } from "@/lib/shareTeams";
import { SITE_HOST } from "@/lib/siteConfig";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface OgImageProps {
  params: { data: string };
}

export default function OpengraphImage({ params }: OgImageProps) {
  const teams = decodeTeamsFromUrl(params.data);

  const eyebrow = teams ? "Matchday lineup" : "Footy Teams";
  const heading = teams
    ? `${teams.length} Team${teams.length === 1 ? "" : "s"}`
    : "Link not found";
  const subheading = teams
    ? `${teams.reduce((sum, t) => sum + t.players.length, 0)} players, position-balanced and ready to go.`
    : "This shared lineup link looks broken or truncated.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0B2E22",
          color: "#F3EFE4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#8FB4A3",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 108,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: -2,
            marginTop: 16,
          }}
        >
          {heading}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#8FB4A3",
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          {subheading}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#FFB100",
            marginTop: 48,
            fontFamily: "monospace",
          }}
        >
          {SITE_HOST}
        </div>
      </div>
    ),
    size
  );
}
