import type { AssignedPlayer, Player, PositionBucket, Team } from "./types";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const RATING_CAP_PER_TEAM = 2;

/**
 * Splits players into balanced teams.
 *
 *  - Core rule: whenever a player is assigned, it goes to whichever
 *    eligible team is the "best fit" — least-filled first, then (among
 *    ties) the team that keeps rating distribution fairest — rather than
 *    fixed round-robin order.
 *  - Rating fit: a team should end up with at most 2 players sharing the
 *    same rating value (1-5), so top (or bottom) performers don't stack
 *    on one side. This is a soft cap — if honoring it is impossible given
 *    the pool (e.g. 2 teams, 5 players all rated 5), it relaxes rather
 *    than blocking placement. Among teams that pass the cap, the one
 *    with the lowest running rating total wins the tie, keeping overall
 *    team strength even, not just per-rating counts.
 *  - Baseline pass: every team gets up to 2 strikers, 2 mids, 2 defs
 *    before anything else is dealt. Only single-position players take
 *    part — a player listed with two positions (e.g. "Def / Mid") is
 *    held back so it isn't locked into a bucket prematurely.
 *  - Surplus pass: extra single-position players left in a bucket after
 *    the baseline (e.g. more than 2 * teamCount defenders) get dealt
 *    from that same bucket next, before the flex/fill pools.
 *  - Flex pass: dual-position players are dealt next, one at a time.
 *    Team and position are chosen together — whichever (team,
 *    own-position) pairing is currently the shortest wins first,
 *    best-fit (size/rating) only breaks ties among those — so a flex
 *    player actually patches whichever team/position combo needs it
 *    most, rather than being routed to a team by size alone and only
 *    then handed its least-crowded position on that team. When a
 *    player's own shortest fit ties across two different positions
 *    (two unrelated gaps, not two teams wanting the same thing), the
 *    tie goes to whichever position fewer of the still-unprocessed
 *    flex players could also cover — a gap only this player can fill
 *    must be filled by it; a gap others could equally fill can wait.
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

  // Per-team rating bookkeeping, keyed 1-5 (index 0 unused).
  const ratingCounts: number[][] = Array.from({ length: teamCount }, () => new Array(6).fill(0));
  const ratingSums: number[] = new Array(teamCount).fill(0);

  const teamsHaveRoom = () => teams.some((t) => t.players.length < teamSize);

  /** Picks the best-fit team among `eligible`: under the per-rating cap
   *  where any team can still take it, then least-filled, then lowest
   *  rating total. Cap is checked across the *whole* eligible set first —
   *  not just whichever team is currently least-filled — otherwise a team
   *  that's merely a player behind would keep absorbing same-rated
   *  players indefinitely with no cap check ever applying to it. */
  const bestFit = (eligible: number[], rating: number): number => {
    const underCap = eligible.filter((i) => ratingCounts[i][rating] < RATING_CAP_PER_TEAM);
    const pool = underCap.length > 0 ? underCap : eligible;

    const minSize = Math.min(...pool.map((i) => teams[i].players.length));
    const leastFilled = pool.filter((i) => teams[i].players.length === minSize);

    const minSum = Math.min(...leastFilled.map((i) => ratingSums[i]));
    const candidates = leastFilled.filter((i) => ratingSums[i] === minSum);
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const place = (teamIdx: number, player: AssignedPlayer) => {
    teams[teamIdx].players.push(player);
    ratingCounts[teamIdx][player.rating] += 1;
    ratingSums[teamIdx] += player.rating;
  };

  const dealToLeastFilled = (player: AssignedPlayer) => {
    const eligible = teams
      .map((_, i) => i)
      .filter((i) => teams[i].players.length < teamSize);
    if (eligible.length === 0) return;
    place(bestFit(eligible, player.rating), player);
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

      const player = bucket.shift()!;
      const idx = bestFit(eligible, player.rating);
      place(idx, { ...player, assignedBucket: bucketKey });
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

  // Flex pass — dual/multi-position players patch whichever team/position
  // combo is shortest, team and bucket chosen together. Picking the team
  // first (by size/rating alone, blind to position) and only then asking
  // "which of my positions is this team short on" misses the whole point
  // of a flex player: a "Def / Striker" sitting on a team that's already
  // fine for strikers should swing to the OTHER team if that one is the
  // one actually short a striker, not settle for "def" locally.
  const leftoverFlex: Player[] = [];
  const pendingFlex = [...flexPlayers];
  while (pendingFlex.length > 0) {
    const player = pendingFlex.shift()!;
    const eligible = teams
      .map((_, i) => i)
      .filter((i) => teams[i].players.length < teamSize);
    if (eligible.length === 0) {
      leftoverFlex.push(player);
      continue;
    }
    const buckets = player.buckets as Exclude<PositionBucket, "any">[];
    const countOf = (teamIdx: number, b: PositionBucket) =>
      teams[teamIdx].players.filter((p) => p.assignedBucket === b).length;

    const options = eligible.flatMap((i) => buckets.map((b) => ({ i, b, count: countOf(i, b) })));
    const minCount = Math.min(...options.map((o) => o.count));
    let shortestFit = options.filter((o) => o.count === minCount);

    // If this player's shortest fit spans more than one of their own
    // positions (e.g. team A is tied-short on striker and team B is
    // tied-short on def), don't leave the pick to rating/size alone —
    // that's a coin flip between two unrelated fixes. Prefer whichever
    // position fewer of the *other* still-waiting flex players could also
    // cover, so a gap only this player can fill doesn't lose out to one
    // someone else could just as easily close afterward.
    const distinctBuckets = [...new Set(shortestFit.map((o) => o.b))];
    if (distinctBuckets.length > 1) {
      const rarity = (b: PositionBucket) =>
        pendingFlex.filter((p) => (p.buckets as PositionBucket[]).includes(b)).length;
      const minRarity = Math.min(...distinctBuckets.map(rarity));
      const rarestBuckets = distinctBuckets.filter((b) => rarity(b) === minRarity);
      shortestFit = shortestFit.filter((o) => rarestBuckets.includes(o.b));
    }

    const candidateTeams = [...new Set(shortestFit.map((o) => o.i))];
    const teamIdx = bestFit(candidateTeams, player.rating);
    const chosen = shortestFit.find((o) => o.i === teamIdx)!.b;
    place(teamIdx, { ...player, assignedBucket: chosen });
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
