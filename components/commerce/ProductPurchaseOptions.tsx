"use client";

import type { CSSProperties } from "react";
import type {
  CommerceSourceContext,
  ResolvedProductCommerce,
} from "../../lib/commerce/types";

type ProductPurchaseOptionsProps = {
  commerce: ResolvedProductCommerce;
  sourceContext: CommerceSourceContext;
  onClose: () => void;
  onTrackOutbound: (vendorName: string, url: string, sourceContext: CommerceSourceContext) => void;
};

export function ProductPurchaseOptions({
  commerce,
  sourceContext,
  onClose,
  onTrackOutbound,
}: ProductPurchaseOptionsProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(15,23,42,0.58)",
        backdropFilter: "blur(6px)",
        padding: "28px 18px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          maxWidth: 640,
          margin: "0 auto",
          display: "grid",
          gap: 14,
          padding: 18,
          borderRadius: 24,
          border: "1px solid #dbeafe",
          background: "#ffffff",
          boxShadow: "0 26px 48px rgba(15,23,42,0.22)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={eyebrowStyle}>Where to buy</div>
            <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.1, color: "#0f172a" }}>
              {commerce.title}
            </h3>
            <div style={{ fontSize: 13, color: "#475569", fontWeight: 700 }}>
              {commerce.brand}
            </div>
            {commerce.descriptor && (
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55 }}>
                {commerce.descriptor}
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            Close
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {commerce.confidence !== "unknown" && (
            <span style={chipStyle}>
              {commerce.confidence === "linked" ? "Linked vendor options" : "Fallback link"}
            </span>
          )}
          {commerce.availabilityStatus && (
            <span style={chipStyle}>{commerce.availabilityStatus.replace(/-/g, " ")}</span>
          )}
          <span style={chipStyle}>Source: {sourceContext.replace(/-/g, " ")}</span>
        </div>

        {commerce.hasPurchaseOptions ? (
          <div style={{ display: "grid", gap: 10 }}>
            {commerce.links.map((link) => (
              <div
                key={link.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  gap: 12,
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "grid", gap: 3 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                    {link.vendorName}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.45 }}>
                    {link.label || "View this item at the vendor"}{link.isFallback ? " • fallback link" : ""}
                  </div>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onTrackOutbound(link.vendorName, link.url, sourceContext)}
                  style={ctaStyle}
                >
                  {link.label || "View at vendor"}
                </a>
              </div>
            ))}
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
              More vendor options can be added over time without changing the build workflow.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 6,
              padding: 14,
              borderRadius: 16,
              border: "1px dashed #cbd5e1",
              background: "#f8fafc",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
              No purchase link yet
            </div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55 }}>
              {commerce.missingReason || "Vendor options are still being added for this item."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const eyebrowStyle = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  color: "#64748b",
} satisfies CSSProperties;

const chipStyle = {
  display: "inline-flex",
  padding: "5px 8px",
  borderRadius: 999,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 11,
  fontWeight: 700,
} satisfies CSSProperties;

const ctaStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 800,
  textDecoration: "none",
  whiteSpace: "nowrap",
} satisfies CSSProperties;

const closeButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
} satisfies CSSProperties;
