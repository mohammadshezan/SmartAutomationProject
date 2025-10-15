"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ship, Train, Navigation } from "lucide-react"

interface TrackingMapProps {
  view: string
  timeRange: string
}

// Mock data for vessels
const vessels = [
  {
    id: "V001",
    name: "MV Steel King",
    type: "Bulk Carrier",
    status: "in-transit",
    position: { lat: 20.2, lng: 85.8 },
    destination: "Paradip Port",
    eta: "2024-01-15T14:30:00Z",
    cargo: "Iron Ore - 75,000 MT",
    delay: 0,
  },
  {
    id: "V002",
    name: "MV Ocean Pioneer",
    type: "Bulk Carrier",
    status: "delayed",
    position: { lat: 18.9, lng: 84.2 },
    destination: "Vizag Port",
    eta: "2024-01-15T18:45:00Z",
    cargo: "Coal - 68,000 MT",
    delay: 4.5,
  },
  {
    id: "V003",
    name: "MV Cargo Express",
    type: "Container Ship",
    status: "on-time",
    position: { lat: 22.5, lng: 88.3 },
    destination: "Haldia Port",
    eta: "2024-01-15T10:15:00Z",
    cargo: "Raw Materials - 45,000 MT",
    delay: 0,
  },
  {
    id: "V004",
    name: "MV Baltic Trader",
    type: "Bulk Carrier",
    status: "docked",
    position: { lat: 13.1, lng: 80.3 },
    destination: "Chennai Port",
    eta: "2024-01-15T08:00:00Z",
    cargo: "Iron Ore - 82,000 MT",
    delay: 0,
  },
]

// Mock data for rakes
const rakes = [
  {
    id: "R2401",
    type: "Iron Ore Rake",
    status: "loaded",
    position: { lat: 20.3, lng: 85.9 },
    origin: "Paradip Port",
    destination: "Plant A",
    eta: "2024-01-15T16:20:00Z",
    cargo: "Iron Ore - 3,500 MT",
    delay: 0,
  },
  {
    id: "R2402",
    type: "Coal Rake",
    status: "in-transit",
    position: { lat: 19.8, lng: 85.2 },
    origin: "Vizag Port",
    destination: "Plant B",
    eta: "2024-01-15T20:30:00Z",
    cargo: "Coking Coal - 3,200 MT",
    delay: 1.2,
  },
  {
    id: "R2403",
    type: "Mixed Cargo",
    status: "delayed",
    position: { lat: 22.8, lng: 88.1 },
    origin: "Haldia Port",
    destination: "Plant C",
    eta: "2024-01-16T02:15:00Z",
    cargo: "Mixed Materials - 3,800 MT",
    delay: 3.5,
  },
]

const ports = [
  { name: "Haldia", position: { lat: 22.0, lng: 88.1 } },
  { name: "Paradip", position: { lat: 20.3, lng: 86.6 } },
  { name: "Vizag", position: { lat: 17.7, lng: 83.3 } },
  { name: "Chennai", position: { lat: 13.1, lng: 80.3 } },
]

const plants = [
  { name: "Plant A", position: { lat: 22.8, lng: 86.2 } },
  { name: "Plant B", position: { lat: 21.5, lng: 84.9 } },
  { name: "Plant C", position: { lat: 21.2, lng: 81.6 } },
  { name: "Plant D", position: { lat: 23.7, lng: 86.4 } },
]

