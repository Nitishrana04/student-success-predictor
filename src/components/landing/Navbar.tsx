import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="gradient-hero p-2 rounded-lg">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">DropGuard AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#tech" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Technology
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            Sign In
          </Button>
          <Button size="sm" className="gradient-hero text-primary-foreground" onClick={() => navigate("/login")}>
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
