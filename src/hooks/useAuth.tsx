import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "teacher" | "student";

export function useAuth(redirectIfNoAuth = true) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
        setRole(null);
        if (redirectIfNoAuth) navigate("/login");
      } else {
        setUser(session.user);
        // Fetch role
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setRole((data?.role as AppRole) || "student");
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        if (redirectIfNoAuth) navigate("/login");
        setLoading(false);
      } else {
        setUser(session.user);
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setRole((data?.role as AppRole) || "student");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectIfNoAuth]);

  return { user, role, loading };
}
