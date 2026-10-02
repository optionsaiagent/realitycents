/*
 * Pacific Modernism — BAH Buy vs Rent Oahu Page
 * Math-first comparison: 5-year equity build for service members
 * Uses same purchase prices as installation pages for consistency
 */
import { Link } from "wouter";
import Layout from "@/components/Layout";
import PCSCallout from "@/components/PCSCallout";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import { LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import { getBAH, type PayGrade } from "@/lib/militaryPayData";
import {
  DEFAULT_PROPERTY_TAX_RATE,
  buildAmortization,
  defaultMonthlyPropertyTax,
  monthlyPI,
  vaFundingFeeRate,
} from "@/lib/loanMath";
import ContactActions from "@/components/ContactActions";
import EmailResults from "@/components/EmailResults";
import { ArrowRight, DollarSign, Home as HomeIcon, TrendingUp, MapPin, Calculator } from "lucide-react";

const COMPARE_RANKS: PayGrade[] = [
  "E-5", "E-6", "E-7", "E-8", "E-9",
  "W-1", "W-2", "W-3", "W-4", "W-5",
  "O-1", "O-2", "O-3", "O-4", "O-5", "O-6",
];
const COMPARE_RATE = 5.75;
const COMPARE_INSURANCE = 200;
const COMPARE_YEARS = 5;
const COMPARE_APPRECIATION = 0.045;
const COMPARE_SELL_COST = 0.06;
const COMPARE_FEE_PCT = vaFundingFeeRate(0, true, false);

function priceForBah(bah: number): number {
  const feeMult = 1 + COMPARE_FEE_PCT / 100;
  const perDollar = monthlyPI(1, COMPARE_RATE, 30);
  const taxPerDollar = (DEFAULT_PROPERTY_TAX_RATE / 100) / 12;
  const price = (bah - COMPARE_INSURANCE) / (feeMult * perDollar + taxPerDollar);
  return Math.max(0, Math.round(price / 1000) * 1000);
}

const BAH_DATA = COMPARE_RANKS.map((rank) => {
  const bah = getBAH(rank, true);
  const rent = Math.round(bah * 0.9);
  const purchasePrice = priceForBah(bah);
  const loan = purchasePrice * (1 + COMPARE_FEE_PCT / 100);
  const pi = monthlyPI(loan, COMPARE_RATE, 30);
  const piti = Math.round(pi + defaultMonthlyPropertyTax(purchasePrice) + COMPARE_INSURANCE);
  const principalPaid = Math.round(
    buildAmortization(loan, COMPARE_RATE, 30)
      .slice(0, COMPARE_YEARS)
      .reduce((sum, row) => sum + row.totalPrincipal, 0)
  );
  const futureValue = purchasePrice * Math.pow(1 + COMPARE_APPRECIATION, COMPARE_YEARS);
  const appreciation = Math.round(futureValue - purchasePrice);
  const netEquity = Math.round(principalPaid + appreciation - COMPARE_SELL_COST * futureValue);
  return {
    rank,
    bah,
    rent,
    purchasePrice,
    piti,
    totalRent: rent * 12 * COMPARE_YEARS,
    principalPaid,
    appreciation,
    netEquity,
  };
});

const equityLow = Math.min(...BAH_DATA.map((row) => row.netEquity));
const equityHigh = Math.max(...BAH_DATA.map((row) => row.netEquity));
const equitySpan = `$${Math.round(equityLow / 1000)}K–$${Math.round(equityHigh / 1000)}K`;
const o3Example = BAH_DATA.find((row) => row.rank === "O-3") ?? BAH_DATA[0];

const HIDDEN_ADVANTAGES = [
  {
    title: "Tax-Free Equity Building",
    description: "BAH is tax-free. When you use it for a mortgage, you're building equity with dollars that don't count as taxable income. That's a huge advantage over renting.",
  },
  {
    title: "Low Property Tax Rate",
    description: `At ${DEFAULT_PROPERTY_TAX_RATE}%, Honolulu County's rate is among the lowest in the nation. More of your payment goes to principal, not taxes.`,
  },
  {
    title: "Leverage with $0 Down",
    description: "VA loan = $0 down. Your entire return (principal + appreciation) is leveraged. You're building equity on a property worth 10x your down payment.",
  },
  {
    title: "Keep It as a Rental When You PCS",
    description: "After 12 months of occupancy, you can convert to a rental when you PCS. Be realistic: with 100% financing, rent likely won't cover your full PITI — but someone else is paying down most of your mortgage while you continue building equity and appreciation long-term.",
  },
  {
    title: "Capital Gains Exclusion",
    description: "If you've lived in the home 2 of the last 5 years, you can exclude up to $250K in capital gains from federal taxes (married couples: $500K). That appreciation — mostly tax-free.",
  },
];

const FAQS = [
  {
    q: "Can I use my BAH as qualifying income for a VA loan?",
    a: "Yes. VA allows BAH to be used as qualifying income. Since BAH is tax-free, many lenders gross it up by up to 25% (lender policy) for qualification purposes, which increases your buying power. Ask your lender about this; it often makes a big difference.",
  },
  {
    q: "What if my BAH doesn't cover the full mortgage payment?",
    a: "You make up the difference from your base pay. But here's the thing: your base pay is also tax-free for BAH purposes, and you have other income sources (spouse's income, bonuses, etc.). The math usually works out better than renting when you factor in the full picture.",
  },
  {
    q: "Can I rent out my home when I PCS?",
    a: "Yes. VA requires you to occupy the home as your primary residence for 12 months — your intent must be to live there at purchase. After 12 months, you can convert to a rental. Be realistic though: with 100% financing, Oahu rents typically cover 80–90% of your PITI, not all of it. You'll likely have a small monthly gap. But someone else is paying down most of your mortgage, and you keep the appreciation and equity buildup. Over time, rents rise and the gap closes.",
  },
  {
    q: "How does the VA funding fee affect the math?",
    a: `The VA funding fee (${COMPARE_FEE_PCT}% for first-time users with less than 5% down) is financed into the loan, so it increases your loan amount slightly. But it's still a better deal than PMI on a conventional loan. The 5-year comparison above includes the funding fee, so the numbers are realistic.`,
  },
  {
    q: "How do I start the process before I arrive on island?",
    a: "Get pre-approved as soon as you have orders in hand. You can tour homes virtually, go under contract, and even close before you arrive. VA allows you to close up to 60 days before your reporting date. I work with PCS'ing families remotely all the time — let's get you started.",
  },
];

const INSTALLATION_LINKS = [
  { name: "Schofield Barracks", href: "/va-loan-schofield-barracks", desc: "Army, 25th Infantry Division" },
  { name: "Pearl Harbor-Hickam", href: "/va-loan-pearl-harbor-hickam", desc: "Navy / Air Force, JBPHH" },
  { name: "Kaneohe MCBH", href: "/va-loan-kaneohe-mcbh", desc: "Marines, Windward side" },
  { name: "Fort Shafter", href: "/va-loan-fort-shafter", desc: "Army, USARPAC headquarters" },
  { name: "Tripler AMC", href: "/va-loan-tripler", desc: "Army Medical Center" },
];

export default function BAHBuyVsRent() {
  return (
    <Layout>
      <SEO
        title="Using Your BAH to Buy vs. Rent on Oahu — The Real Math | RealityCents"
        description={`Every service member asks: should I buy or rent in Hawaii? Here's the actual numbers. 5-year comparison shows buying builds ${equitySpan} in equity vs. $0 renting. Full rank-by-rank breakdown for military buyers.`}
        keywords="BAH buy vs rent Oahu, should I buy or rent Hawaii military, using BAH for mortgage Hawaii, military home buying Oahu, VA loan buy vs rent"
        url="https://realitycents.com/bah-buy-vs-rent-oahu"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-teal rounded-full blur-3xl"></div>
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Using Your BAH to Buy vs. Rent on Oahu — The Real Math
            </h1>
            <p className="text-xl text-slate-200 mb-8 leading-relaxed">
              You just got orders to Oahu and everyone has an opinion on whether you should buy or rent. Here's what the actual numbers say. Spoiler: buying usually wins, and it's not even close.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={PRE_APPROVAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Start Your Pre-Approval
                <ArrowRight size={20} />
              </a>
              <a href="/rent-vs-buy" className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                <Calculator size={20} />
                Rent vs. Buy Calculator
              </a>
            </div>
          </div>
        </div>
      </section>

      <PCSCallout />

      {/* Side-by-Side Comparison Table */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <SectionHeading
            title="The Side-by-Side — Renting vs. Buying by Rank"
            description="5-Year Comparison (2026 Honolulu County, 5.75% rate, 4.5% annual appreciation)"
            centered={false}
          />

          <p className="text-slate-700 mb-8 leading-relaxed max-w-3xl">
            Purchase prices match our <Link href="/va-loan-schofield-barracks" className="text-teal underline">installation-specific guides</Link> where PITI equals approximately 100% of BAH with dependents. Rent estimates reflect typical Oahu market rates at roughly 90% of BAH. Oahu's housing market has appreciated at 4–5% annually over the long term — we use 4.5% here. Want to plug in your own numbers? Use our <Link href="/rent-vs-buy" className="text-teal underline">Rent vs. Buy Calculator</Link>.
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50">
                  <th className="text-left py-4 px-4 font-bold text-slate-900">Rank</th>
                  <th className="text-right py-4 px-4 font-bold text-slate-900">BAH/mo</th>
                  <th className="text-right py-4 px-4 font-bold text-slate-900">Rent/mo</th>
                  <th className="text-right py-4 px-4 font-bold text-slate-900">Purchase Price</th>
                  <th className="text-right py-4 px-4 font-bold text-slate-900">PITI/mo</th>
                  <th className="text-right py-4 px-4 font-bold text-slate-900">5-Yr Rent Paid</th>
                  <th className="text-right py-4 px-4 font-bold text-slate-900">5-Yr Equity Built</th>
                </tr>
              </thead>
              <tbody>
                {BAH_DATA.map((row, idx) => (
                  <tr key={idx} className={`border-b border-slate-200 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="py-4 px-4 font-semibold text-slate-900">{row.rank}</td>
                    <td className="text-right py-4 px-4 text-slate-700">${row.bah.toLocaleString()}</td>
                    <td className="text-right py-4 px-4 text-slate-700">${row.rent.toLocaleString()}</td>
                    <td className="text-right py-4 px-4 text-slate-700">${row.purchasePrice.toLocaleString()}</td>
                    <td className="text-right py-4 px-4 text-slate-700">${row.piti.toLocaleString()}</td>
                    <td className="text-right py-4 px-4 text-red-600 font-semibold">${row.totalRent.toLocaleString()}</td>
                    <td className="text-right py-4 px-4 text-teal font-bold">${row.netEquity.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Estimates assume {COMPARE_RATE}% rate, VA funding fee financed ({COMPARE_FEE_PCT}% first use, $0 down), Honolulu County property tax {DEFAULT_PROPERTY_TAX_RATE}%, ${COMPARE_INSURANCE}/mo insurance, single family home. Rent is about 90% of BAH. Not a rate quote. Equity = 5-year principal paydown + 4.5% appreciation, minus 6% selling costs on the appreciated value.
          </p>

          <div className="mt-8 p-6 bg-teal/10 border border-teal/30 rounded-lg">
            <p className="text-slate-800">
              <strong>Bottom line:</strong> Over 5 years, buying puts you <strong>{equitySpan} ahead</strong> compared to renting. That's principal paydown + appreciation at 4.5% annually, minus selling costs. And that's assuming you sell — if you keep the property as a rental, you continue building equity long-term (though expect a small monthly gap between rent and your PITI with 100% financing).
            </p>
          </div>

          {/* Calculator CTA */}
          <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 mb-1">Want to run your own scenario?</h4>
              <p className="text-slate-600 text-sm">Plug in your specific numbers — purchase price, rent, time horizon — and see the comparison for your situation.</p>
            </div>
            <Link href="/rent-vs-buy">
              <a className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap">
                <Calculator size={18} />
                Rent vs. Buy Calculator
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* 5-Year Equity Build Breakdown */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container">
          <SectionHeading
            title="The 5-Year Equity Build — Where Your Money Goes"
            description={`Example: O-3 buying a $${Math.round(o3Example.purchasePrice / 1000)}K home near base`}
            centered={false}
          />

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-teal" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Principal Paid Down</h3>
              </div>
              <p className="text-4xl font-bold text-teal mb-2">${o3Example.principalPaid.toLocaleString()}</p>
              <p className="text-slate-600">You own this much more of the home after 5 years of mortgage payments.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-gold" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Appreciation (4.5%/yr)</h3>
              </div>
              <p className="text-4xl font-bold text-gold mb-2">${o3Example.appreciation.toLocaleString()}</p>
              <p className="text-slate-600">Based on Oahu's long-term trend of 4–5% annual appreciation.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <HomeIcon className="text-emerald-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Total Equity After Sale</h3>
              </div>
              <p className="text-4xl font-bold text-emerald-600 mb-2">${o3Example.netEquity.toLocaleString()}</p>
              <p className="text-slate-600">After 6% selling costs. That's what you walk away with.</p>
            </div>
          </div>

          <div className="mt-12 p-8 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-bold text-slate-900 mb-4">Compare to renting the same 5 years:</h4>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-slate-600 mb-2">Total rent paid:</p>
                <p className="text-3xl font-bold text-red-600">${o3Example.totalRent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-2">Equity at end:</p>
                <p className="text-3xl font-bold text-slate-400">$0</p>
              </div>
            </div>
            <p className="mt-6 text-slate-700">
              <strong>The difference:</strong> Buying leaves you ${o3Example.netEquity.toLocaleString()} ahead. That's not just a number — that's a down payment on your next home, a college fund, or retirement savings.
            </p>
          </div>
        </div>
      </section>

      {/* Hidden Advantages */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <SectionHeading title="The Hidden Advantages of Buying" description="Why the math is even better than it looks" centered={false} />

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {HIDDEN_ADVANTAGES.map((adv, idx) => (
              <div key={idx} className="p-8 bg-slate-50 rounded-lg border border-slate-200 hover:border-teal/50 transition">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{adv.title}</h3>
                <p className="text-slate-700 leading-relaxed">{adv.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When Renting Makes Sense */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container">
          <SectionHeading title="When Renting Actually Makes More Sense" centered={false} />

          <div className="mt-12 max-w-3xl mx-auto bg-white p-8 rounded-lg border border-slate-200">
            <p className="text-slate-700 mb-6 leading-relaxed">
              I'm not going to tell you buying is always the right move. Here's when renting might actually be smarter:
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="text-teal font-bold flex-shrink-0">&bull;</span>
                <span className="text-slate-700">
                  <strong>Short tour (under 3 years):</strong> The transaction costs of buying and selling eat into your equity. You generally need 3–4 years minimum to break even after closing costs and selling expenses. Most Hawaii tours are 3+ years, which is why buying usually works.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-teal font-bold flex-shrink-0">&bull;</span>
                <span className="text-slate-700">
                  <strong>High debt load:</strong> If you're carrying significant credit card or student loan debt, your debt-to-income ratio might limit your purchase power. Sometimes renting and paying down debt is the smarter play.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-teal font-bold flex-shrink-0">&bull;</span>
                <span className="text-slate-700">
                  <strong>Uncertainty about staying in:</strong> If you're thinking about separating or retiring soon, the commitment of homeownership might not make sense. But if you're planning to stay 5+ years? Buy.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-teal font-bold flex-shrink-0">&bull;</span>
                <span className="text-slate-700">
                  <strong>Market timing concerns:</strong> Some people worry about buying at a "peak." Oahu's market has appreciated at 4–5% annually for decades. Trying to time the market usually costs you more than just buying and holding.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Installation Breakdown */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <SectionHeading title="The Installation Breakdown" description="What's realistic near each base" centered={false} />

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {INSTALLATION_LINKS.map((inst, idx) => (
              <Link key={idx} href={inst.href}>
                <a className="block p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg hover:border-teal hover:shadow-lg transition cursor-pointer">
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <MapPin size={18} className="text-teal" />
                    {inst.name}
                  </h3>
                  <p className="text-slate-600 text-sm">{inst.desc}</p>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container">
          <SectionHeading title="Common Questions" centered={false} />

          <div className="mt-12 space-y-6 max-w-3xl mx-auto">
            {FAQS.map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-lg border border-slate-200 p-6 cursor-pointer hover:border-teal/50 transition">
                <summary className="flex items-start gap-4 font-semibold text-slate-900">
                  <span className="text-teal flex-shrink-0 mt-1">Q.</span>
                  <span>{faq.q}</span>
                </summary>
                <div className="mt-4 ml-8 text-slate-700 leading-relaxed">
                  <p className="text-slate-600 mb-2">
                    <span className="text-teal font-semibold">A.</span> {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Email Results */}
      <section className="py-8">
        <div className="container max-w-3xl">
          <EmailResults calculator="bah-buy-vs-rent" />
        </div>
      </section>

      {/* CTA */}
      <ContactActions
        variant="full"
        headline="Ready to Run Your Numbers?"
        subtext="Send me your orders, your rank, and whether you have dependents. I’ll put together a real pre-approval scenario — usually same day — so you know exactly what you’re working with before you start touring homes."
        preApprovalLabel="Start Your Pre-Approval"
        showNmls
      />
    </Layout>
  );
}
