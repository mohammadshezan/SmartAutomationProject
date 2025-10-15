"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const featureLinks: { href: string; label: string }[] = [
  { href: "/admin/rake-formation", label: "Rake Formation" },
  { href: "/admin/orders-demand", label: "Orders & Demand" },
  { href: "/admin/material-availability", label: "Material Availability" },
  { href: "/admin/logistics", label: "Logistics & Trains" },
  { href: "/admin/stockyard-operations", label: "Stockyard Ops" },
  { href: "/admin/customer-deliveries", label: "Customer Deliveries" },
  { href: "/admin/ai-insights", label: "AI/ML Insights" },
  { href: "/admin/kpis", label: "KPIs & Performance" },
  { href: "/admin/alerts", label: "Alerts & Notifications" },
  { href: "/admin/admin-controls", label: "Admin Controls" },
];

const toolLinks: { href: string; label: string }[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block w-64 md:w-64 lg:w-64 xl:w-64 shrink-0 border-r border-white/10 bg-black/20 sticky top-0 h-screen overflow-y-auto">
      <div className="p-4 text-[11px] uppercase tracking-wider text-gray-400">Admin</div>
      <div className="px-3 pb-6">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 px-2 mb-2">Features</div>
        <nav className="space-y-1 mb-6">
          {featureLinks.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="text-[10px] uppercase tracking-wider text-gray-500 px-2 mb-2">Tools</div>
        <nav className="space-y-1 pb-6">
          {toolLinks.map((l) => {
            const active = pathname === l.href || (pathname?.startsWith(l.href) && l.href !== "/admin/dashboard");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
