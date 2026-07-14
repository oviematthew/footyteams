import type { Player, PositionBucket } from "./types";

const MARKER_RE = /^\s*(?:\d+[.)]|[-•*])\s*/;
const NUMBERED_RE = /^\s*\d+[.)]/;
const NAME_POSITION_SEPARATOR_RE = /\s*[-:,]\s*/;
const POSITION_SPLIT_RE = /\s*(?:\/|&|\+|\band\b)\s*/i;

/**
 * Aliases a user might type for each position. Shared with the UI so the
 * help tooltip can never drift out of sync with what the parser accepts.
 */
export const POSITION_ALIASES: Record<Exclude<PositionBucket, "any">, string[]> = {
  striker: ["Striker", "St", "Attack", "Attacker", "Atk", "Forward", "Fwd"],
  mid: ["Mid", "Midfielder", "Midfield", "Mf"],
  def: ["Def", "Defense", "Defence", "Defender", "Dfd", "Back"],
};

const ALIAS_TO_BUCKET: Map<string, PositionBucket> = new Map();
for (const [bucket, aliases] of Object.entries(POSITION_ALIASES) as [
  Exclude<PositionBucket, "any">,
  string[]
][]) {
  for (const alias of aliases) {
    ALIAS_TO_BUCKET.set(alias.toLowerCase(), bucket);
  }
}

function resolveBuckets(rawPosition: string): PositionBucket[] {
  const tokens = rawPosition
    .split(POSITION_SPLIT_RE)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  const buckets: PositionBucket[] = [];
  for (const token of tokens) {
    const bucket = ALIAS_TO_BUCKET.get(token);
    if (bucket && !buckets.includes(bucket)) {
      buckets.push(bucket);
    }
  }
  return buckets.length > 0 ? buckets : ["any"];
}

function parseLine(line: string): Player | null {
  const stripped = line.replace(MARKER_RE, "").trim();
  if (!stripped) return null;

  const parts = stripped.split(NAME_POSITION_SEPARATOR_RE);
  if (parts.length < 2 || !parts[0].trim()) {
    const name = stripped.trim();
    return name ? { name, position: "any", buckets: ["any"] } : null;
  }

  const name = parts[0].trim();
  if (!name) return null;
  const rawPosition = parts.slice(1).join(" ").trim() || "any";
  return { name, position: rawPosition, buckets: resolveBuckets(rawPosition) };
}

/**
 * Parses one player per line, tolerant of "-", ":", or "," as the
 * name/position separator, "/", "&", "+", or "and" between multiple
 * positions, and a leading bullet/number marker. Lines with no
 * recognizable separator are treated as a name with position "any".
 *
 * If any numbered line ("1.", "2)") is present, everything before the
 * first one is dropped (e.g. a "Payment list" header), and once the list
 * has started, only marker-prefixed lines count as players — stray prose
 * in between is ignored rather than mis-parsed. Lists with no numbering
 * at all fall back to treating every non-blank line as a candidate. Never
 * throws.
 */
export function parsePlayers(rawText: string): Player[] {
  const lines = rawText.split("\n");
  const listStart = lines.findIndex((line) => NUMBERED_RE.test(line));
  const isNumberedList = listStart !== -1;
  const candidateLines = isNumberedList ? lines.slice(listStart) : lines;

  const players: Player[] = [];
  for (const line of candidateLines) {
    if (!line.trim()) continue;
    if (isNumberedList && !MARKER_RE.test(line)) continue;
    const player = parseLine(line);
    if (player) players.push(player);
  }

  return players;
}
