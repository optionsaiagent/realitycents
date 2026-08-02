/**
 * FeaturedVideo — homepage section promoting the First-Lien HELOC deep dive.
 *
 * Layout: on large screens the player sits in a 3-column span beside a
 * 2-column rail carrying the headline stats and chapter jump links. On mobile
 * everything stacks with the player first, since that is what the visitor came
 * for. Uses YouTubeLite so nothing loads from YouTube until the visitor clicks.
 *
 * Editorial framing follows the site's education-first rule: the copy explains
 * what the video teaches and links to the free calculator. No "call now",
 * no "hire me".
 */
import { Link } from "wouter";
import { ArrowRight, PlayCircle, Clock } from "lucide-react";
import YouTubeLite, { isPlaceholderId } from "@/components/YouTubeLite";
import { FEATURED_VIDEO, formatChapterTime } from "@/lib/featuredVideo";

export default function FeaturedVideo() {
  const v = FEATURED_VIDEO;
  const live = !isPlaceholderId(v.youtubeId);
  const watchUrl = `https://www.youtube.com/watch?v=${v.youtubeId}`;

  return (
    <section className="relative overflow-hidden bg-navy py-20 lg:py-28 border-t border-white/5">
      {/* Gold accent line, matching the book banner treatment */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      {/* Soft teal glow behind the player */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-teal/10 blur-3xl"
      />

      <div className="container relative z-10">
        {/* Section label */}
        <div className="mb-10 max-w-3xl">
          <span className="mb-3 inline-flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <PlayCircle className="h-4 w-4" />
            Featured Video
          </span>
          <h2 className="mb-4 font-display text-3xl leading-tight text-white md:text-4xl lg:text-5xl">
            {v.shortTitle}
          </h2>
          <p className="leading-relaxed text-sand/70">{v.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
          {/* Player */}
          <div className="lg:col-span-3">
            <YouTubeLite
              videoId={v.youtubeId}
              title={v.title}
              poster={v.poster}
            />

            {/* Runtime + watch-on-YouTube */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 font-body text-sm text-sand/60">
                <Clock className="h-4 w-4" />
                {v.runtime} &middot; Educational deep dive
              </span>
              {live && (
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-teal-light transition-all hover:gap-2.5"
                >
                  Watch on YouTube <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Rail: stats + chapters */}
          <div className="lg:col-span-2">
            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-white/10">
              {v.stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg bg-white/5 p-4 text-center lg:rounded-none lg:bg-transparent lg:p-0 lg:py-4 lg:text-left"
                >
                  <div className="font-display text-xl text-gold lg:text-2xl">
                    {s.value}
                  </div>
                  <div className="mt-1 font-body text-xs leading-snug text-sand/60 lg:text-sm">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Chapters */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <h3 className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.15em] text-teal-light">
                Jump to a Chapter
              </h3>
              <ul className="space-y-1">
                {v.chapters.map((c) => {
                  const label = (
                    <>
                      <span className="w-11 shrink-0 font-mono text-xs text-gold/80">
                        {formatChapterTime(c.at)}
                      </span>
                      <span className="leading-snug">{c.label}</span>
                    </>
                  );
                  return (
                    <li key={c.at}>
                      {live ? (
                        <a
                          href={`${watchUrl}&t=${c.at}s`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 rounded-md px-2 py-1.5 font-body text-sm text-sand/80 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {label}
                        </a>
                      ) : (
                        <span className="flex items-start gap-2 px-2 py-1.5 font-body text-sm text-sand/60">
                          {label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Calculator link — the educational next step */}
            <Link
              href={v.calculatorHref}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal px-6 py-3.5 font-body text-sm font-semibold text-white transition-all hover:bg-teal-dark hover:shadow-lg hover:shadow-teal/25"
            >
              Run Your Own Numbers
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center font-body text-xs leading-relaxed text-sand/50">
              Educational content only — not a commitment to lend. A first-lien
              HELOC carries a variable rate that can rise as well as fall.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
