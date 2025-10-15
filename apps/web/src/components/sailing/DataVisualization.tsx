"use client";
import { Card } from "@/components/ui/card";
import { BarChart as RBarChart, Bar, PieChart, Pie, Cell, LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Package, Route, DollarSign } from "lucide-react";

const rakeUtilizationData = [
  { name: "Bokaro-CMO", value: 35, color: "hsl(var(--primary))" },
  { name: "Bokaro-Vizag", value: 25, color: "hsl(var(--primary) / 0.8)" },
  { name: "Bokaro-Mumbai", value: 20, color: "hsl(var(--primary) / 0.6)" },
  { name: "Other Routes", value: 20, color: "hsl(var(--primary) / 0.4)" },
];

const monthlyDispatchData = [
  { month: "Jan", dispatched: 85, planned: 90 },
  { month: "Feb", dispatched: 92, planned: 95 },
  { month: "Mar", dispatched: 88, planned: 90 },
  { month: "Apr", dispatched: 95, planned: 92 },
  { month: "May", dispatched: 98, planned: 95 },
  { month: "Jun", dispatched: 94, planned: 95 },
];

const costSavingsData = [
  { month: "Jan", savings: 12 },
  { month: "Feb", savings: 18 },
  { month: "Mar", savings: 15 },
  { month: "Apr", savings: 22 },
  { month: "May", savings: 28 },
  { month: "Jun", savings: 25 },
];

const deliveryPerformanceData = [
  { category: "On-Time", value: 95 },
  { category: "Delayed", value: 5 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))"]; // on-time, delayed

const stats = [
  { icon: Package, label: "Average Load Efficiency", value: "96.5%", description: "Per rake optimization" },
  { icon: Route, label: "Routes Optimized", value: "24", description: "Active dispatch routes" },
  { icon: DollarSign, label: "Cost Reduction", value: "₹2.4Cr", description: "YTD savings" },
  { icon: TrendingUp, label: "Efficiency Gain", value: "18%", description: "vs. manual planning" },
];

export default function DataVisualization() {
  return (
    <section className="py-24 scroll-mt-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Performance Analytics</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Real-time insights into rake optimization and logistics efficiency</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((s, i) => (
            <Card key={s.label} className="p-6 bg-card border border-border hover:shadow-elegant transition-all animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-primary mb-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 bg-card border border-border animate-fade-in">
            <h3 className="text-xl font-semibold mb-6">Rake Utilization by Route</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={rakeUtilizationData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                  {rakeUtilizationData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-card border border-border animate-fade-in">
            <h3 className="text-xl font-semibold mb-6">Monthly Dispatch Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RBarChart data={monthlyDispatchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
                <Legend />
                <Bar dataKey="planned" fill="hsl(var(--primary) / 0.35)" name="Planned (000' tonnes)" />
                <Bar dataKey="dispatched" fill="hsl(var(--primary))" name="Dispatched (000' tonnes)" />
              </RBarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-card border border-border animate-fade-in">
            <h3 className="text-xl font-semibold mb-6">Monthly Cost Savings Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RLineChart data={costSavingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="hsl(var(--primary))" strokeWidth={3} name="Savings (₹ Lakhs)" dot={{ fill: 'hsl(var(--primary))', r: 5 }} />
              </RLineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-card border border-border animate-fade-in">
            <h3 className="text-xl font-semibold mb-6">On-Time Delivery Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={ [{ name: 'On-Time', value: 95 }, { name: 'Delayed', value: 5 }] } cx="50%" cy="50%" labelLine={false} label={({ name, value }: any) => `${name}: ${value}%`} outerRadius={100} dataKey="value">
                  {COLORS.map((c, i) => (<Cell key={`pc-${i}`} fill={c} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </section>
  );
}
