"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Map, Ship, Truck, Factory, MapPin, Layers, Filter } from "lucide-react"

export function MapView() {
  const [selectedLayer, setSelectedLayer] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState("all")

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-blue-500" />
            Live Map View
          </CardTitle>
          <CardDescription>Real-time view of wagons, port slots, and plant capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Layers</SelectItem>
                  <SelectItem value="vessels">Vessels Only</SelectItem>
                  <SelectItem value="rakes">Rakes Only</SelectItem>
                  <SelectItem value="ports">Ports Only</SelectItem>
                  <SelectItem value="plants">Plants Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="delayed">Delayed Only</SelectItem>
                  <SelectItem value="available">Available Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-96 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 800 400">
                {/* India coastline simplified */}
                <path
                  d="M100 200 Q150 180 200 200 Q250 220 300 200 Q350 180 400 200 Q450 220 500 200 Q550 180 600 200 Q650 220 700 200"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Railway lines */}
                <path
                  d="M50 250 L750 250 M50 300 L750 300"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              </svg>
            </div>

            {/* Vessels */}
            <div className="absolute top-16 left-20">
              <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                <Ship className="h-3 w-3" />
                MV Steel Carrier
              </div>
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
            </div>

            <div className="absolute top-24 left-40">
              <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                <Ship className="h-3 w-3" />
                MV Iron Duke
              </div>
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
            </div>

            {/* Ports */}
            <div className="absolute top-32 left-60">
              <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
                <MapPin className="h-3 w-3" />
                Paradip Port
              </div>
              <div className="w-3 h-3 bg-green-600 rounded-full mt-1"></div>
            </div>

            <div className="absolute top-40 left-80">
              <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
                <MapPin className="h-3 w-3" />
                Vizag Port
              </div>
              <div className="w-3 h-3 bg-green-600 rounded-full mt-1"></div>
            </div>

            {/* Rakes */}
            <div className="absolute bottom-20 left-32">
              <div className="flex items-center gap-1 bg-orange-600 text-white px-2 py-1 rounded text-xs">
                <Truck className="h-3 w-3" />
                RAKE-001
              </div>
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-1"></div>
            </div>

            <div className="absolute bottom-16 left-52">
              <div className="flex items-center gap-1 bg-orange-600 text-white px-2 py-1 rounded text-xs">
                <Truck className="h-3 w-3" />
                RAKE-002
              </div>
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-1"></div>
            </div>

            {/* Plants */}
            <div className="absolute bottom-32 right-32">
              <div className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                <Factory className="h-3 w-3" />
                BSP Plant
              </div>
              <div className="w-3 h-3 bg-purple-600 rounded-full mt-1"></div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg">
              <div className="text-xs font-medium mb-2">Legend</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Vessels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Ports</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span>Rakes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span>Plants</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-orange-500" />
              Available Wagons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Coking Coal Wagons</span>
              <Badge variant="secondary">45 available</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Iron Ore Wagons</span>
              <Badge variant="secondary">32 available</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Limestone Wagons</span>
              <Badge variant="secondary">28 available</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-green-500" />
              Port Slots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Paradip Port</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                2 free
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Vizag Port</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                1 free
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Chennai Port</span>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                Full
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Factory className="h-4 w-4 text-purple-500" />
              Plant Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">BSP Plant</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                78% capacity
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">DSP Plant</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                92% capacity
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">RSP Plant</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                65% capacity
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
