"use client";
import Guard from "@/components/Guard";
import { useEffect, useState, Fragment, useRef } from "react";
import { withBase, SOCKET_URL } from "@/lib/config";
import { useToast } from "@/components/Toast";
import io from "socket.io-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from 'react';

/**
 * Rake Planner Page (Manager)
 * ---------------------------------------
 * Modeled off the Manager Approvals UI the user provided.
 * Focus: Plan -> Review -> Dispatch lifecycle visibility.
 * Data assumptions (adjust to real API shape):
 *   GET /planner/rakes/status   => { rakes: RakeSummary[] }
 *   GET /planner/rakes/:code    => detailed rake (used when expanding a row)
 *   POST /planner/rakes/:code/dispatch { confirm:true }
 *   POST /planner/auto-plan     => trigger AI rake planning (optionally with body)
 * Socket events (if available): 'rake_planned', 'rake_dispatched'
 */

type RakeSummary = {
  code: string;
  status: string;           // Pending | Planned | Dispatched | En Route | Completed
  destination?: string;
  loadingPoint?: string | null;
  material?: string | null;
  customerName?: string | null;
  wagons?: number;
  eta?: string | null;
  orders?: string[];        // constituent order IDs
  deliveredPct?: number;
  costINR?: number;
};

type RakeDetail = RakeSummary & {
  route?: string;
  wagonType?: string;
  slaMet?: boolean;
  manifest?: Array<{
    customer: string;
    material: string;
    quantityTons: number;
    wagons: number;
    wagonRange?: string;
    costINR?: number;
    eta?: string | null;
    wagonCodes?: string[];
    utilizationPct?: number | null;
    costSharePct?: number | null;
  }>;
};

