"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  status: "success" | "failed" | "warning"
  ipAddress: string
  details: string
}

export function AuditLogs() {
  const [logs] = useState<AuditLog[]>([
    {
      id: "1",
      timestamp: "2024-01-15 10:30:25",
      user: "admin@steelroute.com",
      action: "User Created",
      resource: "User Management",
      status: "success",
      ipAddress: "192.168.1.100",
      details: "Created new user: rajesh.kumar@steelroute.com",
    },
    {
      id: "2",
      timestamp: "2024-01-15 10:25:12",
      user: "manager@steelroute.com",
      action: "Route Optimized",
      resource: "AI Optimization",
      status: "success",
      ipAddress: "192.168.1.105",
      details: "Applied AI route optimization for vessel MV-2024-A",
    },
    {
      id: "3",
      timestamp: "2024-01-15 10:20:45",
      user: "planner@steelroute.com",
      action: "Login Failed",
      resource: "Authentication",
      status: "failed",
      ipAddress: "192.168.1.110",
      details: "Invalid credentials provided",
    },
    {
      id: "4",
      timestamp: "2024-01-15 10:15:30",
      user: "system",
      action: "Backup Completed",
      resource: "Database",
      status: "success",
      ipAddress: "localhost",
      details: "Daily database backup completed successfully",
    },
    {
      id: "5",
      timestamp: "2024-01-15 10:10:18",
      user: "finance@steelroute.com",
      action: "Report Generated",
      resource: "Finance Dashboard",
      status: "success",
      ipAddress: "192.168.1.115",
      details: "Generated monthly cost analysis report",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    const matchesAction = actionFilter === "all" || log.action.toLowerCase().includes(actionFilter.toLowerCase())
    return matchesSearch && matchesStatus && matchesAction
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "warning":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Audit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{logs.length}</p>
              <p className="text-sm text-gray-400">Total Events</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{logs.filter((l) => l.status === "success").length}</p>
              <p className="text-sm text-gray-400">Successful</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{logs.filter((l) => l.status === "failed").length}</p>
              <p className="text-sm text-gray-400">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{logs.filter((l) => l.status === "warning").length}</p>
              <p className="text-sm text-gray-400">Warnings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Audit Logs</CardTitle>
            <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="route">Route</SelectItem>
                <SelectItem value="backup">Backup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          <div className="rounded-lg border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-800">
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Timestamp</TableHead>
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Action</TableHead>
                  <TableHead className="text-gray-300">Resource</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">IP Address</TableHead>
                  <TableHead className="text-gray-300">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell className="text-gray-300 font-mono text-sm">{log.timestamp}</TableCell>
                    <TableCell className="text-white">{log.user}</TableCell>
                    <TableCell className="text-gray-300">{log.action}</TableCell>
                    <TableCell className="text-gray-300">{log.resource}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono text-sm">{log.ipAddress}</TableCell>
                    <TableCell className="text-gray-300 max-w-xs truncate">{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
