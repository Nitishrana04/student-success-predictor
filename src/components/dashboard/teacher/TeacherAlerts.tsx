import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TeacherAlerts = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*")
      .eq("recipient_user_id", user.id).order("created_at", { ascending: false });
    setNotifications(data || []);
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    toast.success("Marked as read");
    load();
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold font-display">Alerts</h1><p className="text-muted-foreground text-sm">Notifications from admin</p></div>
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-xl border flex items-start justify-between ${n.is_read ? "bg-card border-border/50" : "bg-primary/5 border-primary/20"}`}>
            <div className="flex gap-3">
              <Bell className={`w-4 h-4 mt-0.5 ${n.is_read ? "text-muted-foreground" : "text-primary"}`} />
              <div>
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
            {!n.is_read && (
              <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                <CheckCircle className="w-4 h-4 mr-1" />Read
              </Button>
            )}
          </div>
        ))}
        {notifications.length === 0 && <p className="text-center text-muted-foreground py-8">No alerts</p>}
      </div>
    </div>
  );
};

export default TeacherAlerts;
