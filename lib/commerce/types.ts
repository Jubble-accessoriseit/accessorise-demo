import type {
  Product,
  ProductAffiliateLink,
  ProductAvailabilityStatus,
  ProductCommerceConfidence,
} from "../../types/garage";
import type {
  ExpertBuildAccessory,
  ResolvedExpertBuildAccessory,
} from "../expert-builds/types";

export type CommerceSourceContext =
  | "garage"
  | "product-browser"
  | "product-detail"
  | "expert-build"
  | "merge-studio"
  | "compare";

export type ResolvedProductCommerceLink = ProductAffiliateLink & {
  id: string;
  isFallback: boolean;
};

export type ResolvedProductCommerce = {
  productId: number | null;
  title: string;
  brand: string;
  categoryId: string | null;
  subcategory: string | null;
  descriptor: string | null;
  availabilityStatus: ProductAvailabilityStatus | null;
  confidence: ProductCommerceConfidence;
  links: ResolvedProductCommerceLink[];
  primaryLink: ResolvedProductCommerceLink | null;
  hasPurchaseOptions: boolean;
  missingReason: string | null;
};

export type ProductCommerceResolvable =
  | { product: Product; accessory?: ResolvedExpertBuildAccessory | ExpertBuildAccessory | null }
  | { product?: Product | null; accessory: ResolvedExpertBuildAccessory | ExpertBuildAccessory };

export type ProductCommerceTrackingEvent = {
  productId: number | null;
  productTitle: string;
  vendorName: string;
  url: string;
  sourceContext: CommerceSourceContext;
  timestamp: string;
};
