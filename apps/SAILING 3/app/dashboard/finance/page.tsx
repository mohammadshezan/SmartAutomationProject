"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, TrendingDown, Download, FileText } from "lucide-react"
import { CostBreakdownChart } from "@/components/cost-breakdown-chart"
import { MonthlyTrendChart } from "@/components/monthly-trend-chart"
import { CostComparisonTable } from "@/components/cost-comparison-table"

export default function FinanceDashboard() {
  return (
    <DashboardLayout role="finance" title="Finance Dashboard">
      <div className="space-y-6">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Logistics Cost</p>
                  <p className="text-2xl font-bold">₹45.2M</p>
                  <p className="text-xs text-chart-4 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -12% vs last month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ocean Freight</p>
                  <p className="text-2xl font-bold">₹28.4M</p>
                  <p className="text-xs text-muted-foreground">63% of total cost</p>
                </div>
                <div className="w-8 h-8 bg-chart-1 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">63%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Demurrage Costs</p>
                  <p className="text-2xl font-bold">₹2.1M</p>
                  <p className="text-xs text-chart-2 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -35% reduction
                  </p>
                </div>
                <div className="w-8 h-8 bg-chart-2 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cost Per Ton</p>
                  <p className="text-2xl font-bold">₹1,840</p>
                  <p className="text-xs text-chart-2 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -8% optimized
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Analysis Period</CardTitle>
            <CardDescription>Select time period for detailed cost analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select defaultValue="current-month">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Financial Analysis Tabs */}
        <Tabs defaultValue="breakdown" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-4">
            <CostBreakdownChart />
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <MonthlyTrendChart />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <CostComparisonTable />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate and download detailed financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Monthly Cost Analysis</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Detailed breakdown of all logistics costs by category and route
                      </p>
                      <Button size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-chart-2" />
                        <h4 className="font-semibold">Optimization Impact Report</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        AI-driven cost savings and efficiency improvements analysis
                      </p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        <Download className="mr-2 h-4 w-4" />
                        Download Excel
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-chart-3" />
                        <h4 className="font-semibold">Quarterly Financial Summary</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Executive summary of quarterly performance and trends
                      </p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold">Budget vs Actual Report</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Variance analysis comparing budgeted vs actual costs
                      </p>
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        <Download className="mr-2 h-4 w-4" />
                        Download Excel
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
