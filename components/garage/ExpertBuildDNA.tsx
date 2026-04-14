"use client";

import type { ResolvedExpertBuild } from "../../lib/expert-builds/types";

type ExpertBuildDNAProps = {
  build: ResolvedExpertBuild;
  compact?: boolean;
};

export function ExpertBuildDNA({ build, compact = false }: ExpertBuildDNAProps) {
  const tone = compact ? "#f8fafc" : "#ffffff";

  return (
    <div style={{ display: "grid", gap: compact ? 10 : 12 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          `Purpose: ${build.dna.purpose.replace("-", " ")}`,
          `Style: ${build.dna.ridingStyle.replace("-", " ")}`,
          `Terrain: ${build.dna.terrainFocus.replace("-", " ")}`,
          `Load: ${build.dna.loadProfile.replace("-", " ")}`,
        ].map((label) => (
          <span
            key={label}
            style={{
              display: "inline-flex",
              padding: "5px 8px",
              borderRadius: 999,
              background: compact ? "#eff6ff" : "#f8fafc",
              border: "1px solid #dbeafe",
              color: "#1d4ed8",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          padding: compact ? 10 : 12,
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          background: tone,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
          {build.dnaSummary}
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {build.emphasisSummary.slice(0, compact ? 4 : 6).map((entry) => (
            <div
              key={`${build.id}-${entry.category}`}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr auto",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#475569",
                  lineHeight: 1.2,
                }}
              >
                {entry.label}
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  background: "#e2e8f0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(entry.strength / 5) * 100}%`,
                    height: "100%",
                    borderRadius: 999,
                    background:
                      entry.strength >= 4
                        ? "#2563eb"
                        : entry.strength === 3
                        ? "#60a5fa"
                        : "#bfdbfe",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                {entry.strength}/5
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
