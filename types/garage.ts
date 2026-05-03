export type ProductAffiliateLink = {
  vendorName: string;
  url: string;
  label?: string | null;
  priority?: number | null;
};

export type ProductAvailabilityStatus =
  | "available"
  | "limited"
  | "coming-soon"
  | "unavailable";

export type ProductCommerceConfidence = "linked" | "fallback" | "unknown";

export type Product = {
  id: number;
  name: string;
  brand: string;
  price: number;
  supplierUrl?: string | null;
  subcategory?: string | null;
  affiliateLinks?: ProductAffiliateLink[];
  fallbackUrl?: string | null;
  availabilityStatus?: ProductAvailabilityStatus | null;
  commerceConfidence?: ProductCommerceConfidence;
  categoryId: string;
  description: string;
  image: string;
  imageSourceLabel?: string | null;
  imageSourceUrl?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  fitmentConfidence?: CompatibilityLabel | null;
  featuredOrder: number;
  compatibility: {
    bikeIds: string[];
    universal?: boolean;
  };
};

export type GarageOwnershipStatus =
  | "Owned"
  | "In service"
  | "Previously owned"
  | "Wishlist";

export type GarageBuildStatus = "Draft" | "Saved" | "Archived";

export type GarageBuildType =
  | "Personal Build"
  | "Expert Match"
  | "Travel Setup"
  | "Daily Setup";

export type ExpertBuildOption = {
  id: string;
  name: string;
  bike: {
    make: string;
    model: string;
    year: number;
  };
  theme: string;
  builderLabel: string;
  summary: string;
  image: string;
  heroImageTag?: string;
  bestFor: string[];
  styleTags: string[];
  compatibility: {
    make: string;
    model: string;
    yearRange: [number, number];
  };
  metadata: {
    buildType: string;
    completenessScore: number;
    style: string;
    visibilityLevel: string;
  };
  categoryGroups: Array<{
    id: string;
    name: string;
    items: Product[];
  }>;
  items: Product[];
};

export type CompareStatus =
  | "Match"
  | "Missing from your build"
  | "Only in your build"
  | "Different item";

export type CompareFilter =
  | "all"
  | "missing"
  | "different"
  | "matches"
  | "yours-only";

export type CompareCategoryRow = {
  key: string;
  status: CompareStatus;
  yourProduct: Product | null;
  expertProduct: Product | null;
  actionProduct?: Product | null;
};

export type CompareCategorySection = {
  categoryId: string;
  categoryLabel: string;
  rows: CompareCategoryRow[];
};

export type GarageCategory = {
  id: string;
  label: string;
};

export const garageCategories: GarageCategory[] = [
  { id: "all", label: "All" },
  { id: "luggage", label: "Luggage" },
  { id: "protection", label: "Protection" },
  { id: "performance", label: "Performance" },
  { id: "lighting", label: "Lighting" },
  { id: "navigation", label: "Navigation" },
  { id: "seats", label: "Seats" },
  { id: "windscreens", label: "Windscreens" },
  { id: "electronics", label: "Electronics" },
  { id: "ergonomics", label: "Ergonomics" },
  { id: "security", label: "Security" },
  { id: "tyres", label: "Tyres" },
  { id: "styling", label: "Styling" },
  { id: "safety-visibility", label: "Safety & Visibility" },
  { id: "rider-tech-recording", label: "Rider Tech & Recording" },
  { id: "connectivity-navigation", label: "Connectivity & Navigation" },
  { id: "electrical", label: "Electrical" },
  { id: "power-support", label: "Power" },
];

export type CompatibilityLabel = "Exact fit" | "Universal fit" | "Not confirmed";

export type BikePhoto = {
  id: string;
  bikeId: string;
  imageUrl: string;
  storagePath?: string | null;
  caption?: string | null;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
};

export type SavedBuildPhoto = {
  id: string;
  buildId: string;
  imageUrl: string;
  storagePath?: string | null;
  caption?: string | null;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
};

export type SupabaseBike = {
  id: string;
  sourceBikeId?: string | null;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  category: string | null;
  engine_cc: number | null;
  image?: string | null;
  heroImageUrl?: string | null;
  photoCount?: number;
  coverPhotoId?: string | null;
  photos?: BikePhoto[];
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  garageBikeName?: string | null;
  nickname?: string | null;
  ownershipStatus?: GarageOwnershipStatus | null;
  isArchived?: boolean;
};

export type GarageBuildCategoryGroup = {
  categoryId: string;
  categoryLabel: string;
  items: Product[];
};

