"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buildLoginHref } from "@/lib/auth/redirect";
import { supabase } from "@/lib/supabase";

type HomeAuthCtasProps = {
  primaryStyle: React.CSSProperties;
  secondaryStyle: React.CSSProperties;
  supportingLinkStyle?: React.CSSProperties;
  signedInSupportingTextStyle?: React.CSSProperties;
  layout?: "hero" | "compact";
  showPrimary?: boolean;
};

const START_BUILDING_HREF = "/garage?step=Bike";
const HOME_RETURN_HREF = "/";

export function HomeAuthCtas({
  primaryStyle,
  secondaryStyle,
  supportingLinkStyle,
  signedInSupportingTextStyle,
  layout = "hero",
  showPrimary = true,
}: HomeAuthCtasProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        setIsSignedIn(!!session);
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setIsSignedIn(!!session);
      setIsCheckingSession(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signedOutHref = useMemo(
    () =>
      buildLoginHref({
        mode: "signup",
        next: HOME_RETURN_HREF,
      }),
    []
  );

  const signInHref = useMemo(
    () =>
      buildLoginHref({
        mode: "login",
        next: HOME_RETURN_HREF,
      }),
    []
  );

  const secondaryHref = isSignedIn ? "/garage" : signedOutHref;
  const secondaryLabel = isSignedIn ? "Open Garage" : "Sign up";

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await supabase.auth.signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: layout === "hero" ? 12 : 10 }}>
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {showPrimary ? (
          <Link href={START_BUILDING_HREF} style={primaryStyle}>
            Start Building
          </Link>
        ) : null}
        <Link href={secondaryHref} style={secondaryStyle}>
          {secondaryLabel}
        </Link>
      </div>

      {isCheckingSession ? null : isSignedIn ? (
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {signedInSupportingTextStyle ? (
            <div style={signedInSupportingTextStyle}>Signed in. Your garage is ready.</div>
          ) : null}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              fontSize: 13,
              fontWeight: 700,
              color: layout === "hero" ? "rgba(255,255,255,0.82)" : "#475569",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              cursor: isSigningOut ? "not-allowed" : "pointer",
              opacity: isSigningOut ? 0.6 : 1,
            }}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            alignItems: "center",
            fontSize: 13,
            color: layout === "hero" ? "rgba(255,255,255,0.72)" : "#64748b",
          }}
        >
          <span>Already have an account?</span>
          <Link href={signInHref} style={supportingLinkStyle ?? secondaryStyle}>
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}
