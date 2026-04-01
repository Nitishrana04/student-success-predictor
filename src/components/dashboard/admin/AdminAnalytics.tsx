import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminAnalytics = () => {
  const [riskByClass, setRiskByClass] = useState<any[]>([]);
  const [riskDist, setRiskDist] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: predictions } = await supabase.from("predictions").select("risk_level, students(class)");
    if (!predictions) return;

    // Risk distribution
    const dist: Record<string, number> = {};
    const byClass: Record<string, { high: number; total: number }> = {};

    predictions.forEach(p => {
      const level = p.risk_level;
      dist[level] = (dist[level] || 0) + 1;
      const cls = p.students?.class || "Unknown";
      if (!byClass[cls]) byClass[cls] = { high: 0, total: 0 };
      byClass[cls].total++;
      if (level === "high" || level === "critical") byClass[cls].high++;
    });

    setRiskDist(Object.entries(dist).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: name === "low" ? "hsl(152,60%,42%)" : name === "medium" ? "hsl(38,92%,55%)" : "hsl(0,72%,55%)",
    })));

    setRiskByClass(Object.entries(byClass).map(([cls, v]) => ({
      class: cls,
      "High Risk %": Math.round((v.high / v.total) * 100),
    })));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">Analytics</h1>
        <p className="text-muted-foreground text-sm">Dropout risk analytics</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h3 className="font-display font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                {riskDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {riskDist.map(item => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-muted-foreground">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h3 className="font-display font-semibold mb-4">High Risk % by Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskByClass}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,18%,88%)" />
              <XAxis dataKey="class" stroke="hsl(220,15%,45%)" fontSize={12} />
              <YAxis stroke="hsl(220,15%,45%)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="High Risk %" fill="hsl(0,72%,55%)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
