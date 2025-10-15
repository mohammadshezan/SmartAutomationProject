import { DashboardLayout } from "@/components/dashboard-layout"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { PredictiveAnalyticsDashboard } from "@/components/predictive-analytics-dashboard"

export default function AIAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">AI Analytics</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PredictiveAnalyticsDashboard />
          </div>
          <div>
            <AIInsightsPanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
