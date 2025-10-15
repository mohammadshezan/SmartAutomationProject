"use client";
import { useEffect, useMemo, useState } from "react";
import Guard from "@/components/Guard";
import { withBase } from "@/lib/config";

export default function StockyardDetail({ params }: { params: { slug: string } }) {
  const [yard, setYard] = useState<{ slug: string; name: string | null } | null>(null);
  const [incoming, setIncoming] = useState<Array<{ code: string; status: string }>>([]);
  const [pending, setPending] = useState<Array<{ id: string; customer?: string; cargo?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    async function load() {
      setLoading(true); setError(null);
      try {
        // Fetch yard metadata by slug (DB id)
        const yr = await fetch(withBase(`/stock/yard/${encodeURIComponent(params.slug)}`), { headers });
        const yj = yr.ok ? await yr.json() : null;
        if (!mounted) return;
        const yname = yj?.name || null;
        setYard({ slug: params.slug, name: yname });
        // Fetch incoming and pending using yard name when available
        const yardName = yname ? encodeURIComponent(yname) : '';
        const [r1, r2] = await Promise.all([
          fetch(withBase(`/yard/incoming${yardName ? `?yard=${yardName}` : ''}`), { headers }),
          fetch(withBase(`/yard/dispatches${yardName ? `?yard=${yardName}` : ''}`), { headers })
        ]);
        const j1 = r1.ok ? await r1.json() : [];
        const j2 = r2.ok ? await r2.json() : [];
        if (!mounted) return;
        setIncoming(Array.isArray(j1) ? j1.slice(0, 6) : []);
        setPending(Array.isArray(j2) ? j2.slice(0, 6) : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load yard');
        setIncoming([]); setPending([]);
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, [params.slug]);

  return (
    <Guard allow={["supervisor","admin"]}>
    <main className="p-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">{yard?.name || 'Stockyard'} — Stockyard Dashboard</h1>
        <p className="opacity-80 text-sm">Updated just now</p>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="border border-white/10 rounded p-4">
          <h3 className="font-medium mb-2">Incoming Rakes</h3>
          {loading ? (
            <p className="opacity-80 text-sm">Loading…</p>
          ) : incoming.length ? (
            <ul className="text-sm space-y-1">
              {incoming.map((r:any) => (
                <li key={r.code} className="flex justify-between">
                  <span>{r.code}</span>
                  <span className="opacity-70">{r.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="opacity-80 text-sm">No incoming rakes right now.</p>
          )}
        </div>
        <div className="border border-white/10 rounded p-4">
          <h3 className="font-medium mb-2">Pending Dispatches</h3>
          {loading ? (
            <p className="opacity-80 text-sm">Loading…</p>
          ) : pending.length ? (
            <ul className="text-sm list-disc pl-5">
              {pending.map(p => (
                <li key={p.id}>{p.cargo || 'Pending item'}</li>
              ))}
            </ul>
          ) : (
            <p className="opacity-80 text-sm">No pending items right now.</p>
          )}
        </div>
      </section>
    </main>
    </Guard>
  );
}
