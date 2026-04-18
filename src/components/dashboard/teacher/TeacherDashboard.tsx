import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "../StatsCard";
import RiskBadge from "../RiskBadge";
import { Users, AlertTriangle, ClipboardCheck, Brain } from "lucide-react";

const TeacherDashboard = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [sRes, nRes] = await Promise.all([
      supabase.from("students").select("*, predictions(risk_level, risk_score, recommendation)"),
      supabase.from("notifications").select("*").eq("recipient_user_id", user.id).order("created_at", { ascending: false }).limit(5),
    ]);
    setStudents(sRes.data || []);
    const allPreds = (sRes.data || []).flatMap((s: any) => {
      const preds = Array.isArray(s.predictions) ? s.predictions : s.predictions ? [s.predictions] : [];
      return preds.map((p: any) => ({ ...p, student_name: s.student_name }));
    });
    setPredictions(allPreds);
    setNotifications(nRes.data || []);
  };

  const highRisk = predictions.filter(p => p.risk_level === "high" || p.risk_level === "critical").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">Teacher Dashboard</h1>
        <p className="text-muted-foreground text-sm">Monitor your students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard icon={Users} title="My Students" value={students.length} />
        <StatsCard icon={AlertTriangle} title="High Risk" value={highRisk} colorClass="text-danger" />
        <StatsCard icon={ClipboardCheck} title="Unread Alerts" value={notifications.filter(n => !n.is_read).length} />
      </div>

      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">At-Risk Students</h3>
        </div>
        <div className="space-y-3">
          {predictions.filter(p => p.risk_level !== "low").slice(0, 5).map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30">
              <div>
                <p className="font-medium text-sm">{p.student_name}</p>
                <p className="text-xs text-muted-foreground">{p.recommendation || "No recommendation"}</p>
              </div>
              <RiskBadge level={p.risk_level === "critical" ? "high" : p.risk_level} />
            </div>
          ))}
          {predictions.filter(p => p.risk_level !== "low").length === 0 && <p className="text-sm text-muted-foreground">No at-risk students</p>}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
