import { useNavigate, useLocation } from "react-router-dom";
import {
  Brain, LayoutDashboard, Users, BarChart3, Bell, FileText,
  Settings, LogOut, GraduationCap, BookOpen, Building2,
  ClipboardCheck, Award, MessageSquare, User, TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AppRole } from "@/hooks/useAuth";

const adminMenu = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Users", path: "/dashboard/users" },
  { icon: Building2, label: "Colleges", path: "/dashboard/colleges" },
  { icon: BookOpen, label: "Courses", path: "/dashboard/courses" },
  { icon: GraduationCap, label: "Students", path: "/dashboard/students" },
  { icon: Brain, label: "Predictions", path: "/dashboard/predictions" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Bell, label: "Notifications", path: "/dashboard/notifications" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const teacherMenu = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: GraduationCap, label: "My Students", path: "/dashboard/students" },
  { icon: ClipboardCheck, label: "Attendance", path: "/dashboard/attendance" },
  { icon: Award, label: "Marks", path: "/dashboard/marks" },
  { icon: Brain, label: "Predictions", path: "/dashboard/predictions" },
  { icon: Bell, label: "Alerts", path: "/dashboard/alerts" },
  { icon: MessageSquare, label: "Feedback", path: "/dashboard/feedback" },
];

const studentMenu = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
  { icon: ClipboardCheck, label: "Attendance", path: "/dashboard/attendance" },
  { icon: Award, label: "Marks", path: "/dashboard/marks" },
  { icon: TrendingUp, label: "Performance", path: "/dashboard/performance" },
  { icon: MessageSquare, label: "Feedback", path: "/dashboard/feedback" },
];

const menuByRole: Record<AppRole, typeof adminMenu> = {
  admin: adminMenu,
  teacher: teacherMenu,
  student: studentMenu,
};

interface Props {
  role: AppRole;
  userName?: string;
}

const RoleSidebar = ({ role, userName }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = menuByRole[role] || studentMenu;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const roleLabel = role === "admin" ? "Admin" : role === "teacher" ? "Teacher" : "Student";

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
        <div className="gradient-hero p-2 rounded-lg">
          <Brain className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <span className="font-display font-bold text-sidebar-foreground text-sm">DropGuard AI</span>
          <p className="text-[10px] text-sidebar-foreground/50">{roleLabel} Panel</p>
        </div>
      </div>

      {userName && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50">Welcome,</p>
          <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1">
        {menu.map((item) => {
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

export default RoleSidebar;
