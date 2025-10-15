import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[16rem_1fr]">
      <AdminSidebar />
      <main className="px-4 md:px-8 py-6 md:py-8 max-w-7xl w-full mx-auto">
        <div className="mb-6 md:mb-8 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-4 md:p-6">
          <h1 className="text-lg md:text-xl font-semibold">Admin Console</h1>
          <p className="text-sm text-gray-300">Monitor logistics, manage controls, and review KPIs.</p>
        </div>
        <div className="space-y-6 md:space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
