"use client";

import { useRef, useState } from "react";
import type { Team } from "@/lib/types";
import { encodeTeamsForUrl, formatTeamsAsText } from "@/lib/shareTeams";
import { SITE_HOST } from "@/lib/siteConfig";
import TeamCard from "./TeamCard";

interface TeamResultsProps {
  teams: Team[];
}

type ActionState = "idle" | "busy" | "done" | "failed";

function useAction<Args extends unknown[]>(run: (...args: Args) => Promise<void>) {
  const [state, setState] = useState<ActionState>("idle");

  const trigger = async (...args: Args) => {
    setState("busy");
    try {
      await run(...args);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1800);
  };

  return { state, trigger };
}

function labelFor(state: ActionState, idle: string, busy: string, done = "Copied!") {
  if (state === "busy") return busy;
  if (state === "done") return done;
  if (state === "failed") return "Couldn't do that";
  return idle;
}

export default function TeamResults({ teams }: TeamResultsProps) {
  const captureRef = useRef<HTMLDivElement>(null);

  const listCopy = useAction(async () => {
    await navigator.clipboard.writeText(formatTeamsAsText(teams));
  });

  const linkCopy = useAction(async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    await navigator.clipboard.writeText(`${origin}/view/${encodeTeamsForUrl(teams)}`);
  });

  const imageExport = useAction(async () => {
    if (!captureRef.current) throw new Error("Nothing to export");
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(captureRef.current, {
      backgroundColor: "#14493A",
      pixelRatio: 2,
    });
    const link = document.createElement("a");
    link.download = "footy-teams-lineup.png";
    link.href = dataUrl;
    link.click();
  });

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

  return (
    <section>
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => listCopy.trigger()}
          className="rounded-lg border border-chalk/20 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-chalk transition hover:border-amber/50 hover:text-amber"
        >
          {labelFor(listCopy.state, "Copy list", "Copying…")}
        </button>
        <button
          type="button"
          onClick={() => linkCopy.trigger()}
          className="rounded-lg border border-chalk/20 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-chalk transition hover:border-amber/50 hover:text-amber"
        >
          {labelFor(linkCopy.state, "Copy shareable link", "Copying…")}
        </button>
        <button
          type="button"
          onClick={() => imageExport.trigger()}
          className="rounded-lg border border-chalk/20 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-chalk transition hover:border-amber/50 hover:text-amber"
        >
          {labelFor(imageExport.state, "Export as image", "Exporting…", "Downloaded!")}
        </button>
      </div>

      <div ref={captureRef} className="rounded-2xl bg-pitch-800 p-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {teams.map((team, i) => (
            <TeamCard key={i} team={team} index={i} />
          ))}
        </div>
        <p className="mt-5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Made with {SITE_HOST}
        </p>
      </div>
    </section>
  );
}
