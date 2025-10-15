"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, TrendingDown, Zap, CheckCircle, X } from "lucide-react"

interface Alert {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  description: string
  timestamp: string
  source: string
  actionRequired: boolean
}

const alerts: Alert[] = [
  {
    id: "A001",
    type: "critical",
    title: "Vessel Delay - Cargo Master",
    description: "Expected 4-hour delay due to weather conditions at Kandla Port",
    timestamp: "2024-01-15 13:45",
    source: "Port Operations",
    actionRequired: true,
  },
  {
    id: "A002",
    type: "warning",
    title: "Rail Capacity Constraint",
    description: "Limited rake availability for Rourkela route on Jan 16",
    timestamp: "2024-01-15 12:30",
    source: "Rail Coordination",
    actionRequired: true,
  },
  {
    id: "A003",
    type: "info",
    title: "Cost Optimization Opportunity",
    description: "Switch to rail transport could save ₹2.3L on DP003",
    timestamp: "2024-01-15 11:15",
    source: "AI Optimizer",
    actionRequired: false,
  },
  {
    id: "A004",
    type: "warning",
    title: "Plant Inventory Low",
    description: "Bhilai Steel Plant coal inventory below safety threshold",
    timestamp: "2024-01-15 10:00",
    source: "Plant Monitoring",
    actionRequired: true,
  },
  {
    id: "A005",
    type: "info",
    title: "Weather Update",
    description: "Favorable conditions expected for next 48 hours",
    timestamp: "2024-01-15 09:30",
    source: "Weather Service",
    actionRequired: false,
  },
]

const getAlertIcon = (type: string) => {
  switch (type) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case "warning":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "info":
      return <Zap className="h-4 w-4 text-blue-500" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

const getAlertVariant = (type: string) => {
  switch (type) {
    case "critical":
      return "destructive"
    case "warning":
      return "default"
    case "info":
      return "secondary"
    default:
      return "outline"
  }
}

export function AlertsPanel() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts & Notifications
            </CardTitle>
            <CardDescription>Real-time alerts and actionable insights</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Alert Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-2xl font-bold text-red-600">1</p>
              <p className="text-sm text-red-600">Critical</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-2xl font-bold text-yellow-600">2</p>
              <p className="text-sm text-yellow-600">Warnings</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-2xl font-bold text-blue-600">2</p>
              <p className="text-sm text-blue-600">Info</p>
            </div>
          </div>

          {/* Alert List */}
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant={getAlertVariant(alert.type)}>
                          {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                        </Badge>
                        {alert.actionRequired && (
                          <Badge variant="outline" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{alert.timestamp}</span>
                        <span>•</span>
                        <span>{alert.source}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.actionRequired && (
                      <Button size="sm" variant="outline">
                        Take Action
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4 mt-6">
            <h4 className="font-semibold mb-3">Quick Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start bg-transparent">
                <TrendingDown className="h-4 w-4 mr-2" />
                Optimize Routes
              </Button>
              <Button variant="outline" className="justify-start bg-transparent">
                <Clock className="h-4 w-4 mr-2" />
                Reschedule Dispatch
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
