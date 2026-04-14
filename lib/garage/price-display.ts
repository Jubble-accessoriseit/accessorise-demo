export function formatGaragePriceDisplay(
  value: number,
  options?: {
    locale?: string;
    currency?: string;
    maximumFractionDigits?: number;
  }
) {
  if (!Number.isFinite(value) || value <= 0) {
    return "Price unknown";
  }

  return new Intl.NumberFormat(options?.locale ?? "en-AU", {
    style: "currency",
    currency: options?.currency ?? "AUD",
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(value);
}
