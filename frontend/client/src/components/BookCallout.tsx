/*
 * Pacific Modernism — Book Callout
 * "Want the full playbook?" contextual banner shown at the bottom of
 * VA-loan and military-related knowledge base articles.
 * Educational resource recommendation — not a hard sell.
 */
import { Link } from "wouter";
import { ArrowRight, BookOpen } from "lucide-react";
import { BOOK } from "@/lib/book";

export default function BookCallout() {
  return (
    <div className="mt-10 mb-2 rounded-xl overflow-hidden bg-navy border border-gold/20">
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 lg:p-8">
        {/* Cover */}
        <a
          href={BOOK.amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
          aria-label={`${BOOK.fullTitle} on Amazon`}
        >
          <img
            src={BOOK.cover}
            alt={`${BOOK.fullTitle} — book cover`}
            className="w-28 sm:w-32 rounded-md shadow-lg shadow-black/40 hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </a>

        {/* Copy */}
        <div className="text-center sm:text-left min-w-0">
          <p className="inline-flex items-center gap-1.5 text-xs font-body font-semibold uppercase tracking-[0.15em] text-gold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            The Hawaii VA Playbook
          </p>
          <h4 className="font-display text-white text-lg lg:text-xl leading-snug mb-2">
            Read the full playbook — <em>{BOOK.title}</em>
          </h4>
          <p className="text-sm text-sand/70 leading-relaxed mb-4">
            This article covers the essentials — the book goes deeper. Jay's complete guide to buying a home in
            Hawaii with your VA benefit: entitlement, condo approvals, leasehold vs. fee simple, and every
            zero-down strategy that works in the islands. {BOOK.pages} pages, published {BOOK.published}.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={BOOK.pageUrl}
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy px-5 py-2.5 rounded-md font-body font-semibold text-sm transition-all hover:shadow-lg hover:shadow-gold/30"
            >
              Read the full playbook <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={BOOK.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-body font-semibold text-teal-light hover:text-white transition-colors"
            >
              Get it on Amazon <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
