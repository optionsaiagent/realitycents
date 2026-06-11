/*
 * Pacific Modernism — SEO Component
 * Injects per-page meta tags into <head> using document.title and meta tag manipulation.
 * Handles: title, description, OG tags (incl. og:site_name), Twitter cards, canonical URL,
 *          and optional JSON-LD schema injection.
 *
 * CANONICAL DOMAIN: realitycents.com (non-www)
 * www.realitycents.com 301-redirects to realitycents.com at the CDN level.
 * All canonical URLs, OG URLs, and schema @id references must use the non-www form
 * to avoid a duplicate-canonical signal to Google.
 */
import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  keywords?: string;
  /** Optional JSON-LD schema object(s) — injected as <script type="application/ld+json"> */
  schema?: object | object[];
}

const SITE_NAME = "RealityCents";
const BASE_URL = "https://realitycents.com";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;
const DEFAULT_IMAGE_ALT = "RealityCents - Hawaii Mortgage Education & Lending";

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function injectSchema(schema: object | object[]) {
  // Remove any previously injected per-page schema (identified by data-page-schema attribute)
  document.querySelectorAll('script[data-page-schema]').forEach((el) => el.remove());
  const schemas = Array.isArray(schema) ? schema : [schema];
  schemas.forEach((s, i) => {
    const el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("data-page-schema", String(i));
    el.textContent = JSON.stringify(s);
    document.head.appendChild(el);
  });
}

export default function SEO({
  title,
  description,
  url = BASE_URL,
  image = DEFAULT_IMAGE,
  imageAlt = DEFAULT_IMAGE_ALT,
  type = "website",
  keywords,
  schema,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  // Ensure canonical URL: always non-www, no trailing slash (except root)
  let cleanPath = url.startsWith("http") ? new URL(url).pathname : url;
  // Strip trailing slash except for root
  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    cleanPath = cleanPath.replace(/\/+$/, "");
  }
  const fullUrl = cleanPath === "/" ? `${BASE_URL}/` : `${BASE_URL}${cleanPath}`;

  useEffect(() => {
    // Page title
    document.title = fullTitle;

    // Primary
    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    setLink("canonical", fullUrl);

    // Open Graph
    setMeta("og:type", type, "property");
    setMeta("og:url", fullUrl, "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:image", image, "property");
    setMeta("og:image:alt", imageAlt, "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:url", fullUrl);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
    setMeta("twitter:image:alt", imageAlt);

    // JSON-LD schema
    if (schema) injectSchema(schema);

    // Cleanup on unmount
    return () => {
      document.querySelectorAll('script[data-page-schema]').forEach((el) => el.remove());
    };
  }, [fullTitle, description, fullUrl, image, imageAlt, type, keywords, schema]);

  return null;
}
