import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

const StudentProfile = () => {
  const [student, setStudent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [sRes, pRes] = await Promise.all([
        supabase.from("students").select("*, colleges(name), courses(name)").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      setStudent(sRes.data);
      setProfile(pRes.data);
    };
    load();
  }, []);

  if (!student) {
    return <div className="text-center py-12 text-muted-foreground">No student profile linked to your account</div>;
  }

  const fields = [
    { label: "Name", value: student.student_name },
    { label: "Roll Number", value: student.roll_number },
    { label: "Class", value: `${student.class}-${student.section}` },
    { label: "College", value: student.colleges?.name || "—" },
    { label: "Course", value: student.courses?.name || "—" },
    { label: "Guardian", value: student.guardian_name || "—" },
    { label: "Contact", value: student.contact_number || "—" },
    { label: "Address", value: student.address || "—" },
    { label: "Status", value: student.status || "active" },
    { label: "Enrolled", value: student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : "—" },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold font-display">My Profile</h1></div>
      <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 rounded-full bg-primary/10"><User className="w-8 h-8 text-primary" /></div>
          <div>
            <h2 className="text-lg font-bold">{student.student_name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.full_name || student.student_name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.label}>
              <p className="text-xs text-muted-foreground">{f.label}</p>
              <p className="text-sm font-medium capitalize">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
