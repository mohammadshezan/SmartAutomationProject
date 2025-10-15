"use client";
import { useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/config";

type Production = { product: string; rateTph: number; shiftTotalTons: number; todayTons: number };
type FinishedInv = { product: string; readyTons: number; capacityTons: number; thresholdTons: number; low?: boolean };
type CmoYard = { slug: string; name: string; products: Record<string, number> };

export default function MaterialAvailability() {
  const [plantName, setPlantName] = useState<string>("Bokaro Steel Plant");
  const [production, setProduction] = useState<Production[]>([]);
  const [finishedInv, setFinishedInv] = useState<FinishedInv[]>([]);
  const [cmoYards, setCmoYards] = useState<CmoYard[]>([]);
  const [invCheck, setInvCheck] = useState<{ items?: any[]; severe?: number; suggestion?: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // local fallback in case /stock/yard requires supervisor role
  function seededQty(name: string, product: string) {
    const str = `${name}:${product}`;
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    const base = Math.abs(h % 500);
    return 200 + base; // 200..699
  }
  function fallbackCmoYards(): CmoYard[] {
    const names = [
      "Bhilai","Rourkela","Patna","Durgapur","Delhi","Indore","Chennai","Mumbai","Visakhapatnam","Kolkata"
    ];
    const products = ["TMT Bars","Hot Rolled","Galvanised Sheet","Coils","Billets"];
    return names.map(n => ({
      slug: n.toLowerCase().replace(/\s+/g, '-'),
      name: n,
      products: products.reduce((acc, p) => { acc[p] = seededQty(n, p); return acc; }, {} as Record<string, number>)
    }));
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch manager overview (production + finished inventory)
        const p1 = fetch(withBase('/plant/manager/overview'), { headers }).then(async (r) => {
          if (!r.ok) throw new Error(`overview_${r.status}`);
          const j = await r.json();
          return j;
        }).catch(() => null);

        // Fetch CMO stockyards across India
        const p2 = fetch(withBase('/stock/yard'), { headers }).then(async (r) => {
          if (!r.ok) throw new Error(String(r.status));
          const j = await r.json();
          return Array.isArray(j?.yards) ? j.yards as CmoYard[] : [];
        }).catch(() => fallbackCmoYards());

        // Inventory check alerts
        const p3 = fetch(withBase('/manager/inventory/check'), { headers }).then(async (r) => {
          if (!r.ok) throw new Error(`invcheck_${r.status}`);
          return r.json();
        }).catch(() => ({ items: [], severe: 0, suggestion: 'Monitor' }));

        const [ov, yards, invc] = await Promise.all([p1, p2, p3]);
        if (cancelled) return;

        if (ov) {
          setPlantName(ov.plant || 'Bokaro Steel Plant');
          setProduction(Array.isArray(ov.production) ? ov.production : []);
          setFinishedInv(Array.isArray(ov.finishedInventory) ? ov.finishedInventory : []);
        }
        setCmoYards(Array.isArray(yards) ? yards : []);
        setInvCheck(invc || {});
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const alerts = useMemo(() => {
    const list: { level: 'low' | 'high'; scope: 'Plant' | 'CMO'; key: string; detail: string }[] = [];
    // Plant: finished inventory low or high
    for (const f of finishedInv || []) {
      if (typeof f?.readyTons === 'number' && typeof f?.capacityTons === 'number') {
        const pct = f.capacityTons ? (f.readyTons / f.capacityTons) : 0;
        if (f.low || (typeof f.thresholdTons === 'number' && f.readyTons < f.thresholdTons)) {
          list.push({ level: 'low', scope: 'Plant', key: `plant:${f.product}`, detail: `${f.product} low (${fmtT(f.readyTons)} / thr ${fmtT(f.thresholdTons)})` });
        } else if (pct >= 0.85) {
          list.push({ level: 'high', scope: 'Plant', key: `plant:${f.product}`, detail: `${f.product} overstock risk (${Math.round(pct*100)}% cap)` });
        }
      }
    }
    // CMO: heuristic low/high by seeded range (200..699)
    for (const y of cmoYards || []) {
      const entries = Object.entries(y.products || {});
      for (const [prod, qty] of entries) {
        if (qty < 260) list.push({ level: 'low', scope: 'CMO', key: `cmo:${y.slug}:${prod}`, detail: `${y.name} • ${prod} low (${fmtT(qty)})` });
        if (qty > 650) list.push({ level: 'high', scope: 'CMO', key: `cmo:${y.slug}:${prod}`, detail: `${y.name} • ${prod} overstock (${fmtT(qty)})` });
      }
    }
    // Manager inventory check shortages
    const items = Array.isArray(invCheck.items) ? invCheck.items : [];
    for (const it of items) {
      const shortage = Number(it?.shortage || 0);
      if (shortage > 0) {
        list.push({ level: 'low', scope: 'CMO', key: `short:${it.yard}:${it.grade}`, detail: `${it.yard} • ${it.grade} shortage ${fmtT(shortage)}t` });
      }
    }
    // Deduplicate by key
    const map = new Map<string, { level: 'low' | 'high'; scope: 'Plant' | 'CMO'; key: string; detail: string }>();
    for (const a of list) if (!map.has(a.key)) map.set(a.key, a);
    return Array.from(map.values());
  }, [finishedInv, cmoYards, invCheck]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Material Inventory</h2>
        {loading ? <span className="text-xs text-gray-400">Loading…</span> : null}
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Plant production output (finished products ready for dispatch) */}
      <div className="rounded-lg border border-white/10 bg-white/5">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-medium">Plant Production — {plantName}</h3>
            <p className="text-xs text-gray-400">Shift rates and today’s output; finished products ready for dispatch</p>
          </div>
        </div>
        <div className="p-4 grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm mb-2 text-gray-300">Production (today)</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th className="text-left py-2 pr-2">Product</th>
                    <th className="text-right py-2 pr-2">Rate (TPH)</th>
                    <th className="text-right py-2 pr-2">Shift Total (t)</th>
                    <th className="text-right py-2">Today (t)</th>
                  </tr>
                </thead>
                <tbody>
                  {(production||[]).map((p) => (
                    <tr key={p.product} className="border-t border-white/5">
                      <td className="py-2 pr-2">{p.product}</td>
                      <td className="py-2 pr-2 text-right">{fmtN(p.rateTph)}</td>
                      <td className="py-2 pr-2 text-right">{fmtT(p.shiftTotalTons)}</td>
                      <td className="py-2 text-right">{fmtT(p.todayTons)}</td>
                    </tr>
                  ))}
                  {!production?.length && (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-500">No production data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="text-sm mb-2 text-gray-300">Finished Inventory (Ready to Dispatch)</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th className="text-left py-2 pr-2">Product</th>
                    <th className="text-right py-2 pr-2">Ready (t)</th>
                    <th className="text-right py-2 pr-2">Capacity (t)</th>
                    <th className="text-right py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(finishedInv||[]).map((f) => {
                    const pct = f.capacityTons ? f.readyTons / f.capacityTons : 0;
                    const low = f.low || (f.thresholdTons && f.readyTons < f.thresholdTons);
                    const status = low ? 'Low' : (pct >= 0.85 ? 'Overstock' : 'OK');
                    const badgeClass = low ? 'bg-red-500/20 text-red-300' : (pct >= 0.85 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-emerald-500/20 text-emerald-300');
                    return (
                      <tr key={f.product} className="border-t border-white/5">
                        <td className="py-2 pr-2">{f.product}</td>
                        <td className="py-2 pr-2 text-right">{fmtT(f.readyTons)}</td>
                        <td className="py-2 pr-2 text-right">{fmtT(f.capacityTons)}</td>
                        <td className="py-2 text-right"><span className={`px-2 py-1 rounded text-xs ${badgeClass}`}>{status}</span></td>
                      </tr>
                    );
                  })}
                  {!finishedInv?.length && (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-500">No finished inventory</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory at Bokaro plant stockyards (summarized from finished inventory) */}
      <div className="rounded-lg border border-white/10 bg-white/5">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="font-medium">Bokaro Stockyards — Finished Products</h3>
          <p className="text-xs text-gray-400">Per-product ready tonnage within plant yards</p>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(finishedInv||[]).map((f) => (
            <div key={f.product} className="rounded-md border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-gray-400">{f.product}</div>
              <div className="text-lg font-semibold">{fmtT(f.readyTons)}t</div>
              <div className="text-[10px] text-gray-500">Cap {fmtT(f.capacityTons)}t</div>
            </div>
          ))}
          {!finishedInv?.length && (
            <div className="col-span-full text-sm text-gray-500">No plant stockyard inventory</div>
          )}
        </div>
      </div>

      {/* Inventory at CMO stockyards across India */}
      <div className="rounded-lg border border-white/10 bg-white/5">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-medium">CMO Stockyards — Nationwide</h3>
            <p className="text-xs text-gray-400">Top products by yard; uses live endpoint if permitted, otherwise fallback sample</p>
          </div>
        </div>
        <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(cmoYards||[]).map((y) => {
            const entries = Object.entries(y.products||{});
            const top = entries.sort((a,b)=> b[1]-a[1]).slice(0,3);
            return (
              <div key={y.slug} className="rounded-md border border-white/10 bg-black/20 p-3">
                <div className="text-sm font-medium mb-1">{y.name}</div>
                <ul className="text-xs text-gray-300 space-y-1">
                  {top.map(([prod, qty]) => (
                    <li key={prod} className="flex items-center justify-between">
                      <span className="text-gray-400">{prod}</span>
                      <span>{fmtT(qty)}t</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {!cmoYards?.length && (
            <div className="col-span-full text-sm text-gray-500">No CMO yard data</div>
          )}
        </div>
      </div>

      {/* Alerts for low stock / overstock */}
      <div className="rounded-lg border border-white/10 bg-white/5">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-medium">Alerts — Low Stock / Overstock</h3>
            <p className="text-xs text-gray-400">Combined from plant thresholds, CMO heuristics and manager inventory check</p>
          </div>
          {invCheck?.suggestion && (
            <div className="text-xs text-amber-300">{invCheck.suggestion}</div>
          )}
        </div>
        <div className="p-4">
          <ul className="divide-y divide-white/5">
            {(alerts||[]).map(a => (
              <li key={a.key} className="py-2 flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[11px] ${a.level==='low' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{a.level==='low' ? 'Low' : 'Overstock'}</span>
                <span className="text-xs text-gray-400">{a.scope}</span>
                <span className="text-sm">{a.detail}</span>
              </li>
            ))}
            {!alerts?.length && (
              <li className="py-3 text-sm text-gray-500">No alerts at the moment</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function fmtN(n?: number) {
  if (typeof n !== 'number' || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN').format(n);
}
function fmtT(n?: number) {
  if (typeof n !== 'number' || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-IN').format(Math.round(n));
}
