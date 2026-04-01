import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "../StatsCard";
import RiskBadge from "../RiskBadge";
import { ClipboardCheck, Award, TrendingUp, Lightbulb } from "lucide-react";

const StudentDashboard = () => {
  const [student, setStudent] = useState<any>(null);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [avgMarks, setAvgMarks] = useState(0);
  const [prediction, setPrediction] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Find student record by user_id
    const { data: studentData } = await supabase.from("students").select("*").eq("user_id", user.id).maybeSingle();
    if (!studentData) return;
    setStudent(studentData);

    const [attRes, marksRes, predRes, fbRes] = await Promise.all([
      supabase.from("attendance").select("status").eq("student_id", studentData.id),
      supabase.from("marks").select("marks_obtained, total_marks").eq("student_id", studentData.id),
      supabase.from("predictions").select("*").eq("student_id", studentData.id).order("predicted_at", { ascending: false }).limit(1),
      supabase.from("feedback").select("*, profiles!feedback_teacher_user_id_fkey(full_name)").eq("student_id", studentData.id).order("created_at", { ascending: false }).limit(3),
    ]);

    const totalAtt = attRes.data?.length || 0;
    const presentAtt = attRes.data?.filter(a => a.status === "present").length || 0;
    setAttendanceRate(totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0);

    const marksArr = marksRes.data || [];
    const avg = marksArr.length > 0 ? marksArr.reduce((sum, m) => sum + (Number(m.marks_obtained) / Number(m.total_marks)) * 100, 0) / marksArr.length : 0;
    setAvgMarks(Math.round(avg));

    setPrediction(predRes.data?.[0] || null);
    setFeedbacks(fbRes.data || []);
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium">No student profile linked</p>
          <p className="text-sm text-muted-foreground mt-1">Contact your admin to link your account</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">Welcome, {student.student_name}</h1>
        <p className="text-muted-foreground text-sm">Class {student.class}-{student.section} | Roll: {student.roll_number}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={ClipboardCheck} title="Attendance" value={`${attendanceRate}%`} />
        <StatsCard icon={Award} title="Avg Marks" value={`${avgMarks}%`} />
        <StatsCard icon={TrendingUp} title="Risk Status" value={prediction?.risk_level?.toUpperCase() || "N/A"} colorClass={prediction?.risk_level === "high" ? "text-danger" : prediction?.risk_level === "medium" ? "text-warning" : "text-success"} />
        <StatsCard icon={Lightbulb} title="Feedbacks" value={feedbacks.length} />
      </div>

      {prediction && (
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50 mb-6">
          <h3 className="font-display font-semibold mb-3">Your Risk Assessment</h3>
          <div className="flex items-center gap-4">
            <RiskBadge level={prediction.risk_level === "critical" ? "high" : prediction.risk_level} />
            <p className="text-sm text-muted-foreground">{prediction.recommendation || "Keep up the good work!"}</p>
          </div>
        </div>
      )}

      {feedbacks.length > 0 && (
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h3 className="font-display font-semibold mb-3">Recent Suggestions from Teachers</h3>
          <div className="space-y-3">
            {feedbacks.map(f => (
              <div key={f.id} className="p-3 rounded-lg bg-muted/50 border border-border/30">
                <p className="text-sm">{f.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(f.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
