import { Mail, Phone, MapPin, Linkedin, Youtube } from "lucide-react";
import sailLogo from "@/assets/sail-logo.jpg";
import qsteelLogo from "@/assets/qsteel-logo-new.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img src={sailLogo} alt="SAIL Logo" className="h-14 w-auto brightness-0 invert" />
              <div className="h-10 w-px bg-primary-foreground/30" />
              <img src={qsteelLogo} alt="QSteel Logo" className="h-10 w-auto brightness-0 invert" />
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-3">
              Powering India&apos;s steel revolution with AI-driven logistics excellence.
            </p>
            <p className="text-primary-foreground/70 text-sm font-medium">
              <Phone className="inline h-4 w-4 mr-2" />
              +91 966 105 3170
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#strengths" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Solutions
                </a>
              </li>
              <li>
                <a href="#portals" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Portals
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-5 w-5 text-primary-foreground/80 flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">
                  Bokaro Steel Plant, SAIL<br />
                  Bokaro, Jharkhand, India
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-5 w-5 text-primary-foreground/80 flex-shrink-0" />
                <span className="text-primary-foreground/80">+91-XXXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 text-primary-foreground/80 flex-shrink-0" />
                <span className="text-primary-foreground/80">support@sail-qsteel.in</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/70 text-center md:text-left">
              © {currentYear} SAIL & QSteel — AI Decision Support System v1.0
            </p>
            <p className="text-sm text-primary-foreground/70">
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
