import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";
import sailLogo from "@/assets/sail-logo.jpg";
import qsteelLogo from "@/assets/qsteel-logo-new.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background shadow-elegant" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logos */}
        <div className="flex items-center gap-6">
          <img src={sailLogo} alt="SAIL - Steel Authority of India Limited" className="h-14 w-auto" />
          <div className="h-10 w-px bg-border" />
          <img src={qsteelLogo} alt="QSteel - Service Provider" className="h-10 w-auto" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("home")}
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("strengths")}
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            Solutions
          </button>
          <button
            onClick={() => scrollToSection("portals")}
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            Portals
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
          >
            Contact
          </button>
        </div>

        {/* Login Button */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in-fast">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <button
              onClick={() => scrollToSection("home")}
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth py-2"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("strengths")}
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth py-2"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth py-2"
            >
              Solutions
            </button>
            <button
              onClick={() => scrollToSection("portals")}
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth py-2"
            >
              Portals
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth py-2"
            >
              Contact
            </button>
            <Button variant="ghost" size="sm" className="gap-2 justify-start">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
