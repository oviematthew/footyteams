"use client";

import { useState } from "react";
import type { Team } from "@/lib/types";
import { encodeTeamsForUrl, formatTeamsAsText } from "@/lib/shareTeams";
import TeamCard from "./TeamCard";

interface TeamResultsProps {
  teams: Team[];
}

type CopyState = "idle" | "copied" | "failed";

function useCopyFeedback() {
  const [state, setState] = useState<CopyState>("idle");

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1800);
  };

  return { state, copy };
}

export default function TeamResults({ teams }: TeamResultsProps) {
  const listCopy = useCopyFeedback();
  const linkCopy = useCopyFeedback();

  if (teams.length === 0) {
    return (
      <section className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-chalk/15 p-8 text-center">
        <p className="font-display text-lg uppercase tracking-wide text-chalk">
          No teams yet
        </p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Paste your player list on the left and hit Generate teams — your
          lineup shows up here.
        </p>
      </section>
    );
  }

  const labelFor = (state: CopyState, idle: string) =>
    state === "copied" ? "Copied!" : state === "failed" ? "Couldn't copy" : idle;

  return (
    <section>
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => listCopy.copy(formatTeamsAsText(teams))}
          className="rounded-lg border border-chalk/20 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-chalk transition hover:border-amber/50 hover:text-amber"
        >
          {labelFor(listCopy.state, "Copy list")}
        </button>
        <button
          type="button"
          onClick={() => {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            linkCopy.copy(`${origin}/view/${encodeTeamsForUrl(teams)}`);
          }}
          className="rounded-lg border border-chalk/20 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-chalk transition hover:border-amber/50 hover:text-amber"
        >
          {labelFor(linkCopy.state, "Copy shareable link")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {teams.map((team, i) => (
          <TeamCard key={i} team={team} index={i} />
        ))}
      </div>
    </section>
  );
}
