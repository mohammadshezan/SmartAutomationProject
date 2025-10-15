"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  Ship,
  Anchor,
  Train,
  Factory,
  BarChart3,
  DollarSign,
  Crown,
  Settings,
  Bell,
  User,
  LogOut,
  Map,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: string
  title: string
}

const roleConfig = {
  planner: { icon: Ship, color: "bg-primary", label: "Planner" },
  port: { icon: Anchor, color: "bg-chart-1", label: "Port Operations" },
  rail: { icon: Train, color: "bg-chart-2", label: "Railway Coordination" },
  plant: { icon: Factory, color: "bg-chart-3", label: "Plant Management" },
  manager: { icon: BarChart3, color: "bg-chart-4", label: "Manager" },
  finance: { icon: DollarSign, color: "bg-chart-5", label: "Finance" },
  executive: { icon: Crown, color: "bg-accent", label: "Executive" },
  admin: { icon: Settings, color: "bg-muted", label: "Admin" },
}

export function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const config = roleConfig[role as keyof typeof roleConfig]
  const Icon = config?.icon || Ship

  const navigationItems = [
    { href: "/dashboard/planner", label: "Planner", icon: Ship, roles: ["planner", "manager", "executive"] },
    {
      href: "/dashboard/port",
      label: "Port Operations",
      icon: Anchor,
      roles: ["port", "planner", "manager", "executive"],
    },
    { href: "/dashboard/rail", label: "Railway", icon: Train, roles: ["rail", "planner", "manager", "executive"] },
    { href: "/dashboard/plant", label: "Plant", icon: Factory, roles: ["plant", "planner", "manager", "executive"] },
    { href: "/dashboard/manager", label: "Management", icon: BarChart3, roles: ["manager", "executive"] },
    { href: "/dashboard/finance", label: "Finance", icon: DollarSign, roles: ["finance", "executive"] },
    { href: "/dashboard/executive", label: "Executive", icon: Crown, roles: ["executive"] },
    { href: "/dashboard/admin", label: "Admin", icon: Settings, roles: ["admin"] },
  ]

  const allowedItems = navigationItems.filter((item) => item.roles.includes(role) || role === "admin")

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? "w-full" : "w-64"} bg-sidebar border-r border-sidebar-border flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config?.color || "bg-primary"}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">SteelRoute AI</h1>
            <p className="text-sm text-sidebar-foreground/70">{config?.label}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {allowedItems.map((item) => {
          const ItemIcon = item.icon
          const isActive = window.location.pathname === item.href

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <ItemIcon className="h-5 w-5" />
              <span>{item.label}</span>
            </a>
          )
        })}

        <div className="pt-4 border-t border-sidebar-border">
          <a
            href="/dashboard/tracking"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Map className="h-5 w-5" />
            <span>Live Tracking</span>
          </a>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-sidebar-foreground">John Doe</p>
            <p className="text-xs text-sidebar-foreground/70">john.doe@company.com</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar mobile />
                </SheetContent>
              </Sheet>

              <div>
                <h1 className="text-xl font-bold text-foreground">{title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{config?.label}</Badge>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
