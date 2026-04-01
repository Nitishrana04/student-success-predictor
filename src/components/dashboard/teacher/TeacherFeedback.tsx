import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const TeacherFeedback = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ student_id: "", message: "", category: "general" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [fRes, sRes] = await Promise.all([
      supabase.from("feedback").select("*, students(student_name)").eq("teacher_user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("students").select("id, student_name, roll_number"),
    ]);
    setFeedback(fRes.data || []);
    setStudents(sRes.data || []);
  };

  const handleSend = async () => {
    if (!form.student_id || !form.message.trim()) { toast.error("Select student and write message"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("feedback").insert({
      teacher_user_id: user.id, student_id: form.student_id, message: form.message, category: form.category,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Feedback sent!");
    setShowAdd(false); setForm({ student_id: "", message: "", category: "general" }); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold font-display">Feedback</h1><p className="text-muted-foreground text-sm">Send suggestions to students</p></div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="gradient-hero text-primary-foreground"><Send className="w-4 h-4 mr-2" />Send Feedback</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Send Feedback</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Student</Label>
                <Select value={form.student_id} onValueChange={v => setForm({...form, student_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.student_name} ({s.roll_number})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="behaviour">Behaviour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Message</Label><Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} /></div>
              <Button onClick={handleSend} className="w-full">Send</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {feedback.map(f => (
          <div key={f.id} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium text-sm">To: {f.students?.student_name}</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary capitalize">{f.category}</span>
                <p className="text-sm text-muted-foreground mt-2">{f.message}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{new Date(f.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        {feedback.length === 0 && <p className="text-center text-muted-foreground py-8">No feedback sent yet</p>}
      </div>
    </div>
  );
};

export default TeacherFeedback;
