/*
 * Pacific Modernism — Knowledge Base Listing Page
 * Searchable, categorized article grid with frosted glass search bar
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { IMAGES } from "@/lib/constants";
import { articles, CATEGORIES } from "@/lib/articles";
import { Search, Clock, ArrowRight, Tag } from "lucide-react";

export default function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    let result = articles;
    if (activeCategory !== "All") {
      result = result.filter((a) => a.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeCategory]);

  return (
    <Layout>
      <SEO
        title="Hawaii Mortgage Knowledge Base — Articles & Guides"
        description="Expert articles on Hawaii mortgages, home loans, and the homebuying process. Topics include FHA loans, VA loans, jumbo loans, first-time homebuyer programs, down payment assistance, leasehold vs. fee simple, and more."
        url="/knowledge-base"
        keywords="Hawaii mortgage articles, Hawaii home loan guide, FHA loans Hawaii, VA loans Hawaii, first time homebuyer Hawaii, leasehold fee simple Hawaii, down payment assistance Hawaii, Hawaii mortgage tips"
      />
      <PageHero
        title="Knowledge Base"
        subtitle="Expert articles on Hawaii mortgages, loan types, credit strategies, and the homebuying process."
        image={IMAGES.heroGuide}
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="container">
          {/* Search & Filter Bar */}
          <div className="mb-10 lg:mb-14">
            {/* Search */}
            <div className="relative max-w-xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors shadow-sm"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-teal text-white shadow-md shadow-teal/20"
                      : "bg-sand text-muted-foreground hover:bg-sand-dark"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""} found
          </p>

          {/* Article Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article) => (
                <Link
                  key={article.slug}
                  href={`/knowledge-base/${article.slug}`}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:shadow-navy/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs font-body font-semibold text-teal bg-teal/10 px-2.5 py-1 rounded-full">
                        <Tag className="w-3 h-3" />
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>
                    <h3 className="font-display text-lg text-navy mb-2 group-hover:text-teal transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-body font-semibold text-teal group-hover:gap-2 transition-all">
                      Read Article <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-2">No articles found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or selecting a different category.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
