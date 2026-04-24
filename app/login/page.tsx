"use client";

import Link from "next/link";
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0D0D0D",
        padding: "40px 20px",
      }}
    >
      {/* Back link */}
      <div style={{ width: "100%", maxWidth: 420, marginBottom: 4 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minHeight: 44,
            padding: "0 4px",
            textDecoration: "none",
            color: "#7A7268",
            fontSize: 13,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Continue without signing in
        </Link>
      </div>

      {/* Brand hero — visible above card on all screen sizes */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <p style={{
          margin: "0 0 8px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 10, fontWeight: 600, color: "#E8841A",
          textTransform: "uppercase", letterSpacing: "0.1em",
        }}>
          For every bike
        </p>
        <h1 style={{
          margin: 0,
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900, fontSize: 28,
          textTransform: "uppercase", letterSpacing: "0.04em",
          color: "#F5F3EE",
        }}>
          Accessorise <span style={{ color: "#E8841A" }}>It</span>
        </h1>
        <p style={{
          margin: "8px 0 0",
          fontSize: 12, color: "#7A7268", lineHeight: 1.5,
        }}>
          Accessories matched to your bike.
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#141414",
          borderRadius: 12,
          padding: "28px 24px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p style={{ marginTop: 0, color: "#7A7268", marginBottom: 20, fontSize: 13 }}>
          {mode === "login"
            ? "Sign in with your email and password"
            : "Create your account"}
        </p>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 999,
              border: mode === "login" ? "1px solid rgba(232,132,26,0.4)" : "1px solid rgba(255,255,255,0.08)",
              background: mode === "login" ? "rgba(232,132,26,0.12)" : "transparent",
              color: mode === "login" ? "#E8841A" : "#B8AFA6",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: mode === "login" ? 600 : 500,
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
              border: mode === "signup" ? "1px solid rgba(232,132,26,0.4)" : "1px solid rgba(255,255,255,0.08)",
              background: mode === "signup" ? "rgba(232,132,26,0.12)" : "transparent",
              color: mode === "signup" ? "#E8841A" : "#B8AFA6",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: mode === "signup" ? 600 : 500,
            }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 12, color: "#F5F3EE" }}>
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
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              marginBottom: 16,
              background: "#1A1A1A",
              color: "#F5F3EE",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 12, color: "#F5F3EE" }}>
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
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              marginBottom: 16,
              background: "#1A1A1A",
              color: "#F5F3EE",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 8,
              border: "none",
              background: loading ? "rgba(232,132,26,0.5)" : "#E8841A",
              color: "#0D0D0D",
              fontWeight: 700,
              fontSize: 13,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Log in →"
              : "Create account →"}
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: 16, color: "#7A7268", fontSize: 12 }}>{message}</p>
        ) : null}
      </div>
    </main>
  );
}
