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
  youtubeId: "REPLACE_ME",

  title:
    "First-Lien HELOC Explained: How an $800,000 Loan Gets Paid Off in 14 Years",
  shortTitle: "The First-Lien HELOC Deep Dive",
  runtime: "9:00",

  /** Poster used until the video is live (and as a social preview image). */
  poster:
    "https://files.manuscdn.com/user_upload_by_module/session_file/310519663400630719/WsrBFSfGiERxrFoj.png",

  description:
    "A complete walkthrough of how a first-lien HELOC — also called an All-In-One or AIO mortgage — actually works, using real figures from a lender simulation on an $800,000 loan. Both scenarios spend the same money each month. No extra payments.",

  /** Headline figures pulled from the simulation shown in the video. */
  stats: [
    { value: "14 yrs", label: "Payoff instead of 30" },
    { value: "$527,401", label: "Total interest saved" },
    { value: "3.202%", label: "Effective rate on a 6.881% loan" },
  ],

  /** Chapters mirror the video's scene timeline. */
  chapters: [
    { at: 14, label: "What a first-lien HELOC actually is" },
    { at: 67, label: "How the sweep works" },
    { at: 117, label: "You choose your margin (2.50%–4.00%)" },
    { at: 162, label: "Month one, head to head" },
    { at: 276, label: "The gap accelerates" },
    { at: 332, label: "Why a higher rate costs less" },
    { at: 411, label: "The rate moves, you don't refinance" },
    { at: 455, label: "What happens after year 10" },
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
