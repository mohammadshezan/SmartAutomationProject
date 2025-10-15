"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, AlertTriangle, Clock } from "lucide-react"

const insights = [
  {
    type: "forecast",
    title: "Demand Surge Prediction",
    description: "AI forecasts 15% increase in steel demand next quarter based on infrastructure projects",
    impact: "High",
    timeframe: "Next Quarter",
    confidence: 87,
    action: "Increase raw material procurement by 12%",
  },
  {
    type: "risk",
    title: "Monsoon Impact Assessment",
    description: "Weather models predict moderate disruption to eastern ports in July-August",
    impact: "Medium",
    timeframe: "2 months",
    confidence: 78,
    action: "Pre-position inventory at inland plants",
  },
  {
    type: "optimization",
    title: "Route Efficiency Opportunity",
    description: "New coastal shipping route could reduce costs by ₹2.1M annually",
    impact: "High",
    timeframe: "6 months",
    confidence: 92,
    action: "Evaluate coastal shipping partnership",
  },
  {
    type: "market",
    title: "Iron Ore Price Volatility",
    description: "Market analysis suggests 8% price increase in Q4 due to global supply constraints",
    impact: "Medium",
    timeframe: "Q4 2024",
    confidence: 74,
    action: "Consider forward contracts for price stability",
  },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "forecast":
      return <TrendingUp className="h-4 w-4 text-chart-2" />
    case "risk":
      return <AlertTriangle className="h-4 w-4 text-accent" />
    case "optimization":
      return <Brain className="h-4 w-4 text-primary" />
    case "market":
      return <Clock className="h-4 w-4 text-chart-3" />
    default:
      return null
  }
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "High":
      return "destructive"
    case "Medium":
      return "default"
    case "Low":
      return "secondary"
    default:
      return "outline"
  }
}

export function PredictiveInsightsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Predictive Insights
        </CardTitle>
        <CardDescription>Machine learning forecasts and strategic recommendations for next 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(insight.type)}
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant={getImpactColor(insight.impact) as any}>{insight.impact} Impact</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold text-primary">{insight.confidence}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Timeframe</p>
                  <p className="font-medium">{insight.timeframe}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recommended Action</p>
                  <p className="font-medium text-primary">{insight.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Engine Status */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-primary">4</p>
              <p className="text-sm text-muted-foreground">Active Predictions</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-chart-2">83%</p>
              <p className="text-sm text-muted-foreground">Avg Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-chart-3">12</p>
              <p className="text-sm text-muted-foreground">Models Running</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-accent">24/7</p>
              <p className="text-sm text-muted-foreground">Monitoring</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
