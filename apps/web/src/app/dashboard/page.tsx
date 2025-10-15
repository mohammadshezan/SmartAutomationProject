"use client";
import Guard from "@/components/Guard";
import { useEffect, useState, Fragment } from "react";
import { withBase } from "@/lib/config";

type Order = {
  orderId: string;
  customerId: string;
  cargo: string;
  quantityTons: number;
  sourcePlant: string;
  destination: string;
  priority: string;
  status: string;
  createdAt: string;
};

export default function ApprovalsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, { loading: boolean; error?: string; data?: any }>>({});
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [freightRate, setFreightRate] = useState<Record<string, string>>({});
  const [approvalNote, setApprovalNote] = useState<Record<string, string>>({});
  const [prefetched, setPrefetched] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(withBase('/manager/orders/pending'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')||''}` }
      });
      if (!r.ok) throw new Error('Failed to load');
      const data = await r.json();
      setOrders(data.orders || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Prefetch analysis for all visible orders (limited concurrency) so Source column reflects selection upfront
  useEffect(() => {
    if (!orders.length || prefetched) return;
    const toAnalyze = orders.filter(o => !analysis[o.orderId]);
    if (!toAnalyze.length) { setPrefetched(true); return; }
    const concurrency = Math.min(4, toAnalyze.length);
    let idx = 0;
    const worker = async () => {
      while (idx < toAnalyze.length) {
        const current = toAnalyze[idx++];
        try { await analyze(current); } catch {}
        await new Promise(r => setTimeout(r, 100));
      }
    };
    for (let i = 0; i < concurrency; i++) worker();
    setPrefetched(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, prefetched]);

  async function act(id: string, action: 'approve'|'reject') {
    try {
      const body: any = action === 'approve' ? {
        approvalNote: approvalNote[id] || '',
        selectionMeta: analysis[id]?.data || null,
      } : undefined;
      const r = await fetch(withBase(`/manager/orders/${id}/${action}`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')||''}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!r.ok) throw new Error('Action failed');
      await load();
    } catch (e) { console.error(e); }
  }

  function fmtInr(n?: number) {
    if (typeof n !== 'number' || !isFinite(n)) return '-';
    try { return n.toLocaleString('en-IN'); } catch { return String(n); }
  }

  async function analyze(o: Order) {
    setAnalysis(prev => ({ ...prev, [o.orderId]: { loading: true } }));
    try {
      const r = await fetch(withBase('/manager/orders/select-source'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')||''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cargo: o.cargo,
          quantityTons: o.quantityTons,
          destination: o.destination,
          freightRatePerTonKm: (() => { const v = parseFloat(freightRate[o.orderId]); return isFinite(v) && v > 0 && v < 3 ? v : undefined; })()
        })
      });
      if (!r.ok) {
        const err = await r.json().catch(()=>({ error: 'Request failed' }));
        throw new Error(err?.error || 'Request failed');
      }
      const data = await r.json();
      setAnalysis(prev => ({ ...prev, [o.orderId]: { loading: false, data } }));
    } catch (e: any) {
      setAnalysis(prev => ({ ...prev, [o.orderId]: { loading: false, error: e?.message || 'Failed to analyze' } }));
    }
  }

  // Auto-run analysis when a row is expanded
  useEffect(() => {
    if (!openRow) return;
    const o = orders.find(x => x.orderId === openRow);
    if (!o) return;
    if (!analysis[openRow] || (!analysis[openRow].data && !analysis[openRow].loading)) {
      analyze(o);
    }
  }, [openRow]);

  return (
    <Guard allow={["manager"] as any}>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Manager Approvals</h1>
        {loading && <div>Loading…</div>}
        {!loading && orders.length === 0 && (
          <div className="text-sm text-gray-400">No pending orders.</div>
        )}
        <div className="overflow-x-auto rounded-md border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Cargo</th>
                <th className="px-3 py-2 text-left">Qty (T)</th>
                <th className="px-3 py-2 text-left">Source → Destination</th>
                <th className="px-3 py-2 text-left">Priority</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const a = analysis[o.orderId];
                const data = a?.data;
                const selected = data?.selectedSource;
                const candidates: any[] = data?.candidates || [];
                const reason: string = data?.reason || '';
                const distanceKm = data?.distanceKm;
                const totalCost = data?.totalTransportationCost;
                const hasLP = !!(selected?.loadingPointId);
                // Compute analyzed label (from selection) and consider stored DB value
                const analyzedLabel = (() => {
                  if (selected?.name) return selected.name;
                  if (selected?.location) return String(selected.location).split(',')[0];
                  return '';
                })();
                const storedLabel = (o.sourcePlant || '').trim();
                // Display logic:
                // - If no analysis yet, show stored if present; otherwise blank.
                // - If analysis exists and equals stored (case-insensitive), show stored.
                // - If analysis differs from stored, prefer analyzed (so manager sees proposed source pre-approval).
                const srcLabel = (() => {
                  if (!analyzedLabel) return storedLabel || '';
                  if (storedLabel && analyzedLabel.toLowerCase() === storedLabel.toLowerCase()) return storedLabel;
                  return analyzedLabel || storedLabel || '';
                })();
                return (
                  <Fragment key={o.orderId}>
                    <tr className="border-t border-white/5">
                      <td className="px-3 py-2 font-mono">{o.orderId.slice(0,8)}</td>
                      <td className="px-3 py-2">{o.customerId}</td>
                      <td className="px-3 py-2">{o.cargo}</td>
                      <td className="px-3 py-2">{o.quantityTons}</td>
                      <td className="px-3 py-2">
                        {srcLabel || '—'} → {o.destination}
                        {storedLabel && analyzedLabel && analyzedLabel.toLowerCase() !== storedLabel.toLowerCase() && (
                          <span className="ml-2 align-middle text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-gray-300" title={`Stored: ${storedLabel}`}>
                            stored: {storedLabel}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span>{o.priority}</span>
                          {a && !a.loading && (
                            hasLP ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 border border-green-500/40 text-green-300">LP OK</span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300" title="Missing loadingPointId in selection">LP Missing</span>
                            )
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={()=> setOpenRow(prev => prev === o.orderId ? null : o.orderId)} className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/40">
                            {openRow === o.orderId ? 'Hide details' : 'Show details'}
                          </button>
                          <button onClick={()=>act(o.orderId,'approve')} className="px-2 py-1 rounded bg-green-500/20 border border-green-500/40">Approve</button>
                          <button onClick={()=>act(o.orderId,'reject')} className="px-2 py-1 rounded bg-red-500/20 border border-red-500/40">Reject</button>
                        </div>
                      </td>
                    </tr>
                    {openRow === o.orderId && (
                      <tr className="border-t border-white/5 bg-white/5">
                        <td className="px-3 py-3" colSpan={7}>
                          {a?.loading && (
                            <div className="text-xs text-gray-400">Analyzing…</div>
                          )}
                          {a?.error && (
                            <div className="text-red-300 text-xs">{a.error}</div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="rounded border border-white/10 p-3">
                              <div className="text-xs uppercase text-gray-400 mb-1">Freight rate override</div>
                              <div className="flex items-center gap-2">
                                <input value={freightRate[o.orderId]||''} onChange={e=> setFreightRate(prev=> ({ ...prev, [o.orderId]: e.target.value }))} placeholder="e.g. 2.5" className="px-2 py-1 bg-transparent border border-white/10 rounded text-sm w-24" />
                                <button onClick={()=>analyze(o)} className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/40">Re-run</button>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">Must be &gt; 0 and &lt; 3</div>
                            </div>
                            <div className="rounded border border-white/10 p-3">
                              <div className="text-xs uppercase text-gray-400 mb-1">Stored source (DB)</div>
                              <div className="text-sm">
                                {storedLabel ? (
                                  <>
                                    <div className="font-medium">{storedLabel}</div>
                                    <div className="text-gray-400">Persisted in order.sourcePlant</div>
                                  </>
                                ) : (
                                  <div className="text-gray-400">—</div>
                                )}
                              </div>
                            </div>
                            {!a?.error && data && (
                              <>
                              <div className="rounded border border-white/10 p-3">
                                <div className="text-xs uppercase text-gray-400 mb-1">Selected source</div>
                                {selected ? (
                                  <div className="text-sm">
                                    <div className="font-medium">{selected.name}</div>
                                    <div className="text-gray-400">{selected.location}</div>
                                    {selected.loadingPointName && (
                                      <div className="text-gray-400">LP: {selected.loadingPointName}</div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-sm">No selection returned.</div>
                                )}
                              </div>
                              <div className="rounded border border-white/10 p-3">
                                <div className="text-xs uppercase text-gray-400 mb-1">Cost & distance</div>
                                <div className="text-sm">Distance: <span className="font-mono">{distanceKm ?? '-'}</span> km</div>
                                <div className="text-sm">Total cost: ₹ <span className="font-mono">{fmtInr(totalCost)}</span></div>
                              </div>
                              <div className="rounded border border-white/10 p-3">
                                <div className="text-xs uppercase text-gray-400 mb-1">Reason</div>
                                <div className="text-sm">
                                  {reason === 'destination_stockyard_available' && 'Destination stockyard has sufficient inventory'}
                                  {reason === 'lowest_total_cost' && 'Lowest total cost across stockyards'}
                                  {reason === 'nearest_feasible_source' && 'Nearest feasible source (fallback)'}
                                  {!reason && '—'}
                                </div>
                              </div>
                              {!!candidates?.length && (
                                <div className="md:col-span-3 rounded border border-white/10 p-3">
                                  <div className="text-xs uppercase text-gray-400 mb-2">Top candidates</div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {candidates.slice(0,3).map((c:any, idx:number)=> (
                                      <div key={idx} className="rounded bg-white/5 border border-white/10 p-2 text-xs">
                                        <div className="font-medium">{c.stockyardName}</div>
                                        <div className="text-gray-400">{c.warehouseLocation}</div>
                                        <div className="mt-1">Dist: <span className="font-mono">{c.distanceKm}</span> km</div>
                                        <div>Cost: ₹ <span className="font-mono">{fmtInr(c?.costs?.total)}</span></div>
                                        <div className="text-gray-400">Avail: {c.availableTons} T</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              </>
                            )}
                            <div className="md:col-span-3 rounded border border-white/10 p-3">
                              <div className="text-xs uppercase text-gray-400 mb-1">Approval note</div>
                              <textarea value={approvalNote[o.orderId]||''} onChange={e=> setApprovalNote(prev=> ({ ...prev, [o.orderId]: e.target.value }))} rows={2} placeholder="Add an optional note (e.g., why approving the selection)" className="w-full px-2 py-1 bg-transparent border border-white/10 rounded text-sm" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Guard>
  );
}