import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "SteelRoute AI — Smart Vessel & Port Optimization",
  description: "Enterprise supply chain optimization platform for steel industry operations.",
  generator: "v0.app",
  alternates: {
    canonical: "https://steelroute-ai.example/",
  },
  openGraph: {
    siteName: "SteelRoute AI",
    title: "Smart Vessel & Port Optimization | SteelRoute AI",
    description: "Enterprise supply chain optimization platform for steel industry operations.",
    type: "website",
    url: "https://steelroute-ai.example/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Vessel & Port Optimization | SteelRoute AI",
    description: "Enterprise supply chain optimization platform for steel industry operations.",
    site: "@steelroute_ai",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased dark`}>
      <body className="font-sans bg-background text-foreground overflow-x-hidden">{children}</body>
    </html>
  )
}
