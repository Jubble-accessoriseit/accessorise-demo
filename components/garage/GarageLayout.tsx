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
  paddingBottom = 32,
}: GarageStepShellProps) {
  return (
    <section
      style={{
        maxWidth,
        margin: "0 auto",
        padding: isPhone
          ? `0 12px ${Math.max(24, paddingBottom - 4)}px`
          : `0 16px ${paddingBottom}px`,
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
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 70%, #eff6ff 100%)",
        borderRadius: 24,
        padding: 18,
        border: "1px solid #e2e8f0",
        boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
        display: "grid",
        gap: 14,
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
              fontSize: 28,
              lineHeight: 1.03,
              color: "#0f172a",
            }}
          >
            {title}
          </h2>
          {description ? (
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
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
        marginBottom: 18,
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
        <h2 style={{ margin: 0, fontSize: 26, lineHeight: 1.05, color: "#0f172a" }}>{title}</h2>
        {description ? (
          <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55, color: "#64748b", maxWidth: 760 }}>
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export const garageEyebrowStyle = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.6,
  textTransform: "uppercase" as const,
  color: "#64748b",
};

export const garagePrimaryButtonStyle: CSSProperties = {
  padding: "11px 15px",
  borderRadius: 14,
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(15,23,42,0.16)",
};

export const garageSecondaryButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
};
