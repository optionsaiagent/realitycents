/**
 * ArticleVideo — an in-article YouTube player with chapter jump links.
 * Clicking a chapter remounts the player at that start time, so it plays
 * in place instead of sending the reader off to YouTube.
 */
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import YouTubeLite from "@/components/YouTubeLite";
import { formatChapterTime, type VideoChapter } from "@/lib/featuredVideo";

export interface ArticleVideoConfig {
  youtubeId: string;
  title: string;
  chapters: VideoChapter[];
}

export default function ArticleVideo({ youtubeId, title, chapters }: ArticleVideoConfig) {
  const [start, setStart] = useState<number | null>(null);
  const [plays, setPlays] = useState(0);
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  return (
    <div className="mb-8">
      <YouTubeLite
        key={plays}
        videoId={youtubeId}
        title={title}
        start={start ?? undefined}
        initiallyActive={start !== null}
      />

      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-teal">
            Jump to a chapter
          </h2>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-teal transition-all hover:gap-2.5"
          >
            Watch on YouTube <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {chapters.map((c) => (
            <li key={c.at}>
              <button
                type="button"
                onClick={() => {
                  setStart(c.at);
                  setPlays((n) => n + 1);
                }}
                aria-label={`Play from ${formatChapterTime(c.at)}: ${c.label}`}
                className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left font-body text-sm text-navy transition-colors hover:bg-teal/10"
              >
                <span className="w-11 shrink-0 font-mono text-xs leading-5 text-gold">
                  {formatChapterTime(c.at)}
                </span>
                <span className="leading-snug">{c.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
