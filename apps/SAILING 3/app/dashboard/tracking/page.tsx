"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Map, Ship, Train, AlertTriangle, Clock, MapPin } from "lucide-react"
import { LiveTrackingMap } from "@/components/live-tracking-map"
import { VesselList } from "@/components/vessel-list"
import { RakeList } from "@/components/rake-list"
import { TrackingAlerts } from "@/components/tracking-alerts"

export default function TrackingDashboard() {
  const [selectedView, setSelectedView] = useState("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState("live")

  return (
    <DashboardLayout role="tracking" title="Live Tracking Dashboard">
      <div className="space-y-6">
        {/* Tracking Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Vessels</p>
                  <p className="text-2xl font-bold text-primary">24</p>
                  <p className="text-xs text-chart-2">18 on-time, 4 delayed</p>
                </div>
                <Ship className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Rakes</p>
                  <p className="text-2xl font-bold text-chart-2">45</p>
                  <p className="text-xs text-chart-3">38 in-transit, 7 loading</p>
                </div>
                <Train className="h-8 w-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                  <p className="text-2xl font-bold text-accent">3</p>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Delay</p>
                  <p className="text-2xl font-bold text-chart-4">2.4h</p>
                  <p className="text-xs text-chart-2">-15% vs last week</p>
                </div>
                <Clock className="h-8 w-8 text-chart-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Live Tracking Controls
            </CardTitle>
            <CardDescription>Configure map view and tracking filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">View:</label>
                <Select value={selectedView} onValueChange={setSelectedView}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assets</SelectItem>
                    <SelectItem value="vessels">Vessels Only</SelectItem>
                    <SelectItem value="rakes">Rakes Only</SelectItem>
                    <SelectItem value="routes">Routes Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Time Range:</label>
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <MapPin className="mr-2 h-4 w-4" />
                  Center Map
                </Button>
                <Button variant="outline" size="sm">
                  Auto Refresh: ON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tracking Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Tracking Map</CardTitle>
                <CardDescription>Real-time positions of vessels and rakes</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LiveTrackingMap view={selectedView} timeRange={selectedTimeRange} />
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <TrackingAlerts />

            <Tabs defaultValue="vessels" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vessels">Vessels</TabsTrigger>
                <TabsTrigger value="rakes">Rakes</TabsTrigger>
              </TabsList>

              <TabsContent value="vessels">
                <VesselList />
              </TabsContent>

              <TabsContent value="rakes">
                <RakeList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
