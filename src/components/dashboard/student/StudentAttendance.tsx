import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";

const StudentAttendance = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, rate: 0 });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: student } = await supabase.from("students").select("id").eq("user_id", user.id).maybeSingle();
      if (!student) return;
      const { data } = await supabase.from("attendance").select("*").eq("student_id", student.id).order("date", { ascending: false });
      const recs = data || [];
      setRecords(recs);
      const present = recs.filter(r => r.status === "present").length;
      const absent = recs.filter(r => r.status === "absent").length;
      setStats({ total: recs.length, present, absent, rate: recs.length > 0 ? Math.round((present / recs.length) * 100) : 0 });
    };
    load();
  }, []);

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold font-display">My Attendance</h1></div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 text-center">
          <p className="text-2xl font-bold text-success">{stats.rate}%</p>
          <p className="text-xs text-muted-foreground">Attendance Rate</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 text-center">
          <p className="text-2xl font-bold text-primary">{stats.present}</p>
          <p className="text-xs text-muted-foreground">Days Present</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 text-center">
          <p className="text-2xl font-bold text-danger">{stats.absent}</p>
          <p className="text-xs text-muted-foreground">Days Absent</p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">Status</th>
          </tr></thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id} className="border-b border-border/30">
                <td className="p-3">{new Date(r.date).toLocaleDateString()}</td>
                <td className="p-3">
                  {r.status === "present" ? (
                    <span className="flex items-center gap-1 text-success"><Check className="w-4 h-4" />Present</span>
                  ) : (
                    <span className="flex items-center gap-1 text-danger"><X className="w-4 h-4" />Absent</span>
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={2} className="p-6 text-center text-muted-foreground">No attendance records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAttendance;
