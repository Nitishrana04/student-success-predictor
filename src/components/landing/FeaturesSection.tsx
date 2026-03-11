import { motion } from "framer-motion";
import {
  Brain,
  Users,
  BarChart3,
  Bell,
  FileText,
  Lightbulb,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Dropout Prediction",
    description:
      "Machine Learning model predicts dropout risk based on attendance, marks, fees, and behavior patterns.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Student Management",
    description:
      "Complete student profiles with academic records, attendance, fee status, and family background.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time charts and graphs for attendance trends, performance analysis, and department-wise insights.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Bell,
    title: "Risk Alert System",
    description:
      "Automated alerts for teachers and admins when students enter high-risk dropout category.",
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    icon: FileText,
    title: "Reports & Export",
    description:
      "Generate prediction reports, attendance reports, and performance analysis. Export to PDF and Excel.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description:
      "AI-powered counseling suggestions based on student risk factors and academic performance.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/30" id="features">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Powerful <span className="text-gradient">Features</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to identify, predict, and prevent student dropouts with data-driven intelligence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow duration-300 border border-border/50"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.bg} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold font-display mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
