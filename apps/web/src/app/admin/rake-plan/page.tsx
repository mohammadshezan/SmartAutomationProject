"use client";
import Guard from "@/components/Guard";
import { useToast } from "@/components/Toast";
import { withBase } from "@/lib/config";
import { useState } from "react";

type RakeStep = { orderId: string; loadingPointId: number|null; loadingPointName: string; stockyardId: number|null; stockyardName: string; tons: number };
type RakePlan = { code: string; region: string; cargo: string; wagonType: string; wagons: number; avgWagonCapTons: number; plannedTons: number; utilizationPct: number|null; destination: string; steps: RakeStep[] };

export default function RakePlannerPage() {
  const Toast = useToast();
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [region, setRegion] = useState<string>("");
  const [applyPlan, setApplyPlan] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [rakes, setRakes] = useState<RakePlan[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const [orderIdsText, setOrderIdsText] = useState<string>("");
  const [applyAlloc, setApplyAlloc] = useState<boolean>(false);
  const [allocResults, setAllocResults] = useState<any[]>([]);
  const [allocApplied, setAllocApplied] = useState<any[]>([]);

  const runDailyPlan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token')||'';
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } as any;
      const body: any = { date: `${date}T00:00:00.000Z` };
      if (region.trim()) body.region = region.trim();
      if (applyPlan) body.apply = true;
      const res = await fetch(withBase('/workflow/rake/plan/daily'), { method: 'POST', headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to plan');
      setRakes(data.rakes || []);
      setSummary(data.summary || null);
      Toast.push({ text: applyPlan ? `Applied ${data.applied?.length||0} rake(s)` : `Planned ${data.rakes?.length||0} rake(s)`, tone: 'success' });
    } catch (e: any) {
      Toast.push({ text: e.message || 'Failed to run plan', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const runAllocationOptimize = async () => {
    setLoading(true);
    try {
      const ids = orderIdsText.split(/\s|,|\n/).map(s=>s.trim()).filter(Boolean);
      if (!ids.length) { Toast.push({ text: 'Enter at least one orderId', tone: 'error' }); setLoading(false); return; }
      const token = localStorage.getItem('token')||'';
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } as any;
      const body: any = { orderIds: ids };
      if (applyAlloc) body.apply = true;
      const res = await fetch(withBase('/workflow/allocate/optimize'), { method: 'POST', headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to optimize');
      setAllocResults(data.results || []);
      setAllocApplied(data.applied || []);
      Toast.push({ text: applyAlloc ? `Applied ${data.applied?.length||0} allocation(s)` : `Analyzed ${data.results?.length||0} order(s)`, tone: 'success' });
    } catch (e: any) {
      Toast.push({ text: e.message || 'Failed to run optimizer', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (n?: number) => typeof n === 'number' ? n.toLocaleString('en-IN') : '—';

  return (
    <Guard allow={["manager","admin","logistics_planner"] as any}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-brand-green">Daily Rake Formation & Allocation</h1>
        <p className="text-white/60">Run the daily rake plan and optimize stockyard allocations. Apply updates directly when ready.</p>

        {/* Daily Rake Formation Plan */}
        <section className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Daily Rake Formation Plan</h2>
            <button onClick={runDailyPlan} disabled={loading} className="rounded bg-brand-green text-black px-4 py-2">{applyPlan ? 'Apply Plan' : 'Run Plan'}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs">Date</label>
              <input type="date" value={date} onChange={e=> setDate(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1" />
            </div>
            <div>
              <label className="text-xs">Region (optional)</label>
              <input value={region} onChange={e=> setRegion(e.target.value)} placeholder="e.g., Durgapur" className="w-full bg-black/30 border border-white/10 rounded px-2 py-1" />
            </div>
            <label className="flex items-center gap-2 mt-5 md:mt-0"><input type="checkbox" checked={applyPlan} onChange={e=> setApplyPlan(e.target.checked)} /> Apply changes</label>
          </div>
          {summary && (
            <div className="text-sm text-white/80">Rakes: {summary.totalRakes} · Tons: {formatINR(summary.totalTons)} · Avg Util: {summary.avgUtilizationPct ?? '—'}%</div>
          )}
          <div className="space-y-2">
            {rakes.map(rk => (
              <div key={rk.code} className="p-3 rounded-lg border border-white/10 bg-black/20">
                <div className="flex flex-wrap gap-4 justify-between">
                  <div><span className="font-semibold">{rk.code}</span> · {rk.region} · {rk.cargo}</div>
                  <div className="text-sm text-white/70">{rk.wagonType} · {rk.wagons} wagons · {rk.plannedTons}t · Util {rk.utilizationPct ?? '—'}%</div>
                </div>
                <div className="mt-2 text-xs text-white/70 grid gap-1">
                  {rk.steps.map((s, i) => (
                    <div key={rk.code + '-' + i} className="flex justify-between">
                      <div>• Order {s.orderId}</div>
                      <div>{s.stockyardName} / {s.loadingPointName}</div>
                      <div>{s.tons}t</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Allocation Optimizer */}
        <section className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Allocation Optimizer</h2>
            <button onClick={runAllocationOptimize} disabled={loading} className="rounded bg-brand-green text-black px-4 py-2">{applyAlloc ? 'Apply Allocation' : 'Analyze Allocation'}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs">Order IDs (comma/space/line separated)</label>
              <textarea value={orderIdsText} onChange={e=> setOrderIdsText(e.target.value)} rows={3} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1" placeholder="ord-abc123, ord-def456" />
            </div>
            <label className="flex items-center gap-2 mt-5 md:mt-0"><input type="checkbox" checked={applyAlloc} onChange={e=> setApplyAlloc(e.target.checked)} /> Apply changes</label>
          </div>
          <div className="space-y-2">
            {allocResults.map(r => (
              <div key={r.orderId} className="p-3 rounded-lg border border-white/10 bg-black/20">
                <div className="flex flex-wrap justify-between gap-2">
                  <div><span className="font-semibold">Order {r.orderId}</span></div>
                  {r.recommended ? (
                    <div className="text-sm text-white/80">{r.recommended.stockyardName} · {r.recommended.warehouseLocation} · ₹{formatINR(r.recommended.costs.total)} · Dist {r.recommended.distanceKm}km · Util pot {r.recommended.utilizationPotentialPct}%</div>
                  ) : (
                    <div className="text-sm text-red-400">No candidate</div>
                  )}
                </div>
                {r.candidates && r.candidates.length > 0 && (
                  <div className="mt-2 text-xs text-white/70 grid gap-1">
                    {r.candidates.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <div>• {c.stockyardName}</div>
                        <div>₹{formatINR(c.costs.total)}</div>
                        <div>{c.distanceKm}km</div>
                        <div>{c.meetsSLA ? 'SLA✓' : 'SLA✕'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {allocApplied && allocApplied.length > 0 && (
            <div className="text-xs text-white/70">Applied: {allocApplied.map(a=> a.orderId || a.code).join(', ')}</div>
          )}
        </section>
      </div>
    </Guard>
  );
}
