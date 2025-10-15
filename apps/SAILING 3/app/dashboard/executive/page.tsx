"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Map, FileText, BarChart3 } from "lucide-react"
import { ExecutiveKPICards } from "@/components/executive-kpi-cards"
import { PortToPlantFlowMap } from "@/components/port-to-plant-flow-map"
import { PredictiveInsightsPanel } from "@/components/predictive-insights-panel"
import { RAGIndicators } from "@/components/rag-indicators"

export default function ExecutiveDashboard() {
  return (
    <DashboardLayout role="executive" title="Executive Dashboard">
      <div className="space-y-6">
        {/* Executive Summary Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">SteelRoute AI Executive Overview</h2>
                <p className="text-muted-foreground">Real-time supply chain performance and strategic insights</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">System Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                    <span className="text-sm font-medium">Operational</span>
                  </div>
                </div>
                <Crown className="h-12 w-12 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executive KPI Cards */}
        <ExecutiveKPICards />

        {/* RAG Status Indicators */}
        <RAGIndicators />

        {/* Interactive Flow Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Port-to-Plant Flow Visualization
            </CardTitle>
            <CardDescription>Real-time cargo flow with volume indicators and route optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <PortToPlantFlowMap />
          </CardContent>
        </Card>

        {/* Predictive Insights */}
        <PredictiveInsightsPanel />

        {/* Quick Actions & Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Executive Actions</CardTitle>
              <CardDescription>One-click access to key executive functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start h-12" size="lg">
                  <FileText className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Generate Board Report</div>
                    <div className="text-xs text-muted-foreground">Monthly executive summary</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-12 bg-transparent" size="lg">
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Strategic Analysis</div>
                    <div className="text-xs text-muted-foreground">Deep-dive performance review</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-12 bg-transparent" size="lg">
                  <Map className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Live Operations View</div>
                    <div className="text-xs text-muted-foreground">Real-time tracking dashboard</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Strategic Metrics</CardTitle>
              <CardDescription>Key performance indicators for strategic decision making</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Supply Chain Resilience</p>
                    <p className="text-sm text-muted-foreground">Risk mitigation effectiveness</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-chart-2">94%</p>
                    <Badge variant="secondary">Excellent</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Digital Transformation ROI</p>
                    <p className="text-sm text-muted-foreground">AI optimization impact</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">340%</p>
                    <Badge variant="default">High Impact</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Sustainability Score</p>
                    <p className="text-sm text-muted-foreground">Environmental efficiency</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-chart-3">87%</p>
                    <Badge variant="outline">Good</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
