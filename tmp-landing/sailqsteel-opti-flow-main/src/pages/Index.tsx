import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CoreStrengths from "@/components/CoreStrengths";
import HowItWorks from "@/components/HowItWorks";
import ImpactMetrics from "@/components/ImpactMetrics";
import DataVisualization from "@/components/DataVisualization";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <CoreStrengths />
        <HowItWorks />
        <ImpactMetrics />
        <DataVisualization />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
