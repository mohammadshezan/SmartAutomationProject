"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
  department: string
}

export function UserManagement() {
  const [users] = useState<User[]>([
    {
      id: "1",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@steelroute.com",
      role: "planner",
      status: "active",
      lastLogin: "2024-01-15 09:30",
      department: "Operations",
    },
    {
      id: "2",
      name: "Priya Sharma",
      email: "priya.sharma@steelroute.com",
      role: "port",
      status: "active",
      lastLogin: "2024-01-15 08:45",
      department: "Port Operations",
    },
    {
      id: "3",
      name: "Amit Singh",
      email: "amit.singh@steelroute.com",
      role: "manager",
      status: "active",
      lastLogin: "2024-01-14 17:20",
      department: "Management",
    },
    {
      id: "4",
      name: "Sunita Patel",
      email: "sunita.patel@steelroute.com",
      role: "finance",
      status: "inactive",
      lastLogin: "2024-01-10 14:15",
      department: "Finance",
    },
    {
      id: "5",
      name: "Vikram Gupta",
      email: "vikram.gupta@steelroute.com",
      role: "executive",
      status: "active",
      lastLogin: "2024-01-15 10:00",
      department: "Executive",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    const colors = {
      planner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      port: "bg-green-500/10 text-green-400 border-green-500/20",
      rail: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      plant: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      manager: "bg-red-500/10 text-red-400 border-red-500/20",
      finance: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      executive: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      admin: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    }
    return colors[role as keyof typeof colors] || colors.admin
  }

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : "bg-red-500/10 text-red-400 border-red-500/20"
  }

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-sm text-gray-400">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{users.filter((u) => u.status === "active").length}</p>
              <p className="text-sm text-gray-400">Active Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{users.filter((u) => u.status === "inactive").length}</p>
              <p className="text-sm text-gray-400">Inactive Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{new Set(users.map((u) => u.role)).size}</p>
              <p className="text-sm text-gray-400">User Roles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">User Management</CardTitle>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="planner">Planner</SelectItem>
                <SelectItem value="port">Port</SelectItem>
                <SelectItem value="rail">Rail</SelectItem>
                <SelectItem value="plant">Plant</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-lg border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-800">
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-300">Department</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Last Login</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{user.department}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                          {user.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
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
