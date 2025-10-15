"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, AlertTriangle, CheckCircle, BarChart3, Map } from "lucide-react"
import { DispatchMatrixHeatmap } from "@/components/dispatch-matrix-heatmap"
import { CostSavingsChart } from "@/components/cost-savings-chart"
import { RiskPanel } from "@/components/risk-panel"
import { AIRecommendationEngine } from "@/components/ai-recommendation-engine"
import { ScenarioSimulator } from "@/components/scenario-simulator"

export default function ManagerDashboard() {
  return (
    <DashboardLayout role="manager" title="Management Dashboard">
      <div className="space-y-6">
        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost Savings</p>
                  <p className="text-2xl font-bold text-chart-2">₹12.4M</p>
                  <p className="text-xs text-chart-2">+18% vs last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Demurrage Avoided</p>
                  <p className="text-2xl font-bold text-primary">₹3.8M</p>
                  <p className="text-xs text-primary">-24% demurrage costs</p>
                </div>
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rail Utilization</p>
                  <p className="text-2xl font-bold text-chart-3">87%</p>
                  <p className="text-xs text-chart-3">+5% efficiency gain</p>
                </div>
                <BarChart3 className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Risks</p>
                  <p className="text-2xl font-bold text-accent">7</p>
                  <p className="text-xs text-muted-foreground">2 critical, 5 medium</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dispatch">Dispatch Matrix</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Savings Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Savings Trend</CardTitle>
                  <CardDescription>Monthly optimization impact over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <CostSavingsChart />
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                  <CardDescription>Current month performance vs targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">On-Time Delivery</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-chart-2 h-2 rounded-full" style={{ width: "94%" }}></div>
                        </div>
                        <span className="text-sm font-bold">94%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Port Efficiency</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "89%" }}></div>
                        </div>
                        <span className="text-sm font-bold">89%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cost Optimization</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-chart-3 h-2 rounded-full" style={{ width: "76%" }}></div>
                        </div>
                        <span className="text-sm font-bold">76%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Mitigation</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-chart-4 h-2 rounded-full" style={{ width: "82%" }}></div>
                        </div>
                        <span className="text-sm font-bold">82%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common management tasks and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>Generate Monthly Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                    <Map className="h-6 w-6" />
                    <span>View Live Tracking</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                    <TrendingUp className="h-6 w-6" />
                    <span>Run Optimization</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dispatch" className="space-y-4">
            <DispatchMatrixHeatmap />
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            <ScenarioSimulator />
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <RiskPanel />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <AIRecommendationEngine />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
