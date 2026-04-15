"use client";

import { useEffect, useState } from "react";
import { GarageStepShell } from "./GarageLayout";

import type {
  CompareCategorySection,
  CompareFilter,
  CompareFilterMeta,
  Product,
  SupabaseBike,
} from "../../types/garage";
import type { ResolvedExpertBuild } from "../../lib/expert-builds/types";

type CompareBuildsStepProps = {
  activeCompareFilter: CompareFilter;
  activeCompareFilterMeta: CompareFilterMeta;
  addToBuild: (product: Product) => void;
  compareCategorySections: CompareCategorySection[];
  compareFilterCounts: Record<CompareFilter, number>;
  currentBike: SupabaseBike | undefined;
  filteredCompareCategorySections: CompareCategorySection[];
  formatCurrency: (value: number) => string;
  getProductSupplierName: (product: Product) => string;
  heroImage: string;
  isBuildDirty: boolean;
  onChangeExpertBuild: () => void;
  onFilterChange: (filter: CompareFilter) => void;
  onSaveBuild: () => void;
  selectedExpertBuild: ResolvedExpertBuild | null;
  selectedProducts: Product[];
};

const compareFilterOptions: Array<{ id: CompareFilter; label: string }> = [
  { id: "all", label: "All items" },
  { id: "missing", label: "Missing from your build" },
  { id: "different", label: "Different items" },
  { id: "matches", label: "Matches" },
  { id: "yours-only", label: "Only in your build" },
];

