import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RiskBadge from "../RiskBadge";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const TeacherPredictions = () => {
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
    const pct = val <= 1 ? (val * 100).toFixed(0) : val.toFixed(0);
    return `${pct}%`;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Dropout Predictions</h1>
          <p className="text-muted-foreground text-sm">AI-generated risk assessments</p>
        </div>
        <Button onClick={runPredictions} disabled={running} size="sm" className="gap-2">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          {running ? "Analyzing..." : "Run AI Predictions"}
        </Button>
      </div>
      <div className="space-y-3">
        {predictions.map(p => (
          <div key={p.id} className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{p.students?.student_name} <span className="text-muted-foreground">({p.students?.roll_number})</span></p>
              <p className="text-xs text-muted-foreground mt-1">{p.recommendation || "No recommendation"}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Score: {formatScore(p.risk_score)}</p>
            </div>
            <RiskBadge level={p.risk_level === "critical" ? "high" : p.risk_level} />
          </div>
        ))}
        {predictions.length === 0 && <p className="text-center text-muted-foreground py-8">No predictions available</p>}
      </div>
    </div>
  );
};

export default TeacherPredictions;
