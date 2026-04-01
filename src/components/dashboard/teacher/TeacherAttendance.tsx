import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

const TeacherAttendance = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("students").select("id, student_name, roll_number, class, section")
      .order("roll_number").then(({ data }) => {
        setStudents(data || []);
        const init: Record<string, string> = {};
        (data || []).forEach(s => { init[s.id] = "present"; });
        setAttendance(init);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const records = Object.entries(attendance).map(([student_id, status]) => ({
      student_id, status, date,
    }));
    const { error } = await supabase.from("attendance").insert(records);
    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success("Attendance saved!");
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold font-display">Mark Attendance</h1><p className="text-muted-foreground text-sm">Date: {date}</p></div>
        <div className="flex gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm bg-card" />
          <Button onClick={handleSave} disabled={saving} className="gradient-hero text-primary-foreground">
            <Check className="w-4 h-4 mr-2" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3 font-medium">Roll No.</th>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Class</th>
            <th className="text-left p-3 font-medium">Status</th>
          </tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-b border-border/30">
                <td className="p-3 text-muted-foreground">{s.roll_number}</td>
                <td className="p-3 font-medium">{s.student_name}</td>
                <td className="p-3 text-muted-foreground">{s.class}-{s.section}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAttendance({...attendance, [s.id]: "present"})}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${attendance[s.id] === "present" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      <Check className="w-3 h-3 inline mr-1" />Present
                    </button>
                    <button
                      onClick={() => setAttendance({...attendance, [s.id]: "absent"})}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${attendance[s.id] === "absent" ? "bg-danger text-danger-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      <X className="w-3 h-3 inline mr-1" />Absent
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherAttendance;
