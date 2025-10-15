"use client";
import { Database, Brain, TrendingUp, Shield } from "lucide-react";

const strengths = [
  { icon: Database, title: "Real-Time Data Integration", description: "Seamlessly integrates stockyard inventory, customer orders, and rake availability for comprehensive visibility." },
  { icon: Brain, title: "AI/ML Optimization Engine", description: "Advanced algorithms analyze multiple variables to create optimal rake formations, maximizing efficiency and reducing costs." },
  { icon: TrendingUp, title: "Performance Analytics", description: "Track key metrics, delivery SLAs, and cost optimization in real-time with actionable insights and predictive trends." },
  { icon: Shield, title: "Proven Reliability", description: "Built on 50+ years of SAIL's operational excellence, ensuring robust and dependable logistics management." },
];

export default function CoreStrengths() {
  return (
    <section id="strengths" className="py-24 scroll-mt-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Core Strengths</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Leveraging cutting-edge technology to revolutionize logistics operations</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {strengths.map((s, i) => (
            <div key={s.title} className="p-6 bg-white border border-border rounded-xl hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
