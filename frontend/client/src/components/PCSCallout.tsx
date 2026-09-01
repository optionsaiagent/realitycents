/*
 * PCSCallout — cross-link banner to pcsingtohawaii.com, Jay's companion
 * move-guide site for military families. Shown on military-facing pages.
 */

const GUIDE_BASE = "https://www.pcsingtohawaii.com";

/** Maps a RealityCents VA base-page slug to its PCS guide page. */
const BASE_GUIDE: Record<string, { href: string; label: string }> = {
  "va-loan-schofield-barracks": { href: "/schofield-barracks", label: "the Schofield Barracks PCS guide" },
  "va-loan-pearl-harbor-hickam": { href: "/pearl-harbor-hickam", label: "the Pearl Harbor–Hickam PCS guide" },
  "va-loan-kaneohe-mcbh": { href: "/kaneohe-mcbh", label: "the MCBH Kaneohe Bay PCS guide" },
  "va-loan-fort-shafter": { href: "/fort-shafter-tripler", label: "the Fort Shafter & Tripler PCS guide" },
  "va-loan-tripler": { href: "/fort-shafter-tripler", label: "the Fort Shafter & Tripler PCS guide" },
};

export default function PCSCallout({ baseSlug }: { baseSlug?: string }) {
  const guide = baseSlug ? BASE_GUIDE[baseSlug] : undefined;
  const href = guide ? `${GUIDE_BASE}${guide.href}` : GUIDE_BASE;
  return (
    <section className="py-6 bg-sand">
      <div className="container max-w-4xl">
        <div className="rounded-xl border border-teal/25 bg-teal/5 px-6 py-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-sm font-body text-navy m-0">
            <span className="font-semibold">Just got orders to Hawaii?</span>{" "}
            The move itself — pets, the car, schools, neighborhoods — lives at{" "}
            <a
              href={href}
              target="_blank"
              rel="noopener"
              className="font-semibold text-teal underline underline-offset-2 hover:text-navy"
            >
              {guide ? guide.label : "PCSingToHawaii.com"}
            </a>
            {guide ? " on PCSingToHawaii.com, our companion guide for military families." : " — our companion move guide for military families."}
          </p>
        </div>
      </div>
    </section>
  );
}
