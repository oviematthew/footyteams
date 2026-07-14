import type { AssignedPlayer, Player, PositionBucket, Team } from "./types";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Splits players into balanced teams.
 *
 *  - Core rule: whenever a player is assigned, it goes to whichever
 *    team currently has the fewest players (tie broken randomly) —
 *    "best fit" rather than fixed round-robin order.
 *  - Baseline pass: every team gets up to 2 strikers, 2 mids, 2 defs
 *    before anything else is dealt. Only single-position players take
 *    part — a player listed with two positions (e.g. "Def / Mid") is
 *    held back so it isn't locked into a bucket prematurely.
 *  - Surplus pass: extra single-position players left in a bucket after
 *    the baseline (e.g. more than 2 * teamCount defenders) get dealt
 *    from that same bucket next, before the flex/fill pools.
 *  - Flex pass: dual-position players are dealt next. Each one goes to
 *    the least-filled team, then is assigned whichever of its own
 *    positions that team currently has fewer of — letting flex players
 *    swing into whatever a team is still short on.
 *  - Fill pass: everything left ("any"/unrecognized players, plus any
 *    surplus that didn't fit) fills remaining slots up to teamSize.
 */
export function balanceTeams(
  players: Player[],
  teamCount: number,
  teamSize: number
): Team[] {
  const teams: Team[] = Array.from({ length: teamCount }, () => ({
    players: [],
    hasExtra: false,
  }));

  const teamsHaveRoom = () => teams.some((t) => t.players.length < teamSize);

  const leastFilledEligible = (eligible: number[]): number => {
    const minSize = Math.min(...eligible.map((i) => teams[i].players.length));
    const candidates = eligible.filter((i) => teams[i].players.length === minSize);
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const dealToLeastFilled = (player: AssignedPlayer) => {
    const eligible = teams
      .map((_, i) => i)
      .filter((i) => teams[i].players.length < teamSize);
    if (eligible.length === 0) return;
    teams[leastFilledEligible(eligible)].players.push(player);
  };

  const singleBucketOf = (p: Player): PositionBucket | null =>
    p.buckets.length === 1 && p.buckets[0] !== "any" ? p.buckets[0] : null;

  const singles: Record<Exclude<PositionBucket, "any">, Player[]> = {
    striker: shuffle(players.filter((p) => singleBucketOf(p) === "striker")),
    mid: shuffle(players.filter((p) => singleBucketOf(p) === "mid")),
    def: shuffle(players.filter((p) => singleBucketOf(p) === "def")),
  };
  const flexPlayers = shuffle(players.filter((p) => p.buckets.length >= 2));
  const anyPlayers = shuffle(
    players.filter((p) => p.buckets.length === 1 && p.buckets[0] === "any")
  );

  const positionOrder: Exclude<PositionBucket, "any">[] = ["striker", "mid", "def"];

  // Baseline pass — up to 2 per position per team, single-position players only.
  for (const bucketKey of positionOrder) {
    const bucket = singles[bucketKey];
    const dealtCount = new Array(teamCount).fill(0);

    while (bucket.length > 0 && teamsHaveRoom()) {
      const eligible = teams
        .map((_, i) => i)
        .filter((i) => dealtCount[i] < 2 && teams[i].players.length < teamSize);
      if (eligible.length === 0) break;

      const idx = leastFilledEligible(eligible);
      const player = bucket.shift()!;
      teams[idx].players.push({ ...player, assignedBucket: bucketKey });
      dealtCount[idx] += 1;
    }
  }

  // Surplus pass — same-bucket single-position players left over.
  for (const bucketKey of positionOrder) {
    const bucket = singles[bucketKey];
    while (bucket.length > 0 && teamsHaveRoom()) {
      const player = bucket.shift()!;
      dealToLeastFilled({ ...player, assignedBucket: bucketKey });
    }
  }

  // Flex pass — dual/multi-position players swing into whichever of their
  // own positions the team they land on currently has fewer of.
  const leftoverFlex: Player[] = [];
  for (const player of flexPlayers) {
    const eligible = teams
      .map((_, i) => i)
      .filter((i) => teams[i].players.length < teamSize);
    if (eligible.length === 0) {
      leftoverFlex.push(player);
      continue;
    }
    const teamIdx = leastFilledEligible(eligible);
    const team = teams[teamIdx];
    const buckets = player.buckets as Exclude<PositionBucket, "any">[];
    const countOf = (b: PositionBucket) =>
      team.players.filter((p) => p.assignedBucket === b).length;
    let chosen = buckets[0];
    let chosenCount = countOf(chosen);
    for (const b of buckets.slice(1)) {
      const c = countOf(b);
      if (c < chosenCount) {
        chosen = b;
        chosenCount = c;
      }
    }
    team.players.push({ ...player, assignedBucket: chosen });
  }

  // Fill pass — "any"/unrecognized players plus anything left undealt.
  const fillPool = shuffle([
    ...singles.striker,
    ...singles.mid,
    ...singles.def,
    ...leftoverFlex,
    ...anyPlayers,
  ]);
  for (const player of fillPool) {
    if (!teamsHaveRoom()) break;
    const buckets = player.buckets;
    const assignedBucket: PositionBucket =
      buckets.length === 1 ? buckets[0] : buckets[Math.floor(Math.random() * buckets.length)];
    dealToLeastFilled({ ...player, assignedBucket });
  }

  const minFinal = Math.min(...teams.map((t) => t.players.length));
  for (const team of teams) {
    team.hasExtra = team.players.length > minFinal;
  }

  return teams;
}
