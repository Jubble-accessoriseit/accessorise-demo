"use client";

import { ProductPurchaseButton } from "../commerce/ProductPurchaseButton";
import { resolveProductCommerce } from "../../lib/commerce/resolveProductCommerce";
import type { CommerceSourceContext } from "../../lib/commerce/types";
import { GarageStepShell } from "./GarageLayout";

import type {
  CompareCategoryRow,
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
  isBuildDirty: boolean;
  onChangeExpertBuild: () => void;
  onFilterChange: (filter: CompareFilter) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenProductPurchase: (state: {
    product: Product;
    sourceContext: CommerceSourceContext;
  }) => void;
  onSaveBuild: () => void;
  selectedExpertBuild: ResolvedExpertBuild | null;
  selectedProducts: Product[];
};

type CompareTableRow = {
  key: string;
  accessoryType: string;
  yourProduct: Product | null;
  expertProduct: Product | null;
  actionProduct?: Product | null;
  status: CompareCategoryRow["status"];
  summary: string;
};

const compareFilterOptions: Array<{ id: CompareFilter; label: string }> = [
  { id: "all", label: "All items" },
  { id: "missing", label: "Missing from your build" },
  { id: "different", label: "Different items" },
  { id: "matches", label: "Matches" },
  { id: "yours-only", label: "Only in your build" },
];

function buildCompareTableRows(
  filteredCompareCategorySections: CompareCategorySection[],
  sourceBuildLabel = "expert build"
): CompareTableRow[] {
  return filteredCompareCategorySections.flatMap((section) =>
    section.rows.map((row) => ({
      key: row.key,
      accessoryType: section.categoryLabel,
      yourProduct: row.yourProduct,
      expertProduct: row.expertProduct,
      actionProduct: row.actionProduct ?? null,
      status: row.status,
      summary:
        row.status === "Missing from your build"
          ? `${sourceBuildLabel} includes this and your current build does not.`
          : row.status === "Different item"
          ? "Both builds cover this accessory type with different products."
          : row.status === "Only in your build"
          ? "This accessory is unique to your current build."
          : "Both builds currently match for this accessory type.",
    }))
  );
}

function getCompareStatusTone(status: CompareCategoryRow["status"]) {
  if (status === "Match") {
    return {
      pillBackground: "#dcfce7",
      pillColor: "#166534",
      rowAccent: "#22c55e",
      rowBackground: "#f8fffb",
      border: "#bbf7d0",
    };
  }

  if (status === "Missing from your build") {
    return {
      pillBackground: "#fee2e2",
      pillColor: "#b91c1c",
      rowAccent: "#ef4444",
      rowBackground: "#fff8f8",
      border: "#fecaca",
    };
  }

  if (status === "Different item") {
    return {
      pillBackground: "#fef3c7",
      pillColor: "#b45309",
      rowAccent: "#f59e0b",
      rowBackground: "#fffcf4",
      border: "#fde68a",
    };
  }

  return {
    pillBackground: "#e2e8f0",
    pillColor: "#475569",
    rowAccent: "#94a3b8",
    rowBackground: "#fbfdff",
    border: "#e2e8f0",
  };
}

