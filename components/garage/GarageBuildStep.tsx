"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { ProductPurchaseButton } from "../commerce/ProductPurchaseButton";
import { resolveProductCommerce } from "../../lib/commerce/resolveProductCommerce";
import type { CommerceSourceContext } from "../../lib/commerce/types";
import type { CompatibilityLabel, Product, SupabaseBike } from "../../types/garage";
import {
  GarageStepShell,
  garageEyebrowStyle,
  garagePrimaryButtonStyle,
  garageSecondaryButtonStyle,
} from "./GarageLayout";

type CategoryOption = { id: string; label: string };
type BuildSortOption = "price-low" | "price-high" | "supplier";
type BuildViewMode = "card" | "list";
type NoticeTone = { background: string; border: string; color: string };
type ActiveBuildSource = { buildId?: string | null; buildName: string } | null;
type BuildContextMode = "build" | "bike";

type Props = {
  activeCompatibilityBikeId: string | null;
  activeWorkingGarageBuildSource: ActiveBuildSource;
  buildNameInput: string;
  buildProducts: Product[];
  buildSortOption: BuildSortOption;
  buildViewMode: BuildViewMode;
  buildViewModeResolved: BuildViewMode;
  canOpenBuildSaveDialog: boolean;
  categories: CategoryOption[];
  compatibleCount: number;
  currentBike: SupabaseBike | null;
  currentGarageBikeLabel: string;
  formatBuildWorkspacePriceLabel: (value: number) => string;
  formatCurrency: (value: number) => string;
  getCompatibilityLabel: (product: Product, bikeId: string) => CompatibilityLabel;
  getGarageNoticeTone: (message: string) => NoticeTone;
  getProductSupplierName: (product: Product) => string;
  hasUnsavedGarageBuildChanges: boolean;
  isDesktop: boolean;
  isEditingSavedGarageBuild: boolean;
  isPhone: boolean;
  onAddToBuild: (product: Product) => void;
  onBuildSortOptionChange: (value: BuildSortOption) => void;
  onBuildViewModeChange: (value: BuildViewMode) => void;
  onGoToBike: () => void;
  onGoToExpert: () => void;
  onGoToSave: () => void;
  onOnlyCompatibleChange: (value: boolean) => void;
  onOpenBuildSaveDialog: () => void;
  onOpenDuplicateBuildSaveDialog: () => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenProductPurchase: (state: { product: Product; sourceContext: CommerceSourceContext }) => void;
  onRemoveFromBuild: (productId: number) => void;
  onResetFilters: () => void;
  onSearchTermChange: (value: string) => void;
  onSelectCategory: (value: string) => void;
  onShowExactFitOnlyChange: (value: boolean) => void;
  onlyCompatible: boolean;
  saveMessage: string;
  searchTerm: string;
  selectedCategory: string;
  selectedProducts: Product[];
  selectedProductsCommerceSummary: { missingCount: number; readyCount: number };
  showExactFitOnly: boolean;
};

type BuildProductEntry = {
  compatibilityLabel: CompatibilityLabel;
  product: Product;
};

function buildBadgeStyle(label: CompatibilityLabel) {
  return {
    background: label === "Exact fit" ? "#dcfce7" : label === "Universal fit" ? "#dbeafe" : "#f8fafc",
    border: label === "Exact fit" ? "#bbf7d0" : label === "Universal fit" ? "#bfdbfe" : "#e2e8f0",
    color: label === "Exact fit" ? "#166534" : label === "Universal fit" ? "#1d4ed8" : "#475569",
  };
}

function controlStyle(isPhone: boolean) {
  return {
    minHeight: isPhone ? 40 : 42,
    padding: isPhone ? "9px 11px" : "10px 12px",
    borderRadius: 12,
    border: "1px solid #dbe3ee",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 13,
    outline: "none",
    width: "100%",
    minWidth: 0,
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  } as const;
}

