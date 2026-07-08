import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";

/**
 * ShortLink redirect page.
 * URL format: /s/abc123
 * On mount, calls the tRPC API to resolve the 6-char code from the database,
 * then redirects to /loan-compare?d=[compressed data].
 * Falls back to legacy hash-based redirect if no code param.
 */
export default function ShortLink() {
  const params = useParams<{ id: string }>();
  const code = params.id || "";
  const [error, setError] = useState(false);

  const { data, isError } = trpc.shortUrl.resolve.useQuery(
    { code },
    { enabled: code.length === 6, retry: false }
  );

  useEffect(() => {
    // Legacy support: if there's a hash fragment, use it directly
    const hash = window.location.hash.slice(1);
    if (hash) {
      window.location.replace(`/loan-compare?d=${hash}`);
      return;
    }
  }, []);

  useEffect(() => {
    if (data?.data) {
      if (data.data.startsWith("adv:")) {
        window.location.replace(`/advanced-calculator?${data.data.slice(4)}`);
      } else {
        window.location.replace(`/loan-compare?d=${data.data}`);
      }
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setError(true);
    }
  }, [isError]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <p className="text-slate-400">This link has expired or is invalid.</p>
        <a
          href="/loan-compare"
          className="text-teal hover:text-teal-light underline text-sm"
        >
          Go to Loan Comparison Calculator
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <p className="text-slate-400">Loading comparison...</p>
    </div>
  );
}
