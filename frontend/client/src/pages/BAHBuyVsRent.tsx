/*
 * Pacific Modernism — BAH Buy vs Rent Oahu Page
 * Math-first comparison: 5-year equity build for service members
 * Uses same purchase prices as installation pages for consistency
 */
import { Link } from "wouter";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";
import { LENDER, PRE_APPROVAL_URL } from "@/lib/constants";
import EmailResults from "@/components/EmailResults";
import { Phone, Mail, ArrowRight, DollarSign, Home as HomeIcon, TrendingUp, MapPin, Calculator } from "lucide-react";

const BAH_DATA = [
  { rank: "E-5", bah: 3663, rent: 3300, purchasePrice: 555000, piti: 3652, totalRent: 198000, principalPaid: 41034, appreciation: 136631, netEquity: 124234 },
  { rank: "E-6", bah: 3861, rent: 3450, purchasePrice: 590000, piti: 3870, totalRent: 207000, principalPaid: 43621, appreciation: 145247, netEquity: 132069 },
  { rank: "E-7", bah: 4098, rent: 3700, purchasePrice: 625000, piti: 4087, totalRent: 222000, principalPaid: 46209, appreciation: 153864, netEquity: 139903 },
  { rank: "E-8", bah: 4302, rent: 3850, purchasePrice: 660000, piti: 4305, totalRent: 231000, principalPaid: 48797, appreciation: 162480, netEquity: 147738 },
  { rank: "E-9", bah: 4518, rent: 4050, purchasePrice: 695000, piti: 4523, totalRent: 243000, principalPaid: 51384, appreciation: 171096, netEquity: 155572 },
  { rank: "W-1", bah: 3930, rent: 3550, purchasePrice: 600000, piti: 3932, totalRent: 213000, principalPaid: 44361, appreciation: 147709, netEquity: 134307 },
  { rank: "W-2", bah: 4182, rent: 3750, purchasePrice: 640000, piti: 4180, totalRent: 225000, principalPaid: 47318, appreciation: 157556, netEquity: 143261 },
  { rank: "W-3", bah: 4434, rent: 4000, purchasePrice: 680000, piti: 4429, totalRent: 240000, principalPaid: 50275, appreciation: 167404, netEquity: 152215 },
  { rank: "W-4", bah: 4551, rent: 4100, purchasePrice: 700000, piti: 4554, totalRent: 246000, principalPaid: 51754, appreciation: 172327, netEquity: 156692 },
  { rank: "W-5", bah: 4692, rent: 4200, purchasePrice: 720000, piti: 4678, totalRent: 252000, principalPaid: 53233, appreciation: 177251, netEquity: 161169 },
  { rank: "O-1", bah: 3702, rent: 3350, purchasePrice: 565000, piti: 3714, totalRent: 201000, principalPaid: 41773, appreciation: 139093, netEquity: 126473 },
  { rank: "O-2", bah: 3909, rent: 3500, purchasePrice: 595000, piti: 3901, totalRent: 210000, principalPaid: 43991, appreciation: 146478, netEquity: 133188 },
  { rank: "O-3", bah: 4434, rent: 4000, purchasePrice: 680000, piti: 4429, totalRent: 240000, principalPaid: 50275, appreciation: 167404, netEquity: 152215 },
  { rank: "O-4", bah: 4719, rent: 4250, purchasePrice: 725000, piti: 4709, totalRent: 255000, principalPaid: 53602, appreciation: 178482, netEquity: 162288 },
  { rank: "O-5", bah: 4959, rent: 4450, purchasePrice: 765000, piti: 4958, totalRent: 267000, principalPaid: 56560, appreciation: 188329, netEquity: 171242 },
  { rank: "O-6", bah: 5001, rent: 4500, purchasePrice: 770000, piti: 4989, totalRent: 270000, principalPaid: 56929, appreciation: 189560, netEquity: 172361 },
];

