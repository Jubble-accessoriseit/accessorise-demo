import type { Product } from "../../types/garage";
import type {
  ProductAffiliateLink,
  ProductAvailabilityStatus,
  ProductCommerceConfidence,
} from "../../types/garage";

export type ExpertBuildPurpose =
  | "touring"
  | "adventure"
  | "off-road"
  | "commuter"
  | "performance"
  | "mixed";

export type ExpertBuildRidingStyle =
  | "comfort"
  | "balanced"
  | "aggressive"
  | "expedition"
  | "lightweight";

export type ExpertBuildTerrainFocus =
  | "highway"
  | "gravel"
  | "mixed"
  | "technical"
  | "urban";

export type ExpertBuildLoadProfile =
  | "light"
  | "moderate"
  | "heavy"
  | "fully-loaded";

export type ExpertBuildStrengthCategory =
  | "luggage"
  | "protection"
  | "lighting"
  | "navigation"
  | "comfort"
  | "tyres"
  | "electronics"
  | "performance"
  | "camping-travel";

export type ExpertBuildStrengthLevel = 1 | 2 | 3 | 4 | 5;

export type ExpertBuildPhoto = {
  id: string;
  imageUrl: string;
  alt: string;
  caption?: string;
  angleLabel?: string;
  isPrimary?: boolean;
  photo_type?: "build" | "accessory";
  sort_order?: number;
};

export type ExpertBuildAccessory = {
  id: string;
  productId?: number | null;
  title: string;
  brand: string;
  categoryId: string;
  subcategory?: string | null;
  buyUrl?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  linkStatus?: "seeded" | "pending-manual";
  affiliateLinks?: ProductAffiliateLink[];
  fallbackUrl?: string | null;
  availabilityStatus?: ProductAvailabilityStatus | null;
  commerceConfidence?: ProductCommerceConfidence;
  notes?: string | null;
  installedPhotoIds?: string[];
  compatibilityNotes?: string | null;
};

export type ExpertBuildCategoryGroup = {
  categoryId: string;
  categoryLabel: string;
  accessories: ExpertBuildAccessory[];
};

export type ExpertBuildBikeFitment = {
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  variant?: string | null;
  family?: string | null;
};

export type ExpertBuildDNA = {
  purpose: ExpertBuildPurpose;
  ridingStyle: ExpertBuildRidingStyle;
  terrainFocus: ExpertBuildTerrainFocus;
  loadProfile: ExpertBuildLoadProfile;
  categoryStrengths: Partial<
    Record<ExpertBuildStrengthCategory, ExpertBuildStrengthLevel>
  >;
};

export type ExpertBuildCredibility = {
  hasRealBuildPhotos?: boolean;
  verifiedBuilder?: boolean;
  featuredBuild?: boolean;
  editorsPick?: boolean;
  communityFavourite?: boolean;
  installNotesAvailable?: boolean;
};

export type ExpertBuild = {
  id: string;
  slug: string;
  title: string;
  builderName: string;
  builderLocation?: string | null;
  bikeFitment: ExpertBuildBikeFitment;
  summary: string;
  description?: string | null;
  primaryPhoto: ExpertBuildPhoto;
  galleryPhotos: ExpertBuildPhoto[];
  accessories: ExpertBuildAccessory[];
  tags: string[];
  featured: boolean;
  published: boolean;
  likeCount?: number;
  credibility?: ExpertBuildCredibility;
  dna: ExpertBuildDNA;
  bike_make?: string;
  bike_model?: string;
  bike_year?: number;
};

export type ExpertBuildAccessoryPhoto = {
  id: string;
  build_accessory_id: string;
  build_photo_id: string;
};

export type ExpertBuildWithRelations = {
  build: ExpertBuild;
  photos: ExpertBuildPhoto[];
  accessories: ExpertBuildAccessory[];
  accessoryPhotoLinks: ExpertBuildAccessoryPhoto[];
};

export type ResolvedExpertBuildAccessory = ExpertBuildAccessory & {
  product: Product;
  matchedProductId?: number | null;
};

export type ResolvedExpertBuildCategoryGroup = {
  id: string;
  name: string;
  accessories: ResolvedExpertBuildAccessory[];
  items: Product[];
};

export type ExpertBuildMatchSummary = {
  buildId: string;
  matchScore: number;
  directOverlapCount: number;
  comparableAccessoryCount: number;
  categoryCoverageCount: number;
  categoryCoverageTotal: number;
  missingCategories: string[];
  differentCategories: string[];
  extraCategories: string[];
  missingAccessories: ResolvedExpertBuildAccessory[];
  alreadyHaveAccessories: ResolvedExpertBuildAccessory[];
  differentAccessories: Array<{
    expertAccessory: ResolvedExpertBuildAccessory;
    yourProducts: Product[];
  }>;
};

export type ExpertBuildInspirationSelection = {
  buildId: string;
  buildTitle: string;
  mode: "all" | "missing-only";
  addedAt: string;
  sourceBuilder: string;
  items: Product[];
  accessoryIds: string[];
};

export type ResolvedExpertBuild = ExpertBuild & {
  name: string;
  image: string;
  builderLabel: string;
  theme: string;
  styleTags: string[];
  bestFor: string[];
  metadata: {
    buildType: string;
    completenessScore: number;
    style: string;
    visibilityLevel: string;
  };
  items: Product[];
  resolvedAccessories: ResolvedExpertBuildAccessory[];
  categoryGroups: ResolvedExpertBuildCategoryGroup[];
  galleryCount: number;
  accessoryCount: number;
  fitmentLabel: string;
  dnaSummary: string;
  emphasisSummary: Array<{
    category: ExpertBuildStrengthCategory;
    label: string;
    strength: ExpertBuildStrengthLevel;
  }>;
  credibilityBadges: string[];
  matchSummary: ExpertBuildMatchSummary;
};
