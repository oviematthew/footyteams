import type { Metadata } from "next";
import Link from "next/link";
import { decodeTeamsFromUrl } from "@/lib/shareTeams";
import TeamResults from "@/components/TeamResults";

interface ViewPageProps {
  params: Promise<{ data: string }>;
}

// Shared lineup links are personal/ephemeral, not content worth indexing —
// keep them out of search results even though the page itself is public.
const NOINDEX: Metadata["robots"] = { index: false, follow: false };

export async function generateMetadata(props: ViewPageProps): Promise<Metadata> {
  const params = await props.params;
  const path = `/view/${params.data}`;
  const teams = decodeTeamsFromUrl(params.data);

  if (!teams) {
    return {
      title: "Link not found",
      robots: NOINDEX,
      alternates: { canonical: path },
      // Reset OG/Twitter to plain app branding rather than inheriting the
      // homepage's — a broken share link shouldn't preview as the homepage.
      openGraph: { url: path, title: "Link not found", description: undefined },
      twitter: { title: "Link not found", description: undefined },
    };
  }

  // Note: og:image/twitter:image are supplied automatically by the
  // colocated opengraph-image.tsx file convention for this route segment —
  // no need to list them here too.

  const playerCount = teams.reduce((sum, t) => sum + t.players.length, 0);
  const title = `${teams.length} teams, ${playerCount} players`;
  const description = "Matchday lineup, generated with Footy Teams — tap to view.";

  return {
    title,
    description,
    robots: NOINDEX,
    // Every field below must be set explicitly: Next.js merges unset
    // metadata fields from the parent layout, so without this the share
    // link's preview card (image, title, and the URL it links to) would
    // silently fall back to the generic homepage instead of this lineup.
    alternates: { canonical: path },
    openGraph: { url: path, title, description },
    twitter: { title, description },
  };
}

export default async function ViewPage(props: ViewPageProps) {
  const params = await props.params;
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

      <TeamResults teams={teams} />
    </main>
  );
}