function FilterField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div style={{ display: "grid", gap: 5, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.45, textTransform: "uppercase", color: "#64748b" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gap: 2, padding: "8px 9px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#ffffff" }}>
      <div style={{ ...garageEyebrowStyle, fontSize: 10, letterSpacing: 0.45 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

function ToggleChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 34,
        padding: "7px 11px",
        borderRadius: 999,
        border: active ? "1px solid #bfdbfe" : "1px solid #dbe3ee",
        background: active ? "#eff6ff" : "#ffffff",
        color: active ? "#1d4ed8" : "#475569",
        fontSize: 11,
        fontWeight: 800,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function CategoryChip({ active, count, label, onClick }: { active: boolean; count: number; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 34,
        padding: "7px 11px",
        borderRadius: 999,
        border: active ? "1px solid #0f172a" : "1px solid #dbe3ee",
        background: active ? "#0f172a" : "#ffffff",
        color: active ? "#ffffff" : "#334155",
        fontSize: 11,
        fontWeight: 800,
        cursor: "pointer",
        whiteSpace: "nowrap",
        flex: "0 0 auto",
      }}
    >
      <span>{label}</span>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 20, padding: "0 5px", borderRadius: 999, background: active ? "rgba(255,255,255,0.16)" : "#f8fafc", color: active ? "#ffffff" : "#64748b", fontSize: 10, fontWeight: 800 }}>
        {count}
      </span>
    </button>
  );
}

function PassiveInfoBox({
  eyebrow,
  title,
  detail,
  metadata,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  metadata?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        minWidth: 0,
        padding: "8px 11px",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}
    >
      <div style={{ ...garageEyebrowStyle, fontSize: 10 }}>{eyebrow}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", overflowWrap: "anywhere" }}>{title}</div>
      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.35 }}>{detail}</div>
      {metadata ? <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.3 }}>{metadata}</div> : null}
    </div>
  );
}

function buildBikeInfoLines(bike: SupabaseBike | null) {
  if (!bike) {
    return {
      title: "No bike linked",
      detail: "Choose a bike in Garage to browse build-ready accessories.",
    };
  }

  const nickname = bike.nickname?.trim();
  const modelLine = [bike.make, bike.model, bike.variant || null, bike.year].filter(Boolean).join(" ");
  const metadata = [bike.ownershipStatus, bike.category, bike.engine_cc ? `${bike.engine_cc}cc` : null]
    .filter(Boolean)
    .join(" | ");

  return {
    title: nickname || modelLine,
    detail: nickname ? modelLine : metadata || "Garage bike context",
    metadata: nickname ? metadata : undefined,
  };
}

type BuildProductProps = {
  categories: CategoryOption[];
  fitLabel: CompatibilityLabel;
  fitStyle: { background: string; border: string; color: string };
  formatCurrency: (value: number) => string;
  getProductSupplierName: (product: Product) => string;
  isAdded: boolean;
  isPhone: boolean;
  onOpenDetail: () => void;
  onOpenPurchase: () => void;
  onToggleBuild: () => void;
  product: Product;
};

