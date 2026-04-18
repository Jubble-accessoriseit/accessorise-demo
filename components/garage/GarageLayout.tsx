"use client";

import type { CSSProperties, ReactNode } from "react";

type GarageStepShellProps = {
  children: ReactNode;
  isPhone: boolean;
  maxWidth?: number;
  paddingBottom?: number;
};

type GarageSummaryCardProps = {
  actions?: ReactNode;
  children?: ReactNode;
  description?: ReactNode;
  eyebrow: string;
  title: ReactNode;
};

type GarageSectionHeaderProps = {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  title: ReactNode;
};

export function GarageStepShell({
  children,
  isPhone,
  maxWidth = 1360,
  paddingBottom = 24,
}: GarageStepShellProps) {
  return (
    <section
      style={{
        maxWidth,
        margin: "0 auto",
        padding: isPhone
          ? `0 14px ${Math.max(20, paddingBottom - 2)}px`
          : `0 14px ${paddingBottom}px`,
      }}
    >
      {children}
    </section>
  );
}

export function GarageSummaryCard({
  actions,
  children,
  description,
  eyebrow,
  title,
}: GarageSummaryCardProps) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: 20,
        padding: 14,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
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
          <div style={garageEyebrowStyle}>{eyebrow}</div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              lineHeight: 1.05,
              color: "#0f172a",
            }}
          >
            {title}
          </h2>
          {description ? (
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
              {description}
            </div>
          ) : null}
        </div>
        {actions ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function GarageSectionHeader({
  actions,
  description,
  eyebrow,
  title,
}: GarageSectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        alignItems: "flex-start",
        flexWrap: "wrap",
        marginBottom: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow ? (
          <div
            style={{
              ...garageEyebrowStyle,
              marginBottom: 6,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <h2 style={{ margin: 0, fontSize: 21, lineHeight: 1.08, color: "#0f172a" }}>{title}</h2>
        {description ? (
          <p style={{ margin: "5px 0 0", fontSize: 12, lineHeight: 1.45, color: "#64748b", maxWidth: 760 }}>
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export const garageEyebrowStyle = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 0.5,
  textTransform: "uppercase" as const,
  color: "#64748b",
};

export const garagePrimaryButtonStyle: CSSProperties = {
  padding: "9px 13px",
  borderRadius: 12,
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(15,23,42,0.12)",
  fontSize: 12,
};

export const garageSecondaryButtonStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  fontSize: 12,
};
