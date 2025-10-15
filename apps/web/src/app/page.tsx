"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/config";
import { AnimatedStats } from "@/components/sailing/animated-stats";
import Hero from "@/components/sailing/Hero";
import Header from "@/components/sailing/Header";
import CoreStrengths from "@/components/sailing/CoreStrengths";
import HowItWorks from "@/components/sailing/HowItWorks";
import ImpactMetrics from "@/components/sailing/ImpactMetrics";
import DataVisualization from "@/components/sailing/DataVisualization";
import Footer from "@/components/sailing/Footer";

export default function LandingPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try authenticated KPIs if a token exists
        const token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';
        if (token) {
          try {
            const r = await fetch(withBase('/kpis'), { headers: { Authorization: `Bearer ${token}` } });
            if (r.ok) {
              const data = await r.json();
              if (mounted) setKpis(data);
            }
          } catch {}
        } else {
          // Public KPIs for guests
          try {
            const rpub = await fetch(withBase('/kpis/public'));
            if (rpub.ok) {
              const data = await rpub.json();
              if (mounted) setKpis(data);
            }
          } catch {}
        }
        // Always load public live positions for everyone
        try {
          const rp = await fetch(withBase('/positions/public'));
          if (rp.ok) {
            const arr = await rp.json();
            if (mounted) setPositions(Array.isArray(arr) ? arr : []);
          }
        } catch {}
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const derived = useMemo(() => {
    const activeRakes = kpis ? (Number(kpis.pendingRakes||0) + Number(kpis.dispatchedRakes||0)) : positions.length;
    const avgSpeed = positions.length ? Number((positions.reduce((s,p)=> s + Number(p.speed||0), 0) / positions.length).toFixed(1)) : null;
    const liveDestinations = new Set(positions.map(p => String(p.destination||'').split(',')[0].trim()).filter(Boolean)).size;
    const carbonSavedToday = kpis ? kpis.co2Total : null;
    const cargoTypes = Array.from(new Set(positions.map(p => String(p.cargo||'').toUpperCase()).filter(Boolean)));
    return { activeRakes, avgSpeed, liveDestinations, carbonSavedToday, cargoTypes };
  }, [kpis, positions]);

  return (
    <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
      <Header />
      {/* Hero */}
      <Hero />

      {/* Animated capability stats */}
      <section className="mx-auto max-w-7xl px-6 pt-10 pb-0">
        <AnimatedStats />
      </section>

      {/* Live KPI cards */}
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {loading && [1,2,3].map(i => (
            <div key={i} className="rounded-xl bg-card p-6 border border-border animate-pulse h-[112px]" />
          ))}
          {!loading && (
            <>
              {!!derived.activeRakes && (
                <CardStat className="kpi-card bg-card border border-border hover:shadow-elegant transition-all duration-200"
                  label="Total Active Rakes" value={<Counter to={Number(derived.activeRakes)} suffix="" />} />
              )}
              {!!derived.liveDestinations && (
                <CardStat className="kpi-card bg-card border border-border hover:shadow-elegant transition-all duration-200"
                  label="Live Destinations" value={<Counter to={Number(derived.liveDestinations)} suffix="" />} />
              )}
              {derived.avgSpeed != null && (
                <CardStat className="kpi-card bg-card border border-border hover:shadow-elegant transition-all duration-200"
                  label="Avg Speed" value={<Counter to={Number(derived.avgSpeed)} suffix=" km/h" />} />
              )}
            </>
          )}
        </div>
      </section>

      {/* Features replaced by CoreStrengths */}
      <CoreStrengths />
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Partners / Trust logos */}
      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-90">
          <img src="/images/sail-logo.jpg" alt="SAIL" className="h-10 w-auto rounded shadow-sm" />
          <div className="h-6 w-px bg-slate-200" />
          <img src="/images/qsteel-logo-new.png" alt="QSTEEL" className="h-8 w-auto rounded shadow-sm" />
        </div>
      </section>

      {/* Live Preview removed per request */}

      {/* Process */}
      <HowItWorks />

      {/* Impact */}
      <ImpactMetrics />

      {/* Signup/Login CTA removed per request */}

      {/* Testimonials & Sustainability removed per request */}

  {/* Analytics & Charts */}
  <div id="analytics-section" className="scroll-mt-28">
    <DataVisualization />
  </div>

  {/* Final CTA removed per request (removed #support > div) */}
  <section id="support" className="mx-auto max-w-7xl px-6 pb-12 scroll-mt-28" />

      {/* Ledger Transparency removed per request */}

      {/* Footer */}
      <Footer />
    </main>
  );
}

function CardStat({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-6 ${className ?? ""}`}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc, href }: { icon?: React.ReactNode; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all block hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20">
      <div className="flex items-center gap-2 text-lg font-medium">{icon}<span>{title}</span></div>
      <div className="text-sm text-gray-400 mt-1">{desc}</div>
      <div className="text-sm text-gray-300 mt-3 underline">Learn more →</div>
    </Link>
  );
}

function ModuleCard({ icon, title, items, href }: { icon?: React.ReactNode; title: string; items: string[]; href: string }) {
  return (
    <Link href={href} className="rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-all block hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20">
      <div className="flex items-center gap-2 text-lg font-medium">{icon}<span>{title}</span></div>
      <ul className="mt-2 text-sm text-gray-300 space-y-1">
        {items.map((i) => (<li key={i}>• {i}</li>))}
      </ul>
    </Link>
  );
}

function Counter({ to, duration = 1200, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const animate = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setVal(to * p);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  const decimals = Number.isInteger(to) ? 0 : 1;
  const display = decimals ? (val as number).toFixed(decimals) : Math.round(val as number).toLocaleString();
  return <span>{display}{suffix}</span>;
}

// Inline icons (simple, no external deps)
function IconAI() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-green">
      <path d="M12 2l2.5 4.5L20 8l-3.5 3 1 4.5-4-2-4 2 1-4.5L4 8l5.5-1.5L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-green">
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
function IconLeaf() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-green">
      <path d="M20 4c-7 0-12 5-12 12 0 2 1 4 3 4 7 0 12-5 12-12 0-2-1-4-3-4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 16c2-1 5-3 8-6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconLedger() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-green">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconFactory() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-green">
      <path d="M3 21V9l6 3V9l6 3V5l6 3v13H3z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 21v-4m4 4v-4m4 4v-4m4 4v-4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-green">
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconManager() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-green">
      <path d="M4 17h16M7 13l5-6 5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconYard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-green">
      <rect x="3" y="10" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10V7a2 2 0 012-2h8a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-green">
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 12.5l1.5 1.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
