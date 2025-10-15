"use client";
import Guard from "@/components/Guard";
import { withBase } from "@/lib/config";
import { useEffect, useMemo, useState } from "react";

type Ord = { orderId: string; cargo: string; quantityTons: number; status: string; estimate?: { distanceKm?: number, carbonTons?: number, ecoHint?: string, cost?: number, eta?: string } };

export default function CarbonCredits() {
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

  // Assume eco-route savings ~12% of indicative emissions where ecoHint present
  const metrics = useMemo(() => {
    const withEst = orders.filter(o => typeof o.estimate?.carbonTons === 'number');
    const totalCarbon = withEst.reduce((s,o)=> s + Number(o.estimate!.carbonTons || 0), 0);
    const potentialSavings = withEst.reduce((s,o)=> {
      const eco = (o.estimate?.ecoHint ? 0.12 : 0.0); // 12% savings hinted
      return s + Number(o.estimate!.carbonTons || 0) * eco;
    }, 0);
    const credits = potentialSavings; // 1 credit per ton CO₂ saved (indicative)
    const creditValueInr = Math.round(credits * 200); // demo: ₹200/credit
    return { totalCarbon: Number(totalCarbon.toFixed(2)), potentialSavings: Number(potentialSavings.toFixed(2)), credits: Number(credits.toFixed(2)), creditValueInr };
  }, [orders]);

  return (
    <Guard allow={['customer'] as any}>
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Carbon Credits</h1>
        {loading ? (<div className="text-sm text-gray-400">Loading…</div>) : error ? (<div className="text-sm text-red-400">{error}</div>) : (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card label="Total CO₂ (t)" value={metrics.totalCarbon.toLocaleString()} />
              <Card label="Potential Savings (t)" value={metrics.potentialSavings.toLocaleString()} />
              <Card label="Credits (tCO₂)" value={metrics.credits.toLocaleString()} />
              <Card label="Credit Value (₹)" value={metrics.creditValueInr.toLocaleString()} />
            </section>
            <section className="rounded border border-white/10 p-4">
              <h2 className="font-medium mb-2">Per-order estimates</h2>
              {orders.length === 0 ? (
                <div className="text-sm text-gray-400">No orders yet.</div>
              ) : (
                <div className="space-y-2 text-sm">
                  {orders.map(o => (
                    <div key={o.orderId} className="rounded border border-white/10 p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{o.cargo} × {o.quantityTons}t</div>
                        <div className="text-white/60">Order {o.orderId.slice(0,8)}</div>
                      </div>
                      <div className="text-right">
                        <div>CO₂: {fmtNum(o.estimate?.carbonTons)} t</div>
                        <div className="text-white/60">Savings: {fmtNum((o.estimate?.ecoHint ? (Number(o.estimate?.carbonTons||0) * 0.12) : 0))} t</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-white/50 mt-2">Estimates are indicative; actual route and locomotive type can change emissions. Eco-route savings assumed at ~12% where applicable.</div>
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

function fmtNum(n?: number) { return typeof n === 'number' && !isNaN(n) ? Number(n.toFixed(2)).toLocaleString() : '—'; }
