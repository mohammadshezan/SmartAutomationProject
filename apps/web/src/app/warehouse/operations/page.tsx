"use client";
import Guard from "@/components/Guard";
import { useToast } from "@/components/Toast";
import { withBase } from "@/lib/config";
import { useEffect, useMemo, useState } from "react";

type Stockyard = { id: number; name: string; warehouseLocation: string };
type Task = { taskId: string; orderId: string; stockyardId: number; loadingPointId: number; tons: number; status: string; rakeCode?: string; createdAt: string };
type Equipment = { weighbridge: boolean; crane: boolean; loader: boolean; updatedAt: number };

const STATUSES = ["PENDING_PREP","READY_FOR_LOADING","LOADING","LOADED"] as const;

export default function WarehouseOperations() {
  const Toast = useToast();
  const [yards, setYards] = useState<Stockyard[]>([]);
  const [yardId, setYardId] = useState<number|undefined>(undefined);
  const [status, setStatus] = useState<string>("");
  const [rakeFilter, setRakeFilter] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [equipment, setEquipment] = useState<Equipment|null>(null);
  const [inventory, setInventory] = useState<any|null>(null);
  const [aiJson, setAiJson] = useState<string>(() => JSON.stringify({ rakeCode: 'RK-EXAMPLE', steps: [{ orderId: 'ord-1', stockyardId: 1, loadingPointId: 1, tons: 200 }] }, null, 2));
  const [loading, setLoading] = useState(false);

  const tokenHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')||''}` } as any);
  const selectedIds = useMemo(()=> Object.keys(selected).filter(k=> selected[k]), [selected]);

  useEffect(()=> {
    (async()=>{
      try {
        const res = await fetch(withBase('/stockyards'), { headers: tokenHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error||'Failed to load stockyards');
        const list = (data as any[]).map(y=> ({ id: y.id, name: y.name, warehouseLocation: y.warehouseLocation }));
        setYards(list);
        if (!yardId && list.length) setYardId(list[0].id);
      } catch (e: any) { Toast.push({ text: e.message||'Failed to load stockyards', tone: 'error' }); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(()=> { if (yardId) refreshAll(); }, [yardId, status, rakeFilter]);

  async function refreshAll() {
    setLoading(true);
    try {
      await Promise.all([
        refreshTasks(),
        refreshEquipment(),
        refreshInventory()
      ]);
    } finally { setLoading(false); }
  }

  async function refreshTasks() {
    if (!yardId) return;
    const qs = new URLSearchParams();
    qs.set('stockyardId', String(yardId));
    if (status) qs.set('status', status);
    if (rakeFilter.trim()) qs.set('rakeCode', rakeFilter.trim());
    const res = await fetch(withBase(`/yard/loading/tasks?${qs.toString()}`), { headers: tokenHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error||'Failed to load tasks');
    setTasks(data.tasks || []);
    setSelected({});
  }

  async function refreshEquipment() {
    if (!yardId) return;
    const res = await fetch(withBase(`/yard/equipment/status?stockyardId=${yardId}`), { headers: tokenHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error||'Failed to load equipment');
    setEquipment(data.equipment || null);
  }

  async function refreshInventory() {
    if (!yardId) return;
    const res = await fetch(withBase(`/yard/inventory/${yardId}`), { headers: tokenHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error||'Failed to load inventory');
    setInventory(data || null);
  }

  async function toggleEquipment(part: Exclude<keyof Equipment, 'updatedAt'>) {
    if (!yardId) return;
    const next = { ...(equipment||{ weighbridge:true, crane:true, loader:true, updatedAt: Date.now() }) };
    next[part] = !next[part];
    const res = await fetch(withBase('/yard/equipment/toggle'), { method: 'POST', headers: tokenHeaders(), body: JSON.stringify({ stockyardId: yardId, [part]: next[part] }) });
    const data = await res.json();
    if (!res.ok) { Toast.push({ text: data.error||'Failed to toggle', tone: 'error' }); return; }
    setEquipment(data.equipment);
    Toast.push({ text: `Equipment updated: ${part} ${data.equipment[part]?'ON':'OFF'}`, tone: 'success' });
  }

  async function bulk(action: 'prepare'|'start'|'complete') {
    if (!selectedIds.length) { Toast.push({ text: 'Select at least one task', tone: 'error' }); return; }
    const map = { prepare: '/yard/loading/prepare', start: '/yard/loading/start', complete: '/yard/loading/complete' } as const;
    const res = await fetch(withBase(map[action]), { method: 'POST', headers: tokenHeaders(), body: JSON.stringify({ taskIds: selectedIds }) });
    const data = await res.json();
    if (!res.ok) { Toast.push({ text: data.error||`Failed to ${action}`, tone: 'error' }); return; }
    Toast.push({ text: `Updated ${data.updates?.length||0} task(s)`, tone: 'success' });
    await refreshAll();
  }

  async function submitAiInstructions() {
    try {
      const payload = JSON.parse(aiJson);
      const res = await fetch(withBase('/yard/loading/instructions'), { method: 'POST', headers: tokenHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Failed to submit');
      Toast.push({ text: `Created ${data.created} loading task(s)`, tone: 'success' });
      setAiJson(JSON.stringify(payload, null, 2));
      await refreshAll();
    } catch (e: any) {
      Toast.push({ text: e.message||'Invalid JSON or request failed', tone: 'error' });
    }
  }

  function StatusBadge({ s }: { s: string }) {
    const cls = s==='LOADED' ? 'bg-emerald-700' : s==='LOADING' ? 'bg-amber-700' : s==='READY_FOR_LOADING' ? 'bg-blue-700' : 'bg-gray-700';
    return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{s}</span>;
  }

  return (
    <Guard allow={["warehouse_manager","manager","admin","transport_coordinator"] as any}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-green">Warehouse Operations</h1>
          <button onClick={refreshAll} disabled={loading || !yardId} className="rounded border border-white/20 px-3 py-1 hover:bg-white/5">Refresh</button>
        </div>

        {/* Controls */}
        <section className="p-4 rounded-xl border border-white/10 bg-black/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs">Stockyard</label>
              <select value={yardId||''} onChange={e=> setYardId(e.target.value ? Number(e.target.value) : undefined)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1">
                {yards.map(y=> <option key={y.id} value={y.id}>{y.name} · {y.warehouseLocation}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs">Status</label>
              <select value={status} onChange={e=> setStatus(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1">
                <option value="">All</option>
                {STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs">Rake Code</label>
              <input value={rakeFilter} onChange={e=> setRakeFilter(e.target.value)} placeholder="RK-..." className="w-full bg-black/30 border border-white/10 rounded px-2 py-1" />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={()=> bulk('prepare')} disabled={!selectedIds.length} className="rounded bg-blue-600 px-3 py-1 text-sm">Prepare</button>
              <button onClick={()=> bulk('start')} disabled={!selectedIds.length} className="rounded bg-amber-600 px-3 py-1 text-sm">Start</button>
              <button onClick={()=> bulk('complete')} disabled={!selectedIds.length} className="rounded bg-emerald-600 px-3 py-1 text-sm">Complete</button>
            </div>
          </div>
        </section>

        {/* Equipment */}
        <section className="p-4 rounded-xl border border-white/10 bg-black/30">
          <h2 className="text-lg font-semibold">Equipment</h2>
          {equipment ? (
            <div className="flex flex-wrap gap-3 mt-2">
              <button onClick={()=> toggleEquipment('weighbridge')} className={`px-3 py-1 rounded ${equipment.weighbridge? 'bg-emerald-700':'bg-gray-700'}`}>Weighbridge {equipment.weighbridge? 'ON':'OFF'}</button>
              <button onClick={()=> toggleEquipment('crane')} className={`px-3 py-1 rounded ${equipment.crane? 'bg-emerald-700':'bg-gray-700'}`}>Crane {equipment.crane? 'ON':'OFF'}</button>
              <button onClick={()=> toggleEquipment('loader')} className={`px-3 py-1 rounded ${equipment.loader? 'bg-emerald-700':'bg-gray-700'}`}>Loader {equipment.loader? 'ON':'OFF'}</button>
              <div className="text-xs text-white/60 self-center">Updated {new Date(equipment.updatedAt).toLocaleString()}</div>
            </div>
          ) : (<div className="text-white/60 text-sm">No stockyard selected</div>)}
        </section>

        {/* Tasks */}
        <section className="p-4 rounded-xl border border-white/10 bg-black/30">
          <h2 className="text-lg font-semibold">Loading Tasks</h2>
          {tasks.length === 0 ? (
            <div className="text-white/60 text-sm mt-2">No tasks</div>
          ) : (
            <div className="mt-2 overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-white/70">
                  <tr>
                    <th className="p-2"><input type="checkbox" checked={tasks.every(t=> selected[t.taskId])} onChange={e=> setSelected(Object.fromEntries(tasks.map(t=> [t.taskId, e.target.checked])))} /></th>
                    <th className="p-2">Task</th>
                    <th className="p-2">Order</th>
                    <th className="p-2">LP</th>
                    <th className="p-2">Tons</th>
                    <th className="p-2">Rake</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.taskId} className="border-t border-white/10">
                      <td className="p-2"><input type="checkbox" checked={!!selected[t.taskId]} onChange={e=> setSelected({ ...selected, [t.taskId]: e.target.checked })} /></td>
                      <td className="p-2 font-mono text-xs truncate max-w-[140px]" title={t.taskId}>{t.taskId}</td>
                      <td className="p-2">{t.orderId}</td>
                      <td className="p-2">#{t.loadingPointId}</td>
                      <td className="p-2">{t.tons}</td>
                      <td className="p-2">{t.rakeCode || '—'}</td>
                      <td className="p-2"><StatusBadge s={t.status} /></td>
                      <td className="p-2 text-white/60 text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Inventory */}
        <section className="p-4 rounded-xl border border-white/10 bg-black/30">
          <h2 className="text-lg font-semibold">Inventory</h2>
          {!inventory ? (
            <div className="text-white/60 text-sm mt-2">—</div>
          ) : (
            <div className="mt-2 grid gap-2">
              {(inventory.materials||[]).map((m:any) => (
                <div key={m.material} className="p-2 rounded-lg border border-white/10 bg-black/20">
                  <div className="flex justify-between text-sm">
                    <div className="font-medium">{m.material}</div>
                    <div className="text-white/70">{m.totalCurrentTons}t / {m.totalCapacityTons}t</div>
                  </div>
                  <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-1 text-xs text-white/70">
                    {m.points.map((p:any)=> (
                      <div key={p.loadingPointId} className="flex justify-between border border-white/10 rounded px-2 py-1">
                        <span>LP #{p.loadingPointId}</span>
                        <span>{p.currentTons}t / {p.capacityTons}t</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI Instructions intake */}
        <section className="p-4 rounded-xl border border-white/10 bg-black/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Receive AI Instructions</h2>
            <button onClick={submitAiInstructions} className="rounded bg-brand-green text-black px-3 py-1">Create Tasks</button>
          </div>
          <textarea value={aiJson} onChange={e=> setAiJson(e.target.value)} rows={8} className="w-full mt-2 bg-black/30 border border-white/10 rounded p-2 font-mono text-xs" />
          <p className="text-xs text-white/50 mt-1">Paste JSON with rakeCode and steps[] as shown above.</p>
        </section>
      </div>
    </Guard>
  );
}
