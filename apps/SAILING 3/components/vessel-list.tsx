"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ship, MapPin, Clock } from "lucide-react"

const vessels = [
  {
    id: "V001",
    name: "MV Steel King",
    status: "in-transit",
    destination: "Paradip Port",
    eta: "14:30",
    cargo: "Iron Ore - 75,000 MT",
    delay: 0,
    distance: "45 km",
  },
  {
    id: "V002",
    name: "MV Ocean Pioneer",
    status: "delayed",
    destination: "Vizag Port",
    eta: "18:45",
    cargo: "Coal - 68,000 MT",
    delay: 4.5,
    distance: "120 km",
  },
  {
    id: "V003",
    name: "MV Cargo Express",
    status: "on-time",
    destination: "Haldia Port",
    eta: "10:15",
    cargo: "Raw Materials - 45,000 MT",
    delay: 0,
    distance: "12 km",
  },
  {
    id: "V004",
    name: "MV Baltic Trader",
    status: "docked",
    destination: "Chennai Port",
    eta: "08:00",
    cargo: "Iron Ore - 82,000 MT",
    delay: 0,
    distance: "0 km",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "on-time":
      return "default"
    case "delayed":
      return "destructive"
    case "in-transit":
      return "secondary"
    case "docked":
      return "outline"
    default:
      return "outline"
  }
}

export function VesselList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-4 w-4" />
          Active Vessels
        </CardTitle>
        <CardDescription>Real-time vessel tracking and status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {vessels.map((vessel) => (
            <div key={vessel.id} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-primary" />
                  <span className="font-medium">{vessel.name}</span>
                </div>
                <Badge variant={getStatusColor(vessel.status) as any}>{vessel.status}</Badge>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{vessel.destination}</span>
                  <span className="ml-auto">{vessel.distance}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>ETA: {vessel.eta}</span>
                  {vessel.delay > 0 && <span className="text-destructive ml-auto">+{vessel.delay}h</span>}
                </div>

                <div className="text-xs text-muted-foreground">{vessel.cargo}</div>
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
