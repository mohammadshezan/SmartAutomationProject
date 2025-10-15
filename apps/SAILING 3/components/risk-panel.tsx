"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, TrendingUp, MapPin } from "lucide-react"

const risks = [
  {
    id: 1,
    title: "Port Congestion at Haldia",
    description: "High vessel queue causing potential demurrage costs",
    severity: "critical",
    impact: "₹2.4M potential loss",
    eta: "2 days",
    location: "Haldia Port",
    trend: "increasing",
  },
  {
    id: 2,
    title: "Rake Shortage - Eastern Region",
    description: "Insufficient rail capacity for scheduled shipments",
    severity: "high",
    impact: "₹1.8M potential loss",
    eta: "5 days",
    location: "Eastern Railway",
    trend: "stable",
  },
  {
    id: 3,
    title: "Weather Disruption Risk",
    description: "Monsoon forecast may affect port operations",
    severity: "medium",
    impact: "₹800K potential loss",
    eta: "7 days",
    location: "Vizag Port",
    trend: "decreasing",
  },
  {
    id: 4,
    title: "Plant Stock Depletion",
    description: "Plant C approaching critical stock levels",
    severity: "medium",
    impact: "₹1.2M potential loss",
    eta: "10 days",
    location: "Plant C - Bhilai",
    trend: "stable",
  },
  {
    id: 5,
    title: "Vessel Delay - MV Steel King",
    description: "Technical issues causing schedule deviation",
    severity: "low",
    impact: "₹400K potential loss",
    eta: "3 days",
    location: "En route to Paradip",
    trend: "stable",
  },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "destructive"
    case "high":
      return "default"
    case "medium":
      return "secondary"
    case "low":
      return "outline"
    default:
      return "outline"
  }
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="h-4 w-4 text-destructive" />
    case "decreasing":
      return <TrendingUp className="h-4 w-4 text-chart-2 rotate-180" />
    default:
      return <div className="w-4 h-4 bg-chart-3 rounded-full"></div>
  }
}

export function RiskPanel() {
  return (
    <div className="space-y-6">
      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Risks</p>
                <p className="text-2xl font-bold text-destructive">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risks</p>
                <p className="text-2xl font-bold text-accent">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Exposure</p>
                <p className="text-2xl font-bold text-chart-4">₹6.6M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold text-primary">5.4d</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Risk Register</CardTitle>
          <CardDescription>Current supply chain risks requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {risks.map((risk) => (
              <div key={risk.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{risk.title}</h4>
                      <Badge variant={getSeverityColor(risk.severity) as any}>{risk.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                  </div>
                  {getTrendIcon(risk.trend)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Impact:</span>
                    <span className="font-medium">{risk.impact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ETA:</span>
                    <span className="font-medium">{risk.eta}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{risk.location}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm">Create Action Plan</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
