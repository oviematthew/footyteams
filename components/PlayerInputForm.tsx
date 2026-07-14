"use client";

interface PlayerInputFormProps {
  rawInput: string;
  onRawInputChange: (value: string) => void;
  teamSize: string;
  onTeamSizeChange: (value: string) => void;
  teamCount: string;
  onTeamCountChange: (value: string) => void;
  onGenerate: () => void;
  onReshuffle: () => void;
  hasResults: boolean;
  error: string | null;
}

const PLACEHOLDER = `1. Habeeb - Striker
2. Uti - Mid
3. Larry - Def / Mid
4. Ada - Attack
5. Chidi - Mid
6. Ovie - Defense
7. Zara - Any`;

export default function PlayerInputForm({
  rawInput,
  onRawInputChange,
  teamSize,
  onTeamSizeChange,
  teamCount,
  onTeamCountChange,
  onGenerate,
  onReshuffle,
  hasResults,
  error,
}: PlayerInputFormProps) {
  return (
    <section className="rounded-2xl border border-chalk/10 bg-pitch-800/60 p-5 md:p-6">
      <label htmlFor="player-list" className="font-display text-sm uppercase tracking-wide text-chalk">
        Player list
      </label>
      <p className="mt-1 text-xs text-muted">
        One player per line — name, then position (striker / mid / def / any).
        Numbers, dashes, colons, and commas all work as separators. List two
        positions with &quot;/&quot;, e.g. &quot;Larry - Def / Mid&quot;. See
        the <span className="text-chalk">?</span> above for the full guide.
      </p>
      <textarea
        id="player-list"
        value={rawInput}
        onChange={(e) => onRawInputChange(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={10}
        className="mt-3 w-full resize-y rounded-lg border border-chalk/15 bg-pitch-950/60 p-3 font-mono text-sm text-chalk placeholder:text-muted/50 focus:border-amber/60"
      />

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="team-size" className="font-display text-sm uppercase tracking-wide text-chalk">
            Players per team
          </label>
          <input
            id="team-size"
            type="number"
            min={1}
            value={teamSize}
            onChange={(e) => onTeamSizeChange(e.target.value)}
            placeholder="7"
            className="mt-2 w-full rounded-lg border border-chalk/15 bg-pitch-950/60 p-2.5 font-mono text-sm text-chalk placeholder:text-muted/50 focus:border-amber/60"
          />
        </div>
        <div>
          <label htmlFor="team-count" className="font-display text-sm uppercase tracking-wide text-chalk">
            Number of teams
          </label>
          <input
            id="team-count"
            type="number"
            min={1}
            value={teamCount}
            onChange={(e) => onTeamCountChange(e.target.value)}
            placeholder="auto"
            className="mt-2 w-full rounded-lg border border-chalk/15 bg-pitch-950/60 p-2.5 font-mono text-sm text-chalk placeholder:text-muted/50 focus:border-amber/60"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">
        Fill in either field, both, or neither — leave both blank for 7 a
        side by default.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-striker/40 bg-striker/10 px-3 py-2 text-sm text-striker">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-lg bg-amber px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-pitch-950 transition hover:brightness-110"
        >
          Generate teams
        </button>
        {hasResults && (
          <button
            type="button"
            onClick={onReshuffle}
            className="rounded-lg border border-chalk/20 px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-chalk transition hover:border-amber/50 hover:text-amber"
          >
            Reshuffle
          </button>
        )}
      </div>
    </section>
  );
}
