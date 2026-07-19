# Team balancing — algorithm spec

Source of truth for how Footy Teams turns a pasted player list into
balanced teams. Update this file in the same commit as any change to
`lib/parsePlayers.ts` or `lib/balanceTeams.ts` — it should never drift
from what the code actually does.

## Input format

One player per line, optionally numbered/bulleted:

```
1. Habeeb - Striker - 5
2. Uti - Mid - 3
3. Larry - Def / Mid - 4
4. Ada - Attack
```

- **Separators:** `-`, `:`, or `,` between fields.
- **Name:** first field. Required — a line with no separator is treated
  as a name-only entry (position `any`, rating defaults to 3).
- **Position:** second field. Aliases per bucket are defined in
  `POSITION_ALIASES` (`lib/parsePlayers.ts`) — e.g. "Striker/St/Attack/
  Attacker/Fwd" all resolve to `striker`. Join two positions with `/`,
  `&`, `+`, or `and` for a flex player (e.g. "Def / Mid"). Unrecognized
  or missing text resolves to bucket `any`.
- **Rating (optional):** third field, an integer **1–5** (1 = weakest,
  5 = strongest). Only read when there's a field left over for the
  position too — so `"Name - 4"` is *not* misread as a rating with no
  position. **Omitted → defaults to 3** (`DEFAULT_RATING` in
  `parsePlayers.ts`), so every existing list/template keeps working
  without editing.
- Never throws — a line that doesn't parse cleanly degrades to
  best-effort (`any` position, rating 3) rather than rejecting the
  whole list.

## Balancing algorithm (`lib/balanceTeams.ts`)

Players are dealt out in passes. At every individual assignment, the
player goes to whichever eligible team is the **best fit**, decided in
this order:

1. **Least-filled team wins.** A team below the others in player count
   always takes priority — this is what keeps team sizes even.
1. **Rating cap, checked across every team that has room** — not just
   whichever team happens to be least-filled. A team should not end up
   with more than **2 players sharing the same rating value** (e.g.
   not three players rated 5, not three rated 1), so no single skill
   tier stacks onto one side. Checking the *whole* eligible set first
   (rather than narrowing to least-filled before checking the cap) is
   what makes this actually bite: if the cap were only checked among
   already-tied teams, a team that's merely a player behind would keep
   absorbing same-rated players indefinitely with the cap never
   applying to it.
2. **Least-filled, among teams that passed step 1.** Whichever
   surviving team has the fewest players wins next — this is what
   keeps team sizes even.
3. **Lowest running rating total wins the remaining tie.** Among teams
   still tied after 1–2, the one with the lower sum of ratings
   assigned so far gets the player — keeps overall *team strength*
   even, not just per-rating counts.
4. Any remaining tie is broken randomly.

This is a **soft cap**: if *no* team with room can accept the player
without breaking it (e.g. 2 teams, cap 2, but 5 players all rated 5),
step 1 relaxes to the full eligible set and steps 2–4 proceed as
normal. It never blocks a placement or leaves a team short. It can
also get out-muscled by the position baseline pass (2 strikers/mids/
defs per team, see below) when the team-size and position-bucket
sizes leave zero slack — e.g. 21 players into 3 teams of exactly 7,
where every position slot is already spoken for and a same-rated
cluster has nowhere else to go. In that squeeze, position balance
wins; rating balance does the best it can with what's left.

This selection rule (`bestFit` in `balanceTeams.ts`) is applied
uniformly across every pass below — position balancing and rating
balancing are resolved together, not as separate stages.

### Passes, in order

1. **Baseline pass** — every team gets up to 2 strikers, 2 mids, 2
   defs before anything else is dealt. Only single-position players
   take part; a flex player (e.g. "Def / Mid") is held back so it
   isn't locked into a bucket prematurely.
2. **Surplus pass** — extra single-position players left in a bucket
   after the baseline (e.g. more than 2 × team count defenders) are
   dealt from that same bucket next, before the flex/fill pools.
3. **Flex pass** — dual/multi-position players are dealt next. Each
   one lands on its best-fit team, then is assigned whichever of its
   own positions that team currently has fewer of.
4. **Fill pass** — everything left (`any`/unrecognized players, plus
   any surplus that didn't fit) fills remaining slots up to team size.

### Why rating is a soft cap, not a hard rule

Team size (`teamSize`) is a hard constraint — a team is never given a
player once it's full. Position and rating balancing are both
*preferences* layered on top: with a small or lopsided player pool
(e.g. everyone rated 5, or only enough players for 1.5 teams) a hard
cap would either strand players unassigned or force uneven team sizes.
Relaxing the rating cap before ever touching team size keeps "everyone
gets placed, teams stay the size you asked for" as the one guarantee
that never breaks.

## Output / sharing

- `lib/positionStyles.ts` — chip labels/colors per position bucket.
- `TeamCard.tsx` — renders each player's name, position chip, and
  rating as `★` stars (filled = rating, unfilled = remainder to 5).
- `lib/shareTeams.ts`:
  - `formatTeamsAsText` — flat `Name - Position - Rating` list per
    team (paste-to-chat format).
  - `encodeTeamsForUrl` / `decodeTeamsFromUrl` — share-link encoding.
    Player tuples are `[name, position, assignedBucket, rating]`.
    Older links without a 4th field decode with rating defaulted to 3,
    so previously shared links don't break.
