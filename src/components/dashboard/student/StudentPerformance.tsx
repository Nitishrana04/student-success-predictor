import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RiskBadge from "../RiskBadge";
import { TrendingUp, Lightbulb, AlertTriangle } from "lucide-react";

const StudentPerformance = () => {
  const [prediction, setPrediction] = useState<any>(null);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [avgMarks, setAvgMarks] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: student } = await supabase.from("students").select("id").eq("user_id", user.id).maybeSingle();
      if (!student) return;

      const [predRes, attRes, marksRes] = await Promise.all([
        supabase.from("predictions").select("*").eq("student_id", student.id).order("predicted_at", { ascending: false }).limit(1),
        supabase.from("attendance").select("status").eq("student_id", student.id),
        supabase.from("marks").select("marks_obtained, total_marks").eq("student_id", student.id),
      ]);

      setPrediction(predRes.data?.[0] || null);

      const att = attRes.data || [];
      const present = att.filter(a => a.status === "present").length;
      setAttendanceRate(att.length > 0 ? Math.round((present / att.length) * 100) : 0);

      const m = marksRes.data || [];
      setAvgMarks(m.length > 0 ? Math.round(m.reduce((s, x) => s + (Number(x.marks_obtained) / Number(x.total_marks)) * 100, 0) / m.length) : 0);
    };
    load();
  }, []);

  const tips = [
    attendanceRate < 75 && "Improve your attendance to stay above 75%",
    avgMarks < 50 && "Focus more on studies — your average is below 50%",
    avgMarks >= 50 && avgMarks < 75 && "Good progress! Aim for 75%+ marks",
    attendanceRate >= 75 && avgMarks >= 75 && "Excellent! Keep up the good work 🎉",
  ].filter(Boolean);

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold font-display">Performance Insights</h1></div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Academic Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Attendance Rate</span>
              <span className={`font-bold ${attendanceRate >= 75 ? "text-success" : "text-danger"}`}>{attendanceRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${attendanceRate}%` }} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Average Marks</span>
              <span className={`font-bold ${avgMarks >= 60 ? "text-success" : avgMarks >= 40 ? "text-warning" : "text-danger"}`}>{avgMarks}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="h-2 rounded-full bg-secondary" style={{ width: `${avgMarks}%` }} />
            </div>
          </div>
        </div>

        {prediction && (
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="font-display font-semibold">Risk Status</h3>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <RiskBadge level={prediction.risk_level === "critical" ? "high" : prediction.risk_level} />
              {prediction.risk_score && <span className="text-sm text-muted-foreground">Score: {(Number(prediction.risk_score) * 100).toFixed(0)}%</span>}
            </div>
            <p className="text-sm text-muted-foreground">{prediction.recommendation || "No specific recommendation"}</p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-warning" />
          <h3 className="font-display font-semibold">Improvement Tips</h3>
        </div>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-primary mt-0.5">•</span>
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
