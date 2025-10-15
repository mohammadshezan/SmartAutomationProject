"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Train, Factory, Download, Filter } from "lucide-react"

interface DispatchPlan {
  id: string
  vessel: string
  cargo: string
  quantity: number
  destination: string
  mode: "rail" | "road"
  priority: "high" | "medium" | "low"
  scheduledDate: string
  status: "planned" | "in-progress" | "completed" | "delayed"
  cost: number
}

const dispatchPlans: DispatchPlan[] = [
  {
    id: "DP001",
    vessel: "Steel Carrier I",
    cargo: "Iron Ore",
    quantity: 25000,
    destination: "Rourkela Steel Plant",
    mode: "rail",
    priority: "high",
    scheduledDate: "2024-01-16",
    status: "planned",
    cost: 450000,
  },
  {
    id: "DP002",
    vessel: "Ocean Pioneer",
    cargo: "Coal",
    quantity: 15000,
    destination: "Bhilai Steel Plant",
    mode: "rail",
    priority: "medium",
    scheduledDate: "2024-01-16",
    status: "in-progress",
    cost: 320000,
  },
  {
    id: "DP003",
    vessel: "Maritime Express",
    cargo: "Steel Products",
    quantity: 8000,
    destination: "Bokaro Steel Plant",
    mode: "road",
    priority: "high",
    scheduledDate: "2024-01-17",
    status: "planned",
    cost: 180000,
  },
  {
    id: "DP004",
    vessel: "Cargo Master",
    cargo: "Raw Materials",
    quantity: 30000,
    destination: "Durgapur Steel Plant",
    mode: "rail",
    priority: "low",
    scheduledDate: "2024-01-18",
    status: "delayed",
    cost: 520000,
  },
]

const getStatusVariant = (status: string) => {
  switch (status) {
    case "planned":
      return "outline"
    case "in-progress":
      return "default"
    case "completed":
      return "secondary"
    case "delayed":
      return "destructive"
    default:
      return "outline"
  }
}

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "high":
      return "destructive"
    case "medium":
      return "default"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}

export function DispatchPlanTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Dispatch Planning
            </CardTitle>
            <CardDescription>Optimize cargo dispatch from ports to steel plants</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispatch ID</TableHead>
                <TableHead>Vessel/Cargo</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispatchPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{plan.vessel}</p>
                      <p className="text-sm text-muted-foreground">{plan.cargo}</p>
                    </div>
                  </TableCell>
                  <TableCell>{plan.quantity.toLocaleString()} MT</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{plan.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {plan.mode === "rail" ? (
                        <Train className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Truck className="h-4 w-4 text-green-500" />
                      )}
                      <span className="capitalize">{plan.mode}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(plan.priority)}>
                      {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{plan.scheduledDate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(plan.status)}>
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{plan.cost.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-4 bg-accent/50 rounded-lg">
            <p className="text-2xl font-bold">4</p>
            <p className="text-sm text-muted-foreground">Total Plans</p>
          </div>
          <div className="text-center p-4 bg-accent/50 rounded-lg">
            <p className="text-2xl font-bold">78K</p>
            <p className="text-sm text-muted-foreground">Total MT</p>
          </div>
          <div className="text-center p-4 bg-accent/50 rounded-lg">
            <p className="text-2xl font-bold">₹14.7L</p>
            <p className="text-sm text-muted-foreground">Total Cost</p>
          </div>
          <div className="text-center p-4 bg-accent/50 rounded-lg">
            <p className="text-2xl font-bold">75%</p>
            <p className="text-sm text-muted-foreground">On Schedule</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
