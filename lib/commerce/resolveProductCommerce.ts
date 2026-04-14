import type { Product } from "../../types/garage";
import type {
  ExpertBuildAccessory,
  ResolvedExpertBuildAccessory,
} from "../expert-builds/types";
import type {
  ProductCommerceResolvable,
  ResolvedProductCommerce,
  ResolvedProductCommerceLink,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeUrl(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    return null;
  }
}

function getVendorNameFromUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const firstSegment = hostname.split(".")[0] ?? "Vendor";

    return firstSegment
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } catch {
    return "Vendor";
  }
}

function normalizeAffiliateLinks(inputLinks: Product["affiliateLinks"]) {
  if (!Array.isArray(inputLinks)) {
    return [] as ResolvedProductCommerceLink[];
  }

  return inputLinks
    .reduce<ResolvedProductCommerceLink[]>((acc, link, index) => {
      const normalizedUrl = normalizeUrl(link?.url);

      if (!normalizedUrl || !link?.vendorName?.trim()) {
        return acc;
      }

      acc.push({
        vendorName: link.vendorName.trim(),
        url: normalizedUrl,
        label: link.label?.trim() || null,
        priority: typeof link.priority === "number" ? link.priority : index,
        id: `${link.vendorName}:${normalizedUrl}`,
        isFallback: false,
      });
      return acc;
    }, [])
    .sort((left, right) => (left.priority ?? 99) - (right.priority ?? 99));
}

function getFallbackLinks(input: {
  accessory?: ExpertBuildAccessory | ResolvedExpertBuildAccessory | null;
  product?: Product | null;
}) {
  const fallbackCandidates = [
    input.product?.fallbackUrl,
    input.product?.supplierUrl,
    input.accessory?.fallbackUrl,
    input.accessory?.buyUrl,
  ];

  for (const candidate of fallbackCandidates) {
    const normalizedUrl = normalizeUrl(candidate);

    if (normalizedUrl) {
      return [
        {
          vendorName: getVendorNameFromUrl(normalizedUrl),
          url: normalizedUrl,
          label: "View at vendor",
          priority: 100,
          id: `fallback:${normalizedUrl}`,
          isFallback: true,
        } satisfies ResolvedProductCommerceLink,
      ];
    }
  }

  return [] as ResolvedProductCommerceLink[];
}

export function resolveProductCommerce(
  input: ProductCommerceResolvable
): ResolvedProductCommerce {
  const product = "product" in input ? input.product ?? null : null;
  const accessory = "accessory" in input ? input.accessory : null;
  const title = product?.name ?? accessory?.title ?? "Product";
  const brand = product?.brand ?? accessory?.brand ?? "Unknown brand";
  const categoryId = product?.categoryId ?? accessory?.categoryId ?? null;
  const subcategory = product?.subcategory ?? accessory?.subcategory ?? null;
  const linkedLinks = normalizeAffiliateLinks(
    product?.affiliateLinks ?? accessory?.affiliateLinks ?? []
  );
  const fallbackLinks = linkedLinks.length === 0 ? getFallbackLinks({ accessory, product }) : [];
  const links = [...linkedLinks, ...fallbackLinks];
  const primaryLink = links[0] ?? null;
  const confidence =
    linkedLinks.length > 0
      ? "linked"
      : fallbackLinks.length > 0
      ? "fallback"
      : product?.commerceConfidence ?? accessory?.commerceConfidence ?? "unknown";
  const availabilityStatus =
    product?.availabilityStatus ?? accessory?.availabilityStatus ?? null;

  return {
    productId: product?.id ?? (isRecord(accessory) && typeof accessory.productId === "number" ? accessory.productId : null),
    title,
    brand,
    categoryId,
    subcategory,
    descriptor:
      product?.description?.trim() ||
      accessory?.notes?.trim() ||
      accessory?.compatibilityNotes?.trim() ||
      null,
    availabilityStatus,
    confidence,
    links,
    primaryLink,
    hasPurchaseOptions: links.length > 0,
    missingReason:
      links.length === 0
        ? "No purchase link yet. More vendor options can be added later."
        : null,
  };
}
