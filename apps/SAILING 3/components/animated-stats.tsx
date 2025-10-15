"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Ship, Factory, Train, Package, TrendingUp, Users, Clock, Zap } from "lucide-react"

interface StatItem {
  icon: React.ReactNode
  value: number
  suffix: string
  label: string
  color: string
  description: string
}

export function AnimatedStats() {
  const [animated, setAnimated] = useState(false)

  const stats: StatItem[] = [
    {
      icon: <Factory className="h-7 w-7" />,
      value: 5,
      suffix: "",
      label: "Integrated Steel Plants",
      color: "text-orange-400",
      description: "Major production facilities across India",
    },
    {
      icon: <Ship className="h-7 w-7" />,
      value: 12,
      suffix: "+",
      label: "Connected Ports",
      color: "text-blue-400",
      description: "Major and minor ports for raw material import",
    },
    {
      icon: <Train className="h-7 w-7" />,
      value: 350,
      suffix: "+",
      label: "Daily Rake Operations",
      color: "text-green-400",
      description: "Automated scheduling and tracking",
    },
    {
      icon: <Package className="h-7 w-7" />,
      value: 25,
      suffix: "M+",
      label: "Tons Annual Capacity",
      color: "text-purple-400",
      description: "Raw material handling capacity",
    },
    {
      icon: <TrendingUp className="h-7 w-7" />,
      value: 18,
      suffix: "%",
      label: "Cost Optimization",
      color: "text-emerald-400",
      description: "Average logistics cost reduction",
    },
    {
      icon: <Users className="h-7 w-7" />,
      value: 2500,
      suffix: "+",
      label: "Active Users",
      color: "text-cyan-400",
      description: "Operations personnel across network",
    },
    {
      icon: <Clock className="h-7 w-7" />,
      value: 99.8,
      suffix: "%",
      label: "System Uptime",
      color: "text-yellow-400",
      description: "Enterprise-grade reliability",
    },
    {
      icon: <Zap className="h-7 w-7" />,
      value: 45,
      suffix: "ms",
      label: "Response Time",
      color: "text-pink-400",
      description: "Average API response latency",
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} animated={animated} delay={index * 150} />
      ))}
    </div>
  )
}

function StatCard({ stat, animated, delay }: { stat: StatItem; animated: boolean; delay: number }) {
  const [count, setCount] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!animated) return

    const timer = setTimeout(() => {
      const duration = 2500
      const steps = 80
      const increment = stat.value / steps
      let current = 0

      const counter = setInterval(() => {
        current += increment
        if (current >= stat.value) {
          setCount(stat.value)
          clearInterval(counter)
        } else {
          setCount(Math.floor(current * 10) / 10) // Support decimal values
        }
      }, duration / steps)

      return () => clearInterval(counter)
    }, delay)

    return () => clearTimeout(timer)
  }, [animated, delay, stat.value])

  return (
    <div
      className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/15 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`${stat.color} group-hover:scale-110 transition-transform duration-300`}>{stat.icon}</div>
        <div className="text-3xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">
          {count}
          {stat.suffix}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-white group-hover:text-blue-100 transition-colors duration-300">
          {stat.label}
        </h4>
        <p
          className={`text-blue-200 text-sm transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-70 translate-y-1"}`}
        >
          {stat.description}
        </p>
      </div>

      <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-2000 ease-out ${animated ? "w-full" : "w-0"}`}
          style={{ transitionDelay: `${delay}ms` }}
        ></div>
      </div>
    </div>
  )
}
