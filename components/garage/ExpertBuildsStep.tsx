"use client";

import { useEffect, useState } from "react";
import { ExpertBuildCard } from "./ExpertBuildCard";
import { ExpertBuildDetail } from "./ExpertBuildDetail";
import type {
  ExpertBuildPurpose,
  ResolvedExpertBuild,
} from "../../lib/expert-builds/types";
import type { Product, SupabaseBike } from "../../types/garage";

type ExpertBuildsStepProps = {
  currentBike: SupabaseBike | null;
  expertBuildPurposeFilter: ExpertBuildPurpose | "all";
  expertBuilds: ResolvedExpertBuild[];
  onChangePurposeFilter: (purpose: ExpertBuildPurpose | "all") => void;
  onCompareExpertBuild: (expertBuildId: string) => void;
  onOpenPurchase: (input: { accessoryId?: string; itemId?: string }) => void;
  onSelectExpertBuild: (expertBuildId: string) => void;
  selectedExpertBuild: ResolvedExpertBuild | null;
  selectedProducts: Product[];
};

type ExpertViewMode = "grid" | "list";

const purposeOptions: Array<{ id: ExpertBuildPurpose | "all"; label: string }> = [
  { id: "all", label: "All builds" },
  { id: "touring", label: "Touring" },
  { id: "adventure", label: "Adventure" },
  { id: "off-road", label: "Off-road" },
  { id: "commuter", label: "Commuter" },
  { id: "mixed", label: "Mixed" },
];

