"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, DollarSign, CheckCircle, X } from "lucide-react"

const recommendations = [
  {
    id: 1,
    type: "cost_optimization",
    title: "Optimize Haldia-Plant A Route",
    description: "Switch from rail to coastal shipping for 15% cost reduction on iron ore transport",
    impact: "₹1.2M monthly savings",
    confidence: 94,
    timeframe: "2 weeks implementation",
    status: "new",
    details: [
      "Reduce transport cost by ₹180/ton",
      "Improve delivery reliability by 12%",
      "Free up 3 rake slots for other routes",
    ],
  },
  {
    id: 2,
    type: "risk_mitigation",
    title: "Preemptive Rake Reallocation",
    description: "Reallocate 2 rakes from low-priority routes to prevent upcoming shortage",
    impact: "Avoid ₹800K demurrage",
    confidence: 87,
    timeframe: "3 days",
    status: "urgent",
    details: [
      "Prevent vessel queue at Paradip",
      "Maintain on-time delivery schedule",
      "Optimize rake utilization by 8%",
    ],
  },
  {
    id: 3,
    type: "efficiency",
    title: "Port Sequence Optimization",
    description: "Adjust vessel discharge sequence at Vizag for better berth utilization",
    impact: "₹400K cost avoidance",
    confidence: 78,
    timeframe: "1 week",
    status: "pending_review",
    details: [
      "Reduce average waiting time by 4 hours",
      "Increase berth utilization to 85%",
      "Improve port throughput by 12%",
    ],
  },
  {
    id: 4,
    type: "predictive",
    title: "Weather-Based Route Planning",
    description: "Adjust shipping schedule based on monsoon forecast for next month",
    impact: "₹600K risk mitigation",
    confidence: 82,
    timeframe: "2 weeks planning",
    status: "approved",
    details: ["Avoid weather-related delays", "Optimize inventory buffer levels", "Reduce emergency procurement costs"],
  },
]

const getTypeColor = (type: string) => {
  switch (type) {
    case "cost_optimization":
      return "bg-chart-2"
    case "risk_mitigation":
      return "bg-destructive"
    case "efficiency":
      return "bg-primary"
    case "predictive":
      return "bg-chart-3"
    default:
      return "bg-muted"
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "new":
      return <Badge variant="default">New</Badge>
    case "urgent":
      return <Badge variant="destructive">Urgent</Badge>
    case "pending_review":
      return <Badge variant="secondary">Pending Review</Badge>
    case "approved":
      return (
        <Badge variant="outline" className="border-chart-2 text-chart-2">
          Approved
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function AIRecommendationEngine() {
  return (
    <div className="space-y-6">
      {/* AI Engine Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Recommendation Engine
          </CardTitle>
          <CardDescription>ML-powered optimization suggestions based on real-time data analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">4</p>
              <p className="text-sm text-muted-foreground">Active Recommendations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-2">₹3.0M</p>
              <p className="text-sm text-muted-foreground">Potential Savings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-3">85%</p>
              <p className="text-sm text-muted-foreground">Avg Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">12</p>
              <p className="text-sm text-muted-foreground">Implemented This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <Card key={rec.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(rec.type)}`}></div>
                      <h3 className="font-semibold text-lg">{rec.title}</h3>
                      {getStatusBadge(rec.status)}
                    </div>
                    <p className="text-muted-foreground">{rec.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-xl font-bold text-primary">{rec.confidence}%</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-chart-2" />
                    <span className="text-sm text-muted-foreground">Impact:</span>
                    <span className="font-semibold text-chart-2">{rec.impact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Timeframe:</span>
                    <span className="font-semibold">{rec.timeframe}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Benefits:</p>
                  <ul className="space-y-1">
                    {rec.details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-chart-2" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {rec.status === "approved" ? (
                    <Button className="bg-chart-2 hover:bg-chart-2/90">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Implement
                    </Button>
                  ) : (
                    <>
                      <Button>Approve & Implement</Button>
                      <Button variant="outline">Review Details</Button>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                        Dismiss
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
