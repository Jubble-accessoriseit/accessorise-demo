"use client";

import type { ResolvedExpertBuild } from "../../lib/expert-builds/types";

type ExpertBuildCardProps = {
  build: ResolvedExpertBuild;
  isSelected: boolean;
  onCompare: () => void;
  onOpen: () => void;
};

export function ExpertBuildCard({
  build,
  isSelected,
  onCompare,
  onOpen,
}: ExpertBuildCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      style={{
        display: "grid",
        height: "100%",
        borderRadius: 20,
        overflow: "hidden",
        border: isSelected ? "1px solid #60a5fa" : "1px solid #e2e8f0",
        background: "#ffffff",
        boxShadow: isSelected
          ? "0 14px 28px rgba(37,99,235,0.12)"
          : "0 10px 22px rgba(15,23,42,0.05)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          minHeight: 156,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 8,
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.06), rgba(15,23,42,0.12) 42%, rgba(15,23,42,0.56) 100%), url(${build.primaryPhoto.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#e2e8f0",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              padding: "4px 8px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.92)",
              color: "#0f172a",
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Expert build
          </span>
          {build.credibilityBadges[0] && (
            <span
              style={{
                display: "inline-flex",
                padding: "4px 8px",
                borderRadius: 999,
                background: isSelected ? "#2563eb" : "rgba(255,255,255,0.9)",
                color: isSelected ? "#ffffff" : "#0f172a",
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              {build.credibilityBadges[0]}
            </span>
          )}
        </div>
        <div style={{ display: "grid", gap: 5 }}>
          <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.08, color: "#ffffff" }}>
            {build.title}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.88)", fontWeight: 700 }}>
            {build.fitmentLabel}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {[build.dna.purpose, build.dna.ridingStyle, build.dna.terrainFocus]
              .map((tag) => tag.replace("-", " "))
              .map((tag) => (
                <span
                  key={`${build.id}-${tag}`}
                  style={{
                    display: "inline-flex",
                    padding: "4px 7px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "#ffffff",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, padding: 15 }}>
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
            {build.builderName}
            {build.builderLocation ? `, ${build.builderLocation}` : ""}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
            {build.summary}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 6,
          }}
        >
          <MetricPill label="Accessories" value={String(build.accessoryCount)} />
          <MetricPill label="Photos" value={String(build.galleryCount)} />
          <MetricPill label="Match" value={`${build.matchSummary.matchScore}%`} />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          {build.emphasisSummary.slice(0, 3).map((entry) => (
            <div
              key={`${build.id}-${entry.category}`}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                {entry.label}
              </div>
              <div style={{ height: 7, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(entry.strength / 5) * 100}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "#2563eb",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? "#0f172a" : "#64748b", lineHeight: 1.4 }}>
            {isSelected ? "Viewing this build" : "Browse the build summary or compare it"}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpen();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 34,
                padding: "7px 11px",
                borderRadius: 999,
                border: "none",
                background: "#0f172a",
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              View details
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCompare();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 34,
                padding: "7px 11px",
                borderRadius: 999,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#0f172a",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Compare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 3,
        padding: "8px 9px",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          color: "#94a3b8",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{value}</div>
    </div>
  );
}
