"use client";

import { useEffect, useRef, useState } from "react";
import { POSITION_ALIASES } from "@/lib/parsePlayers";

export default function HelpTooltip() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block align-middle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="How to post a player list"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-chalk/30 font-mono text-sm font-semibold leading-none text-muted transition hover:border-amber/60 hover:text-amber"
      >
        ?
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute right-0 top-full z-10 mt-2 w-72 rounded-xl border border-chalk/15 bg-pitch-800 p-4 text-left shadow-xl"
        >
          <p className="font-display text-xs uppercase tracking-wide text-chalk">
            How to post a list
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            <li>Number each line: "1. Name - Position".</li>
            <li>"-", ":", or "," all work between name and position.</li>
            <li>List two positions with "/" — e.g. "Larry - Def / Mid".</li>
            <li>
              Add an optional rating (1-5) after the position — e.g. "Habeeb
              - Striker - 5" — so teams are balanced by skill, not just
              headcount. Left out, it defaults to 3.
            </li>
            <li>Anything before the first numbered line (e.g. a header) is ignored.</li>
          </ul>
          <p className="mt-3 font-display text-xs uppercase tracking-wide text-chalk">
            Accepted positions
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            {(Object.entries(POSITION_ALIASES) as [string, string[]][]).map(([bucket, aliases]) => (
              <li key={bucket}>
                <span className="text-chalk">{aliases[0]}:</span> {aliases.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
