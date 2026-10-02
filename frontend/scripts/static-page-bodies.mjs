/**
 * Static Page Body Content for Prerendering
 * ==========================================
 * Provides semantic HTML body content for all non-article pages.
 * Each entry returns an HTML string with H1, paragraphs, and key content
 * that AI crawlers and search engines can extract without JavaScript.
 */

const BASE_URL = "https://realitycents.com";

import { readFileSync } from "fs";
const CONDO_DATA = JSON.parse(
  readFileSync(new URL("../client/src/data/va-approved-condos-oahu.json", import.meta.url), "utf8")
);
const CONDO_TOTAL = CONDO_DATA.totalApproved.toLocaleString("en-US");
const CONDO_UPDATED_MONTH = new Date(CONDO_DATA.lastUpdated + "T00:00:00").toLocaleString("en-US", { month: "long", year: "numeric" });

export const STATIC_PAGE_BODIES = {
  "/": `
    <main>
      <h1>Hawaii Mortgage Education &amp; Lending</h1>
      <p>Hawaii's trusted mortgage resource. Expert guidance from Jay Miller, NMLS #657301, with 25+ years of Hawaii lending experience at CMG Home Loans. Serving Oahu, Maui, Kauai, and the Big Island.</p>
      <section>
        <h2>What We Offer</h2>
        <p>RealityCents provides free mortgage education, professional calculators, and personalized lending services for Hawaii homebuyers. Whether you're a first-time buyer, military service member, or real estate investor, we have the tools and expertise to guide you through Hawaii's unique real estate market.</p>
        <ul>
          <li><a href="${BASE_URL}/calculator">Free Mortgage Calculators</a> — Basic, Advanced, Affordability, Rent vs. Buy, Buydown, <a href="${BASE_URL}/military-calculator">Military Buying Power</a>, and Loan Comparison tools</li>
          <li><a href="${BASE_URL}/knowledge-base">Knowledge Base</a> — 30+ expert articles covering VA loans, FHA loans, conventional financing, down payment assistance, and Hawaii-specific topics</li>
          <li><a href="${BASE_URL}/agents">Agent Tools</a> — Professional DSCR analyzer, assumable loan calculator, and escalation calculator for real estate professionals</li>
          <li><a href="${BASE_URL}/va-approved-condos-oahu">VA Condo Lookup</a> — Searchable directory of ${CONDO_TOTAL} VA-approved condo projects on Oahu</li>
          <li><a href="${BASE_URL}/ai">AI Assistant Tools</a>: the RealityCents calculators inside ChatGPT, Claude, and Cursor</li>
          <li><a href="${BASE_URL}/guide">Free Homebuying Guide</a> — Comprehensive step-by-step guide to buying a home in Hawaii</li>
        </ul>
      </section>
      <section>
        <h2>Meet Your Lender</h2>
        <p>Jay Miller is a Sales Manager and Certified Mortgage Advisor at CMG Home Loans in Honolulu, Hawaii. With over 25 years of mortgage lending experience and as a U.S. Army veteran, Jay specializes in VA loans, first-time homebuyer programs, and Hawaii's unique real estate challenges including leasehold properties, condo warrantability, and high-cost market financing.</p>
        <p>NMLS #657301 | CMG Home Loans Branch NMLS #2475890 | (808) 429-0811 | 500 Ala Moana Blvd, Suite 5-325, Honolulu, HI 96813</p>
      </section>
      <section>
        <h2>Hawaii Mortgage FAQ</h2>
        <dl>
          <dt>What is the conforming loan limit in Hawaii?</dt>
          <dd>Hawaii is a high-cost state. For 2026, the conforming loan limit for a single-family home in Honolulu County is $1,249,125 — significantly higher than the national baseline of $832,750.</dd>
          <dt>What is the minimum down payment for a home in Hawaii?</dt>
          <dd>VA loans require 0% down. FHA loans require 3.5% down with a 580+ credit score. Conventional loans can go as low as 3% down for first-time buyers.</dd>
          <dt>Can I use a VA loan to buy a condo in Hawaii?</dt>
          <dd>Yes, but the condo project must be VA-approved. The VA maintains a list of approved condo projects — use our VA Condo Lookup tool to verify.</dd>
        </dl>
      </section>
    </main>
  `,

  "/about": `
    <main>
      <h1>About Jay Miller — Hawaii Mortgage Lender</h1>
      <p>Jay Miller is a Sales Manager and Certified Mortgage Advisor at CMG Home Loans in Honolulu, Hawaii. With over 25 years of mortgage lending experience, Jay has helped thousands of Hawaii families achieve homeownership — from first-time buyers navigating FHA programs to military families maximizing their VA benefits.</p>
      <section>
        <h2>Background &amp; Experience</h2>
        <p>A U.S. Army veteran and Certified Mortgage Advisor (CMA), Jay brings a unique combination of military service understanding and deep Hawaii real estate expertise. He specializes in VA loans, conventional financing, jumbo loans, and investment property lending across all Hawaiian islands.</p>
        <p>Jay is a triathlete and passionate advocate for financial literacy. He created RealityCents to provide free, no-pressure mortgage education — because informed buyers make better decisions.</p>
        <p>I also publish the <a href="${BASE_URL}/ai">RealityCents MCP server for AI assistants</a>, so ChatGPT and Claude can run Hawaii VA math on my 2026 numbers.</p>
        <p><a href="${BASE_URL}/zero-down-in-paradise">Read the full playbook — Zero Down in Paradise</a> by Jay Miller, NMLS #657301. The 164-page Hawaii VA loan playbook for military homebuyers, <a href="https://www.amazon.com/dp/B0H7P83W15">available on Amazon</a>.</p>
      </section>
      <section>
        <h2>Credentials</h2>
        <ul>
          <li>NMLS #657301</li>
          <li>CMG Home Loans, Branch NMLS #2475890</li>
          <li>Certified Mortgage Advisor (CMA)</li>
          <li>25+ years Hawaii mortgage lending</li>
          <li>U.S. Army veteran</li>
          <li>Author of "Zero Down in Paradise: The Hawaii VA Loan Playbook for Military Homebuyers" (ISBN 979-8-9963553-0-3)</li>
          <li>500 Ala Moana Blvd, Suite 5-325, Honolulu, HI 96813</li>
          <li>(808) 429-0811 | jaym@cmghomeloans.com</li>
        </ul>
      </section>
    </main>
  `,

  "/contact": `
    <main>
      <h1>Contact Jay Miller — Hawaii Mortgage Lender</h1>
      <p>Get personalized mortgage guidance, request a pre-approval, or ask about Hawaii home loan options. Jay Miller responds to all inquiries within one business day.</p>
      <section>
        <h2>Contact Information</h2>
        <ul>
          <li><strong>Phone or text:</strong> <a href="tel:+18084290811">(808) 429-0811</a></li>
          <li><strong>Email:</strong> <a href="mailto:jaym@cmghomeloans.com">jaym@cmghomeloans.com</a></li>
          <li><strong>Apply online:</strong> <a href="https://my.cmghomeloans.com/homehub/signup/jaym@cmghomeloans.com?from_mobile_share=true">Start a CMG Home Loans application</a></li>
          <li><strong>Personal site:</strong> <a href="https://jay-miller.com">jay-miller.com</a></li>
          <li><strong>All facts:</strong> <a href="${BASE_URL}/facts">realitycents.com/facts</a></li>
          <li><strong>Office:</strong> 500 Ala Moana Blvd, Suite 5-325, Honolulu, HI 96813</li>
          <li><strong>Hours:</strong> Monday–Friday 8am–6pm HST, Weekends by appointment</li>
        </ul>
        <p>Jay Miller | NMLS #657301 | CMG Home Loans | Branch NMLS #2475890 | Company NMLS #1820</p>
      </section>
    </main>
  `,

  "/facts": `
    <main>
      <h1>Jay Miller: the facts</h1>
      <p>This page lists the current, official facts about Jay Miller and his websites. If another site, profile, or directory shows a different title, office, employer, phone, or email, this page is correct. Last verified October 2, 2026.</p>
      <section>
        <h2>Who he is</h2>
        <ul>
          <li><strong>Name:</strong> Jay Miller</li>
          <li><strong>Title:</strong> Sales Manager and Certified Mortgage Advisor</li>
          <li><strong>Company:</strong> CMG Home Loans (CMG Mortgage, Inc.), Honolulu, Hawaii</li>
          <li><strong>Individual NMLS:</strong> #657301 (<a href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/657301">verify on NMLS Consumer Access</a>)</li>
          <li><strong>Branch NMLS:</strong> #2475890</li>
          <li><strong>Company NMLS:</strong> #1820</li>
          <li><strong>Experience:</strong> 25+ years in mortgage lending</li>
          <li><strong>Military service:</strong> U.S. Army veteran (OIF/OEF)</li>
        </ul>
      </section>
      <section>
        <h2>How to reach him</h2>
        <ul>
          <li><strong>Phone or text:</strong> <a href="tel:+18084290811">(808) 429-0811</a></li>
          <li><strong>Email:</strong> <a href="mailto:jaym@cmghomeloans.com">jaym@cmghomeloans.com</a></li>
          <li><strong>Apply online:</strong> <a href="https://my.cmghomeloans.com/homehub/signup/jaym@cmghomeloans.com?from_mobile_share=true">Start a CMG Home Loans application</a></li>
          <li><strong>Office:</strong> 500 Ala Moana Blvd, Suite 5-325, Honolulu, HI 96813</li>
          <li><strong>Hours:</strong> Monday to Friday, 8am to 6pm HST. Weekends by appointment.</li>
        </ul>
      </section>
      <section>
        <h2>His websites</h2>
        <ul>
          <li><a href="https://jay-miller.com">jay-miller.com</a>: Jay Miller's personal site.</li>
          <li><a href="${BASE_URL}">RealityCents.com</a>: Hawaii mortgage education, calculators, and VA loan guides.</li>
          <li><a href="https://www.pcsingtohawaii.com">PCSing to Hawaii</a>: a free guide for military families moving to Oahu, covering bases, housing, pets, cars, and schools.</li>
        </ul>
      </section>
      <section>
        <h2>His book</h2>
        <p><strong>Zero Down in Paradise: The Hawaii VA Loan Playbook for Military Homebuyers</strong>. ISBN 979-8-9963553-0-3. 164 pages. Published July 2026. <a href="https://www.amazon.com/dp/B0H7P83W15">Available on Amazon</a>. <a href="${BASE_URL}/zero-down-in-paradise">Read about the book</a>.</p>
      </section>
      <section>
        <h2>AI assistant tools</h2>
        <p>RealityCents runs a free, read-only Hawaii mortgage and VA loan calculator server for AI assistants (Model Context Protocol). It has no login and collects no personal data.</p>
        <ul>
          <li><strong>Endpoint:</strong> https://realitycents-mcp.jaymiller.workers.dev/mcp (Streamable HTTP, no authentication)</li>
          <li><strong>Official MCP Registry name:</strong> io.github.jaymiller-cmg/mortgage-hawaii</li>
          <li><strong>Setup guide:</strong> <a href="${BASE_URL}/ai">realitycents.com/ai</a></li>
        </ul>
      </section>
      <section>
        <h2>Official profiles</h2>
        <ul>
          <li><a href="https://www.linkedin.com/in/jay-miller-534bb5173/">LinkedIn</a></li>
          <li><a href="https://x.com/realitycents">X: @realitycents</a></li>
          <li><a href="https://www.youtube.com/@RacingThroughMidlife">YouTube: Racing Through Midlife</a> (personal channel)</li>
          <li><a href="https://www.cmghomeloans.com/mysite/jay-miller">CMG Home Loans profile</a></li>
          <li><a href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/657301">NMLS Consumer Access</a></li>
          <li><a href="https://www.instagram.com/jaymiller_hawaii/">Instagram: @jaymiller_hawaii</a></li>
          <li><a href="https://www.facebook.com/realitycents">Facebook: RealityCents</a></li>
        </ul>
      </section>
      <p>The same facts are available as JSON at <a href="${BASE_URL}/facts.json">realitycents.com/facts.json</a>.</p>
      <p>Jay Miller, NMLS #657301. CMG Home Loans, Branch NMLS #2475890. CMG Mortgage, Inc., NMLS #1820. Equal Housing Opportunity. Content on RealityCents is educational and is not a commitment to lend. All loans are subject to credit approval and program guidelines.</p>
    </main>
  `,

  "/guide": `
    <main>
      <h1>Free Hawaii Homebuying Guide</h1>
      <p>Download our comprehensive Hawaii Homebuying Guide — a step-by-step resource covering everything from mortgage pre-approval to closing day. Written specifically for Hawaii's unique real estate market.</p>
      <section>
        <h2>What's Inside</h2>
        <ul>
          <li>Step-by-step homebuying timeline for Hawaii</li>
          <li>Understanding leasehold vs. fee simple ownership</li>
          <li>Down payment options and assistance programs</li>
          <li>VA loan benefits for Hawaii military buyers</li>
          <li>Condo buying guide and HOA considerations</li>
          <li>Hawaii closing costs breakdown</li>
          <li>Home inspection tips for island properties</li>
          <li>Working with your lender and real estate agent</li>
        </ul>
        <p>This guide is free with no obligation. Enter your email to receive an instant download link.</p>
      </section>
    </main>
  `,

  "/calculator": `
    <main>
      <h1>Hawaii Mortgage Calculator — Estimate Your Monthly Payment</h1>
      <p>Use our free Hawaii mortgage calculator to estimate your monthly mortgage payment including principal, interest, property taxes, insurance, HOA fees, and PMI. See a full amortization schedule and visual payment breakdown.</p>
      <p><a href="${BASE_URL}/ai">Use this Hawaii mortgage calculator in ChatGPT, Claude, or Cursor</a></p>
      <section>
        <h2>How It Works</h2>
        <p>Enter your home price, down payment, interest rate, and loan term to instantly calculate your estimated monthly payment. The calculator includes Hawaii-specific defaults for property tax rates (approximately 0.35% for owner-occupied) and typical insurance costs.</p>
        <p>The results include a detailed amortization schedule showing how your payment splits between principal and interest over the life of the loan, plus a pie chart breaking down your total monthly PITIA (Principal, Interest, Taxes, Insurance, and Association fees).</p>
      </section>
      <section>
        <h2>Hawaii Mortgage Considerations</h2>
        <p>Hawaii has some of the lowest property tax rates in the nation but higher home prices and insurance costs. HOA fees for condos typically range from $400–$1,200/month. The 2026 conforming loan limit for Honolulu County is $1,249,125.</p>
      </section>
    </main>
  `,

  "/advanced-calculator": `
    <main>
      <h1>Advanced Mortgage Calculator — Conventional, VA, FHA &amp; Jumbo</h1>
      <p>Compare loan types side by side with our advanced Hawaii mortgage calculator. Includes real PMI lookup tables, VA funding fee calculations, FHA MIP rates, and full amortization schedules for each loan type.</p>
      <section>
        <h2>Loan Types Compared</h2>
        <ul>
          <li><strong>Conventional:</strong> 3–20% down, PMI required below 20%, conforming limit $1,249,125 in Hawaii</li>
          <li><strong>VA:</strong> 0% down for eligible veterans/military, no PMI, VA funding fee (2.15% first use)</li>
          <li><strong>FHA:</strong> 3.5% down minimum, upfront MIP (1.75%) plus annual MIP (0.55%)</li>
          <li><strong>Jumbo:</strong> For loans above $1,249,125, typically 10–20% down required</li>
        </ul>
      </section>
    </main>
  `,

  "/affordability-calculator": `
    <main>
      <h1>What Can I Afford? — Hawaii Home Affordability Calculator</h1>
      <p>Find out how much home you can afford in Hawaii based on your income, debts, and down payment. This calculator uses standard DTI (debt-to-income) ratios to estimate your maximum purchase price.</p>
      <p><a href="${BASE_URL}/ai">Use this Hawaii mortgage calculator in ChatGPT, Claude, or Cursor</a></p>
      <section>
        <h2>How Lenders Determine Affordability</h2>
        <p>Most lenders use two DTI ratios: the front-end ratio (housing costs divided by gross income, typically capped at 28–31%) and the back-end ratio (all debts including housing divided by gross income, typically capped at 43–50%). VA loans are more flexible, often allowing higher ratios with compensating factors.</p>
        <p>Enter your gross monthly income, monthly debts, down payment amount, and expected interest rate to see your estimated maximum home price in Hawaii.</p>
      </section>
    </main>
  `,

  "/rent-vs-buy": `
    <main>
      <h1>Rent vs. Buy Calculator — Should You Buy a Home in Hawaii?</h1>
      <p>Compare the true cost of renting vs. buying a home in Hawaii over time. See your break-even year, equity growth projections, investment opportunity cost, and cumulative cost analysis.</p>
      <p><a href="${BASE_URL}/ai">Use this Hawaii mortgage calculator in ChatGPT, Claude, or Cursor</a></p>
      <section>
        <h2>Key Factors in Hawaii</h2>
        <p>Hawaii's high rents (median $2,800+/month for a 2BR) and strong appreciation history (4–6% annually) often favor buying over renting for those who plan to stay 3+ years. However, high home prices mean larger down payments and higher monthly costs. This calculator helps you see the full picture including tax benefits, equity growth, and opportunity cost of your down payment.</p>
      </section>
    </main>
  `,

  "/buydown-calculator": `
    <main>
      <h1>Temporary Buydown Calculator — 1/1, 2/1 &amp; 3/2/1 Buydowns</h1>
      <p>Calculate the exact seller credit needed for temporary mortgage rate buydowns. Compare 1/1, 2/1, and 3/2/1 buydown structures to see how much a seller needs to contribute to reduce your interest rate in the early years of your loan.</p>
      <p><a href="${BASE_URL}/ai">Use this Hawaii mortgage calculator in ChatGPT, Claude, or Cursor</a></p>
      <section>
        <h2>How Temporary Buydowns Work</h2>
        <p>A temporary buydown reduces your mortgage interest rate for the first 1–3 years of the loan. The seller (or builder) contributes a lump sum at closing that subsidizes your payments during the buydown period. After the buydown expires, your rate returns to the permanent note rate. This is different from buying discount points, which permanently reduce your rate.</p>
        <p>Common structures: A 2/1 buydown reduces your rate by 2% in Year 1 and 1% in Year 2. A 3/2/1 reduces by 3%, 2%, and 1% over three years. The seller credit required equals the total payment difference over the buydown period.</p>
      </section>
    </main>
  `,

  "/military-calculator": `
    <main>
      <h1>Military Buying Power Calculator — Hawaii VA Loan Home Purchase Estimator</h1>
      <p>Estimate your total qualifying income and home purchase power as a Hawaii-based military service member. Uses 2026 base pay, BAH (Honolulu County), BAS, and COLA rates with VA loan qualification standards.</p>
      <p><a href="${BASE_URL}/ai">Ask your AI assistant for VA purchase power by rank</a></p>
      <section>
        <h2>How Military Income Qualifies</h2>
        <p>VA lenders count multiple income sources for qualification: base pay, BAH (Basic Allowance for Housing), BAS (Basic Allowance for Subsistence), COLA, flight pay, hazardous duty pay, and more. Since BAH and BAS are tax-free, many lenders gross them up by up to 25% for qualification (lender policy, not a VA rule), significantly increasing your buying power.</p>
        <p>For Honolulu County in 2026, BAH with dependents ranges from $3,663/month (E-5) to $5,001/month (O-6). Combined with base pay and the 25% gross-up, most military families qualify for more home than they expect.</p>
      </section>
    </main>
  `,

  "/loan-compare": `
    <main>
      <h1>Loan Comparison Calculator — Compare Rate &amp; Cost Scenarios</h1>
      <p>Compare loan scenarios side by side to find the best option for your situation. See monthly payments, closing costs, APR, and total cost over time for different loan structures. Generate shareable links to send comparisons to your clients or agent.</p>
      <p><a href="${BASE_URL}/ai">Use this Hawaii mortgage calculator in ChatGPT, Claude, or Cursor</a></p>
      <section>
        <h2>What You Can Compare</h2>
        <p>Add up to 3 loan scenarios with different rates, points, closing costs, and terms. The calculator shows you the true cost of each option including the break-even point for paying points, total interest over the loan life, and effective APR. Perfect for comparing lender quotes or evaluating rate buydown options.</p>
      </section>
    </main>
  `,

  "/frequently-asked-questions": `
    <main>
      <h1>Hawaii Home Loan FAQ</h1>
      <p>Answers to the most common questions about buying a home and getting a mortgage in Hawaii. Expert answers from Jay Miller, a local mortgage professional with 25+ years of experience.</p>
      <section>
        <h2>Loan Basics</h2>
        <dl>
          <dt>What is the conforming loan limit in Hawaii for 2026?</dt>
          <dd>The conforming loan limit for Honolulu County is $1,249,125 for a single-family home — significantly higher than the national baseline of $832,750. This means you can get a conventional loan up to this amount without jumbo pricing.</dd>
          <dt>What credit score do I need to buy a home in Hawaii?</dt>
          <dd>Minimum scores vary by loan type: VA loans have no VA-mandated minimum (most lenders require 580–620), FHA requires 580 for 3.5% down (500 for 10% down), and conventional typically requires 620+. Higher scores get better rates.</dd>
          <dt>How much are closing costs in Hawaii?</dt>
          <dd>Typically 2–5% of the purchase price, with a planning budget of about 3–4%. On an $800,000 home, that budget is roughly $24,000–$32,000, including lender fees, title insurance, escrow fees, and prepaid items.</dd>
        </dl>
      </section>
      <section>
        <h2>VA Loans</h2>
        <dl>
          <dt>Can I use a VA loan in Hawaii?</dt>
          <dd>Yes. VA loans work in all 50 states including Hawaii. With full entitlement, there is no VA loan limit; how much you can borrow with $0 down depends on your income, debts, residual income, and lender approval. The VA funding fee is 2.15% for first-time use (waived for disabled veterans).</dd>
          <dt>Can I use a VA loan for a condo in Hawaii?</dt>
          <dd>Yes, but the condo project must be VA-approved. Use our VA Condo Lookup tool to check — there are ${CONDO_TOTAL} approved projects on Oahu alone.</dd>
        </dl>
      </section>
      <section>
        <h2>Hawaii-Specific</h2>
        <dl>
          <dt>What is leasehold vs. fee simple in Hawaii?</dt>
          <dd>Fee simple means you own both the structure and the land. Leasehold means you own the structure but lease the land — you pay monthly lease rent to the landowner. Lenders require at least 35 years remaining on the lease for a 30-year mortgage.</dd>
          <dt>What are typical HOA fees for Hawaii condos?</dt>
          <dd>HOA fees range from $400–$1,200+/month depending on the building's age, amenities, and reserve fund health. Older buildings with deferred maintenance tend to have higher fees and special assessments.</dd>
        </dl>
      </section>
    </main>
  `,

  "/va-approved-condos-oahu": `
    <main>
      <h1>VA-Approved Condos on Oahu — ${CONDO_TOTAL} Projects</h1>
      <p>Searchable directory of all ${CONDO_TOTAL} VA-approved condo projects on Oahu, Hawaii. Filter by neighborhood, approval status, and zip code. Data sourced from the VA LGY Hub, updated ${CONDO_UPDATED_MONTH}.</p>
      <section>
        <h2>Approval Status Breakdown</h2>
        <ul>
          <li><strong>1,498 projects:</strong> Accepted Without Conditions — fully meets all VA requirements</li>
          <li><strong>247 projects:</strong> Accepted With Conditions — approved with noted informational items</li>
        </ul>
        <p>Both statuses allow VA financing. The difference is administrative — in practice, there is almost never anything that needs to be resolved for "With Conditions" projects.</p>
      </section>
      <section>
        <h2>Frequently Asked Questions</h2>
        <dl>
          <dt>What does VA condo approval mean?</dt>
          <dd>VA condo approval means the Department of Veterans Affairs has reviewed a condominium project's legal documents, financials, and HOA governance and determined it meets VA lending standards. Without this approval, VA-eligible buyers cannot use their VA loan benefit to purchase a unit in that project.</dd>
          <dt>What if the condo I want is not on the VA-approved list?</dt>
          <dd>Your lender can submit the full project approval package to the Regional VA Loan Center as part of your purchase transaction — this is called Lender Submitted Condo Approval and typically takes 2–3 weeks.</dd>
          <dt>Can I use a VA loan for a Waikiki condotel?</dt>
          <dd>Generally no. The VA does not approve projects that operate primarily as hotels or where units are part of a mandatory rental pool.</dd>
        </dl>
      </section>
    </main>
  `,

  "/zero-down-in-paradise": `
    <main>
      <h1>Zero Down in Paradise — The Hawaii VA Loan Playbook for Military Homebuyers</h1>
      <p>By Jay Miller — U.S. Army veteran · NMLS #657301 · CMG Home Loans, Honolulu. Published July 2026. Paperback, 164 pages, ISBN 979-8-9963553-0-3. <a href="https://www.amazon.com/dp/B0H7P83W15">Get it on Amazon</a>. Last updated: September 6, 2026.</p>
      <section>
        <h2>What is Zero Down in Paradise?</h2>
        <p><em>Zero Down in Paradise</em> is Jay Miller’s Hawaii-specific VA loan playbook for military homebuyers (164 pages, July 2026, ISBN 979-8-9963553-0-3).</p>
        <p>Hawaii is one of the most expensive housing markets in America. For service members arriving on PCS orders to Joint Base Pearl Harbor-Hickam, Schofield Barracks, Marine Corps Base Hawaii, or other installations across the islands, the sticker shock is real. This book is the field guide to using your VA benefit in that market — written by a 25-year Hawaii lender and Army veteran who has helped hundreds of military families close VA loans here.</p>
        <p>It is not a generic mainland VA pamphlet. It covers entitlement and loan limits in a high-cost county, BAH and COLA as purchasing power, VA condo approval, leasehold vs fee simple, the J-1 inspection contingency, property tax exemptions, IRRRL and assumable strategies, and the funding-fee rules most buyers only hear about at the closing table.</p>
        <p><a href="https://www.amazon.com/dp/B0H7P83W15">Get Zero Down in Paradise on Amazon</a></p>
      </section>
      <section>
        <h2>Can you buy a home in Hawaii with a VA loan and zero down?</h2>
        <p><strong>Yes.</strong> Eligible veterans and active-duty service members with full VA entitlement can purchase a primary residence in Hawaii with $0 down and no PMI. You still need lender approval based on income, credit, residual income, and the property.</p>
        <p>That $0-down benefit is especially powerful in Hawaii, where a conventional 20% down payment on an $800,000 home is $160,000. VA financing removes that cash hurdle when you qualify and have full entitlement. Many lenders still set their own maximum loan amount for $0-down VA purchases — ask your lender what their cap is.</p>
        <p>For the full walkthrough, see the free companion guide: <a href="${BASE_URL}/knowledge-base/va-loans-hawaii-military">how to buy a house in Hawaii with a VA loan and $0 down (step by step)</a>.</p>
      </section>
      <section>
        <h2>Is there a VA loan limit in Hawaii?</h2>
        <p><strong>With full entitlement, there is no VA loan limit for a $0-down purchase</strong>; how much you can borrow depends on your income, debts, residual income, and lender approval. With reduced entitlement (for example, an existing VA loan still outstanding), county conforming limits apply. For Honolulu County, the 2026 single-family conforming limit referenced in our Veterans Guide is <strong>$1,249,125</strong>; always confirm the current FHFA/VA figures for the county where you are buying.</p>
        <p>If you are unsure how much entitlement you have left, use the <a href="${BASE_URL}/va-eligibility-calculator">VA Remaining Eligibility Calculator</a> and read the entitlement section of the <a href="${BASE_URL}/knowledge-base/va-loans-hawaii-military">Veterans Guide</a>.</p>
      </section>
      <section>
        <h2>What’s inside the book?</h2>
        <ul>
          <li><strong>Full entitlement and loan limits</strong> — How $0-down works even in Honolulu’s high-cost market, and what changes when entitlement is reduced.</li>
          <li><strong>BAH and COLA as buying power</strong> — How military allowances factor into qualification in Hawaii.</li>
          <li><strong>VA condo approval</strong> — Why you verify the project before you fall in love with the unit.</li>
          <li><strong>Leasehold vs fee simple</strong> — Remaining lease term rules that can make or break a VA loan.</li>
          <li><strong>J-1 inspection contingency</strong> — Hawaii-specific contract timing buyers need to respect.</li>
          <li><strong>Property tax exemptions</strong> — Filings every Hawaii buyer should know about.</li>
          <li><strong>IRRRL, cash-out, and assumable strategies</strong> — Ways VA financing can support long-term wealth, not just the first purchase.</li>
          <li><strong>2026 VA funding fee tax deduction</strong> — A rule many borrowers never hear from their lender.</li>
          <li><strong>Closing-table stories</strong> — What works, what fails, and how to avoid expensive mistakes.</li>
        </ul>
      </section>
      <section>
        <h2>Who should read Zero Down in Paradise?</h2>
        <p><strong>This book is for military buyers navigating Hawaii — PCS arrivals, veterans, and Reserve members with VA eligibility — not for generic mainland first-time buyers.</strong></p>
        <ul>
          <li>Active-duty service members PCSing to Oahu, Maui, Kauai, or the Big Island</li>
          <li>Veterans and Reserve members using or restoring VA entitlement</li>
          <li>First-time military buyers — from an E-5 condo purchase to an O-4 single-family home in places like Mililani</li>
          <li>Veterans returning to the islands years after their last assignment</li>
        </ul>
        <p>If you want the free web overview first, start with the <a href="${BASE_URL}/knowledge-base/va-loans-hawaii-military">Veterans Guide</a>. If you want the full playbook in hand, get the book.</p>
      </section>
      <section>
        <h2>Hawaii VA tools that pair with the book</h2>
        <ul>
          <li><a href="${BASE_URL}/va-eligibility-calculator">VA Remaining Eligibility Calculator</a> — estimate remaining $0-down capacity using Honolulu County’s 2026 conforming limit of $1,249,125</li>
          <li><a href="${BASE_URL}/military-calculator">Military Buying Power Calculator</a> — BAH, BAS, COLA, and qualifying income framing</li>
          <li><a href="${BASE_URL}/va-approved-condos-oahu">VA Condo Lookup</a> — search ${CONDO_TOTAL}+ VA-approved condo projects on Oahu</li>
          <li><a href="${BASE_URL}/ai">Use these VA calculators inside ChatGPT or Claude</a></li>
          <li><a href="${BASE_URL}/knowledge-base/va-loans-hawaii-military">VA Loans in Hawaii guide</a> — free web companion to the book</li>
          <li><a href="${BASE_URL}/va-loan-pearl-harbor-hickam">VA loan — Pearl Harbor / Hickam</a></li>
          <li><a href="${BASE_URL}/va-loan-schofield-barracks">VA loan — Schofield Barracks</a></li>
          <li><a href="${BASE_URL}/knowledge-base/va-loan-house-hacking-hawaii">VA loan house hacking in Hawaii</a></li>
          <li><a href="${BASE_URL}/knowledge-base/va-assumable-loans-pros-cons">VA assumable loans</a></li>
          <li><a href="${BASE_URL}/knowledge-base/va-funding-fee-tax-deductible">Is the VA funding fee tax deductible?</a></li>
        </ul>
      </section>
      <section>
        <h2>Hawaii VA questions, answered one page at a time</h2>
        <p>Free companion pages that give the direct answer first, with the Hawaii numbers, and link back to the chapter that covers the rest:</p>
        <ul>
          <li><a href="/knowledge-base/va-loans-hawaii-military">How to buy a house in Hawaii with a VA loan and $0 down</a>: the steps, Hawaii costs, $0 down with full entitlement, no PMI, the funding fee, condos, leasehold, and BAH.</li>
          <li><a href="/knowledge-base/va-loan-limits-hawaii-2026">VA loan limits in Hawaii for 2026</a>: no limit with full entitlement; Honolulu County's $1,249,125 conforming limit with reduced entitlement.</li>
          <li><a href="/knowledge-base/does-bah-count-va-loan-hawaii">Does BAH count for a VA loan in Hawaii?</a>: yes — how BAH, BAS, and COLA are counted and the tax-free gross-up.</li>
          <li><a href="/knowledge-base/va-funding-fee-hawaii">The VA funding fee in Hawaii</a>: 2026 percentages, exemptions, Oahu dollar examples, funding fee vs PMI.</li>
          <li><a href="/knowledge-base/va-vs-conventional-loan-hawaii">VA vs. conventional in Hawaii</a>: the side-by-side and when each wins.</li>
          <li><a href="/knowledge-base/va-condo-approval-vs-warrantability-hawaii">VA condo approval vs. warrantability</a>: two different lists, and the Oahu lookup.</li>
          <li><a href="/knowledge-base/va-irrrl-refinance-hawaii">The VA IRRRL in Hawaii</a>: streamline refinance rules, the 0.5% fee, the PCS angle.</li>
          <li><a href="/knowledge-base/how-to-choose-hawaii-va-lender">How to choose a Hawaii VA lender</a>: the questions that reveal real local VA experience.</li>
        </ul>
      </section>
      <section>
        <h2>About the author</h2>
        <p><strong>Jay Miller</strong> is a Sales Manager and Certified Mortgage Advisor at CMG Home Loans in Honolulu, Hawaii (NMLS #657301 · Branch NMLS #2475890). He is a U.S. Army veteran and a 25-year Hawaii lending veteran specializing in VA loans, conventional and jumbo financing, and the island-specific issues that trip up mainland playbooks — leasehold, condo approval, and high-cost qualification.</p>
        <p>Phone: (808) 429-0811 · Email: jaym@cmghomeloans.com · Office: 500 Ala Moana Blvd, Suite 5-325, Honolulu, HI 96813 · <a href="${BASE_URL}/about">About Jay Miller</a></p>
      </section>
      <section>
        <h2>FAQ</h2>
        <dl>
          <dt>What is Zero Down in Paradise?</dt>
          <dd><em>Zero Down in Paradise: The Hawaii VA Loan Playbook for Military Homebuyers</em> is a 164-page paperback (July 2026, ISBN 979-8-9963553-0-3) by Jay Miller that explains how to buy a home in Hawaii using a VA loan.</dd>
          <dt>Who is Jay Miller (NMLS #657301)?</dt>
          <dd>Jay Miller is a U.S. Army veteran and a Sales Manager and Certified Mortgage Advisor at CMG Home Loans in Honolulu with 25+ years of Hawaii lending experience. He is the author of <em>Zero Down in Paradise</em>.</dd>
          <dt>Can I use a VA loan to buy in Hawaii with zero down?</dt>
          <dd>Yes, if you are eligible and have full entitlement, and you meet lender credit, income, and property requirements. There is no PMI on VA loans. Lender maximums for $0-down amounts may still apply.</dd>
          <dt>Is there a VA loan limit in Hawaii?</dt>
          <dd>With full entitlement, no VA loan limit for $0 down. With reduced entitlement, county conforming limits apply. Honolulu County's 2026 single-family conforming limit is $1,249,125.</dd>
          <dt>Are Hawaii condos VA-approved?</dt>
          <dd>Not automatically. Many Hawaii condos are VA-approved, but you must verify the specific project before writing an offer. Use RealityCents’ <a href="${BASE_URL}/va-approved-condos-oahu">VA condo lookup</a> and have your lender confirm.</dd>
          <dt>Can VA loans be used on Hawaii leasehold property?</dt>
          <dd>Rarely in practice. VA financing on leasehold requires the lease to meet VA's term requirements, and very few Oahu leasehold properties end up being workable with a VA loan. VA buyers usually do best focusing on fee-simple property; have your lender and a Hawaii real estate attorney review any lease before you sign a Purchase Contract.</dd>
          <dt>Does BAH count as income for a Hawaii VA loan?</dt>
          <dd>Yes. Basic Allowance for Housing typically counts toward qualification. Hawaii BAH is among the highest in the country, which can materially increase buying power — estimate with the <a href="${BASE_URL}/military-calculator">Military Buying Power Calculator</a>.</dd>
          <dt>What is the VA funding fee, and who is exempt?</dt>
          <dd>The VA funding fee is a one-time fee (often financeable) in place of PMI. First-use $0-down purchasers commonly pay a percentage of the loan amount; veterans receiving VA disability compensation are generally exempt. See the book and Veterans Guide for current percentages and exceptions.</dd>
          <dt>Where can I buy Zero Down in Paradise?</dt>
          <dd>On <a href="https://www.amazon.com/dp/B0H7P83W15">Amazon</a> (ASIN B0H7P83W15).</dd>
          <dt>How is this different from generic VA loan guides?</dt>
          <dd>It is written for Hawaii: high-cost entitlement math, BAH/COLA, VA condos, leasehold, J-1, local tax exemptions, and island closing realities — by a Hawaii-based VA lender who is also a veteran.</dd>
          <dt>What free tools does RealityCents offer for VA buyers?</dt>
          <dd><a href="${BASE_URL}/va-eligibility-calculator">VA remaining eligibility calculator</a>, <a href="${BASE_URL}/military-calculator">military buying power calculator</a>, <a href="${BASE_URL}/va-approved-condos-oahu">VA condo lookup</a>, and a full <a href="${BASE_URL}/knowledge-base/va-loans-hawaii-military">Veterans Guide</a> plus related knowledge-base articles on house hacking, assumable VA loans, and funding-fee tax treatment, and the same math runs inside AI assistants through the <a href="${BASE_URL}/ai">RealityCents MCP server</a>.</dd>
          <dt>How do I get started with a Hawaii VA loan?</dt>
          <dd>1) Get your Certificate of Eligibility (COE). 2) Get pre-approved with a VA-experienced Hawaii lender. 3) Work with an agent who understands military / PCS timelines. 4) Verify condo approval and leasehold terms before you commit. Call (808) 429-0811 or start with the <a href="${BASE_URL}/knowledge-base/va-loans-hawaii-military">Veterans Guide</a>.</dd>
        </dl>
      </section>
      <section>
        <h2>Get the playbook</h2>
        <p><a href="https://www.amazon.com/dp/B0H7P83W15">Buy Zero Down in Paradise on Amazon</a></p>
        <p>Questions about a Hawaii VA purchase? Jay Miller, NMLS #657301 · (808) 429-0811 · jaym@cmghomeloans.com</p>
        <p><em>Equal Housing Lender. This is educational content, not a commitment to lend. All loans subject to credit approval and property eligibility. Approvals are not guaranteed. $0-down VA purchases require full entitlement and lender approval. NMLS Consumer Access: <a href="https://www.nmlsconsumeraccess.org">nmlsconsumeraccess.org</a>.</em></p>
      </section>
    </main>
  `,

  "/va-eligibility-calculator": `
    <main>
      <h1>VA Remaining Eligibility Calculator — Hawaii 2026</h1>
      <p>Estimate remaining VA $0-down capacity when entitlement is reduced. Honolulu County’s 2026 single-family conforming limit is <strong>$1,249,125</strong>. Educational tool by Jay Miller, NMLS #657301. Not a commitment to lend.</p>
      <section>
        <h2>How remaining entitlement works</h2>
        <p>With full entitlement, there is no VA loan limit for a $0-down purchase; how much you can borrow depends on your income, debts, residual income, and lender approval. With reduced entitlement (for example, a prior VA loan whose entitlement has not been restored), county conforming limits apply.</p>
        <p>Remaining entitlement is estimated as 25% of the county conforming limit minus your VA entitlement in use (based on the original loan amount of any VA loan not yet restored; your Certificate of Eligibility shows the exact figure). Your $0-down capacity is about four times the remaining entitlement. If the purchase price exceeds that capacity, a 25% down payment applies on the difference only.</p>
      </section>
      <section>
        <h2>2026 Hawaii county conforming limits (1-unit)</h2>
        <ul>
          <li>Honolulu County (Oahu): $1,249,125</li>
          <li>Maui County: $1,299,500</li>
          <li>Kalawao County: $1,299,500</li>
          <li>Kauai County: $1,249,125</li>
          <li>Hawaii County (Big Island): $1,249,125</li>
        </ul>
        <p>Always confirm current FHFA/VA figures for the county where you are buying. Pair this tool with the <a href="${BASE_URL}/military-calculator">Military Buying Power Calculator</a> and the <a href="${BASE_URL}/zero-down-in-paradise">Zero Down in Paradise</a> playbook.</p>
        <p><a href="${BASE_URL}/ai">Run this VA entitlement calculator in your AI assistant</a></p>
      </section>
    </main>
  `,

  "/agents": `
    <main>
      <h1>Agent Tools — Real Estate Agent Toolkit</h1>
      <p>Professional-grade tools for real estate agents and investors. Screen deals, structure assumptions, and win bidding wars with our full agent toolkit.</p>
      <section>
        <h2>Available Tools</h2>
        <ul>
          <li><strong>DSCR Investment Property Analyzer:</strong> Screen rental properties for DSCR loan qualification. Get instant rent estimates powered by RentCast, full PITIA and NOI breakdowns, and color-coded lender threshold verification.</li>
          <li><strong>Assumable Loan Calculator (VA/FHA):</strong> Compare assuming an existing VA or FHA loan at the seller's rate vs. new financing at today's rates. Includes gap financing analysis and VA entitlement implications.</li>
          <li><strong>"Win the Bid" Escalation Calculator:</strong> Reframe bidding wars from sticker shock into real monthly costs. See what each escalation truly costs per day, analyze appraisal gap exposure, and understand the cost of not winning.</li>
        </ul>
        <p>Enter your name and email to unlock access to all tools. These professional resources are provided free by Jay Miller, NMLS #657301, CMG Home Loans.</p>
      </section>
      <section>
        <h2>Watch: Build the Equity, Then Use It — The All-In-One Loan for Real Estate Agents</h2>
        <p>Your past clients from the last four years are mostly at 5.5% or higher. This seven-minute video shows what the All-In-One does to the pace of their equity, and what that means for the next property, the second home, and the move-up. Sample rates in a what-if model, not a rate quote or a promise to any borrower. Not a paid promotion, not a commitment to lend. <a href="https://www.youtube.com/watch?v=7x6JekhTmis">Watch on YouTube</a>.</p>
      </section>
      <section>
        <h2>Also Watch: The Deal You Didn't Have to Lose</h2>
        <p>A 6-minute briefing on the All-In-One first-lien HELOC, built for agents — the three client conversations it unlocks (the fence-sitting buyer, the locked-in seller, the investor), the math behind it, and the risks stated plainly. <a href="https://www.youtube.com/watch?v=9J92UtySyR8">Watch on YouTube</a>.</p>
      </section>
    </main>
  `,

  "/advisors": `
    <main>
      <h1>For Financial Advisors</h1>
      <p>Your client's mortgage is the largest drag on their investable cash flow. There's a better structure.</p>
      <section>
        <h2>The Largest Line Item You Don't Manage</h2>
        <p>A $600,000 mortgage at 6.25% costs your client $3,694/month for 30 years — $729,949 in total interest. That's $44K/year locked into housing during their prime earning and compounding years. The All-In-One first-lien HELOC changes that math dramatically.</p>
      </section>
      <section>
        <h2>Watch the Briefing: How the AIO Creates Portfolio Capacity</h2>
        <p>An 8-minute briefing on the mechanics, the math, the rate-risk analysis, and the suitability screen — built for advisors, not consumers. <a href="https://www.youtube.com/watch?v=inVfvRG92Uo">Watch on YouTube</a>.</p>
      </section>
      <section>
        <h2>Nine Questions Advisors Ask</h2>
        <p>Nine questions financial advisors ask about the All-In-One loan, answered in order with the numbers on screen, including what happens if rates rise, three ways, and whether a client will qualify. Sample rates in a what-if model, not a rate quote or a promise to any borrower. Not investment advice. <a href="https://www.youtube.com/watch?v=fN2ipKwyREc">Watch on YouTube</a>.</p>
      </section>
      <section>
        <h2>The Advisor's Edge</h2>
        <ul>
          <li><strong>Free Up Client Cash Flow:</strong> The average mortgage consumes $44K+/year for 30 years. The AIO pays off in 11–14 years, redirecting that payment to investable assets decades sooner.</li>
          <li><strong>Grow Your AUM:</strong> Every dollar freed from mortgage payments is a dollar available for your management.</li>
          <li><strong>Maintain Client Liquidity:</strong> Unlike extra payments on a fixed mortgage, every dollar paid into the AIO remains accessible on the line — no refinance needed to access equity.</li>
          <li><strong>Holistic Financial Planning:</strong> Position yourself as the advisor who optimizes the full balance sheet — not just the investment accounts.</li>
        </ul>
      </section>
      <section>
        <h2>How the All-In-One Works</h2>
        <ul>
          <li><strong>Paycheck Deposits:</strong> Full income deposits into the line, immediately reducing the balance.</li>
          <li><strong>Balance Drops Daily:</strong> Interest is calculated on the average daily balance — every idle dollar saves interest.</li>
          <li><strong>Bills Paid as Usual:</strong> The client pays expenses from the same account. The balance rises only when money is spent.</li>
          <li><strong>Surplus Retires Principal:</strong> The gap between income and spending automatically accelerates payoff — no extra effort.</li>
        </ul>
        <p>The All-In-One is a variable-rate first-lien HELOC tied to 30-day average SOFR plus a fixed margin. Suitability is narrow: it fits households with a genuine monthly surplus and stable deposits. Jay Miller, NMLS #657301, CMG Home Loans, runs the official simulator on each client's real numbers and returns a personalized comparison with every assumption on the page.</p>
      </section>
    </main>
  `,

  "/dscr-calculator": `
    <main>
      <h1>DSCR Investment Property Analyzer — Hawaii Rental Calculator</h1>
      <p>Screen rental properties for DSCR (Debt Service Coverage Ratio) loan qualification. Get a rent estimate, plug in the deal numbers, and instantly see if a property pencils as a DSCR loan deal.</p>
      <section>
        <h2>How DSCR Loans Work</h2>
        <p>DSCR loans qualify based on the property's rental income rather than the borrower's personal income. The DSCR ratio is calculated as: Net Operating Income (monthly rent minus vacancy and management) divided by Total Debt Service (PITIA — principal, interest, taxes, insurance, and HOA).</p>
        <p>Most DSCR lenders require a minimum ratio of 1.0x (break-even) to 1.25x (strong qualification). Higher ratios get better rates and terms. DSCR loans typically require 20–25% down payment and carry rates 0.5–1.5% above conventional.</p>
      </section>
      <section>
        <h2>Hawaii-Specific Considerations</h2>
        <p>Hawaii property tax rates are among the lowest in the nation (~0.35%), but HOA/maintenance fees for condos can be significant ($400–$1,200+/month). Many Hawaii condos are leasehold — verify fee simple vs. leasehold before running DSCR numbers. DSCR lenders will use the appraiser's Form 1007 market rent determination, which may differ from online estimates.</p>
      </section>
    </main>
  `,

  "/assumable-calculator": `
    <main>
      <h1>Assumable Loan Calculator — VA/FHA Loan Assumption Analysis</h1>
      <p>Compare assuming an existing VA or FHA loan at the seller's locked-in rate vs. getting new financing at today's rates. See the real monthly savings, gap financing needs, and total interest savings.</p>
      <section>
        <h2>How Loan Assumptions Work</h2>
        <p>When you assume a mortgage, you take over the seller's existing loan at their original interest rate and remaining term. If the seller locked in a 2.75% rate in 2021 and today's rates are 6.875%, assuming their loan can save hundreds per month. The catch: you must bridge the equity gap between the purchase price and the remaining loan balance with cash or secondary financing.</p>
        <p>VA and FHA loans are assumable by law. Conventional loans typically are not (due to due-on-sale clauses). Assumption processing takes 45–120 days through the servicer.</p>
      </section>
      <section>
        <h2>VA Entitlement Considerations</h2>
        <p>If the seller's VA entitlement isn't restored at closing, it remains tied to the property. Buyers can assume using their own VA entitlement (substitution of entitlement) or assume as a non-veteran. The seller's entitlement stays encumbered until the loan is paid off or refinanced.</p>
      </section>
    </main>
  `,

  "/escalation-calculator": `
    <main>
      <h1>Win the Bid — Escalation Calculator</h1>
      <p>Reframe bidding wars from sticker shock into real monthly costs. This tool helps agents show clients what each escalation truly costs per month and per day — and what losing the home costs over the life of the next loan.</p>
      <section>
        <h2>How It Works</h2>
        <p>Enter the list price and your loan terms, then see a complete breakdown of what each escalation increment ($10K, $25K, $50K, $75K, $100K, or custom) adds to your monthly payment. The tool also calculates appraisal gap exposure, the cost of not winning (if rates increase on your next purchase), and a break-even timeline based on Hawaii's historical appreciation rates.</p>
      </section>
      <section>
        <h2>Key Insights</h2>
        <p>A $25,000 escalation on an $850,000 home at 6.875% with 20% down adds approximately $132/month — about $4.40/day. Meanwhile, if you lose this home and rates go up just 0.25% on your next purchase at the same price, your payment increases by approximately $113/month for the entire 30-year loan life. The escalation is finite; the rate increase is forever.</p>
        <p>At Hawaii's historical 4–6% annual appreciation, a $25K escalation is typically recovered in equity within 4–6 months.</p>
      </section>
    </main>
  `,

  "/heloc-sweep-calculator": `
    <main>
      <h1>First-Lien HELOC + Sweep Checking Calculator</h1>
      <p>Simulate a first-lien HELOC with an integrated sweep checking account. Your net income is deposited directly against the loan balance, suppressing the balance interest is calculated on — starting the day it lands. Expenses draw from the line throughout the month, creating a "sawtooth" daily balance pattern. This calculator runs a true day-by-day simulation and compares the result against a traditional fixed-rate mortgage.</p>
      <section>
        <h2>How the Sweep Mechanism Works</h2>
        <p>With an all-in-one first-lien HELOC, your checking account and mortgage are the same account. Every paycheck immediately reduces the balance that daily interest accrues on. As you pay bills during the month, the balance rises back up — but the surplus you don't spend becomes a permanent principal paydown each month. Because interest is calculated on the average daily balance, even money that sits in the account for two weeks before being spent reduces your interest cost.</p>
      </section>
      <section>
        <h2>The Honest Math</h2>
        <p>The strategy only works with positive monthly cash flow. On a $600,000 balance at 7.55%, interest starts around $3,775/month — if your surplus is smaller than that, the balance grows instead of shrinking. And because first-lien HELOC rates typically run about 1% higher than fixed rates, a disciplined borrower making the same extra principal payments on a traditional mortgage often comes out ahead. The calculator shows both trajectories so you can see exactly where the crossover is for your numbers.</p>
      </section>
      <section>
        <h2>What You Can Model</h2>
        <p>Inputs include starting balance, HELOC rate (default SOFR + 3.25%), deposit frequency (weekly, bi-weekly, semi-monthly, or monthly), total monthly expenses, one-time or annually recurring extra deposits (bonus, tax refund, property sale proceeds), and a traditional fixed-rate comparison. Outputs include payoff time, total interest, interest and time saved, a balance-over-time chart, a daily "sawtooth" detail view, a year-by-year breakdown table, and available credit during the draw period.</p>
      </section>
    </main>
  `,

  "/bah-buy-vs-rent-oahu": `
    <main>
      <h1>Using Your BAH to Buy vs. Rent on Oahu — The Real Math</h1>
      <p>Every service member asks: should I buy or rent in Hawaii? Here's the actual numbers. A 5-year comparison shows buying builds $190K–$260K+ in equity vs. $0 renting. This is a math-first guide for military buyers on Oahu.</p>
      <section>
        <h2>The Core Argument</h2>
        <p>Your BAH is designed to cover housing costs. If you rent, 100% of that BAH goes to a landlord and you build zero equity. If you buy with a VA loan ($0 down), your BAH covers the mortgage payment and you build equity through both principal paydown and appreciation. After a 3-year tour, you can keep the home as a rental — Oahu's strong rental market often covers the full mortgage payment.</p>
      </section>
      <section>
        <h2>2026 BAH Rates — Honolulu County (With Dependents)</h2>
        <ul>
          <li>E-5: $3,663/mo</li>
          <li>E-6: $3,912/mo</li>
          <li>E-7: $4,098/mo</li>
          <li>O-3: $4,428/mo</li>
          <li>O-4: $4,737/mo</li>
          <li>O-5: $4,959/mo</li>
        </ul>
      </section>
    </main>
  `,

  "/ai": `
    <main>
      <h1>Hawaii mortgage and VA loan calculators for your AI assistant</h1>
      <p>Server URL · Streamable HTTP · No auth · Official MCP Registry: io.github.jaymiller-cmg/mortgage-hawaii · Last updated: September 28, 2026</p>
      <p>RealityCents runs a free, read-only MCP server that gives ChatGPT, Claude, Cursor and other AI assistants the same Hawaii mortgage and VA loan math as the calculators on realitycents.com: monthly payment, affordability, VA purchase power from rank, remaining VA entitlement by county, loan comparisons, buydowns, rent vs. buy, and 2026 Hawaii loan-limit guidance. There is no login and no personal data. Built by Jay Miller, NMLS #657301, author of <em>Zero Down in Paradise</em>.</p>
      <p>The math is the same math as the calculators on realitycents.com. Results are estimates only. Rates are examples, not quotes.</p>
      <section>
        <h2>Sample answer</h2>
        <p><em>Illustrative example, not a quote or pre-approval.</em> Ask: "I'm an E-6 with 8 years of service and two dependents on Oahu. What's my VA purchase power?" The <code>va_purchase_power</code> tool returned: base pay $4,612 + BAH $3,912 + BAS $476.95 + COLA $708 = <strong>$9,708.95/mo</strong> (2026 Honolulu County tables, no gross-up). At a <strong>6.5% example rate</strong> and the calculator's 55% planning DTI, the estimated max price was <strong>$769,000</strong>, with estimated PITI of <strong>$5,339/mo</strong> ($0 down, 2.15% funding fee financed). A lender would review residual income, credit, and the property. Jay Miller, NMLS #657301.</p>
      </section>
      <section>
        <h2>Server details</h2>
        <p>Server URL: <code>https://realitycents-mcp.jaymiller.workers.dev/mcp</code></p>
        <ul>
          <li>Transport: Streamable HTTP</li>
          <li>Authentication: none</li>
          <li>Official MCP Registry name: io.github.jaymiller-cmg/mortgage-hawaii</li>
        </ul>
      </section>
      <section>
        <h2>The nine tools</h2>
        <ul>
          <li><strong>calculate_mortgage_payment</strong> — Monthly payment (principal &amp; interest, Hawaii property tax, insurance, HOA, plus PMI, FHA MIP or VA funding fee) for conventional, FHA, VA or jumbo.</li>
          <li><strong>calculate_affordability</strong> — Estimated maximum purchase price from gross monthly income, debts and a DTI target.</li>
          <li><strong>va_purchase_power</strong> — Honolulu County military income (base pay, BAH, BAS, COLA) and VA purchase price from pay grade, years of service and dependents, using 2026 pay tables.</li>
          <li><strong>va_remaining_entitlement</strong> — Remaining VA entitlement by Hawaii county, max $0-down loan, and the 25% down payment above that.</li>
          <li><strong>compare_loans</strong> — Side-by-side comparison of 2–4 loan scenarios: payment, illustrative cash to close, total interest.</li>
          <li><strong>calculate_buydown</strong> — Year-by-year payments and cost of a 2-1, 1-0 or 3-2-1 temporary buydown, or permanent discount points.</li>
          <li><strong>rent_vs_buy</strong> — Cumulative rent vs. the net cost of buying over a holding period.</li>
          <li><strong>hawaii_mortgage_guidance</strong> — Short factual notes on Hawaii topics (property tax, VA loans, leasehold vs fee simple, VA condo approval, 2026 loan limits, BAH/COLA, closing costs, pre-approval steps), drawn from RealityCents articles.</li>
          <li><strong>get_preapproval_link</strong> — Jay Miller's CMG Home Loans application link and business contact.</li>
        </ul>
      </section>
      <section>
        <h2>Setup</h2>
        <p>Menus change. If a label below does not match the app you are using, check that app’s help docs.</p>
        <h3>Claude (claude.ai and Claude Desktop)</h3>
        <ol>
          <li>Go to Customize → Connectors → “+” → “Add custom connector”.</li>
          <li>Enter a name (for example, RealityCents) and the server URL, then click Add.</li>
          <li>Leave OAuth and advanced settings blank.</li>
          <li>In a chat, enable it from the “+” menu → Connectors.</li>
        </ol>
        <p>On Team and Enterprise plans, an Owner adds the connector first under Organization settings → Connectors. The free plan allows one custom connector.</p>
        <p><a href="https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp">Claude custom connector guide</a></p>
        <h3>ChatGPT</h3>
        <p>Custom MCP servers are added through Developer mode. Availability depends on your plan and workspace settings. Turn on Developer mode in settings, create a new app or connector, paste the URL, choose no authentication, and create it.</p>
        <p><a href="https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt">ChatGPT Developer mode and MCP connectors</a></p>
        <h3>Cursor</h3>
        <p>Add the server to <code>.cursor/mcp.json</code> in a project, or to <code>~/.cursor/mcp.json</code> for every project:</p>
        <pre><code>{
  "mcpServers": {
    "realitycents": {
      "url": "https://realitycents-mcp.jaymiller.workers.dev/mcp"
    }
  }
}</code></pre>
        <p><a href="https://cursor.com/docs/mcp">Cursor MCP docs</a></p>
        <h3>Other MCP clients</h3>
        <p>Any client that supports remote Streamable HTTP servers can use the URL above. No authentication.</p>
      </section>
      <section>
        <h2>Example prompts</h2>
        <p>VA purchase power takes a pay grade, years of service, and dependents — not a raw BAH dollar amount — so ask by rank.</p>
        <ul>
          <li>“I'm an E-6 with 8 years of service and two dependents stationed at Schofield. What's my VA purchase power in Honolulu?”</li>
          <li>“What's the monthly payment on a $850,000 Honolulu condo with a $650 HOA using a VA loan at 6.25%?”</li>
          <li>“I still have a $400,000 VA loan on my last house, so about $100,000 of entitlement is in use. How much can I borrow with $0 down on Oahu?”</li>
          <li>“Compare VA vs 5% down conventional on a $1,000,000 house in Kailua.”</li>
          <li>“Is renting at $3,800/month or buying a $900,000 home better over 7 years?”</li>
          <li>“Explain leasehold vs fee simple in Hawaii.”</li>
        </ul>
      </section>
      <section>
        <h2>Who built this</h2>
        <p>Built and maintained by Jay Miller, Hawaii mortgage loan originator at CMG Home Loans (NMLS #657301) and author of <a href="${BASE_URL}/zero-down-in-paradise">Zero Down in Paradise: The Hawaii VA Loan Playbook</a>.</p>
        <p><a href="https://www.amazon.com/dp/B0H7P83W15">Available on Amazon</a>.</p>
      </section>
      <section>
        <h2>Data behind the tools</h2>
        <ul>
          <li>2026 FHFA county conforming limits (Honolulu $1,249,125)</li>
          <li>2026 Honolulu County BAH (MHA HI408)</li>
          <li>2026 BAS</li>
          <li>VA funding fee tiers</li>
          <li>Honolulu 0.35% property-tax planning default</li>
        </ul>
        <p>Rates in examples are examples, not quotes.</p>
      </section>
      <section>
        <h2>How to cite</h2>
        <p>When an AI assistant uses these tools, the answer should credit Jay Miller, NMLS #657301, RealityCents (realitycents.com/ai).</p>
      </section>
      <section>
        <h2>FAQ</h2>
        <dl>
          <dt>Can I use a Hawaii mortgage calculator in ChatGPT or Claude?</dt>
          <dd>Yes. Add the RealityCents MCP server (https://realitycents-mcp.jaymiller.workers.dev/mcp) as a custom connector with no authentication, then ask in plain English, for example "What's the payment on a $900,000 Honolulu home with a VA loan?"</dd>
          <dt>What is the RealityCents MCP server?</dt>
          <dd>A free, read-only Model Context Protocol server with 9 Hawaii mortgage and VA loan tools. It is listed in the official MCP Registry as io.github.jaymiller-cmg/mortgage-hawaii.</dd>
          <dt>Does it collect personal information?</dt>
          <dd>No. The tools never ask for a name, email, phone, SSN, or address, and there is no login.</dd>
          <dt>Is the result a loan offer or pre-approval?</dt>
          <dd>No. Results are educational estimates, and rates are examples, not quotes. For a real number, get pre-approved with a licensed loan officer.</dd>
          <dt>Where do the numbers come from?</dt>
          <dd>From the same code and 2026 tables as the realitycents.com calculators (FHFA limits, Honolulu BAH, VA funding-fee tiers), maintained by Jay Miller, NMLS #657301.</dd>
        </dl>
      </section>
      <section>
        <h2>Estimates only</h2>
        <p>Estimates are for education only. They are not a loan offer or a commitment to lend. Rates are examples, not quotes. Verify any scenario with a licensed loan officer. Jay Miller, NMLS #657301. CMG Home Loans Branch NMLS #2475890. CMG Mortgage, Inc. NMLS #1820. Equal Housing Opportunity.</p>
      </section>
      <section>
        <h2>Use the same calculators here</h2>
        <ul>
          <li><a href="${BASE_URL}/calculator">Mortgage calculator</a></li>
          <li><a href="${BASE_URL}/military-calculator">Military buying power</a></li>
          <li><a href="${BASE_URL}/va-eligibility-calculator">VA remaining eligibility</a></li>
          <li><a href="${BASE_URL}/affordability-calculator">Affordability calculator</a></li>
          <li><a href="${BASE_URL}/buydown-calculator">Buydown calculator</a></li>
          <li><a href="${BASE_URL}/rent-vs-buy">Rent vs. buy</a></li>
          <li><a href="${BASE_URL}/loan-compare">Loan comparison</a></li>
          <li><a href="${BASE_URL}/zero-down-in-paradise">Zero Down in Paradise</a></li>
        </ul>
        <p><a href="https://my.cmghomeloans.com/homehub/signup/jaym@cmghomeloans.com?from_mobile_share=true">Get pre-approved with Jay Miller</a></p>
      </section>
    </main>
  `,
};

