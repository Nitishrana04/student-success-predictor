import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify user
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Parse optional student_id from body
    let studentIds: string[] | null = null;
    try {
      const body = await req.json();
      if (body.student_ids && Array.isArray(body.student_ids)) {
        studentIds = body.student_ids;
      }
    } catch { /* no body is fine, predict all */ }

    // Fetch students with their attendance and marks
    let studentsQuery = supabase.from("students").select("*");
    if (studentIds && studentIds.length > 0) {
      studentsQuery = studentsQuery.in("id", studentIds);
    }
    const { data: students, error: studentsError } = await studentsQuery;
    if (studentsError) throw new Error(`Failed to fetch students: ${studentsError.message}`);
    if (!students || students.length === 0) {
      return new Response(JSON.stringify({ message: "No students found", predictions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sIds = students.map((s: any) => s.id);

    // Fetch attendance and marks in parallel
    const [attRes, marksRes] = await Promise.all([
      supabase.from("attendance").select("student_id, status").in("student_id", sIds),
      supabase.from("marks").select("student_id, marks_obtained, total_marks").in("student_id", sIds),
    ]);

    // Build per-student data summary
    const studentSummaries = students.map((s: any) => {
      const att = (attRes.data || []).filter((a: any) => a.student_id === s.id);
      const totalAtt = att.length;
      const presentAtt = att.filter((a: any) => a.status === "present").length;
      const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : null;

      const marks = (marksRes.data || []).filter((m: any) => m.student_id === s.id);
      const avgMarks =
        marks.length > 0
          ? Math.round(
              marks.reduce(
                (sum: number, m: any) => sum + (Number(m.marks_obtained) / Number(m.total_marks)) * 100,
                0,
              ) / marks.length,
            )
          : null;

      return {
        id: s.id,
        name: s.student_name,
        class: s.class,
        section: s.section,
        roll: s.roll_number,
        status: s.status,
        attendance_rate: attendanceRate !== null ? `${attendanceRate}%` : "No data",
        average_marks: avgMarks !== null ? `${avgMarks}%` : "No data",
        total_attendance_records: totalAtt,
        total_marks_records: marks.length,
      };
    });

    // Call Lovable AI for prediction
    const aiPrompt = `You are an educational dropout risk prediction AI. Analyze the following student data and predict dropout risk for each student.

For each student, provide:
1. risk_level: one of "low", "medium", "high", "critical"
2. risk_score: a number between 0.0 and 1.0 (0 = no risk, 1 = certain dropout)
3. factors: key risk factors as an array of strings
4. recommendation: a short actionable recommendation for the teacher/admin

Rules:
- Attendance < 60% = high risk factor
- Attendance 60-75% = medium risk factor
- Average marks < 40% = high risk factor
- Average marks 40-60% = medium risk factor
- No attendance/marks data = medium risk (insufficient data)
- Status "inactive" or "dropped" = critical risk

Student Data:
${JSON.stringify(studentSummaries, null, 2)}

Respond ONLY with valid JSON array, no markdown, no explanation. Each element must have: student_id, risk_level, risk_score, factors, recommendation.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a dropout prediction AI. Always respond with valid JSON only." },
          { role: "user", content: aiPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    // Parse AI response - strip markdown fences if present
    let predictionsArr: any[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      predictionsArr = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI returned invalid JSON");
    }

    // Upsert predictions into database
    const upsertData = predictionsArr.map((p: any) => ({
      student_id: p.student_id,
      risk_level: p.risk_level,
      risk_score: p.risk_score,
      factors: p.factors,
      recommendation: p.recommendation,
      predicted_at: new Date().toISOString(),
      created_by: userId,
    }));

    // Delete old predictions for these students first, then insert new ones
    if (sIds.length > 0) {
      await supabase.from("predictions").delete().in("student_id", sIds);
    }
    const { error: insertError } = await supabase.from("predictions").insert(upsertData);
    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to save predictions: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        message: `Predictions generated for ${predictionsArr.length} students`,
        predictions: predictionsArr,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("predict-dropout error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
