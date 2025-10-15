"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, LayoutDashboard, CheckCircle2, ClipboardCheck, Calendar, Train, FlaskConical, Factory, BarChart3, MessageSquare, Route, Users } from "lucide-react";
import React from "react";

const labelMap: Record<string, { label: string; icon?: React.ReactNode }> = {
  dashboard: { label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  approvals: { label: "Approvals", icon: <CheckCircle2 className="h-4 w-4" /> },
  "auto-approvals": { label: "Auto Approvals", icon: <ClipboardCheck className="h-4 w-4" /> },
  planner: { label: "Planner", icon: <Calendar className="h-4 w-4" /> },
  "rake-planner": { label: "Rake Planner", icon: <Train className="h-4 w-4" /> },
  simulator: { label: "Simulator", icon: <FlaskConical className="h-4 w-4" /> },
  suppliers: { label: "Suppliers", icon: <Factory className="h-4 w-4" /> },
  kpi: { label: "KPIs", icon: <BarChart3 className="h-4 w-4" /> },
  "low-stock": { label: "Low Stock", icon: <Factory className="h-4 w-4" /> },
  forecasting: { label: "Forecasting", icon: <BarChart3 className="h-4 w-4" /> },
  chat: { label: "Chat", icon: <MessageSquare className="h-4 w-4" /> },
  "alt-transport": { label: "Alt Transport", icon: <Route className="h-4 w-4" /> },
  team: { label: "Team", icon: <Users className="h-4 w-4" /> },
};

export function ManagerBreadcrumb() {
  const pathname = usePathname();
  const parts = (pathname || "").split("/").filter(Boolean);
  const mgrIdx = parts.indexOf("manager");
  const tail = mgrIdx >= 0 ? parts.slice(mgrIdx, mgrIdx + 3) : [];

  if (!tail.length) return null;

  const crumbs = tail.map((seg, idx) => {
    const href = "/" + parts.slice(0, mgrIdx + idx + 1).join("/");
    if (idx === 0) {
      return (
        <Link key={href} href={href} className="text-white/80 hover:text-white transition">
          <span className="inline-flex items-center gap-2 font-medium">Manager</span>
        </Link>
      );
    }
    const meta = labelMap[seg] || { label: seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) };
    return (
      <div key={href} className="inline-flex items-center gap-2">
        <ChevronRight className="h-4 w-4 text-white/40" />
        <Link href={href} className="text-white/80 hover:text-white transition inline-flex items-center gap-1">
          {meta.icon}
          <span>{meta.label}</span>
        </Link>
      </div>
    );
  });

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      {crumbs}
    </nav>
  );
}

export default ManagerBreadcrumb;
