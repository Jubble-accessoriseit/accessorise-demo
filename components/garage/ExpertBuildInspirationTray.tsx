"use client";

import type { CSSProperties } from "react";
import type {
  ExpertBuildInspirationSelection,
  ResolvedExpertBuild,
} from "../../lib/expert-builds/types";

type ExpertBuildInspirationTrayProps = {
  activeBuild: ResolvedExpertBuild | null;
  inspiration: ExpertBuildInspirationSelection | null;
  onAddAll: () => void;
  onAddMissingOnly: () => void;
  onClear: () => void;
};

export function ExpertBuildInspirationTray({
  activeBuild,
  inspiration,
  onAddAll,
  onAddMissingOnly,
  onClear,
}: ExpertBuildInspirationTrayProps) {
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        padding: 14,
        borderRadius: 20,
        border: "1px solid #dbeafe",
        background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
        boxShadow: "0 10px 24px rgba(37,99,235,0.08)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 4 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: "#1d4ed8",
            }}
          >
            Inspiration tray
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
            {inspiration
              ? `${inspiration.items.length} inspired item${
                  inspiration.items.length === 1 ? "" : "s"
                } ready`
              : "Keep inspiration separate from your build"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
            {inspiration
              ? `Pulled from ${inspiration.buildTitle} by ${inspiration.sourceBuilder}. Your current build stays untouched.`
              : "Use an expert build as a reference set first, then decide later what should actually be merged into your build."}
          </div>
        </div>
        {inspiration && (
          <button
            type="button"
            onClick={onClear}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "9px 12px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              height: "fit-content",
            }}
          >
            Clear inspiration
          </button>
        )}
      </div>

      {inspiration ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {inspiration.items.map((item) => (
            <span
              key={`${inspiration.buildId}-${item.id}`}
              style={{
                display: "inline-flex",
                padding: "6px 9px",
                borderRadius: 999,
                background: "#ffffff",
                border: "1px solid #dbeafe",
                color: "#1e3a8a",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {item.name}
            </span>
          ))}
        </div>
      ) : (
        activeBuild && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onAddAll}
              style={actionButtonStyle("#0f172a", "#ffffff")}
            >
              Add all to inspiration
            </button>
            <button
              type="button"
              onClick={onAddMissingOnly}
              style={actionButtonStyle("#eff6ff", "#1d4ed8", "1px solid #bfdbfe")}
            >
              Add missing only
            </button>
          </div>
        )
      )}
    </div>
  );
}

function actionButtonStyle(
  background: string,
  color: string,
  border: string = "none"
) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 13px",
    borderRadius: 12,
    border,
    background,
    color,
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  } satisfies CSSProperties;
}