export function CompareBuildsStep({
  activeCompareFilter,
  activeCompareFilterMeta,
  addToBuild,
  compareCategorySections,
  compareFilterCounts,
  currentBike,
  filteredCompareCategorySections,
  formatCurrency,
  getProductSupplierName,
  isBuildDirty,
  onChangeExpertBuild,
  onFilterChange,
  onSaveBuild,
  selectedExpertBuild,
  selectedProducts,
}: CompareBuildsStepProps) {
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const visibleRowCount = filteredCompareCategorySections.reduce(
    (total, section) => total + section.rows.length,
    0
  );
  const isPhone = viewportWidth !== null ? viewportWidth < 820 : false;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setViewportWidth(window.innerWidth);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <GarageStepShell isPhone={isPhone}>
      <div style={{ display: "grid", gap: 16 }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: 16,
            boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
            display: "grid",
            gap: 14,
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
            <div style={{ display: "grid", gap: 4 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  color: "#64748b",
                }}
              >
                Comparison target
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 20,
                  color: "#0f172a",
                  lineHeight: 1.15,
                }}
              >
                {selectedExpertBuild
                  ? selectedExpertBuild.name
                  : "Choose an expert build to compare"}
              </h3>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  lineHeight: 1.45,
                  maxWidth: 820,
                }}
              >
                {selectedExpertBuild
                  ? "Your current build is being compared against the selected expert build. Filter the rows, review differences, and save an updated build from here."
                  : "Browse matched expert builds first, then return here for the full side-by-side comparison flow."}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={onSaveBuild}
                disabled={selectedProducts.length === 0 || !isBuildDirty}
                style={{
                  minHeight: 36,
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    selectedProducts.length === 0 || !isBuildDirty ? "#94a3b8" : "#0f172a",
                  color: "#ffffff",
                  fontWeight: 800,
                  cursor:
                    selectedProducts.length === 0 || !isBuildDirty
                      ? "not-allowed"
                      : "pointer",
                  opacity: selectedProducts.length === 0 || !isBuildDirty ? 0.8 : 1,
                }}
              >
                Save updated build
              </button>
              <button
                type="button"
                onClick={onChangeExpertBuild}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 34,
                  padding: "7px 11px",
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#111827",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Change Expert Build
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            <ContextPill
              label="Your bike"
              value={
                currentBike ? `${currentBike.make} ${currentBike.model}` : "No bike selected"
              }
            />
            <ContextPill
              label="Your build"
              value={`${selectedProducts.length} accessory${selectedProducts.length === 1 ? "" : "ies"}`}
            />
            <ContextPill
              label="Expert build"
              value={selectedExpertBuild ? selectedExpertBuild.name : "Not selected yet"}
            />
            <ContextPill
              label="Builder"
              value={selectedExpertBuild?.builderLabel || "Expert source"}
            />
          </div>

          {selectedExpertBuild ? (
            <div
              style={{
                display: "grid",
                gap: 10,
                padding: 12,
                borderRadius: 18,
                border: "1px solid #e2e8f0",
                background: "#fbfdff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                  {activeCompareFilterMeta.title}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
                  {activeCompareFilterMeta.emptyBody}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {compareFilterOptions.map((filter) => {
                  const isActive = activeCompareFilter === filter.id;
                  const count = compareFilterCounts[filter.id];
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => onFilterChange(filter.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        minHeight: 34,
                        padding: "7px 11px",
                        borderRadius: 999,
                        border: isActive ? "1px solid #0f172a" : "1px solid #dbe3ee",
                        background: isActive ? "#0f172a" : "#ffffff",
                        color: isActive ? "#ffffff" : "#334155",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        boxShadow: isActive
                          ? "0 10px 20px rgba(15,23,42,0.14)"
                          : "none",
                      }}
                    >
                      <span>{filter.label}</span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 22,
                          height: 22,
                          padding: "0 6px",
                          borderRadius: 999,
                          background: isActive ? "rgba(255,255,255,0.18)" : "#f1f5f9",
                          color: isActive ? "#ffffff" : "#475569",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {!selectedExpertBuild ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: 20,
              padding: 18,
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              Select an expert build first
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#64748b",
                lineHeight: 1.55,
                maxWidth: 720,
              }}
            >
              Expert Builds now lives in its own tab so you can browse matched builds without
              cluttering the comparison workspace.
            </div>
            <div>
              <button
                type="button"
                onClick={onChangeExpertBuild}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 36,
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "none",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Browse Expert Builds
              </button>
            </div>
          </div>
        ) : compareCategorySections.length === 0 ? (
          <div
            style={{
              border: "1px dashed #cbd5e1",
              borderRadius: 18,
              padding: 20,
              background: "#f8fafc",
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            Select an expert build to start comparing category recommendations for this bike.
          </div>
        ) : filteredCompareCategorySections.length === 0 ? (
          <div
            style={{
              border: "1px dashed #cbd5e1",
              borderRadius: 18,
              padding: 22,
              background: "#f8fafc",
              color: "#64748b",
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              {activeCompareFilterMeta.emptyTitle}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>{activeCompareFilterMeta.emptyBody}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                Comparison results
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {visibleRowCount} visible row{visibleRowCount === 1 ? "" : "s"}
              </div>
            </div>
            <div style={{ display: "grid", gap: 18 }}>
              {filteredCompareCategorySections.map((section) => (
                <CompareSectionCard
                  key={section.categoryId}
                  addToBuild={addToBuild}
                  formatCurrency={formatCurrency}
                  getProductSupplierName={getProductSupplierName}
                  isPhone={isPhone}
                  section={section}
                  selectedProducts={selectedProducts}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </GarageStepShell>
  );
}

function ContextPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "9px 11px",
        borderRadius: 14,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        display: "grid",
        gap: 2,
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
      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.35 }}>
        {value}
      </div>
    </div>
  );
}

function CompareSectionCard({
  addToBuild,
  formatCurrency,
  getProductSupplierName,
  isPhone,
  section,
  selectedProducts,
}: {
  addToBuild: (product: Product) => void;
  formatCurrency: (value: number) => string;
  getProductSupplierName: (product: Product) => string;
  isPhone: boolean;
  section: CompareCategorySection;
  selectedProducts: Product[];
}) {
  if (isPhone) {
    return (
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 20,
          overflow: "hidden",
          background: "#ffffff",
          boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            background: "linear-gradient(180deg, #fbfdff 0%, #f8fafc 100%)",
            borderBottom: "1px solid #e5e7eb",
            display: "grid",
            gap: 3,
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
            {section.categoryLabel}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {section.rows.length} comparison row{section.rows.length === 1 ? "" : "s"}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, padding: 12 }}>
          {section.rows.map((row) => {
            const canAddProduct =
              !!row.actionProduct &&
              !selectedProducts.some((product) => product.id === row.actionProduct?.id);
            const statusTone =
              row.status === "Match"
                ? { background: "#dcfce7", color: "#166534", surface: "#f0fdf4" }
                : row.status === "Missing from your build"
                ? { background: "#dbeafe", color: "#1d4ed8", surface: "#f8fbff" }
                : row.status === "Only in your build"
                ? { background: "#fef3c7", color: "#92400e", surface: "#fffbeb" }
                : { background: "#ede9fe", color: "#6d28d9", surface: "#faf5ff" };

            return (
              <div
                key={row.key}
                style={{
                  display: "grid",
                  gap: 12,
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid #e5e7eb",
                  background: statusTone.surface,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "start",
                  }}
                >
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                      {row.expertProduct?.name || row.yourProduct?.name || "Accessory"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                      {row.status === "Missing from your build"
                        ? "Expert build includes this and your current build does not."
                        : row.status === "Different item"
                        ? "Both builds cover this category with different products."
                        : row.status === "Only in your build"
                        ? "This pick is unique to your current build."
                        : "Both builds currently match here."}
                    </div>
                  </div>

                  <span
                    style={{
                      display: "inline-flex",
                      padding: "7px 10px",
                      borderRadius: 999,
                      background: statusTone.background,
                      color: statusTone.color,
                      fontSize: 11,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.status}
                  </span>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <MobileCompareColumn
                    emptyLabel="Not in your build"
                    formatCurrency={formatCurrency}
                    getProductSupplierName={getProductSupplierName}
                    label="Your build"
                    product={row.yourProduct}
                  />
                  <MobileCompareColumn
                    emptyLabel="Not in expert build"
                    formatCurrency={formatCurrency}
                    getProductSupplierName={getProductSupplierName}
                    label="Expert build"
                    product={row.expertProduct}
                  />
                </div>

                {canAddProduct && row.actionProduct ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => addToBuild(row.actionProduct!)}
                      style={{
                        minHeight: 40,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "none",
                        background: "#0f172a",
                        color: "#ffffff",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {row.status === "Different item"
                        ? "Replace with expert item"
                        : "Add to my build"}
                    </button>
                  </div>
                ) : row.actionProduct ? (
                  <div style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>
                    Already added to your build
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
                    No action needed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(240px, 1.15fr) minmax(0, 1fr) minmax(0, 1fr) minmax(250px, 1fr)",
          gap: 12,
          padding: "14px 18px",
          background: "linear-gradient(180deg, #fbfdff 0%, #f8fafc 100%)",
          borderBottom: "1px solid #e5e7eb",
          alignItems: "center",
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {section.categoryLabel}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {section.rows.length} comparison row{section.rows.length === 1 ? "" : "s"}
          </div>
        </div>
        <HeaderCaption>Your build</HeaderCaption>
        <HeaderCaption>Expert build</HeaderCaption>
        <HeaderCaption align="right">Status / action</HeaderCaption>
      </div>
      <div style={{ display: "grid" }}>
        {section.rows.map((row, index) => {
          const canAddProduct =
            !!row.actionProduct &&
            !selectedProducts.some((product) => product.id === row.actionProduct?.id);
          const statusTone =
            row.status === "Match"
              ? { background: "#dcfce7", color: "#166534", surface: "#f0fdf4" }
              : row.status === "Missing from your build"
              ? { background: "#dbeafe", color: "#1d4ed8", surface: "#f8fbff" }
              : row.status === "Only in your build"
              ? { background: "#fef3c7", color: "#92400e", surface: "#fffbeb" }
              : { background: "#ede9fe", color: "#6d28d9", surface: "#faf5ff" };

          return (
            <div
              key={row.key}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(240px, 1.15fr) minmax(0, 1fr) minmax(0, 1fr) minmax(250px, 1fr)",
                gap: 12,
                padding: "16px 18px",
                alignItems: "start",
                borderTop: index === 0 ? "none" : "1px solid #eef2f7",
                background: row.status === "Match" ? "#ffffff" : statusTone.surface,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#0f172a",
                    lineHeight: 1.35,
                  }}
                >
                  {row.expertProduct?.name || row.yourProduct?.name || "Accessory"}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                  {row.status === "Missing from your build"
                    ? "Expert build recommends this item and it is not yet in your shortlist."
                    : row.status === "Different item"
                    ? "Expert build uses a different pick in this category."
                    : row.status === "Only in your build"
                    ? "This item is unique to your current plan."
                    : "Both builds include the same item."}
                </div>
              </div>
              <CompareProductColumn
                emptyLabel="Not in your build"
                product={row.yourProduct}
                getProductSupplierName={getProductSupplierName}
                formatCurrency={formatCurrency}
              />
              <CompareProductColumn
                emptyLabel="Not in expert build"
                product={row.expertProduct}
                getProductSupplierName={getProductSupplierName}
                formatCurrency={formatCurrency}
              />
              <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "8px 11px",
                    borderRadius: 999,
                    background: statusTone.background,
                    color: statusTone.color,
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: "center",
                    boxShadow:
                      row.status === "Missing from your build"
                        ? "0 8px 18px rgba(59,130,246,0.16)"
                        : "none",
                  }}
                >
                  {row.status}
                </span>
                {canAddProduct && row.actionProduct ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => addToBuild(row.actionProduct!)}
                      style={{
                        minHeight: 34,
                        padding: "7px 11px",
                        borderRadius: 10,
                        border: "none",
                        background: "#0f172a",
                        color: "#ffffff",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow:
                          row.status === "Missing from your build"
                            ? "0 10px 20px rgba(15,23,42,0.16)"
                            : "none",
                      }}
                    >
                      {row.status === "Different item"
                        ? "Replace with expert item"
                        : "Add to my build"}
                    </button>
                  </div>
                ) : row.actionProduct ? (
                  <div style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>
                    Already added to your build
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>
                    No action needed
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileCompareColumn({
  emptyLabel,
  formatCurrency,
  getProductSupplierName,
  label,
  product,
}: {
  emptyLabel: string;
  formatCurrency: (value: number) => string;
  getProductSupplierName: (product: Product) => string;
  label: string;
  product: Product | null;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        padding: "11px 12px",
        borderRadius: 14,
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
        {label}
      </div>
      {product ? (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.35 }}>
            {product.name}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
            {getProductSupplierName(product)}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
            {formatCurrency(product.price)}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>{emptyLabel}</div>
      )}
    </div>
  );
}

function HeaderCaption({
  align = "left",
  children,
}: {
  align?: "left" | "right";
  children: string;
}) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        color: "#94a3b8",
        textAlign: align,
      }}
    >
      {children}
    </div>
  );
}

function CompareProductColumn({
  emptyLabel,
  formatCurrency,
  getProductSupplierName,
  product,
}: {
  emptyLabel: string;
  formatCurrency: (value: number) => string;
  getProductSupplierName: (product: Product) => string;
  product: Product | null;
}) {
  if (!product) {
    return (
      <div
        style={{
          minHeight: 96,
          borderRadius: 16,
          border: "1px dashed #dbe3ee",
          background: "#ffffff",
          display: "grid",
          placeItems: "center",
          padding: 14,
          color: "#94a3b8",
          fontSize: 12,
          lineHeight: 1.45,
          textAlign: "center",
        }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: 96,
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        padding: 14,
        display: "grid",
        gap: 6,
        alignContent: "start",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.35 }}>
        {product.name}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
        {getProductSupplierName(product)}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
        {formatCurrency(product.price)}
      </div>
    </div>
  );
}
