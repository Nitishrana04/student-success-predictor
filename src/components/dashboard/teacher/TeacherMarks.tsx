import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const TeacherMarks = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ student_id: "", subject: "", exam_type: "midterm", marks_obtained: "", total_marks: "100" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [sRes, mRes] = await Promise.all([
      supabase.from("students").select("id, student_name, roll_number"),
      supabase.from("marks").select("*, students(student_name, roll_number)").order("exam_date", { ascending: false }).limit(50),
    ]);
    setStudents(sRes.data || []);
    setMarks(mRes.data || []);
  };

  const handleSave = async () => {
    if (!form.student_id || !form.subject || !form.marks_obtained) { toast.error("Fill all fields"); return; }
    const { error } = await supabase.from("marks").insert({
      student_id: form.student_id, subject: form.subject, exam_type: form.exam_type,
      marks_obtained: parseFloat(form.marks_obtained), total_marks: parseFloat(form.total_marks),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Marks saved!");
    setShowAdd(false);
    setForm({ student_id: "", subject: "", exam_type: "midterm", marks_obtained: "", total_marks: "100" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold font-display">Marks Upload</h1></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="gradient-hero text-primary-foreground"><Save className="w-4 h-4 mr-2" />Add Marks</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Marks</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Student</Label>
                <Select value={form.student_id} onValueChange={v => setForm({...form, student_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.student_name} ({s.roll_number})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /></div>
              <div>
                <Label>Exam Type</Label>
                <Select value={form.exam_type} onValueChange={v => setForm({...form, exam_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Marks Obtained</Label><Input type="number" value={form.marks_obtained} onChange={e => setForm({...form, marks_obtained: e.target.value})} /></div>
                <div><Label>Total Marks</Label><Input type="number" value={form.total_marks} onChange={e => setForm({...form, total_marks: e.target.value})} /></div>
              </div>
              <Button onClick={handleSave} className="w-full">Save Marks</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3 font-medium">Student</th>
            <th className="text-left p-3 font-medium">Subject</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-left p-3 font-medium">Marks</th>
            <th className="text-left p-3 font-medium">Date</th>
          </tr></thead>
          <tbody>
            {marks.map(m => (
              <tr key={m.id} className="border-b border-border/30 hover:bg-muted/30">
                <td className="p-3 font-medium">{m.students?.student_name}</td>
                <td className="p-3 text-muted-foreground">{m.subject}</td>
                <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary capitalize">{m.exam_type}</span></td>
                <td className="p-3">{Number(m.marks_obtained)}/{Number(m.total_marks)}</td>
                <td className="p-3 text-muted-foreground">{m.exam_date ? new Date(m.exam_date).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {marks.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No marks uploaded yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherMarks;
