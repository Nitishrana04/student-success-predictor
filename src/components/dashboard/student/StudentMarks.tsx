import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const StudentMarks = () => {
  const [marks, setMarks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: student } = await supabase.from("students").select("id").eq("user_id", user.id).maybeSingle();
      if (!student) return;
      const { data } = await supabase.from("marks").select("*").eq("student_id", student.id).order("exam_date", { ascending: false });
      setMarks(data || []);
    };
    load();
  }, []);

  const avg = marks.length > 0
    ? Math.round(marks.reduce((s, m) => s + (Number(m.marks_obtained) / Number(m.total_marks)) * 100, 0) / marks.length)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display">My Marks</h1>
        <p className="text-muted-foreground text-sm">Average: <span className="font-bold text-primary">{avg}%</span></p>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3 font-medium">Subject</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-left p-3 font-medium">Marks</th>
            <th className="text-left p-3 font-medium">%</th>
            <th className="text-left p-3 font-medium">Date</th>
          </tr></thead>
          <tbody>
            {marks.map(m => {
              const pct = Math.round((Number(m.marks_obtained) / Number(m.total_marks)) * 100);
              return (
                <tr key={m.id} className="border-b border-border/30">
                  <td className="p-3 font-medium">{m.subject}</td>
                  <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary capitalize">{m.exam_type}</span></td>
                  <td className="p-3">{Number(m.marks_obtained)}/{Number(m.total_marks)}</td>
                  <td className="p-3">
                    <span className={pct >= 60 ? "text-success" : pct >= 40 ? "text-warning" : "text-danger"}>{pct}%</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{m.exam_date ? new Date(m.exam_date).toLocaleDateString() : "—"}</td>
                </tr>
              );
            })}
            {marks.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No marks yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentMarks;
