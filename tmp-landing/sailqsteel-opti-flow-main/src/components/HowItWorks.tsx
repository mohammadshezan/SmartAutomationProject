import { Database, Sparkles, Route, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Data Integration",
    description: "Collects real-time data from stockyards, customer orders, and rake availability systems.",
    number: "01",
  },
  {
    icon: Sparkles,
    title: "AI Optimization",
    description: "Machine learning algorithms analyze multiple factors to form optimal rake combinations.",
    number: "02",
  },
  {
    icon: Route,
    title: "Dispatch Planning",
    description: "Assigns wagons, determines routes, and creates efficient dispatch schedules automatically.",
    number: "03",
  },
  {
    icon: BarChart3,
    title: "Performance Tracking",
    description: "Monitors costs, delivery SLAs, and generates actionable insights for continuous improvement.",
    number: "04",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A streamlined 4-step process powered by artificial intelligence
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary-light to-primary -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Step Card */}
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-2">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -right-2 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-glow">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (Mobile) */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-primary-light" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
