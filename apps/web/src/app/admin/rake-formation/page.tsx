"use client";
import { useEffect, useState } from "react";
import { withBase } from "@/lib/config";

type Rake = {
  id: string;
  source: string;
  destination: string;
  wagons: Array<{ id: string; type: string; capacity: number }>;
  totalTons: number;
  explanation?: string[];
  orders?: Array<{ id: string; product: string; quantity: number; destination: string; priority: number; dueDate?: string }>;
};

type OptimizeResponse = {
  primary: Rake[];
  alternatives: Array<{ name: string; rakes: Rake[]; description: string; tradeoffs: string }>;
  summary: { totalRakes: number; totalTons: number; avgUtilization: number; avgSLACompliance: number };
  kpis: { costEfficiency: number; slaCompliance: number; carbonIntensity: number; wagonUtilization: number };
};

type Overview = {
  rakes: { total: number; dispatched: number; planned: number };
  orders: { pending: number };
  stock: { lowOpen: number };
};

type ConstraintsResp = {
  constraints: {
    productWagonCompatibility: Record<string, string[]>;
  };
  wagonsByType: Record<string, number>;
  availableWagons: number;
  totalWagons: number;
};

export default function RakeFormation() {
  const [data, setData] = useState<OptimizeResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [constraints, setConstraints] = useState<ConstraintsResp | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const [resPlan, resOverview, resConstraints] = await Promise.all([
          fetch(withBase("/optimize/rake-formation"), {
          method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({}),
          }),
          fetch(withBase("/admin/overview"), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(withBase("/optimize/constraints"), { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!resPlan.ok) throw new Error(await resPlan.text());
        if (!resOverview.ok) throw new Error(await resOverview.text());
        if (!resConstraints.ok) throw new Error(await resConstraints.text());
        const [jPlan, jOverview, jConstraints] = await Promise.all([resPlan.json(), resOverview.json(), resConstraints.json()]);
        // Defensive: ensure structures exist to avoid transient undefined during re-render
        setData({
          primary: Array.isArray(jPlan?.primary) ? jPlan.primary : [],
          alternatives: Array.isArray(jPlan?.alternatives) ? jPlan.alternatives : [],
          summary: jPlan?.summary || { totalRakes: 0, totalTons: 0, avgUtilization: 0, avgSLACompliance: 0 },
          kpis: jPlan?.kpis || { costEfficiency: 0, slaCompliance: 0, carbonIntensity: 0, wagonUtilization: 0 },
        });
        setOverview(jOverview || null);
        setConstraints(jConstraints || null);
      } catch (e) {
        setErr("Failed to load optimization");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rake Formation Status</h2>
        {loading ? <span className="text-xs text-gray-400">Loading…</span> : null}
      </div>
      {err && <div className="text-sm text-red-400">{err}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Stat title="Planned Rakes (Optimizer)" value={data?.summary?.totalRakes} />
        <Stat title="Total Tons" value={data?.summary?.totalTons} />
        <Stat title="Avg Utilization %" value={fmtPct(data?.summary?.avgUtilization)} />
        <Stat title="SLA Compliance %" value={fmtPct(data?.summary?.avgSLACompliance)} />
        <Stat title="Rakes Available (Total)" value={overview?.rakes?.total} />
        <div className="rounded-xl bg-white/5 p-4 border border-white/10">
          <div className="text-xs text-gray-400">Available Breakdown</div>
          <div className="text-sm text-gray-200">Loaded: {overview?.rakes?.dispatched ?? '—'}</div>
          <div className="text-sm text-gray-200">Empty/Planned: {overview?.rakes?.planned ?? '—'}</div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Primary Plan</h3>
        <div className="grid gap-3">
          {data?.primary?.map((r) => (
            <div key={r.id} className="rounded-lg bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.id}</div>
                <div className="text-xs text-gray-400">{r.wagons?.length ?? 0} wagons • {r.totalTons}t</div>
              </div>
              <div className="text-sm text-gray-300">{r.source} → {r.destination}</div>
              {r.explanation?.length ? (
                <ul className="list-disc list-inside mt-2 text-xs text-gray-400">
                  {r.explanation.slice(0, 3).map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          {!loading && !data?.primary?.length && (
            <div className="text-sm text-gray-400">No rakes proposed by optimizer.</div>
          )}
        </div>
      </div>

      {/* Ongoing formations at Bokaro (BKSC) */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Ongoing Rake Formations at Bokaro (BKSC)</h3>
        <div className="grid gap-2">
          {data?.primary?.filter(r => (r.source||'') === 'BKSC').map((r) => (
            <div key={`bk-${r.id}`} className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 flex items-center justify-between">
              <div className="text-sm">{r.id}: {r.source} → {r.destination}</div>
              <div className="text-xs text-gray-300">{r.wagons?.length ?? 0} wagons • {r.totalTons}t</div>
            </div>
          ))}
          {!loading && !(data?.primary?.some(r => r.source === 'BKSC')) && (
            <div className="text-sm text-gray-400">No formations currently planned at Bokaro.</div>
          )}
        </div>
      </div>

      {/* Wagon allocation details by commodity */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Wagon Allocation by Commodity</h3>
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-4 py-2 border-b border-white/10">
            <div className="col-span-3">Commodity</div>
            <div className="col-span-3">Planned Tonnage</div>
            <div className="col-span-3">Approx. Wagons</div>
            <div className="col-span-3">Recommended Wagon Types</div>
          </div>
          <div className="divide-y divide-white/10">
            {(Object.entries(aggregateProductTonnage(data?.primary || [])) as Array<[string, number]>).map(([product, tons]) => (
              <div key={product} className="grid grid-cols-12 gap-2 px-4 py-2 text-sm">
                <div className="col-span-3">{product}</div>
                <div className="col-span-3">{tons}</div>
                <div className="col-span-3">{Math.ceil(Number(tons) / 60)}</div>
                <div className="col-span-3 text-xs text-gray-300">{(constraints?.constraints?.productWagonCompatibility?.[product] || []).join(', ') || '—'}</div>
              </div>
            ))}
            {!loading && (Object.keys(aggregateProductTonnage(data?.primary || [])).length === 0) && (
              <div className="px-4 py-3 text-sm text-gray-400">No commodity allocation available.</div>
            )}
          </div>
        </div>
      </div>

      {/* AI/ML suggested rake composition */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">AI/ML Suggested Rake Composition</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {(data?.primary || []).slice(0, 3).map((r) => {
            const cap = r.wagons?.reduce((s, w) => s + (w.capacity || 0), 0) || 0;
            const util = cap ? (r.totalTons / cap) * 100 : 0;
            const byType = r.wagons?.reduce<Record<string, number>>((acc, w) => {
              acc[w.type] = (acc[w.type] || 0) + 1;
              return acc;
            }, {}) || {};
            return (
              <div key={`comp-${r.id}`} className="rounded-lg bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.id} • {r.source} → {r.destination}</div>
                  <div className="text-xs text-gray-400">Util: {fmtPct(util)}</div>
                </div>
                <div className="mt-2 text-xs text-gray-300">{r.totalTons}t across {r.wagons?.length ?? 0} wagons</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(byType).map(([t, c]) => (
                    <div key={t} className="rounded bg-white/5 border border-white/10 px-2 py-1 text-xs flex items-center justify-between">
                      <span>{t}</span><span className="text-gray-300">{c}</span>
                    </div>
                  ))}
                  {Object.keys(byType).length === 0 && (
                    <div className="text-xs text-gray-400">No wagon details.</div>
                  )}
                </div>
                {r.explanation?.length ? (
                  <ul className="list-disc list-inside mt-2 text-xs text-gray-400">
                    {r.explanation.slice(0, 2).map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl bg-white/5 p-4 border border-white/10">
      <div className="text-xs text-gray-400">{title}</div>
      <div className="text-2xl font-bold">{value ?? "—"}</div>
    </div>
  );
}

function fmtPct(n?: number) {
  if (typeof n !== "number") return "—";
  return Number(n).toFixed(1);
}

function aggregateProductTonnage(rakes: Rake[]) {
  const map: Record<string, number> = {};
  for (const r of rakes) {
    for (const o of r.orders || []) {
      map[o.product] = (map[o.product] || 0) + (o.quantity || 0);
    }
  }
  return map;
}
