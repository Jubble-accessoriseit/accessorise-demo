"use client";

import type { ReactNode, SelectHTMLAttributes } from "react";
import {
  GarageSectionHeader,
  GarageStepShell,
  garageEyebrowStyle,
  garagePrimaryButtonStyle,
  garageSecondaryButtonStyle,
} from "./GarageLayout";
import { resolveGarageBikeImage } from "../../lib/garage/bike-images";
import type { GarageResumeEntry, SupabaseBike } from "../../types/garage";

type ModelOption = {
  label: string;
  value: string;
};

type GarageBikeStepProps = {
  bikeStepFilteredBikeOptions: SupabaseBike[];
  bikeStepHelperText: string;
  compatibleCount: number;
  garageResumeEntries: GarageResumeEntry[];
  getBikeOptionLabel: (bike: SupabaseBike) => string;
  heroImage: string | null;
  isBikeStepBlankState: boolean;
  isDesktop: boolean;
  isPhone: boolean;
  isSelectedBikeSavedGarageBike: boolean;
  makeOptions: string[];
  modelOptions: ModelOption[];
  onClearBikeSelection: () => void;
  onContinueToBuild: () => void;
  onSelectGarageResumeEntry: (buildId: string) => void;
  onSelectMake: (value: string) => void;
  onSelectModel: (value: string) => void;
  onSelectSeries: (value: string) => void;
  onSelectTemplateBike: (bikeId: string) => void;
  onSelectYear: (value: string) => void;
  previewBike: SupabaseBike | null;
  isSelectionInProgress: boolean;
  selectedBike: SupabaseBike | null;
  selectedBikeCardId: string | null;
  selectedBikeId: string | null;
  selectedMake: string;
  selectedModel: string;
  selectedSeries: string;
  selectedYear: string;
  seriesOptions: string[];
  yearOptions: Array<string | number>;
};

const selectorCardStyle = {
  background: "rgba(255,255,255,0.92)",
  borderRadius: 20,
  padding: 14,
  border: "1px solid rgba(226,232,240,0.95)",
  boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
};

function BikeFilterField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <label
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#475569",
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function BikeSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { disabled, style, ...rest } = props;

  return (
    <select
      disabled={disabled}
      style={{
        minHeight: 40,
        padding: "9px 11px",
        borderRadius: 12,
        border: "1px solid #cbd5e1",
        background: disabled ? "#f3f4f6" : "#ffffff",
        fontSize: 13,
        outline: "none",
        width: "100%",
        color: disabled ? "#9ca3af" : "#111827",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        ...style,
      }}
      {...rest}
    />
  );
}

