import { Card } from "@/components/ui/card";
import { Database, Brain, TrendingUp, Shield } from "lucide-react";

const strengths = [
  {
    icon: Database,
    title: "Real-Time Data Integration",
    description: "Seamlessly integrates stockyard inventory, customer orders, and rake availability for comprehensive visibility.",
  },
  {
    icon: Brain,
    title: "AI/ML Optimization Engine",
    description: "Advanced algorithms analyze multiple variables to create optimal rake formations, maximizing efficiency and reducing costs.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Track key metrics, delivery SLAs, and cost optimization in real-time with actionable insights and predictive trends.",
  },
  {
    icon: Shield,
    title: "Proven Reliability",
    description: "Built on 50+ years of SAIL's operational excellence, ensuring robust and dependable logistics management.",
  },
];

const CoreStrengths = () => {
  return (
    <section id="strengths" className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Core Strengths
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Leveraging cutting-edge technology to revolutionize logistics operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {strengths.map((strength, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-card border-border animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <strength.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {strength.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {strength.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreStrengths;
