"use client"

import { AnimatedStats } from "@/components/animated-stats"
import { BackgroundAnimation } from "@/components/background-animation"
import { ProfessionalHero } from "@/components/professional-hero"
import { Cog, ArrowRight, Shield, Zap, BarChart3, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      <BackgroundAnimation />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="w-full p-6 backdrop-blur-sm bg-black/10 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <img
                  src="/images/sail-logo.jpg"
                  alt="Steel Authority of India Limited"
                  className="h-12 w-auto object-contain"
                />
                <div className="h-8 w-px bg-blue-400/30"></div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Cog className="h-7 w-7 text-white animate-spin-slow" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">QLink</h1>
                  <p className="text-blue-200 text-sm font-medium">Supply Chain Intelligence Platform</p>
                </div>
              </div>
            </div>

            <nav className="hidden md:flex gap-8 items-center">
              <a href="#solutions" className="text-blue-200 hover:text-white transition-colors font-medium">
                Solutions
              </a>
              <a href="#analytics" className="text-blue-200 hover:text-white transition-colors font-medium">
                Analytics
              </a>
              <a href="#support" className="text-blue-200 hover:text-white transition-colors font-medium">
                Support
              </a>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                  Access Platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <ProfessionalHero />

        <section className="w-full py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4 text-balance">Powering India's Steel Infrastructure</h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto text-pretty">
                Real-time optimization across the entire steel supply chain with AI-driven insights and predictive
                analytics
              </p>
            </div>

            <AnimatedStats />

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 hover:border-blue-400/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Enterprise Security</h3>
                </div>
                <p className="text-blue-200">
                  Bank-grade encryption and multi-factor authentication protecting critical supply chain data
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 hover:border-orange-400/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-8 w-8 text-orange-400" />
                  <h3 className="text-xl font-semibold text-white">AI Optimization</h3>
                </div>
                <p className="text-blue-200">
                  Machine learning algorithms reducing logistics costs by up to 18% through intelligent routing
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 hover:border-green-400/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-8 w-8 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Real-time Analytics</h3>
                </div>
                <p className="text-blue-200">
                  Live dashboards with predictive insights for proactive decision making across all operations
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="w-full mt-auto p-8 border-t border-blue-500/20 backdrop-blur-sm bg-black/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src="/images/sail-logo.jpg" alt="SAIL Logo" className="h-8 w-auto object-contain" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">QLink Platform</h4>
                    <p className="text-blue-300 text-xs">by Steel Authority of India Limited</p>
                  </div>
                </div>
                <p className="text-blue-200 text-sm mb-4">
                  Advanced supply chain optimization for India's largest steel producer
                </p>
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <Globe className="h-4 w-4" />
                  <span>Serving 5 integrated steel plants nationwide</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Quick Access</h4>
                <div className="space-y-2">
                  <Link href="/login" className="block text-blue-200 hover:text-white transition-colors text-sm">
                    Operations Dashboard
                  </Link>
                  <Link href="/help" className="block text-blue-200 hover:text-white transition-colors text-sm">
                    Documentation
                  </Link>
                  <a href="#support" className="block text-blue-200 hover:text-white transition-colors text-sm">
                    Technical Support
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-blue-200">24/7 Technical Support</p>
                  <a
                    href="mailto:qlink-support@sail.in"
                    className="block text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    qlink-support@sail.in
                  </a>
                  <p className="text-blue-200">Emergency Hotline: +91-1800-XXX-XXXX</p>
                </div>
              </div>
            </div>

            <div className="border-t border-blue-500/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-blue-200 text-sm">© 2025 Steel Authority of India Limited. All rights reserved.</p>
              <div className="flex gap-6 text-sm">
                <a href="#privacy" className="text-blue-200 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#terms" className="text-blue-200 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#compliance" className="text-blue-200 hover:text-white transition-colors">
                  Compliance
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