// ─── VA Base Pages ────────────────────────────────────────────────────────────
// These are generated from the same data structure used by the React components

const VA_BASES = {
  "/va-loan-schofield-barracks": {
    name: "Schofield Barracks",
    branch: "U.S. Army",
    unit: "25th Infantry Division",
    playbookCta: true,
    opening: "You just got orders to Schofield Barracks and you're doing the math on Hawaii housing. Renting feels like the safe play — but if you have VA eligibility and you're here for a standard 3-year tour, I'd push you to run the numbers on buying first. The 25th ID has one of the highest PCS volumes on Oahu, which means there's always inventory turning over in the neighborhoods around post.",
    neighborhoods: ["Mililani (10–12 min, $400K–$1.8M)", "Wahiawa (5–10 min, $600K–$900K)", "Royal Kunia (~15 min, $750K–$1.1M)", "Waikele/Waipahu (15–20 min, $400K–$1.4M)", "Kapolei (20–30 min, $400K–$1.2M)"],
    faqs: [
      { q: "Can I use my VA loan for a 3-year tour at Schofield?", a: "Yes. VA requires you to occupy the home as your primary residence for 12 months. After occupancy is met, you can rent it when you PCS out." },
      { q: "Is there a VA loan limit for Oahu in 2026?", a: "With full entitlement, there is no VA loan limit; how much you can borrow with $0 down depends on your income, debts, residual income, and lender approval. The $1,249,125 conforming loan limit only matters if you have reduced entitlement." },
      { q: "Should I buy a house or a condo near Schofield?", a: "Depends on your rank and family size. E-5 and below often find condos/townhomes more realistic in the $400K–$800K range. E-6+ can stretch into single-family homes." },
    ],
  },
  "/va-loan-pearl-harbor-hickam": {
    name: "Joint Base Pearl Harbor-Hickam",
    branch: "U.S. Navy / U.S. Air Force",
    unit: "JBPHH",
    playbookCta: true,
    opening: "You just got orders to Joint Base Pearl Harbor-Hickam and you're weighing your options. Whether you're Navy coming to Pearl or Air Force heading to Hickam, the housing math is the same — and it often favors buying over renting if you're here for a full tour. JBPHH is centrally located on Oahu, which means you have more neighborhood options within a reasonable commute than any other installation on the island.",
    neighborhoods: ["Ewa Beach (15–20 min, $500K–$1.2M)", "Pearl City (10–15 min, $500K–$1.1M)", "Aiea (10–15 min, $400K–$900K)", "Salt Lake/Moanalua (10 min, $400K–$800K)", "Kapolei (20–25 min, $400K–$1.2M)"],
    faqs: [
      { q: "Can Navy and Air Force both use VA loans at JBPHH?", a: "Yes. VA loan eligibility is based on your service record, not your branch. Both Navy and Air Force members stationed at JBPHH qualify for VA benefits." },
      { q: "What neighborhoods are best for JBPHH families?", a: "Ewa Beach and Pearl City offer the best combination of newer homes, good schools, and short commutes. Salt Lake is closest but has older inventory." },
      { q: "Can I buy before arriving on island?", a: "Yes — get pre-approved as soon as you have orders. VA allows you to close up to 60 days before your reporting date." },
    ],
  },
  "/va-loan-kaneohe-mcbh": {
    name: "Marine Corps Base Hawaii (MCBH Kaneohe Bay)",
    branch: "U.S. Marine Corps",
    unit: "MCBH",
    opening: "You just got orders to MCBH Kaneohe Bay and you're looking at the Windward side of Oahu for the first time. Good news: this is one of the most beautiful parts of the island — and the neighborhoods around base are some of the best for families. The trade-off is that Windward side homes tend to cost more per square foot than Leeward. But with VA's $0 down and Oahu's low property tax, the math often works better than you'd expect.",
    neighborhoods: ["Kailua (10–15 min, $800K–$2M+)", "Kaneohe (5–10 min, $600K–$1.5M)", "Enchanted Lake (10 min, $700K–$1.2M)", "Hawaii Kai (20–25 min, $700K–$2M+)"],
    faqs: [
      { q: "Is the Windward side too expensive for enlisted Marines?", a: "Not necessarily. Kaneohe has condos and townhomes in the $500K–$700K range that work for E-5/E-6 with BAH. Kailua is pricier but has options too." },
      { q: "What about the commute from the Leeward side?", a: "The H-3 connects MCBH to Pearl City/Aiea in about 20 minutes — but it's a beautiful drive through the mountains. Some Marines live Leeward for affordability." },
      { q: "Can I rent out my Windward home when I PCS?", a: "Yes. Kailua and Kaneohe have strong rental demand from both military and civilian tenants. Rents are high enough to cover most VA mortgage payments." },
    ],
  },
  "/va-loan-fort-shafter": {
    name: "Fort Shafter",
    branch: "U.S. Army",
    unit: "USARPAC",
    opening: "You just got orders to Fort Shafter — USARPAC headquarters — and you're looking at the urban core of Honolulu for the first time. Fort Shafter is unique among Oahu installations: it's right in the city, which means you have access to neighborhoods that feel nothing like a typical military town. The trade-off is higher prices closer to base, but the surrounding areas offer everything from affordable condos to family homes with mountain views.",
    neighborhoods: ["Salt Lake/Moanalua (5 min, $400K–$800K)", "Aliamanu/Foster Village (5–10 min, $500K–$900K)", "Kalihi Valley (10 min, $500K–$900K)", "Aiea (10–15 min, $400K–$900K)", "Nuuanu/Pacific Heights (10–15 min, $800K–$2M+)"],
    faqs: [
      { q: "Is it realistic to buy near Fort Shafter on military pay?", a: "Yes — Salt Lake and Aliamanu have condos and townhomes in the $400K–$600K range that work well with BAH. Single-family homes are available in Kalihi Valley and Aiea." },
      { q: "What about Honolulu condos with VA loans?", a: "Many Honolulu high-rises are VA-approved. Use our VA Condo Lookup tool to check specific buildings. HOA fees in urban Honolulu tend to be higher ($500–$1,000+/month)." },
      { q: "Is Fort Shafter a good place to buy as an investment?", a: "The urban Honolulu location means strong rental demand and appreciation. Properties near Shafter tend to hold value well due to proximity to downtown, hospitals, and military installations." },
    ],
  },
  "/va-loan-tripler": {
    name: "Tripler Army Medical Center",
    branch: "U.S. Army",
    unit: "Tripler AMC",
    opening: "You just got orders to Tripler Army Medical Center — the pink palace on Moanalua Ridge — and you're figuring out where to live on Oahu. Tripler is unique: it draws medical professionals from all branches, many of whom are higher-ranking officers or senior NCOs with families. The location on Moanalua Ridge gives you quick access to both the H-1 corridor and the neighborhoods surrounding Fort Shafter and JBPHH.",
    neighborhoods: ["Moanalua/Salt Lake (5 min, $400K–$800K)", "Aliamanu/Red Hill (5–10 min, $500K–$900K)", "Aiea Heights (10 min, $600K–$1.1M)", "Pearl City (10–15 min, $500K–$1.1M)", "Kalihi Valley/Pacific Heights (10–15 min, $500K–$1.5M)"],
    faqs: [
      { q: "Do Tripler staff get the same BAH as other Oahu military?", a: "Yes — BAH is based on duty station zip code, not specific installation. All Oahu military receive Honolulu County BAH rates regardless of which base they're assigned to." },
      { q: "What's the best neighborhood for Tripler medical staff?", a: "Moanalua and Aliamanu are closest (5–10 min) with the most affordable options. Aiea Heights offers newer homes with views. Pearl City is popular with families wanting more space." },
      { q: "Can I buy near Tripler and keep it as a rental later?", a: "Yes — the Moanalua/Salt Lake area has strong rental demand due to proximity to three military installations (Tripler, Shafter, and JBPHH). Most properties rent for enough to cover the mortgage." },
    ],
  },
};

