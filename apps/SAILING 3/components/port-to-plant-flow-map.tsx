"use client"

const ports = [
  { name: "Haldia", x: 20, y: 30, volume: 45000 },
  { name: "Paradip", x: 25, y: 45, volume: 38000 },
  { name: "Vizag", x: 35, y: 65, volume: 52000 },
  { name: "Chennai", x: 30, y: 85, volume: 28000 },
]

const plants = [
  { name: "Plant A", x: 70, y: 25, demand: 42000 },
  { name: "Plant B", x: 75, y: 40, demand: 35000 },
  { name: "Plant C", x: 80, y: 55, demand: 48000 },
  { name: "Plant D", x: 85, y: 70, demand: 31000 },
  { name: "Plant E", x: 75, y: 85, demand: 25000 },
]

const flows = [
  { from: ports[0], to: plants[0], volume: 25000, color: "#3b82f6" },
  { from: ports[0], to: plants[1], volume: 20000, color: "#10b981" },
  { from: ports[1], to: plants[1], volume: 15000, color: "#f59e0b" },
  { from: ports[1], to: plants[2], volume: 23000, color: "#ef4444" },
  { from: ports[2], to: plants[2], volume: 25000, color: "#8b5cf6" },
  { from: ports[2], to: plants[3], volume: 27000, color: "#06b6d4" },
  { from: ports[3], to: plants[4], volume: 25000, color: "#f97316" },
]

export function PortToPlantFlowMap() {
  return (
    <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
      <svg className="w-full h-full">
        {/* Flow Lines */}
        {flows.map((flow, index) => (
          <g key={index}>
            <line
              x1={`${flow.from.x}%`}
              y1={`${flow.from.y}%`}
              x2={`${flow.to.x}%`}
              y2={`${flow.to.y}%`}
              stroke={flow.color}
              strokeWidth={Math.max(2, flow.volume / 5000)}
              strokeOpacity={0.7}
            />
            {/* Arrow head */}
            <polygon
              points={`${flow.to.x - 1},${flow.to.y - 1} ${flow.to.x + 1},${flow.to.y} ${flow.to.x - 1},${flow.to.y + 1}`}
              fill={flow.color}
            />
          </g>
        ))}

        {/* Ports */}
        {ports.map((port, index) => (
          <g key={`port-${index}`}>
            <circle cx={`${port.x}%`} cy={`${port.y}%`} r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
            <text x={`${port.x}%`} y={`${port.y - 3}%`} textAnchor="middle" className="text-xs font-medium fill-white">
              {port.name}
            </text>
            <text x={`${port.x}%`} y={`${port.y + 4}%`} textAnchor="middle" className="text-xs fill-white">
              {(port.volume / 1000).toFixed(0)}K
            </text>
          </g>
        ))}

        {/* Plants */}
        {plants.map((plant, index) => (
          <g key={`plant-${index}`}>
            <rect
              x={`${plant.x - 2}%`}
              y={`${plant.y - 2}%`}
              width="4%"
              height="4%"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
              rx="2"
            />
            <text
              x={`${plant.x}%`}
              y={`${plant.y - 3}%`}
              textAnchor="middle"
              className="text-xs font-medium fill-white"
            >
              {plant.name}
            </text>
            <text x={`${plant.x}%`} y={`${plant.y + 5}%`} textAnchor="middle" className="text-xs fill-white">
              {(plant.demand / 1000).toFixed(0)}K
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-xs">Ports</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-chart-2 rounded"></div>
          <span className="text-xs">Plants</span>
        </div>
        <div className="text-xs text-muted-foreground">Line thickness = Volume</div>
      </div>

      {/* Summary Stats */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3">
        <div className="text-center">
          <p className="text-lg font-bold text-primary">163K</p>
          <p className="text-xs text-muted-foreground">Total Tonnage</p>
        </div>
      </div>
    </div>
  )
}
