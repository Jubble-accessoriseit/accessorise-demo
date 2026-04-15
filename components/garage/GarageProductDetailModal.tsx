"use client";

import { ProductPurchaseButton } from "../commerce/ProductPurchaseButton";
import type { ResolvedProductCommerce } from "../../lib/commerce/types";
import type { CompatibilityLabel, Product } from "../../types/garage";
import { garagePrimaryButtonStyle, garageSecondaryButtonStyle } from "./GarageLayout";

type GarageProductDetailModalProps = {
  compatibilityLabel: CompatibilityLabel | null;
  commerce: ResolvedProductCommerce | null;
  formatCurrency: (value: number) => string;
  inBuild: boolean;
  isOpen: boolean;
  onClose: () => void;
  onOpenPurchase: () => void;
  onToggleBuild: () => void;
  product: Product | null;
  productCategoryLabel: string;
  productSupplierName: string;
};

function getFitBadgeStyle(label: CompatibilityLabel | null) {
  return {
    background: label === "Exact fit" ? "#dcfce7" : label === "Universal fit" ? "#dbeafe" : "#f3f4f6",
    color: label === "Exact fit" ? "#166534" : label === "Universal fit" ? "#1d4ed8" : "#4b5563",
  };
}

export function GarageProductDetailModal({
  compatibilityLabel,
  commerce,
  formatCurrency,
  inBuild,
  isOpen,
  onClose,
  onOpenPurchase,
  onToggleBuild,
  product,
  productCategoryLabel,
  productSupplierName,
}: GarageProductDetailModalProps) {
  if (!isOpen || !product) {
    return null;
  }

  const fitBadgeStyle = getFitBadgeStyle(compatibilityLabel);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(15,23,42,0.58)",
        backdropFilter: "blur(6px)",
        padding: "28px 18px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 32,
          border: "1px solid rgba(226,232,240,0.95)",
          boxShadow: "0 34px 90px rgba(15,23,42,0.28)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              minHeight: 420,
              backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.02), rgba(15,23,42,0.2)), url(${product.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#f8fafc",
              display: "flex",
              alignItems: "flex-end",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "inline-grid",
                gap: 8,
                padding: "14px 16px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(226,232,240,0.9)",
                boxShadow: "0 10px 24px rgba(15,23,42,0.12)",
                maxWidth: 320,
              }}
            >
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase" }}>
                Planning view
              </div>
              <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>
                Review fit, compare the indicative price, and continue to the supplier when you are ready.
              </div>
            </div>
          </div>

          <div style={{ padding: 30, display: "grid", gap: 20, alignContent: "start", background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                  Product detail
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", padding: "7px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569" }}>
                    {productSupplierName}
                  </span>
                  <span style={{ display: "inline-flex", padding: "7px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569" }}>
                    {productCategoryLabel}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.05, color: "#0f172a" }}>{product.name}</h2>
                <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.55, color: "#64748b", maxWidth: 560 }}>
                  Save this item to your build or continue to the supplier site when you are ready to research pricing and purchase options.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  minWidth: 42,
                  height: 42,
                  borderRadius: 999,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
                }}
                aria-label="Close product details"
              >
                x
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ display: "inline-flex", padding: "7px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, ...fitBadgeStyle }}>
                {compatibilityLabel || "Check fit"}
              </span>
              <span style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                Confirm final fit and supplier-specific purchase details before ordering.
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div style={{ padding: 16, borderRadius: 18, border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 6 }}>
                  Indicative price
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
                  {formatCurrency(product.price)}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
                  Estimated for planning purposes only.
                </div>
              </div>

              <div style={{ padding: 16, borderRadius: 18, border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 6 }}>
                  Build status
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}>
                  {inBuild ? "Saved to current build" : "Ready to save to build"}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
                  Keep shortlist decisions here while researching supplier options.
                </div>
              </div>
            </div>

            <div style={{ padding: 22, borderRadius: 24, border: "1px solid #e2e8f0", background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)", display: "grid", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8 }}>
                  Description
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#475569" }}>{product.description}</p>
              </div>

              <div style={{ padding: "14px 16px", borderRadius: 16, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 13, lineHeight: 1.55 }}>
                {commerce?.hasPurchaseOptions
                  ? commerce.links.length > 1
                    ? `${commerce.links.length} vendor options are available for this item.`
                    : "A purchase link is available for this item when you are ready to research fit and purchase details."
                  : commerce?.missingReason ||
                    "You can still keep this item in your build for planning and revisit supplier research later."}
              </div>
            </div>

            <div style={{ display: "grid", gap: 12, paddingTop: 4, borderTop: "1px solid #eef2f7" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>
                  Actions
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
                  Close with the X or tap outside to return to results.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, max-content))", gap: 10, alignItems: "stretch" }}>
                {commerce ? <ProductPurchaseButton commerce={commerce} onOpen={onOpenPurchase} /> : null}

                <button
                  type="button"
                  onClick={onToggleBuild}
                  style={{
                    ...(inBuild ? garageSecondaryButtonStyle : garagePrimaryButtonStyle),
                    minHeight: 50,
                    padding: "15px 18px",
                    width: "auto",
                  }}
                >
                  {inBuild ? "Remove from build" : "Save to build"}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    ...garageSecondaryButtonStyle,
                    minHeight: 50,
                    padding: "15px 18px",
                    width: "auto",
                  }}
                >
                  Back to results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
