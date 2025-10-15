"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Train, MapPin, Clock } from "lucide-react"

const rakes = [
  {
    id: "R2401",
    type: "Iron Ore Rake",
    status: "loaded",
    origin: "Paradip Port",
    destination: "Plant A",
    eta: "16:20",
    cargo: "Iron Ore - 3,500 MT",
    delay: 0,
    progress: "85%",
  },
  {
    id: "R2402",
    type: "Coal Rake",
    status: "in-transit",
    origin: "Vizag Port",
    destination: "Plant B",
    eta: "20:30",
    cargo: "Coking Coal - 3,200 MT",
    delay: 1.2,
    progress: "60%",
  },
  {
    id: "R2403",
    type: "Mixed Cargo",
    status: "delayed",
    origin: "Haldia Port",
    destination: "Plant C",
    eta: "02:15",
    cargo: "Mixed Materials - 3,800 MT",
    delay: 3.5,
    progress: "40%",
  },
  {
    id: "R2404",
    type: "Iron Ore Rake",
    status: "loading",
    origin: "Chennai Port",
    destination: "Plant D",
    eta: "12:45",
    cargo: "Iron Ore - 3,600 MT",
    delay: 0,
    progress: "15%",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "loaded":
      return "default"
    case "delayed":
      return "destructive"
    case "in-transit":
      return "secondary"
    case "loading":
      return "outline"
    default:
      return "outline"
  }
}

export function RakeList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Train className="h-4 w-4" />
          Active Rakes
        </CardTitle>
        <CardDescription>Real-time rake tracking and status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rakes.map((rake) => (
            <div key={rake.id} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Train className="h-4 w-4 text-chart-2" />
                  <span className="font-medium">{rake.id}</span>
                </div>
                <Badge variant={getStatusColor(rake.status) as any}>{rake.status}</Badge>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {rake.origin} → {rake.destination}
                  </span>
                  <span className="ml-auto">{rake.progress}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>ETA: {rake.eta}</span>
                  {rake.delay > 0 && <span className="text-destructive ml-auto">+{rake.delay}h</span>}
                </div>

                <div className="text-xs text-muted-foreground">{rake.cargo}</div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: rake.progress }}></div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Track
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
