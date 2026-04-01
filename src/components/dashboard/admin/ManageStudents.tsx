import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, UserPlus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RiskBadge from "../RiskBadge";

const ManageStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    student_name: "", roll_number: "", class: "10th", section: "A",
    guardian_name: "", contact_number: "", address: "", college_id: "", course_id: "",
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [sRes, cRes, coRes] = await Promise.all([
      supabase.from("students").select("*, colleges(name), courses(name), predictions(risk_level, risk_score)").order("created_at", { ascending: false }),
      supabase.from("colleges").select("id, name"),
      supabase.from("courses").select("id, name, college_id"),
    ]);
    setStudents(sRes.data || []);
    setColleges(cRes.data || []);
    setCourses(coRes.data || []);
  };

  const handleSave = async () => {
    if (!form.student_name.trim() || !form.roll_number.trim()) { toast.error("Name and roll number required"); return; }
    const payload = { ...form, college_id: form.college_id || null, course_id: form.course_id || null };
    if (editId) {
      const { error } = await supabase.from("students").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Student updated!");
    } else {
      const { error } = await supabase.from("students").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Student added!");
    }
    resetForm(); load();
  };

  const resetForm = () => {
    setShowAdd(false); setEditId(null);
    setForm({ student_name: "", roll_number: "", class: "10th", section: "A", guardian_name: "", contact_number: "", address: "", college_id: "", course_id: "" });
  };

  const handleEdit = (s: any) => {
    setForm({
      student_name: s.student_name, roll_number: s.roll_number, class: s.class, section: s.section || "A",
      guardian_name: s.guardian_name || "", contact_number: s.contact_number || "", address: s.address || "",
      college_id: s.college_id || "", course_id: s.course_id || "",
    });
    setEditId(s.id); setShowAdd(true);
  };

  const filtered = students.filter(s =>
    s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  const latestRisk = (s: any) => {
    const preds = s.predictions || [];
    if (preds.length === 0) return null;
    return preds[0].risk_level;
  };

  const filteredCourses = form.college_id ? courses.filter(c => c.college_id === form.college_id) : courses;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold font-display">Students</h1><p className="text-muted-foreground text-sm">Manage all students</p></div>
        <Dialog open={showAdd} onOpenChange={(v) => { if (!v) resetForm(); else setShowAdd(true); }}>
          <DialogTrigger asChild><Button className="gradient-hero text-primary-foreground"><UserPlus className="w-4 h-4 mr-2" />Add Student</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editId ? "Edit" : "Add"} Student</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.student_name} onChange={e => setForm({...form, student_name: e.target.value})} /></div>
              <div><Label>Roll No.</Label><Input value={form.roll_number} onChange={e => setForm({...form, roll_number: e.target.value})} /></div>
              <div><Label>Class</Label><Input value={form.class} onChange={e => setForm({...form, class: e.target.value})} /></div>
              <div><Label>Section</Label><Input value={form.section} onChange={e => setForm({...form, section: e.target.value})} /></div>
              <div><Label>Guardian</Label><Input value={form.guardian_name} onChange={e => setForm({...form, guardian_name: e.target.value})} /></div>
              <div><Label>Contact</Label><Input value={form.contact_number} onChange={e => setForm({...form, contact_number: e.target.value})} /></div>
              <div className="col-span-2">
                <Label>College</Label>
                <Select value={form.college_id} onValueChange={v => setForm({...form, college_id: v, course_id: ""})}>
                  <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
                  <SelectContent>{colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Course</Label>
                <Select value={form.course_id} onValueChange={v => setForm({...form, course_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>{filteredCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <Button onClick={handleSave} className="col-span-2">{editId ? "Update" : "Add"} Student</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search students..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Roll No.</th>
            <th className="text-left p-3 font-medium">Class</th>
            <th className="text-left p-3 font-medium">College</th>
            <th className="text-left p-3 font-medium">Risk</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-border/30 hover:bg-muted/30">
                <td className="p-3 font-medium">{s.student_name}</td>
                <td className="p-3 text-muted-foreground">{s.roll_number}</td>
                <td className="p-3 text-muted-foreground">{s.class}-{s.section}</td>
                <td className="p-3 text-muted-foreground">{s.colleges?.name || "—"}</td>
                <td className="p-3">{latestRisk(s) ? <RiskBadge level={latestRisk(s) === "critical" ? "high" : latestRisk(s)} /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                <td className="p-3 text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No students found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStudents;
