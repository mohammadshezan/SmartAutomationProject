"use client"

import type React from "react"
import { useEffect, useState } from "react"

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

  const Icon = ({ d, className }: { d: string; className?: string }) => (
    <svg viewBox="0 0 24 24" className={className || "h-7 w-7"} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={d} />
    </svg>
  )
  const stats: StatItem[] = [
    { icon: <Icon d="M3 21V9l6 3V9l6 3V5l6 3v13H3z" />, value: 5, suffix: "", label: "Integrated Steel Plants", color: "text-orange-400", description: "Major production facilities across India" },
    { icon: <Icon d="M2 18h20M7 16l5-8 5 8" />, value: 12, suffix: "+", label: "Connected Ports", color: "text-blue-400", description: "Major and minor ports for raw material import" },
    { icon: <Icon d="M2 17h20M5 13h14M7 9h10" />, value: 350, suffix: "+", label: "Daily Rake Operations", color: "text-green-400", description: "Automated scheduling and tracking" },
    { icon: <Icon d="M4 4h16v16H4z M8 8h8v8H8z" />, value: 25, suffix: "M+", label: "Tons Annual Capacity", color: "text-purple-400", description: "Raw material handling capacity" },
    { icon: <Icon d="M4 14l6-6 4 4 6-6" />, value: 18, suffix: "%", label: "Cost Optimization", color: "text-emerald-400", description: "Average logistics cost reduction" },
    { icon: <Icon d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-7 2-7 5h14c0-3-3-5-7-5z" />, value: 2500, suffix: "+", label: "Active Users", color: "text-cyan-400", description: "Operations personnel across network" },
    { icon: <Icon d="M12 7v5l3 3" />, value: 99.8, suffix: "%", label: "System Uptime", color: "text-yellow-400", description: "Enterprise-grade reliability" },
    { icon: <Icon d="M13 2L3 14h7l-1 8 10-12h-7z" />, value: 45, suffix: "ms", label: "Response Time", color: "text-pink-400", description: "Average API response latency" },
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
          setCount(Math.floor(current * 10) / 10)
        }
      }, duration / steps)

      return () => clearInterval(counter)
    }, delay)

    return () => clearTimeout(timer)
  }, [animated, delay, stat.value])

  return (
    <div
      className="group bg-white border border-border rounded-xl p-6 hover:shadow-elegant transition-all duration-500 hover:scale-[1.02] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`${stat.color} group-hover:scale-110 transition-transform duration-300`}>{stat.icon}</div>
        <div className="text-3xl font-bold text-slate-900 transition-colors duration-300">
          {count}
          {stat.suffix}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-slate-900 transition-colors duration-300">
          {stat.label}
        </h4>
        <p
          className={`text-slate-600 text-sm transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-80 translate-y-1"}`}
        >
          {stat.description}
        </p>
      </div>

      <div className="mt-4 h-1 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-2000 ease-out ${animated ? "w-full" : "w-0"}`}
          style={{ transitionDelay: `${delay}ms` }}
        ></div>
      </div>
    </div>
  )
}
