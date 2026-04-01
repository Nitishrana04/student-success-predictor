import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "../StatsCard";
import RiskBadge from "../RiskBadge";
import { Users, AlertTriangle, GraduationCap, TrendingUp, Brain, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, highRisk: 0, colleges: 0 });
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [studentsRes, predictionsRes, collegesRes] = await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("predictions").select("*, students(student_name, roll_number)").order("predicted_at", { ascending: false }).limit(10),
      supabase.from("colleges").select("id", { count: "exact", head: true }),
    ]);

    const highRiskCount = predictionsRes.data?.filter(p => p.risk_level === "high" || p.risk_level === "critical").length || 0;

    setStats({
      students: studentsRes.count || 0,
      highRisk: highRiskCount,
      colleges: collegesRes.count || 0,
    });
    setPredictions(predictionsRes.data || []);
    setLoading(false);
  };

  const riskData = [
    { name: "Low", value: predictions.filter(p => p.risk_level === "low").length, color: "hsl(152, 60%, 42%)" },
    { name: "Medium", value: predictions.filter(p => p.risk_level === "medium").length, color: "hsl(38, 92%, 55%)" },
    { name: "High", value: predictions.filter(p => p.risk_level === "high" || p.risk_level === "critical").length, color: "hsl(0, 72%, 55%)" },
  ].filter(d => d.value > 0);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-muted rounded-xl" /><div className="h-64 bg-muted rounded-xl" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">System overview & management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Users} title="Total Students" value={stats.students} />
        <StatsCard icon={AlertTriangle} title="High Risk" value={stats.highRisk} colorClass="text-danger" />
        <StatsCard icon={Building2} title="Colleges" value={stats.colleges} />
        <StatsCard icon={TrendingUp} title="Predictions" value={predictions.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {riskData.length > 0 && (
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h3 className="font-display font-semibold mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                  {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {riskData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">Recent Risk Alerts</h3>
        </div>
        <div className="space-y-3">
          {predictions.slice(0, 5).map((pred) => (
            <div key={pred.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30">
              <div>
                <p className="font-medium text-sm">{pred.students?.student_name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{pred.recommendation || "No recommendation"}</p>
              </div>
              <RiskBadge level={pred.risk_level === "critical" ? "high" : pred.risk_level} />
            </div>
          ))}
          {predictions.length === 0 && <p className="text-sm text-muted-foreground">No predictions yet</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
