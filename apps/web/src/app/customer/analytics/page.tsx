"use client";
import Guard from "@/components/Guard";
import { useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/config";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const PRODUCT_COLORS = [
  '#10b981', '#60a5fa', '#f59e0b', '#ef4444', '#22c55e', '#a78bfa', '#f97316', '#14b8a6', '#eab308', '#fb7185',
];

type Ord = { orderId: string; cargo: string; quantityTons: number; status: string; estimate?: { eta?: string, cost?: number } };

export default function CustomerAnalytics() {
  const [orders, setOrders] = useState<Ord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|undefined>();
  const [ready, setReady] = useState(false);

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

  const metrics = useMemo(() => {
    const total = orders.length;
    const totalQty = orders.reduce((s,o)=> s + Number(o.quantityTons||0), 0);
    const avgQty = total ? Math.round(totalQty / total) : 0;
    const byStatus = orders.reduce((m:any,o)=> { const k=String(o.status||'').toUpperCase(); m[k]=(m[k]||0)+1; return m; }, {} as Record<string,number>);
    // naive delivery time if ETA available and status delivered/en route
    const now = Date.now();
    const withEta = orders.filter(o => o.estimate?.eta);
    const avgHours = withEta.length ? Math.round(withEta.reduce((s,o)=> s + Math.max(1, (new Date(o.estimate!.eta!).getTime() - now) / 3600000), 0) / withEta.length) : 0;
    const spend = orders.reduce((s,o)=> s + Number(o.estimate?.cost||0), 0);
    const byProductMap = new Map<string,{qty:number,count:number}>();
    for (const o of orders) {
      const key = String(o.cargo||'Unknown');
      const cur = byProductMap.get(key) || { qty: 0, count: 0 };
      cur.qty += Number(o.quantityTons||0);
      cur.count += 1;
      byProductMap.set(key, cur);
    }
    // chart series
    const productSeries = Array.from(byProductMap.entries())
      .sort((a,b)=> b[1].qty - a[1].qty)
      .slice(0, 10)
      .map(([name, v]) => ({ name, quantity: Math.round(v.qty), orders: v.count }));
    const productPieSeries = productSeries.map(p => ({ name: p.name, value: p.quantity }));
    const statusSeries = Object.entries(byStatus).map(([name, value]) => ({ name: title(name), value: Number(value) }));
    return { total, totalQty, avgQty, byStatus, avgHours, spend, productSeries, productPieSeries, statusSeries };
  }, [orders]);

  return (
    <Guard allow={['customer'] as any}>
      <div className="relative max-w-6xl mx-auto p-6 space-y-4">
        {/* Background visuals */}
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-[-6rem] right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-3xl animate-pulse [animation-delay:300ms]" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundPosition: '0 0, 0 0' }} />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">Order History Analytics</h1>
        {loading ? <div className="text-sm text-gray-400">Loading…</div> : error ? <div className="text-sm text-red-400">{error}</div> : (
          <>
            {(() => { if (!ready) setTimeout(()=> setReady(true), 0); return null; })()}
            <section className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <Card label="Total Orders" value={metrics.total} />
              <Card label="Total Quantity (t)" value={metrics.totalQty.toLocaleString()} />
              <Card label="Avg Qty / Order" value={metrics.avgQty} />
              <Card label="Est. Spend (₹)" value={metrics.spend.toLocaleString()} />
            </section>
            <section className={`rounded-xl border border-white/10 p-4 bg-white/[0.03] backdrop-blur-md transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <h2 className="font-medium mb-2">Quantity by Product (Top 10)</h2>
              {metrics.productPieSeries.length === 0 ? (
                <div className="text-sm text-gray-400">No data available.</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metrics.productPieSeries} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} label>
                        {metrics.productPieSeries.map((entry, index) => (
                          <Cell key={`cell-prod-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {metrics.productPieSeries.length > 8 && (
                <div className="mt-2 text-xs text-white/60">Showing top 10 products by quantity.</div>
              )}
            </section>
            <section className={`rounded-xl border border-white/10 p-4 bg-white/[0.03] backdrop-blur-md transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <h2 className="font-medium mb-2">Status Breakdown</h2>
              {Object.keys(metrics.byStatus).length===0 ? (
                <div className="text-sm text-gray-400">No orders yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ul className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(metrics.byStatus).map(([k,v]) => (
                      <li key={k} className="rounded border border-white/10 p-2 flex items-center justify-between bg-black/20">
                        <span className="opacity-80">{title(k)}</span>
                        <span className="font-medium">{Number(v)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={metrics.statusSeries} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} fill="#60a5fa" label />
                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </section>
            <section className={`rounded-xl border border-white/10 p-4 bg-white/[0.03] backdrop-blur-md transition-all duration-500 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <h2 className="font-medium mb-1">Average Delivery Time</h2>
              <div className="text-sm text-gray-400">Approximate based on ETA where available</div>
              <div className="mt-2 text-xl">{metrics.avgHours} hours</div>
            </section>
          </>
        )}
      </div>
    </Guard>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/[0.04] backdrop-blur-md shadow-lg shadow-black/10 hover:shadow-black/20 transition">
      <div className="text-sm opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function title(s: string) { return s.replace(/_/g,' ').toLowerCase().replace(/\b\w/g, c=>c.toUpperCase()); }
