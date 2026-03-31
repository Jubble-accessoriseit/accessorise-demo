"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finishLogin = async () => {
      try {
        await supabase.auth.getSession();
        router.replace("/garage");
      } catch (error) {
        console.error("Auth callback error:", error);
        router.replace("/login");
      }
    };

    finishLogin();
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        background: "#f9fafb",
        color: "#111827",
      }}
    >
      Finishing sign in...
    </main>
  );
}