import { useEffect, useRef, useState } from "react";
import { Award, TrendingUp, Users, CheckCircle } from "lucide-react";

const metrics = [
  {
    icon: Award,
    value: 50,
    suffix: "+",
    label: "Years of Excellence",
    description: "SAIL's operational legacy",
  },
  {
    icon: TrendingUp,
    value: 20,
    suffix: "M+",
    label: "Tonnes Annually",
    description: "Steel production capacity",
  },
  {
    icon: Users,
    value: 99,
    suffix: "%",
    label: "Client Satisfaction",
    description: "Trusted by major industries",
  },
  {
    icon: CheckCircle,
    value: 95,
    suffix: "%",
    label: "On-Time Delivery",
    description: "SLA compliance rate",
  },
];

const CountUpAnimation = ({ end, duration = 2000, suffix }: { end: number; duration?: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number | null = null;
          const startValue = 0;

          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(easeOutQuart * (end - startValue) + startValue);
            
            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={countRef} className="text-5xl md:text-6xl font-bold text-primary">
      {count}{suffix}
    </span>
  );
};

const ImpactMetrics = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Impact in Numbers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Delivering measurable results across India's steel logistics network
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-8 bg-card border border-border rounded-lg hover:shadow-elegant transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <metric.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <div className="mb-2">
                <CountUpAnimation end={metric.value} suffix={metric.suffix} />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {metric.label}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactMetrics;
