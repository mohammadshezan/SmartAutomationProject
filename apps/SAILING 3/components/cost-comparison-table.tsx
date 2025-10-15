"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown } from "lucide-react"

const comparisonData = [
  {
    route: "Haldia → Plant A",
    optimized: 2840,
    actual: 3250,
    savings: 410,
    percentage: 12.6,
    status: "optimized",
  },
  {
    route: "Paradip → Plant B",
    optimized: 2650,
    actual: 2890,
    savings: 240,
    percentage: 8.3,
    status: "optimized",
  },
  {
    route: "Vizag → Plant C",
    optimized: 3120,
    actual: 3680,
    savings: 560,
    percentage: 15.2,
    status: "optimized",
  },
  {
    route: "Chennai → Plant D",
    optimized: 2980,
    actual: 3150,
    savings: 170,
    percentage: 5.4,
    status: "optimized",
  },
  {
    route: "Haldia → Plant E",
    optimized: 2750,
    actual: 2820,
    savings: 70,
    percentage: 2.5,
    status: "minimal",
  },
]

export function CostComparisonTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimized vs Actual Cost Comparison</CardTitle>
        <CardDescription>Route-wise cost analysis showing optimization impact (₹ per ton)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium">Route</th>
                <th className="text-right p-3 font-medium">Optimized Cost</th>
                <th className="text-right p-3 font-medium">Actual Cost</th>
                <th className="text-right p-3 font-medium">Savings</th>
                <th className="text-right p-3 font-medium">% Reduction</th>
                <th className="text-center p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="p-3 font-medium">{row.route}</td>
                  <td className="p-3 text-right font-mono text-chart-2">₹{row.optimized.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono">₹{row.actual.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-chart-2">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingDown className="h-3 w-3" />₹{row.savings.toLocaleString()}
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-chart-2">{row.percentage}%</td>
                  <td className="p-3 text-center">
                    <Badge variant={row.status === "optimized" ? "default" : "secondary"}>
                      {row.status === "optimized" ? "Optimized" : "Minimal"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-xl font-bold text-chart-2">₹1,450</p>
            <p className="text-sm text-muted-foreground">Total Savings/Ton</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-primary">8.8%</p>
            <p className="text-sm text-muted-foreground">Average Reduction</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-accent">5</p>
            <p className="text-sm text-muted-foreground">Routes Optimized</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-chart-3">₹2.9M</p>
            <p className="text-sm text-muted-foreground">Monthly Impact</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