function BuildProductCard({
  categories,
  fitLabel,
  fitStyle,
  formatCurrency,
  getProductSupplierName,
  isAdded,
  onOpenDetail,
  onOpenPurchase,
  onToggleBuild,
  product,
}: Omit<BuildProductProps, "isPhone">) {
  const commerce = resolveProductCommerce({ product });

  return (
    <article style={{ display: "grid", gap: 8, padding: 10, borderRadius: 16, border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 8px 18px rgba(15,23,42,0.04)", minWidth: 0 }}>
      <button
        type="button"
        onClick={onOpenDetail}
        style={{ display: "grid", gap: 8, padding: 0, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", minWidth: 0 }}
      >
        <div style={{ aspectRatio: "1 / 1", borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <img
            src={product.image || "/bike-placeholder.jpg"}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.src = "/bike-placeholder.jpg";
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.45, textTransform: "uppercase", color: "#64748b" }}>
              {getProductSupplierName(product)}
            </span>
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>
              {categories.find((item) => item.id === product.categoryId)?.label || "Category"}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.25, color: "#0f172a" }}>{product.name}</div>
          <div style={{ fontSize: 12, lineHeight: 1.45, color: "#64748b" }}>{product.description}</div>
        </div>
      </button>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, border: `1px solid ${fitStyle.border}`, background: fitStyle.background, color: fitStyle.color, fontSize: 10, fontWeight: 800 }}>
          {fitLabel}
        </span>
        {isAdded ? <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 10, fontWeight: 800 }}>In this build</span> : null}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid #eef2f7" }}>
        <div style={{ display: "grid", gap: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.45, textTransform: "uppercase", color: "#94a3b8" }}>Planning price</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{formatCurrency(product.price)}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onToggleBuild}
            style={{
              ...(isAdded ? garageSecondaryButtonStyle : garagePrimaryButtonStyle),
              minHeight: 36,
              padding: "8px 12px",
              fontSize: 12,
            }}
          >
            {isAdded ? "Remove" : "Add to build"}
          </button>
          <div onClick={(event) => event.stopPropagation()}>
            <ProductPurchaseButton commerce={commerce} compact onOpen={onOpenPurchase} />
          </div>
        </div>
      </div>
    </article>
  );
}

