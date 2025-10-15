import React from "react";
import ManagerBreadcrumb from "@/components/ManagerBreadcrumb";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 md:px-6">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-black/50 to-transparent backdrop-blur supports-[backdrop-filter]:bg-black/30 -mx-4 md:-mx-6 px-4 md:px-6 py-3 border-b border-white/10">
        <ManagerBreadcrumb />
      </div>
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}
