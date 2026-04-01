import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ManageCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", college_id: "", duration_years: "3" });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [coursesRes, collegesRes] = await Promise.all([
      supabase.from("courses").select("*, colleges(name)").order("created_at", { ascending: false }),
      supabase.from("colleges").select("id, name"),
    ]);
    setCourses(coursesRes.data || []);
    setColleges(collegesRes.data || []);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.college_id) { toast.error("Name and college required"); return; }
    const payload = { name: form.name, college_id: form.college_id, duration_years: parseInt(form.duration_years) };
    if (editId) {
      const { error } = await supabase.from("courses").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Course updated!");
    } else {
      const { error } = await supabase.from("courses").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Course added!");
    }
    setShowAdd(false); setEditId(null); setForm({ name: "", college_id: "", duration_years: "3" }); load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted!"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold font-display">Courses</h1><p className="text-muted-foreground text-sm">Manage courses & classes</p></div>
        <Dialog open={showAdd} onOpenChange={(v) => { setShowAdd(v); if (!v) { setEditId(null); setForm({ name: "", college_id: "", duration_years: "3" }); } }}>
          <DialogTrigger asChild><Button className="gradient-hero text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add Course</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "Add"} Course</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Course Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div>
                <Label>College</Label>
                <Select value={form.college_id} onValueChange={v => setForm({...form, college_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
                  <SelectContent>{colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Duration (years)</Label><Input type="number" value={form.duration_years} onChange={e => setForm({...form, duration_years: e.target.value})} /></div>
              <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3 font-medium">Course</th>
            <th className="text-left p-3 font-medium">College</th>
            <th className="text-left p-3 font-medium">Duration</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id} className="border-b border-border/30 hover:bg-muted/30">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.colleges?.name}</td>
                <td className="p-3 text-muted-foreground">{c.duration_years} yrs</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm({ name: c.name, college_id: c.college_id, duration_years: String(c.duration_years) }); setEditId(c.id); setShowAdd(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No courses yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourses;
