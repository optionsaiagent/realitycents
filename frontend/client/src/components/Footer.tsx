/*
 * Pacific Modernism Design — Deep navy footer with gold accents
 * Structured with contact info, quick links, NMLS disclosures
 */
import { Link } from "wouter";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { LENDER, SITE, NAV_LINKS, IMAGES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-navy text-sand/80">
      {/* Gold accent line */}
      <div className="gold-line" />

      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <img
                src={IMAGES.logo}
                alt="RealityCents Logo"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              {SITE.description}
            </p>
            <p className="text-xs text-sand/50">
              Serving homebuyers and real estate professionals across the Hawaiian Islands.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-white text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-white text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-teal shrink-0" />
                <span>{LENDER.address.full}</span>
              </li>
              <li>
                <a
                  href={`tel:${LENDER.phone}`}
                  className="flex items-center gap-2.5 text-sm hover:text-gold transition-colors"
                >
                  <Phone className="w-4 h-4 text-teal shrink-0" />
                  {LENDER.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${LENDER.email}`}
                  className="flex items-center gap-2.5 text-sm hover:text-gold transition-colors"
                >
                  <Mail className="w-4 h-4 text-teal shrink-0" />
                  {LENDER.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://${LENDER.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm hover:text-gold transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-teal shrink-0" />
                  {LENDER.website}
                </a>
              </li>
            </ul>
          </div>

          {/* NMLS Info */}
          <div>
            <h4 className="font-display text-white text-lg mb-4">Licensing</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-sand/50 text-xs uppercase tracking-wider mb-1">Loan Originator</p>
                <p className="text-white">{LENDER.name}</p>
                <p>NMLS #{LENDER.nmls}</p>
              </div>
              <div>
                <p className="text-sand/50 text-xs uppercase tracking-wider mb-1">Company</p>
                <p className="text-white">CMG Mortgage, Inc.</p>
                <p>NMLS #{LENDER.companyNmls}</p>
              </div>
              <div>
                <p className="text-sand/50 text-xs uppercase tracking-wider mb-1">Branch</p>
                <p className="text-white">{LENDER.company}</p>
                <p>NMLS #{LENDER.branchNmls}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Disclaimer */}
      <div className="border-t border-white/10">
        <div className="container py-6">
          <p className="text-[10px] text-sand/40 leading-relaxed mb-4">
            CMG Mortgage, Inc. dba CMG Home Loans dba CMG Financial, NMLS ID# 1820 (For licensing information, go to{" "}
            <a href="https://www.nmlsconsumeraccess.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-sand/60 transition-colors">www.nmlsconsumeraccess.org</a>
            ). Equal Housing Opportunity. Licensed by the Department of Financial Protection and Innovation (DFPI) under the California Residential Mortgage Lending Act No. 4150025.; AZ #0903132; Colorado regulated by the Division of Real Estate; Georgia Residential Mortgage Licensee #15438; Mortgage Servicer License No. MS068. Hawaii Mortgage Loan Originator Company License No. HI-1820. Massachusetts Mortgage Lender License #MC1820 and Mortgage Broker License #MC1820; Mississippi Licensed Mortgage Company Licensed by the Mississippi Department of Banking and Consumer Finance; Licensed by the New Hampshire Banking Department; Licensed by the NJ Department of Banking and Insurance; Licensed Mortgage Banker – NYS Department of Financial Services; Ohio Mortgage Broker Act Mortgage Banker Exemption #MBMB.850204.000; Rhode Island Licensed Lender #20142986LL; Registered Mortgage Banker with the Texas Department of Savings and Mortgage Lending, and Licensed by the Virginia State Corporation Commission #MC-5521. CMG Mortgage, Inc. is licensed in all 50 states, the District of Columbia, Guam, Puerto Rico, and the Virgin Islands ({" "}
            <a href="https://www.cmgfi.com/corporate/licensing" target="_blank" rel="noopener noreferrer" className="underline hover:text-sand/60 transition-colors">https://www.cmgfi.com/corporate/licensing</a>
            ). Registered Mortgage Loan Originator.
          </p>
          <p className="text-[10px] text-sand/40 leading-relaxed mb-4">
            This is not a commitment to lend. Not all borrowers will qualify. Borrowers may be subject to credit approval and program guidelines. Rates, terms, and conditions are subject to change without notice. {LENDER.name}, NMLS #{LENDER.nmls}. Branch NMLS #{LENDER.branchNmls}.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-sand/50">
              &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Social Links */}
              <a
                href="https://www.linkedin.com/in/jay-miller-534bb5173/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Jay Miller on LinkedIn"
                className="text-sand/50 hover:text-gold transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a
                href="https://www.instagram.com/jaymillercmg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Jay Miller on Instagram"
                className="text-sand/50 hover:text-gold transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a
                href="https://www.youtube.com/@RacingThroughMidlife"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Jay Miller on YouTube"
                className="text-sand/50 hover:text-gold transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <span className="text-[10px] text-sand/40 ml-1">Equal Housing Opportunity</span>
              <svg className="w-5 h-5 text-sand/50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 10h3v10h14V10h3L12 3zm0 2.84L18 10v8H6v-8l6-4.16zM8 14h8v2H8v-2z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