export type GarageBuildItem = {
  id: string;
  buildId: string;
  productId: number;
  product: Product;
  sortOrder: number;
  createdAt: string;
};

export type GarageBuildCloneIntent =
  | "saved-copy"
  | "workspace-copy"
  | "version-branch";

export type GarageBuildSaveMode =
  | "save-as-new"
  | "update-existing"
  | "save-as-version"
  | "duplicate-build";

export type GarageBuildLatestMergeSummary = {
  sourceBuildId: string;
  sourceBuildTitle: string;
  appliedAt: string;
  mergeMode: string;
  additions: number;
  replacements: number;
  affectedCategories: string[];
  impactSummary: string;
};

export type GarageBuildProvenance = {
  creationMode:
    | "manual"
    | "cloned"
    | "merged-from-expert"
    | "versioned"
    | "saved-from-expert";
  createdAt: string;
  updatedAt: string;
  sourceBuildId?: string | null;
  sourceBuildName?: string | null;
  sourceExpertBuildId?: string | null;
  sourceExpertBuildTitle?: string | null;
  parentBuildId?: string | null;
  parentBuildName?: string | null;
  cloneIntent?: GarageBuildCloneIntent | null;
  latestMerge?: GarageBuildLatestMergeSummary | null;
  lineageNote?: string | null;
};

export type GarageBuildVersion = {
  buildId: string;
  rootBuildId: string;
  parentBuildId: string | null;
  versionNumber: number;
  revisionLabel: string;
  familyName: string;
};

export type GarageBuildVersionSummary = {
  label: string;
  parentLabel: string | null;
  rootBuildId: string;
  isRoot: boolean;
};

export type GarageBuildLineage = {
  buildId: string;
  rootBuildId: string;
  parentBuildId: string | null;
  derivedFromBuildId?: string | null;
  derivedFromBuildName?: string | null;
  breadcrumbs: string[];
  relatedBuildIds: string[];
  latestVersionLabel?: string | null;
};

export type GarageBuildHistoryEvent = {
  id: string;
  type:
    | "created"
    | "updated"
    | "duplicated"
    | "versioned"
    | "expert-merged"
    | "saved-from-expert";
  at: string;
  summary: string;
  sourceBuildId?: string | null;
  sourceBuildName?: string | null;
  mergeSourceTitle?: string | null;
};

export type GarageBuildRecord = {
  id: string;
  bikeId: string;
  name: string;
  status: GarageBuildStatus;
  buildType: GarageBuildType;
  isPrimary: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt: string;
  accessoryCount: number;
  indicativeTotal: number;
  buildItems: GarageBuildItem[];
  productGroups: GarageBuildCategoryGroup[];
  provenance?: GarageBuildProvenance | null;
  version?: GarageBuildVersion | null;
  lineage?: GarageBuildLineage | null;
  versionSummary?: GarageBuildVersionSummary | null;
  history?: GarageBuildHistoryEvent[];
  photos?: SavedBuildPhoto[];
};

export type GarageBikeRecord = SupabaseBike & {
  sourceBikeId?: string | null;
  nickname?: string | null;
  ownershipStatus?: GarageOwnershipStatus | null;
  isArchived?: boolean;
  builds: GarageBuildRecord[];
};

export type GarageBikeOverviewCard = {
  id: string;
  heroImageUrl: string | null;
  make: string;
  model: string;
  year: number;
  nickname?: string | null;
  ownershipStatus?: GarageOwnershipStatus | null;
  photoCount: number;
  buildCount: number;
};

export type MyGarageView =
  | { level: "overview" }
  | { level: "bike"; bikeId: string }
  | { level: "build"; bikeId: string; buildId: string };

export type ActiveWorkingBikeContext = {
  selectedBikeId: string | null;
  source: "template" | "garage" | "none";
  bike: SupabaseBike | null;
  templateBike: SupabaseBike | null;
  garageBike: GarageBikeRecord | null;
  garageBikeId: string | null;
  templateBikeId: string | null;
  isSavedGarageBike: boolean;
};

export type GarageResumeEntry = {
  key: string;
  bikeId: string;
  buildId: string;
  bikeName: string;
  buildName: string;
  bikeLabel: string;
  optionLabel: string;
  updatedAt: string;
  isPrimary: boolean;
};

export type GarageStepId = "Bike" | "Build" | "Expert" | "Compare" | "Save" | "Buy";

export type CompareSummary = {
  sharedCount: number;
  missingCount: number;
  yourOnlyCount: number;
  matchCost: number;
};

export type CompareFilterMeta = {
  title: string;
  emptyTitle: string;
  emptyBody: string;
};
