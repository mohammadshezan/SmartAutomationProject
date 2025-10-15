"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [active, setActive] = useState<string>('home');

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Watch sections and set active nav link
  useEffect(() => {
    const ids = ['home','strengths','how-it-works','analytics-section','contact'];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0.1 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-background shadow-elegant" : "bg-transparent"
    }`}>
      <nav className={`mx-auto max-w-7xl px-6 ${isScrolled ? "py-2" : "py-3"} flex items-center justify-between transition-all duration-300`}>
        {/* Logos */}
        <div className="flex items-center gap-6">
          <img src="/images/sail-logo.jpg" alt="SAIL - Steel Authority of India Limited" className={`${isScrolled ? "h-10" : "h-12"} w-auto rounded transition-all duration-300`} />
          <div className="h-8 w-px bg-white/20" />
          <img src="/images/qsteel-logo-new.png" alt="QSTEEL - Service Provider" className={`${isScrolled ? "h-7" : "h-8"} w-auto rounded transition-all duration-300`} />
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo("home")} className={`text-sm font-medium transition-smooth ${active==='home' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>Home</button>
          <button onClick={() => scrollTo("strengths")} className={`text-sm font-medium transition-smooth ${active==='strengths' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>About</button>
          <button onClick={() => scrollTo("how-it-works")} className={`text-sm font-medium transition-smooth ${active==='how-it-works' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>Solutions</button>
          <button onClick={() => scrollTo("analytics-section")} className={`text-sm font-medium transition-smooth ${active==='analytics-section' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>Analytics</button>
          <button onClick={() => scrollTo("contact")} className={`text-sm font-medium transition-smooth ${active==='contact' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>Contact</button>
        </div>

        {/* Login */}
        <div className="hidden md:flex items-center">
          <Button asChild size="sm" className="gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-smooth">
            <Link href="/signin"><LogIn className="h-4 w-4" /> Login</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(v => !v)} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur border-t border-border animate-fade-in-fast">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-2">
            <button onClick={() => scrollTo("home")} className={`py-2 text-left transition-smooth ${active==='home' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>Home</button>
            <button onClick={() => scrollTo("strengths")} className={`py-2 text-left transition-smooth ${active==='strengths' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>About</button>
            <button onClick={() => scrollTo("how-it-works")} className={`py-2 text-left transition-smooth ${active==='how-it-works' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>Solutions</button>
            <button onClick={() => scrollTo("analytics-section")} className={`py-2 text-left transition-smooth ${active==='analytics-section' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>Analytics</button>
            <button onClick={() => scrollTo("contact")} className={`py-2 text-left transition-smooth ${active==='contact' ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>Contact</button>
            <Link href="/signin" className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2">
              <LogIn className="h-4 w-4" /> Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
