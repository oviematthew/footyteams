# Footy Teams (web)

A web version of the same team-balancing idea as `footybot` — paste a
player list, set a team size or count, get randomized, position-balanced
teams. No WhatsApp needed; just a page you open before kickoff.

Shares the same balancing rules as the WhatsApp bot (see the `footybot`
project's `PROJECT_PLAN.md` for the full rationale):

- Every team gets a baseline of up to 2 strikers, 2 mids, 2 defenders
  before anything else is dealt.
- Leftover players in a position (e.g. extra defenders) are dealt from
  that same position next, before a generic catch-all pool — so a team
  ends up with 3 defenders rather than a random unrelated position.
- At every step, the next player goes to whichever team currently has
  the fewest players — "best fit" instead of fixed order.
- Output is a flat `Name - Position` list per team, no "Flex" grouping.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- No backend/database — parsing and balancing run client-side in the
  browser (`lib/parsePlayers.ts`, `lib/balanceTeams.ts`, `lib/resolveTeams.ts`)

## Deployment

Zero-config on Vercel's free tier:

```bash
npx vercel
```

or connect the repo in the Vercel dashboard. No environment variables
or external services needed — it's a fully static/client-rendered tool.

## Project structure

```
app/
  layout.tsx        - fonts, global shell
  page.tsx           - page header + <TeamOrganizer />
  globals.css        - pitch background, ticket-edge signature style
components/
  TeamOrganizer.tsx  - state + orchestration (client component)
  PlayerInputForm.tsx
  TeamResults.tsx
  TeamCard.tsx        - the ticket-stub styled result card
lib/
  types.ts
  parsePlayers.ts     - same parsing leniency rules as the bot
  balanceTeams.ts      - the balancing algorithm
  resolveTeams.ts       - teamSize/teamCount precedence rules
  positionStyles.ts
```
