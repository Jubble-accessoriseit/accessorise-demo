"use client";

import type { CSSProperties } from "react";

type ExpertBuildMergeResumeCardProps = {
  decisionCount: number;
  isStale: boolean;
  lastSavedAt: string | null;
  unresolvedCount: number;
  updatedAt: string;
  onRebase: () => void;
  onResume: () => void;
  onStartOver: () => void;
};

function formatRelativeTime(value: string) {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return "Updated recently";
  }

  const diffMs = timestamp - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat("en-AU", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 48) {
    return formatter.format(diffHours, "hour");
  }

  return formatter.format(Math.round(diffHours / 24), "day");
}

export function ExpertBuildMergeResumeCard({
  decisionCount,
  isStale,
  lastSavedAt,
  unresolvedCount,
  updatedAt,
  onRebase,
  onResume,
  onStartOver,
}: ExpertBuildMergeResumeCardProps) {
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: 12,
        borderRadius: 16,
        border: isStale ? "1px solid #fdba74" : "1px solid #bfdbfe",
        background: isStale ? "#fff7ed" : "#eff6ff",
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <div style={eyebrowStyle}>{isStale ? "Stale draft" : "Draft in progress"}</div>
        <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 800 }}>
          {decisionCount} decisions made
          {unresolvedCount > 0
            ? `, ${unresolvedCount} unresolved`
            : ", ready to keep refining"}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
          {isStale
            ? "Your working build changed since this draft was based on an earlier snapshot."
            : "Resume where you left off without touching your working build yet."}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={chipStyle}>Updated {formatRelativeTime(updatedAt)}</span>
        {lastSavedAt && <span style={chipStyle}>Saved {formatRelativeTime(lastSavedAt)}</span>}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={onResume} style={primaryButtonStyle}>
          {isStale ? "Review draft" : "Resume draft"}
        </button>
        {isStale && (
          <button type="button" onClick={onRebase} style={secondaryButtonStyle}>
            Rebase draft
          </button>
        )}
        <button type="button" onClick={onStartOver} style={secondaryButtonStyle}>
          Start over
        </button>
      </div>
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
  background: "#ffffff",
  border: "1px solid rgba(148,163,184,0.3)",
  color: "#334155",
  fontSize: 11,
  fontWeight: 700,
} satisfies CSSProperties;

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
} satisfies CSSProperties;

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
} satisfies CSSProperties;
