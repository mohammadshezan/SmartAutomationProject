"use client";
import Guard from "@/components/Guard";
import { useToast } from "@/components/Toast";
import { useEffect, useState } from "react";
import { withBase, SOCKET_URL } from "@/lib/config";
import io from "socket.io-client";

type Order = { orderId: string; cargo: string; quantityTons: number; destination: string; priority: 'Normal'|'Urgent'; eta?: string|null };

export default function ManagerPlannerPage() {
  const Toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [rakes, setRakes] = useState<any[]>([]);
  const [dispatching, setDispatching] = useState<string | null>(null);

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
      console.warn('Rakes load failed', e?.message||e);
    }
  };
  useEffect(()=>{ 
    load(); loadRakes();
    const t=setInterval(loadRakes, 15000);
    // Socket real-time updates
    let socket: any = null;
    try {
      const token = localStorage.getItem('token')||'';
      socket = SOCKET_URL ? io(SOCKET_URL, { auth: { token } }) : null;
      if (socket) {
        socket.on('rake_planned', ()=> { loadRakes(); load(); });
        socket.on('rake_dispatched', ()=> { loadRakes(); load(); });
      }
    } catch {}
    return ()=>{ clearInterval(t); if (socket) { socket.off('rake_planned'); socket.off('rake_dispatched'); socket.disconnect(); } };
  }, []);

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
    <Guard allow={['manager','admin','logistics_planner'] as any}>
      <div className="fg-theme bg-white text-gray-900 max-w-6xl mx-auto p-6 space-y-6 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Planner • Order Feasibility</h1>
            <p className="text-sm text-gray-500 mt-1">Validate, simulate and confirm pending orders. Auto-refresh every 15s. Dispatch once a rake is planned.</p>
          </div>
        </div>

        {/* Live En Route Rakes */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Live En Route Rakes</div>
            <div className="text-xs text-gray-500">Auto-refreshing</div>
          </div>
          {rakes.filter((r:any)=> r.status==='En Route').slice(0,3).length===0 ? (
            <div className="text-gray-500 text-sm">No rakes en route</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {rakes.filter((r:any)=> r.status==='En Route').slice(0,3).map((r:any)=> (
                <div key={r.code} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.code}</div>
                    <div className="text-xs text-gray-500">{r.deliveredPct}% delivered</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">→ {r.destination||'-'}</div>
                  <div className="text-xs text-gray-500">Loc: {r.currentLocation||'-'}</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>variance(r.code)} className="px-2 py-1 rounded border border-gray-300 hover:border-brand-green/60 text-xs">Variance</button>
                    <a href="/planner/tracking" className="px-2 py-1 rounded bg-brand-green text-black text-xs">Open Tracking</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending / Planned Orders Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left">Order</th>
                <th className="px-4 py-2 text-left">Destination</th>
                <th className="px-4 py-2 text-left">Priority</th>
                <th className="px-4 py-2 text-left">ETA</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(orders||[]).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No pending orders</td></tr>
              )}
              {orders.map(o => {
                const planned = rakes.find((r:any)=> r.orderId === o.orderId || (r.orders && r.orders.includes?.(o.orderId)));
                const dispatched = planned?.status === 'Dispatched';
                return (
                  <tr key={o.orderId} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900 truncate" title={o.cargo}>{o.cargo} × {o.quantityTons}t</td>
                    <td className="px-4 py-2 text-gray-600">{o.destination}</td>
                    <td className="px-4 py-2 text-gray-600 text-xs">{o.priority}</td>
                    <td className="px-4 py-2 text-gray-600 text-xs">{o.eta? new Date(o.eta).toLocaleString(): '—'}</td>
                    <td className="px-4 py-2">
                      {dispatched ? <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Dispatched</span> : planned ? <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs">Planned</span> : <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">Pending</span>}
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      {!planned && (
                        <>
                          <button disabled={busy===o.orderId} onClick={()=>simulate(o.orderId)} className="px-2 py-1 rounded border border-gray-300 hover:border-brand-green/60 text-xs">Sim</button>
                          <button disabled={busy===o.orderId} onClick={()=>confirm(o.orderId)} className="px-2 py-1 rounded bg-brand-green text-black text-xs disabled:opacity-50">{busy===o.orderId? '...' : 'Approve'}</button>
                        </>
                      )}
                      {planned && !dispatched && (
                        <button onClick={()=>{ const code = planned.code || planned.id; window.location.href = `/manager/planner/dispatch/${encodeURIComponent(code)}`; }} className="px-2 py-1 rounded bg-blue-600 text-white text-xs">Review & Dispatch</button>
                      )}
                      {dispatched && (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Guard>
  );
}
