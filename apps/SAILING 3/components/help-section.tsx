"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, HelpCircle, Mail, Phone, FileText } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "How do I reset my password?",
    answer:
      "Password reset is handled through OTP verification. Simply enter your corporate email and follow the OTP process to regain access to your account.",
  },
  {
    question: "Which email domains are supported?",
    answer:
      "Currently, only @heritageit.edu.in email addresses are supported for authentication. Contact IT support if you need access with a different domain.",
  },
  {
    question: "How often is the tracking data updated?",
    answer:
      "Vessel and rake tracking data is updated in real-time every 30 seconds. Port and plant status information is refreshed every 2 minutes.",
  },
  {
    question: "What browsers are supported?",
    answer:
      "QLink works best on modern browsers including Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Mobile browsers are also fully supported.",
  },
  {
    question: "How do I access different dashboard views?",
    answer:
      "Your dashboard view is automatically determined by your role (Planner, Port, Rail, Plant, Manager, Finance, Executive, or Admin). Contact your administrator to change roles.",
  },
]

export function HelpSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Quick Help Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardHeader className="text-center">
            <Mail className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <CardTitle className="text-white text-lg">Email Support</CardTitle>
            <CardDescription className="text-blue-200">Get help from our technical team</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              variant="outline"
              className="w-full bg-transparent border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
              onClick={() => window.open("mailto:IT-support@sail.com")}
            >
              Contact IT Support
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardHeader className="text-center">
            <FileText className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <CardTitle className="text-white text-lg">Documentation</CardTitle>
            <CardDescription className="text-blue-200">User guides and system documentation</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              variant="outline"
              className="w-full bg-transparent border-green-500/50 text-green-300 hover:bg-green-500/20"
            >
              View Docs
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardHeader className="text-center">
            <Phone className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <CardTitle className="text-white text-lg">Emergency Support</CardTitle>
            <CardDescription className="text-blue-200">24/7 support for critical issues</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              variant="outline"
              className="w-full bg-transparent border-orange-500/50 text-orange-300 hover:bg-orange-500/20"
            >
              Call Support
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <HelpCircle className="h-5 w-5 text-blue-400" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription className="text-blue-200">Quick answers to common questions about QLink</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 py-3 text-left flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-white font-medium">{faq.question}</span>
                {openFAQ === index ? (
                  <ChevronUp className="h-4 w-4 text-blue-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-blue-400" />
                )}
              </button>
              {openFAQ === index && (
                <div className="px-4 py-3 bg-white/5 border-t border-white/10">
                  <p className="text-blue-200 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