function getCompactCompareStatusCopy(status: CompareCategoryRow["status"]) {
  if (status === "Match") {
    return {
      shortLabel: "Matched",
      comparisonLabel: "Aligned",
    };
  }

  if (status === "Missing from your build") {
    return {
      shortLabel: "Missing",
      comparisonLabel: "Needs add",
    };
  }

  if (status === "Different item") {
    return {
      shortLabel: "Different",
      comparisonLabel: "Swap option",
    };
  }

  return {
    shortLabel: "Yours only",
    comparisonLabel: "Custom pick",
  };
}

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
  onOpenProductDetail,
  onOpenProductPurchase,
  onSaveBuild,
  selectedExpertBuild,
  selectedProducts,
}: CompareBuildsStepProps) {
  const isSourceResearched = selectedExpertBuild?.verificationStatus === "researched";
  const sourceBuildLabel = isSourceResearched ? "Source build" : "Expert build";
  const compareTableRows = buildCompareTableRows(
    filteredCompareCategorySections,
    sourceBuildLabel
  );
  const visibleRowCount = compareTableRows.length;

  return (
    <GarageStepShell isPhone={false}>
      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 14,
            boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
            display: "grid",
            gap: 10,
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
            <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  color: "#64748b",
                }}
              >
                Compare
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                  color: "#0f172a",
                  lineHeight: 1.08,
                }}
              >
                Compare
              </h2>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45, maxWidth: 760 }}>
                {selectedExpertBuild
                  ? isSourceResearched
                    ? "Compare your current build against this researched source build in one continuous table."
                    : "Compare your current build against the selected expert build in one continuous table."
                  : "Choose an expert build first, then compare the two setups here."}
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

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
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
              label={sourceBuildLabel}
              value={selectedExpertBuild ? selectedExpertBuild.name : "Not selected yet"}
            />
          </div>

          {selectedExpertBuild ? (
            <div
              style={{
                display: "grid",
                gap: 10,
                padding: 10,
                borderRadius: 16,
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
                  {visibleRowCount} visible row{visibleRowCount === 1 ? "" : "s"}
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
          <EmptyCompareState
            title="Select an expert build first"
            body="Expert Builds now lives in its own tab so you can browse matched builds without cluttering the comparison workspace."
            actionLabel="Browse Expert Builds"
            onAction={onChangeExpertBuild}
          />
        ) : compareCategorySections.length === 0 ? (
          <EmptyCompareMessage body="Select an expert build to start comparing category recommendations for this bike." />
        ) : filteredCompareCategorySections.length === 0 ? (
          <EmptyCompareState
            title={activeCompareFilterMeta.emptyTitle}
            body={activeCompareFilterMeta.emptyBody}
          />
        ) : (
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
                overflowX: "auto",
                overflowY: "hidden",
                WebkitOverflowScrolling: "touch",
                overscrollBehaviorX: "contain",
                paddingBottom: 2,
                scrollbarGutter: "stable both-edges",
              }}
            >
              <div style={{ minWidth: 980 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(140px, 0.56fr) minmax(250px, 1fr) minmax(250px, 1fr) minmax(130px, 0.42fr) minmax(180px, 0.56fr)",
                    gap: 0,
                    background: "linear-gradient(180deg, #fbfdff 0%, #f8fafc 100%)",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <TableHeaderCell
                    title="Accessory Type"
                    subtitle="Category / slot"
                  />
                  <TableHeaderCell
                    title="Your Build"
                    subtitle={`${selectedProducts.length} selected item${selectedProducts.length === 1 ? "" : "s"}`}
                  />
                  <TableHeaderCell
                    title={sourceBuildLabel}
                    subtitle={selectedExpertBuild.name}
                  />
                  <TableHeaderCell
                    title="Comparison"
                    subtitle="Colour-coded state"
                  />
                  <TableHeaderCell
                    title="Actions"
                    subtitle="Apply and inspect"
                  />
                </div>

                <div style={{ display: "grid" }}>
                  {compareTableRows.map((row, index) => (
                    <CompareTableDataRow
                      key={row.key}
                      addToBuild={addToBuild}
                      formatCurrency={formatCurrency}
                      getProductSupplierName={getProductSupplierName}
                      index={index}
                      onOpenProductDetail={onOpenProductDetail}
                      onOpenProductPurchase={onOpenProductPurchase}
                      row={row}
                      selectedProducts={selectedProducts}
                      sourceBuildLabel={sourceBuildLabel}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GarageStepShell>
  );
}

function CompareTableDataRow({
  addToBuild,
  formatCurrency,
  getProductSupplierName,
  index,
  onOpenProductDetail,
  onOpenProductPurchase,
  row,
  selectedProducts,
  sourceBuildLabel,
}: {
  addToBuild: (product: Product) => void;
  formatCurrency: (value: number) => string;
  getProductSupplierName: (product: Product) => string;
  index: number;
  onOpenProductDetail: (product: Product) => void;
  onOpenProductPurchase: (state: {
    product: Product;
    sourceContext: CommerceSourceContext;
  }) => void;
  row: CompareTableRow;
  selectedProducts: Product[];
  sourceBuildLabel: string;
}) {
  const tone = getCompareStatusTone(row.status);
  const statusCopy = getCompactCompareStatusCopy(row.status);
  const canAddProduct =
    !!row.actionProduct &&
    !selectedProducts.some((product) => product.id === row.actionProduct?.id);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(140px, 0.56fr) minmax(250px, 1fr) minmax(250px, 1fr) minmax(130px, 0.42fr) minmax(180px, 0.56fr)",
        borderTop: index === 0 ? "none" : "1px solid #eef2f7",
        background: row.status === "Match" ? "#ffffff" : tone.rowBackground,
      }}
    >
      <div
        style={{
          padding: "9px 12px",
          borderLeft: `4px solid ${tone.rowAccent}`,
          minWidth: 0,
          display: "grid",
          gap: 2,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}>
          {row.accessoryType}
        </div>
        <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.2 }}>{statusCopy.shortLabel}</div>
      </div>

      <CompareProductCell
        emptyLabel="Not in your build"
        formatCurrency={formatCurrency}
        getProductSupplierName={getProductSupplierName}
        onOpenProductDetail={onOpenProductDetail}
        onOpenProductPurchase={onOpenProductPurchase}
        product={row.yourProduct}
        surfaceBorder={tone.border}
      />

      <CompareProductCell
        emptyLabel={`Not in ${sourceBuildLabel.toLowerCase()}`}
        formatCurrency={formatCurrency}
        getProductSupplierName={getProductSupplierName}
        onOpenProductDetail={onOpenProductDetail}
        onOpenProductPurchase={onOpenProductPurchase}
        product={row.expertProduct}
        surfaceBorder={tone.border}
      />

      <div style={{ padding: "9px 12px", minWidth: 0, display: "grid", alignContent: "start", gap: 3, justifyItems: "start" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "fit-content",
            maxWidth: "100%",
            padding: "4px 8px",
            borderRadius: 999,
            background: tone.pillBackground,
            color: tone.pillColor,
            fontSize: 10,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          {row.status}
        </span>
        <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.2 }}>{statusCopy.comparisonLabel}</div>
      </div>

      <div style={{ padding: "9px 12px", minWidth: 0, display: "grid", gap: 4, alignContent: "start", justifyItems: "start" }}>
        {canAddProduct && row.actionProduct ? (
          <button
            type="button"
            onClick={() => addToBuild(row.actionProduct!)}
            style={{
              minHeight: 30,
              padding: "5px 9px",
              borderRadius: 10,
              border: "none",
              background: "#0f172a",
              color: "#ffffff",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            {row.status === "Different item"
              ? sourceBuildLabel === "Source build"
                ? "Review source item"
                : "Replace with expert item"
              : "Add to my build"}
          </button>
        ) : row.actionProduct ? (
          <div style={{ fontSize: 10, color: "#166534", fontWeight: 700 }}>
            Already added to your build
          </div>
        ) : (
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>No action needed</div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {row.expertProduct ? (
            <button
              type="button"
              onClick={() => onOpenProductDetail(row.expertProduct!)}
              style={tableLinkButtonStyle}
            >
              {sourceBuildLabel === "Source build" ? "View source item" : "View expert item"}
            </button>
          ) : null}

          {row.yourProduct ? (
            <button
              type="button"
              onClick={() => onOpenProductDetail(row.yourProduct!)}
              style={tableLinkButtonStyle}
            >
              View your item
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CompareProductCell({
  emptyLabel,
  formatCurrency,
  getProductSupplierName,
  onOpenProductDetail,
  onOpenProductPurchase,
  product,
  surfaceBorder,
}: {
  emptyLabel: string;
  formatCurrency: (value: number) => string;
  getProductSupplierName: (product: Product) => string;
  onOpenProductDetail: (product: Product) => void;
  onOpenProductPurchase: (state: {
    product: Product;
    sourceContext: CommerceSourceContext;
  }) => void;
  product: Product | null;
  surfaceBorder: string;
}) {
  if (!product) {
    return (
      <div style={{ padding: "9px 12px", minWidth: 0 }}>
      <div
        style={{
          minHeight: 0,
          borderRadius: 8,
          border: "1px dashed rgba(203,213,225,0.7)",
          background: "transparent",
          display: "grid",
          placeItems: "center",
          padding: "6px 4px",
          color: "#a0aec0",
          fontSize: 10,
          lineHeight: 1.2,
          textAlign: "left",
          opacity: 0.9,
        }}
      >
          {emptyLabel}
        </div>
      </div>
    );
  }

  const commerce = resolveProductCommerce({ product });

  return (
    <div style={{ padding: "9px 12px", minWidth: 0 }}>
      <div
        style={{
          minHeight: 0,
          borderRadius: 0,
          border: "none",
          background: "transparent",
          padding: 0,
          display: "grid",
          gap: 3,
          alignContent: "start",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}>
          {product.name}
        </div>
        <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.2, overflowWrap: "anywhere" }}>
          {getProductSupplierName(product)} · {formatCurrency(product.price)}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => onOpenProductDetail(product)}
            style={tableLinkButtonStyle}
          >
            View product
          </button>
          <ProductPurchaseButton
            commerce={commerce}
            compact
            onOpen={() =>
              onOpenProductPurchase({
                product,
                sourceContext: "garage",
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

function TableHeaderCell({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        display: "grid",
        gap: 2,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          color: "#94a3b8",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
        {subtitle}
      </div>
    </div>
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

function EmptyCompareMessage({ body }: { body: string }) {
  return (
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
      {body}
    </div>
  );
}

function EmptyCompareState({
  actionLabel,
  body,
  onAction,
  title,
}: {
  actionLabel?: string;
  body: string;
  onAction?: () => void;
  title: string;
}) {
  return (
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
      <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{title}</div>
      <div
        style={{
          fontSize: 14,
          color: "#64748b",
          lineHeight: 1.55,
          maxWidth: 720,
        }}
      >
        {body}
      </div>
      {actionLabel && onAction ? (
        <div>
          <button
            type="button"
            onClick={onAction}
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
            {actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const tableSecondaryButtonStyle = {
  minHeight: 32,
  padding: "5px 9px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#111827",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 11,
} as const;

const tableLinkButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 28,
  padding: "2px 0",
  border: "none",
  background: "transparent",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 11,
  textDecoration: "none",
  whiteSpace: "nowrap",
} as const;
