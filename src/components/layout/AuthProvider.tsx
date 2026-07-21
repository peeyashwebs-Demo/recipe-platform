"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? {
        id: user.id,
        email: user.email || "",
        display_name: user.user_metadata?.display_name || "User",
        avatar_url: user.user_metadata?.avatar_url,
        role: "user",
        unit_preference: "metric",
        created_at: user.created_at,
      } : null);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) {
          setProfile({
            id: profile.id,
            email: user.email || "",
            display_name: profile.display_name || "User",
            avatar_url: profile.avatar_url,
            role: profile.role || "user",
            unit_preference: profile.unit_preference || "metric",
            created_at: profile.created_at,
          });
        }
      }
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          router.push("/login");
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              display_name: session.user.user_metadata?.display_name || "User",
              avatar_url: session.user.user_metadata?.avatar_url,
              role: "user",
              unit_preference: "metric",
              created_at: session.user.created_at,
            });

            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            if (profile) {
              setProfile({
                id: profile.id,
                email: session.user.email || "",
                display_name: profile.display_name || "User",
                avatar_url: profile.avatar_url,
                role: profile.role || "user",
                unit_preference: profile.unit_preference || "metric",
                created_at: profile.created_at,
              });
            }
          }
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading, router, pathname]);

  return <>{children}</>;
}
