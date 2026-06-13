/*
 * Pacific Modernism — "Share This Guide" Section
 * Copy link, SMS, Facebook, and Email sharing for VA-base pages.
 * Framed for PCS Facebook groups.
 */
import { useState } from "react";
import { Link2, MessageSquare, Facebook, Mail, CheckCircle } from "lucide-react";

interface ShareGuideProps {
  installationName: string;
  url: string; // Full URL e.g., "https://realitycents.com/va-loan-schofield-barracks"
}

export default function ShareGuide({ installationName, url }: ShareGuideProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `PCSing to ${installationName}? Here's a free VA loan guide for the area →`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = `${shareText} ${url}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="bg-sand/30 rounded-xl border border-border p-6">
      <h3 className="font-display text-lg text-navy mb-2">Share This Guide</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Know someone PCSing to {installationName}? Share this guide with them.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-sm font-body font-medium ${
            copied
              ? "bg-teal/10 border-teal/30 text-teal"
              : "bg-white border-border text-navy hover:bg-teal/5 hover:border-teal/20"
          }`}
        >
          {copied ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Link2 className="w-5 h-5" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </button>

        {/* SMS */}
        <a
          href={`sms:?body=${encodedText}%20${encodedUrl}`}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-white text-navy hover:bg-teal/5 hover:border-teal/20 transition-all text-sm font-body font-medium"
        >
          <MessageSquare className="w-5 h-5" />
          Text/SMS
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-white text-navy hover:bg-teal/5 hover:border-teal/20 transition-all text-sm font-body font-medium"
        >
          <Facebook className="w-5 h-5" />
          Facebook
        </a>

        {/* Email */}
        <a
          href={`mailto:?subject=${encodeURIComponent(`VA Loan Guide for ${installationName}`)}&body=${encodedText}%20${encodedUrl}`}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-white text-navy hover:bg-teal/5 hover:border-teal/20 transition-all text-sm font-body font-medium"
        >
          <Mail className="w-5 h-5" />
          Email
        </a>
      </div>

      <p className="text-xs text-muted-foreground mt-3 italic">
        Perfect for PCS Facebook groups, spouse pages, and unit chats.
      </p>
    </div>
  );
}
