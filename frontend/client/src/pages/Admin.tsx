/*
 * Admin dashboard — magic-link login + agent/newsletter stats.
 * Not linked from site navigation; not indexed.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const API_BASE = import.meta.env.VITE_API_URL || "";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const requestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch(`${API_BASE}/api/auth/request-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-8">
        <h1 className="text-xl font-semibold text-[#1a2744] mb-2">Admin Login</h1>
        {sent ? (
          <p className="text-sm text-slate-600">
            If that address is authorized, a login link is on its way. Check your email —
            the link expires in 15 minutes.
          </p>
        ) : (
          <form onSubmit={requestLink} className="space-y-4">
            <p className="text-sm text-slate-600">
              Enter your email and we'll send you a sign-in link.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            />
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Sending…" : "Email me a login link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const utils = trpc.useUtils();
  const { data: agentsData } = trpc.toolkit.adminGetAgents.useQuery();
  const { data: newsletter } = trpc.toolkit.adminGetNewsletterStats.useQuery();
  const { data: stats } = trpc.toolkit.adminGetStats.useQuery();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => window.location.reload(),
  });

  const exportCsv = async () => {
    const { rows } = await utils.toolkit.adminExportCsv.fetch();
    const header = "Name,Email,Brokerage,Registered,Newsletter";
    const csv = [
      header,
      ...rows.map(r =>
        [r.name, r.email, r.brokerage, r.registeredAt, r.newsletter]
          .map(v => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "realitycents-agents.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1a2744]">RealityCents Admin</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
            <Button variant="ghost" onClick={() => logout.mutate()}>Sign out</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="text-sm text-slate-500">Registered agents</div>
            <div className="text-3xl font-semibold text-[#1a2744]">
              {agentsData?.agents.length ?? "—"}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="text-sm text-slate-500">Newsletter subscribers</div>
            <div className="text-3xl font-semibold text-[#1a2744]">
              {newsletter ? `${newsletter.subscribed} / ${newsletter.total}` : "—"}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-5">
            <div className="text-sm text-slate-500">Total downloads</div>
            <div className="text-3xl font-semibold text-[#1a2744]">
              {stats ? stats.downloads.length : "—"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Brokerage</th>
                <th className="px-4 py-3">Newsletter</th>
                <th className="px-4 py-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {(agentsData?.agents ?? []).map(a => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">{a.email}</td>
                  <td className="px-4 py-3">{a.brokerage}</td>
                  <td className="px-4 py-3">{a.newsletterOptIn ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    {a.createdAt ? new Date(a.createdAt as unknown as string).toLocaleDateString() : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stats && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Downloads</th>
                </tr>
              </thead>
              <tbody>
                {stats.resources.map(r => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{r.title}</td>
                    <td className="px-4 py-3">{r.category ?? ""}</td>
                    <td className="px-4 py-3">{r.downloadCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;
  }

  return user?.role === "admin" ? <Dashboard /> : <LoginForm />;
}
