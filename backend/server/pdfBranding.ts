/**
 * PDF Branding — dynamically replaces the "[Your Name, Brokerage]" placeholder
 * in toolkit PDFs with the agent's actual name and brokerage.
 *
 * Strategy: Cover the ENTIRE footer line 1 with a white rectangle, then redraw
 * the complete line from scratch. This handles any agent name length without
 * overflowing into adjacent text.
 *
 * Footer geometry (from pdftotext -bbox analysis of 01_va_cheat_sheet_v2.pdf, 612×792pt):
 *   Line 1: "Compliments of [Your Name, Brokerage] & Jay Miller, NMLS #657301 • CMG Home Loans  📞 808-429-0811  📧 jaym@cmghomeloans.com"
 *     pdftotext top-origin: yMin=733.4, yMax=743.8
 *     PDF bottom-origin: y_bottom=48.2, y_top=58.6, height=10.4
 *     baseline ≈ 49.85 (= 48.2 + 7.5pt_font * 0.22_descender_ratio)
 *   Line 2: "RealityCents.com • Hawaii's Trusted Mortgage Resource  [right-aligned: 2026 Edition...]"
 *     pdftotext top-origin: yMin=746.85, yMax=755.95
 *     → NOT touched; preserved as-is.
 *
 * The phone/email glyphs (📞 📧) are emoji that may not render in standard PDF fonts.
 * We use plain text equivalents instead: "Tel:" and "Email:".
 */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Footer geometry constants (PDF bottom-origin, points)
const PAGE_HEIGHT = 792;
const FOOTER_LEFT = 36.1;          // xMin of "Compliments"
const FOOTER_RIGHT = 576;          // xMax of last word (email)
const FOOTER_LINE1_BOTTOM = 48.2;  // y_bottom = 792 - 743.8
const FOOTER_LINE1_TOP = 58.6;     // y_top = 792 - 733.4
const FOOTER_LINE1_HEIGHT = 10.4;  // yMax - yMin
const FOOTER_LINE1_BASELINE = 49.85; // bottom + font_descender_space

// Font size for footer text (matches original PDF)
const FONT_SIZE = 7.5;

// Logo constraints (inline with text)
const LOGO_MAX_HEIGHT = 9;   // slightly smaller than text height so it sits inline
const LOGO_MAX_WIDTH = 55;   // max width before crowding text
const LOGO_GAP = 3;          // gap between logo and text

/**
 * Compute proportional logo dimensions within constraints.
 */
export function computeLogoDimensions(
  naturalWidth: number,
  naturalHeight: number,
  maxH = LOGO_MAX_HEIGHT,
  maxW = LOGO_MAX_WIDTH
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: maxW, height: maxH };
  }
  let scale = maxH / naturalHeight;
  if (naturalWidth * scale > maxW) {
    scale = maxW / naturalWidth;
  }
  return {
    width: Math.round(naturalWidth * scale * 100) / 100,
    height: Math.round(naturalHeight * scale * 100) / 100,
  };
}

async function fetchPdf(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function fetchImage(url: string): Promise<{ bytes: Uint8Array; type: "png" | "jpg" }> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  const bytes = new Uint8Array(await response.arrayBuffer());
  const type = (contentType.includes("png") || url.toLowerCase().endsWith(".png")) ? "png" : "jpg";
  return { bytes, type };
}

export interface BrandingOptions {
  pdfUrl: string;
  agentName: string;
  brokerage: string;
  logoUrl?: string | null;
}

/**
 * Brand a PDF:
 * 1. Cover the entire footer line 1 with a white rectangle on every page.
 * 2. Redraw the complete line:
 *    [logo?] [AgentName, Brokerage] & Jay Miller, NMLS #657301 • CMG Home Loans  Tel: 808-429-0811  Email: jaym@cmghomeloans.com
 */
export async function brandPdf(options: BrandingOptions): Promise<Uint8Array> {
  const { pdfUrl, agentName, brokerage, logoUrl } = options;

  const pdfBytes = await fetchPdf(pdfUrl);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Optionally embed the logo
  let logoImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
  let logoDims: { width: number; height: number } | null = null;

  if (logoUrl) {
    try {
      const { bytes: imgBytes, type } = await fetchImage(logoUrl);
      logoImage = type === "png"
        ? await pdfDoc.embedPng(imgBytes)
        : await pdfDoc.embedJpg(imgBytes);
      logoDims = computeLogoDimensions(logoImage.width, logoImage.height);
    } catch (e) {
      console.error("Failed to embed logo:", e);
      logoImage = null;
      logoDims = null;
    }
  }

  // Build the right-side text (after agent name/brokerage)
  const suffix = ` & Jay Miller, NMLS #657301 \u2022 CMG Home Loans`;
  const contactText = `  Tel: 808-429-0811  Email: jaym@cmghomeloans.com`;
  const agentLabel = `${agentName}, ${brokerage}`;
  const prefix = "Compliments of ";

  // Auto-shrink font if total line would overflow the available width
  const availableWidth = FOOTER_RIGHT - FOOTER_LEFT;
  const logoBlockWidth = logoDims ? logoDims.width + LOGO_GAP : 0;
  const totalTextWidth = (fs: number) =>
    regularFont.widthOfTextAtSize(prefix, fs) +
    logoBlockWidth +
    boldFont.widthOfTextAtSize(agentLabel, fs) +
    regularFont.widthOfTextAtSize(suffix + contactText, fs);

  let fontSize = FONT_SIZE;
  while (totalTextWidth(fontSize) > availableWidth && fontSize > 5.5) {
    fontSize -= 0.25;
  }

  for (const page of pages) {
    // 1. Cover entire footer line 1 with white rectangle (generous padding)
    page.drawRectangle({
      x: FOOTER_LEFT - 2,
      y: FOOTER_LINE1_BOTTOM - 2,
      width: FOOTER_RIGHT - FOOTER_LEFT + 4,
      height: FOOTER_LINE1_HEIGHT + 4,
      color: rgb(1, 1, 1),
      opacity: 1,
    });

    // 2. Redraw the line from left margin
    let cursorX = FOOTER_LEFT;
    const y = FOOTER_LINE1_BASELINE;

    // "Compliments of " in regular weight
    page.drawText(prefix, {
      x: cursorX,
      y,
      size: fontSize,
      font: regularFont,
      color: rgb(0.15, 0.15, 0.15),
    });
    cursorX += regularFont.widthOfTextAtSize(prefix, fontSize);

    // Logo (if present) — vertically centered in the text line
    if (logoImage && logoDims) {
      const logoY = y - logoDims.height * 0.15; // slight downward nudge to align with text cap height
      page.drawImage(logoImage, {
        x: cursorX,
        y: logoY,
        width: logoDims.width,
        height: logoDims.height,
      });
      cursorX += logoDims.width + LOGO_GAP;
    }

    // Agent name + brokerage in bold
    page.drawText(agentLabel, {
      x: cursorX,
      y,
      size: fontSize,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    cursorX += boldFont.widthOfTextAtSize(agentLabel, fontSize);

    // " & Jay Miller, NMLS #657301 • CMG Home Loans" in regular
    page.drawText(suffix, {
      x: cursorX,
      y,
      size: fontSize,
      font: regularFont,
      color: rgb(0.15, 0.15, 0.15),
    });
    cursorX += regularFont.widthOfTextAtSize(suffix, fontSize);

    // Contact info — continue inline after suffix
    page.drawText(contactText, {
      x: cursorX,
      y,
      size: fontSize,
      font: regularFont,
      color: rgb(0.15, 0.15, 0.15),
    });
  }

  return pdfDoc.save();
}
