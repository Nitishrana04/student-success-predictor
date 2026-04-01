import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bell, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showSend, setShowSend] = useState(false);
  const [form, setForm] = useState({ recipient_user_id: "", title: "", message: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [nRes, tRes] = await Promise.all([
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("user_id, full_name, user_roles(role)"),
    ]);
    setNotifications(nRes.data || []);
    setTeachers((tRes.data || []).filter((t: any) => t.user_roles?.some((r: any) => r.role === "teacher")));
  };

  const handleSend = async () => {
    if (!form.recipient_user_id || !form.title.trim() || !form.message.trim()) {
      toast.error("Fill all fields"); return;
    }
    const { error } = await supabase.from("notifications").insert({
      recipient_user_id: form.recipient_user_id,
      title: form.title,
      message: form.message,
      type: "alert",
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Notification sent!");
    setShowSend(false);
    setForm({ recipient_user_id: "", title: "", message: "" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold font-display">Notifications</h1><p className="text-muted-foreground text-sm">Send alerts to teachers</p></div>
        <Dialog open={showSend} onOpenChange={setShowSend}>
          <DialogTrigger asChild><Button className="gradient-hero text-primary-foreground"><Send className="w-4 h-4 mr-2" />Send Alert</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Recipient (Teacher)</Label>
                <Select value={form.recipient_user_id} onValueChange={v => setForm({...form, recipient_user_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>{teachers.map(t => <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div><Label>Message</Label><Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} /></div>
              <Button onClick={handleSend} className="w-full">Send</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-xl border ${n.is_read ? "bg-card border-border/50" : "bg-primary/5 border-primary/20"}`}>
            <div className="flex items-start gap-3">
              <Bell className={`w-4 h-4 mt-0.5 ${n.is_read ? "text-muted-foreground" : "text-primary"}`} />
              <div>
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && <p className="text-center text-muted-foreground py-8">No notifications yet</p>}
      </div>
    </div>
  );
};

export default AdminNotifications;
