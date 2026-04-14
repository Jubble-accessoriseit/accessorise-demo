"use client";

import type { CSSProperties } from "react";
import { ProductPurchaseButton } from "../commerce/ProductPurchaseButton";
import { resolveProductCommerce } from "../../lib/commerce/resolveProductCommerce";
import type {
  ExpertBuildApplyMode,
  ExpertBuildMergeDecision,
  ExpertBuildMergeDraft,
  ExpertBuildMergePreview,
} from "../../lib/expert-builds/merge";
import type { ResolvedExpertBuild } from "../../lib/expert-builds/types";

type ExpertBuildMergeStudioProps = {
  build: ResolvedExpertBuild;
  draft: ExpertBuildMergeDraft;
  preview: ExpertBuildMergePreview;
  canApply: boolean;
  isStale?: boolean;
  rebaseSummary?: string | null;
  onApply: () => void;
  onCategoryAction: (
    categoryId: string,
    action: "apply" | "skip" | "review"
  ) => void;
  onClose: () => void;
  onDecisionChange: (itemId: string, decision: ExpertBuildMergeDecision) => void;
  onModeChange: (mode: ExpertBuildApplyMode) => void;
  onOpenPurchase: (itemId: string) => void;
  onRebase?: (() => void) | null;
  onRestorePreviousBuild?: (() => void) | null;
  onSaveDraft: () => void;
};

const modeOptions: Array<{ id: ExpertBuildApplyMode; label: string; hint: string }> = [
  {
    id: "add-missing-only",
    label: "Add missing only",
    hint: "Adds only uncovered categories and leaves current categories untouched.",
  },
  {
    id: "review-all",
    label: "Review all suggestions",
    hint: "Shows all expert items and lets you decide item by item.",
  },
  {
    id: "category-led",
    label: "Category-led merge",
    hint: "Apply or skip whole categories, then review any conflicts inside them.",
  },
];

