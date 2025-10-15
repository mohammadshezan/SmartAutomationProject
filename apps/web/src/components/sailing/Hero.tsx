"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TypingAnimation from "@/components/sailing/TypingAnimation";
import { ArrowRight, Users, Building2 } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
      {/* Train background from public with gradient overlays */}
      <img
        src="/images/train-hero.jpg"
        alt="Rail logistics background"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
  {/* Light, white-tinted overlays to replace bluish tone */}
  <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/70 to-white/50" />
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.35),transparent_60%)]" />

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <TypingAnimation />
          <p className="text-lg md:text-2xl text-slate-700 mb-6 font-medium mt-6">
            AI/ML-based Decision Support System
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button asChild size="lg" className="font-semibold px-8 py-6 text-lg gap-3 group">
              <Link href="/customer-auth">
                <Users className="h-5 w-5" />
                Customer Portal
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-800 hover:bg-slate-900 hover:text-white font-semibold px-8 py-6 text-lg gap-3 backdrop-blur-sm">
              <Link href="/signin">
                <Building2 className="h-5 w-5" />
                Employee Portal
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Track orders & deliveries</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Plan & manage rake dispatches</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/80 to-transparent" />
    </section>
  );
}
