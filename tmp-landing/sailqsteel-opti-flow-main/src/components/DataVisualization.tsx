import { Card } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Package, Route, DollarSign } from "lucide-react";

// Rake Utilization Data by Route
const rakeUtilizationData = [
  { name: "Bokaro-CMO", value: 35, color: "#0b4a85" },
  { name: "Bokaro-Vizag", value: 25, color: "#1565a8" },
  { name: "Bokaro-Mumbai", value: 20, color: "#2196f3" },
  { name: "Other Routes", value: 20, color: "#64b5f6" },
];

// Monthly Dispatch Trends (in thousands of tonnes)
const monthlyDispatchData = [
  { month: "Jan", dispatched: 85, planned: 90 },
  { month: "Feb", dispatched: 92, planned: 95 },
  { month: "Mar", dispatched: 88, planned: 90 },
  { month: "Apr", dispatched: 95, planned: 92 },
  { month: "May", dispatched: 98, planned: 95 },
  { month: "Jun", dispatched: 94, planned: 95 },
];

// Cost Savings Trend (in lakhs)
const costSavingsData = [
  { month: "Jan", savings: 12 },
  { month: "Feb", savings: 18 },
  { month: "Mar", savings: 15 },
  { month: "Apr", savings: 22 },
  { month: "May", savings: 28 },
  { month: "Jun", savings: 25 },
];

// Delivery Performance Data
const deliveryPerformanceData = [
  { category: "On-Time", value: 95 },
  { category: "Delayed", value: 5 },
];

const COLORS = ["#0b4a85", "#ef4444"];

const stats = [
  {
    icon: Package,
    label: "Average Load Efficiency",
    value: "96.5%",
    description: "Per rake optimization",
  },
  {
    icon: Route,
    label: "Routes Optimized",
    value: "24",
    description: "Active dispatch routes",
  },
  {
    icon: DollarSign,
    label: "Cost Reduction",
    value: "₹2.4Cr",
    description: "YTD savings",
  },
  {
    icon: TrendingUp,
    label: "Efficiency Gain",
    value: "18%",
    description: "vs. manual planning",
  },
];

const DataVisualization = () => {
  return (
    <section id="portals" className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Performance Analytics
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time insights into rake optimization and logistics efficiency
          </p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 bg-card border-border hover:shadow-elegant transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Rake Utilization Pie Chart */}
          <Card className="p-6 bg-card border-border animate-fade-in">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Rake Utilization by Route
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rakeUtilizationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rakeUtilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Dispatch Bar Chart */}
          <Card className="p-6 bg-card border-border animate-fade-in">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Monthly Dispatch Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyDispatchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#ffffff", 
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Bar dataKey="planned" fill="#64b5f6" name="Planned (000' tonnes)" />
                <Bar dataKey="dispatched" fill="#0b4a85" name="Dispatched (000' tonnes)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Cost Savings Line Chart */}
          <Card className="p-6 bg-card border-border animate-fade-in">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Monthly Cost Savings Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costSavingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#ffffff", 
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#0b4a85" 
                  strokeWidth={3}
                  name="Savings (₹ Lakhs)"
                  dot={{ fill: "#0b4a85", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Delivery Performance Pie Chart */}
          <Card className="p-6 bg-card border-border animate-fade-in">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              On-Time Delivery Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliveryPerformanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DataVisualization;
