"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { month: "Jan", savings: 8.2, target: 10 },
  { month: "Feb", savings: 9.1, target: 10 },
  { month: "Mar", savings: 11.5, target: 10 },
  { month: "Apr", savings: 10.8, target: 10 },
  { month: "May", savings: 12.4, target: 10 },
  { month: "Jun", savings: 13.2, target: 10 },
]

export function CostSavingsChart() {
  return (
    <div className="h-64">
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
              name === "savings" ? "Actual Savings" : "Target",
            ]}
          />
          <Line
            type="monotone"
            dataKey="savings"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#f97316", strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
