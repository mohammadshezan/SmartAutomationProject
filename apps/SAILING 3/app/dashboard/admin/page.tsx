import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminOverview } from "@/components/admin-overview"
import { UserManagement } from "@/components/user-management"
import { SystemConfiguration } from "@/components/system-configuration"
import { AuditLogs } from "@/components/audit-logs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Admin Console</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-700">
              User Management
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-gray-700">
              System Config
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-gray-700">
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="system">
            <SystemConfiguration />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
