"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Ocean Freight", value: 28.4, color: "#3b82f6" },
  { name: "Port Charges", value: 8.2, color: "#10b981" },
  { name: "Rail Transport", value: 6.8, color: "#f59e0b" },
  { name: "Demurrage", value: 2.1, color: "#ef4444" },
  { name: "Other Costs", value: 1.7, color: "#8b5cf6" },
]

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function CostBreakdownChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown Analysis</CardTitle>
        <CardDescription>Distribution of logistics costs by category (₹ Million)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                  formatter={(value: number) => [`₹${value}M`, "Cost"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Details */}
          <div className="space-y-4">
            <h4 className="font-semibold">Cost Category Details</h4>
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{item.value}M</p>
                  <p className="text-xs text-muted-foreground">
                    {((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Cost</span>
                <span className="text-xl font-bold text-primary">
                  ₹{data.reduce((sum, d) => sum + d.value, 0).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
