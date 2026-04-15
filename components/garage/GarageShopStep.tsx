"use client";

import { ProductPurchaseButton } from "../commerce/ProductPurchaseButton";
import { resolveProductCommerce } from "../../lib/commerce/resolveProductCommerce";
import type {
  CommerceSourceContext,
  ResolvedProductCommerce,
} from "../../lib/commerce/types";
import type {
  CompatibilityLabel,
  GarageBikeRecord,
  Product,
} from "../../types/garage";
import {
  GarageStepShell,
  GarageSummaryCard,
  garageEyebrowStyle,
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
  buySelectedBike: GarageBikeRecord | null;
  buySelectedBikeBuildProductIds: Set<number>;
  buySelectedBikeCommerceSummary: {
    exactFitCount: number;
    missingCount: number;
    readyCount: number;
    savedCount: number;
  };
  buySelectedBikeId: string;
  buySelectedBikeLabel: string;
  buySelectedBikeProductEntries: ShopProductEntry[];
  buySelectedBikeTemplateId: string | null;
  formatAccessoryPriceLabel: (value: number) => string;
  genericBikePlaceholder: string;
  getCategoryLabel: (categoryId: string) => string;
  getCompatibilityLabel: (product: Product, bikeId: string) => CompatibilityLabel;
  getGarageBikeDisplayName: (bike: GarageBikeRecord) => string;
  getProductSupplierName: (product: Product) => string;
  isPhone: boolean;
  myGarageBikes: GarageBikeRecord[];
  onAddProductToBikeBuild: (bikeId: string, product: Product) => void;
  onBackToResults: () => void;
  onChangeSelectedBike: (bikeId: string) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenProductPurchase: (input: {
    product: Product;
    sourceContext: CommerceSourceContext;
  }) => void;
  onRemoveProductFromBikeBuild: (bikeId: string, productId: number) => void;
};

function getFitPillStyle(label: CompatibilityLabel) {
  return {
    background:
      label === "Exact fit"
        ? "#dcfce7"
        : label === "Universal fit"
        ? "#dbeafe"
        : "#f8fafc",
    color:
      label === "Exact fit"
        ? "#166534"
        : label === "Universal fit"
        ? "#1d4ed8"
        : "#64748b",
  };
}

function ShopSummaryPill({
  background,
  border,
  color,
  label,
}: {
  background: string;
  border: string;
  color: string;
  label: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "7px 10px",
        borderRadius: 999,
        background,
        color,
        fontSize: 12,
        fontWeight: 700,
        border,
      }}
    >
      {label}
    </span>
  );
}

