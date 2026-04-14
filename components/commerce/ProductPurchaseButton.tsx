"use client";

import type { CSSProperties } from "react";
import type { ResolvedProductCommerce } from "../../lib/commerce/types";

type ProductPurchaseButtonProps = {
  commerce: ResolvedProductCommerce;
  compact?: boolean;
  onOpen: () => void;
};

export function ProductPurchaseButton({
  commerce,
  compact = false,
  onOpen,
}: ProductPurchaseButtonProps) {
  if (!commerce.hasPurchaseOptions && !commerce.missingReason) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: compact ? "7px 10px" : "9px 12px",
        borderRadius: compact ? 10 : 12,
        border: "1px solid #cbd5e1",
        background: commerce.hasPurchaseOptions ? "#ffffff" : "#f8fafc",
        color: commerce.hasPurchaseOptions ? "#0f172a" : "#64748b",
        fontSize: compact ? 11 : 12,
        fontWeight: 800,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {commerce.hasPurchaseOptions ? "View options" : "No link yet"}
    </button>
  );
}

export const purchaseHintStyle = {
  fontSize: 11,
  color: "#64748b",
  lineHeight: 1.45,
} satisfies CSSProperties;
