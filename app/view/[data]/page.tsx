import type { Metadata } from "next";
import Link from "next/link";
import { decodeTeamsFromUrl } from "@/lib/shareTeams";
import TeamCard from "@/components/TeamCard";

interface ViewPageProps {
  params: { data: string };
}

// Shared lineup links are personal/ephemeral, not content worth indexing —
// keep them out of search results even though the page itself is public.
const NOINDEX: Metadata["robots"] = { index: false, follow: false };

export function generateMetadata({ params }: ViewPageProps): Metadata {
  const teams = decodeTeamsFromUrl(params.data);
  if (!teams) {
    return { title: "Link not found", robots: NOINDEX };
  }
  const playerCount = teams.reduce((sum, t) => sum + t.players.length, 0);
  return {
    title: `${teams.length} teams, ${playerCount} players`,
    description: "Matchday lineup, generated with Footy Teams.",
    robots: NOINDEX,
  };
}

export default function ViewPage({ params }: ViewPageProps) {
  const teams = decodeTeamsFromUrl(params.data);

  if (!teams) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <section className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-chalk/15 p-8 text-center">
          <p className="font-display text-lg uppercase tracking-wide text-chalk">
            This link looks broken
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            The shared list couldn&apos;t be read — it may have been
            truncated when it was copied or pasted.
          </p>
          <Link
            href="/"
            className="mt-5 rounded-lg bg-amber px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-pitch-950 transition hover:brightness-110"
          >
            Build a new list
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <header className="mb-10 md:mb-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Matchday lineup
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-tight text-chalk md:text-5xl">
          Footy Teams
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted md:text-base">
          Shared, read-only teams for this matchday.{" "}
          <Link href="/" className="text-amber hover:brightness-110">
            Build your own
          </Link>
          .
        </p>
      </header>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {teams.map((team, i) => (
          <TeamCard key={i} team={team} index={i} />
        ))}
      </section>
    </main>
  );
}
