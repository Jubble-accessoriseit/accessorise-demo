"use client";

import type { GarageStepId } from "../../types/garage";

type GarageStepNavProps = {
  activeStep: GarageStepId;
  activeShellCopy: { title: string; subtitle: string };
  isCheckingSession: boolean;
  isCompactGarageShell: boolean;
  isPhone: boolean;
  isSignedIn: boolean;
  onBackHome: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  selectedBikeId: string;
  setActiveStep: (step: GarageStepId) => void;
  signedInUserEmail: string;
};

const garageSteps: Array<{
  id: GarageStepId;
  label: string;
  shortLabel: string;
}> = [
  { id: "Bike", label: "Bike", shortLabel: "Bike" },
  { id: "Build", label: "Build", shortLabel: "Build" },
  { id: "Expert", label: "Expert", shortLabel: "Expert" },
  { id: "Compare", label: "Compare", shortLabel: "Compare" },
  { id: "Save", label: "Saved", shortLabel: "Saved" },
  { id: "Buy", label: "Shop", shortLabel: "Shop" },
];

export function GarageStepNav({
  activeStep,
  activeShellCopy,
  isCheckingSession,
  isCompactGarageShell,
  isPhone,
  isSignedIn,
  onBackHome,
  onSignIn,
  onSignOut,
  selectedBikeId,
  setActiveStep,
  signedInUserEmail,
}: GarageStepNavProps) {
  const activeStepIndex =
    garageSteps.findIndex((step) => step.id === activeStep) + 1;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        marginBottom: isCompactGarageShell ? 16 : 24,
        padding: isPhone ? "8px 0 10px" : isCompactGarageShell ? "10px 0 12px" : "16px 0 18px",
        backdropFilter: "blur(16px)",
        background: "rgba(248,250,252,0.92)",
        borderBottom: "1px solid rgba(226,232,240,0.88)",
        boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          marginLeft: "auto",
          marginRight: "auto",
          padding: isPhone ? "0 14px" : isCompactGarageShell ? "0 12px" : "0 20px",
          display: "grid",
          gap: isPhone ? 8 : isCompactGarageShell ? 10 : 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: isCompactGarageShell ? "stretch" : "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "grid", gap: isPhone ? 4 : 6, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: isPhone ? "4px 8px" : "5px 9px",
                  borderRadius: 999,
                  background: "#ffffff",
                  border: "1px solid #dbe3ee",
                  fontSize: isPhone ? 10 : 11,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: "#475569",
                }}
              >
                Garage workspace
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: isPhone ? "4px 8px" : "5px 9px",
                  borderRadius: 999,
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: isPhone ? 10 : 11,
                  fontWeight: 800,
                }}
              >
                Step {activeStepIndex} of {garageSteps.length}
              </span>
            </div>

            <div style={{ display: "grid", gap: isPhone ? 3 : 4 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: isPhone ? 24 : isCompactGarageShell ? 28 : 34,
                  lineHeight: isPhone ? 1.04 : 1.02,
                  fontWeight: 900,
                  letterSpacing: -0.6,
                  color: "#0f172a",
                }}
              >
                {activeShellCopy.title}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: isPhone ? 12 : isCompactGarageShell ? 13 : 14,
                  lineHeight: isPhone ? 1.45 : 1.5,
                  color: "#64748b",
                  maxWidth: 680,
                }}
              >
                {activeShellCopy.subtitle}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isCompactGarageShell ? "stretch" : "flex-end",
              gap: 8,
              flexWrap: "wrap",
              minWidth: 0,
            }}
          >
            <button
              type="button"
              onClick={onBackHome}
              style={actionButtonStyle(isCompactGarageShell, isPhone)}
            >
              Home
            </button>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: isPhone ? "7px 10px" : isCompactGarageShell ? "8px 11px" : "9px 12px",
                borderRadius: isPhone ? 12 : 14,
                border: "1px solid #dbe3ee",
                background: "#ffffff",
                color: "#475569",
                fontSize: isPhone ? 11 : 12,
                fontWeight: 700,
                maxWidth: isPhone ? "100%" : isCompactGarageShell ? "100%" : 240,
                minHeight: isPhone ? 34 : 36,
              }}
              title={signedInUserEmail || undefined}
            >
              {isCheckingSession
                ? "Checking sign-in..."
                : isSignedIn
                ? signedInUserEmail || "Signed in"
                : "Signed out"}
            </div>

            {isCheckingSession ? null : isSignedIn ? (
              <button
                type="button"
                onClick={onSignOut}
                style={actionButtonStyle(isCompactGarageShell, isPhone)}
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                style={actionButtonStyle(isCompactGarageShell, isPhone, true)}
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: isPhone ? 6 : 8,
            overflowX: "auto",
            paddingBottom: isPhone ? 0 : 2,
            scrollbarWidth: "none",
          }}
        >
          {garageSteps.map((step, index) => {
            const isActive = activeStep === step.id;
            const isBuildDisabled = step.id === "Build" && !selectedBikeId;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (isBuildDisabled) {
                    setActiveStep("Bike");
                    return;
                  }

                  setActiveStep(step.id);
                }}
                style={{
                  flex: "0 0 auto",
                  minWidth: isPhone ? "auto" : isCompactGarageShell ? 104 : 118,
                  minHeight: isPhone ? 34 : isCompactGarageShell ? 48 : 50,
                  padding: isPhone ? "7px 12px" : isCompactGarageShell ? "8px 12px" : "9px 14px",
                  borderRadius: isPhone ? 999 : 18,
                  border: isActive ? "1px solid #0f172a" : "1px solid #dbe3ee",
                  background: isActive
                    ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                    : "#ffffff",
                  color: isActive ? "#ffffff" : "#0f172a",
                  textAlign: isPhone ? "center" : "left",
                  opacity: isBuildDisabled ? 0.52 : 1,
                  cursor: isBuildDisabled ? "not-allowed" : "pointer",
                  boxShadow: isActive
                    ? isPhone
                      ? "0 8px 16px rgba(15,23,42,0.14)"
                      : "0 14px 24px rgba(15,23,42,0.18)"
                    : isPhone
                    ? "0 1px 3px rgba(15,23,42,0.05)"
                    : "0 4px 12px rgba(15,23,42,0.04)",
                  display: isPhone ? "inline-flex" : "grid",
                  gap: isPhone ? 0 : 3,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!isPhone ? (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      color: isActive ? "rgba(255,255,255,0.72)" : "#94a3b8",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                ) : null}
                <span
                  style={{
                    fontSize: isPhone ? 12 : isCompactGarageShell ? 13 : 14,
                    fontWeight: 800,
                    lineHeight: 1.1,
                  }}
                >
                  {isCompactGarageShell ? step.shortLabel : step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function actionButtonStyle(isCompactGarageShell: boolean, isPhone: boolean, isPrimary = false) {
  return {
    flex: "0 0 auto",
    minHeight: isPhone ? 34 : 36,
    padding: isPhone ? "7px 10px" : isCompactGarageShell ? "8px 12px" : "9px 13px",
    borderRadius: isPhone ? 12 : 14,
    border: isPrimary ? "none" : "1px solid #d1d5db",
    background: isPrimary ? "#0f172a" : "#ffffff",
    color: isPrimary ? "#ffffff" : "#111827",
    fontSize: isPhone ? 11 : 12,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: isPrimary
      ? "0 10px 20px rgba(15,23,42,0.16)"
      : "0 1px 2px rgba(15,23,42,0.05)",
    transition: "all 0.2s ease",
  } as const;
}
