"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Guard from "@/components/Guard";
import { useToast } from "@/components/Toast";
import { withBase } from "@/lib/config";
import Link from "next/link";

type ProgressTask = {
  taskId: string;
  orderId: string;
  stockyardId: number;
  loadingPointId: number;
  tons: number;
  status: "PENDING_PREP" | "READY_FOR_LOADING" | "LOADING" | "LOADED";
  rakeCode?: string;
  createdAt: string;
};

type ProgressRes = {
  ok: boolean;
  summary: { counts: Record<string, number>; totalTons: number; doneTons: number; percent: number };
  tasks: ProgressTask[];
};

export default function YardOperationsPage() {
  const Toast = useToast();
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""), []);
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }), [token]);

  // Arrange
  const [arrRake, setArrRake] = useState("");
  const [arrTrack, setArrTrack] = useState("LP-1");
  const [arrWagons, setArrWagons] = useState("");
  const [arrNotes, setArrNotes] = useState("");
  const [busyArr, setBusyArr] = useState(false);

  // Coordinate
  const [coRake, setCoRake] = useState("");
  const [coDepart, setCoDepart] = useState<string>(() => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)); // datetime-local
  const [coRoute, setCoRoute] = useState("");
  const [coContact, setCoContact] = useState("");
  const [coRemarks, setCoRemarks] = useState("");
  const [busyCo, setBusyCo] = useState(false);

  // Progress
  const [pgRake, setPgRake] = useState("");
  const [pgStock, setPgStock] = useState<string>("");
  const [progress, setProgress] = useState<ProgressRes | null>(null);
  const [poll, setPoll] = useState(false);
  const pollRef = useRef<number | null>(null);
  const [busyPg, setBusyPg] = useState(false);

  // Docs
  const [docRake, setDocRake] = useState("");
  const [docFrom, setDocFrom] = useState("Bokaro Steel Plant");
  const [docTo, setDocTo] = useState("");
  const [docCargo, setDocCargo] = useState("");
  const [docTons, setDocTons] = useState<string>("");
  const [busyDoc, setBusyDoc] = useState(false);
  // Execute
  const [exRake, setExRake] = useState("");
  const [exMinUtil, setExMinUtil] = useState<string>("80");
  const [exMinSafety, setExMinSafety] = useState<string>("75");
  const [busyExec, setBusyExec] = useState(false);

  useEffect(() => {
    if (!poll) { if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; } return; }
    pollRef.current = window.setInterval(() => { void doFetchProgress(); }, 5000);
    return () => { if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll]);

  const parseWagons = (raw: string) => raw
    .split(/[\n,\s]+/)
    .map(s => s.trim())
    .filter(Boolean);

  async function arrange() {
    if (!arrRake.trim()) { Toast.push({ text: "Enter rake code", tone: "error" }); return; }
    setBusyArr(true);
    try {
      const wagons = parseWagons(arrWagons);
      const body = { rakeCode: arrRake.trim(), track: arrTrack.trim() || undefined, wagons, notes: arrNotes || undefined };
      const res = await fetch(withBase("/yard/rake/arrange"), { method: "POST", headers: authHeaders, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Arrange failed");
      Toast.push({ text: `Arranged ${data.arrangement?.rakeCode || arrRake}`, tone: "success" });
    } catch (e: any) { Toast.push({ text: e.message || "Arrange failed", tone: "error" }); }
    finally { setBusyArr(false); }
  }

  async function coordinate() {
    if (!coRake.trim()) { Toast.push({ text: "Enter rake code", tone: "error" }); return; }
    setBusyCo(true);
    try {
      const body = { rakeCode: coRake.trim(), requestedDeparture: new Date(coDepart).toISOString(), routeKey: coRoute || undefined, contact: coContact || undefined, remarks: coRemarks || undefined };
      const res = await fetch(withBase("/yard/railways/coordinate"), { method: "POST", headers: authHeaders, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Coordinate failed");
      Toast.push({ text: `Coordination requested (ID ${data.coordination?.requestId || "-"})`, tone: "success" });
    } catch (e: any) { Toast.push({ text: e.message || "Coordinate failed", tone: "error" }); }
    finally { setBusyCo(false); }
  }

  async function doFetchProgress() {
    setBusyPg(true);
    try {
      const qp: string[] = [];
      if (pgRake.trim()) qp.push(`rakeCode=${encodeURIComponent(pgRake.trim())}`);
      if (pgStock.trim()) qp.push(`stockyardId=${encodeURIComponent(pgStock.trim())}`);
      const url = withBase(`/yard/loading/progress${qp.length ? `?${qp.join("&")}` : ""}`);
      const res = await fetch(url, { headers: { Authorization: authHeaders.Authorization! } });
      const data: ProgressRes = await res.json();
      if (!res.ok) throw new Error((data as any).error || "Progress failed");
      setProgress(data);
    } catch (e: any) { Toast.push({ text: e.message || "Progress failed", tone: "error" }); }
    finally { setBusyPg(false); }
  }

  async function generatePdf() {
    if (!docRake.trim() || !docFrom.trim() || !docTo.trim() || !docCargo.trim() || !docTons.trim()) {
      Toast.push({ text: "Fill all fields for dispatch docs", tone: "error" }); return;
    }
    setBusyDoc(true);
    try {
      const body = { rakeCode: docRake.trim(), from: docFrom.trim(), to: docTo.trim(), cargo: docCargo.trim(), tonnage: Number(docTons) };
      const res = await fetch(withBase("/yard/dispatch/docs"), { method: "POST", headers: { Authorization: authHeaders.Authorization!, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to generate PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `dispatch-${docRake.trim()}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      Toast.push({ text: "PDF ready", tone: "success" });
    } catch (e: any) { Toast.push({ text: e.message || "Failed to generate PDF", tone: "error" }); }
    finally { setBusyDoc(false); }
  }

  async function executeWorkflow() {
    if (!exRake.trim()) { Toast.push({ text: "Enter rake code", tone: "error" }); return; }
    setBusyExec(true);
    try {
      const body = {
        rakeCode: exRake.trim(),
        minUtilizationPct: Number(exMinUtil || 80),
        safetyMinCompliancePct: Number(exMinSafety || 75)
      };
      const res = await fetch(withBase('/yard/workflow/execute'), { method: 'POST', headers: authHeaders, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execute failed');
      Toast.push({ text: `Dispatched ${data.rakeCode} · util ${data.utilizationPct}% · safety ${data.safetyScore}%`, tone: 'success' });
    } catch (e:any) {
      Toast.push({ text: e.message || 'Execute failed', tone: 'error' });
    } finally { setBusyExec(false); }
  }

  return (
    <Guard allow={["yard","supervisor","manager","admin"] as any}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Yard • Operations</h1>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-white/70 hover:text-white">Home</Link>
          </div>
        </div>

        {/* Arrange Rake */}
        <section className="rounded-xl border border-white/10 bg-black/30">
          <div className="p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-white/60">Rake Code</label>
              <input value={arrRake} onChange={e=>setArrRake(e.target.value)} placeholder="RK-123456" className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Track</label>
              <input value={arrTrack} onChange={e=>setArrTrack(e.target.value)} placeholder="LP-1" className="bg-black/40 border border-white/10 rounded px-3 py-2 w-40" />
            </div>
            <div className="grow min-w-[240px]">
              <label className="block text-xs text-white/60">Wagons (comma/space/newline separated)</label>
              <textarea value={arrWagons} onChange={e=>setArrWagons(e.target.value)} rows={2} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div className="min-w-[240px]">
              <label className="block text-xs text-white/60">Notes</label>
              <input value={arrNotes} onChange={e=>setArrNotes(e.target.value)} placeholder="Staged near bay A" className="bg-black/40 border border-white/10 rounded px-3 py-2 w-full" />
            </div>
            <div>
              <button disabled={busyArr} onClick={arrange} className="px-3 py-2 rounded bg-brand-green text-black">Arrange</button>
            </div>
          </div>
        </section>

        {/* Coordinate with Railways */}
        <section className="rounded-xl border border-white/10 bg-black/30">
          <div className="p-4 grid md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs text-white/60">Rake Code</label>
              <input value={coRake} onChange={e=>setCoRake(e.target.value)} placeholder="RK-123456" className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Requested Departure</label>
              <input type="datetime-local" value={coDepart} onChange={e=>setCoDepart(e.target.value)} className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Route Key</label>
              <input value={coRoute} onChange={e=>setCoRoute(e.target.value)} placeholder="BKSC-DGR" className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Contact</label>
              <input value={coContact} onChange={e=>setCoContact(e.target.value)} placeholder="DRM East" className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Remarks</label>
              <input value={coRemarks} onChange={e=>setCoRemarks(e.target.value)} placeholder="Priority slot" className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div className="md:col-span-5">
              <button disabled={busyCo} onClick={coordinate} className="px-3 py-2 rounded bg-brand-green text-black">Coordinate</button>
            </div>
          </div>
        </section>

        {/* Loading Progress */}
        <section className="rounded-xl border border-white/10 bg-black/30">
          <div className="p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-white/60">Rake Code (optional)</label>
              <input value={pgRake} onChange={e=>setPgRake(e.target.value)} placeholder="RK-123456" className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Stockyard ID (optional)</label>
              <input value={pgStock} onChange={e=>setPgStock(e.target.value)} placeholder="1" className="bg-black/40 border border-white/10 rounded px-3 py-2 w-28" />
            </div>
            <div className="flex gap-2">
              <button disabled={busyPg} onClick={doFetchProgress} className="px-3 py-2 rounded border border-white/10 hover:border-white/40">Refresh</button>
              <button onClick={()=>setPoll(v=>!v)} className="px-3 py-2 rounded border border-white/10 hover:border-brand-green/60">{poll?"Stop Auto-Refresh":"Start Auto-Refresh"}</button>
            </div>
          </div>
          <div className="p-4">
            {progress ? (
              <div className="space-y-4">
                <div className="text-sm">Done {progress.summary.doneTons}t / {progress.summary.totalTons}t · {progress.summary.percent}%</div>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(progress.summary.counts).map(([k,v])=> (
                    <div key={k} className="rounded border border-white/10 p-2">{k}: {v}</div>
                  ))}
                </div>
                <div className="max-h-72 overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="text-white/60">
                      <tr>
                        <th className="text-left p-2">Task</th>
                        <th className="text-left p-2">Order</th>
                        <th className="text-left p-2">Stockyard</th>
                        <th className="text-left p-2">LP</th>
                        <th className="text-left p-2">Tons</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progress.tasks.map(t=> (
                        <tr key={t.taskId} className="border-t border-white/5">
                          <td className="p-2">{t.taskId}</td>
                          <td className="p-2">{t.orderId}</td>
                          <td className="p-2">{t.stockyardId}</td>
                          <td className="p-2">{t.loadingPointId}</td>
                          <td className="p-2">{t.tons}</td>
                          <td className="p-2">{t.status}</td>
                          <td className="p-2">{new Date(t.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-white/60 text-sm p-4">No data yet. Click Refresh to load progress.</div>
            )}
          </div>
        </section>

        {/* Dispatch Docs */}
        <section className="rounded-xl border border-white/10 bg-black/30">
          <div className="p-4 grid md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs text-white/60">Rake Code</label>
              <input value={docRake} onChange={e=>setDocRake(e.target.value)} placeholder="RK-123456" className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">From</label>
              <input value={docFrom} onChange={e=>setDocFrom(e.target.value)} className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">To</label>
              <input value={docTo} onChange={e=>setDocTo(e.target.value)} className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Cargo</label>
              <input value={docCargo} onChange={e=>setDocCargo(e.target.value)} className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Tonnage (t)</label>
              <input value={docTons} onChange={e=>setDocTons(e.target.value)} className="bg-black/40 border border-white/10 rounded px-3 py-2 w-28" />
            </div>
            <div className="md:col-span-5">
              <button disabled={busyDoc} onClick={generatePdf} className="px-3 py-2 rounded bg-brand-green text-black">Generate PDF</button>
            </div>
          </div>
        </section>

        {/* Execute end-to-end */}
        <section className="rounded-xl border border-white/10 bg-black/30">
          <div className="p-4 grid md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs text-white/60">Rake Code</label>
              <input value={exRake} onChange={e=>setExRake(e.target.value)} placeholder="RK-123456" className="bg-black/40 border border-white/10 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Min Utilization %</label>
              <input value={exMinUtil} onChange={e=>setExMinUtil(e.target.value)} className="bg-black/40 border border-white/10 rounded px-3 py-2 w-28" />
            </div>
            <div>
              <label className="block text-xs text-white/60">Min Safety %</label>
              <input value={exMinSafety} onChange={e=>setExMinSafety(e.target.value)} className="bg-black/40 border border-white/10 rounded px-3 py-2 w-28" />
            </div>
            <div className="md:col-span-5">
              <button disabled={busyExec} onClick={executeWorkflow} className="px-3 py-2 rounded bg-brand-green text-black">Execute & Dispatch</button>
            </div>
          </div>
        </section>
      </div>
    </Guard>
  );
}
