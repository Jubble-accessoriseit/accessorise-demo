"use client";

import type { ResolvedExpertBuild } from "../../lib/expert-builds/types";

type ExpertBuildMatchSummaryProps = {
  build: ResolvedExpertBuild;
};

export function ExpertBuildMatchSummary({
  build,
}: ExpertBuildMatchSummaryProps) {
  const summary = build.matchSummary;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 8,
        }}
      >
        {[
          {
            label: "Match",
            value: `${summary.matchScore}%`,
            tone: "#eff6ff",
            color: "#1d4ed8",
          },
          {
            label: "Direct overlaps",
            value: `${summary.directOverlapCount}/${summary.comparableAccessoryCount}`,
            tone: "#dcfce7",
            color: "#166534",
          },
          {
            label: "Category coverage",
            value: `${summary.categoryCoverageCount}/${summary.categoryCoverageTotal}`,
            tone: "#f8fafc",
            color: "#0f172a",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "grid",
              gap: 6,
              padding: 12,
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                color: "#94a3b8",
              }}
            >
              {item.label}
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "7px 10px",
                borderRadius: 12,
                background: item.tone,
                color: item.color,
                fontSize: 18,
                fontWeight: 800,
                width: "fit-content",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        <BucketCard
          title="Already covered"
          items={summary.alreadyHaveAccessories.map((item) => item.title)}
          emptyLabel="No direct product overlaps yet."
          tone="#dcfce7"
          color="#166534"
        />
        <BucketCard
          title="Missing from my build"
          items={summary.missingAccessories.slice(0, 5).map((item) => item.title)}
          emptyLabel="You already cover this build well."
          tone="#dbeafe"
          color="#1d4ed8"
        />
        <BucketCard
          title="Different categories"
          items={summary.differentCategories}
          emptyLabel="No category differences detected."
          tone="#fef3c7"
          color="#92400e"
        />
      </div>
    </div>
  );
}

function BucketCard({
  color,
  emptyLabel,
  items,
  title,
  tone,
}: {
  color: string;
  emptyLabel: string;
  items: string[];
  title: string;
  tone: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: 12,
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          width: "fit-content",
          padding: "5px 8px",
          borderRadius: 999,
          background: tone,
          color,
          fontSize: 10,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {title}
      </div>
      {items.length === 0 ? (
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
          {emptyLabel}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {items.map((item) => (
            <span
              key={`${title}-${item}`}
              style={{
                display: "inline-flex",
                padding: "5px 8px",
                borderRadius: 999,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#334155",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
