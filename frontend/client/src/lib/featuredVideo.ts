/**
 * Featured video configuration.
 *
 * TO GO LIVE: replace `youtubeId` below with the real 11-character YouTube
 * video ID (the part after `watch?v=`), then commit. Nothing else needs to
 * change — the homepage section, the poster image, and the chapter links all
 * read from this file.
 *
 * While `youtubeId` is still the placeholder, the player renders the local
 * poster with a "Video coming soon" ribbon and the play button is disabled, so
 * the section is safe to ship before the upload happens.
 */

export interface VideoChapter {
  /** Start time in seconds. */
  at: number;
  /** Chapter label as shown on the page. */
  label: string;
}

export const FEATURED_VIDEO = {
  /** ⬇⬇⬇  REPLACE THIS with the real YouTube video ID  ⬇⬇⬇ */
  youtubeId: "vuYeyF_63fE",

  title:
    "Your Mortgage Rate Is Not What You Pay — The All-In-One Loan, Explained",
  shortTitle: "The All-In-One Loan, Explained",
  runtime: "8:25",

  /** Poster used until the video is live (and as a social preview image). Served from /public. */
  poster: "/aio-explainer-poster.png",

  description:
    "A complete walkthrough of how the All-In-One loan — a first-lien HELOC — actually works, following one sample scenario from the lender's Interactive Comparison Simulator: a $1,000,000 home, 20% down, $800,000 financed. The benefits and the risks, stated plainly. No extra payments, no tighter budget.",

  /** Headline figures pulled from the simulation shown in the video (simulator key Cw5-Yvj-3f5). */
  stats: [
    { value: "12.4 yrs", label: "Payoff instead of 30" },
    { value: "$630,769", label: "Total interest saved" },
    { value: "2.841%", label: "Effective rate on a 6.869% loan" },
  ],

  /** Chapters mirror the video's scene timeline (v2.2, 8:25). */
  chapters: [
    { at: 0, label: "Your rate is not what you pay" },
    { at: 43, label: "The 30-year fixed, dissected" },
    { at: 108, label: "What the All-In-One actually is" },
    { at: 134, label: "Day one: your paycheck drops the balance" },
    { at: 201, label: "The engine: year-one interest vs. the average" },
    { at: 254, label: "The rate, reframed: 6.869% sticker, ≈2.8% effective" },
    { at: 296, label: "25 years of the index (SOFR)" },
    { at: 340, label: "The race: $630,769 kept, paid off in 12.4 years" },
    { at: 378, label: "Equity you can reach — access for all 30 years" },
    { at: 408, label: "The risks, stated plainly" },
    { at: 441, label: "Who it's for — and when to model it anyway" },
  ] as VideoChapter[],

  /** Where the "run your own numbers" link points. */
  calculatorHref: "/heloc-sweep-calculator",
} as const;

/** Formats a chapter offset as m:ss for display. */
export function formatChapterTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
