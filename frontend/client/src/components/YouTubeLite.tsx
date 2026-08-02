/**
 * YouTubeLite — a click-to-load ("lite") YouTube embed.
 *
 * Why not a plain <iframe>: dropping the real YouTube player on the homepage
 * pulls ~1.5MB of third-party JS and sets cookies before the visitor has asked
 * to watch anything, which hurts both Lighthouse scores and privacy posture.
 * This component renders a static poster image plus a play button, and only
 * mounts the actual iframe after a click. Nothing from youtube.com loads until
 * the visitor opts in.
 *
 * The poster falls back through YouTube's own thumbnail sizes if no local
 * `poster` is supplied, so it still works with only a video ID.
 */
import { useState, useCallback } from "react";
import { Play } from "lucide-react";

export interface YouTubeLiteProps {
  /** The 11-character YouTube video ID (not the full URL). */
  videoId: string;
  /** Accessible title, also used as the iframe title. */
  title: string;
  /** Optional local poster image. Falls back to YouTube's maxres thumbnail. */
  poster?: string;
  /** Optional start time in seconds. */
  start?: number;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

/** True when the ID still looks like an un-swapped placeholder. */
export function isPlaceholderId(id: string): boolean {
  return !/^[A-Za-z0-9_-]{11}$/.test(id) || /^0{6,}/.test(id);
}

export default function YouTubeLite({
  videoId,
  title,
  poster,
  start,
  className = "",
}: YouTubeLiteProps) {
  const [active, setActive] = useState(false);
  const placeholder = isPlaceholderId(videoId);

  const activate = useCallback(() => {
    if (!placeholder) setActive(true);
  }, [placeholder]);

  const posterSrc =
    poster ?? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (start) params.set("start", String(start));

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-navy ring-1 ring-white/10 shadow-2xl shadow-black/40 ${className}`}
      style={{ aspectRatio: "16 / 9" }}
    >
      {active ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={activate}
          aria-label={placeholder ? `${title} — video coming soon` : `Play: ${title}`}
          disabled={placeholder}
          className="group absolute inset-0 h-full w-full cursor-pointer disabled:cursor-default"
        >
          <img
            src={posterSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              // maxresdefault does not exist for every video; step down once.
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = "1";
                img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              }
            }}
          />
          <span className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />

          {/* Play affordance */}
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-navy shadow-xl shadow-black/40 transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110 sm:h-20 sm:w-20">
            <Play className="ml-0.5 h-7 w-7 fill-current sm:h-9 sm:w-9" />
          </span>

          {placeholder && (
            <span className="absolute inset-x-0 bottom-0 bg-navy/85 px-4 py-2.5 text-center font-body text-xs font-semibold uppercase tracking-[0.15em] text-gold backdrop-blur-sm">
              Video coming soon
            </span>
          )}
        </button>
      )}
    </div>
  );
}
