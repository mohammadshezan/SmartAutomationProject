"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Guard from "@/components/Guard";
import { withBase } from "@/lib/config";
import { useToast } from "@/components/Toast";

interface ManifestLine {
  customer: string;
  material: string;
  quantityTons: number;
  wagons: number;
  wagonRange?: string;
  costINR?: number;
  eta?: string | null;
}

interface RakeDetail {
  id: string;
  code: string;
  route: string;
  loadingPoint: string;
  destination: string;
  wagons: number;
  wagonType?: string;
  eta: string;
  status: string; // Pending | Dispatched
  slaMet?: boolean;
  costINR?: number;
  manifest: ManifestLine[];
}

export default function DispatchReviewPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const [rake, setRake] = useState<RakeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const router = useRouter();
  const Toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token')||'';
      const res = await fetch(withBase(`/planner/rakes/${id}`), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Failed to load rake');
      // Normalize
      const rd: RakeDetail = {
        id: data.id || data.code || id,
        code: data.code || data.id || id,
        route: data.route || `${data.loadingPoint||'?'} → ${data.destination||'?'}`,
        loadingPoint: data.loadingPoint || data.origin || '-',
        destination: data.destination || data.dest || '-',
        wagons: data.wagons || data.wagonCount || 0,
        wagonType: data.wagonType || 'BOXN',
        eta: data.eta || data.expectedDelivery || '',
        status: data.status || 'Pending',
        slaMet: data.slaMet ?? data.sla_met ?? true,
        costINR: data.costINR || data.cost || 0,
        manifest: (data.manifest || data.lines || []).map((m:any) => ({
          customer: m.customer || m.customerName || '-',
            material: m.material || m.materials || m.cargo || '-',
            quantityTons: m.quantityTons || m.quantity || m.tons || 0,
            wagons: m.wagons || m.wagonCount || 0,
            wagonRange: m.wagonRange || m.range || '',
            costINR: m.costINR || m.cost || 0,
            eta: m.eta || null,
        })),
      };
      setRake(rd);
    } catch (e:any) {
      Toast.push({ text: e.message||'Load failed', tone: 'error' });
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, [id]);

  const confirmDispatch = async () => {
    if (!rake) return;
    setDispatching(true);
    try {
      const token = localStorage.getItem('token')||'';
      const res = await fetch(withBase(`/planner/rakes/${rake.code}/dispatch`), { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ confirm: true }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Dispatch failed');
      Toast.push({ text: `Rake ${rake.code} dispatched`, tone: 'success' });
      router.push('/manager/planner');
    } catch (e:any) {
      Toast.push({ text: e.message||'Dispatch failed', tone: 'error' });
    } finally { setDispatching(false); }
  };

  return (
    <Guard allow={["manager","admin"] as any}>
      <div className="fg-theme bg-white min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Dispatch Review</h1>
            <button onClick={()=>router.back()} className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Back</button>
          </div>
          {loading && <div className="text-sm text-gray-500">Loading rake details…</div>}
          {!loading && !rake && <div className="text-sm text-red-500">Rake not found.</div>}
          {rake && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <InfoCard title="Rake ID" value={rake.code} />
                <InfoCard title="Route" value={rake.route} />
                <InfoCard title="Wagons" value={`${rake.wagons} ${rake.wagonType||''}`} />
                <InfoCard title="Expected Delivery" value={rake.eta ? new Date(rake.eta).toLocaleString(): '—'} />
                <InfoCard title="Cost" value={rake.costINR ? `₹${(rake.costINR).toLocaleString()}`: '—'} />
                <InfoCard title="SLA" value={rake.slaMet? '✓ Met':'⚠ Not Met'} />
                <InfoCard title="Status" value={rake.status} />
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Materials</th>
                      <th className="px-4 py-2 text-right">Qty (t)</th>
                      <th className="px-4 py-2 text-right">Wagons</th>
                      <th className="px-4 py-2 text-left">Wagon No(s)</th>
                      <th className="px-4 py-2 text-right">Est. Cost</th>
                      <th className="px-4 py-2 text-left">ETA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rake.manifest.map((m,i)=>(
                      <tr key={i} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{m.customer}</td>
                        <td className="px-4 py-2 text-gray-700">{m.material}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m.quantityTons}</td>
                        <td className="px-4 py-2 text-right">{m.wagons}</td>
                        <td className="px-4 py-2 text-gray-600 text-xs">{m.wagonRange||'—'}</td>
                        <td className="px-4 py-2 text-right">{m.costINR? `₹${m.costINR.toLocaleString()}`:'—'}</td>
                        <td className="px-4 py-2 text-gray-600 text-xs">{m.eta? new Date(m.eta).toLocaleString():'—'}</td>
                      </tr>
                    ))}
                    {rake.manifest.length===0 && (
                      <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">No manifest lines</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3">
                <button disabled={dispatching || rake.status==='Dispatched'} onClick={confirmDispatch} className="px-4 py-2 rounded bg-brand-green text-black disabled:opacity-50 disabled:cursor-not-allowed">{dispatching? 'Dispatching…' : rake.status==='Dispatched'? 'Already Dispatched':'Confirm Dispatch'}</button>
                <button onClick={()=>router.back()} className="px-4 py-2 rounded border border-gray-300">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Guard>
  );
}

function InfoCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{title}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 break-words">{value}</p>
    </div>
  );
}
