import type { ProductCommerceTrackingEvent } from "./types";

const COMMERCE_TRACKING_STORAGE_KEY =
  "accessorise-it.commerce-clicks.v1";

function readTrackingEvents() {
  if (typeof window === "undefined") {
    return [] as ProductCommerceTrackingEvent[];
  }

  try {
    const rawValue = window.localStorage.getItem(COMMERCE_TRACKING_STORAGE_KEY);

    if (!rawValue) {
      return [] as ProductCommerceTrackingEvent[];
    }

    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [] as ProductCommerceTrackingEvent[];
    }

    return parsed.filter(
      (event): event is ProductCommerceTrackingEvent =>
        typeof event === "object" &&
        event !== null &&
        typeof (event as ProductCommerceTrackingEvent).vendorName === "string" &&
        typeof (event as ProductCommerceTrackingEvent).url === "string" &&
        typeof (event as ProductCommerceTrackingEvent).sourceContext === "string" &&
        typeof (event as ProductCommerceTrackingEvent).timestamp === "string"
    );
  } catch {
    return [] as ProductCommerceTrackingEvent[];
  }
}

export function trackProductCommerceClick(event: ProductCommerceTrackingEvent) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const existingEvents = readTrackingEvents();
    const nextEvents = [event, ...existingEvents].slice(0, 200);

    window.localStorage.setItem(
      COMMERCE_TRACKING_STORAGE_KEY,
      JSON.stringify(nextEvents)
    );
  } catch {
    // Benign local tracking failures should never affect the user flow.
  }
}
