"use client";

import { useState } from "react";
import type { Player, Team } from "@/lib/types";
import { parsePlayers } from "@/lib/parsePlayers";
import { balanceTeams } from "@/lib/balanceTeams";
import { resolveTeams } from "@/lib/resolveTeams";
import PlayerInputForm from "./PlayerInputForm";
import TeamResults from "./TeamResults";

export default function TeamOrganizer() {
  const [rawInput, setRawInput] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [teamCount, setTeamCount] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [lastPlayers, setLastPlayers] = useState<Player[]>([]);
  const [lastResolved, setLastResolved] = useState<{ teamSize: number; teamCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBalance = (players: Player[], resolved: { teamSize: number; teamCount: number }) => {
    setTeams(balanceTeams(players, resolved.teamCount, resolved.teamSize));
  };

  const handleGenerate = () => {
    const players = parsePlayers(rawInput);

    if (players.length === 0) {
      setError("No players found — add at least one line like \"Habeeb - Striker\".");
      setTeams([]);
      return;
    }

    const teamSizeNum = teamSize ? Number(teamSize) : undefined;
    const teamCountNum = teamCount ? Number(teamCount) : undefined;

    if ((teamSizeNum !== undefined && teamSizeNum < 1) || (teamCountNum !== undefined && teamCountNum < 1)) {
      setError("Team size and team count need to be at least 1.");
      return;
    }

    const resolved = resolveTeams(players.length, teamSizeNum, teamCountNum);

    setError(null);
    setLastPlayers(players);
    setLastResolved(resolved);
    runBalance(players, resolved);
  };

  const handleReshuffle = () => {
    if (lastPlayers.length === 0 || !lastResolved) return;
    runBalance(lastPlayers, lastResolved);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
      <PlayerInputForm
        rawInput={rawInput}
        onRawInputChange={setRawInput}
        teamSize={teamSize}
        onTeamSizeChange={setTeamSize}
        teamCount={teamCount}
        onTeamCountChange={setTeamCount}
        onGenerate={handleGenerate}
        onReshuffle={handleReshuffle}
        hasResults={teams.length > 0}
        error={error}
      />
      <TeamResults teams={teams} />
    </div>
  );
}
