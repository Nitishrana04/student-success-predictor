import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RiskBadge from "../RiskBadge";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminPredictions = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  const loadPredictions = () => {
    supabase.from("predictions").select("*, students(student_name, roll_number, class, section)")
      .order("predicted_at", { ascending: false })
      .then(({ data }) => setPredictions(data || []));
  };

  useEffect(() => { loadPredictions(); }, []);

  const runPredictions = async () => {
    setRunning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please login first"); return; }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-dropout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");
      toast.success(data.message || "Predictions generated!");
      loadPredictions();
    } catch (e: any) {
      toast.error(e.message || "Failed to run predictions");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">AI Predictions</h1>
          <p className="text-muted-foreground text-sm">Dropout risk predictions for all students</p>
        </div>
        <Button onClick={runPredictions} disabled={running} className="gradient-hero text-primary-foreground gap-2">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {running ? "Analyzing..." : "Run AI Predictions"}
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3 font-medium">Student</th>
            <th className="text-left p-3 font-medium">Class</th>
            <th className="text-left p-3 font-medium">Risk Level</th>
            <th className="text-left p-3 font-medium">Score</th>
            <th className="text-left p-3 font-medium">Recommendation</th>
            <th className="text-left p-3 font-medium">Date</th>
          </tr></thead>
          <tbody>
            {predictions.map(p => (
              <tr key={p.id} className="border-b border-border/30 hover:bg-muted/30">
                <td className="p-3 font-medium">{p.students?.student_name}</td>
                <td className="p-3 text-muted-foreground">{p.students?.class}-{p.students?.section}</td>
                <td className="p-3"><RiskBadge level={p.risk_level === "critical" ? "high" : p.risk_level} /></td>
                <td className="p-3 text-muted-foreground">{p.risk_score ? `${(Number(p.risk_score) * 100).toFixed(0)}%` : "—"}</td>
                <td className="p-3 text-muted-foreground text-xs max-w-xs truncate">{p.recommendation || "—"}</td>
                <td className="p-3 text-muted-foreground">{new Date(p.predicted_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {predictions.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No predictions yet. Click "Run AI Predictions" to start.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPredictions;
