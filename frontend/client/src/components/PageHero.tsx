/*
 * Pacific Modernism — Reusable hero section with gradient overlay on background image
 * Used across all pages for consistent visual language
 */
interface PageHeroProps {
  title: string;
  subtitle?: string;
  image: string;
  imageAlt?: string;
  children?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export default function PageHero({ title, subtitle, image, imageAlt, children, compact, className }: PageHeroProps) {
  return (
    <section
      className={`relative ${compact ? "pt-28 pb-16 lg:pt-36 lg:pb-20" : "pt-32 pb-20 lg:pt-44 lg:pb-28"} overflow-hidden${className ? ` ${className}` : ""}`}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={imageAlt || `${title} — RealityCents Hawaii Mortgage`}
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
