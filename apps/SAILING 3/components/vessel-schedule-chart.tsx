"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ship, Clock, MapPin, AlertTriangle } from "lucide-react"

interface Vessel {
  id: string
  name: string
  type: string
  cargo: string
  eta: string
  port: string
  status: "arriving" | "docked" | "loading" | "departing" | "delayed"
  capacity: number
  loaded: number
}

const vessels: Vessel[] = [
  {
    id: "V001",
    name: "Steel Carrier I",
    type: "Bulk Carrier",
    cargo: "Iron Ore",
    eta: "2024-01-15 14:30",
    port: "Paradip Port",
    status: "arriving",
    capacity: 75000,
    loaded: 0,
  },
  {
    id: "V002",
    name: "Ocean Pioneer",
    type: "Cargo Ship",
    cargo: "Coal",
    eta: "2024-01-15 16:45",
    port: "Visakhapatnam Port",
    status: "docked",
    capacity: 50000,
    loaded: 35000,
  },
  {
    id: "V003",
    name: "Maritime Express",
    type: "Container Ship",
    cargo: "Steel Products",
    eta: "2024-01-16 09:15",
    port: "Chennai Port",
    status: "loading",
    capacity: 60000,
    loaded: 45000,
  },
  {
    id: "V004",
    name: "Cargo Master",
    type: "Bulk Carrier",
    cargo: "Raw Materials",
    eta: "2024-01-16 11:30",
    port: "Kandla Port",
    status: "delayed",
    capacity: 80000,
    loaded: 0,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "arriving":
      return "bg-blue-500"
    case "docked":
      return "bg-green-500"
    case "loading":
      return "bg-yellow-500"
    case "departing":
      return "bg-purple-500"
    case "delayed":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "arriving":
      return "default"
    case "docked":
      return "secondary"
    case "loading":
      return "outline"
    case "departing":
      return "secondary"
    case "delayed":
      return "destructive"
    default:
      return "default"
  }
}

export function VesselScheduleChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5" />
          Vessel Schedule & Status
        </CardTitle>
        <CardDescription>Real-time vessel tracking and schedule management</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                Today
              </Button>
              <Button variant="ghost" size="sm">
                Tomorrow
              </Button>
              <Button variant="ghost" size="sm">
                This Week
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">On Time</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">Delayed</span>
              </div>
            </div>
          </div>

          {/* Vessel List */}
          <div className="space-y-3">
            {vessels.map((vessel) => (
              <div key={vessel.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(vessel.status)}`}></div>
                      <div>
                        <h4 className="font-semibold">{vessel.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {vessel.id} • {vessel.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vessel.port}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vessel.eta}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{vessel.cargo}</p>
                      <p className="text-xs text-muted-foreground">
                        {vessel.loaded.toLocaleString()} / {vessel.capacity.toLocaleString()} MT
                      </p>
                    </div>

                    <Badge variant={getStatusVariant(vessel.status)}>
                      {vessel.status === "delayed" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {vessel.status.charAt(0).toUpperCase() + vessel.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Loading Progress</span>
                    <span>{Math.round((vessel.loaded / vessel.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(vessel.loaded / vessel.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VesselScheduleChart
