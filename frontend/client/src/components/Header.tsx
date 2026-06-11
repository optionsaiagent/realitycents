/*
 * Pacific Modernism Design — Sticky header with frosted glass effect
 * Deep navy background transitioning to glass on scroll
 * Gold accent underlines on hover, smooth mobile menu
 * Calculators dropdown for Basic + Advanced calculators
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, FileCheck, ChevronDown, Calculator, Sparkles, TrendingUp, Scale, TrendingDown, Shield, GitCompareArrows } from "lucide-react";
import { LENDER, IMAGES, PRE_APPROVAL_URL } from "@/lib/constants";

const MAIN_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Knowledge Base", href: "/knowledge-base" },
] as const;

const CALC_LINKS = [
  { label: "Basic Calculator", href: "/calculator", icon: Calculator, desc: "Quick monthly payment estimate" },
  { label: "Advanced Calculator", href: "/advanced-calculator", icon: Sparkles, desc: "Conventional, VA, FHA & Jumbo" },
  { label: "What Can I Afford?", href: "/affordability-calculator", icon: TrendingUp, desc: "Max home price by income & DTI" },
  { label: "Rent vs. Buy", href: "/rent-vs-buy", icon: Scale, desc: "Compare renting vs. buying over time" },
  { label: "Buydown Calculator", href: "/buydown-calculator", icon: TrendingDown, desc: "Compare 1/1, 2/1 & 3/2/1 buydowns" },
  { label: "Military Buying Power", href: "/military-calculator", icon: Shield, desc: "VA loan purchase power for Hawaii military" },
  { label: "Loan Comparison", href: "/loan-compare", icon: GitCompareArrows, desc: "Compare rate & cost scenarios side-by-side" },
] as const;

const AFTER_CALC_NAV = [
  { label: "Homebuying Guide", href: "/guide" },
  { label: "VA Condo Lookup", href: "/va-approved-condos-oahu" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/frequently-asked-questions" },
] as const;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [location] = useLocation();
  const calcRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setCalcOpen(false);
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (calcRef.current && !calcRef.current.contains(e.target as Node)) {
        setCalcOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isCalcActive = location === "/calculator" || location === "/advanced-calculator" || location === "/affordability-calculator" || location === "/rent-vs-buy" || location === "/buydown-calculator" || location === "/military-calculator" || location === "/loan-compare";

  const renderNavLink = (link: { label: string; href: string }) => (
    <Link
      key={link.href}
      href={link.href}
      className={`relative px-3 py-2 text-sm font-body font-medium transition-colors ${
        location === link.href
          ? "text-gold"
          : "text-sand/80 hover:text-white"
      }`}
    >
      {link.label}
      {location === link.href && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gold rounded-full" />
      )}
    </Link>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-dark shadow-lg shadow-navy/10"
          : "bg-navy/90 backdrop-blur-sm"
      }`}
    >
      {/* Top bar */}
      <div className="hidden lg:block border-b border-white/10">
        <div className="container flex justify-between items-center py-1.5 text-xs text-sand/70">
          <span>Jay Miller | NMLS #{LENDER.nmls} | CMG Home Loans NMLS #{LENDER.branchNmls}</span>
          <a href={`tel:${LENDER.phone}`} className="flex items-center gap-1.5 hover:text-gold transition-colors">
            <Phone className="w-3 h-3" />
            {LENDER.phone}
          </a>
        </div>
      </div>

      {/* Main nav */}
      <div className="container flex items-center justify-between py-3 lg:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src={IMAGES.logo}
            alt="RealityCents Logo"
            className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {MAIN_NAV.map(renderNavLink)}

          {/* Calculators Dropdown */}
          <div ref={calcRef} className="relative">
            <button
              onClick={() => setCalcOpen(!calcOpen)}
              className={`relative flex items-center gap-1 px-3 py-2 text-sm font-body font-medium transition-colors ${
                isCalcActive ? "text-gold" : "text-sand/80 hover:text-white"
              }`}
            >
              Calculators
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${calcOpen ? "rotate-180" : ""}`} />
              {isCalcActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gold rounded-full" />
              )}
            </button>

            {/* Dropdown panel */}
            <div
              className={`absolute top-full left-0 mt-2 w-72 bg-navy border border-white/10 rounded-lg shadow-xl shadow-navy/40 overflow-hidden transition-all duration-200 ${
                calcOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              {CALC_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                      location === link.href
                        ? "bg-teal/15 text-gold"
                        : "text-sand/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 mt-0.5 text-teal shrink-0" />
                    <div>
                      <span className="text-sm font-body font-semibold block">{link.label}</span>
                      <span className="text-xs text-sand/50">{link.desc}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {AFTER_CALC_NAV.map(renderNavLink)}
        </nav>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-2">
          <a
            href={PRE_APPROVAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy px-4 py-2 rounded-md text-sm font-body font-semibold transition-all hover:shadow-lg hover:shadow-gold/30"
          >
            <FileCheck className="w-4 h-4" />
            Get Pre-Approved
          </a>
          <a
            href={`tel:${LENDER.phone}`}
            className="hidden lg:inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-4 py-2 rounded-md text-sm font-body font-medium transition-all hover:shadow-lg hover:shadow-teal/20"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container pb-4 flex flex-col gap-1">
          {MAIN_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 rounded-md text-sm font-body font-medium transition-colors ${
                location === link.href
                  ? "bg-teal/20 text-gold"
                  : "text-sand/80 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile calculator links */}
          <div className="px-4 pt-2 pb-1">
            <p className="text-xs font-body font-semibold uppercase tracking-wider text-sand/40">Calculators</p>
          </div>
          {CALC_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-md text-sm font-body font-medium transition-colors flex items-center gap-2 ${
                  location === link.href
                    ? "bg-teal/20 text-gold"
                    : "text-sand/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 text-teal" />
                {link.label}
              </Link>
            );
          })}

          {AFTER_CALC_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-3 rounded-md text-sm font-body font-medium transition-colors ${
                location === link.href
                  ? "bg-teal/20 text-gold"
                  : "text-sand/80 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <a
            href={PRE_APPROVAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 bg-gold text-navy px-4 py-3 rounded-md text-sm font-body font-semibold"
          >
            <FileCheck className="w-4 h-4" />
            Get Pre-Approved
          </a>
          <a
            href={`tel:${LENDER.phone}`}
            className="flex items-center justify-center gap-2 bg-teal text-white px-4 py-3 rounded-md text-sm font-body font-medium"
          >
            <Phone className="w-4 h-4" />
            {LENDER.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
