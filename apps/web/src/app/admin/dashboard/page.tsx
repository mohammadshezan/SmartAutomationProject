"use client";
import { useEffect, useState } from "react";
import { withBase } from "@/lib/config";

type Overview = {
  rakes: { total: number; dispatched: number; planned: number };
  orders: { pending: number };
  stock: { lowOpen: number };
};

export default function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    fetch(withBase("/admin/overview"), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : r.text().then((t) => Promise.reject(t))))
      .then((j) => setData(j))
      .catch(() => setErr("Failed to load overview"));
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Overview</h2>
      {err && <div className="text-sm text-red-400">{err}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Rakes (Total)" value={data?.rakes.total} />
        <KpiCard title="Rakes (Dispatched)" value={data?.rakes.dispatched} />
        <KpiCard title="Rakes (Planned)" value={data?.rakes.planned} />
        <KpiCard title="Pending Orders" value={data?.orders.pending} />
        <KpiCard title="Open Low Stock" value={data?.stock.lowOpen} />
      </div>
    </section>
  );
}

function KpiCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl bg-white/5 p-4 border border-white/10">
      <div className="text-xs text-gray-400">{title}</div>
      <div className="text-3xl font-bold">{value ?? "—"}</div>
    </div>
  );
}
