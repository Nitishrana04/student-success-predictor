import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, ShieldCheck, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.png";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
        <div className="absolute inset-0 bg-gradient-to-l from-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Brain className="w-4 h-4" />
              AI-Powered Prediction System
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-display">
              Student Dropout{" "}
              <span className="text-gradient">Prediction</span>{" "}
              System
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Identify at-risk students early using AI-powered analytics. 
              Reduce dropout rates with data-driven insights, automated alerts, 
              and personalized recommendations.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Button
                size="lg"
                className="gradient-hero text-primary-foreground font-semibold px-8 gap-2"
                onClick={() => navigate("/login")}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-semibold px-8"
                onClick={() => navigate("/login")}
              >
                View Demo
              </Button>
            </div>

            <div className="flex gap-8">
              {[
                { icon: Brain, label: "AI Prediction", value: "95% Accuracy" },
                { icon: ShieldCheck, label: "Risk Detection", value: "Real-time" },
                { icon: BarChart3, label: "Analytics", value: "360° View" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-sm font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 gradient-hero opacity-20 blur-3xl rounded-3xl" />
              <img
                src={heroImage}
                alt="Student dropout prediction analytics dashboard"
                className="relative rounded-2xl shadow-elevated w-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
