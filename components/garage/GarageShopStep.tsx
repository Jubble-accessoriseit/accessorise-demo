"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { ProductPurchaseButton } from "../commerce/ProductPurchaseButton";
import type {
  CommerceSourceContext,
  ResolvedProductCommerce,
} from "../../lib/commerce/types";
import type {
  CompatibilityLabel,
  GarageBuildRecord,
  Product,
  SupabaseBike,
} from "../../types/garage";
import {
  GarageStepShell,
  garageEyebrowStyle,
  garagePrimaryButtonStyle,
  garageSecondaryButtonStyle,
} from "./GarageLayout";

type ShopProductEntry = {
  categoryLabel: string;
  commerce: ResolvedProductCommerce;
  compatibilityLabel: CompatibilityLabel;
  product: Product;
};

type GarageShopStepProps = {
  activeProductCommerce: ResolvedProductCommerce | null;
  activeProductDetail: Product | null;
  buySelectedBike: SupabaseBike | null;
  buySelectedBikeBuilds: GarageBuildRecord[];
  buySelectedBikeBuildProductIds: Set<number>;
  buySelectedBikeCommerceSummary: {
    exactFitCount: number;
    missingCount: number;
    readyCount: number;
    savedCount: number;
  };
  buySelectedBikeId: string;
  buySelectedBikeLabel: string;
  buySelectedBuild: GarageBuildRecord | null;
  buySelectedBuildId: string;
  buySelectedBuildProductEntries: ShopProductEntry[];
  buySelectedBikeProductEntries: ShopProductEntry[];
  buySelectedBikeTemplateId: string | null;
  formatAccessoryPriceLabel: (value: number) => string;
  genericBikePlaceholder: string;
  getCategoryLabel: (categoryId: string) => string;
  getCompatibilityLabel: (product: Product, bikeId: string) => CompatibilityLabel;
  getProductSupplierName: (product: Product) => string;
  isPhone: boolean;
  onAddProductToBikeBuild: (bikeId: string, product: Product) => void;
  onBackToResults: () => void;
  onChangeSelectedBuild: (buildId: string) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenProductPurchase: (input: {
    product: Product;
    sourceContext: CommerceSourceContext;
  }) => void;
  onRemoveProductFromBikeBuild: (bikeId: string, productId: number) => void;
};

type ShopContextMode = "build" | "bike";
type ShopSortMode = "recommended" | "best-fit" | "price" | "newest";
type PriceDirection = "asc" | "desc";

function getFitLabel(label: CompatibilityLabel) {
  if (label === "Universal fit") return "Universal";
  if (label === "Not confirmed") return "Compatible";
  return "Exact fit";
}

function getFitTone(label: CompatibilityLabel) {
  if (label === "Exact fit") return { background: "#dcfce7", border: "#bbf7d0", color: "#166534" };
  if (label === "Universal fit") return { background: "#dbeafe", border: "#bfdbfe", color: "#1d4ed8" };
  return { background: "#f8fafc", border: "#e2e8f0", color: "#475569" };
}

function fitRank(label: CompatibilityLabel) {
  if (label === "Exact fit") return 0;
  if (label === "Universal fit") return 1;
  return 2;
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

function buildBikeInfoLines(bike: SupabaseBike | null) {
  if (!bike) {
    return {
      title: "No bike linked",
      detail: "Choose a bike in Garage to shop its saved builds.",
    };
  }

  const nickname = bike.nickname?.trim();
  const modelLine = [bike.make, bike.model, bike.variant || null, bike.year]
    .filter(Boolean)
    .join(" ");
  const metadata = [bike.ownershipStatus, bike.category, bike.engine_cc ? `${bike.engine_cc}cc` : null]
    .filter(Boolean)
    .join(" | ");

  return {
    title: nickname || modelLine,
    detail: nickname ? modelLine : metadata || "Saved bike context",
    metadata: nickname ? metadata : undefined,
  };
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
      <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", overflowWrap: "anywhere" }}>
        {title}
      </div>
      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.35 }}>{detail}</div>
      {metadata ? <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.3 }}>{metadata}</div> : null}
    </div>
  );
}

