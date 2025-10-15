"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const ports = ["Haldia", "Paradip", "Vizag", "Chennai"]
const plants = ["Plant A", "Plant B", "Plant C", "Plant D", "Plant E"]

const dispatchData = [
  [12500, 8200, 15600, 9800],
  [9400, 11200, 7800, 12100],
  [15200, 6900, 13400, 8700],
  [7600, 14800, 9200, 11500],
  [11800, 9600, 12200, 10400],
]

const getIntensityColor = (value: number) => {
  const max = Math.max(...dispatchData.flat())
  const intensity = value / max
  if (intensity > 0.8) return "bg-chart-1"
  if (intensity > 0.6) return "bg-chart-2"
  if (intensity > 0.4) return "bg-chart-3"
  if (intensity > 0.2) return "bg-chart-4"
  return "bg-muted"
}

export function DispatchMatrixHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Port-to-Plant Dispatch Matrix</CardTitle>
        <CardDescription>Interactive tonnage distribution across ports and plants</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <span>Tonnage:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-chart-4 rounded"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-chart-1 rounded"></div>
              <span>High</span>
            </div>
          </div>

          {/* Matrix */}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                <div></div>
                {ports.map((port) => (
                  <div key={port} className="text-center text-sm font-medium p-2">
                    {port}
                  </div>
                ))}
              </div>

              {/* Matrix Body */}
              {plants.map((plant, plantIndex) => (
                <div key={plant} className="grid grid-cols-5 gap-2 mb-2">
                  <div className="text-sm font-medium p-2 flex items-center">{plant}</div>
                  {ports.map((port, portIndex) => {
                    const value = dispatchData[plantIndex][portIndex]
                    return (
                      <div
                        key={`${plant}-${port}`}
                        className={`${getIntensityColor(value)} p-3 rounded-lg text-center cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        <div className="text-sm font-bold text-white">{(value / 1000).toFixed(1)}K</div>
                        <div className="text-xs text-white/80">tons</div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">248K</p>
              <p className="text-sm text-muted-foreground">Total Tonnage</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-2">4</p>
              <p className="text-sm text-muted-foreground">Active Ports</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-3">5</p>
              <p className="text-sm text-muted-foreground">Steel Plants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">₹2.1M</p>
              <p className="text-sm text-muted-foreground">Cost Savings</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