export function GarageBikeStep({
  bikeStepFilteredBikeOptions,
  bikeStepHelperText,
  compatibleCount,
  garageResumeEntries,
  getBikeOptionLabel,
  heroImage,
  isBikeStepBlankState,
  isDesktop,
  isPhone,
  isSelectedBikeSavedGarageBike,
  makeOptions,
  modelOptions,
  onClearBikeSelection,
  onContinueToBuild,
  onSelectGarageResumeEntry,
  onSelectMake,
  onSelectModel,
  onSelectSeries,
  onSelectTemplateBike,
  onSelectYear,
  previewBike,
  isSelectionInProgress,
  selectedBike,
  selectedBikeCardId,
  selectedBikeId,
  selectedMake,
  selectedModel,
  selectedSeries,
  selectedYear,
  seriesOptions,
  yearOptions,
}: GarageBikeStepProps) {
  const shouldShowMatchingBikes = !selectedBikeId || isSelectionInProgress;

  return (
    <GarageStepShell isPhone={isPhone}>
      <section
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "minmax(0, 1.15fr) minmax(300px, 0.72fr)" : "1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div style={selectorCardStyle}>
            <GarageSectionHeader eyebrow="Bike" title="Select your bike" />

            <div
              style={{
                display: "grid",
                gap: 6,
                marginBottom: 12,
                padding: 12,
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
              }}
            >
              <div style={garageEyebrowStyle}>Resume from Garage</div>
              <select
                defaultValue=""
                onChange={(event) => {
                  const buildId = event.target.value;
                  if (!buildId) return;
                  onSelectGarageResumeEntry(buildId);
                  event.currentTarget.value = "";
                }}
                style={{
                  minHeight: 40,
                  padding: "9px 11px",
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: 13,
                  color: "#0f172a",
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                }}
              >
                <option value="">
                  {garageResumeEntries.length === 0
                    ? "No saved Garage builds yet"
                    : "Choose a saved bike"}
                </option>
                {garageResumeEntries.map((entry) => (
                  <option key={entry.key} value={entry.buildId}>
                    {entry.optionLabel}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
                alignItems: "end",
              }}
            >
              <BikeFilterField label="Make">
                <BikeSelect value={selectedMake} onChange={(event) => onSelectMake(event.target.value)}>
                  <option value="">Select Make</option>
                  {makeOptions.map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </BikeSelect>
              </BikeFilterField>

              <BikeFilterField label="Model">
                <BikeSelect
                  value={selectedSeries}
                  onChange={(event) => onSelectSeries(event.target.value)}
                  disabled={!selectedMake}
                >
                  <option value="">Select Model</option>
                  {seriesOptions.map((series) => (
                    <option key={series} value={series}>
                      {series}
                    </option>
                  ))}
                </BikeSelect>
              </BikeFilterField>

              <BikeFilterField label="Variant">
                <BikeSelect
                  value={selectedModel}
                  onChange={(event) => onSelectModel(event.target.value)}
                  disabled={!selectedSeries || modelOptions.length === 0}
                >
                  <option value="">
                    {!selectedSeries
                      ? "Select Model first"
                      : modelOptions.length === 0
                      ? "No variants available"
                      : "Select Variant"}
                  </option>
                  {modelOptions.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </BikeSelect>
              </BikeFilterField>

              <BikeFilterField label="Year">
                <BikeSelect
                  value={selectedYear}
                  onChange={(event) => onSelectYear(event.target.value)}
                  disabled={!selectedModel || yearOptions.length === 0}
                >
                  <option value="">
                    {!selectedModel
                      ? "Select Variant first"
                      : yearOptions.length === 0
                      ? "No years available"
                      : "Select Year"}
                  </option>
                  {yearOptions.map((year) => (
                    <option key={String(year)} value={String(year)}>
                      {String(year)}
                    </option>
                  ))}
                </BikeSelect>
              </BikeFilterField>
            </div>

            {selectedBikeId && !isSelectionInProgress ? (
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid #dbeafe",
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, #eff6ff 100%)",
                }}
              >
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                  {isSelectedBikeSavedGarageBike
                    ? "Saved Garage bike selected. Continue editing or switch back to template browsing."
                    : "Bike template selected. You can move straight into Build now."}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isPhone ? "1fr" : "minmax(0, 1fr) auto",
                    gap: 10,
                  }}
                >
                  <button type="button" onClick={onContinueToBuild} style={garagePrimaryButtonStyle}>
                    Continue to Build
                  </button>
                  <button type="button" onClick={onClearBikeSelection} style={garageSecondaryButtonStyle}>
                    Clear selection
                  </button>
                </div>
              </div>
            ) : isSelectionInProgress ? (
              <div
                style={{
                  display: "grid",
                  gap: 6,
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <div style={{ ...garageEyebrowStyle }}>Selection in progress</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                  Choose the remaining fields to confirm your next bike. The previous bike will not stay active while you are changing selection.
                </div>
              </div>
            ) : null}

            {shouldShowMatchingBikes ? (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={garageEyebrowStyle}>Matching bikes</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.35 }}>{bikeStepHelperText}</div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isPhone ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 12,
                  }}
                >
                  {isBikeStepBlankState ? (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 16,
                        border: "1px solid #e2e8f0",
                        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                        Choose your bike
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.45 }}>
                        Start with a make, then narrow by model, variant, and year.
                      </div>
                    </div>
                  ) : bikeStepFilteredBikeOptions.length === 0 ? (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 16,
                        border: "1px solid #e2e8f0",
                        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                        No bikes found
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.45 }}>
                        Try broadening one of the filters.
                      </div>
                    </div>
                  ) : (
                    bikeStepFilteredBikeOptions.map((bike) => {
                      const bikeImage = resolveGarageBikeImage(bike);
                      const isSelected = selectedBikeCardId === bike.id;

                      return (
                        <button
                          key={bike.id}
                          type="button"
                          onClick={() => onSelectTemplateBike(bike.id)}
                          style={{
                            display: "grid",
                            gridTemplateColumns: isPhone ? "96px minmax(0, 1fr)" : "104px minmax(0, 1fr)",
                            alignItems: "stretch",
                            gap: 12,
                            width: "100%",
                            padding: 10,
                            borderRadius: 18,
                            border: isSelected ? "1px solid #0f172a" : "1px solid #e5e7eb",
                            background: isSelected
                              ? "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)"
                              : "linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)",
                            textAlign: "left",
                            cursor: "pointer",
                            boxShadow: isSelected
                              ? "0 12px 24px rgba(15,23,42,0.12)"
                              : "0 4px 12px rgba(15,23,42,0.05)",
                          }}
                        >
                          <div
                            style={{
                              minHeight: isPhone ? 72 : 80,
                              borderRadius: 14,
                              overflow: "hidden",
                              border: isSelected ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
                              background: `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.16)), url(${bikeImage}) center/cover`,
                            }}
                          />

                          <div style={{ minWidth: 0, display: "grid", gap: 6, alignContent: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 12,
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 800,
                                    color: "#111827",
                                    lineHeight: 1.2,
                                    overflowWrap: "anywhere",
                                  }}
                                >
                                  {getBikeOptionLabel(bike)}
                                </div>
                                <div style={{ marginTop: 2, fontSize: 11, color: "#64748b", lineHeight: 1.3 }}>
                                  {bike.year} model
                                </div>
                              </div>
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 999,
                                  display: "grid",
                                  placeItems: "center",
                                  background: isSelected ? "#0f172a" : "#f8fafc",
                                  border: isSelected ? "none" : "1px solid #e2e8f0",
                                  color: isSelected ? "#ffffff" : "#94a3b8",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {isSelected ? "✓" : "→"}
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "5px 9px",
                                  borderRadius: 999,
                                  background: isSelected ? "#dbeafe" : "#f8fafc",
                                  border: isSelected ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: isSelected ? "#1d4ed8" : "#475569",
                                }}
                              >
                                {bike.category || "Adventure"}
                              </div>
                              {bike.variant ? (
                                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.35 }}>
                                  {bike.variant}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <aside
            style={{
              ...selectorCardStyle,
              padding: isPhone ? 16 : 18,
              alignContent: "start",
              display: "grid",
              gap: 14,
            }}
          >
            <div>
              <div style={{ ...garageEyebrowStyle, marginBottom: 4 }}>Bike preview</div>
              <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.12, color: "#0f172a" }}>
                {previewBike ? `${previewBike.make} ${previewBike.model}` : "Ready for Build"}
              </h3>
            </div>

            <div
              style={{
                minHeight: isPhone ? 180 : 260,
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid rgba(226,232,240,0.9)",
                background:
                  heroImage && previewBike
                    ? `linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.22)), url(${heroImage}) center/cover`
                    : "#e2e8f0",
                boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              {!heroImage || !previewBike ? (
                <img
                  src="https://exieufhwbrbeilmjltny.supabase.co/storage/v1/object/public/app-assets/garage/garage-workshop-motorcycle-wall-v1.png"
                  alt="Garage workshop with motorcycles and accessory wall"
                  style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
            </div>

            {(selectedBikeId || isSelectionInProgress) ? (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  alignContent: "start",
                }}
              >
                <div>
                  <div style={{ ...garageEyebrowStyle, marginBottom: 4 }}>Bike summary</div>
                  <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.08, color: "#0f172a" }}>
                    {isSelectionInProgress ? "Draft bike" : "Active bike"}
                  </h3>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  {[
                    ["Make", previewBike?.make || selectedMake || "Not selected"],
                    ["Model", previewBike?.model || selectedSeries || "Not selected"],
                    ["Variant", previewBike?.variant || selectedModel || "Not selected"],
                    ["Year", previewBike?.year || selectedYear || "Not selected"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        padding: 10,
                        borderRadius: 14,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ ...garageEyebrowStyle, marginBottom: 6 }}>{label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", lineHeight: 1.35 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
                    border: "1px solid #dbeafe",
                  }}
                >
                  <div style={{ ...garageEyebrowStyle, marginBottom: 4 }}>Build readiness</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}>
                    {selectedMake && selectedSeries && selectedModel && selectedYear
                      ? `${selectedYear} ${selectedMake} ${selectedSeries}${
                          selectedModel !== "Base" ? ` ${selectedModel}` : ""
                        }`
                      : "No bike selected yet"}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, color: "#64748b", lineHeight: 1.35 }}>
                    {compatibleCount} compatible accessories currently match this bike.
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </GarageStepShell>
  );
}