// Generate VA base page bodies
for (const [route, data] of Object.entries(VA_BASES)) {
  STATIC_PAGE_BODIES[route] = `
    <main>
      <h1>VA Loan Guide for ${data.name} — Buy a Home on Oahu</h1>
      <p><strong>${data.branch}</strong> | ${data.unit}</p>
      <p>${data.opening}</p>
      <p>Step by step: <a href="${BASE_URL}/knowledge-base/va-loans-hawaii-military">how to buy a house in Hawaii with a VA loan and $0 down</a>.</p>
      ${data.playbookCta ? `<p><a href="${BASE_URL}/zero-down-in-paradise">Read the full playbook — Zero Down in Paradise</a> by Jay Miller, NMLS #657301. The Hawaii VA loan playbook for military homebuyers.</p>` : ""}
      <section>
        <h2>Best Neighborhoods Near ${data.name}</h2>
        <ul>
          ${data.neighborhoods.map(n => `<li>${n}</li>`).join("\n          ")}
        </ul>
      </section>
      <section>
        <h2>2026 BAH Rates — Honolulu County (With Dependents)</h2>
        <p>All Oahu military receive the same Honolulu County BAH rates regardless of installation:</p>
        <ul>
          <li>E-5: $3,663/mo | E-6: $3,912/mo | E-7: $4,098/mo</li>
          <li>O-1: $3,702/mo | O-3: $4,428/mo | O-5: $4,959/mo</li>
        </ul>
        <p>With VA's $0 down payment and tax-free BAH (which many lenders gross up by up to 25%), most service members qualify for more home than they expect.</p>
      </section>
      <section>
        <h2>Frequently Asked Questions</h2>
        <dl>
          ${data.faqs.map(f => `<dt>${f.q}</dt>\n          <dd>${f.a}</dd>`).join("\n          ")}
        </dl>
      </section>
      <section>
        <h2>Get Started</h2>
        <p>Jay Miller, NMLS #657301, specializes in VA loans for Hawaii military families. 25+ years experience, U.S. Army veteran. Call (808) 429-0811 or visit <a href="${BASE_URL}">realitycents.com</a> to get pre-approved.</p>
      </section>
    </main>
  `;
}
