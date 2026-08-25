/*
 * Pacific Modernism — Reusable hero section with gradient overlay on background image
 * Used across all pages for consistent visual language
 */
import { IMAGES, IMAGE_ALTS } from "@/lib/constants";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image: string;
  imageAlt?: string;
  children?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

const ALT_BY_SRC: Record<string, string> = {
  [IMAGES.heroHome]: IMAGE_ALTS.heroHome,
  [IMAGES.heroAbout]: IMAGE_ALTS.heroAbout,
  [IMAGES.heroCalculator]: IMAGE_ALTS.heroCalculator,
  [IMAGES.heroGuide]: IMAGE_ALTS.heroGuide,
  [IMAGES.heroAgents]: IMAGE_ALTS.heroAgents,
  [IMAGES.heroAdvisors]: IMAGE_ALTS.heroAdvisors,
  "/images/heroes/page-military-calculator.webp": IMAGE_ALTS.heroMilitary,
};

export default function PageHero({ title, subtitle, image, imageAlt, children, compact, className }: PageHeroProps) {
  const resolvedAlt = imageAlt || ALT_BY_SRC[image] || `${title} — RealityCents Hawaii Mortgage`;

  return (
    <section
      className={`relative ${compact ? "pt-28 pb-16 lg:pt-36 lg:pb-20" : "pt-32 pb-20 lg:pt-44 lg:pb-28"} overflow-hidden${className ? ` ${className}` : ""}`}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={resolvedAlt}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/50" />
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-sand/80 leading-relaxed mb-6">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
