/*
 * Pacific Modernism — VA-Approved Condos on Oahu
 * Searchable, filterable directory of 1,381 VA-approved condo projects
 * Data sourced from VA LGY Hub (lgy.va.gov)
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES } from "@/lib/constants";
import ContactActions from "@/components/ContactActions";
import condoData from "@/data/va-approved-condos-oahu.json";
import {
  Search,
  Filter,
  MapPin,
  Shield,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Building2,
} from "lucide-react";

type Condo = (typeof condoData.condos)[number];

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof ShieldCheck }> = {
  "Accepted Without Conditions": {
    label: "Approved",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: ShieldCheck,
  },
  "Accepted With Conditions": {
    label: "Conditional",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Shield,
  },
};

// Merge some small neighborhoods for cleaner filtering
const NEIGHBORHOOD_GROUPS: Record<string, string> = {
  "Downtown/Kakaako": "Downtown / Kakaako",
  "Kakaako/Ala Moana": "Kakaako / Ala Moana",
  "Kaimuki/Kapahulu": "Kaimuki / Kapahulu",
  "Kalihi/Liliha": "Kalihi / Liliha",
  "Kalihi/Mapunapuna": "Kalihi / Mapunapuna",
  "Manoa/Moiliili": "Manoa / Moiliili",
  "McCully/Moiliili": "McCully / Moiliili",
  "Salt Lake/Moanalua": "Salt Lake / Moanalua",
};

function getDisplayNeighborhood(n: string) {
  return NEIGHBORHOOD_GROUPS[n] || n;
}

const ITEMS_PER_PAGE = 50;

export default function VAApprovedCondos() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "neighborhood" | "reviewDate" | "status">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Build neighborhood options from data
  const neighborhoodOptions = useMemo(() => {
    const counts = new Map<string, number>();
    condoData.condos.forEach((c) => {
      const display = getDisplayNeighborhood(c.neighborhood);
      counts.set(display, (counts.get(display) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, []);

  const filtered = useMemo(() => {
    let result = condoData.condos as Condo[];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Neighborhood filter
    if (neighborhoodFilter !== "all") {
      result = result.filter(
        (c) => getDisplayNeighborhood(c.neighborhood) === neighborhoodFilter
      );
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.zipCode.includes(q) ||
          c.neighborhood.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "neighborhood")
        cmp = getDisplayNeighborhood(a.neighborhood).localeCompare(
          getDisplayNeighborhood(b.neighborhood)
        );
      else if (sortField === "reviewDate")
        cmp = (a.reviewDate || "").localeCompare(b.reviewDate || "");
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [search, statusFilter, neighborhoodFilter, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };
  const handleNeighborhoodFilter = (val: string) => {
    setNeighborhoodFilter(val);
    setPage(1);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3.5 h-3.5 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-teal" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-teal" />
    );
  };

  const faqItems = [
    {
      q: "What does VA condo approval mean?",
      a: "VA condo approval means the Department of Veterans Affairs has reviewed a condominium project's legal documents, financials, and HOA governance and determined it meets VA lending standards. Without this approval, VA-eligible buyers cannot use their VA loan benefit to purchase a unit in that project. The approval applies to the entire project — once a project is approved, any unit within it is eligible for VA financing.",
    },
    {
      q: 'What is the difference between "Accepted Without Conditions" and "Accepted With Conditions"?',
      a: '"Accepted Without Conditions" means the project fully meets all VA requirements with no additional stipulations. "Accepted With Conditions" means the project is approved but the VA identified items to be noted — such as pending litigation, reserve fund shortfalls, or investor concentration ratios. Both statuses allow VA financing. In practice, there is almost never anything that needs to be resolved — the lender may simply require the Veteran to acknowledge and accept the noted conditions, which are informational in nature.',
    },
    {
      q: "What if the condo I want isn't on the VA-approved list?",
      a: "You have two options. First, your lender can submit the full project approval package to the Regional VA Loan Center as part of your purchase transaction — this is called Lender Submitted Condo Approval and typically takes 2–3 weeks, well within a standard 45-day contract. Second, the HOA board or seller can submit a full project approval application directly to the VA, which approves the entire building for all future VA buyers. Your lender can guide you through either process.",
    },
    {
      q: "Can I use a VA loan for a Waikiki condotel or hotel-condo?",
      a: "Generally no. The VA does not approve projects that operate primarily as hotels or where units are part of a mandatory rental pool. Many Waikiki high-rises that allow short-term rentals are classified as condotels and are ineligible for VA financing. However, some Waikiki buildings that are primarily residential (not hotel-operated) are VA-approved — check this list to verify.",
    },
    {
      q: "Does VA approval mean the condo is a good investment?",
      a: "No. VA approval means the project meets minimum lending standards for financial stability, insurance, and governance. It does not evaluate the investment potential, future appreciation, or whether the HOA fees are reasonable. Always conduct your own due diligence — review the reserve study, check for pending special assessments, and compare HOA fees across similar buildings.",
    },
    {
      q: "How often is this list updated?",
      a: `This list is sourced from the VA's LGY Hub database and was last updated on ${condoData.lastUpdated}. The VA continuously processes new approvals and status changes. For the most current status of a specific project, you can verify directly at the VA's official portal or contact your VA-experienced lender.`,
    },
  ];

  return (
    <Layout>
      <SEO
        title="VA-Approved Condos on Oahu — ${condoData.totalApproved} Projects | RealityCents"
        description={`Searchable directory of all ${condoData.totalApproved} VA-approved condo projects on Oahu, Hawaii. Filter by neighborhood, approval status, and zip code. Updated ${condoData.lastUpdated}.`}
        url="/va-approved-condos-oahu"
        keywords="VA approved condos Oahu, VA approved condos Hawaii, VA condo list Honolulu, VA eligible condos Waikiki, VA loan condo Hawaii, VA approved condo projects Oahu 2026"
      />

      <PageHero
        title="VA-Approved Condos on Oahu"
        subtitle={`${condoData.totalApproved.toLocaleString()} condo projects approved for VA financing — searchable by name, address, neighborhood, or zip code.`}
        image={IMAGES.heroGuide}
        compact
      />

      {/* Stats Bar */}
      <section className="bg-navy text-white -mt-1 relative z-10">
        <div className="container py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gold" />
                <span className="text-sm font-medium">
                  <span className="text-gold font-bold text-lg">{condoData.totalApproved.toLocaleString()}</span>{" "}
                  Total Approved
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">
                  <span className="font-bold">{condoData.withoutConditions.toLocaleString()}</span> Without Conditions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span className="text-sm">
                  <span className="font-bold">{condoData.withConditions.toLocaleString()}</span> With Conditions
                </span>
              </div>
            </div>
            <div className="text-sm text-white/70">
              Data from{" "}
              <a
                href="https://lgy.va.gov/lgyhub/condo-report"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gold transition-colors"
              >
                VA LGY Hub
              </a>{" "}
              · Last updated {condoData.lastUpdated}
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters + Table */}
      <section className="py-12 lg:py-16">
        <div className="container">
          {/* Search & Filters */}
          <div className="bg-card border border-border rounded-xl p-5 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by project name, address, or zip code..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="Accepted Without Conditions">Approved (No Conditions)</option>
                  <option value="Accepted With Conditions">Approved (With Conditions)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Neighborhood Filter */}
              <div className="relative min-w-[220px]">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={neighborhoodFilter}
                  onChange={(e) => handleNeighborhoodFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                >
                  <option value="all">All Neighborhoods ({condoData.totalApproved})</option>
                  {neighborhoodOptions.map((n) => (
                    <option key={n.name} value={n.name}>
                      {n.name} ({n.count})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Results count */}
            <div className="mt-3 text-sm text-muted-foreground">
              Showing {paged.length} of {filtered.length.toLocaleString()} projects
              {(search || statusFilter !== "all" || neighborhoodFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setNeighborhoodFilter("all");
                    setPage(1);
                  }}
                  className="ml-3 text-teal hover:text-teal-dark underline transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th
                    className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => handleSort("name")}
                  >
                    <span className="flex items-center gap-1">
                      Project Name <SortIcon field="name" />
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Address
                  </th>
                  <th
                    className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => handleSort("neighborhood")}
                  >
                    <span className="flex items-center gap-1">
                      Neighborhood <SortIcon field="neighborhood" />
                    </span>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => handleSort("status")}
                  >
                    <span className="flex items-center gap-1">
                      Status <SortIcon field="status" />
                    </span>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => handleSort("reviewDate")}
                  >
                    <span className="flex items-center gap-1">
                      Review Date <SortIcon field="reviewDate" />
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    VA ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.map((condo, i) => {
                  const statusInfo = STATUS_LABELS[condo.status];
                  return (
                    <tr
                      key={condo.id}
                      className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                        i % 2 === 0 ? "" : "bg-muted/10"
                      }`}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{condo.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {condo.address}, {condo.city} {condo.zipCode}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {getDisplayNeighborhood(condo.neighborhood)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo?.color}`}
                        >
                          {statusInfo?.icon && <statusInfo.icon className="w-3.5 h-3.5" />}
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground tabular-nums">
                        {condo.reviewDate || "—"}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{condo.vaId}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {paged.map((condo) => {
              const statusInfo = STATUS_LABELS[condo.status];
              return (
                <div
                  key={condo.id}
                  className="bg-card border border-border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-foreground leading-tight">{condo.name}</h3>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusInfo?.color}`}
                    >
                      {statusInfo?.icon && <statusInfo.icon className="w-3 h-3" />}
                      {statusInfo?.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {condo.address}, {condo.city} {condo.zipCode}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {getDisplayNeighborhood(condo.neighborhood)}
                    </span>
                    <span>Reviewed: {condo.reviewDate || "—"}</span>
                    <span className="font-mono">VA {condo.vaId}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? "bg-teal text-white"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Educational Content */}
      <section className="py-16 lg:py-20 bg-sand/50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl lg:text-4xl text-navy mb-8">
              Understanding VA Condo Approval in Hawaii
            </h2>

            <div className="prose prose-lg max-w-none text-foreground/90 space-y-6">
              <p>
                If you're a veteran or active-duty service member looking to buy a condo on Oahu with your VA loan benefit, the building must be on the VA's approved list. This isn't optional — it's a hard requirement. No project approval, no VA financing.
              </p>

              <h3 className="font-display text-2xl text-navy mt-10 mb-4">Why VA Approval Matters</h3>
              <p>
                The VA reviews each condo project's HOA financials, insurance coverage, owner-occupancy ratios, and governing documents to ensure the project is financially stable and well-managed. This protects both the veteran buyer and the VA's guaranty. A project that's underwater on reserves or facing major litigation could leave you with a special assessment you can't afford — the VA's review process is designed to catch these red flags before you close.
              </p>

              <h3 className="font-display text-2xl text-navy mt-10 mb-4">
                "Accepted Without Conditions" vs. "Accepted With Conditions"
              </h3>
              <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">Without Conditions</span>
                  </div>
                  <p className="text-sm text-emerald-700">
                    The project fully meets all VA requirements. No additional documentation or verification is needed at closing. This is the cleanest approval status — {condoData.withoutConditions.toLocaleString()} projects on Oahu have it.
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">With Conditions</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    The project is approved but has items the VA flagged — such as pending litigation, low reserves, or high investor concentration. The lender may require that the Veteran acknowledge and accept the specific conditions noted. In practice, there is almost never anything that needs to be resolved — the conditions are informational in nature. {condoData.withConditions.toLocaleString()} Oahu projects carry this status.
                  </p>
                </div>
              </div>

              <h3 className="font-display text-2xl text-navy mt-10 mb-4">
                What If Your Condo Isn't on the List?
              </h3>
              <p>
                Don't panic. You have two paths forward:
              </p>
              <p>
                <strong>Lender Submitted Condo Approval:</strong> Your lender submits the full project approval package directly to the Regional VA Loan Center as part of your purchase transaction. This is the most common path on Oahu and can usually obtain full condo project approval within 2–3 weeks — well within the timeline of a standard 45-day purchase agreement. Your lender handles the heavy lifting; you just need to keep the transaction moving.
              </p>
              <p>
                <strong>Full Project Approval:</strong> The HOA board or the seller submits a complete application package to the VA, including financials, governing documents, insurance certificates, and reserve studies. This takes 4-8 weeks but approves the entire building for all future VA buyers — which can actually increase the building's marketability and property values.
              </p>

              <h3 className="font-display text-2xl text-navy mt-10 mb-4">
                Oahu-Specific Considerations
              </h3>
              <p>
                <strong>Leasehold vs. Fee Simple:</strong> Many Oahu condos, particularly in older neighborhoods, are leasehold rather than fee simple. VA loans can finance leasehold properties, but the remaining lease term must extend at least 14 years beyond the loan maturity date. On a 30-year mortgage, that means the lease must have at least 44 years remaining. Check the lease expiration before falling in love with a unit.
              </p>
              <p>
                <strong>Waikiki Condotels:</strong> Several Waikiki high-rises operate as hotel-condos with mandatory rental pools. These are generally not eligible for VA financing, even if the building appears on the approved list for its residential units. If a building has both residential and hotel-managed units, only the residential units may qualify. Always verify with your lender.
              </p>
              <p>
                <strong>HOA Fees Impact on DTI:</strong> Oahu condo HOA fees average $882/month in Honolulu — among the highest in the nation. This amount is included in your debt-to-income calculation and can significantly reduce your buying power. A $900/month HOA has the same DTI impact as adding roughly $160,000 to your loan amount. Factor this in early when setting your budget.
              </p>

              <h3 className="font-display text-2xl text-navy mt-10 mb-4">How an HOA Can Get VA-Approved</h3>
              <p>
                If you're on an HOA board or you're a seller whose building isn't VA-approved, getting approval opens the door to thousands of potential military buyers. The process involves submitting the project's legal documents, financial statements, insurance certificates, and reserve study to the VA through the LGY Hub portal. Many HOA management companies can handle this process. The investment in time typically pays for itself through increased buyer demand and higher sale prices.
              </p>
            </div>

            {/* Cross-links */}
            <div className="mt-12 bg-card border border-border rounded-xl p-6">
              <h3 className="font-display text-xl text-navy mb-4">Related VA Loan Resources</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: "VA Loans in Hawaii: Complete Guide", href: "/knowledge-base/va-loans-hawaii-military" },
                  { title: "VA Loan House Hacking in Hawaii", href: "/knowledge-base/va-loan-house-hacking-hawaii" },
                  { title: "VA Assumable Loans: Pros & Cons", href: "/knowledge-base/va-assumable-loans-pros-cons" },
                  { title: "VA Funding Fee Tax Deduction", href: "/knowledge-base/va-funding-fee-tax-deductible" },
                  { title: "Military Buying Power Calculator", href: "/military-calculator" },
                  { title: "Income Needed to Buy in Hawaii", href: "/knowledge-base/income-needed-buy-home-hawaii-2026" },
                  { title: "Seller Concessions & Rate Buydowns", href: "/knowledge-base/seller-concessions-rate-buydown-hawaii" },
                  { title: "UHERO Housing Factbook Analysis", href: "/knowledge-base/uhero-hawaii-housing-factbook-2026-buyers" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50 hover:bg-teal/10 text-sm font-medium text-foreground hover:text-teal transition-colors group"
                  >
                    <ArrowRight className="w-4 h-4 text-teal shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl lg:text-4xl text-navy mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqItems.map((faq, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-start gap-3 p-5 text-left"
                  >
                    <HelpCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                    <span className="flex-1 font-medium text-foreground">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                        expandedFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFaq === i && (
                    <div className="px-5 pb-5 pl-13">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <ContactActions
        variant="full"
        headline="Found a Condo You Like?"
        subtext="Let’s check your VA eligibility and get you pre-approved. Jay Miller has helped hundreds of military families buy condos on Oahu with $0 down."
        preApprovalLabel="Get Pre-Approved"
        hideEmail
      />
    </Layout>
  );
}
