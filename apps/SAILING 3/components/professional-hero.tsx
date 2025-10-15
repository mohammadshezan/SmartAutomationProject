"use client"

import { useEffect, useState } from "react"
import { Ship, Factory, Train, ArrowRight, TrendingUp, Cpu, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ProfessionalHero() {
  const [currentText, setCurrentText] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const heroTexts = [
    "Optimizing Steel Supply Chains",
    "Connecting Ports to Plants",
    "AI-Powered Logistics",
    "Real-time Operations Control",
  ]

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % heroTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="flex-1 flex items-center justify-center p-6 py-20">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Ship className="h-10 w-10 text-blue-400 animate-pulse" />
                <Factory className="h-10 w-10 text-orange-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
                <Train className="h-10 w-10 text-green-400 animate-pulse" style={{ animationDelay: "1s" }} />
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-blue-400 to-transparent"></div>
              <span className="text-blue-200 font-medium">SAIL QLink Platform</span>
            </div>

            <h1
              className={`text-5xl lg:text-6xl font-bold text-white leading-tight transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Smart Steel
              </span>
              <br />
              <span className="text-white">Supply Chain</span>
            </h1>

            <div className="h-16 flex items-center">
              <p
                className={`text-2xl text-blue-200 font-medium transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
              >
                {heroTexts[currentText]}
              </p>
            </div>

            <p
              className={`text-lg text-blue-200 max-w-2xl leading-relaxed transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              Advanced AI-driven platform connecting ports, railways, and steel plants across India. Optimize logistics,
              reduce costs, and enhance operational efficiency with real-time insights and predictive analytics.
            </p>
          </div>

          <div
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6"
              >
                Access Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-blue-400/50 text-blue-200 hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-300 text-lg px-8 py-6 bg-transparent"
            >
              View Demo
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div
            className={`grid grid-cols-3 gap-6 pt-8 border-t border-blue-500/20 transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">99.8%</div>
              <div className="text-blue-200 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">18%</div>
              <div className="text-blue-200 text-sm">Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-blue-200 text-sm">Monitoring</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative z-10 space-y-6">
            {/* AI Processing Visualization */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400/50 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">AI Operations Center</h3>
                  <p className="text-blue-200 text-sm">Real-time processing & optimization</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Route Optimization</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-blue-900/50 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-white font-medium">94%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Predictive Analytics</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-blue-900/50 rounded-full overflow-hidden">
                      <div
                        className="w-5/6 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                    </div>
                    <span className="text-white font-medium">97%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Resource Allocation</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-blue-900/50 rounded-full overflow-hidden">
                      <div
                        className="w-4/5 h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                    </div>
                    <span className="text-white font-medium">91%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Status */}
            <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:border-green-400/50 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-green-400" />
                  <span className="text-white font-semibold">Network Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-blue-200">Active Connections</div>
                  <div className="text-white font-bold text-lg">1,247</div>
                </div>
                <div>
                  <div className="text-blue-200">Data Throughput</div>
                  <div className="text-white font-bold text-lg">2.4 GB/s</div>
                </div>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl blur-3xl"></div>
        </div>
      </div>
    </section>
  )
}
