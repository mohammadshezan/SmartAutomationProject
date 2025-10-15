"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Zap, TrendingUp, Ship, Truck, Clock, DollarSign } from "lucide-react"

export function AiPlannerTool() {
  const [optimizing, setOptimizing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleOptimize = () => {
    setOptimizing(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setOptimizing(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Optimization Parameters
          </CardTitle>
          <CardDescription>Configure AI algorithms for optimal schedule generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Optimization Goal</label>
              <Select defaultValue="cost">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Minimize Cost</SelectItem>
                  <SelectItem value="time">Minimize Time</SelectItem>
                  <SelectItem value="balanced">Balanced Approach</SelectItem>
                  <SelectItem value="sustainability">Eco-Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Horizon</label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="15">15 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority Material</label>
              <Select defaultValue="coking-coal">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coking-coal">Coking Coal</SelectItem>
                  <SelectItem value="iron-ore">Iron Ore</SelectItem>
                  <SelectItem value="limestone">Limestone</SelectItem>
                  <SelectItem value="all">All Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleOptimize} disabled={optimizing} className="w-full md:w-auto">
              {optimizing ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-pulse" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Optimal Schedule
                </>
              )}
            </Button>
          </div>

          {optimizing && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Processing</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                Analyzing{" "}
                {progress < 30
                  ? "vessel schedules"
                  : progress < 60
                    ? "port capacity"
                    : progress < 90
                      ? "cargo optimization"
                      : "finalizing recommendations"}
                ...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Cost Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Potential Savings</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ₹1.2M/month
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Route Optimization</span>
                <span className="text-green-600">+15% efficiency</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Port Slot Optimization</span>
                <span className="text-green-600">-8% demurrage</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cargo Mix Optimization</span>
                <span className="text-green-600">+12% utilization</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Time Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Time Saved</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                2.5 days avg
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vessel Turnaround</span>
                <span className="text-blue-600">-18% faster</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rake Cycle Time</span>
                <span className="text-blue-600">-22% reduction</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Port Queue Time</span>
                <span className="text-blue-600">-35% waiting</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Schedule Preview */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Schedule Preview</CardTitle>
          <CardDescription>Optimized schedule based on current parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vessels" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vessels">Vessel Schedule</TabsTrigger>
              <TabsTrigger value="rakes">Rake Schedule</TabsTrigger>
              <TabsTrigger value="conflicts">Conflict Resolution</TabsTrigger>
            </TabsList>

            <TabsContent value="vessels" className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    name: "MV Steel Carrier",
                    eta: "Dec 15, 08:00",
                    berth: "Berth 3",
                    cargo: "Coking Coal",
                    status: "optimized",
                  },
                  {
                    name: "MV Iron Duke",
                    eta: "Dec 15, 14:30",
                    berth: "Berth 1",
                    cargo: "Iron Ore",
                    status: "optimized",
                  },
                  {
                    name: "MV Limestone Express",
                    eta: "Dec 16, 06:00",
                    berth: "Berth 2",
                    cargo: "Limestone",
                    status: "rescheduled",
                  },
                ].map((vessel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Ship className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium">{vessel.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {vessel.cargo} → {vessel.berth}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{vessel.eta}</p>
                      <Badge variant={vessel.status === "optimized" ? "default" : "secondary"}>{vessel.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rakes" className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    id: "RAKE-001",
                    route: "Jharia → BSP",
                    cargo: "Coking Coal",
                    departure: "Dec 14, 22:00",
                    status: "optimized",
                  },
                  {
                    id: "RAKE-002",
                    route: "Bailadila → BSP",
                    cargo: "Iron Ore",
                    departure: "Dec 15, 04:00",
                    status: "optimized",
                  },
                  {
                    id: "RAKE-003",
                    route: "Satna → BSP",
                    cargo: "Limestone",
                    departure: "Dec 15, 10:00",
                    status: "rescheduled",
                  },
                ].map((rake, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Truck className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="font-medium">{rake.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {rake.route} • {rake.cargo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{rake.departure}</p>
                      <Badge variant={rake.status === "optimized" ? "default" : "secondary"}>{rake.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="conflicts" className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Resolved
                    </Badge>
                    <span className="text-sm font-medium">Port Berth Conflict</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    MV Steel Carrier and MV Iron Duke both scheduled for Berth 1. AI rescheduled Iron Duke to Berth 3
                    with 2-hour delay, saving ₹45,000 in demurrage.
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Optimized
                    </Badge>
                    <span className="text-sm font-medium">Rake Coordination</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Synchronized RAKE-001 arrival with MV Steel Carrier departure, reducing stockyard storage time by 18
                    hours.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
