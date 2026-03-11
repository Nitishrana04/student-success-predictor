import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import RiskBadge from "@/components/dashboard/RiskBadge";
import { Users, AlertTriangle, GraduationCap, TrendingUp, Brain } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const attendanceData = [
  { month: "Jan", attendance: 85 },
  { month: "Feb", attendance: 78 },
  { month: "Mar", attendance: 72 },
  { month: "Apr", attendance: 80 },
  { month: "May", attendance: 65 },
  { month: "Jun", attendance: 70 },
];

const riskData = [
  { name: "Low Risk", value: 156, color: "hsl(152, 60%, 42%)" },
  { name: "Medium Risk", value: 48, color: "hsl(38, 92%, 55%)" },
  { name: "High Risk", value: 22, color: "hsl(0, 72%, 55%)" },
];

const recentAlerts = [
  { name: "Rahul Sharma", risk: "high" as const, reason: "Attendance below 40%, 3 pending fees" },
  { name: "Priya Gupta", risk: "medium" as const, reason: "Marks declining in last 2 semesters" },
  { name: "Amit Kumar", risk: "high" as const, reason: "No attendance for 2 weeks" },
  { name: "Sneha Patel", risk: "medium" as const, reason: "Fee payment pending, low assignment submission" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.user_metadata?.full_name || "Admin"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard icon={Users} title="Total Students" value={226} trend="12 new this month" trendUp />
          <StatsCard icon={AlertTriangle} title="High Risk" value={22} trend="3 more than last month" trendUp={false} colorClass="text-danger" />
          <StatsCard icon={GraduationCap} title="Avg Attendance" value="74%" trend="2% lower" trendUp={false} />
          <StatsCard icon={TrendingUp} title="Prediction Accuracy" value="94.5%" trend="1.2% improvement" trendUp />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h3 className="font-display font-semibold mb-4">Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 88%)" />
                <XAxis dataKey="month" stroke="hsl(220, 15%, 45%)" fontSize={12} />
                <YAxis stroke="hsl(220, 15%, 45%)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="attendance" fill="hsl(210, 78%, 46%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h3 className="font-display font-semibold mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                  {riskData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {riskData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Recent Risk Alerts</h3>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30">
                <div>
                  <p className="font-medium text-sm">{alert.name}</p>
                  <p className="text-xs text-muted-foreground">{alert.reason}</p>
                </div>
                <RiskBadge level={alert.risk} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
