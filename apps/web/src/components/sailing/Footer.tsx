"use client";
import { Mail, Phone, MapPin, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer id="contact" className="bg-blue-900 text-blue-50 scroll-mt-28">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-lg font-semibold mb-4">QSTEEL x SAIL</div>
            <p className="text-blue-100/80 text-sm leading-relaxed mb-3">Powering India's steel revolution with AI-driven logistics excellence.</p>
            <p className="text-blue-100/80 text-sm font-medium"><Phone className="inline h-4 w-4 mr-2" />+91 966 105 3170</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="hover:underline">Home</a></li>
              <li><a href="#strengths" className="hover:underline">About</a></li>
              <li><a href="#how-it-works" className="hover:underline">Solutions</a></li>
              <li><a href="#portals" className="hover:underline">Portals</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3"><MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" /><span>Bokaro Steel Plant, SAIL<br />Bokaro, Jharkhand, India</span></li>
              <li className="flex items-center gap-3"><Phone className="h-5 w-5 flex-shrink-0" /><span>+91-XXXX-XXXXXX</span></li>
              <li className="flex items-center gap-3"><Mail className="h-5 w-5 flex-shrink-0" /><span>support@sail-qsteel.in</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-blue-100/10 hover:bg-blue-100/20 flex items-center justify-center transition-colors" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-blue-100/10 hover:bg-blue-100/20 flex items-center justify-center transition-colors" aria-label="YouTube"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-blue-200/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {currentYear} SAIL & QSTEEL — AI Decision Support System v1.0</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
