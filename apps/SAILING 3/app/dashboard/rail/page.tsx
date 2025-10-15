"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Train, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import { RakeCalendarView } from "@/components/rake-calendar-view"
import { RakeAllocationTable } from "@/components/rake-allocation-table"

export default function RailDashboard() {
  return (
    <DashboardLayout role="rail" title="Railway Coordination">
      <div className="space-y-6">
        {/* Rail Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Rakes</p>
                  <p className="text-2xl font-bold">45</p>
                </div>
                <Train className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <CheckCircle className="h-8 w-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold">28</p>
                </div>
                <Calendar className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rake Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Rake Calendar View</CardTitle>
            <CardDescription>Weekly rake availability and bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <RakeCalendarView />
          </CardContent>
        </Card>

        {/* Rake Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Rake Allocation Management</CardTitle>
            <CardDescription>Current and planned rake assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <RakeAllocationTable />
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>AI Reallocation Recommendations</CardTitle>
            <CardDescription>ML-suggested optimizations for rake utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Rake R-2401 → Vessel MV Steel King</p>
                  <p className="text-sm text-muted-foreground">Optimize route to Plant-A for 15% cost reduction</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Reject
                  </Button>
                  <Button size="sm">Apply</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Rake R-2405 → Delayed Assignment</p>
                  <p className="text-sm text-muted-foreground">Reassign to urgent shipment at Paradip Port</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Reject
                  </Button>
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Critical Alerts</CardTitle>
            <CardDescription>Rake availability mismatches and urgent issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Rake Shortage Alert</p>
                  <p className="text-sm text-muted-foreground">
                    3 vessels waiting at Haldia - insufficient rakes available
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-accent">Maintenance Due</p>
                  <p className="text-sm text-muted-foreground">Rake R-2398 requires scheduled maintenance in 2 days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
