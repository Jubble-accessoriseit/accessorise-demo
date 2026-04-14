"use client";

import { useMemo, useState } from "react";

import { ProductPurchaseButton } from "../commerce/ProductPurchaseButton";
import { resolveProductCommerce } from "../../lib/commerce/resolveProductCommerce";
import type { ResolvedExpertBuild } from "../../lib/expert-builds/types";

type ExpertBuildDetailProps = {
  build: ResolvedExpertBuild;
  onBack: () => void;
  onCompare: () => void;
  onOpenPurchase: (accessoryId: string) => void;
};

export function ExpertBuildDetail({
  build,
  onBack,
  onCompare,
  onOpenPurchase,
}: ExpertBuildDetailProps) {
  const bikeLabel = getExpertBuildBikeLabel(build);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const selectedPhoto = useMemo(
    () =>
      build.galleryPhotos.find((photo) => photo.id === selectedPhotoId) ??
      build.primaryPhoto,
    [build.galleryPhotos, build.primaryPhoto, selectedPhotoId]
  );

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        padding: 18,
        borderRadius: 22,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "start",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Expert Build
          </div>
          <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.08, color: "#0f172a" }}>
            {build.title}
          </h3>
          <div style={{ fontSize: 13, color: "#334155", fontWeight: 700 }}>
            {[build.builderName, build.builderLocation].filter(Boolean).join(", ")} |{" "}
            {build.fitmentLabel}
          </div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55, maxWidth: 860 }}>
            {build.summary}
          </div>
          {build.description && (
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, maxWidth: 900 }}>
              {build.description}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button" onClick={onBack} style={secondaryButtonStyle}>
            Back to builds
          </button>
          <button type="button" onClick={onCompare} style={primaryButtonStyle}>
            Compare
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 360px) minmax(0, 1fr)",
          gap: 14,
          alignItems: "start",
        }}
        >
          <div
            style={{
              display: "grid",
              gap: 10,
              position: "sticky",
              top: 96,
            }}
          >
            <div
              style={{
                minHeight: 220,
                borderRadius: 18,
                backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.38)), url(${selectedPhoto.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#e2e8f0",
              }}
            />

            {build.galleryPhotos.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))",
                  gap: 8,
                }}
              >
                {build.galleryPhotos.map((photo) => {
                  const isSelected = photo.id === selectedPhoto.id;

                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setSelectedPhotoId(photo.id)}
                      style={{
                        minHeight: 74,
                        borderRadius: 12,
                        border: isSelected ? "2px solid #2563eb" : "1px solid #dbe3ee",
                        padding: 0,
                        overflow: "hidden",
                        cursor: "pointer",
                        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.16)), url(${photo.imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: "#e2e8f0",
                        boxShadow: isSelected ? "0 0 0 3px rgba(37,99,235,0.14)" : "none",
                      }}
                      aria-label={photo.angleLabel || "Select expert build photo"}
                    />
                  );
                })}
              </div>
            )}

            <div
              style={{
                display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: 8,
            }}
          >
            <StatCard label="Accessories" value={String(build.accessoryCount)} />
            <StatCard label="Photos" value={String(build.galleryCount)} />
            <StatCard label="Match" value={`${build.matchSummary.matchScore}%`} />
            <StatCard
              label="Missing"
              value={String(build.matchSummary.missingCategories.length)}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {build.credibilityBadges.map((badge) => (
              <span
                key={`${build.id}-${badge}`}
                style={{
                  display: "inline-flex",
                  padding: "5px 8px",
                  borderRadius: 999,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#334155",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <div
            style={{
              display: "grid",
              gap: 10,
              padding: 14,
              borderRadius: 18,
              border: "1px solid #e2e8f0",
              background: "#fbfdff",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
              Build details
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
              }}
            >
              <MetaCard label="Bike" value={bikeLabel} />
              <MetaCard label="Theme" value={build.theme} />
              <MetaCard label="Builder" value={build.builderLabel} />
              <MetaCard label="Primary fit" value={build.fitmentLabel} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {build.categoryGroups.map((group) => (
              <div
                key={`${build.id}-${group.id}`}
                style={{
                  display: "grid",
                  gap: 10,
                  padding: 14,
                  borderRadius: 18,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                    {group.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                    {group.accessories.length} item{group.accessories.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {group.accessories.map((accessory) => (
                    <div
                      key={accessory.id}
                      style={{
                        display: "grid",
                        gap: 8,
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          alignItems: "start",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "grid", gap: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                            {accessory.title}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>
                            {accessory.brand}
                          </div>
                        </div>

                        {accessory.installedPhotoIds &&
                          accessory.installedPhotoIds.length > 0 && (
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
                              Seen in photo
                            </span>
                          )}
                      </div>

                      {accessory.notes && (
                        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.55 }}>
                          {accessory.notes}
                        </div>
                      )}

                      {accessory.compatibilityNotes && (
                        <div style={{ fontSize: 11, color: "#92400e", lineHeight: 1.45 }}>
                          {accessory.compatibilityNotes}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <ProductPurchaseButton
                          commerce={resolveProductCommerce({
                            product: accessory.product,
                            accessory,
                          })}
                          compact
                          onOpen={() => onOpenPurchase(accessory.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getExpertBuildBikeLabel(build: ResolvedExpertBuild) {
  const fitmentParts = [
    build.bikeFitment?.yearStart ? String(build.bikeFitment.yearStart) : null,
    build.bikeFitment?.make ?? null,
    build.bikeFitment?.model ?? null,
    build.bikeFitment?.variant ?? null,
  ].filter(Boolean);

  if (fitmentParts.length > 0) {
    return fitmentParts.join(" ");
  }

  const legacyParts = [
    typeof build.bike_year === "number" ? String(build.bike_year) : null,
    build.bike_make ?? null,
    build.bike_model ?? null,
  ].filter(Boolean);

  if (legacyParts.length > 0) {
    return legacyParts.join(" ");
  }

  return "Bike details coming soon";
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        padding: 10,
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
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
      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", lineHeight: 1.35 }}>
        {value}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        padding: 10,
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
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
      <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 36,
  padding: "8px 12px",
  borderRadius: 12,
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
} as const;

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 36,
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
} as const;
