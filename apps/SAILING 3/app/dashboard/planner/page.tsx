"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, TrendingUp, Ship, Truck, Factory, Brain, Settings } from "lucide-react"
import { VesselScheduleChart } from "@/components/vessel-schedule-chart"
import { DispatchPlanTable } from "@/components/dispatch-plan-table"
import { AlertsPanel } from "@/components/alerts-panel"
import { ScenarioSimulator } from "@/components/scenario-simulator"
import { AiPlannerTool } from "@/components/ai-planner-tool"
import { MapView } from "@/components/map-view"
import { CalendarView } from "@/components/calendar-view"

export default function PlannerDashboard() {
  return (
    <DashboardLayout role="planner" title="AI/ML Planner Dashboard">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Vessels</p>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-green-600">+12% efficiency</p>
                </div>
                <Ship className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Wagons</p>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-blue-600">87% utilization</p>
                </div>
                <Truck className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Cost Savings</p>
                  <p className="text-2xl font-bold">₹2.4M</p>
                  <p className="text-xs text-green-600">+18% vs last month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plant Capacity</p>
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-xs text-orange-600">Near optimal</p>
                </div>
                <Factory className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              AI/ML Planner Tool
            </CardTitle>
            <CardDescription>Generate optimized rake + ship schedules using advanced AI algorithms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">Drop SAP/Excel files here or click to browse</p>
                  <Button variant="outline">Select Files</Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>vessel_data_Q4.xlsx</span>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>raw_materials_Nov.csv</span>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>port_capacity_data.xlsx</span>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button className="w-full" size="lg">
                  <Brain className="mr-2 h-4 w-4" />
                  Generate AI Schedule
                </Button>
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure AI Parameters
                </Button>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Optimization Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} />
                  <p className="text-xs text-muted-foreground">
                    Analyzing vessel schedules, port capacity, and cargo mix...
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="ai-tool" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="ai-tool">AI Tool</TabsTrigger>
            <TabsTrigger value="simulator">What-if</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-tool" className="space-y-4">
            <AiPlannerTool />
          </TabsContent>

          <TabsContent value="simulator" className="space-y-4">
            <ScenarioSimulator />
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <MapView />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarView />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <VesselScheduleChart />
            <DispatchPlanTable />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <AlertsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
