import { garageCategories } from "../../types/garage";
import type { Product, SupabaseBike } from "../../types/garage";
import { expertBuildCatalog } from "./data";
import type {
  ExpertBuild,
  ExpertBuildAccessory,
  ExpertBuildCategoryGroup,
  ExpertBuildInspirationSelection,
  ExpertBuildMatchSummary,
  ExpertBuildStrengthCategory,
  ExpertBuildStrengthLevel,
  ResolvedExpertBuild,
  ResolvedExpertBuildAccessory,
  ResolvedExpertBuildCategoryGroup,
} from "./types";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeModelSignature(value: string | null | undefined) {
  return normalizeText(value ?? "").replace(/[^a-z0-9]/g, "");
}

function getBMWModelAliases(value: string | null | undefined) {
  const normalized = normalizeModelSignature(value);

  if (!normalized) {
    return new Set<string>();
  }

  const aliases = new Set<string>([normalized]);

  if (
    normalized.includes("r1300gsa") ||
    (normalized.includes("r1300gs") && normalized.includes("adventure"))
  ) {
    aliases.add("r1300gsa");
    aliases.add("r1300gsadventure");
    aliases.add("r1300gs");
  } else if (normalized.includes("r1300gs")) {
    aliases.add("r1300gs");
  }

  return aliases;
}

function getBikeModelAliases(bike: SupabaseBike) {
  if (normalizeText(bike.make) === "bmw") {
    const aliases = new Set<string>([
      ...getBMWModelAliases(bike.model),
      ...getBMWModelAliases(`${bike.model} ${bike.variant ?? ""}`),
      ...getBMWModelAliases(bike.variant),
    ]);

    return aliases;
  }

  return new Set<string>([
    normalizeModelSignature(bike.model),
    normalizeModelSignature(`${bike.model} ${bike.variant ?? ""}`),
  ]);
}

function getBuildModelAliases(build: ExpertBuild) {
  if (normalizeText(build.bikeFitment.make) === "bmw") {
    const aliases = new Set<string>([
      ...getBMWModelAliases(build.bikeFitment.model),
      ...getBMWModelAliases(
        `${build.bikeFitment.model} ${build.bikeFitment.variant ?? ""}`
      ),
      ...getBMWModelAliases(build.bikeFitment.variant),
    ]);

    return aliases;
  }

  return new Set<string>([
    normalizeModelSignature(build.bikeFitment.model),
    normalizeModelSignature(
      `${build.bikeFitment.model} ${build.bikeFitment.variant ?? ""}`
    ),
  ]);
}

function setsIntersect(left: Set<string>, right: Set<string>) {
  for (const value of left) {
    if (right.has(value)) {
      return true;
    }
  }

  return false;
}

function createDeterministicNegativeId(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return -Math.abs(hash || 1);
}

function getBikeFamilySignature(bike: SupabaseBike) {
  const normalizedModel = normalizeModelSignature(
    `${bike.model} ${bike.variant ?? ""}`
  );

  if (normalizeText(bike.make) === "bmw" && normalizedModel.includes("r1300gs")) {
    return "bmw-r1300gs";
  }

  if (
    normalizeText(bike.make) === "ducati" &&
    normalizedModel.includes("multistradav4")
  ) {
    return "ducati-multistrada-v4";
  }

  if (
    normalizeText(bike.make) === "yamaha" &&
    normalizedModel.includes("tenere700")
  ) {
    return "yamaha-tenere-700";
  }

  if (
    normalizeText(bike.make) === "ktm" &&
    normalizedModel.includes("890adventure")
  ) {
    return "ktm-890-adventure";
  }

  return `${normalizeText(bike.make)}-${normalizedModel || "unknown-model"}`;
}

function isBikeWithinFitment(build: ExpertBuild, bike: SupabaseBike) {
  const sameMake = normalizeText(build.bikeFitment.make) === normalizeText(bike.make);
  const sameModel = setsIntersect(getBuildModelAliases(build), getBikeModelAliases(bike));
  const inYearRange =
    bike.year >= build.bikeFitment.yearStart && bike.year <= build.bikeFitment.yearEnd;

  if (sameMake && sameModel && inYearRange) {
    return 2;
  }

  if (
    sameMake &&
    build.bikeFitment.family &&
    normalizeText(build.bikeFitment.family).replace(/\s+/g, "-") ===
      getBikeFamilySignature(bike)
  ) {
    return 1;
  }

  return 0;
}

