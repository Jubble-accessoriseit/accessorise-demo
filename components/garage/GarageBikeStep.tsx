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
  onOpenGarageBuildInWorkspace: (buildId: string) => void;
  onSelectMake: (value: string) => void;
  onSelectModel: (value: string) => void;
  onSelectSeries: (value: string) => void;
  onSelectTemplateBike: (bikeId: string) => void;
  onSelectYear: (value: string) => void;
  selectedBike: SupabaseBike | null;
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
  borderRadius: 24,
  padding: 18,
  border: "1px solid rgba(226,232,240,0.95)",
  boxShadow: "0 14px 30px rgba(15,23,42,0.07)",
};

function BikeFilterField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div style={{ display: "grid", gap: 5 }}>
      <label
        style={{
          fontSize: 12,
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
        minHeight: 46,
        padding: "11px 14px",
        borderRadius: 14,
        border: "1px solid #cbd5e1",
        background: disabled ? "#f3f4f6" : "#ffffff",
        fontSize: 14,
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
  onOpenGarageBuildInWorkspace,
  onSelectMake,
  onSelectModel,
  onSelectSeries,
  onSelectTemplateBike,
  onSelectYear,
  selectedBike,
  selectedBikeId,
  selectedMake,
  selectedModel,
  selectedSeries,
  selectedYear,
  seriesOptions,
  yearOptions,
}: GarageBikeStepProps) {
  return (
    <GarageStepShell isPhone={isPhone}>
      <section
        style={{
          display: "grid",
          gap: 16,
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
            <GarageSectionHeader
              eyebrow="Bike"
              title="Select your bike"
              description="Choose a bike template or jump back into a saved Garage build."
            />

            <div
              style={{
                display: "grid",
                gap: 8,
                marginBottom: 16,
                padding: 14,
                borderRadius: 18,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
              }}
            >
              <div style={garageEyebrowStyle}>Resume from Garage</div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                Pick up where you left off without rebuilding your context.
              </div>
              <select
                defaultValue=""
                onChange={(event) => {
                  const buildId = event.target.value;
                  if (!buildId) return;
                  onOpenGarageBuildInWorkspace(buildId);
                  event.currentTarget.value = "";
                }}
                style={{
                  minHeight: 44,
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: 14,
                  color: "#0f172a",
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                }}
              >
                <option value="">
                  {garageResumeEntries.length === 0
                    ? "No saved Garage builds yet"
                    : "Choose a saved bike and build"}
                </option>
                {garageResumeEntries.map((entry) => (
                  <option key={entry.key} value={entry.buildId}>
                    {entry.bikeName} - {entry.buildName}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
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
                      {`${year} - ${selectedMake} ${selectedSeries}${
                        selectedModel !== "Base" ? ` ${selectedModel}` : ""
                      }`}
                    </option>
                  ))}
                </BikeSelect>
              </BikeFilterField>
            </div>

            {selectedBikeId ? (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 18,
                  border: "1px solid #dbeafe",
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, #eff6ff 100%)",
                }}
              >
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
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
            ) : null}

            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <div style={garageEyebrowStyle}>Matching bikes</div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>{bikeStepHelperText}</div>
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
                      padding: "14px 16px",
                      borderRadius: 18,
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
                      padding: "14px 16px",
                      borderRadius: 18,
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
                    const isSelected = selectedBikeId === bike.id;

                    return (
                      <button
                        key={bike.id}
                        type="button"
                        onClick={() => onSelectTemplateBike(bike.id)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "112px minmax(0, 1fr)",
                          alignItems: "stretch",
                          gap: 14,
                          width: "100%",
                          padding: 12,
                          borderRadius: 20,
                          border: isSelected ? "1px solid #0f172a" : "1px solid #e5e7eb",
                          background: isSelected
                            ? "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)"
                            : "linear-gradient(135deg, #ffffff 0%, #fcfdff 100%)",
                          textAlign: "left",
                          cursor: "pointer",
                          boxShadow: isSelected
                            ? "0 18px 34px rgba(15,23,42,0.14)"
                            : "0 6px 18px rgba(15,23,42,0.05)",
                        }}
                      >
                        <div
                          style={{
                            minHeight: 84,
                            borderRadius: 16,
                            overflow: "hidden",
                            border: isSelected ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
                            background: `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.16)), url(${bikeImage}) center/cover`,
                          }}
                        />

                        <div style={{ minWidth: 0, display: "grid", gap: 8, alignContent: "center" }}>
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
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: "#111827",
                                  lineHeight: 1.2,
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {getBikeOptionLabel(bike)}
                              </div>
                              <div style={{ marginTop: 3, fontSize: 12, color: "#64748b", lineHeight: 1.35 }}>
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
              <div style={{ ...garageEyebrowStyle, marginBottom: 6 }}>Garage workspace</div>
              <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.12, color: "#0f172a" }}>
                Here is your bike. Next, build around it.
              </h3>
              <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.5, color: "#64748b" }}>
                Keep the selector in view, confirm the active bike, and move into Build when you are ready.
              </p>
            </div>

            <div
              style={{
                minHeight: isPhone ? 220 : 320,
                borderRadius: 22,
                overflow: "hidden",
                border: "1px solid rgba(226,232,240,0.9)",
                background:
                  heroImage && selectedBike
                    ? `linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.22)), url(${heroImage}) center/cover`
                    : "#e2e8f0",
                boxShadow: "0 10px 26px rgba(15,23,42,0.08)",
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              {!heroImage || !selectedBike ? (
                <img
                  src="https://exieufhwbrbeilmjltny.supabase.co/storage/v1/object/public/app-assets/garage/garage-workshop-motorcycle-wall-v1.png"
                  alt="Garage workshop with motorcycles and accessory wall"
                  style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isPhone ? "1fr" : "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 16,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ ...garageEyebrowStyle, marginBottom: 4 }}>Start here</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.35 }}>
                  Pick a template or resume a saved build
                </div>
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 16,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ ...garageEyebrowStyle, marginBottom: 4 }}>Next step</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.35 }}>
                  Continue to Build once the right bike is selected
                </div>
              </div>
            </div>
          </aside>
        </div>

        {selectedBikeId ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(2, minmax(0, 1fr))" : "1fr",
              gap: 16,
            }}
          >
            <div
              style={{
                ...selectorCardStyle,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div>
                <div style={{ ...garageEyebrowStyle, marginBottom: 6 }}>Bike preview</div>
                <h2 style={{ margin: 0, fontSize: 26, lineHeight: 1.08, color: "#0f172a" }}>
                  {selectedBike ? `${selectedBike.make} ${selectedBike.model}` : "Selected bike preview"}
                </h2>
                <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                  Review the active bike before moving into the build studio.
                </p>
              </div>

              <div
                style={{
                  minHeight: 240,
                  borderRadius: 22,
                  overflow: "hidden",
                  background: heroImage
                    ? `linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.22)), url(${heroImage}) center/cover`
                    : "linear-gradient(135deg, #dbeafe 0%, #eff6ff 45%, #e2e8f0 100%)",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    padding: 18,
                    background: "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.72) 100%)",
                    color: "#ffffff",
                  }}
                >
                  <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", opacity: 0.82 }}>
                    Selected bike
                  </div>
                  <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, lineHeight: 1.04 }}>
                    {selectedBike
                      ? `${selectedBike.year} ${selectedBike.make} ${selectedBike.model}`
                      : "Select a bike to preview it here"}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                ...selectorCardStyle,
                display: "grid",
                gap: 14,
                alignContent: "start",
              }}
            >
              <div>
                <div style={{ ...garageEyebrowStyle, marginBottom: 6 }}>Bike summary</div>
                <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.08, color: "#0f172a" }}>Active bike</h3>
                <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                  Confirm the details, then move into Build with confidence.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 10,
                }}
              >
                {[
                  ["Make", selectedBike?.make || selectedMake || "Not selected"],
                  ["Model", selectedBike?.model || selectedSeries || "Not selected"],
                  ["Variant", selectedBike?.variant || selectedModel || "Not selected"],
                  ["Year", selectedBike?.year || selectedYear || "Not selected"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: 12,
                      borderRadius: 18,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ ...garageEyebrowStyle, marginBottom: 6 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", lineHeight: 1.4 }}>{value}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 18,
                  background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
                  border: "1px solid #dbeafe",
                }}
              >
                <div style={{ ...garageEyebrowStyle, marginBottom: 6 }}>Build readiness</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}>
                  {selectedMake && selectedSeries && selectedModel && selectedYear
                    ? `${selectedYear} ${selectedMake} ${selectedSeries}${
                        selectedModel !== "Base" ? ` ${selectedModel}` : ""
                      }`
                    : "No bike selected yet"}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
                  {compatibleCount} compatible accessories currently match this bike.
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </GarageStepShell>
  );
}
