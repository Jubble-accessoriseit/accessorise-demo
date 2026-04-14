"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { sanitizeAuthRedirect } from "@/lib/auth/redirect";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState("/garage");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("mode");
    const requestedNext = params.get("next");

    setMode(requestedMode === "signup" ? "signup" : "login");
    setNextPath(sanitizeAuthRedirect(requestedNext));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push(nextPath);
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setMessage(
        "Account created. If email confirmation is enabled in Supabase, check your inbox before signing in."
      );
      setMode("login");
      router.replace(
        nextPath === "/garage"
          ? "/login"
          : `/login?next=${encodeURIComponent(nextPath)}`
      );
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f3f4f6",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Accessorise It</h1>

        <p style={{ marginTop: 0, color: "#6b7280", marginBottom: 20 }}>
          {mode === "login"
            ? "Sign in with your email and password"
            : "Create your account"}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: mode === "login" ? "#111827" : "#ffffff",
              color: mode === "login" ? "#ffffff" : "#111827",
              cursor: "pointer",
            }}
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={() => setMode("signup")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: mode === "signup" ? "#111827" : "#ffffff",
              color: mode === "signup" ? "#ffffff" : "#111827",
              cursor: "pointer",
            }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            Email
          </label>

          <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  className="keeper-ignore"
  autoComplete="email"
  style={{
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    marginBottom: 16,
  }}
/>

          <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
            Password
          </label>

          <input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  minLength={8}
  className="keeper-ignore"
  autoComplete={mode === "login" ? "current-password" : "new-password"}
  style={{
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    marginBottom: 16,
  }}
/>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              background: "#111827",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: 16, color: "#374151" }}>{message}</p>
        ) : null}
      </div>
    </main>
  );
}
