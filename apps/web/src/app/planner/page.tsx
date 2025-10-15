"use client";
import Guard from "@/components/Guard";
import { useToast } from "@/components/Toast";
import { useEffect, useState } from "react";
import { withBase } from "@/lib/config";

type Order = { orderId: string; cargo: string; quantityTons: number; destination: string; priority: 'Normal'|'Urgent'; eta?: string|null };

export default function PlannerPage() {
  const Toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [rakes, setRakes] = useState<any[]>([]);

  const load = async () => {
    try {
      const token = localStorage.getItem('token')||'';
      const res = await fetch(withBase('/planner/orders/pending'), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Failed to load pending');
      setOrders(data.orders||[]);
    } catch (e:any) {
      Toast.push({ text: e.message||'Load failed', tone: 'error' });
    }
  };
  const loadRakes = async () => {
    try {
      const token = localStorage.getItem('token')||'';
      const res = await fetch(withBase('/planner/rakes/status'), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Failed to load rakes');
      setRakes(data.rakes||[]);
    } catch (e:any) {
      // non-blocking toast to avoid noise
      console.warn('Rakes load failed', e?.message||e);
    }
  };
  useEffect(()=>{ load(); loadRakes(); const t=setInterval(loadRakes, 15000); return ()=>clearInterval(t); }, []);

  const confirm = async (id: string) => {
    setBusy(id);
    try {
      const token = localStorage.getItem('token')||'';
      const res = await fetch(withBase(`/planner/orders/${id}/confirm`), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ apply: true }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Confirm failed');
      Toast.push({ text: `Order ${id} approved`, tone: 'success' });
      await load();
    } catch (e:any) {
      Toast.push({ text: e.message||'Confirm failed', tone: 'error' });
    } finally { setBusy(null); }
  };

  const simulate = async (id: string) => {
    setBusy(id);
    try {
      const token = localStorage.getItem('token')||'';
      const res = await fetch(withBase(`/workflow/orders/${id}/validate`), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ apply: false }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Simulate failed');
      const eta = data.eta || data?.order?.eta || data?.feasibility?.eta || data?.feasibility?.ETA || '';
      Toast.push({ text: `ETA: ${eta ? new Date(eta).toLocaleString() : 'N/A'}`, tone: 'info' });
    } catch (e:any) {
      Toast.push({ text: e.message||'Simulate failed', tone: 'error' });
    } finally { setBusy(null); }
  };

  const variance = async (code: string) => {
    try {
      const token = localStorage.getItem('token')||'';
      const res = await fetch(withBase(`/planner/performance/variance?code=${encodeURIComponent(code)}`), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Variance failed');
      const sign = data.variance>0?'+':'';
      Toast.push({ text: `${code}: Planned ₹${(data.planned||0).toLocaleString()} · Actual ₹${(data.actual||0).toLocaleString()} · Var ${sign}₹${Math.abs(data.variance||0).toLocaleString()}`, tone: 'info' });
    } catch (e:any) {
      Toast.push({ text: e.message||'Variance failed', tone: 'error' });
    }
  };

  return (
    <Guard allow={["manager","admin","logistics_planner"] as any}>
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Planner • Order Feasibility</h1>
          <div className="flex gap-4 text-sm">
            <a href="/planner/optimize" className="text-white/70 hover:text-white">Optimization Console →</a>
            <a href="/planner/tracking" className="text-white/70 hover:text-white">Tracking & Performance →</a>
          </div>
        </div>

        {/* Live En Route Rakes (compact) */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Live En Route Rakes</div>
            <div className="text-xs text-white/60">Auto-refreshing</div>
          </div>
          {rakes.filter((r:any)=> r.status==='En Route').slice(0,3).length===0 ? (
            <div className="text-white/60 text-sm">No rakes en route</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {rakes.filter((r:any)=> r.status==='En Route').slice(0,3).map((r:any)=> (
                <div key={r.code} className="rounded-lg border border-white/10 p-3 bg-black/20">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.code}</div>
                    <div className="text-xs text-white/60">{r.deliveredPct}% delivered</div>
                  </div>
                  <div className="text-xs text-white/70 mt-1">→ {r.destination||'-'}</div>
                  <div className="text-xs text-white/60">Loc: {r.currentLocation||'-'}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={()=>variance(r.code)} className="px-2 py-1 rounded border border-white/10 hover:border-brand-green/60 text-xs">Variance</button>
                    <a href="/planner/tracking" className="px-2 py-1 rounded bg-brand-green text-black text-xs">Open Tracking</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 divide-y divide-white/10">
          {(orders||[]).length === 0 ? (
            <div className="p-4 text-white/70">No pending orders</div>
          ) : (
            orders.map(o => (
              <div key={o.orderId} className="p-4 flex flex-wrap gap-3 items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{o.cargo} × {o.quantityTons}t → {o.destination}</div>
                  <div className="text-xs text-white/60">Priority: {o.priority} {o.eta ? `· ETA: ${new Date(o.eta).toLocaleString()}` : ''}</div>
                </div>
                <div className="flex gap-2">
                  <button disabled={busy===o.orderId} onClick={()=>simulate(o.orderId)} className="px-3 py-2 rounded border border-white/10 hover:border-brand-green/60">Simulate</button>
                  <button disabled={busy===o.orderId} onClick={()=>confirm(o.orderId)} className="px-3 py-2 rounded bg-brand-green text-black">Confirm</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Guard>
  );
}
