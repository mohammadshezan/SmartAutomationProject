import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Building2 } from "lucide-react";
import trainHero from "@/assets/train-hero.jpg";
import TypingAnimation from "@/components/TypingAnimation";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={trainHero}
          alt="Railway logistics"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/95 via-primary/85 to-primary-light/75" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <TypingAnimation />
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 font-medium mt-8">
            AI/ML-based Decision Support System
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              variant="hero"
              className="font-semibold px-8 py-6 text-lg gap-3 group"
            >
              <Users className="h-5 w-5" />
              Customer Portal
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="bg-primary-foreground/10 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold px-8 py-6 text-lg gap-3 backdrop-blur-sm"
            >
              <Building2 className="h-5 w-5" />
              Employee Portal
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Subtitle hints */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-primary-foreground/70">
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

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
