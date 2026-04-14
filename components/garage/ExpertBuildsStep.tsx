"use client";

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
  if (!currentBike) {
    return (
      <section style={{ maxWidth: 1600, margin: "0 auto", padding: "0 10px 32px" }}>
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
    <section style={{ maxWidth: 1600, margin: "0 auto", padding: "0 10px 32px" }}>
      <div style={{ display: "grid", gap: 14 }}>
        <div
          style={{
            display: "grid",
            gap: 12,
            padding: 18,
            borderRadius: 20,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "end" }}>
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: "#64748b" }}>
                Expert Builds
              </div>
              <h3 style={{ margin: 0, fontSize: 22, color: "#0f172a", lineHeight: 1.1 }}>
                Expert Builds for {currentBike.make} {currentBike.model}
              </h3>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                Compare matched setups, spot planning gaps fast, and open Merge Studio when a build is worth borrowing from.
              </div>
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(285px, 1fr))",
                gap: 12,
                alignItems: "start",
              }}
            >
              {expertBuilds.map((build) => (
                <ExpertBuildCard
                  key={build.id}
                  build={build}
                  isSelected={false}
                  onCompare={() => onCompareExpertBuild(build.id)}
                  onOpen={() => onSelectExpertBuild(build.id)}
                />
              ))}
            </div>
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
