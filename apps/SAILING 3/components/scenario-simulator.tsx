"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Play, RotateCcw, AlertTriangle, TrendingUp } from "lucide-react"

export function ScenarioSimulator() {
  const [scenario, setScenario] = useState("")
  const [severity, setSeverity] = useState([50])
  const [duration, setDuration] = useState([7])
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>(null)

  const scenarios = [
    { value: "port_closure", label: "Port Closure", description: "Simulate temporary port shutdown" },
    { value: "vessel_delay", label: "Vessel Delay", description: "Major vessel breakdown or delay" },
    { value: "rake_shortage", label: "Rake Shortage", description: "Railway capacity constraints" },
    { value: "weather_disruption", label: "Weather Disruption", description: "Monsoon or cyclone impact" },
    { value: "plant_shutdown", label: "Plant Shutdown", description: "Temporary plant maintenance" },
  ]

  const runSimulation = () => {
    setIsRunning(true)

    // Simulate API call
    setTimeout(() => {
      setResults({
        costImpact: "₹2.4M",
        deliveryDelay: "3.2 days",
        alternativeRoutes: 4,
        riskLevel: "High",
        recommendations: [
          "Reroute 3 vessels to Paradip Port",
          "Increase rail allocation by 20%",
          "Activate emergency inventory at Plant B",
        ],
      })
      setIsRunning(false)
    }, 3000)
  }

  const resetSimulation = () => {
    setResults(null)
    setScenario("")
    setSeverity([50])
    setDuration([7])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What-If Scenario Simulator</CardTitle>
        <CardDescription>Test supply chain resilience under various disruption scenarios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Disruption Type</label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario to simulate" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div>
                        <div className="font-medium">{s.label}</div>
                        <div className="text-xs text-muted-foreground">{s.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Severity Level: {severity[0]}%</label>
              <Slider value={severity} onValueChange={setSeverity} max={100} step={10} className="w-full" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Duration: {duration[0]} days</label>
              <Slider value={duration} onValueChange={setDuration} max={30} min={1} step={1} className="w-full" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Simulation Parameters</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Scenario:</span>
                  <span className="font-medium">
                    {scenario ? scenarios.find((s) => s.value === scenario)?.label : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Impact Level:</span>
                  <Badge variant={severity[0] > 70 ? "destructive" : severity[0] > 40 ? "default" : "secondary"}>
                    {severity[0] > 70 ? "High" : severity[0] > 40 ? "Medium" : "Low"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{duration[0]} days</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={runSimulation} disabled={!scenario || isRunning} className="flex-1">
                {isRunning ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Simulation
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetSimulation}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Simulation Results
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Cost Impact</p>
                  <p className="text-xl font-bold text-destructive">{results.costImpact}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Delivery Delay</p>
                  <p className="text-xl font-bold text-accent">{results.deliveryDelay}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Alternative Routes</p>
                  <p className="text-xl font-bold text-primary">{results.alternativeRoutes}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="text-xl font-bold text-chart-3">{results.riskLevel}</p>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-3">AI Recommendations</h5>
              <ul className="space-y-2">
                {results.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
