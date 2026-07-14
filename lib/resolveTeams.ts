export interface ResolvedTeams {
  teamSize: number;
  teamCount: number;
}

const DEFAULT_TEAM_SIZE = 7;

/**
 * Precedence (matches PROJECT_PLAN.md Section 7.3):
 *  1. Both given -> use both directly.
 *  2. Only teamCount given -> derive teamSize from it.
 *  3. Only teamSize given -> derive teamCount from it.
 *  4. Neither given -> default teamSize 7, derive teamCount.
 */
export function resolveTeams(
  totalPlayers: number,
  teamSizeInput?: number,
  teamCountInput?: number
): ResolvedTeams {
  if (teamSizeInput && teamCountInput) {
    return { teamSize: teamSizeInput, teamCount: teamCountInput };
  }
  if (teamCountInput) {
    return {
      teamSize: Math.ceil(totalPlayers / teamCountInput),
      teamCount: teamCountInput,
    };
  }
  const teamSize = teamSizeInput ?? DEFAULT_TEAM_SIZE;
  return {
    teamSize,
    teamCount: Math.max(1, Math.ceil(totalPlayers / teamSize)),
  };
}
