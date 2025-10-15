"use client";
import Guard from "@/components/Guard";
import { useEffect, useState, Fragment, useRef } from "react";
import { useToast } from "@/components/Toast";
import { withBase } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  // Prevent spamming auto-plan when approving several orders quickly
  const lastAutoPlanRef = useRef<number>(0);
  const Toast = useToast();

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

  // Prefetch analysis for first few rows so Source column can reflect selected source without manual expand
  useEffect(() => {
    if (!orders.length) return;
    const toAnalyze = orders.slice(0, 5).filter(o => !analysis[o.orderId]);
    toAnalyze.forEach((o, idx) => setTimeout(() => analyze(o), idx * 150));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

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
      // Trigger unified auto-rake-plan backend pipeline after approvals, throttled
      if (action === 'approve') {
        const now = Date.now();
        if (now - lastAutoPlanRef.current > 5000) {
          lastAutoPlanRef.current = now;
          (async () => {
            const token = localStorage.getItem('token')||'';
            try {
              const run = await fetch(withBase('/workflow/auto-rake-plan'), { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ wagonCapacity: 60 }) });
              const data = await run.json().catch(()=>({}));
              if (!run.ok) throw new Error(data.error||'Auto plan failed');
              if (data.rakes) {
                Toast.push({ text: `Auto-planned ${data.rakes} rake(s)`, tone: 'success' });
              } else {
                Toast.push({ text: 'No rakes formed (yet)', tone: 'info' });
              }
            } catch (e:any) {
              Toast.push({ text: e.message||'Auto planning pipeline failed', tone: 'error' });
            }
          })();
        }
      }
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Manager Approvals</h1>
          {!!orders.length && (
            <Badge variant="info">{orders.length} pending</Badge>
          )}
        </div>
        {loading && <div className="text-sm text-gray-500">Loading…</div>}
        {!loading && orders.length === 0 && (
          <Card>
            <CardContent>
              <div className="text-sm text-gray-500">No pending orders.</div>
            </CardContent>
          </Card>
        )}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow">
          <table className="min-w-full text-sm text-gray-900">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Order</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Customer</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Cargo</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Qty (T)</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Source → Destination</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Priority</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Actions</th>
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
                    <tr className="border-t border-gray-200">
                      <td className="px-3 py-2 font-mono text-gray-900">{o.orderId.slice(0,8)}</td>
                      <td className="px-3 py-2">{o.customerId}</td>
                      <td className="px-3 py-2">{o.cargo}</td>
                      <td className="px-3 py-2">{o.quantityTons}</td>
                      <td className="px-3 py-2">
                        {srcLabel || '—'} → {o.destination}
                        {storedLabel && analyzedLabel && analyzedLabel.toLowerCase() !== storedLabel.toLowerCase() && (
                          <Badge variant="outline" className="ml-2 align-middle" title={`Stored: ${storedLabel}`}>
                            stored: {storedLabel}
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span>{o.priority}</span>
                          {a && !a.loading && (
                            hasLP ? (
                              <Badge variant="success">LP OK</Badge>
                            ) : (
                              <Badge variant="destructive" title="Missing loadingPointId in selection">LP Missing</Badge>
                            )
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={()=> setOpenRow(prev => prev === o.orderId ? null : o.orderId)}>
                            {openRow === o.orderId ? 'Hide details' : 'Show details'}
                          </Button>
                          <Button variant="default" onClick={()=>act(o.orderId,'approve')}>Approve</Button>
                          <Button variant="destructive" onClick={()=>act(o.orderId,'reject')}>Reject</Button>
                        </div>
                      </td>
                    </tr>
                    {openRow === o.orderId && (
                      <tr className="border-t border-emerald-200 bg-emerald-50">
                        <td className="px-3 py-3" colSpan={7}>
                          {a?.loading && (
                            <div className="text-xs text-gray-500">Analyzing…</div>
                          )}
                          {a?.error && (
                            <div className="text-red-600 text-xs">{a.error}</div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-violet-50 border-violet-200">
                              <CardContent>
                                <div className="text-xs uppercase text-gray-500 mb-1">Freight rate override</div>
                                <div className="flex items-center gap-2">
                                  <input value={freightRate[o.orderId]||''} onChange={e=> setFreightRate(prev=> ({ ...prev, [o.orderId]: e.target.value }))} placeholder="e.g. 2.5" className="px-2 py-1 bg-white border border-gray-300 rounded text-sm w-24" />
                                  <Button variant="outline" onClick={()=>analyze(o)}>Re-run</Button>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Must be &gt; 0 and &lt; 3</div>
                              </CardContent>
                            </Card>
                            {!a?.error && data && (
                              <>
                              <Card className="bg-blue-50 border-blue-200">
                                <CardContent>
                                  <div className="text-xs uppercase text-gray-500 mb-1">Selected source</div>
                                  {selected ? (
                                    <div className="text-sm">
                                      <div className="font-medium text-blue-900">{selected.name}</div>
                                      <div className="text-gray-500">{selected.location}</div>
                                      {selected.loadingPointName && (
                                        <div className="text-gray-500">LP: {selected.loadingPointName}</div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 text-sm">No selection returned.</div>
                                  )}
                                </CardContent>
                              </Card>
                              <Card className="bg-amber-50 border-amber-200">
                                <CardContent>
                                  <div className="text-xs uppercase text-gray-500 mb-1">Cost & distance</div>
                                  <div className="text-sm text-amber-900">Distance: <span className="font-mono">{distanceKm ?? '-'}</span> km</div>
                                  <div className="text-sm text-amber-900">Total cost: ₹ <span className="font-mono">{fmtInr(totalCost)}</span></div>
                                </CardContent>
                              </Card>
                              {!!candidates?.length && (
                                <Card className="md:col-span-3">
                                  <CardContent>
                                    <div className="text-xs uppercase text-gray-500 mb-2">Top candidates</div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {(() => {
                                        const top = candidates.slice(0, 3);
                                        return top.map((c:any, idx:number) => {
                                          const cost = c?.costs?.total ?? Number.POSITIVE_INFINITY;
                                          const isSelected = !!(selected && ((c.loadingPointId && selected.loadingPointId && c.loadingPointId === selected.loadingPointId) || (c.stockyardId && selected.id && c.stockyardId === selected.id)));
                                          const cls = "rounded border border-gray-200 bg-white p-3 text-xs";
                                          return (
                                            <div key={idx} className={`${cls} h-full flex flex-col justify-between`}>
                                              <div>
                                                <div className="font-medium">{c.stockyardName}</div>
                                                <div className="text-gray-500">{c.warehouseLocation}</div>
                                                <div className="mt-1">Dist: <span className="font-mono">{c.distanceKm}</span> km</div>
                                                <div>Cost: ₹ <span className="font-mono">{fmtInr(cost)}</span></div>
                                                <div className="text-gray-600">Avail (product): {c.availableTons} T</div>
                                              </div>
                                              <div className="mt-2 flex items-center gap-2">
                                                {isSelected && (<Badge variant="info">Selected</Badge>)}
                                              </div>
                                            </div>
                                          );
                                        });
                                      })()}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                              </>
                            )}
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
