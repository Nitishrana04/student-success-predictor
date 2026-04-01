import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import RiskBadge from "../RiskBadge";

const TeacherStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("students").select("*, predictions(risk_level)").order("student_name")
      .then(({ data }) => setStudents(data || []));
  }, []);

  const filtered = students.filter(s => s.student_name?.toLowerCase().includes(search.toLowerCase()));
  const latestRisk = (s: any) => s.predictions?.[0]?.risk_level;

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold font-display">My Students</h1></div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Roll No.</th>
            <th className="text-left p-3 font-medium">Class</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Risk</th>
          </tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-border/30 hover:bg-muted/30">
                <td className="p-3 font-medium">{s.student_name}</td>
                <td className="p-3 text-muted-foreground">{s.roll_number}</td>
                <td className="p-3 text-muted-foreground">{s.class}-{s.section}</td>
                <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success capitalize">{s.status}</span></td>
                <td className="p-3">{latestRisk(s) ? <RiskBadge level={latestRisk(s) === "critical" ? "high" : latestRisk(s)} /> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherStudents;
