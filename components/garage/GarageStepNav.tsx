"use client";

import type { GarageStepId } from "../../types/garage";

type GarageStepNavProps = {
  activeStep: GarageStepId;
  activeShellCopy: { title: string; subtitle: string };
  isCheckingSession: boolean;
  isCompactGarageShell: boolean;
  isSignedIn: boolean;
  onBackHome: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  selectedBikeId: string;
  setActiveStep: (step: GarageStepId) => void;
  signedInUserEmail: string;
};

const garageSteps: Array<{ id: GarageStepId; label: string }> = [
  { id: "Bike", label: "Choose Bike" },
  { id: "Build", label: "Build" },
  { id: "Expert", label: "Expert Builds" },
  { id: "Compare", label: "Compare Builds" },
  { id: "Save", label: "Saved Builds" },
  { id: "Buy", label: "Buy Accessories" },
];

export function GarageStepNav({
  activeStep,
  activeShellCopy,
  isCheckingSession,
  isCompactGarageShell,
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
        marginBottom: isCompactGarageShell ? 14 : 24,
        padding: isCompactGarageShell ? "12px 0 10px" : "24px 0 16px",
        background: "#f8fafc",
        borderBottom: "1px solid rgba(226,232,240,0.95)",
        boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          marginLeft: "auto",
          marginRight: "auto",
          padding: "0 10px",
        }}
      >
        <div
          style={{
            paddingTop: isCompactGarageShell ? 0 : 4,
            paddingBottom: isCompactGarageShell ? 10 : 18,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(280px, auto) minmax(0, 1fr)",
            alignItems: "start",
            gap: isCompactGarageShell ? 12 : 16,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                lineHeight: 1.1,
                fontWeight: 800,
                color: "#111827",
              }}
            >
              {activeShellCopy.title}
            </h1>

            <p
              style={{
                margin: isCompactGarageShell ? "4px 0 0 0" : "10px 0 0 0",
                fontSize: isCompactGarageShell ? 13 : 14,
                color: "#6b7280",
                maxWidth: 760,
              }}
            >
              {activeShellCopy.subtitle}
            </p>
          </div>

          <div
            style={{
              minWidth: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              alignSelf: isCompactGarageShell ? "center" : "start",
              textAlign: "center",
              paddingTop: isCompactGarageShell ? 2 : 4,
            }}
          >
            <div
              style={{
                fontSize: isCompactGarageShell ? 16 : 18,
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: -0.2,
                color: "#0f172a",
                whiteSpace: isCompactGarageShell ? "normal" : "nowrap",
                maxWidth: "100%",
              }}
            >
              Exact Fit and Universal Accessories
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              flexWrap: "wrap",
              minWidth: 0,
            }}
          >
            <button
              type="button"
              onClick={onBackHome}
              style={actionButtonStyle(isCompactGarageShell)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#94a3b8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              Back to Home
            </button>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: isCompactGarageShell ? "7px 11px" : "8px 12px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                color: "#475569",
                fontSize: isCompactGarageShell ? 11 : 12,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {isCheckingSession
                ? "Checking sign-in..."
                : isSignedIn
                ? "Signed in"
                : "Signed out"}
            </div>

            {!isCheckingSession && isSignedIn && signedInUserEmail && (
              <div
                title={signedInUserEmail}
                style={{
                  flex: "0 1 220px",
                  minWidth: 0,
                  fontSize: 13,
                  color: "#64748b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {signedInUserEmail}
              </div>
            )}

            {isCheckingSession ? null : isSignedIn ? (
              <button
                type="button"
                onClick={onSignOut}
                style={actionButtonStyle(isCompactGarageShell)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.borderColor = "#94a3b8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                style={actionButtonStyle(isCompactGarageShell)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.borderColor = "#94a3b8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isCompactGarageShell ? 8 : 10,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.7,
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Garage workflow | Step {activeStepIndex} of {garageSteps.length}
          </div>
          <div
            style={{
              display: "flex",
              gap: isCompactGarageShell ? 6 : 8,
              flexWrap: "wrap",
              maxWidth: 900,
              width: "100%",
            }}
          >
            {garageSteps.map((step) => {
              const isActive = activeStep === step.id;
              const isBuildStep = step.id === "Build";
              const isBuildDisabled = isBuildStep && !selectedBikeId;

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
                    minWidth: 110,
                    minHeight: isCompactGarageShell ? 34 : 36,
                    textAlign: "center",
                    fontSize: isCompactGarageShell ? 12 : 13,
                    fontWeight: 700,
                    color: isActive ? "#ffffff" : "#6b7280",
                    background: isActive ? "#0f172a" : "#ffffff",
                    padding: isCompactGarageShell ? "7px 11px" : "8px 12px",
                    borderRadius: 999,
                    border: isActive
                      ? "1px solid #0f172a"
                      : "1px solid #e5e7eb",
                    cursor: isBuildDisabled ? "not-allowed" : "pointer",
                    opacity: isBuildDisabled ? 0.55 : 1,
                    transition: "all 0.2s ease",
                    boxShadow: isActive
                      ? "0 8px 18px rgba(15,23,42,0.12)"
                      : "0 1px 2px rgba(15,23,42,0.04)",
                  }}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function actionButtonStyle(isCompactGarageShell: boolean) {
  return {
    flex: "0 0 auto",
    minHeight: isCompactGarageShell ? 34 : 36,
    padding: isCompactGarageShell ? "7px 12px" : "8px 13px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    fontSize: isCompactGarageShell ? 12 : 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
    transition: "all 0.2s ease",
  } as const;
}