function BuildProductRow({
  categories,
  fitLabel,
  fitStyle,
  formatCurrency,
  getProductSupplierName,
  isAdded,
  isPhone,
  onOpenDetail,
  onOpenPurchase,
  onToggleBuild,
  product,
}: BuildProductProps) {
  const commerce = resolveProductCommerce({ product });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpenDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetail();
        }
      }}
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: isPhone ? "72px minmax(0, 1fr)" : "88px minmax(0, 1fr) minmax(180px, 220px)",
        gap: isPhone ? 12 : 16,
        alignItems: "start",
        padding: isPhone ? 14 : 16,
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
        cursor: "pointer",
      }}
    >
      <div style={{ width: isPhone ? 72 : 88, height: isPhone ? 72 : 88, borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
        <img
          src={product.image || "/bike-placeholder.jpg"}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src = "/bike-placeholder.jpg";
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div style={{ minWidth: 0, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.45, textTransform: "uppercase", color: "#64748b" }}>
            {getProductSupplierName(product)}
          </span>
          <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>
            {categories.find((item) => item.id === product.categoryId)?.label || "Category"}
          </span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.24, color: "#0f172a" }}>{product.name}</div>
        <div style={{ fontSize: 12, lineHeight: 1.45, color: "#64748b" }}>{product.description}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, border: `1px solid ${fitStyle.border}`, background: fitStyle.background, color: fitStyle.color, fontSize: 10, fontWeight: 800 }}>
            {fitLabel}
          </span>
          {isAdded ? <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 10, fontWeight: 800 }}>In this build</span> : null}
        </div>
        {isPhone ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleBuild();
              }}
              style={{
                ...(isAdded ? garageSecondaryButtonStyle : garagePrimaryButtonStyle),
                minHeight: 36,
                padding: "8px 12px",
                fontSize: 12,
              }}
            >
              {isAdded ? "Remove" : "Add to build"}
            </button>
            <div onClick={(event) => event.stopPropagation()}>
              <ProductPurchaseButton commerce={commerce} compact onOpen={onOpenPurchase} />
            </div>
          </div>
        ) : null}
      </div>
      {!isPhone ? (
        <div style={{ display: "grid", gap: 10, justifyItems: "end", minWidth: 0 }}>
          <div style={{ display: "grid", gap: 2, justifyItems: "end" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.45, textTransform: "uppercase", color: "#94a3b8" }}>Planning price</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{formatCurrency(product.price)}</span>
          </div>
          <div style={{ display: "grid", gap: 8, width: "100%" }}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleBuild();
              }}
              style={{
                ...(isAdded ? garageSecondaryButtonStyle : garagePrimaryButtonStyle),
                minHeight: 36,
                width: "100%",
                padding: "8px 12px",
                fontSize: 12,
              }}
            >
              {isAdded ? "Remove" : "Add to build"}
            </button>
            <div onClick={(event) => event.stopPropagation()} style={{ justifySelf: "end" }}>
              <ProductPurchaseButton commerce={commerce} compact onOpen={onOpenPurchase} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function GarageBuildStep({
  activeCompatibilityBikeId,
  activeWorkingGarageBuildSource,
  buildNameInput,
  buildProducts,
  buildSortOption,
  buildViewMode,
  buildViewModeResolved,
  canOpenBuildSaveDialog,
  categories,
  compatibleCount,
  currentBike,
  currentGarageBikeLabel,
  formatBuildWorkspacePriceLabel,
  formatCurrency,
  getCompatibilityLabel,
  getGarageNoticeTone,
  getProductSupplierName,
  hasUnsavedGarageBuildChanges,
  isDesktop,
  isEditingSavedGarageBuild,
  isPhone,
  onAddToBuild,
  onBuildSortOptionChange,
  onBuildViewModeChange,
  onGoToBike,
  onGoToExpert,
  onGoToSave,
  onOnlyCompatibleChange,
  onOpenBuildSaveDialog,
  onOpenDuplicateBuildSaveDialog,
  onOpenProductDetail,
  onOpenProductPurchase,
  onRemoveFromBuild,
  onResetFilters,
  onSearchTermChange,
  onSelectCategory,
  onShowExactFitOnlyChange,
  onlyCompatible,
  saveMessage,
  searchTerm,
  selectedCategory,
  selectedProducts,
  selectedProductsCommerceSummary,
  showExactFitOnly,
}: Props) {
  const [contextMode, setContextMode] = useState<BuildContextMode>("bike");

  useEffect(() => {
    if (selectedProducts.length === 0 && contextMode === "build") {
      setContextMode("bike");
    }
  }, [contextMode, selectedProducts.length]);

  const buildTitle = activeWorkingGarageBuildSource?.buildName || buildNameInput.trim() || "Untitled build";
  const bikeInfo = buildBikeInfoLines(currentBike);
  const buildTotal = selectedProducts.reduce((total, item) => total + item.price, 0);
  const sourceProducts = contextMode === "build" ? selectedProducts : buildProducts;

  const sourceEntries = useMemo<BuildProductEntry[]>(() => {
    return sourceProducts.map((product) => ({
      product,
      compatibilityLabel: activeCompatibilityBikeId ? getCompatibilityLabel(product, activeCompatibilityBikeId) : "Not confirmed",
    }));
  }, [activeCompatibilityBikeId, getCompatibilityLabel, sourceProducts]);

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    sourceEntries.forEach((entry) => {
      counts.set(entry.product.categoryId, (counts.get(entry.product.categoryId) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([categoryId, count]) => ({
        categoryId,
        count,
        label: categories.find((category) => category.id === categoryId)?.label || "Category",
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [categories, sourceEntries]);

  const filteredEntries = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    const filtered = sourceEntries.filter((entry) => {
      if (selectedCategory !== "all" && entry.product.categoryId !== selectedCategory) return false;
      if (showExactFitOnly && entry.compatibilityLabel !== "Exact fit") return false;
      if (!onlyCompatible && entry.compatibilityLabel === "Not confirmed") return false;
      if (!needle) return true;

      const haystack = [entry.product.name, entry.product.brand, entry.product.description, getProductSupplierName(entry.product)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });

    return filtered.sort((left, right) => {
      if (buildSortOption === "price-low") return left.product.price - right.product.price;
      if (buildSortOption === "price-high") return right.product.price - left.product.price;
      return getProductSupplierName(left.product).localeCompare(getProductSupplierName(right.product));
    });
  }, [buildSortOption, getProductSupplierName, onlyCompatible, searchTerm, selectedCategory, showExactFitOnly, sourceEntries]);

  const resultsContextLabel = contextMode === "build" ? "This build" : "All products for this bike";
  const isBuildScopedEmpty = contextMode === "build" && selectedProducts.length === 0;
  const saveTone = saveMessage ? getGarageNoticeTone(saveMessage) : null;

  const renderProduct = (entry: BuildProductEntry) => {
    const isAdded = selectedProducts.some((item) => item.id === entry.product.id);
    const fitStyle = buildBadgeStyle(entry.compatibilityLabel);
    const openPurchase = () => onOpenProductPurchase({ product: entry.product, sourceContext: contextMode === "build" ? "garage" : "product-browser" });
    const toggleBuild = () => (isAdded ? onRemoveFromBuild(entry.product.id) : onAddToBuild(entry.product));

    if (buildViewModeResolved === "card") {
      return (
        <BuildProductCard
          key={entry.product.id}
          categories={categories}
          fitLabel={entry.compatibilityLabel}
          fitStyle={fitStyle}
          formatCurrency={formatCurrency}
          getProductSupplierName={getProductSupplierName}
          isAdded={isAdded}
          onOpenDetail={() => onOpenProductDetail(entry.product)}
          onOpenPurchase={openPurchase}
          onToggleBuild={toggleBuild}
          product={entry.product}
        />
      );
    }

    return (
      <BuildProductRow
        key={entry.product.id}
        categories={categories}
        fitLabel={entry.compatibilityLabel}
        fitStyle={fitStyle}
        formatCurrency={formatCurrency}
        getProductSupplierName={getProductSupplierName}
        isAdded={isAdded}
        isPhone={isPhone}
        onOpenDetail={() => onOpenProductDetail(entry.product)}
        onOpenPurchase={openPurchase}
        onToggleBuild={toggleBuild}
        product={entry.product}
      />
    );
  };

  return (
    <GarageStepShell isPhone={isPhone} maxWidth={1440} paddingBottom={36}>
      <section style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gap: 6, padding: isPhone ? 10 : 12, borderRadius: 16, border: "1px solid #e2e8f0", background: "#ffffff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "grid", gap: 8, minWidth: 0, flex: "1 1 620px" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ ...garageEyebrowStyle, flex: "0 0 auto" }}>Build</span>
                <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                  {currentGarageBikeLabel || "No bike selected"}
                </div>
                <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                  {selectedProducts.length} item{selectedProducts.length === 1 ? "" : "s"} in build
                </div>
                {activeWorkingGarageBuildSource ? (
                  <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: hasUnsavedGarageBuildChanges ? "#eff6ff" : "#f8fafc", border: `1px solid ${hasUnsavedGarageBuildChanges ? "#bfdbfe" : "#e2e8f0"}`, color: hasUnsavedGarageBuildChanges ? "#1d4ed8" : "#475569", fontSize: 10, fontWeight: 800 }}>
                    {hasUnsavedGarageBuildChanges ? "Unsaved changes" : "Saved build linked"}
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isPhone ? "minmax(0, 1fr)" : "minmax(220px, 280px) minmax(220px, 1fr)",
                  gap: 8,
                  alignItems: "stretch",
                }}
              >
                <PassiveInfoBox
                  eyebrow="Current build"
                  title={buildTitle}
                  detail={activeWorkingGarageBuildSource ? `Editing saved build: ${activeWorkingGarageBuildSource.buildName}` : "Working in a new unsaved build session"}
                  metadata={canOpenBuildSaveDialog ? `${formatCurrency(buildTotal)} planned total` : "Add accessories to save this build"}
                />

                <PassiveInfoBox eyebrow="Linked bike" title={bikeInfo.title} detail={bikeInfo.detail} metadata={bikeInfo.metadata} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isPhone ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                <StatPill label="Items" value={`${selectedProducts.length}`} />
                <StatPill label="Ready to shop" value={`${selectedProductsCommerceSummary.readyCount}`} />
                <StatPill label="Compatible" value={`${compatibleCount}`} />
                <StatPill label="Planned total" value={formatCurrency(buildTotal)} />
              </div>
            </div>

            <div style={{ display: "grid", gap: 8, justifyItems: "stretch", width: isPhone ? "100%" : "auto" }}>
              <div style={{ display: "inline-flex", gap: 4, padding: 3, borderRadius: 999, border: "1px solid #dbe3ee", background: "#f8fafc", width: isPhone ? "100%" : "auto" }}>
                {(["bike", "build"] as const).map((mode) => {
                  const isActive = contextMode === mode;
                  const isDisabled = mode === "build" && selectedProducts.length === 0;
                  return (
                    <button
                      key={mode}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setContextMode(mode)}
                      style={{
                        minHeight: 30,
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "none",
                        background: isActive ? "#0f172a" : "transparent",
                        color: isDisabled ? "#94a3b8" : isActive ? "#ffffff" : "#475569",
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.7 : 1,
                        flex: isPhone ? "1 1 0" : "0 0 auto",
                      }}
                    >
                      {mode === "build" ? "This Build" : "All products for this bike"}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: isPhone ? "stretch" : "flex-end" }}>
                <button type="button" onClick={onGoToBike} style={{ ...garageSecondaryButtonStyle, minHeight: 38 }}>Change bike</button>
                <button
                  type="button"
                  onClick={onOpenBuildSaveDialog}
                  disabled={!canOpenBuildSaveDialog}
                  style={{
                    ...garagePrimaryButtonStyle,
                    minHeight: 38,
                    background: canOpenBuildSaveDialog ? "#0f172a" : "#94a3b8",
                    cursor: canOpenBuildSaveDialog ? "pointer" : "not-allowed",
                  }}
                >
                  Save build
                </button>
              </div>
            </div>
          </div>
        </div>

        {saveTone ? (
          <div style={{ background: saveTone.background, border: `1px solid ${saveTone.border}`, color: saveTone.color, padding: "10px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, lineHeight: 1.45 }}>
            {saveMessage}
          </div>
        ) : null}

        {!currentBike ? (
          <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Choose a bike to start building</div>
            <div style={{ fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
              Pick a bike in Garage and this screen will switch to fitment-aware products for that setup.
            </div>
          </div>
        ) : isDesktop ? (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 26%) minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
            <aside
              style={{
                display: "grid",
                gap: 12,
                alignContent: "start",
                padding: 12,
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                position: "sticky",
                top: 84,
              }}
            >
              <FilterField label="Search products">
                <input value={searchTerm} onChange={(event) => onSearchTermChange(event.target.value)} placeholder="Search luggage, protection, lights..." style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }} />
              </FilterField>

              <FilterField label="Browse mode">
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "inline-flex", gap: 4, padding: 3, borderRadius: 999, border: "1px solid #dbe3ee", background: "#f8fafc", width: "100%" }}>
                    {(["bike", "build"] as const).map((mode) => {
                      const isActive = contextMode === mode;
                      const isDisabled = mode === "build" && selectedProducts.length === 0;
                      return (
                        <button
                          key={mode}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setContextMode(mode)}
                          style={{
                            minHeight: 30,
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "none",
                            background: isActive ? "#0f172a" : "transparent",
                            color: isDisabled ? "#94a3b8" : isActive ? "#ffffff" : "#475569",
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            opacity: isDisabled ? 0.7 : 1,
                            flex: "1 1 0",
                          }}
                        >
                          {mode === "build" ? "This Build" : "All bike products"}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                      {buildTitle}
                    </div>
                    <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                      {selectedProductsCommerceSummary.readyCount} ready now
                    </div>
                  </div>
                </div>
              </FilterField>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                <FilterField label="Sort by">
                  <select value={buildSortOption} onChange={(event) => onBuildSortOptionChange(event.target.value as BuildSortOption)} style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }}>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </FilterField>
                <FilterField label="View">
                  <div style={{ display: "inline-flex", gap: 4, padding: 3, borderRadius: 999, border: "1px solid #dbe3ee", background: "#f8fafc", width: "100%" }}>
                    {(["card", "list"] as const).map((mode) => {
                      const isActive = buildViewMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => onBuildViewModeChange(mode)}
                          style={{
                            minHeight: 30,
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "none",
                            background: isActive ? "#0f172a" : "transparent",
                            color: isActive ? "#ffffff" : "#475569",
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: "pointer",
                            flex: "1 1 0",
                          }}
                        >
                          {mode === "card" ? "Card" : "List"}
                        </button>
                      );
                    })}
                  </div>
                </FilterField>
              </div>

              <FilterField label="Fitment">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <ToggleChip active={showExactFitOnly} label="Exact fit only" onClick={() => onShowExactFitOnlyChange(!showExactFitOnly)} />
                  <ToggleChip active={onlyCompatible} label="Show compatible" onClick={() => onOnlyCompatibleChange(!onlyCompatible)} />
                </div>
              </FilterField>

              <FilterField label="Categories">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <CategoryChip active={selectedCategory === "all"} count={sourceEntries.length} label="All categories" onClick={() => onSelectCategory("all")} />
                  {categoryOptions.map((category) => (
                    <CategoryChip key={category.categoryId} active={selectedCategory === category.categoryId} count={category.count} label={category.label} onClick={() => onSelectCategory(category.categoryId)} />
                  ))}
                </div>
              </FilterField>

              <FilterField label="Build actions">
                <div style={{ display: "grid", gap: 8 }}>
                  <button
                    type="button"
                    onClick={onOpenBuildSaveDialog}
                    disabled={!canOpenBuildSaveDialog}
                    style={{
                      ...garagePrimaryButtonStyle,
                      minHeight: 38,
                      background: canOpenBuildSaveDialog ? "#0f172a" : "#94a3b8",
                      cursor: canOpenBuildSaveDialog ? "pointer" : "not-allowed",
                    }}
                  >
                    Save build
                  </button>
                  {isEditingSavedGarageBuild ? (
                    <button
                      type="button"
                      onClick={onOpenDuplicateBuildSaveDialog}
                      disabled={!canOpenBuildSaveDialog}
                      style={{
                        ...garageSecondaryButtonStyle,
                        minHeight: 38,
                        cursor: canOpenBuildSaveDialog ? "pointer" : "not-allowed",
                        opacity: canOpenBuildSaveDialog ? 1 : 0.7,
                      }}
                    >
                      Save as new
                    </button>
                  ) : null}
                  <button type="button" onClick={onGoToExpert} disabled={selectedProducts.length === 0} style={{ ...garageSecondaryButtonStyle, minHeight: 38, cursor: selectedProducts.length === 0 ? "not-allowed" : "pointer", opacity: selectedProducts.length === 0 ? 0.7 : 1 }}>
                    Expert builds
                  </button>
                  <button type="button" onClick={onGoToSave} style={{ ...garageSecondaryButtonStyle, minHeight: 38 }}>
                    View saved builds
                  </button>
                  <button type="button" onClick={onResetFilters} style={{ ...garageSecondaryButtonStyle, minHeight: 38 }}>
                    Reset filters
                  </button>
                </div>
              </FilterField>
            </aside>

            {isBuildScopedEmpty ? (
              <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>This build has no products yet</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                  Stay in This Build to review saved selections later, or switch back to all products for this bike to keep browsing.
                </div>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>No products match this filter set</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                  Try a broader category, turn compatible items back on, or switch between this build and all products for this bike.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ ...garageEyebrowStyle, fontSize: 10 }}>
                    {filteredEntries.length} product{filteredEntries.length === 1 ? "" : "s"} for {resultsContextLabel}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selectedCategory !== "all" ? (
                      <div style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                        {categoryOptions.find((category) => category.categoryId === selectedCategory)?.label || "Category"}
                      </div>
                    ) : null}
                    {showExactFitOnly ? (
                      <div style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534", fontSize: 10, fontWeight: 800 }}>
                        Exact fit
                      </div>
                    ) : null}
                    {!onlyCompatible ? (
                      <div style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                        Confirmed matches only
                      </div>
                    ) : null}
                    <div style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                      {formatBuildWorkspacePriceLabel(buildTotal)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: buildViewModeResolved === "card" ? "repeat(auto-fill, minmax(190px, 1fr))" : "1fr", gap: 10 }}>
                  {filteredEntries.map(renderProduct)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 8 }}>
                <FilterField label="Search products">
                  <input value={searchTerm} onChange={(event) => onSearchTermChange(event.target.value)} placeholder="Search luggage, protection, lights..." style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }} />
                </FilterField>
                <FilterField label="Sort by">
                  <select value={buildSortOption} onChange={(event) => onBuildSortOptionChange(event.target.value as BuildSortOption)} style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }}>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </FilterField>
                <FilterField label="Fitment">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <ToggleChip active={showExactFitOnly} label="Exact fit only" onClick={() => onShowExactFitOnlyChange(!showExactFitOnly)} />
                  </div>
                </FilterField>
                <FilterField label="Compatibility">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <ToggleChip active={onlyCompatible} label="Show compatible" onClick={() => onOnlyCompatibleChange(!onlyCompatible)} />
                  </div>
                </FilterField>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              <CategoryChip active={selectedCategory === "all"} count={sourceEntries.length} label="All categories" onClick={() => onSelectCategory("all")} />
              {categoryOptions.map((category) => (
                <CategoryChip key={category.categoryId} active={selectedCategory === category.categoryId} count={category.count} label={category.label} onClick={() => onSelectCategory(category.categoryId)} />
              ))}
            </div>

            {isBuildScopedEmpty ? (
              <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>This build has no products yet</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                  Switch to all products for this bike whenever you want broader browsing.
                </div>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>No products match this filter set</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                  Try a broader category, turn compatible items back on, or switch between this build and all products for this bike.
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ ...garageEyebrowStyle, fontSize: 10 }}>
                    {filteredEntries.length} product{filteredEntries.length === 1 ? "" : "s"} in {resultsContextLabel}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {showExactFitOnly ? (
                      <div style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534", fontSize: 10, fontWeight: 800 }}>
                        Exact fit
                      </div>
                    ) : null}
                    {!onlyCompatible ? (
                      <div style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                        Confirmed matches only
                      </div>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: buildViewModeResolved === "card" ? "repeat(2, minmax(0, 1fr))" : "1fr", gap: 10 }}>
                  {filteredEntries.map(renderProduct)}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <button
                type="button"
                onClick={onOpenBuildSaveDialog}
                disabled={!canOpenBuildSaveDialog}
                style={{
                  ...garagePrimaryButtonStyle,
                  minHeight: 38,
                  background: canOpenBuildSaveDialog ? "#0f172a" : "#94a3b8",
                  cursor: canOpenBuildSaveDialog ? "pointer" : "not-allowed",
                }}
              >
                Save build
              </button>
              <button type="button" onClick={onGoToExpert} disabled={selectedProducts.length === 0} style={{ ...garageSecondaryButtonStyle, minHeight: 38, cursor: selectedProducts.length === 0 ? "not-allowed" : "pointer", opacity: selectedProducts.length === 0 ? 0.7 : 1 }}>
                Expert builds
              </button>
              {isEditingSavedGarageBuild ? (
                <button
                  type="button"
                  onClick={onOpenDuplicateBuildSaveDialog}
                  disabled={!canOpenBuildSaveDialog}
                  style={{
                    ...garageSecondaryButtonStyle,
                    minHeight: 38,
                    cursor: canOpenBuildSaveDialog ? "pointer" : "not-allowed",
                    opacity: canOpenBuildSaveDialog ? 1 : 0.7,
                  }}
                >
                  Save as new
                </button>
              ) : null}
              <button type="button" onClick={onGoToSave} style={{ ...garageSecondaryButtonStyle, minHeight: 38 }}>
                View saved builds
              </button>
              <button type="button" onClick={onResetFilters} style={{ ...garageSecondaryButtonStyle, minHeight: 38 }}>
                Reset filters
              </button>
            </div>
          </>
        )}
      </section>
    </GarageStepShell>
  );
}
