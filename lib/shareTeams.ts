import { bucketLabel } from "./positionStyles";
import type { AssignedPlayer, PositionBucket, Team } from "./types";

const VALID_BUCKETS: PositionBucket[] = ["striker", "mid", "def", "any"];

/**
 * Flat "Name - Position" list per team, matching the WhatsApp-bot output
 * convention this app is modeled on — ready to paste straight into a chat.
 */
export function formatTeamsAsText(teams: Team[]): string {
  return teams
    .map((team, i) => {
      const header = `Team ${i + 1}`;
      const lines = team.players.map(
        (player, j) =>
          `${j + 1}. ${player.name} - ${bucketLabel[player.assignedBucket]} - ${player.rating}`
      );
      return [header, ...lines].join("\n");
    })
    .join("\n\n");
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const base64 = padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "=");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

type EncodedPlayer = [
  name: string,
  position: string,
  assignedBucket: PositionBucket,
  rating: number
];
type EncodedTeams = EncodedPlayer[][];

/** Serializes teams into a compact, URL-safe token — the URL *is* the data, no storage needed. */
export function encodeTeamsForUrl(teams: Team[]): string {
  const encoded: EncodedTeams = teams.map((team) =>
    team.players.map((p) => [p.name, p.position, p.assignedBucket, p.rating])
  );
  return toBase64Url(JSON.stringify(encoded));
}

/** Inverse of `encodeTeamsForUrl`. Returns null for any malformed/truncated input rather than throwing. */
export function decodeTeamsFromUrl(token: string): Team[] | null {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(token));
    if (!Array.isArray(parsed)) return null;

    const teams: Team[] = parsed.map((rawTeam) => {
      if (!Array.isArray(rawTeam)) throw new Error("invalid team");
      const players: AssignedPlayer[] = rawTeam.map((rawPlayer) => {
        if (
          !Array.isArray(rawPlayer) ||
          (rawPlayer.length !== 3 && rawPlayer.length !== 4) ||
          typeof rawPlayer[0] !== "string" ||
          typeof rawPlayer[1] !== "string" ||
          !VALID_BUCKETS.includes(rawPlayer[2])
        ) {
          throw new Error("invalid player");
        }
        const [name, position, assignedBucket, rawRating] = rawPlayer as EncodedPlayer;
        if (!name.trim()) throw new Error("invalid player name");
        // Older share links (pre-rating) only have 3 fields — default to 3.
        const rating =
          typeof rawRating === "number" && rawRating >= 1 && rawRating <= 5 ? rawRating : 3;
        return { name, position, buckets: [assignedBucket], assignedBucket, rating };
      });
      return { players, hasExtra: false };
    });

    if (teams.length === 0) return null;
    const minSize = Math.min(...teams.map((t) => t.players.length));
    for (const team of teams) {
      team.hasExtra = team.players.length > minSize;
    }
    return teams;
  } catch {
    return null;
  }
}
