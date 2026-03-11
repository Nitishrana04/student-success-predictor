import { Brain } from "lucide-react";

const Footer = () => (
  <footer className="bg-card border-t border-border py-12">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="gradient-hero p-2 rounded-lg">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">DropGuard AI</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 DropGuard AI — Student Dropout Prediction System. MCA Final Year Project.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
