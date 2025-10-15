"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { month: "Jan", actual: 52.4, optimized: 48.2, budget: 50.0 },
  { month: "Feb", actual: 49.8, optimized: 45.6, budget: 50.0 },
  { month: "Mar", actual: 51.2, optimized: 46.8, budget: 50.0 },
  { month: "Apr", actual: 48.6, optimized: 44.2, budget: 50.0 },
  { month: "May", actual: 47.3, optimized: 43.1, budget: 50.0 },
  { month: "Jun", actual: 45.2, optimized: 41.8, budget: 50.0 },
]

export function MonthlyTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cost Trends</CardTitle>
        <CardDescription>Historical vs optimized costs with budget comparison (₹ Million)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${value}M`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
                formatter={(value: number, name: string) => [
                  `₹${value}M`,
                  name === "actual" ? "Actual Cost" : name === "optimized" ? "Optimized Cost" : "Budget",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                name="Actual Cost"
              />
              <Line
                type="monotone"
                dataKey="optimized"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                name="Optimized Cost"
              />
              <Line
                type="monotone"
                dataKey="budget"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
                name="Budget"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-chart-2">₹12.4M</p>
            <p className="text-sm text-muted-foreground">Total Savings (6 months)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">18%</p>
            <p className="text-sm text-muted-foreground">Average Cost Reduction</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">₹4.8M</p>
            <p className="text-sm text-muted-foreground">Under Budget</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
