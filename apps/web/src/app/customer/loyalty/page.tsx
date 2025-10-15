"use client";
import Guard from "@/components/Guard";
import { withBase } from "@/lib/config";
import { useEffect, useMemo, useState } from "react";

type Ord = { orderId: string; cargo: string; quantityTons: number; estimate?: { cost?: number } };

export default function Loyalty() {
  const [orders, setOrders] = useState<Ord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|undefined>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(undefined);
      try {
        const token = localStorage.getItem('token')||'';
        const r = await fetch(withBase('/customer/orders'), { headers: { Authorization: `Bearer ${token}` } });
        if (!mounted) return;
        if (!r.ok) { setError(`Failed to load orders (${r.status})`); setLoading(false); return; }
        const j = await r.json();
        setOrders(Array.isArray(j.orders) ? j.orders : []);
      } catch (e:any) { if (mounted) setError(e.message||'Failed'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const summary = useMemo(() => {
    const spend = orders.reduce((s,o)=> s + Number(o.estimate?.cost||0), 0);
    const tons = orders.reduce((s,o)=> s + Number(o.quantityTons||0), 0);
    // Points: 1 per ton + 0.01 per ₹ spent (scaled)
    const points = Math.round(tons + (spend * 0.01 / 100));
    const tier = points >= 5000 ? 'Platinum' : points >= 2000 ? 'Gold' : points >= 800 ? 'Silver' : 'Bronze';
    const nextTier = tier === 'Platinum' ? null : tier === 'Gold' ? { label: 'Platinum', need: 5000 - points } : tier === 'Silver' ? { label: 'Gold', need: 2000 - points } : { label: 'Silver', need: 800 - points };
    const discountPct = tier === 'Platinum' ? 8 : tier === 'Gold' ? 5 : tier === 'Silver' ? 2 : 0;
    return { spend, tons, points, tier, nextTier, discountPct };
  }, [orders]);

  return (
    <Guard allow={['customer'] as any}>
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Loyalty / Discounts</h1>
        {loading ? (<div className="text-sm text-gray-400">Loading…</div>) : error ? (<div className="text-sm text-red-400">{error}</div>) : (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card label="Points" value={summary.points.toLocaleString()} />
              <Card label="Total Spend (₹)" value={summary.spend.toLocaleString()} />
              <Card label="Total Tons" value={summary.tons.toLocaleString()} />
              <Card label="Tier" value={summary.tier} />
            </section>
            <section className="rounded border border-white/10 p-4">
              <h2 className="font-medium mb-2">Your Benefits</h2>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Eligible discount on logistics: <b>{summary.discountPct}%</b></li>
                <li>Priority scheduling for Gold+ tiers</li>
                <li>Dedicated support desk for Platinum</li>
              </ul>
              {summary.nextTier && (
                <div className="mt-3 text-sm text-white/70">{summary.nextTier.need.toLocaleString()} points to reach <b>{summary.nextTier.label}</b>.</div>
              )}
            </section>
          </>
        )}
      </div>
    </Guard>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded border border-white/10 p-4">
      <div className="text-sm opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{String(value)}</div>
    </div>
  );
}
