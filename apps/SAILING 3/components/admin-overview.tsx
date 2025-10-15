"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Server, Database, Activity, AlertTriangle, CheckCircle } from "lucide-react"

export function AdminOverview() {
  const systemStats = {
    totalUsers: 247,
    activeUsers: 189,
    systemUptime: 99.8,
    databaseSize: 2.4,
    apiCalls: 1250000,
    errorRate: 0.02,
  }

  const recentAlerts = [
    { id: 1, type: "warning", message: "High CPU usage on server-02", time: "2 minutes ago" },
    { id: 2, type: "info", message: "Database backup completed successfully", time: "1 hour ago" },
    { id: 3, type: "error", message: "Failed login attempts from IP 192.168.1.100", time: "3 hours ago" },
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-400" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-400" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "warning":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      default:
        return "bg-green-500/10 text-green-400 border-green-500/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{systemStats.totalUsers}</p>
                <p className="text-xs text-green-400">{systemStats.activeUsers} active</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">System Uptime</p>
                <p className="text-2xl font-bold text-white">{systemStats.systemUptime}%</p>
                <Progress value={systemStats.systemUptime} className="mt-2 h-2" />
              </div>
              <Server className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Database Size</p>
                <p className="text-2xl font-bold text-white">{systemStats.databaseSize} TB</p>
                <p className="text-xs text-gray-400">+12% this month</p>
              </div>
              <Database className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">API Calls</p>
                <p className="text-2xl font-bold text-white">{(systemStats.apiCalls / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-400">Error rate: {systemStats.errorRate}%</p>
              </div>
              <Activity className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <span className="text-white">{alert.message}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getAlertColor(alert.type)}>{alert.type}</Badge>
                  <span className="text-xs text-gray-400">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Server Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Web Server", "Database Server", "AI Processing", "File Storage"].map((server, index) => (
                <div key={server} className="flex items-center justify-between">
                  <span className="text-gray-300">{server}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-sm text-green-400">Online</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">CPU Usage</span>
                  <span className="text-white">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Memory Usage</span>
                  <span className="text-white">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Storage Usage</span>
                  <span className="text-white">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
