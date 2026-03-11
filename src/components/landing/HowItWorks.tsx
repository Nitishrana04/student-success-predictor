import { motion } from "framer-motion";
import { Upload, Cpu, AlertTriangle, HeartHandshake } from "lucide-react";

const steps = [
  { icon: Upload, title: "Data Collection", desc: "Student data is collected — attendance, marks, fees, behavior." },
  { icon: Cpu, title: "AI Analysis", desc: "ML model processes data and identifies risk patterns." },
  { icon: AlertTriangle, title: "Risk Detection", desc: "Students categorized as Low, Medium, or High risk." },
  { icon: HeartHandshake, title: "Intervention", desc: "Teachers receive alerts and counseling recommendations." },
];

const HowItWorks = () => (
  <section className="py-24" id="how-it-works">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
          How It <span className="text-gradient">Works</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          From data collection to actionable insights — a simple 4-step workflow.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="text-center relative"
          >
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
            )}
            <div className="inline-flex p-4 rounded-2xl gradient-hero mb-4 relative z-10">
              <step.icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="text-xs font-bold text-primary mb-1">Step {i + 1}</div>
            <h3 className="font-display font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