function FitChip({ label }: { label: CompatibilityLabel }) {
  const tone = getFitTone(label);
  return (
    <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: tone.background, border: `1px solid ${tone.border}`, color: tone.color, fontSize: 10, fontWeight: 800 }}>
      {getFitLabel(label)}
    </span>
  );
}

function ProductCard({
  bikeId,
  categoryLabel,
  commerce,
  compatibilityLabel,
  formatAccessoryPriceLabel,
  genericBikePlaceholder,
  inBuild,
  isPhone,
  onOpenProductDetail,
  onOpenProductPurchase,
  onToggleBuild,
  product,
}: {
  bikeId: string;
  categoryLabel: string;
  commerce: ResolvedProductCommerce;
  compatibilityLabel: CompatibilityLabel;
  formatAccessoryPriceLabel: (value: number) => string;
  genericBikePlaceholder: string;
  inBuild: boolean;
  isPhone: boolean;
  onOpenProductDetail: (product: Product) => void;
  onOpenProductPurchase: (input: { product: Product; sourceContext: CommerceSourceContext }) => void;
  onToggleBuild: () => void;
  product: Product;
}) {
  return (
    <article style={{ display: "grid", gap: 8, padding: 10, borderRadius: 16, border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 8px 18px rgba(15,23,42,0.04)", minWidth: 0 }}>
      <button
        type="button"
        onClick={() => onOpenProductDetail(product)}
        style={{ display: "grid", gap: 8, padding: 0, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", minWidth: 0 }}
      >
        <div style={{ aspectRatio: isPhone ? "1 / 1" : "1.14 / 1", borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <img
            src={product.image || genericBikePlaceholder}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.src = genericBikePlaceholder;
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        <div style={{ display: "grid", gap: 5, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <FitChip label={compatibilityLabel} />
            {inBuild ? <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#047857", fontSize: 10, fontWeight: 800 }}>In this build</span> : null}
          </div>

          <div style={{ display: "grid", gap: 3, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{product.brand}</div>
            <div style={{ fontSize: isPhone ? 12 : 13, fontWeight: 800, color: "#0f172a", lineHeight: 1.25, overflowWrap: "anywhere" }}>
              {product.name}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.3 }}>
              {categoryLabel}
              {product.subcategory ? ` | ${product.subcategory}` : ""}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{formatAccessoryPriceLabel(product.price)}</div>
            <div style={{ fontSize: 10, color: "#64748b", textAlign: "right" }}>
              {commerce.hasPurchaseOptions ? `${commerce.links.length} offer${commerce.links.length === 1 ? "" : "s"}` : "Link pending"}
            </div>
          </div>
        </div>
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 8 }}>
        <button
          type="button"
          onClick={onToggleBuild}
          style={{ ...(inBuild ? garageSecondaryButtonStyle : garagePrimaryButtonStyle), minHeight: 32, padding: "6px 8px", borderRadius: 10, fontSize: 10, fontWeight: 800 }}
        >
          {inBuild ? "Remove from build" : "Save to build"}
        </button>
        <ProductPurchaseButton compact commerce={commerce} onOpen={() => onOpenProductPurchase({ product, sourceContext: bikeId ? "garage" : "product-detail" })} />
      </div>
    </article>
  );
}

export function GarageShopStep({
  activeProductCommerce,
  activeProductDetail,
  buySelectedBike,
  buySelectedBikeBuilds,
  buySelectedBikeBuildProductIds,
  buySelectedBikeCommerceSummary,
  buySelectedBikeId,
  buySelectedBikeLabel,
  buySelectedBuild,
  buySelectedBuildId,
  buySelectedBuildProductEntries,
  buySelectedBikeProductEntries,
  buySelectedBikeTemplateId,
  formatAccessoryPriceLabel,
  genericBikePlaceholder,
  getCategoryLabel,
  getCompatibilityLabel,
  getProductSupplierName,
  isPhone,
  onAddProductToBikeBuild,
  onBackToResults,
  onChangeSelectedBuild,
  onOpenProductDetail,
  onOpenProductPurchase,
  onRemoveProductFromBikeBuild,
}: GarageShopStepProps) {
  const isDesktop = !isPhone;
  const [contextMode, setContextMode] = useState<ShopContextMode>(
    buySelectedBuild ? "build" : "bike"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortMode, setSortMode] = useState<ShopSortMode>("recommended");
  const [priceDirection, setPriceDirection] = useState<PriceDirection>("asc");
  const [exactFitOnly, setExactFitOnly] = useState(false);
  const [compatibleOnly, setCompatibleOnly] = useState(true);

  useEffect(() => {
    setContextMode(buySelectedBuild ? "build" : "bike");
    setSelectedCategory("all");
    setSelectedBrand("all");
  }, [buySelectedBikeId, buySelectedBuild?.id]);

  const sourceEntries =
    contextMode === "build" && buySelectedBuild
      ? buySelectedBuildProductEntries
      : buySelectedBikeProductEntries;

  const brandOptions = useMemo(() => {
    const brands = new Set<string>();
    sourceEntries.forEach((entry) => brands.add(entry.product.brand));
    return ["all", ...Array.from(brands).sort((a, b) => a.localeCompare(b))];
  }, [sourceEntries]);

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    sourceEntries.forEach((entry) => {
      counts.set(entry.product.categoryId, (counts.get(entry.product.categoryId) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([categoryId, count]) => ({ categoryId, count, label: getCategoryLabel(categoryId) }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [getCategoryLabel, sourceEntries]);

  const filteredEntries = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return sourceEntries.filter((entry) => {
      if (selectedBrand !== "all" && entry.product.brand !== selectedBrand) return false;
      if (selectedCategory !== "all" && entry.product.categoryId !== selectedCategory) return false;
      if (exactFitOnly && entry.compatibilityLabel !== "Exact fit") return false;
      if (!compatibleOnly && entry.compatibilityLabel === "Not confirmed") return false;
      if (!needle) return true;

      const haystack = [entry.product.name, entry.product.brand, entry.categoryLabel, entry.product.subcategory ?? "", entry.product.description].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [compatibleOnly, exactFitOnly, searchTerm, selectedBrand, selectedCategory, sourceEntries]);

  useEffect(() => {
    if (
      selectedBrand !== "all" &&
      !brandOptions.some((brand) => brand === selectedBrand)
    ) {
      setSelectedBrand("all");
    }
  }, [brandOptions, selectedBrand]);

  useEffect(() => {
    if (
      selectedCategory !== "all" &&
      !categoryOptions.some((category) => category.categoryId === selectedCategory)
    ) {
      setSelectedCategory("all");
    }
  }, [categoryOptions, selectedCategory]);

  const displayedEntries = useMemo(() => {
    const next = [...filteredEntries];
    next.sort((left, right) => {
      if (sortMode === "price") {
        return priceDirection === "asc" ? left.product.price - right.product.price : right.product.price - left.product.price;
      }
      if (sortMode === "newest") {
        return right.product.featuredOrder - left.product.featuredOrder;
      }
      if (sortMode === "best-fit") {
        const byFit = fitRank(left.compatibilityLabel) - fitRank(right.compatibilityLabel);
        if (byFit !== 0) return byFit;
        return left.product.featuredOrder - right.product.featuredOrder;
      }

      const leftInBuild = buySelectedBikeBuildProductIds.has(left.product.id);
      const rightInBuild = buySelectedBikeBuildProductIds.has(right.product.id);
      if (leftInBuild !== rightInBuild) return leftInBuild ? -1 : 1;

      const byFit = fitRank(left.compatibilityLabel) - fitRank(right.compatibilityLabel);
      if (byFit !== 0) return byFit;

      const leftReady = left.commerce.hasPurchaseOptions ? 0 : 1;
      const rightReady = right.commerce.hasPurchaseOptions ? 0 : 1;
      if (leftReady !== rightReady) return leftReady - rightReady;

      return left.product.featuredOrder - right.product.featuredOrder;
    });
    return next;
  }, [buySelectedBikeBuildProductIds, filteredEntries, priceDirection, sortMode]);

  const hasSavedBuildContext = buySelectedBikeBuilds.length > 0;
  const selectedBuildLabel = buySelectedBuild?.name?.trim() || "Saved build";
  const bikeInfo = buildBikeInfoLines(buySelectedBike);
  const resultsContextLabel =
    contextMode === "build" && buySelectedBuild
      ? selectedBuildLabel
      : buySelectedBikeLabel || "this bike";
  const isBuildScopedEmpty =
    contextMode === "build" && !!buySelectedBuild && buySelectedBuildProductEntries.length === 0;

  const selectedProductCompatibility =
    activeProductDetail && buySelectedBikeTemplateId ? getCompatibilityLabel(activeProductDetail, buySelectedBikeTemplateId) : null;

  const detailInBuild = !!activeProductDetail && buySelectedBikeBuildProductIds.has(activeProductDetail.id);

  return (
    <GarageStepShell isPhone={isPhone} maxWidth={1440} paddingBottom={36}>
      {activeProductDetail && activeProductCommerce ? (
        <section style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" onClick={onBackToResults} style={{ ...garageSecondaryButtonStyle, minHeight: 38, fontSize: 12 }}>
              Back to catalogue
            </button>
            {selectedProductCompatibility ? <FitChip label={selectedProductCompatibility} /> : null}
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{getCategoryLabel(activeProductDetail.categoryId)}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isPhone ? "minmax(0, 1fr)" : "minmax(320px, 440px) minmax(0, 1fr)", gap: 16 }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ aspectRatio: "1 / 1", borderRadius: 24, overflow: "hidden", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <img
                  src={activeProductDetail.image || genericBikePlaceholder}
                  alt={activeProductDetail.name}
                  onError={(event) => {
                    event.currentTarget.src = genericBikePlaceholder;
                  }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                <StatPill label="Bike" value={buySelectedBikeLabel || "Choose"} />
                <StatPill label="Brand" value={activeProductDetail.brand} />
                <StatPill label="Price" value={formatAccessoryPriceLabel(activeProductDetail.price)} />
                <StatPill label="Offers" value={activeProductCommerce.hasPurchaseOptions ? `${activeProductCommerce.links.length}` : "Pending"} />
              </div>
            </div>

            <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ ...garageEyebrowStyle }}>Shop Detail</div>
                <h2 style={{ margin: 0, fontSize: isPhone ? 28 : 34, lineHeight: 1.05, color: "#0f172a" }}>{activeProductDetail.name}</h2>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{getProductSupplierName(activeProductDetail)}</span>
                  {detailInBuild ? <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#047857", fontSize: 10, fontWeight: 800 }}>In this build</span> : null}
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#475569" }}>{activeProductDetail.description}</p>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() =>
                    detailInBuild ? onRemoveProductFromBikeBuild(buySelectedBikeId, activeProductDetail.id) : onAddProductToBikeBuild(buySelectedBikeId, activeProductDetail)
                  }
                  style={{ ...(detailInBuild ? garageSecondaryButtonStyle : garagePrimaryButtonStyle), minHeight: 40, fontSize: 12 }}
                >
                  {detailInBuild ? "Remove from build" : "Save to build"}
                </button>
                <ProductPurchaseButton commerce={activeProductCommerce} onOpen={() => onOpenProductPurchase({ product: activeProductDetail, sourceContext: "product-detail" })} />
              </div>

              <div style={{ display: "grid", gap: 10, padding: 16, borderRadius: 18, border: "1px solid #e2e8f0", background: "#ffffff" }}>
                <div style={{ ...garageEyebrowStyle }}>Retailer Links</div>
                {activeProductCommerce.hasPurchaseOptions ? (
                  activeProductCommerce.links.map((link) => (
                    <a
                      key={`${link.url}-${link.vendorName}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", textDecoration: "none", padding: "11px 12px", borderRadius: 14, border: "1px solid #dbe3ee", color: "#0f172a", background: "#f8fafc", fontSize: 13 }}
                    >
                      <span style={{ fontWeight: 700 }}>{link.vendorName}</span>
                      <span style={{ color: "#64748b", fontWeight: 700 }}>{link.label || "View offer"}</span>
                    </a>
                  ))
                ) : (
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: "#64748b" }}>
                    We have fitment confidence for this product, but the purchase link still needs confirming.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gap: 6, padding: isPhone ? 10 : 12, borderRadius: 16, border: "1px solid #e2e8f0", background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "grid", gap: 8, minWidth: 0, flex: "1 1 580px" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ ...garageEyebrowStyle, flex: "0 0 auto" }}>Shop</span>
                  <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                    {buySelectedBikeLabel || "No bike selected"}
                  </div>
                  {buySelectedBikeCommerceSummary.savedCount > 0 ? (
                    <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                      {buySelectedBikeCommerceSummary.savedCount} saved item{buySelectedBikeCommerceSummary.savedCount === 1 ? "" : "s"}
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isPhone
                      ? "minmax(0, 1fr)"
                      : "minmax(220px, 280px) minmax(220px, 1fr)",
                    gap: 8,
                    alignItems: "stretch",
                  }}
                >
                  {hasSavedBuildContext ? (
                    <div style={{ display: "grid", gap: 5, minWidth: 0 }}>
                      <div style={{ ...garageEyebrowStyle, fontSize: 10 }}>Saved build</div>
                      <select
                        value={buySelectedBuildId}
                        onChange={(event) => onChangeSelectedBuild(event.target.value)}
                        style={{ ...controlStyle(isPhone), minHeight: 38, padding: "8px 10px" }}
                      >
                        {buySelectedBikeBuilds.map((build) => (
                          <option key={build.id} value={build.id}>
                            {build.name?.trim() || `Saved build ${build.updatedAt.slice(0, 10)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <PassiveInfoBox
                      eyebrow="Saved build"
                      title="No saved builds yet"
                      detail="Save a build from Build or Saved to shop that exact setup here."
                    />
                  )}

                  <PassiveInfoBox
                    eyebrow="Linked bike"
                    title={bikeInfo.title}
                    detail={bikeInfo.detail}
                    metadata={bikeInfo.metadata}
                  />
                </div>
              </div>
              <div style={{ display: "inline-flex", gap: 4, padding: 3, borderRadius: 999, border: "1px solid #dbe3ee", background: "#f8fafc", width: isPhone ? "100%" : "auto" }}>
                {(["build", "bike"] as const).map((mode) => {
                  const isActive = contextMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      disabled={mode === "build" && !buySelectedBuild}
                      onClick={() => setContextMode(mode)}
                      style={{
                        minHeight: 30,
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "none",
                        background: isActive ? "#0f172a" : "transparent",
                        color: mode === "build" && !buySelectedBuild ? "#94a3b8" : isActive ? "#ffffff" : "#475569",
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: mode === "build" && !buySelectedBuild ? "not-allowed" : "pointer",
                        opacity: mode === "build" && !buySelectedBuild ? 0.7 : 1,
                        flex: isPhone ? "1 1 0" : "0 0 auto",
                      }}
                    >
                      {mode === "build" ? "This build" : "All products for this bike"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {!buySelectedBike ? (
            <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Choose a bike to start shopping</div>
              <div style={{ fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                Pick a saved bike and the catalogue will switch to fitment-aware results for that bike.
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
                  <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search luggage, tyres, protection..." style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }} />
                </FilterField>
                <FilterField label="Browse mode">
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ display: "inline-flex", gap: 4, padding: 3, borderRadius: 999, border: "1px solid #dbe3ee", background: "#f8fafc", width: "100%" }}>
                      {(["build", "bike"] as const).map((mode) => {
                        const isActive = contextMode === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            disabled={mode === "build" && !buySelectedBuild}
                            onClick={() => setContextMode(mode)}
                            style={{
                              minHeight: 30,
                              padding: "6px 10px",
                              borderRadius: 999,
                              border: "none",
                              background: isActive ? "#0f172a" : "transparent",
                              color: mode === "build" && !buySelectedBuild ? "#94a3b8" : isActive ? "#ffffff" : "#475569",
                              fontSize: 11,
                              fontWeight: 800,
                              cursor: mode === "build" && !buySelectedBuild ? "not-allowed" : "pointer",
                              opacity: mode === "build" && !buySelectedBuild ? 0.7 : 1,
                              flex: "1 1 0",
                            }}
                          >
                            {mode === "build" ? "This build" : "All bike products"}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {buySelectedBuild ? (
                        <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                          {selectedBuildLabel}
                        </div>
                      ) : null}
                      {buySelectedBikeCommerceSummary.savedCount > 0 ? (
                        <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                          {buySelectedBikeCommerceSummary.savedCount} saved item{buySelectedBikeCommerceSummary.savedCount === 1 ? "" : "s"}
                        </div>
                      ) : null}
                      <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                        {buySelectedBikeCommerceSummary.readyCount} ready now
                      </div>
                    </div>
                  </div>
                </FilterField>
                <FilterField label="Brand">
                  <select value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)} style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }}>
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand === "all" ? "All brands" : brand}
                      </option>
                    ))}
                  </select>
                </FilterField>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  <FilterField label="Sort by">
                    <select value={sortMode} onChange={(event) => setSortMode(event.target.value as ShopSortMode)} style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }}>
                      <option value="recommended">Recommended</option>
                      <option value="best-fit">Best fit</option>
                      <option value="price">Price</option>
                      <option value="newest">Newest</option>
                    </select>
                  </FilterField>
                  <FilterField label="Price">
                    <select value={priceDirection} onChange={(event) => setPriceDirection(event.target.value as PriceDirection)} style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }}>
                      <option value="asc">Low to high</option>
                      <option value="desc">High to low</option>
                    </select>
                  </FilterField>
                </div>
                <FilterField label="Fitment">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <ToggleChip active={exactFitOnly} label="Exact fit only" onClick={() => setExactFitOnly((value) => !value)} />
                    <ToggleChip active={compatibleOnly} label="Show compatible" onClick={() => setCompatibleOnly((value) => !value)} />
                  </div>
                </FilterField>
                <FilterField label="Categories">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <CategoryChip active={selectedCategory === "all"} count={sourceEntries.length} label="All categories" onClick={() => setSelectedCategory("all")} />
                    {categoryOptions.map((category) => (
                      <CategoryChip key={category.categoryId} active={selectedCategory === category.categoryId} count={category.count} label={category.label} onClick={() => setSelectedCategory(category.categoryId)} />
                    ))}
                  </div>
                </FilterField>
              </aside>

              {isBuildScopedEmpty ? (
                <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{selectedBuildLabel} has no saved accessories yet</div>
                  <div style={{ fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                    Stay in This build to view this saved setup, or switch to all products for this bike to keep browsing.
                  </div>
                </div>
              ) : displayedEntries.length === 0 ? (
                <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>No products match this filter set</div>
                  <div style={{ fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                    Try a broader category, turn compatible items back on, or switch from build mode to all products for this bike.
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ ...garageEyebrowStyle, fontSize: 10 }}>
                      {displayedEntries.length} product{displayedEntries.length === 1 ? "" : "s"} for {resultsContextLabel}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {selectedCategory !== "all" ? (
                        <div style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>
                          {categoryOptions.find((category) => category.categoryId === selectedCategory)?.label || "Category"}
                        </div>
                      ) : null}
                      {exactFitOnly ? <FitChip label="Exact fit" /> : null}
                      {!compatibleOnly ? <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>Confirmed matches only</span> : null}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
                    {displayedEntries.map((entry) => {
                      const inBuild = buySelectedBikeBuildProductIds.has(entry.product.id);
                      return (
                        <ProductCard
                          key={entry.product.id}
                          bikeId={buySelectedBikeId}
                          categoryLabel={entry.categoryLabel}
                          commerce={entry.commerce}
                          compatibilityLabel={entry.compatibilityLabel}
                          formatAccessoryPriceLabel={formatAccessoryPriceLabel}
                          genericBikePlaceholder={genericBikePlaceholder}
                          inBuild={inBuild}
                          isPhone={isPhone}
                          onOpenProductDetail={onOpenProductDetail}
                          onOpenProductPurchase={onOpenProductPurchase}
                          onToggleBuild={() =>
                            inBuild ? onRemoveProductFromBikeBuild(buySelectedBikeId, entry.product.id) : onAddProductToBikeBuild(buySelectedBikeId, entry.product)
                          }
                          product={entry.product}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 8 }}>
                  <FilterField label="Search products">
                    <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search luggage, tyres, protection..." style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }} />
                  </FilterField>
                  <FilterField label="Select a brand">
                    <select value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)} style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }}>
                      {brandOptions.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand === "all" ? "All brands" : brand}
                        </option>
                      ))}
                    </select>
                  </FilterField>
                  <FilterField label="Sort by">
                    <select value={sortMode} onChange={(event) => setSortMode(event.target.value as ShopSortMode)} style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }}>
                      <option value="recommended">Recommended</option>
                      <option value="best-fit">Best fit</option>
                      <option value="price">Price</option>
                      <option value="newest">Newest</option>
                    </select>
                  </FilterField>
                  <FilterField label="Price direction">
                    <select value={priceDirection} onChange={(event) => setPriceDirection(event.target.value as PriceDirection)} style={{ ...controlStyle(isPhone), minHeight: 36, padding: "8px 10px" }}>
                      <option value="asc">Low to high</option>
                      <option value="desc">High to low</option>
                    </select>
                  </FilterField>
                  <FilterField label="Fitment">
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <ToggleChip active={exactFitOnly} label="Exact fit only" onClick={() => setExactFitOnly((value) => !value)} />
                    </div>
                  </FilterField>
                  <FilterField label="Compatibility">
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <ToggleChip active={compatibleOnly} label="Show compatible" onClick={() => setCompatibleOnly((value) => !value)} />
                    </div>
                  </FilterField>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                <CategoryChip active={selectedCategory === "all"} count={sourceEntries.length} label="All categories" onClick={() => setSelectedCategory("all")} />
                {categoryOptions.map((category) => (
                  <CategoryChip key={category.categoryId} active={selectedCategory === category.categoryId} count={category.count} label={category.label} onClick={() => setSelectedCategory(category.categoryId)} />
                ))}
              </div>

              {isBuildScopedEmpty ? (
                <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{selectedBuildLabel} has no saved accessories yet</div>
                  <div style={{ fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                    Switch to all products for this bike whenever you want broader browsing.
                  </div>
                </div>
              ) : displayedEntries.length === 0 ? (
                <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 16, padding: 16, display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>No products match this filter set</div>
                  <div style={{ fontSize: 13, lineHeight: 1.45, color: "#64748b" }}>
                    Try a broader category, turn compatible items back on, or switch from build mode to all products for this bike.
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ ...garageEyebrowStyle, fontSize: 10 }}>
                      {displayedEntries.length} product{displayedEntries.length === 1 ? "" : "s"} in {contextMode === "build" ? resultsContextLabel : "All products for this bike"}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {exactFitOnly ? <FitChip label="Exact fit" /> : null}
                      {!compatibleOnly ? <span style={{ display: "inline-flex", padding: "4px 8px", borderRadius: 999, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 10, fontWeight: 800 }}>Confirmed matches only</span> : null}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                    {displayedEntries.map((entry) => {
                      const inBuild = buySelectedBikeBuildProductIds.has(entry.product.id);
                      return (
                        <ProductCard
                          key={entry.product.id}
                          bikeId={buySelectedBikeId}
                          categoryLabel={entry.categoryLabel}
                          commerce={entry.commerce}
                          compatibilityLabel={entry.compatibilityLabel}
                          formatAccessoryPriceLabel={formatAccessoryPriceLabel}
                          genericBikePlaceholder={genericBikePlaceholder}
                          inBuild={inBuild}
                          isPhone={isPhone}
                          onOpenProductDetail={onOpenProductDetail}
                          onOpenProductPurchase={onOpenProductPurchase}
                          onToggleBuild={() =>
                            inBuild ? onRemoveProductFromBikeBuild(buySelectedBikeId, entry.product.id) : onAddProductToBikeBuild(buySelectedBikeId, entry.product)
                          }
                          product={entry.product}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </GarageStepShell>
  );
}
