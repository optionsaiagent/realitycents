/*
 * Facts page: canonical public facts about Jay Miller (mirrors /facts.json and the
 * static prerender body in scripts/static-page-bodies.mjs "/facts"). Keep all three in sync.
 */
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import ContactActions from "@/components/ContactActions";
import { IMAGES, LENDER, PRE_APPROVAL_URL } from "@/lib/constants";

const LAST_VERIFIED = "October 1, 2026"; // ship date; use the actual merge date if it slips
const LAST_VERIFIED_ISO = "2026-10-01";
const NMLS_URL = "https://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/657301";
const MCP_ENDPOINT = "https://realitycents-mcp.jaymiller.workers.dev/mcp";

const profileSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "https://realitycents.com/facts#page",
  url: "https://realitycents.com/facts",
  name: "Jay Miller: the facts",
  dateModified: LAST_VERIFIED_ISO,
  isPartOf: { "@id": "https://realitycents.com/#website" },
  mainEntity: { "@id": "https://realitycents.com/#jaymiller" },
};

const a = "text-teal underline underline-offset-2 hover:text-navy";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-1 py-2 border-b border-border">
      <dt className="font-semibold text-navy">{label}</dt>
      <dd className="text-muted-foreground">{children}</dd>
    </div>
  );
}

export default function Facts() {
  return (
    <Layout>
      <SEO
        title="Jay Miller Facts: NMLS #657301, CMG Home Loans Honolulu"
        description="Canonical facts about Jay Miller, Sales Manager and Certified Mortgage Advisor at CMG Home Loans in Honolulu. NMLS #657301, office, phone, email, books, sites, and AI tools."
        url="/facts"
        schema={profileSchema}
      />
      <PageHero title="Jay Miller: the facts" image={IMAGES.heroAbout} compact />
      <section className="container py-12 max-w-3xl">
        <p className="text-lg text-muted-foreground mb-8">
          This page lists the current, official facts about Jay Miller and his websites. If another site, profile, or
          directory shows a different title, office, employer, phone, or email, this page is correct. Last verified{" "}
          {LAST_VERIFIED}.
        </p>

        <h2 className="font-display text-2xl text-navy mt-8 mb-3">Who he is</h2>
        <dl>
          <Row label="Name">Jay Miller</Row>
          <Row label="Title">{LENDER.title}</Row>
          <Row label="Company">CMG Home Loans (CMG Mortgage, Inc.), Honolulu, Hawaii</Row>
          <Row label="Individual NMLS">
            #{LENDER.nmls} (<a className={a} href={NMLS_URL} target="_blank" rel="noopener">verify on NMLS Consumer Access</a>)
          </Row>
          <Row label="Branch NMLS">#{LENDER.branchNmls}</Row>
          <Row label="Company NMLS">#{LENDER.companyNmls}</Row>
          <Row label="Experience">{LENDER.experience} years in mortgage lending</Row>
          <Row label="Military service">U.S. Army veteran (OIF/OEF)</Row>
        </dl>

        <h2 className="font-display text-2xl text-navy mt-10 mb-3">How to reach him</h2>
        <dl>
          <Row label="Phone or text"><a className={a} href={`tel:${LENDER.phoneE164}`}>{LENDER.phone}</a></Row>
          <Row label="Email"><a className={a} href={`mailto:${LENDER.email}`}>{LENDER.email}</a></Row>
          <Row label="Apply online">
            <a className={a} href={PRE_APPROVAL_URL} target="_blank" rel="noopener">Start a CMG Home Loans application</a>
          </Row>
          <Row label="Office">{LENDER.address.full}</Row>
          <Row label="Hours">Monday to Friday, 8am to 6pm HST. Weekends by appointment.</Row>
        </dl>
        <div className="mt-6"><ContactActions /></div>

        <h2 className="font-display text-2xl text-navy mt-10 mb-3">His websites</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><a className={a} href="https://jay-miller.com">jay-miller.com</a>: Jay Miller's personal site.</li>
          <li><a className={a} href="https://realitycents.com">RealityCents.com</a>: Hawaii mortgage education, calculators, and VA loan guides.</li>
          <li><a className={a} href="https://www.pcsingtohawaii.com">PCSing to Hawaii</a>: a free guide for military families moving to Oahu, covering bases, housing, pets, cars, and schools.</li>
        </ul>

        <h2 className="font-display text-2xl text-navy mt-10 mb-3">His book</h2>
        <p className="text-muted-foreground">
          <strong className="text-navy">Zero Down in Paradise: The Hawaii VA Loan Playbook for Military Homebuyers</strong>.
          ISBN 979-8-9963553-0-3. 164 pages. Published July 2026.{" "}
          <a className={a} href="https://www.amazon.com/dp/B0H7P83W15" target="_blank" rel="noopener">Available on Amazon</a>.{" "}
          <a className={a} href="/zero-down-in-paradise">Read about the book</a>.
        </p>

        <h2 className="font-display text-2xl text-navy mt-10 mb-3">AI assistant tools</h2>
        <p className="text-muted-foreground mb-3">
          RealityCents runs a free, read-only Hawaii mortgage and VA loan calculator server for AI assistants (Model
          Context Protocol). It has no login and collects no personal data.
        </p>
        <dl>
          <Row label="Endpoint"><code>{MCP_ENDPOINT}</code> (Streamable HTTP, no authentication)</Row>
          <Row label="MCP Registry name"><code>io.github.jaymiller-cmg/mortgage-hawaii</code></Row>
          <Row label="Setup guide"><a className={a} href="/ai">realitycents.com/ai</a></Row>
        </dl>

        <h2 className="font-display text-2xl text-navy mt-10 mb-3">Official profiles</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><a className={a} href="https://www.linkedin.com/in/jay-miller-534bb5173/" target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a className={a} href="https://x.com/realitycents" target="_blank" rel="noopener">X: @realitycents</a></li>
          <li><a className={a} href="https://www.youtube.com/@RacingThroughMidlife" target="_blank" rel="noopener">YouTube: Racing Through Midlife</a> (personal channel)</li>
          <li><a className={a} href="https://www.cmghomeloans.com/mysite/jay-miller" target="_blank" rel="noopener">CMG Home Loans profile</a></li>
          <li><a className={a} href={NMLS_URL} target="_blank" rel="noopener">NMLS Consumer Access</a></li>
          <li><a className={a} href="https://www.instagram.com/jaymiller_hawaii/" target="_blank" rel="noopener">Instagram: @jaymiller_hawaii</a></li>
          <li><a className={a} href="https://www.facebook.com/realitycents" target="_blank" rel="noopener">Facebook: RealityCents</a></li>
        </ul>

        <h2 className="font-display text-2xl text-navy mt-10 mb-3">Machine-readable version</h2>
        <p className="text-muted-foreground">
          The same facts are available as JSON at <a className={a} href="/facts.json">realitycents.com/facts.json</a>.
        </p>
      </section>
    </Layout>
  );
}
