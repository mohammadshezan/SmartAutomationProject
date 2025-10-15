"use client";
import { useEffect, useState } from "react";
import { withBase } from "@/lib/config";

type Order = { id: string; customer: string; product: string; quantityTons: number; destination: string; priority: string; status: string };
type ManagerOverview = { pendingOrders: Order[] };

export default function OrdersDemand() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(withBase("/plant/manager/overview"), { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(await res.text());
        const j: ManagerOverview = await res.json();
        setOrders(j.pendingOrders || []);
      } catch (e) {
        setErr("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Orders & Demand</h2>
        {loading ? <span className="text-xs text-gray-400">Loading…</span> : null}
      </div>
      {err && <div className="text-sm text-red-400">{err}</div>}

      <div className="rounded-xl bg-white/5 border border-white/10">
        <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-4 py-2 border-b border-white/10">
          <div className="col-span-2">Order ID</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Product</div>
          <div className="col-span-2">Qty (t)</div>
          <div className="col-span-2">Destination</div>
          <div className="col-span-2">Priority</div>
        </div>
        <div className="divide-y divide-white/10">
          {orders.map((o) => (
            <div key={o.id} className="grid grid-cols-12 gap-2 px-4 py-2 text-sm">
              <div className="col-span-2">{o.id}</div>
              <div className="col-span-2">{o.customer}</div>
              <div className="col-span-2">{o.product}</div>
              <div className="col-span-2">{o.quantityTons}</div>
              <div className="col-span-2">{o.destination}</div>
              <div className="col-span-2"><Badge intent={o.priority} /></div>
            </div>
          ))}
          {!loading && !orders.length && (
            <div className="px-4 py-6 text-sm text-gray-400">No pending orders.</div>
          )}
        </div>
      </div>
    </section>
  );
}

function Badge({ intent }: { intent: string }) {
  const color = intent?.toUpperCase() === 'HIGH' ? 'bg-red-500/20 text-red-300 border-red-500/30' : intent?.toUpperCase() === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${color}`}>{intent||'-'}</span>;
}
