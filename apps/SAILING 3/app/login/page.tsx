"use client"

import { LoginForm } from "@/components/login-form"
import { Ship, Factory, Train, Cog, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="w-full p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Cog className="h-6 w-6 text-white animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">QLink</h1>
                <p className="text-blue-200 text-sm">Smartly connecting ports, rakes, and plants for SAIL</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-blue-200 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Ship className="h-8 w-8 text-blue-400" />
                <Factory className="h-8 w-8 text-orange-400" />
                <Train className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Sign In to QLink</h2>
              <p className="text-blue-200">Access your steel supply chain dashboard</p>
            </div>
            <LoginForm />
          </div>
        </div>

        <footer className="w-full p-6 border-t border-blue-500/20">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-blue-200 text-sm mb-2">Need assistance? Contact our support team</p>
            <a
              href="mailto:IT-support@sail.com"
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              IT-support@sail.com
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
