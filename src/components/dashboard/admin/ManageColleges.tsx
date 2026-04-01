import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ManageColleges = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", contact_email: "", contact_phone: "" });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("colleges").select("*").order("created_at", { ascending: false });
    setColleges(data || []);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("College name required"); return; }
    if (editId) {
      const { error } = await supabase.from("colleges").update(form).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("College updated!");
    } else {
      const { error } = await supabase.from("colleges").insert(form);
      if (error) { toast.error(error.message); return; }
      toast.success("College added!");
    }
    setShowAdd(false);
    setEditId(null);
    setForm({ name: "", address: "", contact_email: "", contact_phone: "" });
    load();
  };

  const handleEdit = (c: any) => {
    setForm({ name: c.name, address: c.address || "", contact_email: c.contact_email || "", contact_phone: c.contact_phone || "" });
    setEditId(c.id);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("colleges").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("College deleted!");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Colleges</h1>
          <p className="text-muted-foreground text-sm">Manage colleges</p>
        </div>
        <Dialog open={showAdd} onOpenChange={(v) => { setShowAdd(v); if (!v) { setEditId(null); setForm({ name: "", address: "", contact_email: "", contact_phone: "" }); } }}>
          <DialogTrigger asChild>
            <Button className="gradient-hero text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add College</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "Add"} College</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div><Label>Email</Label><Input value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} /></div>
              <div><Label>Phone</Label><Input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} /></div>
              <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Add"} College</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colleges.map(c => (
          <div key={c.id} className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Building2 className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="font-semibold text-sm">{c.name}</h3>
                  {c.address && <p className="text-xs text-muted-foreground">{c.address}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
        {colleges.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No colleges yet. Add one to get started.</p>}
      </div>
    </div>
  );
};

export default ManageColleges;
