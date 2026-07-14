import TeamOrganizer from "@/components/TeamOrganizer";
import HelpTooltip from "@/components/HelpTooltip";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <header className="mb-10 md:mb-14">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Matchday prep
          </p>
          <HelpTooltip />
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-tight text-chalk md:text-5xl">
          Footy Teams
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted md:text-base">
          Paste your player list, set a team size or count, and get
          randomized, position-balanced teams — no more burning kickoff
          time picking sides.
        </p>
      </header>
      <TeamOrganizer />
    </main>
  );
}
