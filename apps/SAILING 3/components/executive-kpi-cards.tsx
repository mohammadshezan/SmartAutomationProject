"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Clock, Shield, BarChart3 } from "lucide-react"

const kpis = [
  {
    title: "Monthly Savings",
    value: "₹12.4M",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    color: "text-chart-2",
  },
  {
    title: "Demurrage Reduction",
    value: "35%",
    change: "vs last quarter",
    trend: "up",
    icon: Clock,
    color: "text-primary",
  },
  {
    title: "Delivery Reliability",
    value: "94.2%",
    change: "+2.1%",
    trend: "up",
    icon: Shield,
    color: "text-chart-3",
  },
  {
    title: "Cost Per Ton",
    value: "₹1,840",
    change: "-8%",
    trend: "down",
    icon: BarChart3,
    color: "text-accent",
  },
]

export function ExecutiveKPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown
        const trendColor = kpi.trend === "up" ? "text-chart-2" : "text-chart-4"

        return (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                  <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
                    <TrendIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">{kpi.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted ${kpi.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
