/**
 * Single source of truth for the deployed URL. Set NEXT_PUBLIC_SITE_URL in
 * the environment (e.g. Vercel project settings) once a real domain exists —
 * everything else (metadata, sitemap, robots.txt, OG images, exported-image
 * watermark) reads from here, so there's nothing else to change.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://footy-teams.vercel.app").replace(
  /\/+$/,
  ""
);

export const SITE_NAME = "Footy Teams";
export const SITE_DESCRIPTION =
  "Paste your player list, set a team size or count, and get randomized, position-balanced 5-a-side/7-a-side teams in seconds — no more burning kickoff time picking sides.";

/** Hostname only, no protocol — used for the watermark on exported team images. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
