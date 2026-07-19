import type { Team } from "@/lib/types";
import { bucketChipClass, bucketLabel } from "@/lib/positionStyles";

interface TeamCardProps {
  team: Team;
  index: number;
}

export default function TeamCard({ team, index }: TeamCardProps) {
  const label = String(index + 1).padStart(2, "0");

  return (
    <div className="ticket-edge overflow-hidden rounded-2xl border border-chalk/10 bg-pitch-800 pt-4">
      <div className="flex items-center justify-between px-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Team</p>
          <p className="font-display text-3xl font-semibold text-chalk">{label}</p>
        </div>
        {team.hasExtra && (
          <span className="rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-amber">
            +1 extra
          </span>
        )}
      </div>

      <div className="my-4 border-t border-dashed border-chalk/15" />

      <ul className="space-y-2 px-5 pb-5">
        {team.players.map((player, i) => {
          const isFlex = player.buckets.length > 1;
          return (
            <li
              key={`${player.name}-${i}`}
              className="flex items-center justify-between gap-3 border-b border-chalk/5 pb-2 last:border-b-0 last:pb-0"
            >
              <span className="text-sm text-chalk">
                {player.name}
                {isFlex && (
                  <span className="ml-1.5 text-[11px] text-muted">({player.position})</span>
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  title={`Rating ${player.rating}/5`}
                  className="font-mono text-[11px] tracking-wide text-amber"
                >
                  {"★".repeat(player.rating)}
                  <span className="text-chalk/20">{"★".repeat(5 - player.rating)}</span>
                </span>
                <span
                  title={isFlex ? player.position : undefined}
                  className={`rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${bucketChipClass[player.assignedBucket]}`}
                >
                  {bucketLabel[player.assignedBucket]}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
