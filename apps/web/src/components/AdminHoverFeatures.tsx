"use client";
import { useState } from "react";

type Feature = { title: string; items: string[] };

const FEATURES: Feature[] = [
  { title: "Rake Formation Status", items: [
    "Total rakes available (empty + loaded)",
    "Ongoing rake formations at Bokaro plant",
    "Wagon allocation details (coal, steel coils, HR/CR sheets, rods)",
    "AI/ML suggested rake composition for optimum utilization",
  ]},
  { title: "Order & Demand Overview", items: [
    "Pending customer orders (quantity, product type, due dates)",
    "Priority orders (urgent, delayed, VIP customers)",
    "Demand forecast (AI-based prediction of future requirements)",
  ]},
  { title: "Material Availability", items: [
    "Plant production output (ready for dispatch)",
    "Inventory at Bokaro plant stockyards",
    "Inventory at CMO stockyards across India",
    "Alerts for low stock / overstock",
  ]},
  { title: "Logistics & Train Movement", items: [
    "Railway rake availability (empty rake schedules)",
    "Train routes (Bokaro → destination stockyards/customers)",
    "Transit time estimation & expected arrivals",
    "Real-time train status (on-time, delayed, rerouted)",
  ]},
  { title: "Stockyard Operations", items: [
    "Stockyard capacity utilization (current vs max)",
    "Incoming rakes (from Bokaro plant)",
    "Outgoing dispatches (to customer locations)",
    "Congestion alerts (nearing capacity)",
  ]},
  { title: "Customer Deliveries", items: [
    "Order fulfillment status (delivered, in-transit, pending)",
    "Estimated delivery dates (AI-based ETA)",
    "Delay analysis (risk of delay)",
    "Customer-wise demand fulfillment %",
  ]},
  { title: "AI/ML Insights", items: [
    "Suggested rake formations for optimal loading",
    "Best routes & stockyard allocation recommendations",
    "Predictive maintenance alerts (wagon health, equipment)",
    "Risk & bottleneck prediction (wagons shortage, congestion)",
  ]},
  { title: "KPI & Performance", items: [
    "Average rake turnaround time",
    "On-time rake dispatch %",
    "Wagon utilization rate (%)",
    "Stockyard utilization efficiency",
    "Customer order fulfillment rate (%)",
    "Cost per ton-km transported",
  ]},
  { title: "Alerts & Notifications", items: [
    "Railway delays & cancellations",
    "Low inventory warnings (plant/stockyard)",
    "Missed/delayed customer order alerts",
    "System errors / anomaly detection",
  ]},
  { title: "Admin Controls", items: [
    "User management (Plant, Stockyard, Customer roles)",
    "API integration management (Railway, sensors, ERP)",
    "AI/ML model monitoring (accuracy, retraining needs)",
    "Audit logs & security access reports",
  ]},
];

export default function AdminHoverFeatures() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-4 overflow-x-auto py-3 text-sm">
          {FEATURES.map((f, idx) => (
            <div
              key={f.title}
              className={`cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 transition-colors ${active===idx? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-200'}`}
              onMouseEnter={() => setActive(idx)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active===idx ? null : idx)}
              title={f.title}
            >
              {f.title}
            </div>
          ))}
        </div>
      </div>
      {active !== null && (
        <div
          className="border-t border-white/10 bg-zinc-900/90 text-sm"
          onMouseEnter={() => void 0}
          onMouseLeave={() => setActive(null)}
        >
          <div className="mx-auto max-w-7xl px-4 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES[active!].items.map((it, i) => (
              <div key={i} className="rounded-md bg-white/5 p-3">
                <div className="font-medium text-white/90">{it.split(" (")[0]}</div>
                <div className="text-gray-300 text-xs mt-1">{it}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
