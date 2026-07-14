import type { PositionBucket } from "./types";

export const bucketChipClass: Record<PositionBucket, string> = {
  striker: "bg-striker/15 text-striker border-striker/40",
  mid: "bg-mid/15 text-mid border-mid/40",
  def: "bg-def/15 text-def border-def/40",
  any: "bg-anyPos/15 text-anyPos border-anyPos/40",
};

/** Short display label for a resolved bucket — used for chips and exported text. */
export const bucketLabel: Record<PositionBucket, string> = {
  striker: "Striker",
  mid: "Mid",
  def: "Def",
  any: "Any",
};
