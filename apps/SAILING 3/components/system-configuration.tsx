"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Database, Shield, Bell, Upload } from "lucide-react"

export function SystemConfiguration() {
  const [settings, setSettings] = useState({
    aiPredictions: true,
    realTimeTracking: true,
    emailNotifications: true,
    smsAlerts: false,
    autoBackup: true,
    maintenanceMode: false,
  })

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="general" className="data-[state=active]:bg-gray-700">
            General
          </TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-gray-700">
            Database
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-gray-700">
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-700">
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">AI Predictions</Label>
                    <p className="text-sm text-gray-400">Enable AI-powered predictions and recommendations</p>
                  </div>
                  <Switch
                    checked={settings.aiPredictions}
                    onCheckedChange={(value) => handleSettingChange("aiPredictions", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Real-time Tracking</Label>
                    <p className="text-sm text-gray-400">Enable live vessel and rake tracking</p>
                  </div>
                  <Switch
                    checked={settings.realTimeTracking}
                    onCheckedChange={(value) => handleSettingChange("realTimeTracking", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto Backup</Label>
                    <p className="text-sm text-gray-400">Automatic daily system backups</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(value) => handleSettingChange("autoBackup", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Maintenance Mode</Label>
                    <p className="text-sm text-gray-400">Put system in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(value) => handleSettingChange("maintenanceMode", value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <Badge variant="secondary">v2.1.0</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Environment</span>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Production</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Update</span>
                  <span className="text-white">2024-01-15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">License</span>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Enterprise</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                Database Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Connection Pool Size</Label>
                  <Input defaultValue="50" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                </div>
                <div>
                  <Label className="text-white">Query Timeout (seconds)</Label>
                  <Input defaultValue="30" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Backup Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Backup Frequency</Label>
                    <Input defaultValue="Daily at 2:00 AM" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-white">Retention Period (days)</Label>
                    <Input defaultValue="30" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">Test Connection</Button>
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white">Session Timeout (minutes)</Label>
                  <Input defaultValue="60" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                </div>
                <div>
                  <Label className="text-white">Max Login Attempts</Label>
                  <Input defaultValue="5" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Password Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Minimum Length</Label>
                    <Input defaultValue="8" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-white">Password Expiry (days)</Label>
                    <Input defaultValue="90" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Require 2FA for Admin</Label>
                    <p className="text-sm text-gray-400">Enforce 2FA for admin users</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Email Notifications</Label>
                  <p className="text-sm text-gray-400">Send system alerts via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(value) => handleSettingChange("emailNotifications", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">SMS Alerts</Label>
                  <p className="text-sm text-gray-400">Send critical alerts via SMS</p>
                </div>
                <Switch
                  checked={settings.smsAlerts}
                  onCheckedChange={(value) => handleSettingChange("smsAlerts", value)}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Email Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">SMTP Server</Label>
                    <Input defaultValue="smtp.steelroute.com" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-white">Port</Label>
                    <Input defaultValue="587" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
