"use client";

import type { CSSProperties } from "react";
import type { GarageBuildRecord } from "@/types/garage";

type GarageBuildProvenanceCardProps = {
  build: GarageBuildRecord;
};

function formatDateTime(value: string | undefined) {
  if (!value) {
    return "Recently";
  }

  const parsed = Date.parse(value);

  if (!Number.isFinite(parsed)) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function GarageBuildProvenanceCard({
  build,
}: GarageBuildProvenanceCardProps) {
  const provenance = build.provenance;
  const history = build.history ?? [];

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        padding: 16,
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <div style={eyebrowStyle}>Lineage</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          {provenance?.lineageNote ?? "Saved build"}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
          Created {formatDateTime(build.createdAt ?? build.updatedAt)}. Last updated{" "}
          {formatDateTime(build.updatedAt)}.
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {build.version?.revisionLabel && <span style={chipStyle}>{build.version.revisionLabel}</span>}
        {provenance?.creationMode && (
          <span style={chipStyle}>{provenance.creationMode.replace(/-/g, " ")}</span>
        )}
        {provenance?.latestMerge && <span style={chipStyle}>Expert-inspired</span>}
        {build.lineage?.derivedFromBuildName && (
          <span style={chipStyle}>Derived from {build.lineage.derivedFromBuildName}</span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        <InfoCell
          label="Parent build"
          value={provenance?.parentBuildName ?? build.lineage?.derivedFromBuildName ?? "None"}
        />
        <InfoCell
          label="Latest merge"
          value={provenance?.latestMerge?.sourceBuildTitle ?? "None"}
        />
        <InfoCell
          label="Impact"
          value={provenance?.latestMerge?.impactSummary ?? "Manual refinement"}
        />
      </div>

      {history.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={eyebrowStyle}>Recent history</div>
          <div style={{ display: "grid", gap: 8 }}>
            {history.slice().reverse().map((event) => (
              <div
                key={event.id}
                style={{
                  display: "grid",
                  gap: 3,
                  padding: 10,
                  borderRadius: 14,
                  background: "#f8fafc",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                  {event.summary}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  {formatDateTime(event.at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
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
      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", lineHeight: 1.45 }}>
        {value}
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