const HIDDEN_ADVANTAGES = [
  {
    title: "Tax-Free Equity Building",
    description: "BAH is tax-free. When you use it for a mortgage, you're building equity with dollars that don't count as taxable income. That's a huge advantage over renting.",
  },
  {
    title: "Hawaii's Lowest Property Tax Rate",
    description: "At 0.31%, Honolulu County has the lowest property tax rate in the country. More of your payment goes to principal, not taxes.",
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
    a: "Yes. VA allows BAH to be used as qualifying income. Since BAH is tax-free, most lenders can gross it up by 25% for qualification purposes, which increases your buying power. Ask your lender about this — it often makes a big difference.",
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
    a: "The VA funding fee (2.15% for first-time users) is financed into the loan, so it increases your loan amount slightly. But it's still a better deal than PMI on a conventional loan. The 5-year comparison above includes the funding fee, so the numbers are realistic.",
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
        description="Every service member asks: should I buy or rent in Hawaii? Here's the actual numbers. 5-year comparison shows buying builds $124K–$172K+ in equity vs. $0 renting. Full rank-by-rank breakdown for military buyers."
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
            Estimates assume 5.75% rate, VA funding fee financed (2.15%), Honolulu County property tax 0.31%, $200/mo insurance, single family home. Not a rate quote. Equity = principal paydown + appreciation, minus 6% selling costs.
          </p>

          <div className="mt-8 p-6 bg-teal/10 border border-teal/30 rounded-lg">
            <p className="text-slate-800">
              <strong>Bottom line:</strong> Over 5 years, buying puts you <strong>$124K–$172K+ ahead</strong> compared to renting. That's principal paydown + appreciation at 4.5% annually, minus selling costs. And that's assuming you sell — if you keep the property as a rental, you continue building equity long-term (though expect a small monthly gap between rent and your PITI with 100% financing).
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
            description="Example: O-3 buying a $680K home near base"
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
              <p className="text-4xl font-bold text-teal mb-2">$50,275</p>
              <p className="text-slate-600">You own this much more of the home after 5 years of mortgage payments.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-gold" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Appreciation (4.5%/yr)</h3>
              </div>
              <p className="text-4xl font-bold text-gold mb-2">$167,404</p>
              <p className="text-slate-600">Based on Oahu's long-term trend of 4–5% annual appreciation.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <HomeIcon className="text-emerald-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Total Equity After Sale</h3>
              </div>
              <p className="text-4xl font-bold text-emerald-600 mb-2">$152,215</p>
              <p className="text-slate-600">After 6% selling costs. That's what you walk away with.</p>
            </div>
          </div>

          <div className="mt-12 p-8 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-bold text-slate-900 mb-4">Compare to renting the same 5 years:</h4>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-slate-600 mb-2">Total rent paid:</p>
                <p className="text-3xl font-bold text-red-600">$240,000</p>
              </div>
              <div>
                <p className="text-slate-600 mb-2">Equity at end:</p>
                <p className="text-3xl font-bold text-slate-400">$0</p>
              </div>
            </div>
            <p className="mt-6 text-slate-700">
              <strong>The difference:</strong> Buying leaves you $152,215 ahead. That's not just a number — that's a down payment on your next home, a college fund, or retirement savings.
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-teal to-teal-dark text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Run Your Numbers?</h2>
            <p className="text-lg text-teal-100 mb-8 leading-relaxed">
              Send me your orders, your rank, and whether you have dependents. I'll put together a real pre-approval scenario — usually same day — so you know exactly what you're working with before you start touring homes.
            </p>

            <div className="bg-white/10 backdrop-blur p-8 rounded-lg border border-white/20 mb-8">
              <p className="text-teal-100 mb-4">
                <strong>{LENDER.name}</strong> | NMLS #{LENDER.nmls}
              </p>
              <p className="text-sm text-teal-100 mb-6">Army veteran, 25 years doing VA loans on Oahu</p>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <a href={`tel:${LENDER.phone}`} className="inline-flex items-center justify-center gap-2 bg-white text-teal hover:bg-slate-100 px-6 py-3 rounded-lg font-semibold transition">
                  <Phone size={20} />
                  {LENDER.phone}
                </a>
                <a href={`mailto:${LENDER.email}`} className="inline-flex items-center justify-center gap-2 bg-white text-teal hover:bg-slate-100 px-6 py-3 rounded-lg font-semibold transition">
                  <Mail size={20} />
                  {LENDER.email}
                </a>
              </div>
            </div>

            <a href={PRE_APPROVAL_URL} className="inline-flex items-center gap-2 bg-white text-teal hover:bg-slate-100 px-8 py-4 rounded-lg font-bold text-lg transition">
              Start Your Pre-Approval
              <ArrowRight size={24} />
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
