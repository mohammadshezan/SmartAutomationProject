"use client";
import { Database, Sparkles, Route, BarChart3 } from "lucide-react";

const steps = [
  { icon: Database, title: "Data Integration", description: "Collects real-time data from stockyards, customer orders, and rake availability systems.", number: "01" },
  { icon: Sparkles, title: "AI Optimization", description: "Machine learning analyzes multiple factors to form optimal rake combinations.", number: "02" },
  { icon: Route, title: "Dispatch Planning", description: "Assigns wagons, determines routes, and creates efficient dispatch schedules automatically.", number: "03" },
  { icon: BarChart3, title: "Performance Tracking", description: "Monitors costs, delivery SLAs, and generates actionable insights for improvement.", number: "04" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 scroll-mt-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">A streamlined 4-step process powered by AI</p>
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 -translate-y-1/2" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="bg-white border border-border rounded-lg p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute -top-4 -right-2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow">
                    {step.number}
                  </div>
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
