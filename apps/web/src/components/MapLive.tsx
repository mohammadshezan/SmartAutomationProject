"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import { withBase, SOCKET_URL } from "@/lib/config";
import { useEffect, useMemo, useRef, useState, Fragment } from "react";

const rakeIcon = L.divIcon({
  className: "rake-icon",
  html: '<div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/90 text-white shadow"><span style="font-size:12px">🚆</span></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

type Position = {
  id: string; lat: number; lng: number; speed: number;
  temp?: number; rfid?: string; status?: string;
  cargo?: string; source?: string; destination?: string;
  currentLocationName?: string;
  wagons?: number;
  etaMinutes?: number;
  weather?: string;
  nextStopName?: string;
  stops?: { name: string; lat: number; lng: number; signal?: 'red'|'green'; temp?: number; weather?: string }[];
};

export default function MapLive({ selectedAltRoute }: { selectedAltRoute?: { name: string; lat: number; lng: number }[] }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [prev, setPrev] = useState<Record<string, Position>>({});
  const [routes, setRoutes] = useState<any[]>([]);
  const [eco, setEco] = useState<{ bestIndex?: number } | null>(null);
  const [meta, setMeta] = useState<any | null>(null);
  const [highlightEco, setHighlightEco] = useState<boolean>(true);
  const [stockyards, setStockyards] = useState<Array<{ id: number|string; name: string; warehouseLocation?: string|null; lat?: number|null; lng?: number|null; materials?: string[]; totalCapacityTons?: number|null }>>([]);
  const [showYards, setShowYards] = useState<boolean>(true);
  const [yardEdges, setYardEdges] = useState<Array<[[number,number],[number,number]]>>([]);
  const [showYardNetwork, setShowYardNetwork] = useState<boolean>(false);
  const [yardSnaps, setYardSnaps] = useState<Array<[[number,number],[number,number]]>>([]);
  const [showYardSnaps, setShowYardSnaps] = useState<boolean>(true);
  const [yardAllEdges, setYardAllEdges] = useState<Array<[[number,number],[number,number]]>>([]);
  const [showYardAll, setShowYardAll] = useState<boolean>(false);
  const [rail, setRail] = useState<{ nodes: Array<{ id:string, lat:number, lng:number }>, edges: Array<[string,string]> }|null>(null);
  const [yardRailPaths, setYardRailPaths] = useState<Array<Array<[number,number]>>>([]);
  const [showYardRailPaths, setShowYardRailPaths] = useState<boolean>(false);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [network, setNetwork] = useState<any[]>([]);
  const [majorProjects, setMajorProjects] = useState<any[]>([]);
  // Client-side simulation fallback
  const [simPositions, setSimPositions] = useState<Position[]>([]);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [simStarted, setSimStarted] = useState(false);
  const [enRouteRakeCodes, setEnRouteRakeCodes] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to live socket positions
  const s = (window as any).io?.(SOCKET_URL || undefined) || (awaitSocket());
    function onPos(data: Position[]) {
      // interpolate towards new positions over 1s
      const mapPrev: Record<string, Position> = {};
      positions.forEach(p => { mapPrev[p.id] = p; });
      setPrev(mapPrev);
      const start = performance.now();
      const duration = 1000;
      const from = mapPrev;
      const to: Record<string, Position> = {};
      data.forEach(p => to[p.id] = p);
      function step(now: number) {
        const t = Math.min(1, (now - start) / duration);
        const blended: Position[] = data.map(p => {
          const a = from[p.id] || p;
          return { ...p, lat: a.lat + (p.lat - a.lat)*t, lng: a.lng + (p.lng - a.lng)*t };
        });
        setPositions(blended);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    s.on("positions", onPos);

    // HTTP polling fallback helpers
    function startPolling(token: string) {
      if (pollerRef.current) return;
      pollerRef.current = setInterval(() => {
        fetch(withBase('/positions'), { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : Promise.reject())
          .catch(() => fetch(withBase('/positions/public')).then(r => r.ok ? r.json() : Promise.reject()))
          .then((d: Position[]) => { if (Array.isArray(d)) onPos(d); })
          .catch(() => {});
      }, 3000);
    }
    function stopPolling() {
      if (pollerRef.current) { clearInterval(pollerRef.current as any); pollerRef.current = null; }
    }
    // Fetch routes with filters and eco metadata
    const token = localStorage.getItem('token')||'';
    let role = 'guest';
    try { const p = token? JSON.parse(atob(token.split('.')[1])): null; role = p?.role || 'guest'; } catch {}
  const saved = localStorage.getItem(`routeFilters:${role}`);
  const f = saved? JSON.parse(saved): { cargo: 'ore', loco: 'diesel', grade: 0, tonnage: 3000, routeKey: 'BKSC-DGR' };
  const qs = new URLSearchParams({ cargo: f.cargo, loco: f.loco, grade: String(f.grade ?? 0), tonnage: String(f.tonnage ?? 3000), routeKey: String(f.routeKey || 'BKSC-DGR') }).toString();
  fetch(withBase(`/map/routes?${qs}`), { headers: { Authorization: `Bearer ${token}` } })
      .then(r=>r.json())
      .then(d=>{ setRoutes(d.routes||[]); setEco(d.eco||null); setMeta(d.meta||null); })
      .catch(()=>{ setRoutes([]); setEco(null); setMeta(null); });

    // Initial positions fetch so markers appear even before socket connects
    fetch(withBase('/positions'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .catch(() => fetch(withBase('/positions/public')).then(r => r.ok ? r.json() : Promise.reject()))
      .then((d: Position[]) => { if (Array.isArray(d)) onPos(d); })
      .catch(() => {});

    // Fetch customer project sites (role-gated, but server allows any auth role)
    fetch(withBase('/customer/projects'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r=> r.ok ? r.json() : Promise.reject())
      .then(d => setProjects(Array.isArray(d.projects) ? d.projects : []))
      .catch(()=> setProjects([]));

    // Fetch SAIL network points
    fetch(withBase('/network/sail'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r=> r.ok ? r.json() : Promise.reject())
      .then(d => setNetwork(Array.isArray(d.points) ? d.points : []))
      .catch(()=> setNetwork([]));

    // Fetch major projects
    fetch(withBase('/projects/major'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r=> r.ok ? r.json() : Promise.reject())
      .then(d => setMajorProjects(Array.isArray(d.projects) ? d.projects : []))
      .catch(()=> setMajorProjects([]));

    // Fetch stockyards (with lat/lng) for display on map
    fetch(withBase('/stockyards'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r=> r.ok ? r.json() : Promise.reject())
      .then((d:any) => setStockyards(Array.isArray(d) ? d : []))
      .catch(()=> setStockyards([]));

    // Load minimal rail network dataset
    fetch('/data/rail-network.json').then(r=> r.json()).then(setRail).catch(()=> setRail(null));

    // Manage polling fallback based on socket connectivity
    const onConnect = () => { stopPolling(); };
    const onDisconnect = () => { startPolling(token); };
    const onError = () => { startPolling(token); };
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onError);
    const onApply = (e:any) => {
      const det = e?.detail || {};
  const q = new URLSearchParams({ cargo: det.cargo || f.cargo, loco: det.loco || f.loco, grade: String(det.grade ?? f.grade ?? 0), tonnage: String(det.tonnage ?? f.tonnage ?? 3000), routeKey: det.routeKey || f.routeKey || 'BKSC-DGR' }).toString();
  fetch(withBase(`/map/routes?${q}`), { headers: { Authorization: `Bearer ${localStorage.getItem('token')||''}` } })
        .then(r=>r.json()).then(d=>{ setRoutes(d.routes||[]); setEco(d.eco||null); setMeta(d.meta||null); }).catch(()=>{});
    };
    window.addEventListener('routeFilters:apply', onApply as any);
    return () => { s.off("positions", onPos); s.off('connect', onConnect); s.off('disconnect', onDisconnect); s.off('connect_error', onError); stopPolling(); window.removeEventListener('routeFilters:apply', onApply as any); };
  }, []);

  // Try to pull manager/planner en-route rakes and map onto simulation IDs (best-effort)
  useEffect(() => {
    const token = localStorage.getItem('token')||'';
    fetch(withBase('/planner/rakes/status'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r=>r.ok?r.json():Promise.reject())
      .then(d=>{
        const list = (d?.rakes||[]).filter((r:any)=> String(r.status||'') === 'En Route');
        setEnRouteRakeCodes(list.map((r:any)=> r.code));
      })
      .catch(()=> setEnRouteRakeCodes([]));
  }, []);

  // If no backend positions are available, start a local simulation with 10 rakes and routes
  useEffect(() => {
    if (simStarted) return; // already running
    // If after a short delay there are no live positions, bootstrap simulation
    const t = setTimeout(() => {
      if (positions.length === 0) {
        startSimulation();
        setSimStarted(true);
      }
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions.length, simStarted]);

  function startSimulation() {
    // Minimal India city coordinates (rough)
    const CITIES: Record<string,[number,number]> = {
      'Bokaro': [23.65, 86.15], 'Kolkata': [22.57, 88.36], 'Delhi': [28.61, 77.21], 'Chennai': [13.08, 80.27],
      'Bhilai': [21.19, 81.28], 'Durgapur': [23.55, 87.29], 'Patna': [25.61, 85.14], 'Rourkela': [22.23, 84.86],
      'Nagpur': [21.15, 79.09], 'Vijayawada': [16.51, 80.64], 'Hyderabad': [17.38, 78.48], 'Bhubaneswar': [20.30, 85.83]
    };
    const pick = (a:any[]) => a[Math.floor(Math.random()*a.length)];
    const cityNames = Object.keys(CITIES);
    const materials = ['Iron Ore', 'Coal', 'Limestone', 'Dolomite', 'Finished Steel'];
    const weathers = ['Sunny','Cloudy','Rain','Haze','Clear'];
    const palette = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#22c55e','#eab308','#06b6d4','#f97316'];

    // Build 10 routes with 3-5 intermediate stops
    const routes: Position[] = [];
    for (let i=0;i<10;i++) {
      let origin = 'Bokaro';
      let destination = pick(cityNames.filter(c=> c!=='Bokaro'));
      if (i%3===1) { origin = 'Bhilai'; destination = pick(cityNames.filter(c=> c!=='Bhilai')); }
      if (i%3===2) { origin = 'Rourkela'; destination = pick(cityNames.filter(c=> c!=='Rourkela')); }
      const [olat, olng] = CITIES[origin];
      const [dlat, dlng] = CITIES[destination];
      const midCount = 3 + (i%3); // 3..5
      const stops: Position['stops'] = [];
      // origin
      stops.push({ name: origin, lat: olat, lng: olng, signal: 'green', temp: 28+((i*3)%7), weather: pick(weathers) });
      for (let k=1;k<=midCount;k++) {
        // simple interpolation for intermediate stops
        const t = k/(midCount+1);
        const lat = olat + (dlat-olat)*t + ((Math.random()-0.5)*0.5);
        const lng = olng + (dlng-olng)*t + ((Math.random()-0.5)*0.5);
        const name = `Stop ${k}`;
        stops.push({ name, lat, lng, signal: 'green', temp: 26+((i+k)%9), weather: pick(weathers) });
      }
      // destination
      stops.push({ name: destination, lat: dlat, lng: dlng, signal: 'green', temp: 30-((i)%6), weather: pick(weathers) });
      const mat = pick(materials);
      const wagons = 45 + (i%16);
      const speed = 45 + (i%12); // km/h
      const code = enRouteRakeCodes[i] || `Rake_${String(i+1).padStart(2,'0')}`;
      routes.push({ id: code, lat: olat, lng: olng, speed, temp: stops[0].temp, cargo: mat, source: origin, destination, wagons, weather: stops[0].weather, stops });
    }
    setSimPositions(routes);
    // animate
    const segState: Record<string,{ seg:number; t:number; pausedUntil:number|0 }> = {};
    simTimerRef.current = setInterval(() => {
      setSimPositions(prev => prev.map((p, idx) => {
        const st = segState[p.id] || { seg: 0, t: 0, pausedUntil: 0 };
        const now = Date.now();
        const stops = p.stops||[];
        if (stops.length < 2) return p;
        // Pause at stations for 5s
        if (st.t >= 1) {
          // arrived at next station
          const nextIndex = (st.seg + 1) % stops.length;
          const curIndex = st.seg;
          stops[nextIndex].signal = 'red';
          st.pausedUntil = now + 5000;
          st.seg = nextIndex;
          st.t = 0;
          return { ...p, currentLocationName: stops[nextIndex].name, temp: stops[nextIndex].temp, weather: stops[nextIndex].weather };
        }
        if (st.pausedUntil && now < st.pausedUntil) {
          return p; // still paused
        } else if (st.pausedUntil && now >= st.pausedUntil) {
          // turn green and resume
          const curIndex = st.seg % stops.length;
          stops[curIndex].signal = 'green';
          st.pausedUntil = 0 as any;
        }
        // Advance along segment
        const a = stops[st.seg % stops.length];
        const b = stops[(st.seg + 1) % stops.length];
        const kmPerSec = Math.max(10, p.speed) / 3600; // km/s
        const segKm = haversine([a.lat,a.lng],[b.lat,b.lng]);
        const dt = 1; // 1s tick
        const dtFrac = segKm > 0 ? (kmPerSec * dt) / segKm : 1;
        st.t = Math.min(1, st.t + dtFrac);
        const lat = a.lat + (b.lat - a.lat) * st.t;
        const lng = a.lng + (b.lng - a.lng) * st.t;
        const nextStopName = b.name;
        // ETA estimate = remaining distance along path at current speed
        const remKm = remainingDistanceKm(stops, st.seg, st.t);
        const etaMin = Math.round((remKm / Math.max(10,p.speed)) * 60);
        segState[p.id] = st;
        return { ...p, lat, lng, nextStopName, etaMinutes: etaMin };
      }));
    }, 1000);
  }

  function remainingDistanceKm(stops: NonNullable<Position['stops']>, seg: number, t: number) {
    let total = 0;
    for (let i = seg; i < stops.length - 1; i++) {
      const a = stops[i]; const b = stops[i+1];
      let factor = 1;
      if (i === seg) factor = (1 - t);
      total += haversine([a.lat,a.lng],[b.lat,b.lng]) * factor;
    }
    // loop back to origin to keep it moving
    total += haversine([stops[stops.length-1].lat,stops[stops.length-1].lng],[stops[0].lat,stops[0].lng]);
    return total;
  }

  function haversine(a:[number,number], b:[number,number]) {
    const R=6371; const toRad=(d:number)=>d*Math.PI/180;
    const dLat=toRad(b[0]-a[0]); const dLng=toRad(b[1]-a[1]);
    const la1=toRad(a[0]); const la2=toRad(b[0]);
    const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
    return 2*R*Math.asin(Math.sqrt(h));
  }

  useEffect(() => {
    return () => { if (simTimerRef.current) { clearInterval(simTimerRef.current as any); simTimerRef.current = null; } };
  }, []);

  const center = useMemo(() => {
    try {
      const saved = localStorage.getItem('map:focus');
      if (saved) { const f = JSON.parse(saved); return [f.lat, f.lng] as [number,number]; }
    } catch {}
    if (selectedAltRoute && selectedAltRoute.length>0) return [selectedAltRoute[0].lat, selectedAltRoute[0].lng] as [number,number];
    return [23.64, 86.16] as [number, number];
  }, [selectedAltRoute]);

  const AnyMap = MapContainer as any;
  const AnyTile = TileLayer as any;
  const AnyMarker = Marker as any;
  const AnyPolyline = Polyline as any;
  const stationIcon = (signal: 'red'|'green'|undefined) => L.divIcon({
    className: 'station-icon',
    html: `<div class="flex items-center gap-1">
      <span style="font-size:12px">🏢</span>
      <span style="font-size:10px; transition: color .3s ease; ${signal==='red'?'color:#ef4444;':'color:#10b981;'}">${signal==='red'?'🔴':'🟢'}</span>
    </div>`,
    iconSize: [20, 16], iconAnchor: [10, 8]
  });
  const projectIcon = (label: string) => L.divIcon({
    className: 'project-icon',
    html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/90 text-white shadow"><span style="font-size:12px">📍</span></div>`,
    iconSize: [24,24], iconAnchor: [12,12]
  });
  const iconByType = (type?: string) => {
    const map: Record<string,{bg:string,emoji:string,title:string}> = {
      corporate: { bg: '#2dd4bf', emoji: '🏢', title: 'Corporate Office' },
      integrated_plant: { bg: '#fb923c', emoji: '🏭', title: 'Integrated Steel Plant' },
      alloy_special: { bg: '#f59e0b', emoji: '🧱', title: 'Alloy & Special Steel' },
      ferro_alloy: { bg: '#374151', emoji: '🔺', title: 'Ferro Alloy Plant' },
      unit: { bg: '#fbbf24', emoji: '🏭', title: 'Unit' },
      cmo_hq: { bg: '#60a5fa', emoji: '🏢⚙️', title: 'CMO HQ' },
      regional_office: { bg: '#60a5fa', emoji: '🏢', title: 'Regional Office' },
      spu: { bg: '#94a3b8', emoji: '🧷', title: 'Steel Processing Unit' },
      dept_wh: { bg: '#22c55e', emoji: '⭐', title: 'Departmental Warehouse' },
      consignment: { bg: '#111827', emoji: '⭐', title: 'Consignment/CHA Yard' },
      srm: { bg: '#16a34a', emoji: '🟩', title: 'Sales Resident Manager' },
      customer_contact: { bg: '#fb923c', emoji: '🟧', title: 'Customer Contact Office' },
      refractory: { bg: '#a855f7', emoji: '🟪', title: 'SAIL Refractory Unit' },
      logistics: { bg: '#1f2937', emoji: '🚉', title: 'Logistics & Infrastructure' },
      bso_nr: { bg: '#facc15', emoji: '🚩', title: 'Branch Sales Office (NR)' },
      bso_er: { bg: '#fb923c', emoji: '🚩', title: 'Branch Sales Office (ER)' },
      bso_wr: { bg: '#22c55e', emoji: '🚩', title: 'Branch Sales Office (WR)' },
      bso_sr: { bg: '#60a5fa', emoji: '🚩', title: 'Branch Sales Office (SR)' },
    };
    const m = map[String(type||'').toLowerCase()] || { bg: '#64748b', emoji: '📍', title: 'Location' };
    return L.divIcon({
      className: 'sail-icon',
      html: `<div style="width:24px;height:24px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${m.bg};color:#fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${m.emoji}</div>`,
      iconSize: [24,24], iconAnchor: [12,12]
    });
  };
  const majorIcon = L.divIcon({
    className: 'major-icon',
    html: '<div style="width:26px;height:26px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:#eab308;color:#111;box-shadow:0 1px 4px rgba(0,0,0,.4)">📣</div>',
    iconSize: [26,26], iconAnchor: [13,13]
  });
  const yardIcon = L.divIcon({
    className: 'yard-icon',
    html: '<div style="width:22px;height:22px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:#0ea5e9;color:#fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">📦</div>',
    iconSize: [22,22], iconAnchor: [11,11]
  });

  // Compute an approximate rail connectivity by building a Minimum Spanning Tree across stockyards (haversine distance)
  useEffect(() => {
    const nodes = stockyards
      .filter((y:any) => typeof y.lat === 'number' && typeof y.lng === 'number')
      .map((y:any) => ({ id: y.id, lat: y.lat as number, lng: y.lng as number }));
    if (nodes.length < 2) { setYardEdges([]); return; }
    const hav = (a:[number,number], b:[number,number])=>{ const R=6371; const toRad=(d:number)=>d*Math.PI/180; const dLat=toRad(b[0]-a[0]); const dLng=toRad(b[1]-a[1]); const la1=toRad(a[0]); const la2=toRad(b[0]); const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
    const N = nodes.length;
    const visited: boolean[] = new Array(N).fill(false);
    const edges: Array<[[number,number],[number,number]]> = [];
    visited[0] = true; // start from first node
    let visitedCount = 1;
    while (visitedCount < N) {
      let bestI = -1, bestJ = -1, bestD = Infinity;
      for (let i = 0; i < N; i++) if (visited[i]) {
        for (let j = 0; j < N; j++) if (!visited[j]) {
          const d = hav([nodes[i].lat, nodes[i].lng], [nodes[j].lat, nodes[j].lng]);
          if (d < bestD) { bestD = d; bestI = i; bestJ = j; }
        }
      }
      if (bestI !== -1 && bestJ !== -1) {
        edges.push([[nodes[bestI].lat, nodes[bestI].lng], [nodes[bestJ].lat, nodes[bestJ].lng]]);
        visited[bestJ] = true; visitedCount++;
      } else {
        break;
      }
    }
    setYardEdges(edges);
  }, [stockyards]);

  // Build all-to-all connections between stockyards (straight-line for visualization)
  useEffect(() => {
    const nodes = stockyards
      .filter((y:any) => typeof y.lat === 'number' && typeof y.lng === 'number')
      .map((y:any) => ({ lat: y.lat as number, lng: y.lng as number }));
    const edges: Array<[[number,number],[number,number]]> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        edges.push([[nodes[i].lat, nodes[i].lng], [nodes[j].lat, nodes[j].lng]]);
      }
    }
    setYardAllEdges(edges);
  }, [stockyards]);

  // Build available "rail" segments from selected alt route and eco routes (simple from/to lines)
  const railSegments = useMemo(() => {
    const segs: Array<[[number,number],[number,number]]> = [];
    // Selected alt route waypoints
    if (Array.isArray(selectedAltRoute) && selectedAltRoute.length > 1) {
      for (let i = 1; i < selectedAltRoute.length; i++) {
        segs.push([[selectedAltRoute[i-1].lat, selectedAltRoute[i-1].lng],[selectedAltRoute[i].lat, selectedAltRoute[i].lng]]);
      }
    }
    // Loaded eco/baseline routes with from/to
    (routes||[]).forEach((r:any) => {
      if (Array.isArray(r.from) && r.from.length===2 && Array.isArray(r.to) && r.to.length===2) {
        segs.push([[r.from[0], r.from[1]], [r.to[0], r.to[1]]]);
      }
    });
    return segs;
  }, [routes, selectedAltRoute]);

  // For each yard, snap to nearest rail segment and create a connector
  useEffect(() => {
    const yards = stockyards.filter((y:any)=> typeof y.lat==='number' && typeof y.lng==='number');
    if (!yards.length || !railSegments.length) { setYardSnaps([]); return; }
    const toRad = (d:number)=> d * Math.PI / 180;
    const hav = (a:[number,number], b:[number,number])=>{ const R=6371; const dLat=toRad(b[0]-a[0]); const dLng=toRad(b[1]-a[1]); const la1=toRad(a[0]); const la2=toRad(b[0]); const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
    function closestPointOnSeg(A:[number,number], B:[number,number], P:[number,number]): [number,number] {
      // Approximate on a plane with lon scaled by cos(lat0)
      const lat0 = (A[0]+B[0]+P[0])/3 * Math.PI/180;
      const k = Math.cos(lat0);
      const ax = A[1]*k, ay = A[0];
      const bx = B[1]*k, by = B[0];
      const px = P[1]*k, py = P[0];
      const abx = bx-ax, aby = by-ay;
      const apx = px-ax, apy = py-ay;
      const ab2 = abx*abx + aby*aby || 1e-9;
      let t = (apx*abx + apy*aby) / ab2;
      t = Math.max(0, Math.min(1, t));
      const qx = ax + t*abx, qy = ay + t*aby;
      return [qy, qx / k];
    }
    const snaps: Array<[[number,number],[number,number]]> = [];
    for (const y of yards) {
      const p: [number,number] = [y.lat as number, y.lng as number];
      let bestQ: [number,number] | null = null; let bestD = Infinity;
      for (const seg of railSegments) {
        const q = closestPointOnSeg(seg[0], seg[1], p);
        const d = hav(p, q);
        if (d < bestD) { bestD = d; bestQ = q; }
      }
      if (bestQ) snaps.push([p, bestQ]);
    }
    setYardSnaps(snaps);
  }, [stockyards, railSegments]);

  const zoom = useMemo(() => {
    // Default to India-level view; zoom in if a specific alt route is shown
    if (selectedAltRoute && selectedAltRoute.length > 0) return 7;
    return 5;
  }, [selectedAltRoute]);

  // Compute rail graph shortest paths between stockyards
  useEffect(() => {
    if (!rail) { setYardRailPaths([]); return; }
    const yards = stockyards.filter((y:any)=> typeof y.lat==='number' && typeof y.lng==='number');
    if (yards.length < 2) { setYardRailPaths([]); return; }
    // Build graph
    const nodes = rail.nodes;
    const idxById: Record<string, number> = {};
    nodes.forEach((n, i) => { idxById[n.id] = i; });
    const adj: Array<Array<{ j:number, w:number }>> = nodes.map(() => []);
    const toRad = (d:number)=> d*Math.PI/180;
    const hav = (a:[number,number], b:[number,number])=>{ const R=6371; const dLat=toRad(b[0]-a[0]); const dLng=toRad(b[1]-a[1]); const la1=toRad(a[0]); const la2=toRad(b[0]); const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
    for (const [a,b] of rail.edges) {
      const ia = idxById[a]; const ib = idxById[b];
      if (ia==null || ib==null) continue;
      const wa = hav([nodes[ia].lat, nodes[ia].lng], [nodes[ib].lat, nodes[ib].lng]);
      adj[ia].push({ j: ib, w: wa });
      adj[ib].push({ j: ia, w: wa });
    }
    // Helper: find nearest rail node to a given lat/lng
    function nearestNode(lat:number, lng:number) {
      let best = 0; let bd = Infinity;
      for (let i=0;i<nodes.length;i++) {
        const d = hav([lat,lng],[nodes[i].lat,nodes[i].lng]);
        if (d<bd) { bd=d; best=i; }
      }
      return best;
    }
    // Dijkstra
    function shortestPath(si:number, ti:number) {
      const N = nodes.length;
      const dist = new Array(N).fill(Infinity);
      const prev = new Array(N).fill(-1);
      const vis = new Array(N).fill(false);
      dist[si] = 0;
      for (let k=0;k<N;k++) {
        let u=-1, du=Infinity;
        for (let i=0;i<N;i++) if (!vis[i] && dist[i]<du) { du=dist[i]; u=i; }
        if (u===-1) break;
        if (u===ti) break;
        vis[u]=true;
        for (const e of adj[u]) {
          if (vis[e.j]) continue;
          const nd = dist[u] + e.w;
          if (nd < dist[e.j]) { dist[e.j]=nd; prev[e.j]=u; }
        }
      }
      // Reconstruct
      const seq: number[] = [];
      let cur = ti;
      if (prev[cur]===-1 && cur!==si) return [] as number[];
      while (cur!==-1) { seq.push(cur); if (cur===si) break; cur = prev[cur]; }
      return seq.reverse();
    }
    // Compute paths for all yard pairs (can be dense; keep only a subset if necessary)
    const paths: Array<Array<[number,number]>> = [];
    for (let i=0;i<yards.length;i++) {
      const yi = yards[i];
      const si = nearestNode(yi.lat as number, yi.lng as number);
      for (let j=i+1;j<yards.length;j++) {
        const yj = yards[j];
        const tj = nearestNode(yj.lat as number, yj.lng as number);
        const seq = shortestPath(si, tj);
        if (seq.length>1) {
          const coords = seq.map(ix => [nodes[ix].lat, nodes[ix].lng] as [number,number]);
          paths.push(coords);
        }
      }
    }
    setYardRailPaths(paths);
  }, [rail, stockyards]);

  const routeColors = useMemo(()=>['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#22c55e','#eab308','#06b6d4','#f97316'],[]);

  // Merge live and simulated positions; prefer live if same id appears
  const mergedPositions: Position[] = useMemo(() => {
    const map = new Map<string, Position>();
    simPositions.forEach(p=> map.set(p.id, p));
    positions.forEach(p=> map.set(p.id, { ...map.get(p.id), ...p } as Position));
    return Array.from(map.values());
  }, [positions, simPositions]);

  return (
    <div className="h-[70vh]">
      <AnyMap center={center} zoom={zoom} scrollWheelZoom={true} className="h-full">
        <AnyTile
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* legacy eco-route preview */}
        {routes.map((r, i) => {
          const isEco = i === (eco?.bestIndex ?? -1);
          const color = isEco && highlightEco ? '#22C55E' : statusColor(r.status);
          const weight = isEco && highlightEco ? 7 : 5;
          return <AnyPolyline key={i} positions={r.from && r.to ? [r.from, r.to] : []} pathOptions={{ color, weight, opacity: 0.9 }} />;
        })}
        {/* optional selected alt route polyline */}
        {Array.isArray(selectedAltRoute) && selectedAltRoute.length>1 && (
          <>
            <AnyPolyline positions={selectedAltRoute.map(p => [p.lat, p.lng])} pathOptions={{ color: '#F59E0B', weight: 4, opacity: 0.9, dashArray: '6 4' }} />
            {selectedAltRoute.map((s, idx) => (
              <AnyMarker key={`alt-${idx}`} position={[s.lat, s.lng]} icon={stationIcon('green' as any)}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-400">Alt route waypoint</div>
                  </div>
                </Popup>
              </AnyMarker>
            ))}
          </>
        )}

        {/* draw per-rake routes with stations */}
        {mergedPositions.map((p, idx) => (
          <Fragment key={`rk-${p.id}`}>
            {p.stops && p.stops.length > 1 && (
              <AnyPolyline key={`route-${p.id}`} positions={p.stops.map(s => [s.lat, s.lng])} pathOptions={{ color: routeColors[idx % routeColors.length], weight: 3, opacity: 0.9 }} />
            )}
            {p.stops?.map((s, idx) => (
              <AnyMarker key={`st-${p.id}-${idx}`} position={[s.lat, s.lng]} icon={stationIcon((s.signal||'green') as any)}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">🏙️ {s.name}</div>
                    <div>🚦 Signal: {s.signal==='red' ? '🔴 Red' : '🟢 Green'}</div>
                    {typeof s.temp === 'number' && <div>🌡️ Temp: {s.temp} °C</div>}
                    {s.weather && <div>☁️ Weather: {s.weather}</div>}
                  </div>
                </Popup>
              </AnyMarker>
            ))}
          </Fragment>
        ))}
        {/* Major Projects markers */}
        {majorProjects.map((m:any) => (
          <AnyMarker key={m.id} position={[m.lat, m.lng]} icon={majorIcon}>
            <Popup>
              <div className="text-sm min-w-[260px]">
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-gray-400">{m.city} · Nearest CMO: {m.nearestCMO}</div>
                <div className="text-xs mt-1">Products: {(m.products||[]).join(', ')}</div>
                <div className="text-xs">Sources: {(m.sources||[]).join(', ')}</div>
                {m.route && <div className="text-xs mt-1 text-gray-400">Route: {m.route}</div>}
                {m.contact && (
                  <div className="text-xs mt-2">
                    <div className="text-gray-400">Contact</div>
                    {m.contact.name && <div>{m.contact.name}</div>}
                    {m.contact.email && <div><a className="underline" href={`mailto:${m.contact.email}`}>{m.contact.email}</a></div>}
                    {m.contact.phone && <div>{m.contact.phone}</div>}
                  </div>
                )}
                {m.kpis && (
                  <div className="text-xs mt-2 grid grid-cols-3 gap-2">
                    <div><div className="text-gray-400">Qty</div><div className="font-medium">{m.kpis.quantityTons ?? '-'}</div></div>
                    <div><div className="text-gray-400">ETA</div><div className="font-medium">{m.kpis.eta ?? '-'}</div></div>
                    <div><div className="text-gray-400">CO₂</div><div className="font-medium">{m.kpis.co2 ?? '-'}</div></div>
                  </div>
                )}
              </div>
            </Popup>
          </AnyMarker>
        ))}
        {mergedPositions.map(p => (
          <AnyMarker key={p.id} position={[p.lat, p.lng]} icon={rakeIcon}>
            <Popup>
              <div className="text-sm min-w-[220px]">
                <div className="font-semibold flex items-center gap-2 mb-1">
                  <span role="img" aria-label="train">🚆</span>
                  <span>Rake: {p.id}</span>
                </div>
                {p.currentLocationName && <div>📍 Current: {p.currentLocationName}</div>}
                {p.source && p.destination && <div>🛤️ Route: {p.source} → {p.destination}</div>}
                {typeof p.wagons === 'number' && <div>🚃 Wagons: {p.wagons}</div>}
                {p.temp !== undefined && <div>🌡️ Temp: {p.temp} °C</div>}
                {p.weather && <div>☁️ Weather: {p.weather}</div>}
                <div>⚡ Speed: {p.speed} km/h</div>
                {typeof p.etaMinutes === 'number' && <div>⏱️ ETA: ~{p.etaMinutes} min</div>}
                {p.nextStopName && <div>➡️ Next Stop: {p.nextStopName}</div>}
                {p.rfid && <div>� RFID: {p.rfid}</div>}
                {p.cargo && <div>📦 Cargo: {p.cargo}</div>}
                {p.stops && p.stops.length > 0 && (
                  <div className="mt-1">
                    <div className="text-xs text-gray-400">Route:</div>
                    <div className="text-xs">{p.stops.map(s => s.name).join(' → ')}</div>
                  </div>
                )}
              </div>
            </Popup>
          </AnyMarker>
        ))}
        {/* Project site markers */}
        {projects.map((p:any) => (
          <AnyMarker key={p.id} position={[p.lat, p.lng]} icon={projectIcon(p.city)}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-gray-400">{p.city}, {p.state} · CMO: {p.nearestCMO}</div>
                <div className="text-xs mt-1">Products: {(p.products||[]).join(', ')}</div>
                <div className="mt-2">
                  <a href={`/orders/status?destination=${encodeURIComponent(p.city)}`} className="text-indigo-300 underline text-xs">View orders to this city</a>
                </div>
              </div>
            </Popup>
          </AnyMarker>
        ))}
        {/* SAIL Network markers */}
        {network.map((n:any) => (
          <AnyMarker key={n.id} position={[n.lat, n.lng]} icon={iconByType(n.type)}>
            <Popup>
              <div className="text-sm min-w-[220px]">
                <div className="font-semibold">{n.name}</div>
                <div className="text-xs text-gray-400">{n.city}, {n.state} · {String(n.type||'').replace(/_/g,' ')}</div>
                {n.description && (<div className="text-xs mt-1">{n.description}</div>)}
                {n.stats && (
                  <div className="text-xs mt-1 text-gray-300">
                    {n.stats.products ? (<div>Products: {(n.stats.products||[]).join(', ')}</div>) : null}
                    {n.stats.category ? (<div>Category: {n.stats.category}</div>) : null}
                  </div>
                )}
                {n.contact && (
                  <div className="text-xs mt-2">
                    {n.contact.email && (<div>Email: <a className="underline" href={`mailto:${n.contact.email}`}>{n.contact.email}</a></div>)}
                    {n.contact.phone && (<div>Phone: {n.contact.phone}</div>)}
                  </div>
                )}
              </div>
            </Popup>
          </AnyMarker>
        ))}
        {/* Stockyard markers */}
        {showYards && stockyards.filter((y:any)=> typeof y.lat==='number' && typeof y.lng==='number').map((y:any) => (
          <AnyMarker key={`yard-${y.id}`} position={[y.lat, y.lng]} icon={yardIcon}>
            <Popup>
              <div className="text-sm min-w-[220px]">
                <div className="font-semibold">{y.name}</div>
                {y.warehouseLocation && <div className="text-xs text-gray-400">{y.warehouseLocation}</div>}
                {Array.isArray(y.materials) && y.materials.length>0 && (
                  <div className="text-xs mt-1">Materials: {y.materials.join(', ')}</div>
                )}
                {typeof y.totalCapacityTons === 'number' && (
                  <div className="text-xs">Total Capacity: {Number(y.totalCapacityTons).toLocaleString()} t</div>
                )}
                <div className="mt-2">
                  <a className="underline text-indigo-300 text-xs" href={`/stockyard?id=${encodeURIComponent(String(y.id))}`}>View details</a>
                </div>
              </div>
            </Popup>
          </AnyMarker>
        ))}
        {/* Stockyard network connections (approximate railway MST) */}
        {showYardNetwork && yardEdges.map((seg, idx) => (
          <AnyPolyline key={`yard-edge-${idx}`} positions={seg} pathOptions={{ color: '#64748b', weight: 2, opacity: 0.7, dashArray: '6 6' }} />
        ))}
        {/* Snap each stockyard to nearest rail segment */}
        {showYardSnaps && yardSnaps.map((seg, idx) => (
          <AnyPolyline key={`yard-snap-${idx}`} positions={seg} pathOptions={{ color: '#0ea5e9', weight: 2, opacity: 0.9 }} />
        ))}
        {/* All-to-all stockyard connections (can be visually dense) */}
        {showYardAll && yardAllEdges.map((seg, idx) => (
          <AnyPolyline key={`yard-all-${idx}`} positions={seg} pathOptions={{ color: '#94a3b8', weight: 1.2, opacity: 0.25, dashArray: '4 6' }} />
        ))}
        {/* Rail-constrained paths connecting stockyards via railway network */}
        {showYardRailPaths && yardRailPaths.map((path, idx) => (
          <AnyPolyline key={`yard-rail-${idx}`} positions={path} pathOptions={{ color: '#22c55e', weight: 2.5, opacity: 0.85 }} />
        ))}
      </AnyMap>
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-black/60 border border-white/10 rounded-md px-3 py-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={highlightEco} onChange={e=>setHighlightEco(e.target.checked)} />
          Highlight eco-route
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showYards} onChange={e=>setShowYards(e.target.checked)} />
          Show stockyards
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showYardSnaps} onChange={e=>setShowYardSnaps(e.target.checked)} />
          Connect to nearest route
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showYardNetwork} onChange={e=>setShowYardNetwork(e.target.checked)} />
          Connect stockyards
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showYardAll} onChange={e=>setShowYardAll(e.target.checked)} />
          Connect all yards
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showYardRailPaths} onChange={e=>setShowYardRailPaths(e.target.checked)} disabled={!rail || stockyards.length<2} />
          Rail paths (graph)
        </label>
        {meta && (
          <span className="text-xs text-gray-300">EF {meta.efPerKm} tCO₂/km · {meta.cargo}/{meta.loco} · {meta.grade}% · {meta.tonnage}t</span>
        )}
      </div>
    </div>
  );
}

function statusColor(status?: string) {
  switch(status) {
    case 'congested': return '#F87171'; // red
    case 'busy': return '#F59E0B'; // amber
    default: return '#10B981'; // green
  }
}

function awaitSocket() { return SOCKET_URL ? io(SOCKET_URL) : io(); }
