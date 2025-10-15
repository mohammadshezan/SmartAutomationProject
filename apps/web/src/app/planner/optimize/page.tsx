"use client";
import { useEffect, useMemo, useState } from "react";
import Guard from "@/components/Guard";
import { useToast } from "@/components/Toast";
import { withBase } from "@/lib/config";
import Link from "next/link";

type Club = {
  region: string;
  cargo: string;
  rakeIndex: number;
  wagons: number;
  avgWagonCapTons: number;
  targetCapacityTons: number;
  totalTons: number;
  utilizationPct: number | null;
  orders: { orderId: string; quantityTons: number }[];
};

type ConsolidationAnalyzeRes = {
  date: { start: string; end: string };
  confirmedCount: number;
  groups: { region: string; ordersCount: number; totalTonnage: number; cargoBreakdown: Record<string, number> }[];
  clubs: Club[];
};

type AllocationCandidate = {
  stockyardId: number;
  stockyardName: string;
  distanceKm: number;
  utilizationPct: number;
  utilizationPotentialPct?: number;
  etaHours: number;
  meetsSLA: boolean;
  costs: { total: number; transport: number; loading: number; demurrage: number; holding: number };
  notes?: string[];
  score?: number;
};

type AllocationResult = { orderId: string; recommended: AllocationCandidate | null; candidates: AllocationCandidate[] };

type RakePlanRake = {
  code: string;
  region: string;
  cargo: string;
  wagons: number;
  avgWagonCapTons: number;
  plannedTons: number;
  utilizationPct: number | null;
  steps: { orderId: string; stockyardName?: string | null; tons: number }[];
};

