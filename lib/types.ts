export type PositionBucket = "striker" | "mid" | "def" | "any";

export interface Player {
  name: string;
  /** The position text as typed, shown verbatim in the output — e.g. "Striker", "def", "Def / Mid". */
  position: string;
  /**
   * Canonical bucket(s) resolved from `position`, used for balancing logic.
   * Length 1 for a single recognized position, 2+ for a flex/dual-position
   * player, or `["any"]` when nothing was recognized.
   */
  buckets: PositionBucket[];
}

export interface AssignedPlayer extends Player {
  /** The bucket actually used for this match — picked from `buckets` during balancing. */
  assignedBucket: PositionBucket;
}

export interface Team {
  players: AssignedPlayer[];
  /** True when this team ended up with more players than the smallest team, due to an uneven total. */
  hasExtra: boolean;
}

export interface BalanceOptions {
  teamSize?: number;
  teamCount?: number;
}
