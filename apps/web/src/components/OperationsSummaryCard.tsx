"use client";
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type OpsData = {
  orders: Record<string, number>;
  rakes: { total: number; dispatched: number };
  kpis: { avgUtilizationPct: number | null };
} | null;

export default function OperationsSummaryCard({
  data,
  error,
  onRefresh,
  className = "",
}: {
  data: OpsData;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}) {
  const loading = !error && !data;

  return (
    <Card className={`rounded-2xl shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-gray-200">
        <h2 className="text-lg font-medium">Operations Summary</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh}>Refresh</Button>
        </div>
      </div>
      <CardContent className="p-4 md:p-6">
        {error ? (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-red-500" aria-hidden />
            <div className="flex-1">
              <div className="font-medium">Failed to load summary</div>
              <div className="mt-0.5 opacity-90">{error}</div>
            </div>
            {onRefresh && (
              <Button size="sm" variant="outline" onClick={onRefresh}>Retry</Button>
            )}
          </div>
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0,1,2].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="mt-3 flex gap-2">
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : data && isEmptyData(data) ? (
          <EmptyState onRefresh={onRefresh} />
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <OrdersByStatus orders={data.orders} />
            </div>
            <RakesStats total={data.rakes.total} dispatched={data.rakes.dispatched} />
            <UtilizationGauge pct={toPct(data.kpis.avgUtilizationPct)} />
            <div className="md:col-span-4">
              <CostOptimizationChart rakes={data.rakes} />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function toPct(v: number | null | undefined): number {
  if (v == null || Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function isEmptyData(d: NonNullable<OpsData>): boolean {
  const noOrders = !d.orders || Object.values(d.orders).every((n) => !n);
  const noRakes = !d.rakes || ((d.rakes.total||0) === 0 && (d.rakes.dispatched||0) === 0);
  const noKpi = !d.kpis || d.kpis.avgUtilizationPct == null;
  return noOrders && noRakes && noKpi;
}

function OrdersByStatus({ orders }: { orders: Record<string, number> }) {
  const entries = Object.entries(orders || {});
  const order = ["Pending", "Approved", "Loading", "En Route", "Completed", "Rejected"];
  entries.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-600">Orders by Status</div>
      </div>
      {entries.length === 0 ? (
        <span className="text-gray-500 text-sm">No orders.</span>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {entries.map(([k, v]) => (
            <StatusCard key={k} label={k} value={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function RakesStats({ total, dispatched }: { total: number; dispatched: number }) {
  const pct = total > 0 ? Math.round((dispatched / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-gray-600 mb-2">Rakes</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MetricPill label="Total" value={total} />
          <MetricPill label="Dispatched" value={dispatched} />
        </div>
        <div className="text-xs text-gray-600">{pct}% dispatched</div>
      </div>
      <div className="mt-2 h-1.5 w-full bg-gray-200 rounded">
        <div className="h-1.5 rounded bg-brand-green" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    </div>
  );
}

function UtilizationGauge({ pct }: { pct: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-gray-600 mb-2">Avg Wagon Utilization</div>
      <div className="flex items-center gap-4">
        <svg width="80" height="80" viewBox="0 0 80 80" aria-label={`Average utilization ${pct}%`}>
          <circle cx="40" cy="40" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="#16A34A"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
          />
          <text x="40" y="44" textAnchor="middle" className="fill-gray-900" fontSize="16" fontWeight={600}>
            {pct}%
          </text>
        </svg>
        <div className="text-xs text-gray-600">
          <div className="font-medium text-gray-900 text-sm">Utilization</div>
          <p>Average wagon fill across active rakes.</p>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: number }) {
  const { ring, dot } = statusAccent(label);
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition ring-1 ${ring}`} title={`${label}: ${value}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
          <span className="text-[11px] uppercase tracking-wide text-gray-600">{label}</span>
        </div>
        <div className="text-base font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 border border-gray-200">
      <span className="uppercase tracking-wide text-[9px] text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </span>
  );
}

function statusColors(status: string) {
  const s = status.toLowerCase();
  if (s.includes("pending")) return { bg: "bg-amber-50", text: "text-amber-800", border: "border border-amber-200" };
  if (s.includes("approved")) return { bg: "bg-emerald-50", text: "text-emerald-800", border: "border border-emerald-200" };
  if (s.includes("loading")) return { bg: "bg-blue-50", text: "text-blue-800", border: "border border-blue-200" };
  if (s.includes("en route") || s.includes("en_route") || s.includes("enroute")) return { bg: "bg-indigo-50", text: "text-indigo-800", border: "border border-indigo-200" };
  if (s.includes("completed") || s.includes("done")) return { bg: "bg-gray-100", text: "text-gray-800", border: "border border-gray-200" };
  if (s.includes("rejected") || s.includes("cancel")) return { bg: "bg-red-50", text: "text-red-800", border: "border border-red-200" };
  return { bg: "bg-gray-100", text: "text-gray-800", border: "border border-gray-200" };
}

function statusAccent(status: string) {
  const s = status.toLowerCase();
  if (s.includes("pending")) return { ring: "ring-amber-100", dot: "bg-amber-400" };
  if (s.includes("approved")) return { ring: "ring-emerald-100", dot: "bg-emerald-500" };
  if (s.includes("loading")) return { ring: "ring-blue-100", dot: "bg-blue-500" };
  if (s.includes("en route") || s.includes("en_route") || s.includes("enroute")) return { ring: "ring-indigo-100", dot: "bg-indigo-500" };
  if (s.includes("completed") || s.includes("done")) return { ring: "ring-gray-100", dot: "bg-gray-400" };
  if (s.includes("rejected") || s.includes("cancel")) return { ring: "ring-red-100", dot: "bg-red-500" };
  return { ring: "ring-gray-100", dot: "bg-gray-400" };
}

function CostOptimizationChart({ rakes }: { rakes: { total: number; dispatched: number } }) {
  // Assumption: approximate cost optimization signal correlates with dispatched rakes
  // We generate a short 7-point series for the last days to visualize trend.
  const data = useMemo(() => {
    const points = [] as { label: string; savings: number }[];
    const base = Math.max(0, rakes.dispatched);
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      // Heuristic series: ramp up to current dispatched; smooth curve
      const factor = (7 - i) / 7;
      const savings = Math.round(base * (0.8 + 0.4 * factor) * 2.5); // lakhs (assumed 2.5L per rake)
      points.push({ label, savings });
    }
    return points;
  }, [rakes.dispatched]);

  const hasSignal = (rakes.total || rakes.dispatched) > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-gray-600">Cost Optimization</div>
          <div className="text-[11px] text-gray-500">Indicative savings trend (₹ Lakhs)</div>
        </div>
      </div>
      {!hasSignal ? (
        <div className="text-sm text-gray-500">No recent rakes to estimate savings yet.</div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="gradSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`₹ ${v.toLocaleString()} L`, 'Savings']} labelClassName="text-gray-600" />
              <Line type="monotone" dataKey="savings" stroke="#16A34A" strokeWidth={3} dot={{ r: 3, fill: '#16A34A' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
      <div>
        <div className="text-sm font-medium text-gray-900">No recent operations yet</div>
        <div className="text-sm text-gray-600 mt-0.5">When orders, rakes or KPIs are available, they’ll appear here.</div>
      </div>
      {onRefresh && (
        <Button size="sm" variant="secondary" onClick={onRefresh}>Refresh</Button>
      )}
    </div>
  );
}
