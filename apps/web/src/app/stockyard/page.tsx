"use client";
import Guard from "@/components/Guard";
import { withBase } from "@/lib/config";
import { useEffect, useState } from "react";

type MaterialRow = { name: string; capacityTons: number };
type YardInventory = { id: number; name: string; warehouseLocation: string; materials: MaterialRow[] };

export default function StockyardList() {
  const [yards, setYards] = useState<YardInventory[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(withBase('/stockyards/inventory'), { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { setError(`Failed to load (${res.status})`); return; }
        const data = await res.json();
        setYards(Array.isArray(data) ? data : []);
      } catch (e: any) { setError(e?.message || 'Failed to load'); }
    };
    run();
  }, []);
  return (
    <Guard allow={["supervisor","admin"]}>
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Stockyards</h1>
        <p className="opacity-80">Live inventory by stockyard from seeded Loading Points (materials and capacities).</p>
        {error && <div className="text-sm text-red-400">{error}</div>}
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {yards.map(y => {
            const materialNames = y.materials.map(m => m.name);
            const byName = new Map(y.materials.map(m => [m.name, m.capacityTons]));
            const THRESHOLDS: Record<string, number> = Object.fromEntries(materialNames.map(m => [m, 300]));
            const CAPACITY: Record<string, number> = Object.fromEntries(materialNames.map(m => [m, byName.get(m) || 0]));
            const low = materialNames.filter(p => (byName.get(p) || 0) < (THRESHOLDS[p] || 0));

            return (
              <li key={`${y.id}`} className="rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-lg font-semibold">{y.name}</h2>
                  <span className="text-xs opacity-70">{new Date().toLocaleTimeString()}</span>
                </div>
                {low.length > 0 && (
                  <div className="mb-3 text-xs text-brand-red bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
                    Low stock alert: {low.join(', ')} below threshold
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-[420px] text-sm border border-white/10 rounded">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left px-3 py-2">Product</th>
                        <th className="text-right px-3 py-2 whitespace-nowrap">In Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialNames.map(p => {
                        const cap = CAPACITY[p] || 0;
                        const qty = cap; // visualize capacity as stock baseline until live stock is added
                        const left = Math.max(0, cap - qty);
                        const threshold = THRESHOLDS[p] || 0;
                        const pct = cap ? Math.max(0, Math.min(100, (qty / cap) * 100)) : 0;
                        const isLow = qty < threshold;
                        return (
                          <tr key={p} className="border-t border-white/10 align-top">
                            <td className="px-3 py-2">
                              <div className="font-medium">{p}</div>
                              <div className="mt-1 h-1.5 w-full bg-white/10 rounded">
                                <div className={`${isLow ? 'bg-red-400' : 'bg-brand-green'} h-1.5 rounded`} style={{ width: `${pct || 0}%` }} />
                              </div>
                              <div className="mt-1 text-[11px] opacity-75">
                                {left.toLocaleString()} t left out of {cap.toLocaleString()} t
                                {isLow && <span className="ml-2 text-red-400">(below threshold {threshold}t)</span>}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">{(qty||0).toLocaleString()} t</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </Guard>
  );
}