export function ExpertBuildMergeStudio({
  build,
  draft,
  preview,
  canApply,
  isStale = false,
  rebaseSummary = null,
  onApply,
  onCategoryAction,
  onClose,
  onDecisionChange,
  onModeChange,
  onOpenPurchase,
  onRebase,
  onRestorePreviousBuild,
  onSaveDraft,
}: ExpertBuildMergeStudioProps) {
  const groupedByCategory = draft.items.reduce<Record<string, typeof draft.items>>(
    (acc, item) => {
      acc[item.categoryId] = [...(acc[item.categoryId] ?? []), item];
      return acc;
    },
    {}
  );

  return (
    <section style={{ maxWidth: 1600, margin: "0 auto", padding: "0 10px 32px" }}>
      <div
        style={{
          display: "grid",
          gap: 14,
          padding: 16,
          borderRadius: 24,
          border: "1px solid #bfdbfe",
          background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
          boxShadow: "0 16px 34px rgba(37,99,235,0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "start" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={eyebrowStyle}>Merge Studio</div>
            <h3 style={{ margin: 0, fontSize: 24, color: "#0f172a", lineHeight: 1.08 }}>
              Merge {build.title} into your working build
            </h3>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55, maxWidth: 840 }}>
              Review changes before anything is applied. Your current build remains the source of truth until you explicitly confirm the merge.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {onRestorePreviousBuild && (
              <button type="button" onClick={onRestorePreviousBuild} style={secondaryButtonStyle}>
                Restore pre-merge build
              </button>
            )}
            <button type="button" onClick={onClose} style={secondaryButtonStyle}>
              Close studio
            </button>
          </div>
        </div>

        {(isStale || rebaseSummary || draft.lastSavedAt) && (
          <div
            style={{
              display: "grid",
              gap: 8,
              padding: 12,
              borderRadius: 16,
              border: isStale ? "1px solid #fdba74" : "1px solid #dbeafe",
              background: isStale ? "#fff7ed" : "#f8fafc",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "grid", gap: 3 }}>
                <div style={eyebrowStyle}>{isStale ? "Draft needs review" : "Draft status"}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                  {isStale
                    ? "Your working build has changed since this merge draft was first created."
                    : draft.lastSavedAt
                    ? `Saved locally for later on ${new Intl.DateTimeFormat("en-AU", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(draft.lastSavedAt))}.`
                    : "This draft is being previewed locally and can be saved to resume later."}
                </div>
                {rebaseSummary && (
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                    {rebaseSummary}
                  </div>
                )}
              </div>
              {isStale && onRebase && (
                <button type="button" onClick={onRebase} style={secondaryButtonStyle}>
                  Rebase onto current build
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, 0.85fr)", gap: 14 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 8,
              }}
            >
              <ContextCard label="Source build" value={build.title} />
              <ContextCard label="Builder" value={build.builderName} />
              <ContextCard label="Bike fitment" value={build.fitmentLabel} />
              <ContextCard label="Build DNA" value={build.dnaSummary} />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={eyebrowStyle}>Merge mode</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                {modeOptions.map((option) => {
                  const isActive = draft.mode === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onModeChange(option.id)}
                      style={{
                        display: "grid",
                        gap: 4,
                        padding: 12,
                        textAlign: "left",
                        borderRadius: 16,
                        border: isActive ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                        background: isActive ? "#eff6ff" : "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 800, color: isActive ? "#1d4ed8" : "#0f172a" }}>
                        {option.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.45 }}>
                        {option.hint}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
              padding: 14,
              borderRadius: 18,
              border: "1px solid #dbeafe",
              background: "#ffffff",
            }}
          >
            <div style={eyebrowStyle}>Preview summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
              <SummaryCard label="Items to add" value={String(preview.summary.safeToAddCount)} tone="#eff6ff" color="#1d4ed8" />
              <SummaryCard label="Items to replace" value={String(preview.summary.replaceCount)} tone="#fef3c7" color="#92400e" />
              <SummaryCard label="Already unchanged" value={String(preview.summary.alreadyHaveCount + preview.summary.keepMineCount)} tone="#dcfce7" color="#166534" />
              <SummaryCard label="Unresolved" value={String(preview.summary.unresolvedCount)} tone="#fef2f2" color="#991b1b" />
            </div>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.55 }}>
              {preview.impactSummary}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {preview.affectedCategories.length > 0 ? (
                preview.affectedCategories.map((category) => (
                  <span key={category} style={tagStyle}>
                    {category}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  No categories selected yet.
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={eyebrowStyle}>Category-led review</div>
          {Object.entries(groupedByCategory).map(([categoryId, items]) => {
            const hasConflicts = items.some((item) => item.conflict);
            const selectedCount = items.filter(
              (item) =>
                item.decision === "add" || item.decision === "replace-existing"
            ).length;

            return (
              <div
                key={categoryId}
                style={{
                  display: "grid",
                  gap: 10,
                  padding: 14,
                  borderRadius: 18,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                      {items[0].categoryLabel}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
                      {hasConflicts
                        ? "Category already covered in your build. Review before replacing."
                        : "No category conflict detected. These items are safe to add."}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={tagStyle}>{selectedCount} selected</span>
                    <button type="button" onClick={() => onCategoryAction(categoryId, "apply")} style={miniPrimaryButtonStyle}>
                      Apply category
                    </button>
                    <button type="button" onClick={() => onCategoryAction(categoryId, "skip")} style={miniSecondaryButtonStyle}>
                      Skip category
                    </button>
                    <button type="button" onClick={() => onCategoryAction(categoryId, "review")} style={miniSecondaryButtonStyle}>
                      Review conflicts
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {items.map((item) => (
                    <MergeItemCard
                      key={item.id}
                      item={item}
                      onOpenPurchase={onOpenPurchase}
                      onDecisionChange={onDecisionChange}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: 12,
            alignItems: "center",
            padding: 14,
            borderRadius: 18,
            border: "1px solid #dbeafe",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
              Resulting build preview
            </div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
              {preview.mergedProducts.length} items after apply. {preview.summary.unresolvedCount > 0
                ? `${preview.summary.unresolvedCount} conflict${preview.summary.unresolvedCount === 1 ? "" : "s"} still need a decision before applying.`
                : "No blocking conflicts remain."}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" onClick={onSaveDraft} style={secondaryButtonStyle}>
              Save merge draft
            </button>
            <button
              type="button"
              onClick={onApply}
              disabled={!canApply}
              style={{
                ...primaryButtonStyle,
                background: canApply ? "#0f172a" : "#94a3b8",
                cursor: canApply ? "pointer" : "not-allowed",
                boxShadow: canApply ? "0 12px 24px rgba(15,23,42,0.16)" : "none",
              }}
            >
              Apply selected changes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function MergeItemCard({
  item,
  onOpenPurchase,
  onDecisionChange,
}: {
  item: ExpertBuildMergeDraft["items"][number];
  onOpenPurchase: (itemId: string) => void;
  onDecisionChange: (itemId: string, decision: ExpertBuildMergeDecision) => void;
}) {
  const currentItemLabel =
    item.currentProducts.length === 0
      ? "No current item in this category"
      : item.currentProducts.map((product) => product.name).join(", ");

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: 12,
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        background:
          item.decision === "unresolved"
            ? "#fff7ed"
            : item.decision === "add"
            ? "#f8fbff"
            : "#f8fafc",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 10 }}>
        <div style={{ display: "grid", gap: 3 }}>
          <div style={rowLabelStyle}>Expert build item</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
            {item.expertProduct.name}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>
            {item.expertProduct.brand}
          </div>
        </div>
        <div style={{ display: "grid", gap: 3 }}>
          <div style={rowLabelStyle}>My current item</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
            {currentItemLabel}
          </div>
          {item.conflict && (
            <div style={{ fontSize: 11, color: "#92400e", lineHeight: 1.45 }}>
              {item.conflict.reason === "similar-item"
                ? "Looks like a likely replacement decision."
                : "Category already covered, but not with the same product."}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {decisionOptionsForItem(item).map((decision) => {
          const isActive = item.decision === decision.value;

          return (
            <button
              key={`${item.id}-${decision.value}`}
              type="button"
              onClick={() => onDecisionChange(item.id, decision.value)}
              disabled={decision.disabled}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "7px 10px",
                borderRadius: 999,
                border: isActive ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                background: isActive ? "#eff6ff" : "#ffffff",
                color: isActive ? "#1d4ed8" : "#334155",
                fontSize: 11,
                fontWeight: 800,
                cursor: decision.disabled ? "not-allowed" : "pointer",
                opacity: decision.disabled ? 0.5 : 1,
              }}
            >
              {decision.label}
            </button>
          );
        })}
        <ProductPurchaseButton
          commerce={resolveProductCommerce({
            product: item.expertProduct,
            accessory: item.expertAccessory,
          })}
          compact
          onOpen={() => onOpenPurchase(item.id)}
        />
      </div>
    </div>
  );
}

function decisionOptionsForItem(item: ExpertBuildMergeDraft["items"][number]) {
  return [
    {
      value: "already-have" as const,
      label: "Already have",
      disabled: !item.directMatch,
    },
    {
      value: "add" as const,
      label: "Add",
      disabled: item.directMatch,
    },
    {
      value: "replace-existing" as const,
      label: "Replace existing",
      disabled: item.directMatch || item.currentProducts.length === 0,
    },
    {
      value: "keep-mine" as const,
      label: "Keep mine",
      disabled: item.directMatch || item.currentProducts.length === 0,
    },
    {
      value: "skip" as const,
      label: "Skip",
      disabled: item.directMatch,
    },
  ];
}

function ContextCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        padding: 12,
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div style={rowLabelStyle}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}

function SummaryCard({
  color,
  label,
  tone,
  value,
}: {
  color: string;
  label: string;
  tone: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        padding: 10,
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div style={rowLabelStyle}>{label}</div>
      <span
        style={{
          display: "inline-flex",
          width: "fit-content",
          padding: "6px 9px",
          borderRadius: 12,
          background: tone,
          color,
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        {value}
      </span>
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

const rowLabelStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "#94a3b8",
} satisfies CSSProperties;

const tagStyle = {
  display: "inline-flex",
  padding: "5px 8px",
  borderRadius: 999,
  border: "1px solid #dbeafe",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 11,
  fontWeight: 700,
} satisfies CSSProperties;

const primaryButtonStyle = {
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
  cursor: "pointer",
} satisfies CSSProperties;

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
} satisfies CSSProperties;

const miniPrimaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "7px 10px",
  borderRadius: 999,
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
} satisfies CSSProperties;

const miniSecondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#334155",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
} satisfies CSSProperties;
