"use client";

import type { CSSProperties } from "react";
import type {
  GarageBuildRecord,
  GarageBuildSaveMode,
} from "@/types/garage";

type GarageBuildSaveModeCardProps = {
  activeMode: GarageBuildSaveMode;
  currentBikeLabel: string;
  currentBuildName: string;
  hasRecentMerge: boolean;
  hasUnsavedChanges: boolean;
  isEditingSavedBuild: boolean;
  recommendation: string;
  saveActionLabel: string;
  sourceBuild: GarageBuildRecord | null;
  suggestedName: string;
  onChangeMode: (mode: GarageBuildSaveMode) => void;
};

const modeOptions: Array<{
  id: GarageBuildSaveMode;
  label: string;
  hint: string;
}> = [
  {
    id: "save-as-new",
    label: "Save as new build",
    hint: "Create a new named build without touching any existing saved version.",
  },
  {
    id: "update-existing",
    label: "Update existing",
    hint: "Update the saved build currently open in the workspace.",
  },
  {
    id: "save-as-version",
    label: "Save as new version",
    hint: "Preserve the current saved build and create a new derived revision.",
  },
  {
    id: "duplicate-build",
    label: "Duplicate build",
    hint: "Clone the current saved build into a separate build with its own name.",
  },
];

export function GarageBuildSaveModeCard({
  activeMode,
  currentBikeLabel,
  currentBuildName,
  hasRecentMerge,
  hasUnsavedChanges,
  isEditingSavedBuild,
  recommendation,
  saveActionLabel,
  sourceBuild,
  suggestedName,
  onChangeMode,
}: GarageBuildSaveModeCardProps) {
  return (
    <div
      style={{
        display: "grid",
        gap: 14,
        padding: 16,
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <div style={eyebrowStyle}>Save strategy</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          {currentBuildName || currentBikeLabel}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
          {recommendation}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {hasRecentMerge && <span style={chipStyle}>Expert-inspired</span>}
        {isEditingSavedBuild && <span style={chipStyle}>Editing saved build</span>}
        {hasUnsavedChanges && <span style={chipStyle}>Unsaved changes</span>}
        {sourceBuild?.version?.revisionLabel && (
          <span style={chipStyle}>{sourceBuild.version.revisionLabel}</span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 8 }}>
        {modeOptions.map((option) => {
          const disabled =
            !isEditingSavedBuild &&
            (option.id === "update-existing" ||
              option.id === "save-as-version" ||
              option.id === "duplicate-build");
          const isActive = activeMode === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChangeMode(option.id)}
              style={{
                display: "grid",
                gap: 4,
                padding: 12,
                textAlign: "left",
                borderRadius: 14,
                border: isActive ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                background: isActive ? "#eff6ff" : "#ffffff",
                color: disabled ? "#94a3b8" : "#0f172a",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.75 : 1,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800 }}>{option.label}</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.45 }}>
                {disabled
                  ? "Available when a saved build is open in the workspace."
                  : option.hint}
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        <SummaryCell label="Suggested name" value={suggestedName} />
        <SummaryCell
          label="Primary action"
          value={saveActionLabel}
        />
      </div>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 3,
        padding: 10,
        borderRadius: 14,
        background: "#f8fafc",
      }}
    >
      <div style={eyebrowStyle}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

const eyebrowStyle = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "#64748b",
} satisfies CSSProperties;

const chipStyle = {
  display: "inline-flex",
  padding: "5px 8px",
  borderRadius: 999,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 11,
  fontWeight: 700,
} satisfies CSSProperties;
