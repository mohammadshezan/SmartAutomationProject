"use client";
import { useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/config";

type EmptyRake = { id: string; station: string; stationName: string; availableFrom: string; windowHours: number; wagons: number; type: string; remarks?: string };
type Segment = { from: [number, number]; to: [number, number]; status: 'clear'|'busy'|'congested'; label: string; km?: number; co2_tons?: number };
type RouteResp = { origin: string; routes: Segment[]; meta?: any; eco?: { bestIndex: number; savingsPercent: number } };

export default function LogisticsTrains() {
  const [emptyRakes, setEmptyRakes] = useState<EmptyRake[]>([]);
  const [routeKey, setRouteKey] = useState<string>("BKSC-DGR");
  const [cargo, setCargo] = useState<string>("steel");
  const [loco, setLoco] = useState<string>("diesel");
  const [tonnage, setTonnage] = useState<number>(3000);
  const [grade, setGrade] = useState<number>(0);
  const [routes, setRoutes] = useState<RouteResp | null>(null);
  const [eta, setEta] = useState<{ eta: string; transitHours: number; confidence: number } | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|undefined>();
  const [startBusy, setStartBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true); setError(undefined);
        const token = typeof window!=="undefined" ? localStorage.getItem('token')||'' : '';
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const p1 = fetch(withBase('/rail/empty-rakes'), { headers }).then(r=> r.json()).catch(()=>({ windows: [] }));
        const p2 = fetch(withBase(`/map/routes?cargo=${encodeURIComponent(cargo)}&loco=${encodeURIComponent(loco)}&grade=${grade}&tonnage=${tonnage}&routeKey=${encodeURIComponent(routeKey)}`), { headers }).then(r=> r.json()).catch(()=>null);
        const p3 = fetch(withBase('/positions'), { headers }).then(r=> r.json()).catch(()=> []);
        const [rk, rt, pos] = await Promise.all([p1, p2, p3]);
        if (cancelled) return;
        setEmptyRakes(Array.isArray(rk?.windows) ? rk.windows : []);
        setRoutes(rt);
        setPositions(Array.isArray(pos) ? pos : []);
      } catch (e:any) {
        if (!cancelled) setError(e?.message || 'Failed to load logistics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [routeKey, cargo, loco, tonnage, grade]);

  useEffect(() => {
    // Compute ETA from last known position to last destination station label if available
    async function computeEta() {
      try {
        const token = typeof window!=="undefined" ? localStorage.getItem('token')||'' : '';
        const headers: HeadersInit = { 'Content-Type': 'application/json', ...(token ? { Authorization:`Bearer ${token}` }: {}) };
        const destLabel = routes?.routes?.[routes.routes.length-1]?.label || 'Durgapur';
        const destination = destLabel.split('→').pop() || 'Durgapur';
        const body = { sourcePlant: 'BKSC', destination };
        const r = await fetch(withBase('/ai/eta'), { method:'POST', headers, body: JSON.stringify(body) });
        if (!r.ok) throw new Error(`eta_${r.status}`);
        const j = await r.json();
        setEta({ eta: j.eta, transitHours: j.transitHours, confidence: j.confidence });
      } catch {
        setEta(null);
      }
    }
    if (routes?.routes?.length) computeEta();
  }, [routes]);

  const liveStatus = useMemo(() => {
    // Derive a simple status for each position
    return (positions||[]).map((p:any) => {
      const delayed = (p.speed||0) < 10 && /Under Construction|Stopped/i.test(p.status||'');
      const rerouted = (p.currentLocationName||'').includes('→') && Math.random() < 0.05; // demo heuristic
      const ontime = !delayed && !rerouted;
      const state = delayed ? 'Delayed' : (rerouted ? 'Rerouted' : 'On-time');
      return { id: p.id, where: p.currentLocationName || 'Unknown', state, speed: p.speed };
    });
  }, [positions]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Logistics & Train Movement</h2>
        {loading && <span className="text-xs text-gray-400">Loading…</span>}
      </div>

      {error && <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 rounded-md px-3 py-2">{error}</div>}

      {/* Railway rake availability (empty rake schedules) */}
      <div className="rounded-lg border border-white/10 bg-white/5">
        <div className="px-4 py-3 border-b border-white/10"><h3 className="font-medium">Empty Rake Availability</h3></div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-400">
              <tr>
                <th className="text-left py-2 pr-2">Window</th>
                <th className="text-left py-2 pr-2">Station</th>
                <th className="text-right py-2 pr-2">Wagons</th>
                <th className="text-left py-2 pr-2">Type</th>
                <th className="text-left py-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {(emptyRakes||[]).map(w => (
                <tr key={w.id} className="border-t border-white/5">
                  <td className="py-2 pr-2">{new Date(w.availableFrom).toLocaleString()} ({w.windowHours}h)</td>
                  <td className="py-2 pr-2">{w.station} — {w.stationName}</td>
                  <td className="py-2 pr-2 text-right">{w.wagons}</td>
                  <td className="py-2 pr-2">{w.type}</td>
                  <td className="py-2">{w.remarks || '—'}</td>
                </tr>
              ))}
              {!emptyRakes?.length && <tr><td colSpan={5} className="py-4 text-center text-gray-500">No windows available</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Train routes (Bokaro → destination) with parameters */}
      <div className="rounded-lg border border-white/10 bg-white/5">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-medium">Train Routes & Emissions</h3>
          <div className="flex gap-2 text-xs items-center">
            <select className="bg-black/30 border border-white/10 rounded px-2 py-1" value={routeKey} onChange={e=> setRouteKey(e.target.value)}>
              <option value="BKSC-DGR">BKSC → DGR</option>
              <option value="BKSC-ROU">BKSC → ROU</option>
              <option value="BKSC-BPHB">BKSC → BPHB</option>
            </select>
            <select className="bg-black/30 border border-white/10 rounded px-2 py-1" value={cargo} onChange={e=> setCargo(e.target.value)}>
              <option value="steel">Steel</option>
              <option value="ore">Ore</option>
              <option value="coal">Coal</option>
              <option value="cement">Cement</option>
            </select>
            <select className="bg-black/30 border border-white/10 rounded px-2 py-1" value={loco} onChange={e=> setLoco(e.target.value)}>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <input type="number" className="w-24 bg-black/30 border border-white/10 rounded px-2 py-1" value={tonnage} onChange={e=> setTonnage(Number(e.target.value)||3000)} placeholder="Tonnage" />
            <input type="number" className="w-20 bg-black/30 border border-white/10 rounded px-2 py-1" value={grade} onChange={e=> setGrade(Number(e.target.value)||0)} placeholder="Grade %" />
            <button className="px-2 py-1 rounded border border-white/20 hover:bg-white/10" onClick={async ()=>{
              try {
                setStartBusy(true);
                const token = localStorage.getItem('token')||'';
                const headers: HeadersInit = { 'Content-Type':'application/json', ...(token? { Authorization:`Bearer ${token}` } : {}) };
                const pathByKey: Record<string, string[]> = {
                  'BKSC-DGR': ['BKSC','Dhanbad','Asansol','Andal','DGR'],
                  'BKSC-ROU': ['BKSC','Purulia','ROU'],
                  'BKSC-BPHB': ['BKSC','Norla','BPHB'],
                };
                const stations = pathByKey[routeKey] || ['BKSC','DGR'];
                const rakeId = `RK-${Math.floor(1000+Math.random()*9000)}`;
                const r = await fetch(withBase('/crew/trip/start-stations'), { method:'POST', headers, body: JSON.stringify({ rakeId, stations }) });
                if (!r.ok) throw new Error('start_failed');
              } catch { /* ignore for demo */ }
              finally { setStartBusy(false); }
            }}>{startBusy ? 'Starting…' : 'Start Demo Trip'}</button>
          </div>
        </div>
        <div className="p-4">
          {routes?.routes?.length ? (
            <ul className="text-sm space-y-2">
              {routes.routes.map((s, i) => (
                <li key={`${s.label}-${i}`} className="flex items-center justify-between border border-white/10 rounded px-3 py-2 bg-black/20">
                  <div>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-gray-400">Status: {s.status} • {s.km} km • CO₂: {s.co2_tons} t</div>
                  </div>
                  {routes?.eco && routes.eco.bestIndex === i && (
                    <span className="text-[11px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">Eco-best</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No routes loaded</div>
          )}
          {eta && (
            <div className="mt-4 text-sm">
              <div>Estimated Arrival: <span className="font-medium">{new Date(eta.eta).toLocaleString()}</span></div>
              <div className="text-gray-400">Transit time ~ {eta.transitHours.toFixed(1)}h • Confidence {Math.round((eta.confidence||0)*100)}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time train status */}
      <div className="rounded-lg border border-white/10 bg-white/5">
        <div className="px-4 py-3 border-b border-white/10"><h3 className="font-medium">Real-time Train Status</h3></div>
        <div className="p-4">
          <ul className="divide-y divide-white/5">
            {liveStatus.map(s => (
              <li key={s.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{s.id}</div>
                  <div className="text-xs text-gray-400">{s.where}</div>
                </div>
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded ${s.state==='On-time' ? 'bg-emerald-500/20 text-emerald-300' : s.state==='Delayed' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{s.state}</span>
                </div>
              </li>
            ))}
            {!liveStatus.length && <li className="py-2 text-sm text-gray-500">No live positions</li>}
          </ul>
        </div>
      </div>

    </section>
  );
}