export function ExpertBuildsStep({
  currentBike,
  expertBuildPurposeFilter,
  expertBuilds,
  onChangePurposeFilter,
  onCompareExpertBuild,
  onOpenPurchase,
  onSelectExpertBuild,
  selectedExpertBuild,
  selectedProducts,
}: ExpertBuildsStepProps) {
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ExpertViewMode>("grid");
  const isPhone = viewportWidth !== null ? viewportWidth < 820 : false;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setViewportWidth(window.innerWidth);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!currentBike) {
    return (
      <section style={{ maxWidth: 1600, margin: "0 auto", padding: isPhone ? "0 0 28px" : "0 10px 32px" }}>
        <div
          style={{
            display: "grid",
            gap: 8,
            padding: 22,
            borderRadius: 22,
            border: "1px dashed #cbd5e1",
            background: "#ffffff",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
            Choose a bike to unlock Expert Builds
          </div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, maxWidth: 720 }}>
            Pick a bike first, then compare real-world setups, inspect why they work, and borrow ideas without changing your current build.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 1600, margin: "0 auto", padding: isPhone ? "0 0 28px" : "0 10px 32px" }}>
      <div style={{ display: "grid", gap: 10 }}>
        <div
          style={{
            display: "grid",
            gap: 10,
            padding: isPhone ? 12 : 14,
            borderRadius: 18,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "end" }}>
              <div style={{ display: "grid", gap: 3 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: "#64748b" }}>
                Expert Builds
              </div>
                <h3 style={{ margin: 0, fontSize: isPhone ? 18 : 20, color: "#0f172a", lineHeight: 1.1 }}>
                  Expert Builds for {currentBike.make} {currentBike.model}
                </h3>
              </div>
            <div style={{ display: "grid", gap: 5, justifyItems: "end" }}>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 800, letterSpacing: 0.55, textTransform: "uppercase" }}>
                Current shortlist
              </div>
              <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
                <SummaryPill label={`${selectedProducts.length} in your build`} />
                <SummaryPill label={`${expertBuilds.length} matched builds`} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {purposeOptions.map((option) => {
              const isActive = expertBuildPurposeFilter === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onChangePurposeFilter(option.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 34,
                    padding: "7px 11px",
                    borderRadius: 999,
                    border: isActive ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                    background: isActive ? "#eff6ff" : "#ffffff",
                    color: isActive ? "#1d4ed8" : "#334155",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              paddingTop: 2,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                gap: 6,
                padding: 4,
                borderRadius: 999,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              {(["grid", "list"] as const).map((mode) => {
                const isActive = viewMode === mode;

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 32,
                      padding: "7px 12px",
                      borderRadius: 999,
                      border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
                      background: isActive ? "#ffffff" : "transparent",
                      color: isActive ? "#0f172a" : "#64748b",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: isActive ? "0 1px 2px rgba(15,23,42,0.05)" : "none",
                    }}
                  >
                    {mode === "grid" ? "Grid" : "List"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {expertBuilds.length === 0 ? (
          <div
            style={{
              display: "grid",
              gap: 8,
              padding: 22,
              borderRadius: 22,
              border: "1px dashed #cbd5e1",
              background: "#f8fafc",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              No expert builds yet for this bike
            </div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, maxWidth: 760 }}>
              We do not have a curated build for this bike yet. Keep building your setup now, and this is where future editorial or community builds will appear.
            </div>
          </div>
        ) : selectedExpertBuild ? (
          <ExpertBuildDetail
            build={selectedExpertBuild}
            onBack={() => onSelectExpertBuild("")}
            onCompare={() => onCompareExpertBuild(selectedExpertBuild.id)}
            onOpenPurchase={(accessoryId) => onOpenPurchase({ accessoryId })}
          />
        ) : (
          <>
            {viewMode === "grid" ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "stretch",
                  justifyContent: "flex-start",
                }}
              >
                {expertBuilds.map((build) => (
                  <div
                    key={build.id}
                    style={{
                      flex: "1 1 285px",
                      width: "min(100%, 320px)",
                      maxWidth: 320,
                    }}
                  >
                    <ExpertBuildCard
                      build={build}
                      isSelected={false}
                      onCompare={() => onCompareExpertBuild(build.id)}
                      onOpen={() => onSelectExpertBuild(build.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {expertBuilds.map((build) => (
                  <ExpertBuildListRow
                    key={build.id}
                    build={build}
                    isPhone={isPhone}
                    onCompare={() => onCompareExpertBuild(build.id)}
                    onOpen={() => onSelectExpertBuild(build.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function SummaryPill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "5px 9px",
        borderRadius: 999,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#334155",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 0.2,
      }}
    >
      {label}
    </span>
  );
}

function ExpertBuildListRow({
  build,
  isPhone,
  onCompare,
  onOpen,
}: {
  build: ResolvedExpertBuild;
  isPhone: boolean;
  onCompare: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      style={{
        display: "grid",
        gridTemplateColumns: isPhone ? "minmax(0, 1fr)" : "88px minmax(0, 1fr)",
        gap: isPhone ? 12 : 14,
        alignItems: "start",
        padding: isPhone ? 12 : 14,
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: isPhone ? "100%" : 88,
          height: isPhone ? 176 : 88,
          borderRadius: isPhone ? 18 : 16,
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.06), rgba(15,23,42,0.3)), url(${build.primaryPhoto.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#e2e8f0",
        }}
      />

      <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
          <div style={{ display: "grid", gap: 5, minWidth: 0, flex: "1 1 320px" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span
                style={{
                  display: "inline-flex",
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                Expert build
              </span>
              {build.credibilityBadges[0] ? (
                <span
                  style={{
                    display: "inline-flex",
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {build.credibilityBadges[0]}
                </span>
              ) : null}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.15, color: "#0f172a", overflowWrap: "anywhere" }}>
              {build.title}
            </div>
            <div style={{ fontSize: 12, color: "#334155", fontWeight: 700, lineHeight: 1.45 }}>
              {build.fitmentLabel}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
              {[build.builderName, build.builderLocation].filter(Boolean).join(", ")}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
              {build.summary}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 8,
              minWidth: isPhone ? "100%" : "min(100%, 210px)",
              flex: isPhone ? "1 1 100%" : "0 1 230px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 6,
              }}
            >
              <SummaryMetric value={String(build.accessoryCount)} label="Accessories" />
              <SummaryMetric value={String(build.galleryCount)} label="Photos" />
              <SummaryMetric value={`${build.matchSummary.matchScore}%`} label="Match" />
            </div>
            <div style={{ display: "grid", gap: 8 }}>
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
                  minHeight: isPhone ? 40 : 36,
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "none",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: 12,
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
                  minHeight: isPhone ? 40 : 36,
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Compare
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[build.dna.purpose, build.dna.ridingStyle, build.dna.terrainFocus].map((tag) => (
            <span
              key={`${build.id}-${tag}`}
              style={{
                display: "inline-flex",
                padding: "4px 8px",
                borderRadius: 999,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {tag.replace("-", " ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
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
