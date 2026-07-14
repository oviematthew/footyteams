import { ImageResponse } from "next/og";
import { SITE_HOST } from "@/lib/siteConfig";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          Matchday prep
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
          Footy Teams
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
          Paste your player list, get randomized, position-balanced teams instantly.
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
