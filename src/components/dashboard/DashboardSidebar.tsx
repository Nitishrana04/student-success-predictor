import { useNavigate, useLocation } from "react-router-dom";
import {
  Brain,
  LayoutDashboard,
  Users,
  BarChart3,
  Bell,
  FileText,
  Lightbulb,
  Settings,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Students", path: "/dashboard/students" },
  { icon: Brain, label: "Predictions", path: "/dashboard/predictions" },
  { icon: Bell, label: "Alerts", path: "/dashboard/alerts" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: FileText, label: "Reports", path: "/dashboard/reports" },
  { icon: Lightbulb, label: "Recommendations", path: "/dashboard/recommendations" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
        <div className="gradient-hero p-2 rounded-lg">
          <Brain className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-sidebar-foreground">DropGuard AI</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