export function LiveTrackingMap({ view, timeRange }: TrackingMapProps) {
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-time":
        return "#10b981"
      case "delayed":
        return "#ef4444"
      case "in-transit":
        return "#3b82f6"
      case "docked":
      case "loaded":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const showVessels = view === "all" || view === "vessels"
  const showRakes = view === "all" || view === "rakes"

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Map Content */}
      <svg className="w-full h-full relative z-10">
        {/* Ports */}
        {ports.map((port, index) => (
          <g key={`port-${index}`}>
            <circle
              cx={`${((port.position.lng - 75) / 15) * 100}%`}
              cy={`${((25 - port.position.lat) / 12) * 100}%`}
              r="6"
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={`${((port.position.lng - 75) / 15) * 100}%`}
              y={`${((25 - port.position.lat) / 12) * 100 - 3}%`}
              textAnchor="middle"
              className="text-xs font-medium fill-white"
            >
              {port.name}
            </text>
          </g>
        ))}

        {/* Plants */}
        {plants.map((plant, index) => (
          <g key={`plant-${index}`}>
            <rect
              x={`${((plant.position.lng - 75) / 15) * 100 - 1.5}%`}
              y={`${((25 - plant.position.lat) / 12) * 100 - 1.5}%`}
              width="3%"
              height="3%"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
              rx="1"
            />
            <text
              x={`${((plant.position.lng - 75) / 15) * 100}%`}
              y={`${((25 - plant.position.lat) / 12) * 100 - 2.5}%`}
              textAnchor="middle"
              className="text-xs font-medium fill-white"
            >
              {plant.name}
            </text>
          </g>
        ))}

        {/* Vessels */}
        {showVessels &&
          vessels.map((vessel, index) => (
            <g
              key={`vessel-${index}`}
              className="cursor-pointer"
              onClick={() => setSelectedAsset({ type: "vessel", data: vessel })}
            >
              <circle
                cx={`${((vessel.position.lng - 75) / 15) * 100}%`}
                cy={`${((25 - vessel.position.lat) / 12) * 100}%`}
                r="8"
                fill={getStatusColor(vessel.status)}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <Ship
                x={`${((vessel.position.lng - 75) / 15) * 100 - 0.8}%`}
                y={`${((25 - vessel.position.lat) / 12) * 100 - 0.8}%`}
                className="w-4 h-4 fill-white"
              />
            </g>
          ))}

        {/* Rakes */}
        {showRakes &&
          rakes.map((rake, index) => (
            <g
              key={`rake-${index}`}
              className="cursor-pointer"
              onClick={() => setSelectedAsset({ type: "rake", data: rake })}
            >
              <rect
                x={`${((rake.position.lng - 75) / 15) * 100 - 1}%`}
                y={`${((25 - rake.position.lat) / 12) * 100 - 1}%`}
                width="2%"
                height="2%"
                fill={getStatusColor(rake.status)}
                stroke="#ffffff"
                strokeWidth="2"
                rx="0.5"
              />
              <Train
                x={`${((rake.position.lng - 75) / 15) * 100 - 0.6}%`}
                y={`${((25 - rake.position.lat) / 12) * 100 - 0.6}%`}
                className="w-3 h-3 fill-white"
              />
            </g>
          ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
        <div className="text-xs font-medium text-foreground mb-2">Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-xs">Ports</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-chart-2 rounded"></div>
          <span className="text-xs">Plants</span>
        </div>
        <div className="flex items-center gap-2">
          <Ship className="w-3 h-3" />
          <span className="text-xs">Vessels</span>
        </div>
        <div className="flex items-center gap-2">
          <Train className="w-3 h-3" />
          <span className="text-xs">Rakes</span>
        </div>
      </div>

      {/* Status Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 space-y-1">
        <div className="text-xs font-medium text-foreground mb-2">Status</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
          <span className="text-xs">On Time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="text-xs">In Transit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
          <span className="text-xs">Docked/Loaded</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-destructive rounded-full"></div>
          <span className="text-xs">Delayed</span>
        </div>
      </div>

      {/* Last Update */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-2">
        <div className="text-xs text-muted-foreground">Last Update: {lastUpdate.toLocaleTimeString()}</div>
      </div>

      {/* Asset Details Popup */}
      {selectedAsset && (
        <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">
              {selectedAsset.type === "vessel" ? selectedAsset.data.name : selectedAsset.data.id}
            </h4>
            <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>
              ×
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge
                variant={
                  selectedAsset.data.status === "on-time"
                    ? "default"
                    : selectedAsset.data.status === "delayed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {selectedAsset.data.status}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {selectedAsset.type === "vessel" ? "Destination:" : "Destination:"}
              </span>
              <span className="font-medium">{selectedAsset.data.destination}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">ETA:</span>
              <span className="font-medium">{new Date(selectedAsset.data.eta).toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Cargo:</span>
              <span className="font-medium text-right">{selectedAsset.data.cargo}</span>
            </div>

            {selectedAsset.data.delay > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delay:</span>
                <span className="font-medium text-destructive">{selectedAsset.data.delay}h</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              <Navigation className="mr-1 h-3 w-3" />
              Track
            </Button>
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              Details
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
