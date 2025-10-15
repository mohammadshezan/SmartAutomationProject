"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, AlertTriangle, Zap } from "lucide-react"

interface AIInsight {
  id: string
  type: "optimization" | "prediction" | "alert" | "recommendation"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  confidence: number
  action?: string
}

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching AI insights
    setTimeout(() => {
      setInsights([
        {
          id: "1",
          type: "optimization",
          title: "Route Optimization Available",
          description:
            "AI detected 18% cost reduction opportunity for Vessel MV-2024-A by adjusting route through Kandla port.",
          impact: "high",
          confidence: 0.92,
          action: "Apply Optimization",
        },
        {
          id: "2",
          type: "prediction",
          title: "Demand Spike Predicted",
          description: "ML models predict 25% increase in steel demand at Jamshedpur plant next week.",
          impact: "high",
          confidence: 0.87,
        },
        {
          id: "3",
          type: "alert",
          title: "Maintenance Alert",
          description: "Rake R-456 showing early signs of bearing wear. Predicted failure in 10-12 days.",
          impact: "medium",
          confidence: 0.78,
          action: "Schedule Maintenance",
        },
        {
          id: "4",
          type: "recommendation",
          title: "Inventory Optimization",
          description: "Consider increasing buffer stock by 12% at Chennai hub based on seasonal patterns.",
          impact: "medium",
          confidence: 0.84,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return <Zap className="h-4 w-4" />
      case "prediction":
        return <TrendingUp className="h-4 w-4" />
      case "alert":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "medium":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-blue-400" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-5 w-5 text-blue-400" />
          AI Insights
          <Badge variant="secondary" className="ml-auto bg-blue-500/10 text-blue-400">
            {insights.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type)}
                <h4 className="font-medium text-white">{insight.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getImpactColor(insight.impact)}>{insight.impact}</Badge>
                <span className="text-xs text-gray-400">{Math.round(insight.confidence * 100)}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
            {insight.action && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                {insight.action}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
