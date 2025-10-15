"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, AlertCircle, Target, Zap } from "lucide-react"

export function PredictiveAnalyticsDashboard() {
  const [demandForecast, setDemandForecast] = useState<any[]>([])
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<any[]>([])
  const [optimizationOpportunities, setOptimizationOpportunities] = useState<any[]>([])

  useEffect(() => {
    // Simulate fetching predictive analytics data
    setDemandForecast([
      { week: "Week 1", demand: 125000, predicted: 128000, confidence: 92 },
      { week: "Week 2", demand: 132000, predicted: 135000, confidence: 89 },
      { week: "Week 3", demand: 118000, predicted: 122000, confidence: 87 },
      { week: "Week 4", demand: 145000, predicted: 148000, confidence: 91 },
    ])

    setMaintenanceAlerts([
      { asset: "Vessel MV-2024-A", risk: "High", days: 5, cost: 250000 },
      { asset: "Rake R-789", risk: "Medium", days: 12, cost: 75000 },
      { asset: "Conveyor C-12", risk: "Low", days: 45, cost: 25000 },
    ])

    setOptimizationOpportunities([
      { type: "Route", description: "Optimize vessel routing", savings: 180000, confidence: 94 },
      { type: "Inventory", description: "Reduce buffer stock", savings: 120000, confidence: 87 },
      { type: "Scheduling", description: "Optimize rake scheduling", savings: 95000, confidence: 91 },
    ])
  }, [])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "Medium":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "Low":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Prediction Accuracy</p>
                <p className="text-2xl font-bold text-white">94.2%</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Cost Savings</p>
                <p className="text-2xl font-bold text-white">₹3.2M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold text-white">{maintenanceAlerts.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Optimizations</p>
                <p className="text-2xl font-bold text-white">{optimizationOpportunities.length}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="demand" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="demand" className="data-[state=active]:bg-gray-700">
            Demand Forecast
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-gray-700">
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="optimization" className="data-[state=active]:bg-gray-700">
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demand">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Demand Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="demand" stroke="#3B82F6" strokeWidth={2} name="Actual" />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#F97316"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Predictive Maintenance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <AlertCircle className="h-5 w-5 text-orange-400" />
                      <div>
                        <h4 className="font-medium text-white">{alert.asset}</h4>
                        <p className="text-sm text-gray-400">Predicted failure in {alert.days} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getRiskColor(alert.risk)}>{alert.risk} Risk</Badge>
                      <span className="text-sm text-gray-300">₹{alert.cost.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Optimization Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={optimizationOpportunities}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="type" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="savings" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
