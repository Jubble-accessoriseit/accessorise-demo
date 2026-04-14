"use client";

import type { CSSProperties } from "react";
import type { ExpertBuildMergeEvent } from "../../lib/expert-builds/merge";

type ExpertBuildMergeAppliedNoticeProps = {
  event: ExpertBuildMergeEvent;
  onUndo: (() => void) | null;
};

function formatAppliedAt(value: string) {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

export function ExpertBuildMergeAppliedNotice({
  event,
  onUndo,
}: ExpertBuildMergeAppliedNoticeProps) {
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: 14,
        borderRadius: 18,
        border: "1px solid #dbeafe",
        background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "grid", gap: 3 }}>
          <div style={eyebrowStyle}>Latest merge</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
            Merged from {event.sourceBuildTitle}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
            Applied {event.additions} addition{event.additions === 1 ? "" : "s"} and{" "}
            {event.replacements} replacement{event.replacements === 1 ? "" : "s"} on{" "}
            {formatAppliedAt(event.appliedAt)}.
          </div>
        </div>
        {onUndo && (
          <button type="button" onClick={onUndo} style={buttonStyle}>
            Undo merge
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {event.affectedCategories.map((category) => (
          <span key={`${event.id}-${category}`} style={chipStyle}>
            {category}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.55 }}>
        {event.impactSummary}
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
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
  fontSize: 11,
  fontWeight: 700,
} satisfies CSSProperties;

const buttonStyle = {
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
