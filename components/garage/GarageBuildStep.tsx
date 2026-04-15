"use client";

import type { ReactNode } from "react";
import { ProductPurchaseButton } from "../commerce/ProductPurchaseButton";
import { resolveProductCommerce } from "../../lib/commerce/resolveProductCommerce";
import type { CommerceSourceContext } from "../../lib/commerce/types";
import type { CompatibilityLabel, Product, SupabaseBike } from "../../types/garage";
import {
  GarageSectionHeader,
  GarageStepShell,
  GarageSummaryCard,
  garageEyebrowStyle,
  garagePrimaryButtonStyle,
  garageSecondaryButtonStyle,
} from "./GarageLayout";

type CategoryOption = { id: string; label: string };
type BuildSortOption = "price-low" | "price-high" | "supplier";
type BuildViewMode = "card" | "list";
type NoticeTone = { background: string; border: string; color: string };
type ActiveBuildSource = { buildId?: string | null; buildName: string } | null;

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

function buildBadgeStyle(label: CompatibilityLabel) {
  return {
    background: label === "Exact fit" ? "#dcfce7" : label === "Universal fit" ? "#dbeafe" : "#f8fafc",
    color: label === "Exact fit" ? "#166534" : label === "Universal fit" ? "#1d4ed8" : "#4b5563",
  };
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ padding: "11px 12px", borderRadius: 16, border: "1px solid #e2e8f0", background: "#ffffff" }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8" }}>
        {label}
      </div>
      <div style={{ marginTop: 3, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

type BuildProductProps = {
  categories: CategoryOption[];
  fitLabel: CompatibilityLabel;
  fitStyle: { background: string; color: string };
  formatCurrency: (value: number) => string;
  getProductSupplierName: (product: Product) => string;
  isAdded: boolean;
  isPhone: boolean;
  onAddToBuild: () => void;
  onOpenDetail: () => void;
  onOpenPurchase: () => void;
  product: Product;
};

function BuildProductCard({
  categories,
  fitLabel,
  fitStyle,
  formatCurrency,
  getProductSupplierName,
  isAdded,
  onAddToBuild,
  onOpenDetail,
  onOpenPurchase,
  product,
}: Omit<BuildProductProps, "isPhone">) {
  const commerce = resolveProductCommerce({ product });

  return (
    <div
      onClick={onOpenDetail}
      style={{
        background: "#ffffff",
        borderRadius: 24,
        overflow: "hidden",
        border: isAdded ? "1px solid #cbd5e1" : "1px solid #e2e8f0",
        boxShadow: isAdded ? "0 18px 34px rgba(15,23,42,0.10)" : "0 12px 28px rgba(15,23,42,0.07)",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
      }}
    >
      <div style={{ height: 152, backgroundImage: `url(${product.image})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#f8fafc" }} />
      <div style={{ padding: 14, display: "grid", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 700 }}>
              {getProductSupplierName(product)}
            </div>
            <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.28, color: "#0f172a" }}>{product.name}</h3>
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, whiteSpace: "nowrap", color: "#111827" }}>{formatCurrency(product.price)}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569" }}>
            {categories.find((item) => item.id === product.categoryId)?.label || "Category"}
          </span>
          {isAdded ? <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>In build</span> : null}
          <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: "1px solid #e2e8f0", ...fitStyle }}>
            {fitLabel}
          </span>
        </div>
        <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.45, fontSize: 12 }}>{product.description}</p>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 10, borderTop: "1px solid #eef2f7" }}>
          <div style={{ display: "grid", gap: 2 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>Planning price</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{formatCurrency(product.price)}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" onClick={(event) => { event.stopPropagation(); onAddToBuild(); }} style={{ minWidth: 116, padding: "10px 12px", borderRadius: 14, background: isAdded ? "#111827" : "#ffffff", color: isAdded ? "#ffffff" : "#111827", fontWeight: 700, cursor: "pointer", border: isAdded ? "1px solid #111827" : "1px solid #cbd5e1" }}>
              {isAdded ? "Remove" : "Add to build"}
            </button>
            <div onClick={(event) => event.stopPropagation()}>
              <ProductPurchaseButton commerce={commerce} compact onOpen={onOpenPurchase} />
            </div>
          </div>
        </div>
      </div>
    </div>
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
  onAddToBuild,
  onOpenDetail,
  onOpenPurchase,
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
        gridTemplateColumns: isPhone ? "72px minmax(0, 1fr)" : "96px minmax(0, 1fr) minmax(0, 208px)",
        gap: isPhone ? 12 : 16,
        alignItems: "start",
        padding: isPhone ? 14 : 16,
        borderRadius: 20,
        border: isAdded ? "1px solid #cbd5e1" : "1px solid #e2e8f0",
        background: "#ffffff",
        boxShadow: isAdded ? "0 14px 28px rgba(15,23,42,0.09)" : "0 8px 18px rgba(15,23,42,0.05)",
        cursor: "pointer",
      }}
    >
      <div style={{ width: isPhone ? 72 : 96, height: isPhone ? 72 : 88, borderRadius: 14, backgroundImage: `url(${product.image})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#f8fafc" }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700 }}>{getProductSupplierName(product)}</span>
          <span style={{ width: 4, height: 4, borderRadius: 999, background: "#cbd5e1" }} />
          <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.7, fontWeight: 700 }}>{categories.find((item) => item.id === product.categoryId)?.label || "Category"}</span>
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", lineHeight: 1.28, marginBottom: 6 }}>{product.name}</div>
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 10 }}>{product.description}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, ...fitStyle }}>{fitLabel}</span>
          <div onClick={(event) => event.stopPropagation()}>
            <ProductPurchaseButton commerce={commerce} compact onOpen={onOpenPurchase} />
          </div>
          {isAdded ? <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#e0f2fe", color: "#0f766e", border: "1px solid #bae6fd" }}>In build</span> : null}
        </div>
        {isPhone ? (
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <button type="button" onClick={(event) => { event.stopPropagation(); onAddToBuild(); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, background: isAdded ? "#111827" : "#ffffff", color: isAdded ? "#ffffff" : "#111827", fontWeight: 700, cursor: "pointer", border: isAdded ? "1px solid #111827" : "1px solid #cbd5e1" }}>
              {isAdded ? "Remove" : "Add to build"}
            </button>
          </div>
        ) : null}
      </div>
      {!isPhone ? (
        <div style={{ maxWidth: 208, width: "100%", display: "grid", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{formatCurrency(product.price)}</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", fontWeight: 700 }}>Planning price</div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <button type="button" onClick={(event) => { event.stopPropagation(); onAddToBuild(); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, background: isAdded ? "#111827" : "#ffffff", color: isAdded ? "#ffffff" : "#111827", fontWeight: 700, cursor: "pointer", border: isAdded ? "1px solid #111827" : "1px solid #cbd5e1" }}>
              {isAdded ? "Remove" : "Add to build"}
            </button>
            <button type="button" onClick={(event) => { event.stopPropagation(); onOpenDetail(); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#ffffff", color: "#111827", fontWeight: 700, cursor: "pointer" }}>
              View product
            </button>
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
  const buildTitle = activeWorkingGarageBuildSource?.buildName || buildNameInput || "Untitled build";

  const renderProduct = (product: Product) => {
    const isAdded = selectedProducts.some((item) => item.id === product.id);
    const fitLabel = getCompatibilityLabel(product, activeCompatibilityBikeId || "");
    const fitStyle = buildBadgeStyle(fitLabel);
    const openPurchase = () => onOpenProductPurchase({ product, sourceContext: "product-browser" });
    const toggleBuildSelection = () => (isAdded ? onRemoveFromBuild(product.id) : onAddToBuild(product));

    if (buildViewModeResolved === "card") {
      return (
        <BuildProductCard
          key={product.id}
          categories={categories}
          fitLabel={fitLabel}
          fitStyle={fitStyle}
          formatCurrency={formatCurrency}
          getProductSupplierName={getProductSupplierName}
          isAdded={isAdded}
          onAddToBuild={toggleBuildSelection}
          onOpenDetail={() => onOpenProductDetail(product)}
          onOpenPurchase={openPurchase}
          product={product}
        />
      );
    }

    return (
      <BuildProductRow
        categories={categories}
        fitLabel={fitLabel}
        fitStyle={fitStyle}
        formatCurrency={formatCurrency}
        getProductSupplierName={getProductSupplierName}
        isAdded={isAdded}
        isPhone={isPhone}
        onAddToBuild={toggleBuildSelection}
        onOpenDetail={() => onOpenProductDetail(product)}
        onOpenPurchase={openPurchase}
        product={product}
      />
    );
  };

  return (
    <GarageStepShell isPhone={isPhone}>
      <section id="build-step" style={{ display: "grid", gridTemplateColumns: isDesktop ? "minmax(0, 1.2fr) minmax(340px, 0.92fr)" : "1fr", gap: isDesktop ? 22 : 16, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <GarageSummaryCard
            eyebrow="Current build"
            title={buildTitle}
            description={currentBike ? currentGarageBikeLabel : "Choose a bike to start building."}
            actions={
              <>
                <button type="button" onClick={onGoToBike} style={{ ...garageSecondaryButtonStyle, width: "auto" }}>Change bike</button>
                <button type="button" onClick={onOpenBuildSaveDialog} disabled={!canOpenBuildSaveDialog} style={{ ...garagePrimaryButtonStyle, width: "auto", background: canOpenBuildSaveDialog ? "#0f172a" : "#94a3b8", cursor: canOpenBuildSaveDialog ? "pointer" : "not-allowed" }}>Save build</button>
              </>
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: isPhone ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))", gap: 10 }}>
              <Metric label="Items" value={selectedProducts.length} />
              <Metric label="Ready to shop" value={selectedProductsCommerceSummary.readyCount} />
              <Metric label="Compatible" value={compatibleCount} />
              <Metric label="Planned total" value={formatCurrency(selectedProducts.reduce((total, item) => total + item.price, 0))} />
            </div>
          </GarageSummaryCard>

          <div style={{ background: "#ffffff", borderRadius: 24, padding: isPhone ? 16 : 20, border: "1px solid #e5e7eb", boxShadow: "0 16px 34px rgba(15,23,42,0.08)", display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ ...garageEyebrowStyle, letterSpacing: 1 }}>Build setup</div>
              <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.05, color: "#0f172a" }}>Build your setup</h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#64748b", maxWidth: 720 }}>Filter quickly, scan fit at a glance, and add the items that belong in this build.</p>
            </div>
            <input type="text" value={searchTerm} onChange={(event) => onSearchTermChange(event.target.value)} placeholder="Search products (e.g. panniers, BMW, lights...)" style={{ width: "100%", maxWidth: 560, padding: "12px 14px", borderRadius: 12, border: "1px solid #d1d5db", fontSize: 14, outline: "none", background: "#ffffff" }} />
            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "#374151" }}>
                <input type="checkbox" checked={showExactFitOnly} onChange={(event) => onShowExactFitOnlyChange(event.target.checked)} />
                <span>Exact fit only</span>
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: "1px solid #d1d5db", background: "#ffffff", fontSize: 14 }}>
                <input type="checkbox" checked={onlyCompatible} onChange={(event) => onOnlyCompatibleChange(event.target.checked)} />
                Show compatible items only
              </label>
            </div>
            <div style={{ display: "flex", flexWrap: isPhone ? "nowrap" : "wrap", gap: 10, overflowX: "auto", padding: isPhone ? 10 : 14, borderRadius: 18, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
              {categories.map((category) => {
                const active = selectedCategory === category.id;
                return (
                  <button key={category.id} type="button" onClick={() => onSelectCategory(category.id)} style={{ padding: "11px 16px", borderRadius: 999, border: active ? "1px solid #0f172a" : "1px solid #cbd5e1", background: active ? "#0f172a" : "#ffffff", color: active ? "#ffffff" : "#0f172a", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          <section style={{ background: "#ffffff", borderRadius: 24, padding: isPhone ? 16 : 20, border: "1px solid #e5e7eb", boxShadow: "0 14px 30px rgba(15,23,42,0.07)" }}>
            <GarageSectionHeader eyebrow="Product browser" title="Compatible accessories" description="Review curated options for this bike, compare fit labels at a glance, and add items directly to your build." actions={<div style={{ display: "grid", gap: 8, minWidth: 220 }}><div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 12px", borderRadius: 16, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{buildProducts.length} products</div><div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 12px", borderRadius: 16, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 12, fontWeight: 700, color: "#475569" }}>{categories.find((item) => item.id === selectedCategory)?.label || "All categories"}</div></div>} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16, padding: "10px 12px", borderRadius: 18, border: "1px solid #e2e8f0", background: "linear-gradient(180deg, #fbfdff 0%, #f8fafc 100%)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: "1 1 560px", minWidth: 0 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>Sort</span>
                  <select value={buildSortOption} onChange={(event) => onBuildSortOptionChange(event.target.value as BuildSortOption)} style={{ minHeight: 38, padding: "8px 11px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: 13, outline: "none", minWidth: 190 }}>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </label>
                <div style={{ minHeight: 38, display: "inline-flex", alignItems: "center", padding: "8px 12px", borderRadius: 999, border: "1px solid #dbe3ee", background: "#ffffff", color: "#0f172a", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{buildProducts.length} results</div>
                <button type="button" onClick={onResetFilters} style={{ ...garageSecondaryButtonStyle, minHeight: 38, padding: "8px 12px", fontSize: 12 }}>Reset filters</button>
              </div>
              {!isPhone ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>View</span><div style={{ display: "inline-flex", padding: 3, borderRadius: 999, border: "1px solid #cbd5e1", background: "#ffffff", gap: 3 }}><button type="button" onClick={() => onBuildViewModeChange("card")} style={{ minHeight: 32, padding: "6px 10px", borderRadius: 999, border: "none", background: buildViewMode === "card" ? "#0f172a" : "transparent", color: buildViewMode === "card" ? "#ffffff" : "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Card view</button><button type="button" onClick={() => onBuildViewModeChange("list")} style={{ minHeight: 32, padding: "6px 10px", borderRadius: 999, border: "none", background: buildViewMode === "list" ? "#0f172a" : "transparent", color: buildViewMode === "list" ? "#ffffff" : "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>List view</button></div></div> : null}
            </div>
            {buildProducts.length === 0 ? <div style={{ marginBottom: 4, padding: "14px 16px", borderRadius: 16, background: "#f8fafc", border: "1px solid #e5e7eb", color: "#475569", fontSize: 14, fontWeight: 600 }}>No matching accessories yet. Try another category or widen the fit filters.</div> : <div style={{ display: "grid", gridTemplateColumns: buildViewModeResolved === "card" ? "repeat(auto-fit, minmax(240px, 1fr))" : "1fr", gap: 14 }}>{buildProducts.map(renderProduct)}</div>}
          </section>
        </div>

        <aside key={currentBike?.id || "no-bike"} style={{ background: "#ffffff", borderRadius: 24, padding: isPhone ? 16 : 18, boxShadow: currentBike ? "0 16px 34px rgba(15,23,42,0.10)" : "0 12px 28px rgba(15,23,42,0.08)", border: currentBike ? "1px solid rgba(15,23,42,0.14)" : "1px solid #e5e7eb", position: isDesktop ? "sticky" : "static", top: isDesktop ? 16 : undefined, maxHeight: isDesktop ? "min(960px, calc(100vh - 20px))" : "none", overflow: isDesktop ? "hidden" : "visible", display: "grid", gridTemplateRows: isDesktop ? "auto auto auto minmax(0, 1fr) auto" : "auto auto auto auto auto", gap: 14 }}>
          {!currentBike ? <div style={{ textAlign: "center", padding: "40px 10px", color: "#6b7280" }}><div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No bike selected</div><div style={{ fontSize: 13 }}>Choose your make, model and year to start building.</div></div> : null}
          <div style={{ display: "grid", gap: 6 }}>
            <h3 style={{ margin: 0, fontSize: 24, color: "#0f172a", lineHeight: 1.08 }}>Plan your setup</h3>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#64748b", maxWidth: 420 }}>Review the products already in this build, then save, compare, or keep refining the setup.</p>
          </div>
          {saveMessage ? <div style={{ background: getGarageNoticeTone(saveMessage).background, border: `1px solid ${getGarageNoticeTone(saveMessage).border}`, color: getGarageNoticeTone(saveMessage).color, padding: "10px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, lineHeight: 1.45 }}>{saveMessage}</div> : null}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 14, alignItems: "start", padding: "14px 0 16px", borderTop: "1px solid #eef2f7", borderBottom: "1px solid #eef2f7" }}>
            <div style={{ minWidth: 0, display: "grid", gap: 4 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{currentBike ? currentGarageBikeLabel : "No bike selected"}</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>{activeWorkingGarageBuildSource ? `Editing saved build: ${activeWorkingGarageBuildSource.buildName}` : "Working in a new unsaved build session"}</div>
            </div>
            <div style={{ display: "grid", gap: 4, justifyItems: "end", textAlign: "right", fontSize: 12, color: "#475569", lineHeight: 1.4, whiteSpace: "nowrap" }}>
              <div>{selectedProducts.length} items</div>
              <div>{compatibleCount} compatible</div>
              <div>Total: <span style={{ fontWeight: 800, color: "#0f172a" }}>{formatCurrency(selectedProducts.reduce((total, item) => total + item.price, 0))}</span></div>
              {activeWorkingGarageBuildSource ? <div style={{ color: hasUnsavedGarageBuildChanges ? "#1d4ed8" : "#64748b" }}>{hasUnsavedGarageBuildChanges ? "Unsaved changes" : "Saved build linked"}</div> : null}
            </div>
          </div>
          <div style={{ display: "grid", gap: 10, minHeight: 0, overflowY: "auto", scrollbarGutter: "stable", paddingRight: 4 }}>
            {selectedProducts.map((item) => {
              const fitLabel = getCompatibilityLabel(item, activeCompatibilityBikeId || "");
              const commerce = resolveProductCommerce({ product: item });
              return (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "52px minmax(0, 1fr) auto", alignItems: "center", gap: 12, border: "1px solid #e5e7eb", borderRadius: 16, padding: "10px 12px", background: "#ffffff" }}>
                  <img src={item.image || "/bike-placeholder.jpg"} alt={item.name} onError={(event) => { (event.currentTarget as HTMLImageElement).src = "/bike-placeholder.jpg"; }} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 10, background: "#f3f4f6", flexShrink: 0 }} />
                  <div style={{ minWidth: 0, display: "grid", gap: 4 }}>
                    <div style={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2, fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.45, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span>{getProductSupplierName(item)}</span>
                      <span style={{ width: 3, height: 3, borderRadius: 999, background: "#cbd5e1" }} />
                      <span>{categories.find((category) => category.id === item.categoryId)?.label || "Category"}</span>
                      <span style={{ width: 3, height: 3, borderRadius: 999, background: "#cbd5e1" }} />
                      <span>{fitLabel}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#334155", fontWeight: 700 }}>{formatBuildWorkspacePriceLabel(item.price)}</div>
                  </div>
                  <div style={{ display: "grid", gap: 6, justifyItems: "end", alignContent: "center" }}>
                    <ProductPurchaseButton commerce={commerce} compact onOpen={() => onOpenProductPurchase({ product: item, sourceContext: "garage" })} />
                    <button type="button" onClick={() => onOpenProductDetail(item)} style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid #dbe3ee", background: "#ffffff", color: "#475569", fontWeight: 700, cursor: "pointer", fontSize: 10, whiteSpace: "nowrap" }}>Open details</button>
                    <button type="button" onClick={() => onRemoveFromBuild(item.id)} style={{ border: "none", background: "transparent", color: "#b91c1c", fontWeight: 700, cursor: "pointer", fontSize: 10, padding: 0, whiteSpace: "nowrap" }}>Remove</button>
                  </div>
                </div>
              );
            })}
            {selectedProducts.length === 0 ? <div style={{ border: "1px dashed #cbd5e1", borderRadius: 16, padding: 18, background: "#ffffff", color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>Start building by adding accessories from the product browser. You can save ideas here, compare options later, and continue to supplier sites when you are ready.</div> : null}
          </div>
          <div style={{ display: "grid", gap: 10, paddingTop: 16, borderTop: "1px solid #eef2f7" }}>
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Build planning actions</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>Save changes to this build, branch it into a new saved build, inspect expert ideas, or jump into your saved library.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))", gap: 8 }}>
              <button type="button" onClick={onOpenBuildSaveDialog} disabled={!canOpenBuildSaveDialog} style={{ ...garagePrimaryButtonStyle, background: !canOpenBuildSaveDialog ? "#9ca3af" : "#111827", cursor: !canOpenBuildSaveDialog ? "not-allowed" : "pointer", opacity: !canOpenBuildSaveDialog ? 0.75 : 1 }}>Save build</button>
              {isEditingSavedGarageBuild ? <button type="button" onClick={onOpenDuplicateBuildSaveDialog} disabled={!canOpenBuildSaveDialog} style={{ ...garageSecondaryButtonStyle, cursor: !canOpenBuildSaveDialog ? "not-allowed" : "pointer", opacity: !canOpenBuildSaveDialog ? 0.7 : 1 }}>Save as new</button> : null}
              <button type="button" onClick={onGoToExpert} disabled={selectedProducts.length === 0} style={{ ...garageSecondaryButtonStyle, cursor: selectedProducts.length === 0 ? "not-allowed" : "pointer", opacity: selectedProducts.length === 0 ? 0.7 : 1 }}>Expert builds</button>
              <button type="button" onClick={onGoToSave} style={garageSecondaryButtonStyle}>View saved builds</button>
            </div>
            {selectedProducts.length > 0 ? <div style={{ display: "grid", gap: 4, padding: "10px 12px", borderRadius: 14, border: "1px solid #e2e8f0", background: "#f8fafc" }}><div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>{selectedProductsCommerceSummary.readyCount} items ready to shop</div><div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.45 }}>{selectedProductsCommerceSummary.missingCount > 0 ? `${selectedProductsCommerceSummary.missingCount} still need vendor links.` : "Every selected item has at least one outbound path."}</div></div> : null}
          </div>
        </aside>
      </section>
    </GarageStepShell>
  );
}