export default function PlannerOptimizePage() {
  const Toast = useToast();
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [minUtil, setMinUtil] = useState<number>(70);
  const [clubs, setClubs] = useState<Club[] | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [allocW, setAllocW] = useState({ cost: 0.6, utilization: 0.25, sla: 0.15 });
  const [allocMinUtil, setAllocMinUtil] = useState<number>(60);
  const [allocResults, setAllocResults] = useState<AllocationResult[] | null>(null);
  const [rakes, setRakes] = useState<RakePlanRake[] | null>(null);
  const [rakeRegion, setRakeRegion] = useState<string>("");
  const [busy, setBusy] = useState<string | null>(null);

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""), []);

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  const runAnalyze = async () => {
    setBusy("analyze");
    try {
      const res = await fetch(withBase("/workflow/consolidate/analyze"), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ date }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analyze failed");
      setClubs(data.clubs || []);
      Toast.push({ text: `Analyzed ${data.confirmedCount || 0} approved orders`, tone: "success" });
    } catch (e: any) {
      Toast.push({ text: e.message || "Analyze failed", tone: "error" });
    } finally {
      setBusy(null);
    }
  };

  const runApply = async () => {
    setBusy("apply");
    try {
      const res = await fetch(withBase("/workflow/consolidate/apply"), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ date, minUtilizationPct: minUtil }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Apply failed");
      Toast.push({ text: `Created ${data.createdRakes || 0} rakes • Updated ${data.updatedOrders || 0} orders`, tone: "success" });
    } catch (e: any) {
      Toast.push({ text: e.message || "Apply failed", tone: "error" });
    } finally { setBusy(null); }
  };

  const loadSummary = async () => {
    setBusy("summary");
    try {
      const res = await fetch(withBase(`/workflow/consolidate/summary?date=${encodeURIComponent(date)}`), { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Summary failed");
      setSummary(data);
    } catch (e: any) {
      Toast.push({ text: e.message || "Summary failed", tone: "error" });
    } finally { setBusy(null); }
  };

  const runOptimize = async (apply = false) => {
    setBusy(apply ? "opt_apply" : "opt_preview");
    try {
      const body = {
        processAllApprovedToday: true,
        weights: allocW,
        minUtilizationPct: allocMinUtil,
        apply,
      };
      const res = await fetch(withBase("/workflow/allocate/optimize"), { method: "POST", headers: authHeaders, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimize failed");
      setAllocResults(data.results || []);
      if (apply) Toast.push({ text: `Applied allocations for ${data.applied?.length || 0} orders`, tone: "success" });
    } catch (e: any) {
      Toast.push({ text: e.message || "Optimize failed", tone: "error" });
    } finally { setBusy(null); }
  };

  const runRakePlan = async (apply = false) => {
    setBusy(apply ? "rake_apply" : "rake_preview");
    try {
      const res = await fetch(withBase("/workflow/rake/plan/daily"), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ date, region: rakeRegion || undefined, apply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rake plan failed");
      setRakes(data.rakes || []);
      if (apply) Toast.push({ text: `Created ${data.applied?.length || 0} rakes`, tone: "success" });
    } catch (e: any) {
      Toast.push({ text: e.message || "Rake plan failed", tone: "error" });
    } finally { setBusy(null); }
  };

  return (
    <Guard allow={["manager", "admin", "logistics_planner"] as any}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Planner • Optimization Console</h1>
          <Link href="/dashboard" className="text-sm text-white/70 hover:text-white">Back to Dashboard</Link>
        </div>

        {/* Consolidation */}
        <section className="rounded-xl border border-white/10 bg-black/30">
          <div className="p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-white/60">Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Min Utilization (%)</label>
              <input type="number" min={0} max={100} value={minUtil} onChange={e=>setMinUtil(Number(e.target.value)||0)} className="bg-black/40 border border-white/10 rounded px-3 py-2 w-28" />
            </div>
            <div className="flex gap-2">
              <button disabled={busy==="analyze"} onClick={runAnalyze} className="px-3 py-2 rounded border border-white/10 hover:border-brand-green/60">Analyze</button>
              <button disabled={busy==="apply"} onClick={runApply} className="px-3 py-2 rounded bg-brand-green text-black">Apply</button>
              <button disabled={busy==="summary"} onClick={loadSummary} className="px-3 py-2 rounded border border-white/10 hover:border-white/40">Summary</button>
            </div>
          </div>
          <div className="p-4 grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Proposed Clubs</h3>
              <div className="space-y-2 max-h-80 overflow-auto pr-2">
                {(!clubs || clubs.length===0) ? <div className="text-white/60 text-sm">No clubs yet. Run Analyze.</div> : clubs.map((c, i) => (
                  <div key={`${c.region}-${c.cargo}-${i}`} className="p-3 rounded border border-white/10">
                    <div className="text-sm font-medium">{c.cargo} · {c.region.toUpperCase()} · Rake {c.rakeIndex}</div>
                    <div className="text-xs text-white/60">{c.totalTons}t / target {c.targetCapacityTons}t · Util {c.utilizationPct ?? "-"}% · Wagons {c.wagons} × {c.avgWagonCapTons}t</div>
                    <div className="text-xs text-white/60 mt-1">Orders: {c.orders.map(o=>o.orderId).join(", ")}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Daily Summary</h3>
              {summary ? (
                <div className="text-sm space-y-1">
                  <div>Total Orders: {summary.totalOrders}</div>
                  <div>Total Tons: {summary.totalTons}</div>
                  <div>Potential Rakes: {summary.potentialRakes}</div>
                  <div>Avg Utilization: {summary.avgUtilizationPct}%</div>
                </div>
              ) : (
                <div className="text-white/60 text-sm">Load summary to view totals.</div>
              )}
            </div>
          </div>
        </section>

        {/* Allocation Optimization */}
        <section className="rounded-xl border border-white/10 bg-black/30">
          <div className="p-4 grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-white/60">Weight: Cost</label>
              <input type="number" step="0.05" min={0} max={1} value={allocW.cost} onChange={e=>setAllocW(w=>({...w, cost: clamp01(e.target.value)}))} className="bg-black/40 border border-white/10 rounded px-3 py-2 w-28" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Weight: Utilization</label>
              <input type="number" step="0.05" min={0} max={1} value={allocW.utilization} onChange={e=>setAllocW(w=>({...w, utilization: clamp01(e.target.value)}))} className="bg-black/40 border border-white/10 rounded px-3 py-2 w-28" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Weight: SLA</label>
              <input type="number" step="0.05" min={0} max={1} value={allocW.sla} onChange={e=>setAllocW(w=>({...w, sla: clamp01(e.target.value)}))} className="bg-black/40 border border-white/10 rounded px-3 py-2 w-28" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Min Utilization (%)</label>
              <input type="number" min={0} max={100} value={allocMinUtil} onChange={e=>setAllocMinUtil(Number(e.target.value)||0)} className="bg-black/40 border border-white/10 rounded px-3 py-2 w-28" />
            </div>
            <div className="md:col-span-4 flex gap-2">
              <button disabled={busy==="opt_preview"} onClick={()=>runOptimize(false)} className="px-3 py-2 rounded border border-white/10 hover:border-brand-green/60">Preview Optimize (Today’s Approved)</button>
              <button disabled={busy==="opt_apply"} onClick={()=>runOptimize(true)} className="px-3 py-2 rounded bg-brand-green text-black">Apply Allocations</button>
            </div>
          </div>
          <div className="p-4">
            {(!allocResults || allocResults.length===0) ? (
              <div className="text-white/60 text-sm">Run optimization to see recommendations.</div>
            ) : (
              <div className="space-y-3">
                {allocResults.map(r => (
                  <div key={r.orderId} className="p-3 rounded border border-white/10">
                    <div className="text-sm font-medium">Order {r.orderId}</div>
                    {r.recommended ? (
                      <div className="text-xs text-white/60">Recommended: {r.recommended.stockyardName} · ₹{r.recommended.costs.total.toLocaleString()} · UtilPot {(r.recommended.utilizationPotentialPct ?? 0)}% · ETA {r.recommended.etaHours}h {r.recommended.meetsSLA?"(SLA)":"(>SLA)"}</div>
                    ) : (
                      <div className="text-xs text-white/60">No feasible candidate</div>
                    )}
                    {r.candidates?.length ? (
                      <div className="mt-2 grid md:grid-cols-2 gap-2">
                        {r.candidates.slice(0,4).map((c, i) => (
                          <div key={i} className="text-xs border border-white/10 rounded p-2">
                            <div className="font-medium">{c.stockyardName}</div>
                            <div>₹{c.costs.total.toLocaleString()} · {c.distanceKm.toFixed(0)}km · UtilPot {(c.utilizationPotentialPct ?? 0)}% · ETA {c.etaHours}h</div>
                            <div className="text-white/50">{(c.notes||[]).join(" · ")}</div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Rake Planning */}
        <section className="rounded-xl border border-white/10 bg-black/30">
          <div className="p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-white/60">Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Region (optional)</label>
              <input value={rakeRegion} onChange={e=>setRakeRegion(e.target.value)} placeholder="e.g., durgapur" className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div className="flex gap-2">
              <button disabled={busy==="rake_preview"} onClick={()=>runRakePlan(false)} className="px-3 py-2 rounded border border-white/10 hover:border-brand-green/60">Preview Plan</button>
              <button disabled={busy==="rake_apply"} onClick={()=>runRakePlan(true)} className="px-3 py-2 rounded bg-brand-green text-black">Apply & Create Rakes</button>
            </div>
          </div>
          <div className="p-4">
            {(!rakes || rakes.length===0) ? (
              <div className="text-white/60 text-sm">Run the rake planner to see planned rakes.</div>
            ) : (
              <div className="space-y-3">
                {rakes.map(rk => (
                  <div key={rk.code} className="p-3 rounded border border-white/10">
                    <div className="text-sm font-medium">{rk.code} · {rk.cargo} → {rk.region.toUpperCase()}</div>
                    <div className="text-xs text-white/60">{rk.plannedTons}t · Wagons {rk.wagons} × {rk.avgWagonCapTons}t · Util {rk.utilizationPct ?? "-"}%</div>
                    <div className="text-xs text-white/60 mt-1">Steps: {rk.steps.length} orders</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Guard>
  );
}

function clamp01(v: string) {
  const n = Number(v);
  if (!isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
