import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RiskBadge from "../RiskBadge";

const TeacherPredictions = () => {
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("predictions").select("*, students(student_name, roll_number, class, section)")
      .order("predicted_at", { ascending: false })
      .then(({ data }) => setPredictions(data || []));
  }, []);

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold font-display">Dropout Predictions</h1><p className="text-muted-foreground text-sm">AI-generated risk assessments</p></div>
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
        {predictions.length === 0 && <p className="text-center text-muted-foreground py-8">No predictions available</p>}
      </div>
    </div>
  );
};

export default TeacherPredictions;
