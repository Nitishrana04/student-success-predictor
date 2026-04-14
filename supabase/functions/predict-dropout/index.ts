import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    // Fetch all active students
    const { data: students, error: studentsErr } = await supabase
      .from("students")
      .select("id, student_name, roll_number, class, section")
      .eq("status", "active");

    if (studentsErr) throw studentsErr;
    if (!students || students.length === 0) {
      return new Response(JSON.stringify({ message: "No students found", predictions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const predictions = [];

    for (const student of students) {
      // Fetch attendance
      const { data: attendance } = await supabase
        .from("attendance")
        .select("status")
        .eq("student_id", student.id);

      const totalDays = attendance?.length || 0;
      const presentDays = attendance?.filter(a => a.status === "present").length || 0;
      const attendancePct = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

      // Fetch marks
      const { data: marks } = await supabase
        .from("marks")
        .select("marks_obtained, total_marks")
        .eq("student_id", student.id);

      const avgMarksPct = marks && marks.length > 0
        ? marks.reduce((sum, m) => sum + (Number(m.marks_obtained) / Number(m.total_marks)) * 100, 0) / marks.length
        : 100;

      // Build prompt for AI
      const prompt = `Analyze dropout risk for student:
- Name: ${student.student_name}
- Class: ${student.class}-${student.section}
- Attendance: ${attendancePct.toFixed(1)}% (${presentDays}/${totalDays} days)
- Average Marks: ${avgMarksPct.toFixed(1)}%

Return a JSON object with:
- risk_level: "low", "medium", "high", or "critical"
- risk_score: number between 0 and 1 (0=no risk, 1=highest risk)
- recommendation: a brief actionable recommendation (1-2 sentences)
- factors: array of risk factor strings

Rules:
- Attendance < 60% = high risk factor
- Marks < 40% = high risk factor
- Both low = critical
- No data available = medium risk (needs monitoring)

Return ONLY valid JSON, no markdown.`;

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "You are a student dropout risk analyzer. Return only valid JSON." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!aiResp.ok) {
        console.error(`AI error for ${student.student_name}:`, await aiResp.text());
        continue;
      }

      const aiData = await aiResp.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      // Strip markdown code fences if present
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        console.error(`Failed to parse AI response for ${student.student_name}:`, content);
        parsed = {
          risk_level: attendancePct < 60 || avgMarksPct < 40 ? "high" : "low",
          risk_score: attendancePct < 60 || avgMarksPct < 40 ? 0.75 : 0.2,
          recommendation: "AI analysis unavailable, using rule-based assessment.",
          factors: [],
        };
      }

      // Upsert prediction
      const { error: upsertErr } = await supabase
        .from("predictions")
        .upsert({
          student_id: student.id,
          risk_level: parsed.risk_level,
          risk_score: parsed.risk_score,
          recommendation: parsed.recommendation,
          factors: parsed.factors || [],
          predicted_at: new Date().toISOString(),
        }, { onConflict: "student_id" });

      if (upsertErr) {
        console.error(`Upsert error for ${student.student_name}:`, upsertErr);
        // Try insert instead (no unique constraint on student_id)
        await supabase.from("predictions").insert({
          student_id: student.id,
          risk_level: parsed.risk_level,
          risk_score: parsed.risk_score,
          recommendation: parsed.recommendation,
          factors: parsed.factors || [],
        });
      }

      predictions.push({ student: student.student_name, ...parsed });
    }

    return new Response(JSON.stringify({ message: `Predictions generated for ${predictions.length} students`, predictions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict-dropout error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
