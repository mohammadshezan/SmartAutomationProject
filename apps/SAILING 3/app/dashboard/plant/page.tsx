"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Factory, TrendingDown, AlertTriangle, Clock } from "lucide-react"
import { StockForecastChart } from "@/components/stock-forecast-chart"
import { PlantStockTable } from "@/components/plant-stock-table"
import { ArrivalTimelineChart } from "@/components/arrival-timeline-chart"

export default function PlantDashboard() {
  return (
    <DashboardLayout role="plant" title="Plant Raw Material Management">
      <div className="space-y-6">
        {/* Plant Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Plant Selection</CardTitle>
            <CardDescription>Select steel plant for raw material monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <Select defaultValue="plant-a">
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plant-a">Steel Plant A - Jamshedpur</SelectItem>
                <SelectItem value="plant-b">Steel Plant B - Rourkela</SelectItem>
                <SelectItem value="plant-c">Steel Plant C - Bhilai</SelectItem>
                <SelectItem value="plant-d">Steel Plant D - Bokaro</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Plant Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="text-2xl font-bold">85,420T</p>
                </div>
                <Factory className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Consumption</p>
                  <p className="text-2xl font-bold">2,840T</p>
                </div>
                <TrendingDown className="h-8 w-8 text-chart-4" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-2xl font-bold">30</p>
                </div>
                <Clock className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="text-2xl font-bold">Low</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>30-Day Stock Forecast</CardTitle>
            <CardDescription>AI-powered prediction of raw material levels</CardDescription>
          </CardHeader>
          <CardContent>
            <StockForecastChart />
          </CardContent>
        </Card>

        {/* Grade-wise Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Grade-wise Stock Levels</CardTitle>
            <CardDescription>Current inventory by material grade</CardDescription>
          </CardHeader>
          <CardContent>
            <PlantStockTable />
          </CardContent>
        </Card>

        {/* Arrival Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Expected Shipment Arrivals</CardTitle>
            <CardDescription>Scheduled raw material deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <ArrivalTimelineChart />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts & Notifications</CardTitle>
            <CardDescription>Critical inventory warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-chart-2/10 border border-chart-2/20 rounded-lg">
                <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                <div>
                  <p className="font-medium">Iron Ore Grade A</p>
                  <p className="text-sm text-muted-foreground">Stock level healthy - 45 days remaining</p>
                </div>
                <Badge variant="secondary">Normal</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 bg-chart-3/10 border border-chart-3/20 rounded-lg">
                <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                <div>
                  <p className="font-medium">Coking Coal</p>
                  <p className="text-sm text-muted-foreground">Approaching minimum threshold - 12 days remaining</p>
                </div>
                <Badge variant="outline">Warning</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <div>
                  <p className="font-medium">Limestone</p>
                  <p className="text-sm text-muted-foreground">Critical low stock - 5 days remaining</p>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
