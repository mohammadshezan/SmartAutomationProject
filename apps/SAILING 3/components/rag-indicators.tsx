"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

const ragItems = [
  {
    category: "Operations",
    status: "green",
    title: "Port Operations",
    description: "All ports operating within normal parameters",
    metrics: "94% efficiency",
  },
  {
    category: "Operations",
    status: "green",
    title: "Rail Network",
    description: "Optimal rake utilization and scheduling",
    metrics: "87% utilization",
  },
  {
    category: "Finance",
    status: "green",
    title: "Cost Management",
    description: "Costs tracking below budget targets",
    metrics: "8% under budget",
  },
  {
    category: "Risk",
    status: "amber",
    title: "Weather Risk",
    description: "Monsoon season approaching - moderate impact expected",
    metrics: "Medium risk",
  },
  {
    category: "Risk",
    status: "amber",
    title: "Vessel Delays",
    description: "2 vessels experiencing minor delays",
    metrics: "Low impact",
  },
  {
    category: "Supply",
    status: "red",
    title: "Plant C Stock",
    description: "Critical stock levels requiring immediate attention",
    metrics: "5 days remaining",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "green":
      return <CheckCircle className="h-5 w-5 text-chart-2" />
    case "amber":
      return <AlertTriangle className="h-5 w-5 text-chart-3" />
    case "red":
      return <XCircle className="h-5 w-5 text-destructive" />
    default:
      return null
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "green":
      return <Badge className="bg-chart-2 hover:bg-chart-2">Green</Badge>
    case "amber":
      return <Badge className="bg-chart-3 hover:bg-chart-3">Amber</Badge>
    case "red":
      return <Badge variant="destructive">Red</Badge>
    default:
      return null
  }
}

export function RAGIndicators() {
  const greenCount = ragItems.filter((item) => item.status === "green").length
  const amberCount = ragItems.filter((item) => item.status === "amber").length
  const redCount = ragItems.filter((item) => item.status === "red").length

  return (
    <Card>
      <CardHeader>
        <CardTitle>RAG Status Indicators</CardTitle>
        <CardDescription>Red, Amber, Green status across all operational areas</CardDescription>
        <div className="flex gap-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
            <span className="text-sm">Green: {greenCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
            <span className="text-sm">Amber: {amberCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <span className="text-sm">Red: {redCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ragItems.map((item, index) => (
            <div key={index} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="font-semibold">{item.title}</span>
                </div>
                {getStatusBadge(item.status)}
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{item.category}</span>
                <span className="text-sm font-medium">{item.metrics}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
