"use client";
import { useEffect, useMemo, useState } from "react";
import Guard from "@/components/Guard";
import { withBase } from "@/lib/config";

export default function AdminProduction() {
  const [horizon, setHorizon] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [entries, setEntries] = useState<{ loadingPointId: number; tons: number; reason?: string }[]>([]);
  const [inventory, setInventory] = useState<{ loadingPoints: any[] } | null>(null);
  const [invFilter, setInvFilter] = useState<string>("");

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''), []);

  const fetchSuggestions = async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(withBase(`/admin/production/optimize/suggest?horizonDays=${horizon}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!r.ok) throw new Error(`Failed: ${r.status}`);
      const j = await r.json();
      setData(j);
    } catch (e:any) { setError(e?.message || String(e)); }
    finally { setLoading(false); }
  };

  const fetchInventory = async () => {
    try {
      const r = await fetch(withBase('/admin/inventory/levels'), { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      setInventory(await r.json());
    } catch {}
  };

  const submitConsumption = async () => {
    if (!entries.length) return;
    setLoading(true); setError(null);
    try {
      const r = await fetch(withBase('/admin/inventory/consume'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entries })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || `Failed: ${r.status}`);
      alert('Consumption recorded.');
      setEntries([]);
      await Promise.all([fetchSuggestions(), fetchInventory()]);
    } catch (e:any) { setError(e?.message || String(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSuggestions(); fetchInventory(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const filteredInv = useMemo(() => {
    const list = inventory?.loadingPoints || [];
    const q = invFilter.trim().toLowerCase();
    if (!q) return list;
    return list.filter((lp:any) => String(lp.name||'').toLowerCase().includes(q) || String(lp.product||'').toLowerCase().includes(q) || String(lp.stockyard||'').toLowerCase().includes(q));
  }, [inventory, invFilter]);

  return (
    <Guard allow={['admin','manager']}>
      <div className="p-6 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Production Optimization</h1>
            <p className="text-sm text-white/60">Suggestions based on rail vs road patterns, warehouse inventory, and loading capabilities.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Horizon (days)</label>
            <input type="number" min={1} max={30} value={horizon} onChange={e=> setHorizon(Number(e.target.value)||7)} className="w-20 rounded bg-black/30 border border-white/10 px-2 py-1" />
            <button onClick={fetchSuggestions} className="rounded bg-brand-green text-black px-3 py-1">Refresh</button>
          </div>
        </div>

        {error && <div className="rounded border border-red-500/50 bg-red-500/10 p-3 text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded border border-white/10 p-4">
            <h2 className="font-semibold mb-2">Summary</h2>
            {!data ? <div className="text-sm text-white/60">{loading? 'Loading...' : 'No data'}</div> : (
              <div className="text-sm space-y-1">
                <div>Horizon: {data.summary?.horizonDays} days</div>
                <div>Rail share: {Math.round((data.summary?.totals?.railShare||0)*100)}%</div>
                <div>Total rail: {data.summary?.totals?.rail} t</div>
                <div>Total road: {data.summary?.totals?.road} t</div>
                <div className="mt-2 font-medium">Bottlenecks</div>
                <ul className="list-disc pl-5">
                  {(data.summary?.bottlenecks||[]).map((b:any, i:number)=> (
                    <li key={i}>{b.name}: {(b.factor*100).toFixed(0)}% capacity factor</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded border border-white/10 p-4">
            <h2 className="font-semibold mb-2">Suggestions</h2>
            {!data ? <div className="text-sm text-white/60">{loading? 'Loading...' : 'No data'}</div> : (
              <ul className="space-y-2">
                {(data.suggestions||[]).map((s:any, i:number)=> (
                  <li key={i} className="text-sm border border-white/10 rounded p-2">
                    <div className="flex items-center justify-between">
                      <div><span className="font-medium">{s.product}</span> — {s.change==='increase'? '+' : ''}{s.deltaTph} tph</div>
                      <span className={`text-xs rounded px-2 py-0.5 ${s.change==='increase'? 'bg-green-500/20 text-green-400':'bg-yellow-500/20 text-yellow-400'}`}>{s.change}</span>
                    </div>
                    <div className="text-white/60">{(s.reasons||[]).join('; ')}</div>
                  </li>
                ))}
                {(!data.suggestions || data.suggestions.length===0) && <li className="text-sm text-white/60">No change suggested</li>}
              </ul>
            )}
          </div>

          <div className="rounded border border-white/10 p-4">
            <h2 className="font-semibold mb-2">Routing Priorities</h2>
            {!data ? <div className="text-sm text-white/60">{loading? 'Loading...' : 'No data'}</div> : (
              <ul className="space-y-2">
                {(data.routing||[]).map((r:any, i:number)=> (
                  <li key={i} className="text-sm border border-white/10 rounded p-2">
                    <div className="font-medium">{r.stockyard}</div>
                    <div className="text-white/60">{r.rationale}</div>
                  </li>
                ))}
                {(!data.routing || data.routing.length===0) && <li className="text-sm text-white/60">No priority changes</li>}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Current Inventory (Loading Points)</h2>
            <div className="flex items-center gap-2">
              <input value={invFilter} onChange={e=> setInvFilter(e.target.value)} placeholder="Filter by name, product, stockyard" className="w-72 rounded bg-black/30 border border-white/10 px-2 py-1 text-sm" />
              <button onClick={fetchInventory} className="rounded border border-white/10 px-3 py-1 text-sm">Refresh</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/60">
                  <th className="py-1 pr-2">LP ID</th>
                  <th className="py-1 pr-2">Name</th>
                  <th className="py-1 pr-2">Stockyard</th>
                  <th className="py-1 pr-2">Product</th>
                  <th className="py-1 pr-2">Stock (t)</th>
                  <th className="py-1 pr-2">Capacity (t)</th>
                  <th className="py-1 pr-2">Fill%</th>
                </tr>
              </thead>
              <tbody>
                {filteredInv.map((lp:any) => (
                  <tr key={lp.id} className="border-t border-white/5">
                    <td className="py-1 pr-2">{lp.id}</td>
                    <td className="py-1 pr-2">{lp.name || '—'}</td>
                    <td className="py-1 pr-2">{lp.stockyard || '—'}</td>
                    <td className="py-1 pr-2">{lp.product || '—'}</td>
                    <td className="py-1 pr-2">{lp.currentTons ?? '—'}</td>
                    <td className="py-1 pr-2">{lp.capacityTons ?? '—'}</td>
                    <td className="py-1 pr-2">{lp.ratio != null ? Math.round(lp.ratio*100) + '%' : '—'}</td>
                  </tr>
                ))}
                {filteredInv.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-2 text-center text-white/60">No inventory rows</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded border border-white/10 p-4">
          <h2 className="font-semibold mb-2">Log Consumption</h2>
          <div className="text-xs text-white/60 mb-2">Record inventory consumption at loading points (tons).</div>
          <div className="space-y-2">
            {entries.map((e, idx)=> (
              <div key={idx} className="flex items-center gap-2">
                <input type="number" placeholder="LoadingPoint ID" value={e.loadingPointId} onChange={ev=> { const v = Number(ev.target.value)||0; setEntries(prev => prev.map((p,i)=> i===idx? {...p, loadingPointId: v}: p)); }} className="w-40 rounded bg-black/30 border border-white/10 px-2 py-1" />
                <input type="number" placeholder="Tons" value={e.tons} onChange={ev=> { const v = Number(ev.target.value)||0; setEntries(prev => prev.map((p,i)=> i===idx? {...p, tons: v}: p)); }} className="w-32 rounded bg-black/30 border border-white/10 px-2 py-1" />
                <input type="text" placeholder="Reason (optional)" value={e.reason||''} onChange={ev=> { const v = ev.target.value; setEntries(prev => prev.map((p,i)=> i===idx? {...p, reason: v}: p)); }} className="flex-1 rounded bg-black/30 border border-white/10 px-2 py-1" />
                <button onClick={()=> setEntries(prev => prev.filter((_,i)=> i!==idx))} className="text-xs rounded border border-white/10 px-2 py-1">Remove</button>
              </div>
            ))}
            <div>
              <button onClick={()=> setEntries(prev => [...prev, { loadingPointId: 1, tons: 10 }])} className="rounded border border-white/10 px-3 py-1 mr-2">Add Row</button>
              <button onClick={submitConsumption} disabled={!entries.length || loading} className="rounded bg-brand-green text-black px-3 py-1 disabled:opacity-60">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </Guard>
  );
}