function ShopProductRow({
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
  onOpenProductPurchase: (input: {
    product: Product;
    sourceContext: CommerceSourceContext;
  }) => void;
  product: Product;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isPhone
          ? "72px minmax(0, 1fr)"
          : "72px minmax(0, 1fr) auto",
        gap: 14,
        alignItems: "center",
        padding: isPhone ? "12px" : "12px 14px",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background: "#fbfdff",
      }}
    >
      <img
        src={product.image || genericBikePlaceholder}
        alt={product.name}
        onError={(event) => {
          (event.currentTarget as HTMLImageElement).src = genericBikePlaceholder;
        }}
        style={{
          width: 72,
          height: 72,
          borderRadius: 14,
          objectFit: "cover",
          display: "block",
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      />

      <div style={{ minWidth: 0, display: "grid", gap: 6 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
            {product.name}
          </div>
          <span
            style={{
              display: "inline-flex",
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              border: "1px solid #e2e8f0",
              ...getFitPillStyle(compatibilityLabel),
            }}
          >
            {compatibilityLabel}
          </span>
          {inBuild ? (
            <span
              style={{
                display: "inline-flex",
                padding: "4px 8px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                background: "#f0fdf4",
                color: "#047857",
                border: "1px solid #bbf7d0",
              }}
            >
              Saved in this build
            </span>
          ) : null}
        </div>

        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
          {product.brand} | {categoryLabel}
          {product.subcategory ? ` | ${product.subcategory}` : ""}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
            {formatAccessoryPriceLabel(product.price)}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
            {commerce.hasPurchaseOptions
              ? `${commerce.links.length} vendor option${commerce.links.length === 1 ? "" : "s"} available`
              : commerce.missingReason || "Purchase link still to be confirmed"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          justifyItems: isPhone ? "stretch" : "end",
          gap: 8,
          gridColumn: isPhone ? "1 / -1" : undefined,
        }}
      >
        <button
          type="button"
          onClick={() => onOpenProductDetail(product)}
          style={{
            ...garageSecondaryButtonStyle,
            minHeight: 34,
            padding: "7px 11px",
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          View details
        </button>

        <ProductPurchaseButton
          compact
          commerce={commerce}
          onOpen={() =>
            onOpenProductPurchase({
              product,
              sourceContext: bikeId ? "garage" : "product-detail",
            })
          }
        />
      </div>
    </div>
  );
}

export function GarageShopStep({
  activeProductCommerce,
  activeProductDetail,
  buySelectedBike,
  buySelectedBikeBuildProductIds,
  buySelectedBikeCommerceSummary,
  buySelectedBikeId,
  buySelectedBikeLabel,
  buySelectedBikeProductEntries,
  buySelectedBikeTemplateId,
  formatAccessoryPriceLabel,
  genericBikePlaceholder,
  getCategoryLabel,
  getCompatibilityLabel,
  getGarageBikeDisplayName,
  getProductSupplierName,
  isPhone,
  myGarageBikes,
  onAddProductToBikeBuild,
  onBackToResults,
  onChangeSelectedBike,
  onOpenProductDetail,
  onOpenProductPurchase,
  onRemoveProductFromBikeBuild,
}: GarageShopStepProps) {
  const detailCommerce =
    activeProductCommerce ??
    (activeProductDetail ? resolveProductCommerce({ product: activeProductDetail }) : null);

  return (
    <GarageStepShell isPhone={isPhone}>
      <div style={{ display: "grid", gap: 16 }}>
        <GarageSummaryCard
          eyebrow="Shop accessories"
          title="Shop for your chosen accessories"
          description={
            buySelectedBike
              ? `${buySelectedBikeLabel} is driving fit and supplier context below.`
              : "Choose a bike context to browse compatible accessories without losing your place."
          }
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isPhone
                ? "minmax(0, 1fr)"
                : "minmax(240px, 320px) minmax(0, 1fr)",
              gap: 16,
              alignItems: "end",
            }}
          >
            <div style={{ display: "grid", gap: 6 }}>
              <label
                htmlFor="buy-saved-bike-selector"
                style={{
                  ...garageEyebrowStyle,
                  letterSpacing: 0.4,
                  color: "#475569",
                }}
              >
                Saved Bike
              </label>
              <select
                id="buy-saved-bike-selector"
                value={buySelectedBikeId}
                onChange={(event) => onChangeSelectedBike(event.target.value)}
                style={{
                  minHeight: 44,
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: 14,
                  color: "#0f172a",
                }}
              >
                <option value="">
                  {myGarageBikes.length === 0 ? "Save a bike first" : "Choose a saved bike"}
                </option>
                {myGarageBikes.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {getGarageBikeDisplayName(bike)}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
                justifyContent: isPhone ? "flex-start" : "flex-end",
              }}
            >
              {buySelectedBike ? (
                <>
                  <ShopSummaryPill
                    background="#eff6ff"
                    border="1px solid #dbeafe"
                    color="#1d4ed8"
                    label={`${buySelectedBikeCommerceSummary.readyCount} with purchase links`}
                  />
                  <ShopSummaryPill
                    background="#ecfdf5"
                    border="1px solid #bbf7d0"
                    color="#047857"
                    label={`${buySelectedBikeCommerceSummary.exactFitCount} exact fit`}
                  />
                  <ShopSummaryPill
                    background="#f8fafc"
                    border="1px solid #e2e8f0"
                    color="#475569"
                    label={`${buySelectedBikeCommerceSummary.savedCount} in this bike's build`}
                  />
                </>
              ) : (
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>
                  The list below will populate after you choose a saved bike.
                </div>
              )}
            </div>
          </div>
        </GarageSummaryCard>

        {myGarageBikes.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: 18,
              padding: 20,
              color: "#64748b",
              lineHeight: 1.55,
            }}
          >
            Save a bike to your Garage first, then this tab can tailor accessory browsing to that bike.
          </div>
        ) : !buySelectedBike ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: 18,
              padding: 20,
              color: "#64748b",
              lineHeight: 1.55,
            }}
          >
            Choose a saved bike above to see accessories, fitment context, and product details for that bike.
          </div>
        ) : buySelectedBikeProductEntries.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: 18,
              padding: 20,
              color: "#64748b",
              lineHeight: 1.55,
            }}
          >
            We don&apos;t have compatible accessories loaded for {buySelectedBikeLabel} yet.
          </div>
        ) : activeProductDetail ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 22,
              overflow: "hidden",
              boxShadow: "0 14px 32px rgba(15,23,42,0.08)",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 18,
                padding: 18,
                borderBottom: "1px solid #eef2f7",
                background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
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
                <div style={{ display: "grid", gap: 8 }}>
                  <button
                    type="button"
                    onClick={onBackToResults}
                    style={{
                      ...garageSecondaryButtonStyle,
                      width: "fit-content",
                      minHeight: 34,
                      padding: "7px 11px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    Back to Shop Accessories
                  </button>
                  <div style={garageEyebrowStyle}>Accessory details</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", padding: "5px 9px", borderRadius: 999, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 11, fontWeight: 700 }}>
                      {getProductSupplierName(activeProductDetail)}
                    </span>
                    <span style={{ display: "inline-flex", padding: "5px 9px", borderRadius: 999, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 11, fontWeight: 700 }}>
                      {getCategoryLabel(activeProductDetail.categoryId)}
                    </span>
                  </div>
                  <div style={{ fontSize: 28, lineHeight: 1.08, fontWeight: 800, color: "#0f172a" }}>
                    {activeProductDetail.name}
                  </div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, maxWidth: 820 }}>
                    Reviewing fitment and supplier options for {buySelectedBikeLabel}.
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 10,
                    minWidth: "min(100%, 420px)",
                    flex: "1 1 420px",
                  }}
                >
                  <div style={{ padding: 12, borderRadius: 14, border: "1px solid #e2e8f0", background: "#fbfdff", display: "grid", gap: 4 }}>
                    <div style={garageEyebrowStyle}>Fitment</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {getCompatibilityLabel(activeProductDetail, buySelectedBikeTemplateId || "")}
                    </div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 14, border: "1px solid #e2e8f0", background: "#fbfdff", display: "grid", gap: 4 }}>
                    <div style={garageEyebrowStyle}>Price</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {formatAccessoryPriceLabel(activeProductDetail.price)}
                    </div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 14, border: "1px solid #e2e8f0", background: "#fbfdff", display: "grid", gap: 4 }}>
                    <div style={garageEyebrowStyle}>Build status</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {buySelectedBikeBuildProductIds.has(activeProductDetail.id)
                        ? "Saved in this bike's build"
                        : "Not yet saved to this bike"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isPhone
                  ? "minmax(0, 1fr)"
                  : "minmax(280px, 420px) minmax(0, 1fr)",
                gap: 18,
                padding: 18,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gap: 14,
                  position: isPhone ? "static" : "sticky",
                  top: isPhone ? undefined : 96,
                }}
              >
                <div
                  style={{
                    minHeight: 300,
                    borderRadius: 18,
                    backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.3)), url(${activeProductDetail.image || genericBikePlaceholder})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#f8fafc",
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    background: "#fbfdff",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                    Vendor links
                  </div>
                  {detailCommerce?.links?.length ? (
                    detailCommerce.links.map((link, index) => (
                      <div
                        key={`${link.vendorName}-${index}`}
                        style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}
                      >
                        {link.vendorName}
                        {link.label ? ` | ${link.label}` : ""}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                      {detailCommerce?.missingReason ||
                        "Supplier links are not available for this product yet."}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={garageEyebrowStyle}>Product overview</div>
                  <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
                    {activeProductDetail.description}
                  </div>
                  <div style={{ display: "grid", gap: 6, padding: "12px 14px", borderRadius: 14, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                    <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                      <strong style={{ color: "#0f172a" }}>Brand:</strong> {activeProductDetail.brand}
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                      <strong style={{ color: "#0f172a" }}>Category:</strong> {getCategoryLabel(activeProductDetail.categoryId)}
                    </div>
                    {activeProductDetail.subcategory ? (
                      <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                        <strong style={{ color: "#0f172a" }}>Subcategory:</strong> {activeProductDetail.subcategory}
                      </div>
                    ) : null}
                    {activeProductDetail.availabilityStatus ? (
                      <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                        <strong style={{ color: "#0f172a" }}>Availability:</strong> {activeProductDetail.availabilityStatus}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10, paddingTop: 4, borderTop: "1px solid #eef2f7" }}>
                  <div style={garageEyebrowStyle}>Purchase & build actions</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                    {detailCommerce ? (
                      <ProductPurchaseButton
                        commerce={detailCommerce}
                        onOpen={() =>
                          onOpenProductPurchase({
                            product: activeProductDetail,
                            sourceContext: "product-detail",
                          })
                        }
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        if (!buySelectedBikeId) {
                          return;
                        }

                        if (buySelectedBikeBuildProductIds.has(activeProductDetail.id)) {
                          onRemoveProductFromBikeBuild(buySelectedBikeId, activeProductDetail.id);
                          return;
                        }

                        onAddProductToBikeBuild(buySelectedBikeId, activeProductDetail);
                      }}
                      style={{
                        ...garageSecondaryButtonStyle,
                        minHeight: 38,
                        padding: "9px 12px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {buySelectedBikeBuildProductIds.has(activeProductDetail.id)
                        ? "Remove from this build"
                        : "Save to this build"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    paddingTop: 4,
                    borderTop: "1px solid #eef2f7",
                  }}
                >
                  <div style={garageEyebrowStyle}>Reviews & media</div>
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      fontSize: 12,
                      color: "#64748b",
                      lineHeight: 1.55,
                    }}
                  >
                    Review videos, social proof, and related media are not available in the current product data yet, but this panel is ready to surface them once that feed exists.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 18,
              display: "grid",
              gap: 12,
            }}
          >
            {buySelectedBikeProductEntries.map(({ product, commerce, compatibilityLabel, categoryLabel }) => (
              <ShopProductRow
                key={`${buySelectedBike.id}:${product.id}`}
                bikeId={buySelectedBike.id}
                categoryLabel={categoryLabel}
                commerce={commerce}
                compatibilityLabel={compatibilityLabel}
                formatAccessoryPriceLabel={formatAccessoryPriceLabel}
                genericBikePlaceholder={genericBikePlaceholder}
                inBuild={buySelectedBikeBuildProductIds.has(product.id)}
                isPhone={isPhone}
                onOpenProductDetail={onOpenProductDetail}
                onOpenProductPurchase={onOpenProductPurchase}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </GarageStepShell>
  );
}
