import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RiskBadge from "../RiskBadge";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const AdminPredictions = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [running, setRunning] = useState(false);

  const fetchPredictions = () => {
    supabase.from("predictions").select("*, students(student_name, roll_number, class, section)")
      .order("predicted_at", { ascending: false })
      .then(({ data }) => setPredictions(data || []));
  };

  useEffect(() => { fetchPredictions(); }, []);

  const runPredictions = async () => {
    setRunning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-dropout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({}),
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Failed");
      toast({ title: "Predictions Complete", description: result.message });
      fetchPredictions();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const formatScore = (score: number | null) => {
    if (!score && score !== 0) return "—";
    const val = Number(score);
    // If score is already 0-1 range, multiply by 100; if >1, it's already a percentage
    const pct = val <= 1 ? (val * 100).toFixed(0) : val.toFixed(0);
    return `${pct}%`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">AI Predictions</h1>
          <p className="text-muted-foreground text-sm">Dropout risk predictions for all students</p>
        </div>
        <Button onClick={runPredictions} disabled={running} className="gap-2">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
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
                <td className="p-3 text-muted-foreground">{formatScore(p.risk_score)}</td>
                <td className="p-3 text-muted-foreground text-xs max-w-xs truncate">{p.recommendation || "—"}</td>
                <td className="p-3 text-muted-foreground">{new Date(p.predicted_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {predictions.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No predictions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPredictions;
