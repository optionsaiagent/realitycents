# AI Visibility — Delivery Package (Sep 14, 2026)

Per §9 of the handoff: live URL · target queries · answer-first opening · schema · internal links · last-updated. All pages are prerendered to static HTML (answers are in the served markup, not client-only JS), carry the byline block (Jay Miller · NMLS #657301 · Branch NMLS #2475890 · CMG Home Loans, Honolulu · U.S. Army veteran · author of *Zero Down in Paradise*), the compliance footer (Equal Housing Lender · educational only · not a commitment to lend · approvals not guaranteed · $0-down requires eligibility + lender approval · NMLS Consumer Access link), and a visible "Last Updated: September 14, 2026".

## P0-A · Pillar (upgraded in place — URL unchanged, already the 301 target for old Veterans Guide paths)

**URL:** https://realitycents.com/knowledge-base/va-loans-hawaii-military
**Target queries:** VA loans Hawaii · Hawaii VA loan · Hawaii VA loan zero down
**Opens:** "Yes — eligible veterans and active-duty service members can buy a home in Hawaii with $0 down using a VA loan. With full entitlement there is no VA loan limit, so you can purchase at any price a lender approves with no down payment and no PMI." Then question-H2 sections: $0 down · PMI · 2026 funding fee table · county limits (all four counties) · BAH · condos · leasehold · VA vs conventional · steps · PCS timeline · base guides · 6-question FAQ.
**Schema:** Article + Person (author) + FAQPage (5 Q&As, new) + BreadcrumbList.
**Links:** hub, VA eligibility calculator, military calculator, condo directory, all 7 new answer pages, all 5 base guides, PCSingToHawaii, About.
**Read time:** ~12 min (was 7). Word count ~2,300 (was ~800).

## P0-B · Pearl Harbor-Hickam (and all five base pages)

**URL:** https://realitycents.com/va-loan-pearl-harbor-hickam
**Finding:** the page was already at Schofield parity structurally (same BAH table, scenarios, neighborhoods, FAQ, LocalBusiness + FAQPage schema). What was wrong on **every** base page: two internal links pointed at slugs that do not exist (`/knowledge-base/multiple-va-loans-hawaii`, `/knowledge-base/va-funding-fee-guide`) — on this site those 404, i.e. crawl dead-ends. Fixed to the real pages (second-tier entitlement; the new funding-fee page). Also: added the PCSingToHawaii callout (PCS timeline/housing), a visible "Last updated September 14, 2026" line with the next-FHFA-update note, and removed the "honest answer / one honest note" phrasing per Jay's standing rule.
**Schema:** LocalBusiness (MortgageLender) + FAQPage + BreadcrumbList (unchanged).

## P1 · New answer pages (all category "VA Loans", all with FAQPage schema)

| Page | URL | Target queries | Opens with |
|---|---|---|---|
| D · Loan limits | https://realitycents.com/knowledge-base/va-loan-limits-hawaii-2026 | VA loan limits Hawaii 2026 · Honolulu County loan limit | "If you have full VA entitlement, there is no VA loan limit in Hawaii in 2026… Honolulu County… $1,249,125." Table of all four 2026 county limits + worked reduced-entitlement example. |
| E · BAH | https://realitycents.com/knowledge-base/does-bah-count-va-loan-hawaii | does BAH count for VA loan Hawaii · BAH gross up VA | "Yes. Basic Allowance for Housing counts as qualifying income… most VA lenders gross it up (commonly by up to 25%)…" Income-line table + 2026 Honolulu BAH by rank. |
| F · Funding fee | https://realitycents.com/knowledge-base/va-funding-fee-hawaii | VA funding fee Hawaii · VA funding fee 2026 | "…2.15%… first-use purchase with less than 5% down, 3.3% for subsequent use… waived entirely for veterans receiving VA disability compensation." Full tier table + Oahu dollar table + fee-vs-PMI. |
| G · VA vs conventional | https://realitycents.com/knowledge-base/va-vs-conventional-loan-hawaii | VA vs conventional loan Hawaii | "For most VA-eligible buyers purchasing a primary home in Hawaii, the VA loan is the better structure…" 12-row comparison table + $850K example + when-each-wins. |
| H · Condo approval vs warrantability | https://realitycents.com/knowledge-base/va-condo-approval-vs-warrantability-hawaii | Hawaii condo warrantability VA · VA approved condo vs warrantable | "VA condo approval and conventional 'warrantability' are two different reviews by two different bodies…" Lookup tool linked in the first paragraph. |
| I · IRRRL | https://realitycents.com/knowledge-base/va-irrrl-refinance-hawaii | IRRRL refinance Hawaii · VA streamline refinance Hawaii | "The VA Interest Rate Reduction Refinance Loan (IRRRL) is the VA's streamline refinance…" Requirements table (210 days/6 payments, 0.5%/2% NTB, 36-month recoupment, 0.5% fee) + PCS angle. |
| J · Choose a lender | https://realitycents.com/knowledge-base/how-to-choose-hawaii-va-lender | best VA loan lender Hawaii · VA lender Oahu | "The VA guarantees loans; it does not rank or endorse lenders…" Six questions to ask, red flags, entity block with NMLS Consumer Access link. No "#1" claims. |

**I (assumable):** existing article kept at its URL; added an answer-first opening paragraph + byline and a 3-Q FAQPage schema.
**K (PCS advice):** folded into the pillar as a "Buying from a PCS" section linking PCSingToHawaii and both calculators, rather than a thin standalone page.

## P2 · Maintenance done

- **Hub** (/zero-down-in-paradise): new "Hawaii VA questions, answered one page at a time" section linking the pillar + all 7 pages (reciprocal hub ↔ pillar ↔ tools links now complete); ASIN B0H7P83W15 confirmed on the hub and in llms.txt.
- **llms.txt:** added all 7 answer pages, all 5 base guides, assumable + second-tier entitlement, ASIN; hub last-updated bumped.
- **robots.txt:** already allowed GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, CCBot — no change needed.
- **Canonical URLs:** old Veterans Guide paths already 301 to the pillar (vercel.json) — no change needed.
- **Sitemap:** regenerated at build; new URLs included automatically. Submit in GSC when convenient.

## Not done / needs Jay (see questions in chat)

- Third-party mentions / Amazon metadata / LinkedIn consistency (§7) — off-site, Jay's side.
- Residual-income table figures deliberately not printed (regional table values vary by loan size and family size; page says "VA residual income test" and points to the lender).
- No rate quotes anywhere on the new pages; the one payment illustration (IRRRL recoupment) is arithmetic on an assumed 1-point drop, labeled as an example.