export default function RakePlannerPage() {
  const Toast = useToast();
  const [rakes, setRakes] = useState<RakeSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, { loading: boolean; error?: string; data?: RakeDetail }>>({});
  const [autoPlanning, setAutoPlanning] = useState(false);
  const [dispatching, setDispatching] = useState<Record<string, boolean>>({});
  const [wagonCapacity, setWagonCapacity] = useState(60);
  const [minTonnage, setMinTonnage] = useState(0);
  const [maxRakes, setMaxRakes] = useState(10);
  const [inventoryUtilThreshold, setInventoryUtilThreshold] = useState(0);
  const [backlog, setBacklog] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ wagonCapacity?: string; minTonnage?: string; maxRakes?: string; inventoryUtilThreshold?: string }>({});

  async function loadRakes() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token')||'';
      const res = await fetch(withBase('/planner/rakes/status'), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Failed to load rakes');
  // Normalize cost field from backend plannedCost into costINR for display
  const rows = (data.rakes||[]).map((r:any)=> ({ ...r, costINR: r.plannedCost ?? r.costINR }));
  setRakes(rows);
    } catch (e:any) {
      Toast.push({ text: e.message||'Load failed', tone: 'error' });
    } finally { setLoading(false); }
  }

  // Initial load
  useEffect(()=>{
    // restore persisted params
    try {
      const saved = JSON.parse(localStorage.getItem('rakePlannerParams')||'{}');
      if (typeof saved.wagonCapacity === 'number') setWagonCapacity(saved.wagonCapacity);
      if (typeof saved.minTonnage === 'number') setMinTonnage(saved.minTonnage);
      if (typeof saved.maxRakes === 'number') setMaxRakes(saved.maxRakes);
      if (typeof saved.inventoryUtilThreshold === 'number') setInventoryUtilThreshold(saved.inventoryUtilThreshold);
    } catch {}
    loadRakes();
    loadBacklog();
  }, []);

  // persist params on change
  useEffect(()=>{
    try { localStorage.setItem('rakePlannerParams', JSON.stringify({ wagonCapacity, minTonnage, maxRakes, inventoryUtilThreshold })); } catch {}
  }, [wagonCapacity, minTonnage, maxRakes, inventoryUtilThreshold]);

  async function loadBacklog() {
    try {
      const token = localStorage.getItem('token')||'';
      const res = await fetch(withBase(`/workflow/rake-backlog?minTonnage=${minTonnage}`), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setBacklog(data.backlog||[]);
    } catch {}
  }

  // Socket-driven refresh + polling fallback (30s)
  useEffect(()=>{
    let socket: any = null;
    let poll: any = null;
    try {
      if (SOCKET_URL) {
        const token = localStorage.getItem('token')||'';
        socket = io(SOCKET_URL, { auth: { token } });
        socket.on('rake_planned', ()=>{ loadRakes(); loadBacklog(); });
        socket.on('rake_dispatched', loadRakes);
        socket.on('order_status_changed', (evt:any)=>{
          // Optimistic minor update: if order becomes PLANNED or DISPATCHED, refresh lists less aggressively
          if (['PLANNED','DISPATCHED','ALLOCATED'].includes(evt?.status)) {
            // throttle full refresh by using a short timeout
            setTimeout(()=>{ loadRakes(); loadBacklog(); }, 500);
          }
        });
      }
    } catch {}
    poll = setInterval(()=>{ loadRakes(); }, 30000);
    return ()=>{ if (socket) { socket.off('rake_planned'); socket.off('rake_dispatched'); socket.off('order_status_changed'); socket.disconnect(); } if (poll) clearInterval(poll); };
  }, []);

  async function expand(code: string) {
    setExpanded(prev => prev === code ? null : code);
    if (expanded === code) return; // collapse action
    if (details[code]?.data || details[code]?.loading) return; // already loading/loaded
    setDetails(prev => ({ ...prev, [code]: { loading: true } }));
    try {
      const token = localStorage.getItem('token')||'';
      async function fetchJson(url: string) {
        const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        let parsed:any = null;
        try { parsed = await r.json(); } catch { throw new Error('invalid_json'); }
        if (!r.ok) throw new Error(parsed?.error||'request_failed');
        return parsed;
      }
      let data:any;
      try {
        data = await fetchJson(withBase(`/planner/rakes/${encodeURIComponent(code)}`));
      } catch (e:any) {
        // Fallback to manager route if code-based endpoint not found
        if (/not_found|invalid_json|request_failed/i.test(e.message||'')) {
          data = await fetchJson(withBase(`/manager/planner/rakes/${encodeURIComponent(code)}`));
        } else throw e;
      }
      const rd: RakeDetail = {
        code: data.code || data.id || code,
        status: data.status || 'Pending',
        destination: data.destination || data.dest || '-',
        loadingPoint: data.loadingPoint || data.origin || '-',
        wagons: data.wagons || data.wagonCount || 0,
        wagonType: data.wagonType || 'BOXN',
        eta: data.eta || data.expectedDelivery || '',
        deliveredPct: data.deliveredPct || data.delivered_percent || 0,
        costINR: data.costINR || data.cost || 0,
        orders: data.orders || [],
        route: data.route || `${data.loadingPoint||'?'} → ${data.destination||'?'}`,
        slaMet: data.slaMet ?? data.sla_met ?? true,
        manifest: (data.manifest || data.lines || []).map((m:any)=>({
          customer: m.customer || m.customerName || '-',
          material: m.material || m.cargo || '-',
          quantityTons: m.quantityTons || m.tons || 0,
          wagons: m.wagons || m.wagonCount || 0,
          wagonRange: m.wagonRange || m.range || '',
          costINR: m.costINR || m.cost || 0,
          eta: m.eta || null,
          wagonCodes: m.wagonCodes || [],
          // Prefer backend-provided utilizationPct; fallback approximate using 60t per wagon
          utilizationPct: (typeof m.utilizationPct === 'number') ? m.utilizationPct : (
            (m.quantityTons && (m.wagons || m.wagonCount)) ? Number((( (m.quantityTons || m.tons || 0) / ((m.wagons || m.wagonCount) * 60)) * 100).toFixed(1)) : null
          ),
          costSharePct: (typeof m.costSharePct === 'number') ? m.costSharePct : undefined,
        }))
      };
      setDetails(prev => ({ ...prev, [code]: { loading: false, data: rd } }));
    } catch (e:any) {
      setDetails(prev => ({ ...prev, [code]: { loading: false, error: e.message||'Failed' } }));
    }
  }

  async function triggerAutoPlan() {
    // simple validation
    const nextErrors: any = {};
    if (wagonCapacity < 10 || wagonCapacity > 120) nextErrors.wagonCapacity = '10 - 120';
    if (minTonnage < 0) nextErrors.minTonnage = '>= 0';
    if (maxRakes < 1 || maxRakes > 50) nextErrors.maxRakes = '1 - 50';
    if (inventoryUtilThreshold < 0 || inventoryUtilThreshold > 1) nextErrors.inventoryUtilThreshold = '0 - 100%';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      Toast.push({ text: 'Fix parameter errors first', tone: 'error' });
      return;
    }
    setAutoPlanning(true);
    try {
      const token = localStorage.getItem('token')||'';
  const body = { wagonCapacity, minTonnage, maxRakes, inventoryUtilThreshold };
      const res = await fetch(withBase('/workflow/auto-rake-plan'), { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error||'Auto-plan failed');
      if (data.rakes) {
        Toast.push({ text: `Planned ${data.rakes} rake(s)`, tone: 'success' });
      } else {
        Toast.push({ text: 'No rakes formed (thresholds unmet)', tone: 'info' });
      }
      await loadRakes();
    } catch (e:any) {
      Toast.push({ text: e.message||'Auto-plan failed', tone: 'error' });
    } finally { setAutoPlanning(false); }
  }

  async function dispatch(code: string) {
    const det = details[code]?.data;
    if (!det) { Toast.push({ text: 'Load details first', tone: 'error' }); return; }
    if (!det.wagons || det.wagons <= 0) { Toast.push({ text: 'Cannot dispatch: no wagons assigned', tone: 'error' }); return; }
    setDispatching(prev => ({ ...prev, [code]: true }));
    try {
      const token = localStorage.getItem('token')||'';
      // Correct endpoint is /workflow/rake/:code/dispatch
      const res = await fetch(withBase(`/workflow/rake/${encodeURIComponent(code)}/dispatch`), { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ confirm:true }) });
      let data: any = {};
      try { data = await res.json(); } catch {
        const raw = await res.text().catch(()=> '');
        throw new Error('Dispatch failed (non-JSON response)');
      }
      if (!res.ok) throw new Error(data.error||'Dispatch failed');
      Toast.push({ text: `Rake ${code} dispatched`, tone: 'success' });
      await loadRakes();
    } catch (e:any) {
      Toast.push({ text: e.message||'Dispatch failed', tone: 'error' });
    } finally { setDispatching(prev => ({ ...prev, [code]: false })); }
  }

  function fmtInr(n?: number) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    try { return n.toLocaleString('en-IN'); } catch { return String(n); }
  }

  function UtilBar({ pct }: { pct?: number | null }) {
    if (typeof pct !== 'number') return <span className="text-gray-400">—</span>;
    const clamped = Math.max(0, Math.min(100, pct));
    return (
      <div className="w-16 h-3 bg-gray-200 rounded overflow-hidden" title={`${clamped}%`}>
        <div className="h-full bg-green-500" style={{ width: clamped + '%' }} />
      </div>
    );
  }

  return (
    <Guard allow={["manager","admin","logistics_planner"] as any}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Rake Planner</h1>
            <p className="text-sm text-gray-500 mt-1">View planned rakes, inspect manifests, and dispatch. Auto-refresh via socket events.</p>
          </div>
          <div className="flex gap-3 flex-wrap items-end">
            <ParamField label="Wagon Cap (t)" value={wagonCapacity} placeholder="60" error={errors.wagonCapacity} onChange={v=> setWagonCapacity(v)} min={10} max={120} />
            <ParamField label="Min Tonnage" value={minTonnage} placeholder="0" error={errors.minTonnage} onChange={v=> setMinTonnage(v)} min={0} />
            <ParamField label="Max Rakes" value={maxRakes} placeholder="10" error={errors.maxRakes} onChange={v=> setMaxRakes(v)} min={1} max={50} />
            <ParamField label="Inventory Util % (0-100)" value={Math.round(inventoryUtilThreshold*100)} placeholder="0" error={errors.inventoryUtilThreshold} onChange={v=> setInventoryUtilThreshold(Math.min(100, Math.max(0,v))/100)} min={0} max={100} />
            <Button variant="outline" disabled={autoPlanning} onClick={triggerAutoPlan}>{autoPlanning? 'Auto-planning…' : 'Run Auto Plan'}</Button>
            <Button variant="default" onClick={loadRakes} disabled={loading}>{loading? 'Refreshing…':'Refresh'}</Button>
          </div>
        </div>
        {backlog.length>0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs space-y-1">
            <div className="font-semibold text-amber-800">Backlog (below Min Tonnage {minTonnage}t)</div>
            <div className="grid md:grid-cols-4 gap-2">
              {backlog.map(b=> (
                <div key={b.destination} className="border border-amber-200 rounded p-2 bg-white flex flex-col">
                  <span className="font-medium text-amber-900 text-xs">{b.destination}</span>
                  <span className="text-amber-700 text-[11px]">{b.totalTons} t / {minTonnage}</span>
                  <span className="text-[10px] text-gray-500">Orders: {b.orderIds?.length||0}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white shadow overflow-x-auto">
          <table className="min-w-full text-sm text-gray-900">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs uppercase text-gray-600 tracking-wide">
                <th className="px-3 py-2">Rake</th>
                <th className="px-3 py-2">Destination</th>
                <th className="px-3 py-2">Material</th>
                <th className="px-3 py-2">Loading Point</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Wagons</th>
                <th className="px-3 py-2">ETA</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Cost</th>
                <th className="px-3 py-2">Orders</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && rakes.length === 0 && (
                Array.from({ length: 4 }).map((_,i)=>(
                  <tr key={i} className="border-t border-gray-200 animate-pulse">
                    <td className="px-3 py-2"><div className="h-4 w-16 bg-gray-200 rounded"/></td>
                    <td className="px-3 py-2"><div className="h-4 w-40 bg-gray-200 rounded"/></td>
                    <td className="px-3 py-2"><div className="h-4 w-10 bg-gray-200 rounded"/></td>
                    <td className="px-3 py-2"><div className="h-4 w-24 bg-gray-200 rounded"/></td>
                    <td className="px-3 py-2"><div className="h-4 w-20 bg-gray-200 rounded"/></td>
                    <td className="px-3 py-2"><div className="h-4 w-16 bg-gray-200 rounded"/></td>
                    <td className="px-3 py-2"><div className="h-4 w-12 bg-gray-200 rounded"/></td>
                    <td className="px-3 py-2"><div className="h-6 w-24 bg-gray-200 rounded"/></td>
                  </tr>
                ))
              )}
              {rakes.map(r => {
                const st = r.status || 'Pending';
                const badge = st === 'Dispatched' ? 'bg-green-100 text-green-700' : st === 'Planned' ? 'bg-yellow-100 text-yellow-700' : st === 'En Route' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600';
                return (
                  <Fragment key={r.code}>
                    <tr className="border-t border-gray-200" title={r.material==='Mixed' && r.orders?.length? `Materials: ${(details[r.code]?.data?.manifest||[]).map(m=>m.material).join(', ')}`: (r.customerName==='Multiple' ? `Customers: ${(details[r.code]?.data?.manifest||[]).map(m=>m.customer).join(', ')}` : '')}>
                      <td className="px-3 py-2 font-mono cursor-pointer" onClick={()=>expand(r.code)} title="Click to expand">{r.code}</td>
                      <td className="px-3 py-2">{r.destination||'—'}</td>
                      <td className="px-3 py-2">{r.material||'—'}</td>
                      <td className="px-3 py-2">{r.loadingPoint||'—'}</td>
                      <td className="px-3 py-2">{r.customerName||'—'}</td>
                      <td className="px-3 py-2">{r.wagons||0}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{r.eta? new Date(r.eta).toLocaleString():'—'}</td>
                      <td className="px-3 py-2"><span className={`inline-block px-2 py-1 rounded text-xs ${badge}`}>{st}</span></td>
                      <td className="px-3 py-2">₹{fmtInr(r.costINR)}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{r.orders?.length||0}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <Button variant={expanded===r.code? 'default':'secondary'} size="sm" onClick={()=>expand(r.code)} className={expanded===r.code? 'bg-green-600 hover:bg-green-500 text-white':'bg-green-100 text-green-700 hover:bg-green-200'}>
                            {expanded===r.code? 'Hide':'Details'}
                          </Button>
                          {st !== 'Dispatched' && st !== 'En Route' && (
                            <Button size="sm" disabled={dispatching[r.code] || !details[r.code]?.data} onClick={()=>dispatch(r.code)} className={!details[r.code]?.data? 'opacity-50 cursor-not-allowed':''}>
                              {dispatching[r.code]? 'Dispatching…': (!details[r.code]?.data? 'Load Details First':'Dispatch')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === r.code && (
                      <tr className="border-t border-gray-200 bg-gray-50/60">
                        <td className="px-3 py-3" colSpan={8}>
                          {details[r.code]?.loading && (
                            <div className="grid grid-cols-5 gap-4 animate-pulse">
                              {Array.from({length:5}).map((_,i)=>(<div key={i} className="h-16 rounded bg-gray-200"/>))}
                              <div className="col-span-5 space-y-2">
                                {Array.from({length:6}).map((_,i)=>(<div key={i} className="h-4 w-full bg-gray-200 rounded"/>))}
                              </div>
                            </div>
                          )}
                          {details[r.code]?.error && (<div className="text-xs text-red-600">{details[r.code]?.error}</div>)}
                          {details[r.code]?.data && (
                            <div className="space-y-4">
                              <div className="grid md:grid-cols-5 gap-4">
                                <InfoCard title="Route" value={details[r.code]!.data!.route} />
                                <InfoCard title="Wagons" value={`${details[r.code]!.data!.wagons} ${details[r.code]!.data!.wagonType||''}`} />
                                <InfoCard title="ETA" value={details[r.code]!.data!.eta ? new Date(details[r.code]!.data!.eta!).toLocaleString(): '—'} />
                                <InfoCard title="Cost" value={`₹${fmtInr(details[r.code]!.data!.costINR)}`} />
                                <InfoCard title="SLA" value={details[r.code]!.data!.slaMet? '✓ Met':'⚠ Not Met'} />
                              </div>
                              <div className="rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-100 text-gray-600 uppercase tracking-wide">
                                    <tr>
                                      <th className="px-3 py-2 text-left">Customer</th>
                                      <th className="px-3 py-2 text-left">Material</th>
                                      <th className="px-3 py-2 text-right">Qty (t)</th>
                                      <th className="px-3 py-2 text-right">Wagons</th>
                                      <th className="px-3 py-2 text-left">Wagon No(s)</th>
                                      <th className="px-3 py-2 text-right">Est. Cost</th>
                                      <th className="px-3 py-2 text-right">Util %</th>
                                      <th className="px-3 py-2 text-right">Cost %</th>
                                      <th className="px-3 py-2 text-left">ETA</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 bg-white">
                                    {details[r.code]!.data!.manifest?.map((m,i)=>(
                                      <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-3 py-1 font-medium text-gray-900">{m.customer}</td>
                                        <td className="px-3 py-1 text-gray-700">{m.material}</td>
                                        <td className="px-3 py-1 text-right tabular-nums">{m.quantityTons}</td>
                                        <td className="px-3 py-1 text-right">{m.wagons}</td>
                                        <td className="px-3 py-1 text-gray-600 text-[10px]" title={m.wagonCodes?.join(', ')}>{m.wagonRange||'—'}</td>
                                        <td className="px-3 py-1 text-right">{m.costINR? `₹${fmtInr(m.costINR)}`:'—'}</td>
                                        <td className="px-3 py-1 text-right text-[10px]">
                                          <div className="flex items-center gap-1 justify-end">
                                            <UtilBar pct={m.utilizationPct} />
                                            <span className="tabular-nums">{typeof m.utilizationPct==='number'? `${m.utilizationPct}%`:'—'}</span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-1 text-right text-[10px]">{typeof m.costSharePct==='number'? `${m.costSharePct}%`:(m.costINR && details[r.code]?.data?.costINR? `${((m.costINR/details[r.code]!.data!.costINR!)*100).toFixed(1)}%`:'—')}</td>
                                        <td className="px-3 py-1 text-gray-600 text-[10px]">{m.eta? new Date(m.eta).toLocaleString():'—'}</td>
                                      </tr>
                                    ))}
                                    {(!details[r.code]!.data!.manifest || details[r.code]!.data!.manifest!.length===0) && (
                                      <tr><td colSpan={7} className="px-3 py-4 text-center text-gray-500">No manifest lines</td></tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {rakes.length===0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="text-gray-500 text-sm mb-2">No rakes yet.</div>
                    <div className="text-gray-400 text-xs">Approve orders and trigger auto-plan to generate rake plans.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Guard>
  );
}

function InfoCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">{title}</p>
      <p className="mt-1 text-xs font-semibold text-gray-900 break-words">{value}</p>
    </div>
  );
}

function ParamField({ label, value, onChange, placeholder, error, min, max }: { label: string; value: number; onChange: (v:number)=>void; placeholder?: string; error?: string; min?: number; max?: number; }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] uppercase text-gray-400 font-medium flex items-center gap-1">
        {label}
        {error && <span className="text-red-500 text-[10px]">{error}</span>}
      </label>
      <input
        type="number"
        value={Number.isFinite(value)? value: ''}
        min={min}
        max={max}
        onChange={e=>{
          const v = Number(e.target.value);
            onChange(Number.isFinite(v)? v: 0);
        }}
        className={`w-32 px-2 py-1 border rounded text-sm bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${error? 'border-red-400 ring-red-300':'border-gray-600 focus:ring-blue-400'}`}
        placeholder={placeholder}
      />
    </div>
  );
}