function getCategoryLabel(categoryId: string) {
  return (
    garageCategories.find((category) => category.id === categoryId)?.label ?? "Other"
  );
}

function resolveAccessoryProduct(
  build: ExpertBuild,
  accessory: ExpertBuildAccessory,
  products: Product[]
): Product {
  const linkedProduct =
    (typeof accessory.productId === "number"
      ? products.find((product) => product.id === accessory.productId)
      : null) ??
    products.find(
      (product) =>
        normalizeText(product.name) === normalizeText(accessory.title) &&
        normalizeText(product.brand) === normalizeText(accessory.brand)
    );

  if (linkedProduct) {
    return linkedProduct;
  }

  return {
    id: createDeterministicNegativeId(`${build.id}-${accessory.id}`),
    name: accessory.title,
    brand: accessory.brand,
    price: 0,
    supplierUrl: accessory.buyUrl ?? null,
    subcategory: accessory.subcategory ?? null,
    affiliateLinks: accessory.affiliateLinks ?? [],
    fallbackUrl: accessory.fallbackUrl ?? accessory.buyUrl ?? null,
    availabilityStatus: accessory.availabilityStatus ?? null,
    commerceConfidence:
      (accessory.affiliateLinks?.length ?? 0) > 0
        ? "linked"
        : accessory.buyUrl || accessory.fallbackUrl
        ? "fallback"
        : accessory.commerceConfidence ?? "unknown",
    categoryId: accessory.categoryId,
    description:
      accessory.notes ??
      accessory.compatibilityNotes ??
      `${accessory.title} from the ${build.title} expert build.`,
    image: build.primaryPhoto.imageUrl || "/placeholder-new.jpg",
    featuredOrder: 100_000,
    compatibility: {
      bikeIds: [],
      universal: false,
    },
  };
}

function groupResolvedAccessoriesByCategory(
  accessories: ResolvedExpertBuildAccessory[]
): ResolvedExpertBuildCategoryGroup[] {
  const groupMap = new Map<string, ResolvedExpertBuildAccessory[]>();

  accessories.forEach((accessory) => {
    groupMap.set(accessory.categoryId, [
      ...(groupMap.get(accessory.categoryId) ?? []),
      accessory,
    ]);
  });

  return Array.from(groupMap.entries()).map(([categoryId, groupedAccessories]) => ({
    id: categoryId,
    name: getCategoryLabel(categoryId),
    accessories: groupedAccessories,
    items: groupedAccessories.map((accessory) => accessory.product),
  }));
}

export function getExpertBuildAccessoryCount(build: ExpertBuild) {
  return build.accessories.length;
}

export function getExpertBuildGalleryCount(build: ExpertBuild) {
  return build.galleryPhotos.length;
}

export function getExpertBuildCategoryGroups(build: ExpertBuild): ExpertBuildCategoryGroup[] {
  const groups = new Map<string, ExpertBuildAccessory[]>();

  build.accessories.forEach((accessory) => {
    groups.set(accessory.categoryId, [
      ...(groups.get(accessory.categoryId) ?? []),
      accessory,
    ]);
  });

  return Array.from(groups.entries()).map(([categoryId, accessories]) => ({
    categoryId,
    categoryLabel: getCategoryLabel(categoryId),
    accessories,
  }));
}

export function getExpertBuildCategoryStrengthSummary(build: ExpertBuild) {
  return Object.entries(build.dna.categoryStrengths)
    .filter((entry): entry is [ExpertBuildStrengthCategory, ExpertBuildStrengthLevel] =>
      typeof entry[0] === "string" && typeof entry[1] === "number"
    )
    .sort((left, right) => right[1] - left[1])
    .map(([category, strength]) => ({
      category,
      label: category === "camping-travel" ? "Camping & Travel" : getCategoryLabel(category),
      strength,
    }));
}

