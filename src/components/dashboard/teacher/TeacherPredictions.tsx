import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RiskBadge from "../RiskBadge";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TeacherPredictions = () => {
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
          <h1 className="text-2xl font-bold font-display">Dropout Predictions</h1>
          <p className="text-muted-foreground text-sm">AI-generated risk assessments</p>
        </div>
        <Button onClick={runPredictions} disabled={running} variant="outline" className="gap-2">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {running ? "Analyzing..." : "Run Predictions"}
        </Button>
      </div>
      <div className="space-y-3">
        {predictions.map(p => (
          <div key={p.id} className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{p.students?.student_name} <span className="text-muted-foreground">({p.students?.roll_number})</span></p>
              <p className="text-xs text-muted-foreground mt-1">{p.recommendation || "No recommendation"}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Score: {p.risk_score ? `${(Number(p.risk_score) * 100).toFixed(0)}%` : "—"}</p>
            </div>
            <RiskBadge level={p.risk_level === "critical" ? "high" : p.risk_level} />
          </div>
        ))}
        {predictions.length === 0 && <p className="text-center text-muted-foreground py-8">No predictions available. Click "Run Predictions" to generate.</p>}
      </div>
    </div>
  );
};

export default TeacherPredictions;
