import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";

const StudentFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: student } = await supabase.from("students").select("id").eq("user_id", user.id).maybeSingle();
      if (!student) return;
      const { data } = await supabase.from("feedback").select("*").eq("student_id", student.id).order("created_at", { ascending: false });
      setFeedbacks(data || []);
    };
    load();
  }, []);

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold font-display">Teacher Feedback</h1><p className="text-muted-foreground text-sm">Suggestions from your teachers</p></div>
      <div className="space-y-3">
        {feedbacks.map(f => (
          <div key={f.id} className="bg-card rounded-xl p-4 shadow-card border border-border/50">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary capitalize">{f.category}</span>
                <p className="text-sm mt-2">{f.message}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{new Date(f.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        {feedbacks.length === 0 && <p className="text-center text-muted-foreground py-8">No feedback received yet</p>}
      </div>
    </div>
  );
};

export default StudentFeedback;
