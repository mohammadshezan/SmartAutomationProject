"use client";
import { useEffect, useRef, useState } from "react";
import { Award, TrendingUp, Users, CheckCircle } from "lucide-react";

const metrics = [
  { icon: Award, value: 50, suffix: "+", label: "Years of Excellence", description: "SAIL's operational legacy" },
  { icon: TrendingUp, value: 20, suffix: "M+", label: "Tonnes Annually", description: "Steel production capacity" },
  { icon: Users, value: 99, suffix: "%", label: "Client Satisfaction", description: "Trusted by major industries" },
  { icon: CheckCircle, value: 95, suffix: "%", label: "On-Time Delivery", description: "SLA compliance rate" },
];

function CountUp({ end, duration = 2000, suffix }: { end: number; duration?: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !played) {
        setPlayed(true);
        let start: number | null = null;
        const startVal = 0;
        const animate = (t: number) => {
          if (start === null) start = t;
          const p = Math.min((t - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          const cur = Math.floor(ease * (end - startVal) + startVal);
          setCount(cur);
          if (p < 1) requestAnimationFrame(animate);
          else setCount(end);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration, played]);
  return <span ref={ref} className="text-5xl md:text-6xl font-bold text-primary">{count}{suffix}</span>;
}

export default function ImpactMetrics() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Impact in Numbers</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Delivering measurable results across India's steel logistics network</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <div key={m.label} className="text-center p-8 bg-white border border-border rounded-lg hover:shadow-elegant transition-all animate-fade-in">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <m.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="mb-2"><CountUp end={m.value} suffix={m.suffix} /></div>
              <h3 className="text-xl font-semibold mb-2">{m.label}</h3>
              <p className="text-sm text-muted-foreground">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
