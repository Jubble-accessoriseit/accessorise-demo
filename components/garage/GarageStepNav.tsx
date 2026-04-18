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
        marginBottom: isCompactGarageShell ? 10 : 14,
        padding: isPhone ? "6px 0 8px" : isCompactGarageShell ? "8px 0 10px" : "10px 0 12px",
        backdropFilter: "blur(16px)",
        background: "rgba(248,250,252,0.92)",
        borderBottom: "1px solid rgba(226,232,240,0.88)",
        boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          marginLeft: "auto",
          marginRight: "auto",
          padding: isPhone ? "0 14px" : isCompactGarageShell ? "0 12px" : "0 14px",
          display: "grid",
          gap: isPhone ? 6 : isCompactGarageShell ? 8 : 10,
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
            <div style={{ display: "grid", gap: isPhone ? 3 : 4, minWidth: 0 }}>
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
                  padding: isPhone ? "3px 7px" : "4px 8px",
                  borderRadius: 999,
                  background: "#ffffff",
                  border: "1px solid #dbe3ee",
                  fontSize: 10,
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
                  padding: isPhone ? "3px 7px" : "4px 8px",
                  borderRadius: 999,
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: 10,
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
                fontSize: isPhone ? 20 : isCompactGarageShell ? 24 : 28,
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
                  fontSize: isPhone ? 11 : 12,
                  lineHeight: 1.4,
                  color: "#64748b",
                  maxWidth: 620,
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
              width: isPhone ? "100%" : "auto",
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
                padding: isPhone ? "6px 9px" : isCompactGarageShell ? "7px 10px" : "8px 11px",
                borderRadius: isPhone ? 12 : 14,
                border: "1px solid #dbe3ee",
                background: "#ffffff",
                color: "#475569",
                fontSize: 11,
                fontWeight: 700,
                flex: isPhone ? "1 1 180px" : "0 1 auto",
                width: isPhone ? "auto" : undefined,
                minWidth: 0,
                maxWidth: isPhone ? "calc(100% - 92px)" : isCompactGarageShell ? "100%" : 240,
                minHeight: isPhone ? 32 : 34,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
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
            display: isPhone ? "grid" : "flex",
            gridTemplateColumns: isPhone ? "repeat(6, minmax(0, 1fr))" : undefined,
            gap: isPhone ? 4 : 6,
            overflowX: isPhone ? "visible" : "auto",
            paddingBottom: isPhone ? 0 : 2,
            scrollbarWidth: "none",
            minWidth: 0,
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
                  minWidth: isPhone ? 0 : isCompactGarageShell ? 104 : 118,
                  minHeight: isPhone ? 30 : isCompactGarageShell ? 40 : 42,
                  padding: isPhone ? "6px 4px" : isCompactGarageShell ? "7px 10px" : "8px 12px",
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
                  width: isPhone ? "100%" : undefined,
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
                    fontSize: isPhone ? 10 : isCompactGarageShell ? 12 : 13,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
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
    minHeight: isPhone ? 32 : 34,
    padding: isPhone ? "6px 9px" : isCompactGarageShell ? "7px 10px" : "8px 11px",
    borderRadius: isPhone ? 12 : 14,
    border: isPrimary ? "none" : "1px solid #d1d5db",
    background: isPrimary ? "#0f172a" : "#ffffff",
    color: isPrimary ? "#ffffff" : "#111827",
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: isPrimary
      ? "0 10px 20px rgba(15,23,42,0.16)"
      : "0 1px 2px rgba(15,23,42,0.05)",
    transition: "all 0.2s ease",
  } as const;
}
