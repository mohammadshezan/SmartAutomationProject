"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, MapPin } from "lucide-react"

const alerts = [
  {
    id: "A001",
    type: "delay",
    severity: "high",
    title: "Vessel Delay - MV Ocean Pioneer",
    description: "4.5 hour delay due to weather conditions",
    location: "En route to Vizag",
    timestamp: "10 minutes ago",
    action: "Adjust berth schedule",
  },
  {
    id: "A002",
    type: "route",
    severity: "medium",
    title: "Route Deviation - Rake R2403",
    description: "Taking alternate route due to track maintenance",
    location: "Eastern Railway",
    timestamp: "25 minutes ago",
    action: "Monitor progress",
  },
  {
    id: "A003",
    type: "congestion",
    severity: "low",
    title: "Port Congestion Alert",
    description: "Slight queue buildup at Haldia Port",
    location: "Haldia Port",
    timestamp: "1 hour ago",
    action: "Optimize berth allocation",
  },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "destructive"
    case "medium":
      return "default"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "delay":
      return <Clock className="h-4 w-4" />
    case "route":
      return <MapPin className="h-4 w-4" />
    case "congestion":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

export function TrackingAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Live Alerts
        </CardTitle>
        <CardDescription>Real-time tracking alerts and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(alert.type)}
                  <span className="font-medium text-sm">{alert.title}</span>
                </div>
                <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                  {alert.severity}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">{alert.description}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {alert.location}
                </div>
                <span>{alert.timestamp}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
                  {alert.action}
                </Button>
                <Button size="sm" variant="ghost" className="text-xs">
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            View All Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
