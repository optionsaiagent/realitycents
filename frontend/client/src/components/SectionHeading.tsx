interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionHeading({ label, title, description, centered = true, light }: SectionHeadingProps) {
  return (
    <div className={`mb-10 lg:mb-14 ${centered ? "text-center" : ""}`}>
      {label && (
        <span className="inline-block text-xs font-body font-semibold uppercase tracking-[0.2em] text-teal mb-3">
          {label}
        </span>
      )}
      <h2 className={`font-display text-3xl md:text-4xl lg:text-5xl ${light ? "text-white" : "text-navy"} mb-4`}>
        {title}
      </h2>
      {description && (
        <p className={`max-w-2xl text-base md:text-lg leading-relaxed ${centered ? "mx-auto" : ""} ${light ? "text-sand/70" : "text-muted-foreground"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
