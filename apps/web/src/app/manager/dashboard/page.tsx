"use client";
import { useEffect, useMemo, useState } from "react";
import Guard from "@/components/Guard";
import { withBase } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/Toast";
import OperationsSummaryCard from "@/components/OperationsSummaryCard";
// Fallback lightweight header + metric chip components (original fg/ components missing)
function FGHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function FGMetricChip({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 border border-gray-200">
      <span className="uppercase tracking-wide text-[9px] text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </span>
  );
}
import io from 'socket.io-client';

type Production = { product: string; rateTph: number; shiftTotalTons: number; todayTons: number };
type RawInv = { name: string; stockTons: number; capacityTons: number; thresholdTons: number; low: boolean };
type Rake = { code: string; destination: string; product: string; tons: number | null; departedAt: string };
type Order = { id: string; customer: string; product: string; quantityTons: number; destination: string; priority: string; status: string };
type LoadingPoint = { id: number; name: string; product: string; stockyardId: number | null; stockyard: string | null; currentTons: number; capacityTons: number; ratio: number | null };
type YardSummary = { slug: string; name: string; products: Record<string, number> };
type ShortageDonor = { loadingPointId: number; stockyardId: number; stockyardName: string; available: number; distanceKm: number; take: number };
type ShortageItem = {
  stockyardId: number;
  stockyardName: string;
  loadingPointId: number;
  product: string;
  currentTons: number;
  pendingOrderId: string;
  pendingTons: number;
  deficit: number;
  donors: ShortageDonor[];
};

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plant, setPlant] = useState<string>('');
  const [production, setProduction] = useState<Production[]>([]);
  const [raw, setRaw] = useState<RawInv[]>([]);
  const [outgoing, setOutgoing] = useState<Rake[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const Toast = useToast();
  // Legacy banner replaced by toast + persistent panel
  const [notifHistory, setNotifHistory] = useState<Array<{ id: string; ts: number; type: string; message: string; meta?: any }>>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [lpRows, setLpRows] = useState<LoadingPoint[]>([]);
  const [lpError, setLpError] = useState<string | null>(null);
  const [yardsSummary, setYardsSummary] = useState<YardSummary[]>([]);
  const [yardsError, setYardsError] = useState<string | null>(null);
  const [shortages, setShortages] = useState<ShortageItem[]>([]);
  const [shortErr, setShortErr] = useState<string | null>(null);
  const [monitor, setMonitor] = useState<null | { orders: Record<string, number>; rakes: { total: number; dispatched: number }; kpis: { avgUtilizationPct: number | null } }>(null);
  const [monitorErr, setMonitorErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || '') : '';
        const res = await fetch(withBase('/plant/manager/overview'), {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!mounted) return;
        if (!res.ok) {
          const t = await res.text();
          setError(`Failed to load manager overview (${res.status}). ${t||''}`);
        } else {
          const data = await res.json();
          setPlant(data.plant || 'Bokaro Steel Plant');
          setProduction(Array.isArray(data.production) ? data.production : []);
          setRaw(Array.isArray(data.rawInventory) ? data.rawInventory : []);
          // finishedInventory removed from UI
          setOutgoing(Array.isArray(data.outgoingRakes) ? data.outgoingRakes : []);
          setOrders(Array.isArray(data.pendingOrders) ? data.pendingOrders : []);
        }
      } catch (e: any) {
        if (!mounted) return; setError(e?.message || 'Network error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Operations summary (orders by status, rake counts, avg utilization)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setMonitorErr(null);
      try {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || '') : '';
        const res = await fetch(withBase('/workflow/monitor/summary'), {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!mounted) return;
        if (!res.ok) {
          const t = await res.text();
          setMonitorErr(`Failed to load summary (${res.status}). ${t||''}`);
        } else {
          const data = await res.json();
          setMonitor({
            orders: data.orders || {},
            rakes: data.rakes || { total: 0, dispatched: 0 },
            kpis: data.kpis || { avgUtilizationPct: null }
          });
        }
      } catch (e:any) {
        if (!mounted) return; setMonitorErr(e?.message || 'Network error');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Pre-approval shortages with suggested nearest donors
  useEffect(() => {
    let mounted = true;
    (async () => {
      setShortErr(null);
      try {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || '') : '';
        const res = await fetch(withBase('/manager/stockyards/inventory/shortages'), {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!mounted) return;
        if (!res.ok) {
          const t = await res.text();
          setShortErr(`Failed to load shortages (${res.status}). ${t||''}`);
        } else {
          const data = await res.json();
          setShortages(Array.isArray(data.items) ? data.items : []);
        }
      } catch (e: any) {
        if (!mounted) return; setShortErr(e?.message || 'Network error');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch stockyard inventory levels (loading points grouped by stockyard)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLpError(null);
      try {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || '') : '';
        const res = await fetch(withBase('/admin/inventory/levels'), {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!mounted) return;
        if (!res.ok) {
          const t = await res.text();
          setLpError(`Failed to load stockyard levels (${res.status}). ${t||''}`);
        } else {
          const data = await res.json();
          const rows = Array.isArray(data.loadingPoints) ? data.loadingPoints as LoadingPoint[] : [];
          setLpRows(rows);
        }
      } catch (e: any) {
        if (!mounted) return; setLpError(e?.message || 'Network error');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch per-stockyard rollups (same data the Supervisor sees)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setYardsError(null);
      try {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || '') : '';
        const res = await fetch(withBase('/stock/yard'), {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!mounted) return;
        if (!res.ok) {
          const t = await res.text();
          setYardsError(`Failed to load stockyards (${res.status}). ${t||''}`);
        } else {
          const data = await res.json();
          setYardsSummary(Array.isArray(data.yards) ? data.yards : []);
        }
      } catch (e: any) {
        if (!mounted) return; setYardsError(e?.message || 'Network error');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // WebSocket notifications for low stock / rake plan
  useEffect(() => {
    const socket = io(withBase('/'));
    const handler = (a: any) => {
      if (!a) return;
      const ts = Date.now();
      let message = a.message || '';
      const meta = a.meta || {};
      // Build default messages when not provided
      switch (a.type) {
        case 'low_stock':
          message = message || `Low stock: ${meta.product || ''} @ ${meta.stockyardCity || ''}`; break;
        case 'rake_plan':
          message = message || `Rake plan ready for ${meta.plan?.destination || ''}`; break;
        case 'manager_order':
          message = message || 'Manager order issued'; break;
        case 'inventory_redirect': {
          message = message || `Inventory redirect: Order ${meta.orderId} → LP #${meta.toLp}`; break;
        }
        case 'inventory_split': {
          const splits = (meta.splits||[]).map((s:any)=> `${s.qty}t@LP${s.loadingPointId}${s.primary?'*':''}`).join(', ');
            message = message || `Split fulfillment: Order ${meta.orderId} (${splits})`; break;
        }
      }
      // Determine tone (for toast color) and store history
  const isWarn = ['low_stock','inventory_redirect','inventory_split'].includes(a.type);
  // Map warning style to 'error' tone (or 'info') since Toast supports info/success/error
  Toast.push({ text: message, tone: isWarn ? 'error' : 'info' });
      setNotifHistory(prev => {
        const next = [{ id: `${a.type}-${ts}-${Math.random().toString(36).slice(2)}`, ts, type: a.type, message, meta }, ...prev];
        return next.slice(0, 50); // keep last 50
      });
    };
    socket.on('alert', handler);
    return () => { socket.off('alert', handler); socket.close(); };
  }, [Toast]);

  // finished products section removed
  const stockyards = useMemo(() => {
    const bySy = new Map<string, { id: number | null; name: string; total: number; capacity: number; items: LoadingPoint[] }>();
    for (const r of lpRows) {
      const key = r.stockyard || 'Unknown';
      const cur = bySy.get(key) || { id: r.stockyardId ?? null, name: key, total: 0, capacity: 0, items: [] };
      cur.total += r.currentTons || 0;
      cur.capacity += r.capacityTons || 0;
      cur.items.push(r);
      bySy.set(key, cur);
    }
    return Array.from(bySy.values()).sort((a,b)=> (b.total/b.capacity) - (a.total/a.capacity));
  }, [lpRows]);

  // Hide specific production products from the KPI tiles
  const visibleProduction = useMemo(() => {
    const HIDE_PRODUCTS = new Set([
      'TMT Bars',
      'Billets',
      'Coils',
      'Hot Rolled',
      'Galvanised Sheet',
    ]);
    return (production || []).filter(p => !HIDE_PRODUCTS.has(p.product));
  }, [production]);

  return (
    <Guard allow={["manager","admin"]}>
      <main className="p-6 space-y-6 bg-white text-gray-900">
        <FGHeader
          title={`Manager Dashboard — ${plant}`}
          subtitle="Live production, inventory, shortages and orders overview"
          right={<span className="text-sm text-gray-500">Updated {new Date().toLocaleTimeString()}</span>}
        />

        {loading ? <p className="text-gray-600">Loading…</p> : error ? <div className="text-red-600">{error}</div> : (
          <>
            {/* Notification History Panel */}
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold">Notifications</h2>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={()=> setNotifHistory([])}>Clear</Button>
                  <Button size="sm" variant="secondary" onClick={()=> setPanelOpen(o=> !o)}>{panelOpen? 'Hide':'Show'}</Button>
                </div>
              </div>
              {panelOpen && (
                <div className="max-h-56 overflow-auto divide-y divide-gray-100 text-xs">
                  {notifHistory.length === 0 && (
                    <div className="p-3 text-gray-500">No notifications yet.</div>
                  )}
                  {notifHistory.map(n => {
                    const warn = ['low_stock','inventory_redirect','inventory_split'].includes(n.type);
                    const bg = warn ? 'bg-amber-50' : 'bg-blue-50';
                    const text = warn ? 'text-amber-800' : 'text-blue-800';
                    // Deep link resolution
                    let link: string | null = null;
                    if (n.type === 'rake_plan') link = '/manager/rake-planner';
                    if (n.type === 'inventory_redirect' || n.type === 'inventory_split') link = '/manager/rake-planner';
                    return (
                      <div key={n.id} className={`p-3 flex flex-col gap-1 ${bg} ${text}`}> 
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 leading-snug">{n.message}</div>
                          <div className="shrink-0 text-[10px] opacity-70">{new Date(n.ts).toLocaleTimeString()}</div>
                        </div>
                        {n.type === 'inventory_split' && n.meta?.splits && (
                          <ul className="pl-4 list-disc space-y-0.5 text-[10px]">
                            {n.meta.splits.map((s:any,i:number)=>(<li key={i}>{s.qty} t @ LP {s.loadingPointId}{s.primary? ' (primary)':''}</li>))}
                          </ul>
                        )}
                        {n.type === 'inventory_redirect' && (
                          <div className="text-[10px]">From LP {n.meta?.fromLp} → LP {n.meta?.toLp} ({n.meta?.qty} t)</div>
                        )}
                        {link && (
                          <div>
                            <Button asChild size="sm" variant={warn? 'outline':'secondary'}>
                              <a href={link}>View {n.type.includes('rake')? 'Rake Planner':'Order'}</a>
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Operations Summary (polished card) */}
            <OperationsSummaryCard
              data={monitor}
              error={monitorErr}
              onRefresh={async () => {
                try {
                  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || '') : '';
                  const res = await fetch(withBase('/workflow/monitor/summary'), { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
                  if (res.ok) {
                    const data = await res.json();
                    setMonitor({ orders: data.orders||{}, rakes: data.rakes||{ total:0, dispatched:0 }, kpis: data.kpis||{ avgUtilizationPct: null } });
                  }
                } catch {}
              }}
            />
            {/* Production KPI cards */}
            {visibleProduction.length > 0 && (
              <SectionCard title="Production KPIs">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {visibleProduction.map(p => (
                    <Card key={p.product} className="border border-gray-200 shadow-sm hover:shadow-md transition">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{p.product}</span>
                          <FGMetricChip label="Rate" value={`${p.rateTph} tph`} />
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <FGMetricChip label="Shift" value={`${p.shiftTotalTons.toLocaleString()} t`} />
                          <FGMetricChip label="Today" value={`${p.todayTons.toLocaleString()} t`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Inventory: Raw Materials */}
            <SectionCard title="Raw Materials Inventory" idAnchor="raw-inventory">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {raw.map(r => {
                  const pct = Math.max(0, Math.min(100, (r.stockTons / r.capacityTons) * 100));
                  const left = Math.max(0, r.capacityTons - r.stockTons);
                  return (
                    <div key={r.name} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-baseline justify-between">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-sm font-semibold">{r.stockTons.toLocaleString()} t</div>
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-gray-200 rounded">
                        <div className={`h-1.5 rounded ${r.low ? 'bg-red-500' : 'bg-brand-green'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-1 text-[11px] text-gray-600">{left.toLocaleString()} t left out of {r.capacityTons.toLocaleString()} t {r.low && <span className="ml-2 text-red-600">(below {r.thresholdTons}t)</span>}</div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Finished Products section removed per request */}

            {/* Stockyards — Inventory at Loading Points */}
            <SectionCard
              idAnchor="stockyards-lp"
              title="Stockyards — Inventory at Loading Points"
              actions={
                <Button variant="outline" size="sm" onClick={async () => {
                      try {
                        const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || '') : '';
                        const res = await fetch(withBase('/admin/inventory/levels'), {
                          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
                        });
                        if (res.ok) {
                          const data = await res.json();
                          const rows = Array.isArray(data.loadingPoints) ? data.loadingPoints as LoadingPoint[] : [];
                          setLpRows(rows);
                        }
                        // also refresh shortages view
                        const res2 = await fetch(withBase('/manager/stockyards/inventory/shortages'), {
                          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
                        });
                        if (res2.ok) {
                          const d2 = await res2.json();
                          setShortages(Array.isArray(d2.items) ? d2.items : []);
                        }
                      } catch {}
                    }}>Refresh</Button>
              }
            >
              {lpError ? (
                <div className="text-red-600 text-sm">{lpError}</div>
              ) : stockyards.length === 0 ? (
                <p className="text-gray-600 text-sm">No stockyard inventory data available.</p>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {stockyards.map(sy => {
                    const pct = sy.capacity > 0 ? Math.max(0, Math.min(100, (sy.total / sy.capacity) * 100)) : 0;
                    const items = sy.items.slice().sort((a,b)=> (b.currentTons||0)-(a.currentTons||0)).slice(0,4);
                    return (
                      <div key={sy.name} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-baseline justify-between mb-1">
                          <div className="font-medium">{sy.name}</div>
                          <div className="text-sm font-semibold">{sy.total.toLocaleString()} t</div>
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-gray-200 rounded">
                          <div className="h-1.5 rounded bg-brand-green" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-1 text-[11px] text-gray-600">Capacity {sy.capacity.toLocaleString()} t</div>
                        <div className="mt-3 text-xs">
                          <div className="text-gray-600 mb-1">Top Loading Points</div>
                          <ul className="space-y-1">
                            {items.map(it => (
                              <li key={it.id} className="flex justify-between">
                                <span className="truncate max-w-[60%]" title={it.name + ' · ' + (it.product || '')}>{it.name} <span className="text-gray-500">({it.product})</span></span>
                                <span className="text-gray-600">{it.currentTons.toLocaleString()} / {it.capacityTons.toLocaleString()} t</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Pre-approval shortages & nearest donor suggestions */}
            <SectionCard
              idAnchor="shortages"
              title="Before Approval — Shortages & Nearest Donors"
              actions={
                <Button variant="outline" size="sm" onClick={async () => {
                    try {
                      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || '') : '';
                      const res = await fetch(withBase('/manager/stockyards/inventory/shortages'), {
                        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setShortages(Array.isArray(data.items) ? data.items : []);
                      }
                    } catch {}
                  }}>Refresh</Button>
              }
            >
              {shortErr ? (
                <div className="text-red-600 text-sm">{shortErr}</div>
              ) : shortages.length === 0 ? (
                <p className="text-gray-600 text-sm">No shortages detected for current pending orders.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[680px] text-sm border border-gray-200 rounded">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2">Stockyard</th>
                        <th className="text-left px-3 py-2">Product</th>
                        <th className="text-right px-3 py-2">Current</th>
                        <th className="text-right px-3 py-2">Pending</th>
                        <th className="text-right px-3 py-2">Deficit</th>
                        <th className="text-left px-3 py-2">Nearest Donors (planned pull)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shortages.map(it => (
                        <tr key={`${it.stockyardId}-${it.loadingPointId}-${it.pendingOrderId}`} className="border-t border-gray-200 align-top">
                          <td className="px-3 py-2">
                            <div className="font-medium">{it.stockyardName}</div>
                            <div className="text-[11px] text-gray-500">LP #{it.loadingPointId}</div>
                          </td>
                          <td className="px-3 py-2">{it.product}</td>
                          <td className="px-3 py-2 text-right">{it.currentTons.toLocaleString()} t</td>
                          <td className="px-3 py-2 text-right">{it.pendingTons.toLocaleString()} t</td>
                          <td className="px-3 py-2 text-right text-red-600">{it.deficit.toLocaleString()} t</td>
                          <td className="px-3 py-2">
                            {it.donors && it.donors.length ? (
                              <ul className="space-y-1">
                                {it.donors.slice(0,3).map(d => (
                                  <li key={`${d.stockyardId}-${d.loadingPointId}`} className="flex items-center justify-between gap-3">
                                    <span className="truncate" title={`From ${d.stockyardName} (LP #${d.loadingPointId})`}>
                                      From <span className="font-medium">{d.stockyardName}</span> · {Math.round(d.distanceKm)} km
                                    </span>
                                    <span className="text-gray-600">{d.take.toLocaleString()} t</span>
                                  </li>
                                ))}
                              </ul>
                            ) : <span className="text-gray-600">No donors found</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            {/* Stockyards — Per Stockyard Rollup (Supervisor-style) */}
            <SectionCard
              idAnchor="stockyards-summary"
              title="Stockyards — Per Stockyard Inventory"
              actions={
                <Button variant="outline" size="sm" onClick={async () => {
                    try {
                      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || '') : '';
                      const res = await fetch(withBase('/stock/yard'), {
                        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setYardsSummary(Array.isArray(data.yards) ? data.yards : []);
                      }
                    } catch {}
                  }}>Refresh</Button>
              }
            >
              {yardsError ? (
                <div className="text-red-600 text-sm">{yardsError}</div>
              ) : yardsSummary.length === 0 ? (
                <p className="text-gray-600 text-sm">No stockyard summaries.</p>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {yardsSummary.map(y => {
                    const entries = Object.entries(y.products || {});
                    const total = entries.reduce((s,[,v])=> s + (v||0), 0);
                    return (
                      <div key={y.slug} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-baseline justify-between mb-1">
                          <div className="font-medium">{y.name}</div>
                          <div className="text-sm font-semibold">{total.toLocaleString()} t</div>
                        </div>
                        {entries.length ? (
                          <div className="mt-2 text-xs">
                            <div className="text-gray-600 mb-1">Top Products</div>
                            <ul className="space-y-1">
                              {entries.slice(0,4).map(([p,v]) => (
                                <li key={p} className="flex justify-between">
                                  <span className="truncate max-w-[60%]" title={p}>{p}</span>
                                  <span className="text-gray-600">{Number(v||0).toLocaleString()} t</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : <p className="text-gray-600 text-xs">No products yet.</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Outgoing rakes and pending orders */}
            <div className="grid md:grid-cols-2 gap-4">
              <SectionCard title="Recent Outgoing Rakes">
                {outgoing.length ? (
                  <ul className="text-sm space-y-1">
                    {outgoing.map(r => (
                      <li key={r.code} className="flex justify-between">
                        <span>{r.code} → {r.destination}</span>
                        <span className="text-gray-600">{r.product} {(r.tons||0).toLocaleString()}t</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-gray-600 text-sm">No recent dispatches.</p>}
              </SectionCard>
              <SectionCard title="Pending/Approved Customer Orders">
                {orders.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-[480px] text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2">Order</th>
                          <th className="text-left px-3 py-2">Customer</th>
                          <th className="text-left px-3 py-2">Product</th>
                          <th className="text-right px-3 py-2">Qty</th>
                          <th className="text-left px-3 py-2">Dest</th>
                          <th className="text-left px-3 py-2">Priority</th>
                          <th className="text-left px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id} className="border-t border-gray-200">
                            <td className="px-3 py-2">{o.id}</td>
                            <td className="px-3 py-2">{o.customer}</td>
                            <td className="px-3 py-2">{o.product}</td>
                            <td className="px-3 py-2 text-right">{o.quantityTons.toLocaleString()} t</td>
                            <td className="px-3 py-2">{o.destination}</td>
                            <td className="px-3 py-2">{o.priority}</td>
                            <td className="px-3 py-2">
                              <span className={
                                o.status === 'APPROVED' || o.status === 'Approved' ? 'text-green-600' :
                                o.status === 'PENDING' || o.status === 'Pending' ? 'text-amber-600' :
                                o.status === 'LOADING' || o.status === 'Loading' ? 'text-blue-600' :
                                o.status === 'EN_ROUTE' || o.status === 'En Route' ? 'text-indigo-600' :
                                o.status === 'REJECTED' || o.status === 'Rejected' ? 'text-red-600' : 'text-gray-600'
                              }>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-gray-600 text-sm">No pending orders.</p>}
              </SectionCard>
            </div>
          </>
        )}
      </main>
    </Guard>
  );
}

function SectionCard({ title, actions, children, idAnchor }: { title?: string; actions?: React.ReactNode; children: React.ReactNode; idAnchor?: string }) {
  return (
    <div id={idAnchor}>
      <Card className="rounded-2xl shadow-sm">
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-gray-200">
          {title ? <h2 className="text-lg font-medium">{title}</h2> : <span />}
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <CardContent className="p-4 md:p-5">
        {children}
      </CardContent>
      </Card>
    </div>
  );
}
