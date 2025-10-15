"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Anchor, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { PortETAChart } from "@/components/port-eta-chart"
import { BerthOccupancyChart } from "@/components/berth-occupancy-chart"
import { PortStockTable } from "@/components/port-stock-table"

export default function PortDashboard() {
  return (
    <DashboardLayout role="port" title="Port Operations">
      <div className="space-y-6">
        {/* Port Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Port Selection</CardTitle>
            <CardDescription>Select port for detailed operations view</CardDescription>
          </CardHeader>
          <CardContent>
            <Select defaultValue="haldia">
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="haldia">Haldia Port</SelectItem>
                <SelectItem value="paradip">Paradip Port</SelectItem>
                <SelectItem value="vizag">Visakhapatnam Port</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Port Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vessels in Port</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
                <Anchor className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Waiting Time</p>
                  <p className="text-2xl font-bold">4.2h</p>
                </div>
                <Clock className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Demurrage Risk</p>
                  <p className="text-2xl font-bold">Medium</p>
                </div>
                <AlertCircle className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Berth Utilization</p>
                  <p className="text-2xl font-bold">78%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ETA Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered ETA Predictions</CardTitle>
            <CardDescription>Real-time arrival forecasts for incoming vessels</CardDescription>
          </CardHeader>
          <CardContent>
            <PortETAChart />
          </CardContent>
        </Card>

        {/* Berth Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle>Berth Occupancy Timeline</CardTitle>
            <CardDescription>Current and scheduled berth usage</CardDescription>
          </CardHeader>
          <CardContent>
            <BerthOccupancyChart />
          </CardContent>
        </Card>

        {/* Port Stock Monitor */}
        <Card>
          <CardHeader>
            <CardTitle>Port Stock Monitor</CardTitle>
            <CardDescription>Material inventory and capacity tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <PortStockTable />
          </CardContent>
        </Card>

        {/* Discharge Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Sequential Discharge Rules</CardTitle>
            <CardDescription>Port-specific discharge priorities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Haldia Port Priority</span>
                <Badge variant="secondary">Always Second</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">High-Grade Materials</span>
                <Badge variant="default">First Priority</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Bulk Cargo</span>
                <Badge variant="outline">Standard Queue</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