export function getExpertBuildPersonalitySummary(build: ExpertBuild) {
  const purposeLabel = build.dna.purpose.replace("-", " ");
  const ridingStyleLabel = build.dna.ridingStyle.replace("-", " ");
  const terrainLabel = build.dna.terrainFocus.replace("-", " ");
  const loadLabel = build.dna.loadProfile.replace("-", " ");

  return `${capitalize(purposeLabel)}-heavy, ${ridingStyleLabel}-biased, ${terrainLabel}-focused, ${loadLabel} ready.`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getExpertBuildCredibilityBadges(build: ExpertBuild) {
  const badges: string[] = [];

  if (build.credibility?.featuredBuild || build.featured) {
    badges.push("Featured build");
  }
  if (build.credibility?.editorsPick) {
    badges.push("Editor's pick");
  }
  if (build.credibility?.communityFavourite) {
    badges.push("Community favourite");
  }
  if (build.credibility?.verifiedBuilder) {
    badges.push("Verified builder");
  }
  if (build.credibility?.installNotesAvailable) {
    badges.push("Install notes");
  }
  if (build.credibility?.hasRealBuildPhotos) {
    badges.push("Real build photos");
  }

  return badges;
}

export function getExpertBuildMatchSummary(
  build: ResolvedExpertBuild,
  selectedProducts: Product[]
): ExpertBuildMatchSummary {
  const yourProductIds = new Set(selectedProducts.map((product) => product.id));
  const yourCategories = new Set(selectedProducts.map((product) => product.categoryId));
  const expertCategories = new Set(build.resolvedAccessories.map((accessory) => accessory.categoryId));

  const alreadyHaveAccessories = build.resolvedAccessories.filter((accessory) =>
    yourProductIds.has(accessory.product.id)
  );
  const missingAccessories = build.resolvedAccessories.filter(
    (accessory) => !yourProductIds.has(accessory.product.id)
  );
  const categoryCoverageCount = Array.from(expertCategories).filter((categoryId) =>
    yourCategories.has(categoryId)
  ).length;
  const missingCategories = Array.from(expertCategories).filter(
    (categoryId) => !yourCategories.has(categoryId)
  );
  const extraCategories = Array.from(yourCategories).filter(
    (categoryId) => !expertCategories.has(categoryId)
  );
  const differentAccessories = build.resolvedAccessories
    .filter(
      (accessory) =>
        !yourProductIds.has(accessory.product.id) &&
        selectedProducts.some((product) => product.categoryId === accessory.categoryId)
    )
    .map((accessory) => ({
      expertAccessory: accessory,
      yourProducts: selectedProducts.filter(
        (product) => product.categoryId === accessory.categoryId
      ),
    }));
  const differentCategories = Array.from(
    new Set(differentAccessories.map((entry) => entry.expertAccessory.categoryId))
  );
  const directOverlapRatio =
    build.resolvedAccessories.length === 0
      ? 0
      : alreadyHaveAccessories.length / build.resolvedAccessories.length;
  const categoryCoverageRatio =
    expertCategories.size === 0 ? 0 : categoryCoverageCount / expertCategories.size;
  const matchScore = Math.round(
    (directOverlapRatio * 0.7 + categoryCoverageRatio * 0.3) * 100
  );

  return {
    buildId: build.id,
    matchScore,
    directOverlapCount: alreadyHaveAccessories.length,
    comparableAccessoryCount: build.resolvedAccessories.length,
    categoryCoverageCount,
    categoryCoverageTotal: expertCategories.size,
    missingCategories: missingCategories.map(getCategoryLabel),
    differentCategories: differentCategories.map(getCategoryLabel),
    extraCategories: extraCategories.map(getCategoryLabel),
    missingAccessories,
    alreadyHaveAccessories,
    differentAccessories,
  };
}

export function resolveExpertBuild(
  build: ExpertBuild,
  products: Product[],
  selectedProducts: Product[]
): ResolvedExpertBuild {
  const resolvedAccessories = build.accessories.map((accessory) => {
    const product = resolveAccessoryProduct(build, accessory, products);

    return {
      ...accessory,
      product,
      matchedProductId:
        typeof accessory.productId === "number" ? accessory.productId : null,
    } satisfies ResolvedExpertBuildAccessory;
  });
  const categoryGroups = groupResolvedAccessoriesByCategory(resolvedAccessories);

  const resolvedBuildBase: Omit<ResolvedExpertBuild, "matchSummary"> = {
    ...build,
    name: build.title,
    image: build.primaryPhoto.imageUrl,
    builderLabel: build.builderName,
    theme: `${capitalize(build.dna.purpose.replace("-", " "))} ${build.dna.terrainFocus.replace("-", " ")} setup`,
    styleTags: [
      capitalize(build.dna.purpose.replace("-", " ")),
      capitalize(build.dna.ridingStyle.replace("-", " ")),
      capitalize(build.dna.terrainFocus.replace("-", " ")),
    ],
    bestFor: build.tags.slice(0, 3),
    metadata: {
      buildType: "Expert Build",
      completenessScore: Math.min(
        98,
        Math.max(68, Math.round((build.accessories.length / 12) * 100))
      ),
      style: capitalize(build.dna.ridingStyle.replace("-", " ")),
      visibilityLevel:
        (build.dna.categoryStrengths.lighting ?? 0) >= 4 ? "High" : "Balanced",
    },
    items: resolvedAccessories.map((accessory) => accessory.product),
    resolvedAccessories,
    categoryGroups,
    galleryCount: getExpertBuildGalleryCount(build),
    accessoryCount: getExpertBuildAccessoryCount(build),
    fitmentLabel: `${build.bikeFitment.make} ${build.bikeFitment.model} ${build.bikeFitment.yearStart === build.bikeFitment.yearEnd ? build.bikeFitment.yearStart : `${build.bikeFitment.yearStart}-${build.bikeFitment.yearEnd}`}`,
    dnaSummary: getExpertBuildPersonalitySummary(build),
    emphasisSummary: getExpertBuildCategoryStrengthSummary(build),
    credibilityBadges: getExpertBuildCredibilityBadges(build),
  };

  return {
    ...resolvedBuildBase,
    matchSummary: getExpertBuildMatchSummary(
      { ...resolvedBuildBase, matchSummary: undefined as never },
      selectedProducts
    ),
  };
}

export function getExpertBuildsForBike(
  currentBike: SupabaseBike | null,
  products: Product[],
  selectedProducts: Product[]
) {
  if (!currentBike) {
    return [] as ResolvedExpertBuild[];
  }

  return expertBuildCatalog
    .filter((build) => build.published)
    .map((build) => ({
      build,
      matchLevel: isBikeWithinFitment(build, currentBike),
    }))
    .filter((entry) => entry.matchLevel > 0)
    .sort((left, right) => {
      if (left.matchLevel !== right.matchLevel) {
        return right.matchLevel - left.matchLevel;
      }

      if (left.build.featured !== right.build.featured) {
        return left.build.featured ? -1 : 1;
      }

      return left.build.title.localeCompare(right.build.title);
    })
    .map((entry) => resolveExpertBuild(entry.build, products, selectedProducts));
}

export function getMissingInspirationProducts(
  build: ResolvedExpertBuild,
  selectedProducts: Product[]
) {
  const yourProductIds = new Set(selectedProducts.map((product) => product.id));

  return build.items.filter((product) => !yourProductIds.has(product.id));
}

export function createExpertBuildInspirationSelection(input: {
  build: ResolvedExpertBuild;
  mode: "all" | "missing-only";
  items: Product[];
}): ExpertBuildInspirationSelection {
  return {
    buildId: input.build.id,
    buildTitle: input.build.title,
    mode: input.mode,
    addedAt: new Date().toISOString(),
    sourceBuilder: input.build.builderName,
    items: input.items,
    accessoryIds: input.build.resolvedAccessories
      .filter((accessory) => input.items.some((item) => item.id === accessory.product.id))
      .map((accessory) => accessory.id),
  };
}
