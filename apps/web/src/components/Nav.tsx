"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";

export default function Nav() {
  // Defer auth-dependent UI to client after mount to avoid hydration mismatches
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [role, setRole] = useState<string>('guest');
  const pathname = usePathname();
  const isLanding = pathname === '/';
  // Customer portal / public auth onboarding context detection
  const isCustomerPortalContext = useMemo(()=>{
    if (!pathname) return false;
    return pathname.startsWith('/signup') || pathname.startsWith('/customer-auth') || pathname.startsWith('/login');
  }, [pathname]);
  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };
  const currentLabel = useMemo(() => {
    if (!pathname) return '';
    if (pathname.startsWith('/manager')) {
      if (pathname.startsWith('/manager/dashboard')) return 'Dashboard';
      if (pathname.startsWith('/manager/low-stock')) return 'Low Stock';
      if (pathname.startsWith('/manager/approvals')) return 'Approvals';
      if (pathname.startsWith('/manager/rake-planner')) return 'Rake Planner';
      if (pathname.startsWith('/manager/planner')) return 'Planner';
    }
    if (pathname.startsWith('/optimizer')) return 'Optimizer';
    if (pathname.startsWith('/map')) return 'Map';
    if (pathname.startsWith('/projects')) return 'Projects';
    if (pathname.startsWith('/reports/production-alignment')) return 'Alignment';
    if (pathname.startsWith('/reports')) return 'Reports';
    return '';
  }, [pathname]);
  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || '';
      setAuthed(!!token);
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1] || '')) || {};
        setRole(payload?.role || 'guest');
      } else {
        setRole('guest');
      }
    } catch {
      setAuthed(false);
      setRole('guest');
    }
  }, []);
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/10">
      <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
  <Link href="/" className="flex items-center gap-2">
          <img
            src="/brand/logo.svg"
            alt="QSTEEL"
            className="h-7 w-7"
            onError={(e)=>{
              const img = e.currentTarget as HTMLImageElement;
              const tried = img.getAttribute('data-fallback') || 'svg';
              if (tried === 'svg') {
                img.setAttribute('data-fallback','png');
                img.src = '/brand/logo.png';
              } else if (tried === 'png') {
                img.setAttribute('data-fallback','default');
                img.src = '/logo.svg';
              }
            }}
          />
          <span className="font-semibold">QSTEEL</span>
          {currentLabel && (
            <span className="ml-3 hidden sm:inline text-xs rounded bg-white/10 px-2 py-0.5 text-white/80 border border-white/10">
              {currentLabel}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {isCustomerPortalContext ? (
            // Minimal navigation during customer portal / signup flows
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-white/70 hover:text-white transition">Back Home</Link>
              <Link href="/signin" className="rounded-md bg-brand-green text-black px-3 py-1 font-medium shadow hover:shadow-lg transition">Sign in</Link>
            </div>
          ) : authed && !isLanding ? (
            // Authenticated navigation
            <>
              {role==='customer' && (
                <>
                  <Link href="/customer/dashboard" className={isActive('/customer/dashboard')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:underline transition'} aria-current={isActive('/customer/dashboard')? 'page': undefined}>Dashboard</Link>
                  <Link href="/customer/orders" className={isActive('/customer/orders')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:underline transition'} aria-current={isActive('/customer/orders')? 'page': undefined}>Orders</Link>
                  <Link href="/customer/invoices" className={isActive('/customer/invoices')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:underline transition'} aria-current={isActive('/customer/invoices')? 'page': undefined}>Invoices</Link>
                  <Link href="/customer/notifications" className={isActive('/customer/notifications')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:underline transition'} aria-current={isActive('/customer/notifications')? 'page': undefined}>Notifications</Link>
                </>
              )}
              {role==='manager' && !isCustomerPortalContext && (
                <>
                  <Link href="/manager/dashboard" className={isActive('/manager/dashboard')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:text-white transition'} aria-current={isActive('/manager/dashboard')? 'page': undefined}>Dashboard</Link>
                  <Link href="/manager/low-stock" className={isActive('/manager/low-stock')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:text-white transition'} aria-current={isActive('/manager/low-stock')? 'page': undefined}>Low Stock</Link>
                  <Link href="/manager/approvals" className={isActive('/manager/approvals')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:text-white transition'} aria-current={isActive('/manager/approvals')? 'page': undefined}>Approvals</Link>
                  <Link href="/manager/rake-planner" className={isActive('/manager/rake-planner')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:text-white transition'} aria-current={isActive('/manager/rake-planner')? 'page': undefined}>Rake Planner</Link>
                  <Link href="/manager/planner" className={isActive('/manager/planner')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:text-white transition'} aria-current={isActive('/manager/planner')? 'page': undefined}>Planner</Link>
                  <Link href="/map" className={isActive('/map')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:text-white transition'} aria-current={isActive('/map')? 'page': undefined}>Map</Link>
                  <Link href="/projects/tracker" className={isActive('/projects')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:text-white transition'} aria-current={isActive('/projects')? 'page': undefined}>Projects</Link>
                  <Link href="/optimizer" className={isActive('/optimizer')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:text-white transition'} aria-current={isActive('/optimizer')? 'page': undefined}>Optimizer</Link>
                  <Link href="/reports" className={isActive('/reports')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:text-white transition'} aria-current={isActive('/reports')? 'page': undefined}>Reports</Link>
                  <Link href="/reports/production-alignment" className={isActive('/reports/production-alignment')? 'text-white font-semibold border-b-2 border-brand-green pb-0.5' : 'text-white/80 hover:text-white transition'} aria-current={isActive('/reports/production-alignment')? 'page': undefined}>Alignment</Link>
                </>
              )}
              {role==='yard' && (
                <>
                  <Link href="/yard-actions">Yard</Link>
                  <Link href="/yard/planned">Planned</Link>
                  <Link href="/map">Map</Link>
                  <Link href="/crew/controls">Crew</Link>
                  <Link href="/yard/wagon-health">Wagon Health</Link>
                  <Link href="/yard/safety">Safety</Link>
                </>
              )}
              {role==='admin' && (
                <>
                  <Link href="/admin/dashboard">Admin</Link>
                  <Link href="/admin/production">Production</Link>
                  <Link href="/manager/planner">Planner</Link>
                  <Link href="/manager/rake-planner">Rake Planner</Link>
                </>
              )}
              {role==='supervisor' && (
                <>
                  <Link href="/supervisor/dashboard">Dashboard</Link>
                  <Link href="/stockyard">Stockyards</Link>
                  <Link href="/supervisor/report-low-stock">Report Low Stock</Link>
                </>
              )}
              {role==='cmo' && (
                <>
                  <Link href="/cmo/dashboard">Dashboard</Link>
                  <Link href="/cmo/new-order">New Order</Link>
                  <Link href="/cmo/allocation">Allocation</Link>
                  <Link href="/cmo/approvals">Approvals</Link>
                  <Link href="/cmo/audit">Audit</Link>
                  <Link href="/projects/tracker">Projects</Link>
                </>
              )}
              {role==='crew' && (
                <>
                  <Link href="/map">Map</Link>
                  <Link href="/crew/controls">Crew Controls</Link>
                </>
              )}
              <button onClick={()=>{ localStorage.removeItem('token'); location.href='/'; }} className="rounded-md border border-white/10 px-3 py-1">Sign out</button>
            </>
          ) : (
            // Public / onboarding navigation (customer portal minimal)
            <div className="flex items-center gap-4">
              {!isCustomerPortalContext && (
                <Link href="/customer-auth" className="hover:underline">Customer Portal</Link>
              )}
              {isCustomerPortalContext && (
                <Link href="/" className="text-sm text-white/60 hover:text-white transition">Back Home</Link>
              )}
              <Link href="/signin" className="rounded-md bg-brand-green text-black px-3 py-1 font-medium shadow hover:shadow-lg transition">Sign in</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
