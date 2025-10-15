"use client"

import { HelpSection } from "@/components/help-section"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Cog } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="w-full p-6 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Cog className="h-5 w-5 text-white animate-spin-slow" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">QLink Help Center</h1>
                  <p className="text-blue-200 text-sm">Support and Documentation</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">How can we help you?</h2>
              <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                Find answers to common questions, access documentation, or contact our support team for assistance with
                QLink.
              </p>
            </div>

            <HelpSection />
          </div>
        </div>
      </div>
    </main>
  )
}
