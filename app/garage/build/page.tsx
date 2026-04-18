"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductPurchaseOptions } from "../../../components/commerce/ProductPurchaseOptions";
import { CompareBuildsStep } from "../../../components/garage/CompareBuildsStep";
import { GarageBikeStep } from "../../../components/garage/GarageBikeStep";
import { GarageBuildStep } from "../../../components/garage/GarageBuildStep";
import { GarageProductDetailModal } from "../../../components/garage/GarageProductDetailModal";
import { GarageShopStep } from "../../../components/garage/GarageShopStep";
import {
  GarageSectionHeader,
  GarageStepShell,
  GarageSummaryCard,
  garagePrimaryButtonStyle,
  garageSecondaryButtonStyle,
} from "../../../components/garage/GarageLayout";
import { GarageBuildProvenanceCard } from "../../../components/garage/GarageBuildProvenanceCard";
import { ExpertBuildMergeAppliedNotice } from "../../../components/garage/ExpertBuildMergeAppliedNotice";
import { ExpertBuildMergeResumeCard } from "../../../components/garage/ExpertBuildMergeResumeCard";
import { ExpertBuildsStep } from "../../../components/garage/ExpertBuildsStep";
import { MyGarageStep } from "../../../components/garage/MyGarageStep";
import { GarageScreen } from "../../../components/garage/GarageScreen";
import { GarageStepNav } from "../../../components/garage/GarageStepNav";
import {
  getCompareCategorySections,
  getCompareFilterCounts,
  getCompareFilterMeta,
  getCompareSummary,
  getFilteredCompareCategorySections,
} from "../../../lib/garage/compare";
import {
  applyGarageBuildMetadata,
  createGarageBuildMetadata,
  extractGarageBuildMetadata,
  getGarageBuildComparisonSummary,
  getSuggestedGarageBuildName,
  mapMergeEventToGarageBuildMergeSummary,
} from "../../../lib/garage/build-lineage";
import type { PersistedGarageBuildMetadata } from "../../../lib/garage/build-lineage-persistence";
import { resolveProductCommerce } from "../../../lib/commerce/resolveProductCommerce";
import { trackProductCommerceClick } from "../../../lib/commerce/tracking";
import { demoGarageBikes } from "../../../lib/demo-content/bikes";
import { demoGarageProducts } from "../../../lib/demo-content/products";
import {
  createGarageBikeRecord,
  createGarageBuildRecord,
  createGarageBuildItems,
  getGarageBikeBuild,
  groupGarageBuildProductsByCategory,
  mapExpertBuildCategoryGroups,
} from "../../../lib/garage/myGarage";
import {
  deleteGarageBuildPhoto,
  deleteGarageBike,
  deleteGarageBuild,
  loadGarageFromSupabase,
  replaceGarageBuildItems,
  setGarageBikeCoverPhoto,
  uploadGarageBuildPhoto,
  uploadGarageBikePhoto,
  upsertGarageBike,
  upsertGarageBuild,
} from "../../../lib/garage/persistence";
import {
  buildGarageResumeEntries,
  compareGarageBuildSelectionPriority,
  createActiveWorkingBikeContext,
  createGarageBikeInstanceFromTemplate,
  createGarageBikeInstanceId,
  getGarageBikeDisplayName,
  getGarageBikePickerLabel,
  getGarageBikeSelectorLabel,
  getPreferredGarageBuildForBike,
} from "../../../lib/garage/working-context";
import { formatGaragePriceDisplay } from "../../../lib/garage/price-display";
import {
  FALLBACK_BIKE_PLACEHOLDER,
  resolveGarageBikePreviewImage,
} from "../../../lib/garage/bike-images";
import { buildLoginHref } from "../../../lib/auth/redirect";
import {
  createExpertBuildInspirationSelection,
  getExpertBuildsForBike,
  getMissingInspirationProducts,
} from "../../../lib/expert-builds/helpers";
import {
  applyExpertBuildMergeDecisionToCategory,
  createExpertBuildMergeDraftPersisted,
  createExpertBuildMergeDraft,
  createExpertBuildMergeEvent,
  createExpertBuildMergePreview,
  createExpertBuildMergeProvenance,
  fingerprintExpertBuildMergeSnapshot,
  isExpertBuildMergeDraftStale,
  markExpertBuildMergeDraftSaved,
  rebaseExpertBuildMergeDraft,
  restoreExpertBuildMergeDraft,
  setExpertBuildMergeItemDecision,
  type ExpertBuildApplyMode,
  type ExpertBuildMergeDecision,
  type ExpertBuildMergeDraft,
  type ExpertBuildMergeDraftPersisted,
  type ExpertBuildMergeEvent,
  type ExpertBuildMergeRestorePoint,
  updateExpertBuildMergeMode,
  validateExpertBuildMergeDraft,
} from "../../../lib/expert-builds/merge";
import {
  readPersistedExpertBuildMergeDrafts,
  readPersistedExpertBuildMergeEvents,
  writePersistedExpertBuildMergeDrafts,
  writePersistedExpertBuildMergeEvents,
} from "../../../lib/expert-builds/merge-persistence";
import { supabase } from "../../../lib/supabase";
import type {
  CommerceSourceContext,
  ResolvedProductCommerce,
} from "../../../lib/commerce/types";
import type {
  ExpertBuildInspirationSelection,
  ExpertBuildPurpose,
  ResolvedExpertBuildAccessory,
  ResolvedExpertBuild,
} from "../../../lib/expert-builds/types";
import type {
  ActiveWorkingBikeContext,
  BikePhoto,
  CompareCategorySection,
  CompareFilter,
  CompatibilityLabel,
  GarageBikeRecord,
  GarageResumeEntry,
  GarageBuildHistoryEvent,
  GarageBuildSaveMode,
  GarageBuildRecord,
  GarageOwnershipStatus,
  GarageStepId,
  MyGarageView,
  Product,
  SavedBuildPhoto,
  SupabaseBike,
} from "../../../types/garage";
import { garageCategories as categories } from "../../../types/garage";

type GarageProductRow = {
  id: number | string;
  name: string;
  brand: string;
  price?: number | string | null;
  supplier_url?: string | null;
  product_url?: string | null;
  url?: string | null;
  link?: string | null;
  subcategory?: string | null;
  affiliate_links?: unknown;
  fallback_url?: string | null;
  availability_status?: string | null;
  category_id: string;
  description: string;
  image: string;
  featured_order?: number | null;
  bike_ids?: unknown;
  universal?: boolean | null;
};

function mapGarageProductRow(product: GarageProductRow): Product {
  const affiliateLinks = Array.isArray(product.affiliate_links)
    ? product.affiliate_links
        .filter(
          (
            entry
          ): entry is {
            vendorName: string;
            url: string;
            label?: string | null;
            priority?: number | null;
          } =>
            Boolean(entry) &&
            typeof entry === "object" &&
            typeof (entry as { vendorName?: unknown }).vendorName === "string" &&
            typeof (entry as { url?: unknown }).url === "string"
        )
        .map((entry) => ({
          vendorName: entry.vendorName,
          url: entry.url,
          label: typeof entry.label === "string" ? entry.label : null,
          priority: typeof entry.priority === "number" ? entry.priority : null,
        }))
    : [];

  const supplierUrl =
    typeof product.supplier_url === "string"
      ? product.supplier_url
      : typeof product.product_url === "string"
      ? product.product_url
      : typeof product.url === "string"
      ? product.url
      : typeof product.link === "string"
      ? product.link
      : null;

  const fallbackUrl =
    typeof product.fallback_url === "string"
      ? product.fallback_url
      : supplierUrl;

  return {
    id: Number(product.id),
    name: product.name,
    brand: product.brand,
    price: Number(product.price ?? 0),
    supplierUrl,
    subcategory: typeof product.subcategory === "string" ? product.subcategory : null,
    affiliateLinks,
    fallbackUrl,
    availabilityStatus:
      product.availability_status === "available" ||
      product.availability_status === "limited" ||
      product.availability_status === "coming-soon" ||
      product.availability_status === "unavailable"
        ? product.availability_status
        : null,
    commerceConfidence:
      affiliateLinks.length > 0
        ? "linked"
        : supplierUrl || fallbackUrl
        ? "fallback"
        : "unknown",
    categoryId: product.category_id,
    description: product.description,
    image: product.image,
    featuredOrder: Number(product.featured_order ?? 999),
    compatibility: {
      bikeIds: Array.isArray(product.bike_ids) ? product.bike_ids.filter((id): id is string => typeof id === "string") : [],
      universal: product.universal === true,
    },
  };
}

function mergeGarageProducts(seedProducts: Product[], liveProducts: Product[]) {
  const productMap = new Map<string, Product>();

  [...seedProducts, ...liveProducts].forEach((product) => {
    const identityKey = `${product.brand.toLowerCase()}::${product.name.toLowerCase()}`;
    productMap.set(identityKey, product);
  });

  return Array.from(productMap.values()).sort(
    (left, right) => left.featuredOrder - right.featuredOrder
  );
}

function normalizeBikeTextValue(value: string | null | undefined) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function normalizeBikeSelectorBike(bike: SupabaseBike): SupabaseBike {
  const make = normalizeBikeTextValue(bike.make);
  const category = normalizeBikeTextValue(bike.category ?? null) || null;
  const baseModel = normalizeBikeTextValue(bike.model);
  const baseVariant = normalizeBikeTextValue(bike.variant ?? null) || null;

  if (make.toLowerCase() !== "bmw") {
    return {
      ...bike,
      make: make || bike.make,
      model: baseModel || bike.model,
      variant: baseVariant,
      category,
    };
  }

  const combinedSignature = `${baseModel} ${baseVariant ?? ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  let normalizedModel = baseModel || bike.model;
  let normalizedVariant = baseVariant;

  if (
    /\br\s*1300\s*gsa\b/.test(combinedSignature) ||
    (/\br\s*1300\s*gs\b/.test(combinedSignature) &&
      /\badventure\b/.test(combinedSignature))
  ) {
    normalizedModel = "R1300GSA";
  } else if (/\br\s*1300\s*gs\b/.test(combinedSignature)) {
    normalizedModel = "R1300GS";
  }

  if (/triple black/.test(combinedSignature)) {
    normalizedVariant = "Triple Black";
  } else if (!normalizedVariant) {
    const extractedVariant = baseModel
      .replace(/^r\s*1300\s*gs\s*adventure\b/i, "")
      .replace(/^r\s*1300\s*gsa\b/i, "")
      .replace(/^r\s*1300\s*gs\b/i, "")
      .trim();

    if (extractedVariant) {
      normalizedVariant = extractedVariant;
    }
  }

  return {
    ...bike,
    make: make || bike.make,
    model: normalizedModel,
    variant: normalizedVariant,
    category,
  };
}

function mergeGarageBikeSources(seedBikes: SupabaseBike[], liveBikes: SupabaseBike[]) {
  const bikeMap = new Map<string, SupabaseBike>();

  [...seedBikes, ...liveBikes].forEach((bike) => {
    const normalizedBike = normalizeBikeSelectorBike(bike);
    const identityKey = [
      normalizedBike.make.toLowerCase(),
      normalizedBike.model.toLowerCase(),
      (normalizedBike.variant || "base").toLowerCase(),
      String(normalizedBike.year),
    ].join("::");
    bikeMap.set(identityKey, normalizedBike);
  });

  return Array.from(bikeMap.values()).sort((left, right) =>
    left.make === right.make
      ? left.model.localeCompare(right.model) ||
        (left.variant || "Base").localeCompare(right.variant || "Base") ||
        right.year - left.year
      : left.make.localeCompare(right.make)
  );
}

function mergeGarageBikes(currentBikes: SupabaseBike[], incomingBikes: SupabaseBike[]) {
  const bikeMap = new Map<string, SupabaseBike>();

  [...currentBikes, ...incomingBikes].forEach((bike) => {
    bikeMap.set(bike.id, normalizeBikeSelectorBike(bike));
  });

  return Array.from(bikeMap.values()).sort((left, right) =>
    left.make === right.make
      ? left.model.localeCompare(right.model) || right.year - left.year
      : left.make.localeCompare(right.make)
  );
}

function isProductCompatible(
  product: {
    compatibility?: {
      bikeIds?: string[];
      universal?: boolean;
    } | null;
  },
  currentBikeId?: string | null
) {
  const compatibility = product.compatibility;

  if (!currentBikeId) return false;
  if (!compatibility) return true;
  if (compatibility.universal) return true;

  return Array.isArray(compatibility.bikeIds)
    ? compatibility.bikeIds.includes(currentBikeId)
    : false;
}
function getCompatibilityLabel(
  product: Product,
  bikeId: string
): CompatibilityLabel {
  if (product.compatibility.universal) return "Universal fit";
  if (product.compatibility.bikeIds.includes(bikeId)) return "Exact fit";
  return "Not confirmed";
}

function formatCurrency(value: number) {
  return formatGaragePriceDisplay(value, {
    locale: "en-AU",
    currency: "AUD",
    maximumFractionDigits: 0,
  });
}

function formatBuildWorkspacePriceLabel(value: number) {
  const displayValue = formatCurrency(value);
  return displayValue === "Price unknown" ? "Price: unknown" : `Price: ${displayValue}`;
}

function formatAccessoryPriceLabel(value: number) {
  const displayValue = formatCurrency(value);
  return displayValue === "Price unknown" ? "Price: unknown" : `Price: ${displayValue}`;
}

function getProductSupplierName(product: Product) {
  const supplierName = product.brand?.trim();
  return supplierName || "Supplier to be confirmed";
}

function getCategoryLabel(categoryId: string) {
  return categories.find((item) => item.id === categoryId)?.label || "Category";
}

function getBikeOptionLabel(bike: SupabaseBike) {
  const variant = bike.variant?.trim();
  return `${bike.make} ${bike.model}${variant ? ` ${variant}` : ""} ${bike.year}`;
}

function scrollGarageViewportToTop() {
  if (typeof window === "undefined") return;

  const scrollingElement = document.scrollingElement;

  if (scrollingElement) {
    scrollingElement.scrollTo({
      top: 0,
      behavior: "auto",
    });
    return;
  }

  window.scrollTo({
    top: 0,
    behavior: "auto",
  });
}

function getGarageStepFromParam(value: string | null): GarageStepId | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (normalized === "bike" || normalized === "choose-bike") return "Bike";
  if (normalized === "build") return "Build";
  if (normalized === "expert" || normalized === "expert-builds") return "Expert";
  if (normalized === "compare" || normalized === "compare-builds") return "Compare";
  if (normalized === "save" || normalized === "saved" || normalized === "saved-builds") return "Save";
  if (normalized === "buy" || normalized === "shop" || normalized === "buy-accessories" || normalized === "shop-accessories") return "Buy";

  return null;
}

function getGarageNoticeTone(message: string) {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("sign in") ||
    lowerMessage.includes("select ") ||
    lowerMessage.includes("could not") ||
    lowerMessage.includes("cannot") ||
    lowerMessage.includes("error") ||
    lowerMessage.includes("unexpected")
  ) {
    return {
      background: "#fef3c7",
      border: "#fde68a",
      color: "#92400e",
    };
  }

  if (
    lowerMessage.includes("unavailable") ||
    lowerMessage.includes("schema") ||
    lowerMessage.includes("sync")
  ) {
    return {
      background: "#eff6ff",
      border: "#bfdbfe",
      color: "#1d4ed8",
    };
  }

  return {
    background: "#dcfce7",
    border: "#bbf7d0",
    color: "#166534",
  };
}

function getProductSupplierUrl(product: Product) {
  const url = product.supplierUrl?.trim();
  return url ? url : null;
}

function normalizeOwnershipStatus(value: string | null): GarageOwnershipStatus | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (normalized === "owned") return "Owned";
  if (normalized === "in service") return "In service";
  if (normalized === "previously owned") return "Previously owned";
  if (normalized === "wishlist") return "Wishlist";

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPersistedMergeDraftDecisionSummary(
  draft: ExpertBuildMergeDraftPersisted | null
) {
  if (!draft) {
    return {
      decisionCount: 0,
      unresolvedCount: 0,
    };
  }

  return {
    decisionCount: draft.itemDecisions.filter(
      (item) => item.decision !== "unresolved"
    ).length,
    unresolvedCount: draft.itemDecisions.filter(
      (item) => item.decision === "unresolved"
    ).length,
  };
}

function areProductsEquivalent(left: Product, right: Product) {
  return (
    left.id === right.id &&
    left.name === right.name &&
    left.brand === right.brand &&
    left.price === right.price &&
    left.supplierUrl === right.supplierUrl &&
    left.subcategory === right.subcategory &&
    left.fallbackUrl === right.fallbackUrl &&
    left.availabilityStatus === right.availabilityStatus &&
    left.commerceConfidence === right.commerceConfidence &&
    left.categoryId === right.categoryId &&
    left.description === right.description &&
    left.image === right.image &&
    left.featuredOrder === right.featuredOrder &&
    areAffiliateLinksEqual(left.affiliateLinks ?? [], right.affiliateLinks ?? []) &&
    left.compatibility.universal === right.compatibility.universal &&
    areStringArraysEqual(left.compatibility.bikeIds, right.compatibility.bikeIds)
  );
}

function areProductArraysEquivalent(left: Product[], right: Product[]) {
  if (left === right) return true;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    if (!areProductsEquivalent(left[index], right[index])) {
      return false;
    }
  }

  return true;
}

function areStringArraysEqual(left: string[], right: string[]) {
  if (left === right) return true;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function areAffiliateLinksEqual(
  left: NonNullable<Product["affiliateLinks"]>,
  right: NonNullable<Product["affiliateLinks"]>
) {
  if (left === right) return true;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    if (
      left[index]?.vendorName !== right[index]?.vendorName ||
      left[index]?.url !== right[index]?.url ||
      left[index]?.label !== right[index]?.label ||
      (left[index]?.priority ?? null) !== (right[index]?.priority ?? null)
    ) {
      return false;
    }
  }

  return true;
}

function normalizeProduct(value: unknown): Product | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "number") return null;
  if (typeof value.name !== "string") return null;
  if (typeof value.brand !== "string") return null;
  if (typeof value.price !== "number") return null;
  if (typeof value.categoryId !== "string") return null;
  if (typeof value.description !== "string") return null;
  if (typeof value.image !== "string") return null;
  if (typeof value.featuredOrder !== "number") return null;

  const compatibility = isRecord(value.compatibility) ? value.compatibility : null;
  const bikeIds = Array.isArray(compatibility?.bikeIds)
    ? compatibility.bikeIds.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id: value.id,
    name: value.name,
    brand: value.brand,
    price: value.price,
    supplierUrl: typeof value.supplierUrl === "string" ? value.supplierUrl : null,
    subcategory: typeof value.subcategory === "string" ? value.subcategory : null,
    affiliateLinks: Array.isArray(value.affiliateLinks)
      ? value.affiliateLinks.reduce<NonNullable<Product["affiliateLinks"]>>((acc, entry) => {
          if (!isRecord(entry)) return acc;
          if (typeof entry.vendorName !== "string") return acc;
          if (typeof entry.url !== "string") return acc;

          acc.push({
            vendorName: entry.vendorName,
            url: entry.url,
            label: typeof entry.label === "string" ? entry.label : null,
            priority: typeof entry.priority === "number" ? entry.priority : null,
          });
          return acc;
        }, [])
      : [],
    fallbackUrl: typeof value.fallbackUrl === "string" ? value.fallbackUrl : null,
    availabilityStatus:
      value.availabilityStatus === "available" ||
      value.availabilityStatus === "limited" ||
      value.availabilityStatus === "coming-soon" ||
      value.availabilityStatus === "unavailable"
        ? value.availabilityStatus
        : null,
    commerceConfidence:
      value.commerceConfidence === "linked" ||
      value.commerceConfidence === "fallback" ||
      value.commerceConfidence === "unknown"
        ? value.commerceConfidence
        : "unknown",
    categoryId: value.categoryId,
    description: value.description,
    image: value.image,
    featuredOrder: value.featuredOrder,
    compatibility: {
      bikeIds,
      universal: compatibility?.universal === true,
    },
  };
}

function isGarageBuildRecord(value: unknown): value is GarageBuildRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.bikeId === "string" &&
    typeof value.name === "string" &&
    typeof value.status === "string" &&
    typeof value.buildType === "string" &&
    typeof value.isPrimary === "boolean" &&
    typeof value.updatedAt === "string" &&
    typeof value.accessoryCount === "number" &&
    typeof value.indicativeTotal === "number" &&
    Array.isArray(value.buildItems) &&
    Array.isArray(value.productGroups)
  );
}

function normalizeHydratedGarageSnapshot(snapshot: unknown) {
  const safeSnapshot = isRecord(snapshot) ? snapshot : {};
  const bikesInput = Array.isArray(safeSnapshot.bikes) ? safeSnapshot.bikes : [];
  const buildsInput = isRecord(safeSnapshot.buildsByBike) ? safeSnapshot.buildsByBike : {};

  const bikes = bikesInput.reduce<SupabaseBike[]>((acc, bike) => {
    if (!isRecord(bike)) return acc;
    if (typeof bike.id !== "string") return acc;
    if (typeof bike.make !== "string") return acc;
    if (typeof bike.model !== "string") return acc;
    if (typeof bike.year !== "number") return acc;

    acc.push(
      normalizeBikeSelectorBike({
      id: bike.id,
      sourceBikeId:
        typeof bike.sourceBikeId === "string" ? bike.sourceBikeId : null,
      make: bike.make,
      model: bike.model,
      year: bike.year,
      variant: typeof bike.variant === "string" ? bike.variant : null,
      category: typeof bike.category === "string" ? bike.category : null,
      engine_cc: typeof bike.engine_cc === "number" ? bike.engine_cc : null,
      image: typeof bike.image === "string" ? bike.image : null,
      heroImageUrl:
        typeof bike.heroImageUrl === "string" ? bike.heroImageUrl : null,
      photoCount: typeof bike.photoCount === "number" ? bike.photoCount : 0,
      coverPhotoId:
        typeof bike.coverPhotoId === "string" ? bike.coverPhotoId : null,
      photos: Array.isArray(bike.photos) ? bike.photos : [],
      garageBikeName:
        typeof bike.garageBikeName === "string"
          ? bike.garageBikeName
          : typeof bike.nickname === "string"
          ? bike.nickname
          : null,
      nickname: typeof bike.nickname === "string" ? bike.nickname : null,
      ownershipStatus: normalizeOwnershipStatus(
        typeof bike.ownershipStatus === "string" ? bike.ownershipStatus : null
      ),
      isArchived: bike.isArchived === true,
    })
    );

    return acc;
  }, []);

  const garageBikeMetaById = bikesInput.reduce<
    Record<
      string,
      {
        garageBikeName?: string | null;
        nickname?: string | null;
        ownershipStatus?: GarageOwnershipStatus | null;
        isArchived?: boolean;
      }
    >
  >((acc, bike) => {
    if (!isRecord(bike) || typeof bike.id !== "string") {
      return acc;
    }

    acc[bike.id] = {
      garageBikeName:
        typeof bike.garageBikeName === "string"
          ? bike.garageBikeName
          : typeof bike.nickname === "string"
          ? bike.nickname
          : null,
      nickname: typeof bike.nickname === "string" ? bike.nickname : null,
      ownershipStatus: normalizeOwnershipStatus(
        typeof bike.ownershipStatus === "string" ? bike.ownershipStatus : null
      ),
      isArchived: bike.isArchived === true,
    };

    return acc;
  }, {});

  const buildsByBike = Object.entries(buildsInput).reduce<
    Record<string, GarageBuildRecord[]>
  >(
    (acc, [bikeId, productsForBike]) => {
      if (typeof bikeId !== "string" || bikeId.length === 0) {
        return acc;
      }

      acc[bikeId] = Array.isArray(productsForBike)
        ? productsForBike.filter(isGarageBuildRecord)
        : [];
      return acc;
    },
    {}
  );

  return {
    bikes,
    garageBikeMetaById,
    buildsByBike,
  };
}

function isHydratedGarageSnapshotEmpty(snapshot: {
  bikes: SupabaseBike[];
  garageBikeMetaById: Record<
    string,
    {
      garageBikeName?: string | null;
      nickname?: string | null;
      ownershipStatus?: GarageOwnershipStatus | null;
      isArchived?: boolean;
    }
  >;
  buildsByBike: Record<string, GarageBuildRecord[]>;
}) {
  return (
    snapshot.bikes.length === 0 &&
    Object.keys(snapshot.garageBikeMetaById).length === 0 &&
    Object.keys(snapshot.buildsByBike).length === 0
  );
}

function getSafePersistenceErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  if (isRecord(error)) {
    const name = typeof error.name === "string" ? error.name : null;
    const message = typeof error.message === "string" ? error.message : null;
    const code = typeof error.code === "string" ? error.code : null;
    const details = typeof error.details === "string" ? error.details : null;
    const hint = typeof error.hint === "string" ? error.hint : null;

    if (name || message || code || details || hint) {
      return {
        name,
        message,
        code,
        details,
        hint,
      };
    }
  }

  if (typeof error === "string" && error.trim()) {
    return {
      name: null,
      message: error.trim(),
    };
  }

  return null;
}

function isBenignGaragePersistenceError(
  error: unknown,
  details: {
    name?: string | null;
    message?: string | null;
    code?: string | null;
    details?: string | null;
    hint?: string | null;
  } | null
) {
  if (error == null) {
    return true;
  }

  if (isRecord(error) && Object.keys(error).length === 0) {
    return true;
  }

  return isBenignRemoteSyncPersistError(details);
}

function isBenignRemoteSyncPersistError(details: {
  name?: string | null;
  message?: string | null;
  code?: string | null;
  details?: string | null;
  hint?: string | null;
} | null) {
  if (!details) {
    return true;
  }

  const haystack = [
    details.name,
    details.message,
    details.code,
    details.details,
    details.hint,
  ]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" ")
    .toLowerCase();

  return (
    haystack.includes("schema") ||
    haystack.includes("relation") ||
    haystack.includes("does not exist") ||
    haystack.includes("could not find") ||
    haystack.includes("failed to fetch") ||
    haystack.includes("fetch failed") ||
    haystack.includes("network") ||
    haystack.includes("pgrst") ||
    haystack.includes("42p01")
  );
}

function isBenignGarageBikePersistError(error: unknown) {
  const safeError = getSafePersistErrorDetails(error);

  if (error == null) {
    return true;
  }

  if (isRecord(error) && Object.keys(error).length === 0) {
    return true;
  }

  return isBenignRemoteSyncPersistError(safeError);
}

function getSafePersistErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: null,
      details: null,
      hint: null,
    };
  }

  if (isRecord(error)) {
    const name = typeof error.name === "string" ? error.name : null;
    const message = typeof error.message === "string" ? error.message : null;
    const code = typeof error.code === "string" ? error.code : null;
    const details = typeof error.details === "string" ? error.details : null;
    const hint = typeof error.hint === "string" ? error.hint : null;

    if (name || message || code || details || hint) {
      return {
        name,
        message,
        code,
        details,
        hint,
      };
    }
  }

  if (typeof error === "string" && error.trim()) {
    return {
      name: null,
      message: error.trim(),
      code: null,
      details: null,
      hint: null,
    };
  }

  return null;
}

function areBikeMetaMapsEqual(
  left: Record<
    string,
    {
      garageBikeName?: string | null;
      nickname?: string | null;
      ownershipStatus?: GarageOwnershipStatus | null;
      isArchived?: boolean;
    }
  >,
  right: Record<
    string,
    {
      garageBikeName?: string | null;
      nickname?: string | null;
      ownershipStatus?: GarageOwnershipStatus | null;
      isArchived?: boolean;
    }
  >
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (!areStringArraysEqual(leftKeys.sort(), rightKeys.sort())) {
    return false;
  }

  return leftKeys.every((key) => {
    const leftValue = left[key];
    const rightValue = right[key];

    return (
      leftValue?.garageBikeName === rightValue?.garageBikeName &&
      leftValue?.nickname === rightValue?.nickname &&
      leftValue?.ownershipStatus === rightValue?.ownershipStatus &&
      (leftValue?.isArchived ?? false) === (rightValue?.isArchived ?? false)
    );
  });
}

function areSupabaseBikeArraysEqual(left: SupabaseBike[], right: SupabaseBike[]) {
  if (left === right) return true;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    const leftBike = left[index];
    const rightBike = right[index];

    if (
      leftBike.id !== rightBike.id ||
      (leftBike.sourceBikeId ?? null) !== (rightBike.sourceBikeId ?? null) ||
      leftBike.make !== rightBike.make ||
      leftBike.model !== rightBike.model ||
      leftBike.year !== rightBike.year ||
      leftBike.variant !== rightBike.variant ||
      leftBike.category !== rightBike.category ||
      leftBike.engine_cc !== rightBike.engine_cc ||
      leftBike.image !== rightBike.image ||
      leftBike.heroImageUrl !== rightBike.heroImageUrl ||
      leftBike.photoCount !== rightBike.photoCount ||
      leftBike.coverPhotoId !== rightBike.coverPhotoId ||
      (leftBike.garageBikeName ?? null) !== (rightBike.garageBikeName ?? null) ||
      (leftBike.nickname ?? null) !== (rightBike.nickname ?? null) ||
      (leftBike.ownershipStatus ?? null) !== (rightBike.ownershipStatus ?? null) ||
      (leftBike.isArchived ?? false) !== (rightBike.isArchived ?? false)
    ) {
      return false;
    }
  }

  return true;
}

function areGarageBuildItemArraysEqual(
  left: GarageBuildRecord["buildItems"],
  right: GarageBuildRecord["buildItems"]
) {
  if (left === right) return true;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    const leftItem = left[index];
    const rightItem = right[index];

    if (
      leftItem.id !== rightItem.id ||
      leftItem.buildId !== rightItem.buildId ||
      leftItem.productId !== rightItem.productId ||
      leftItem.sortOrder !== rightItem.sortOrder ||
      leftItem.createdAt !== rightItem.createdAt ||
      !areProductsEquivalent(leftItem.product, rightItem.product)
    ) {
      return false;
    }
  }

  return true;
}

function areGarageBuildGroupArraysEqual(
  left: GarageBuildRecord["productGroups"],
  right: GarageBuildRecord["productGroups"]
) {
  if (left === right) return true;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    const leftGroup = left[index];
    const rightGroup = right[index];

    if (
      leftGroup.categoryId !== rightGroup.categoryId ||
      leftGroup.categoryLabel !== rightGroup.categoryLabel ||
      !areProductArraysEquivalent(leftGroup.items, rightGroup.items)
    ) {
      return false;
    }
  }

  return true;
}

function areGarageBuildRecordsEquivalent(
  left: GarageBuildRecord,
  right: GarageBuildRecord
) {
  return (
    left.id === right.id &&
    left.bikeId === right.bikeId &&
    left.name === right.name &&
    left.status === right.status &&
    left.buildType === right.buildType &&
    left.isPrimary === right.isPrimary &&
    left.notes === right.notes &&
    left.updatedAt === right.updatedAt &&
    left.accessoryCount === right.accessoryCount &&
    left.indicativeTotal === right.indicativeTotal &&
    JSON.stringify(left.photos ?? []) === JSON.stringify(right.photos ?? []) &&
    areGarageBuildItemArraysEqual(left.buildItems, right.buildItems) &&
    areGarageBuildGroupArraysEqual(left.productGroups, right.productGroups)
  );
}

function mergeGarageBuildRecords(
  current: GarageBuildRecord[],
  incoming: GarageBuildRecord[]
) {
  const buildMap = new Map<string, GarageBuildRecord>();

  [...current, ...incoming].forEach((build) => {
    buildMap.set(build.id, build);
  });

  return Array.from(buildMap.values()).sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
}

function mergeGarageBuildMaps(
  current: Record<string, GarageBuildRecord[]>,
  incoming: Record<string, GarageBuildRecord[]>
) {
  const keys = new Set([...Object.keys(current), ...Object.keys(incoming)]);
  const next: Record<string, GarageBuildRecord[]> = {};

  keys.forEach((key) => {
    next[key] = mergeGarageBuildRecords(current[key] ?? [], incoming[key] ?? []);
  });

  return next;
}

function mergeBikeMetaMaps(
  current: Record<
    string,
    { nickname?: string | null; ownershipStatus?: GarageOwnershipStatus | null; isArchived?: boolean }
  >,
  incoming: Record<
    string,
    { nickname?: string | null; ownershipStatus?: GarageOwnershipStatus | null; isArchived?: boolean }
  >
) {
  return {
    ...current,
    ...incoming,
  };
}

function areGarageBuildMapsEqual(
  left: Record<string, GarageBuildRecord[]>,
  right: Record<string, GarageBuildRecord[]>
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (!areStringArraysEqual(leftKeys.sort(), rightKeys.sort())) {
    return false;
  }

  return leftKeys.every((key) => {
    const leftBuilds = left[key] ?? [];
    const rightBuilds = right[key] ?? [];

    if (leftBuilds.length !== rightBuilds.length) {
      return false;
    }

    return leftBuilds.every((build, index) =>
      areGarageBuildRecordsEquivalent(build, rightBuilds[index])
    );
  });
}

export default function GaragePage() {
const router = useRouter();
const [requestedGarageStep, setRequestedGarageStep] = useState<GarageStepId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [signedInUserEmail, setSignedInUserEmail] = useState("");
  const [selectedBikeId, setSelectedBikeId] = useState("");
  const [selectedGarageResumeBuildId, setSelectedGarageResumeBuildId] = useState("");
  const [activeBuildBikeId, setActiveBuildBikeId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showExactFitOnly, setShowExactFitOnly] = useState(false);
  const [onlyCompatible, setOnlyCompatible] = useState(true);
  const [pageError, setPageError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const [supabaseBikes, setSupabaseBikes] = useState<SupabaseBike[]>([]);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [buildNameInput, setBuildNameInput] = useState("");
  const [garageBikeNameInput, setGarageBikeNameInput] = useState("");
  const [garageBikeNameSeedKey, setGarageBikeNameSeedKey] = useState<string | null>(null);
  const [hasEditedGarageBikeName, setHasEditedGarageBikeName] = useState(false);
  const [garageBuildSaveMode, setGarageBuildSaveMode] =
    useState<GarageBuildSaveMode>("save-as-new");
  const [saveStepMessage, setSaveStepMessage] = useState("");
  const [workingGarageBuildSourceByBike, setWorkingGarageBuildSourceByBike] =
    useState<Record<string, { buildId: string; buildName: string } | null>>({});
  const [garageBuildMetadataById, setGarageBuildMetadataById] = useState<
    Record<string, PersistedGarageBuildMetadata>
  >({});
  const [garageBuildCompareReferenceId, setGarageBuildCompareReferenceId] =
    useState<string | null>(null);
  const [selectedExpertBuildId, setSelectedExpertBuildId] = useState("");
  const [expertBuildPurposeFilter, setExpertBuildPurposeFilter] =
    useState<ExpertBuildPurpose | "all">("all");
  const [expertBuildInspiration, setExpertBuildInspiration] =
    useState<ExpertBuildInspirationSelection | null>(null);
  const [activeMergeBuildId, setActiveMergeBuildId] = useState("");
  const [hasHydratedMergePersistence, setHasHydratedMergePersistence] =
    useState(false);
  const [persistedMergeDraftsByKey, setPersistedMergeDraftsByKey] = useState<
    Record<string, ExpertBuildMergeDraftPersisted>
  >({});
  const [mergeDraftsByKey, setMergeDraftsByKey] = useState<
    Record<string, ExpertBuildMergeDraft>
  >({});
  const [mergeLatestEventByBike, setMergeLatestEventByBike] = useState<
    Record<string, ExpertBuildMergeEvent>
  >({});
  const [mergeRebaseSummary, setMergeRebaseSummary] = useState<string | null>(null);
  const [lastPreMergeSnapshotByBike, setLastPreMergeSnapshotByBike] = useState<
    Record<string, ExpertBuildMergeRestorePoint>
  >({});
  const [activeCompareFilter, setActiveCompareFilter] = useState<CompareFilter>("all");
  const [buildSortOption, setBuildSortOption] = useState<"price-low" | "price-high" | "supplier">("supplier");
  const [buildViewMode, setBuildViewMode] = useState<"card" | "list">("list");
  const [isBuildSaveDialogOpen, setIsBuildSaveDialogOpen] = useState(false);
  const [buildSaveDialogBuildName, setBuildSaveDialogBuildName] = useState("");
  const [buildSaveDialogBikeName, setBuildSaveDialogBikeName] = useState("");
  const [buildSaveDialogError, setBuildSaveDialogError] = useState("");
  const [isSavingBuildSaveDialog, setIsSavingBuildSaveDialog] = useState(false);
  const [renameBuildDialogState, setRenameBuildDialogState] = useState<{
    buildId: string;
    value: string;
  } | null>(null);
  const [renameBuildDialogError, setRenameBuildDialogError] = useState("");
  const [isRenamingBuildDialog, setIsRenamingBuildDialog] = useState(false);
  const [garageDeleteDialogState, setGarageDeleteDialogState] = useState<{
    type: "build" | "bike";
    id: string;
    title: string;
    message: string;
    confirmLabel: string;
  } | null>(null);
  const [isDeletingGarageItem, setIsDeletingGarageItem] = useState(false);
  const [savedBuildGuardDialogState, setSavedBuildGuardDialogState] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [isResolvingSavedBuildGuard, setIsResolvingSavedBuildGuard] = useState(false);
  const [activeProductDetail, setActiveProductDetail] = useState<Product | null>(null);
  const [activePurchaseState, setActivePurchaseState] = useState<{
    commerce: ResolvedProductCommerce;
    sourceContext: CommerceSourceContext;
  } | null>(null);
  const [buySelectedBikeId, setBuySelectedBikeId] = useState("");
  const [buySelectedBuildId, setBuySelectedBuildId] = useState("");

  const [bikeBuilds, setBikeBuilds] = useState<Record<string, Product[]>>({});
  const [garageBuildsByBike, setGarageBuildsByBike] = useState<Record<string, GarageBuildRecord[]>>({});
  const [localGarageBikes, setLocalGarageBikes] = useState<SupabaseBike[]>([]);
  const [garageBikeMetaById, setGarageBikeMetaById] = useState<
    Record<
      string,
      {
        garageBikeName?: string | null;
        nickname?: string | null;
        ownershipStatus?: GarageOwnershipStatus | null;
        isArchived?: boolean;
      }
    >
  >({});
  const [dirtyBuilds, setDirtyBuilds] = useState<Record<string, boolean>>({});
  const [savedBuildPhotosByBuildId, setSavedBuildPhotosByBuildId] = useState<
    Record<string, SavedBuildPhoto[]>
  >({});

  const [activeStep, setActiveStep] = useState<GarageStepId>("Bike");
  const [myGarageView, setMyGarageView] = useState<MyGarageView>({ level: "overview" });
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const previousActiveStepRef = useRef<GarageStepId>("Bike");
  const hasInitializedBuildSessionRef = useRef(false);
  const previousSignedInRef = useRef(false);
  const pendingSavedBuildGuardActionRef = useRef<(() => void) | null>(null);
useEffect(() => {
  const stepParam =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("step");
  setRequestedGarageStep(getGarageStepFromParam(stepParam));
}, []);

useLayoutEffect(() => {
  if (typeof window === "undefined") return;

  const handleResize = () => {
    setViewportWidth(window.innerWidth);
  };

  handleResize();
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

  const garageBikeCatalog = useMemo(() => {
    const bikeMap = new Map<string, SupabaseBike>();

    [...supabaseBikes, ...localGarageBikes].forEach((bike) => {
      bikeMap.set(bike.id, normalizeBikeSelectorBike(bike));
    });

    return Array.from(bikeMap.values());
  }, [supabaseBikes, localGarageBikes]);
  const templateBikeCatalog = useMemo(
    () => supabaseBikes.map((bike) => normalizeBikeSelectorBike(bike)),
    [supabaseBikes]
  );

const makeOptions = [
  ...new Set(templateBikeCatalog.map((b) => b.make)),
].sort();

const seriesOptions = selectedMake
  ? [...new Set(
      templateBikeCatalog
        .filter((b) => b.make === selectedMake)
        .map((b) => b.model)
    )].sort()
  : [];

  const modelOptions = selectedMake && selectedSeries
  ? Array.from(
      templateBikeCatalog
        .filter((b) => b.make === selectedMake && b.model === selectedSeries)
        .reduce(
          (map, bike) => {
            const value = bike.variant || "Base";

            if (!map.has(value)) {
              map.set(value, {
                value,
                label: value === "Base" ? "Standard / Base" : value,
              });
            }

            return map;
          },
          new Map<string, { value: string; label: string }>()
        )
        .values()
    ).sort((left, right) => left.label.localeCompare(right.label))
  : [];

useEffect(() => {
  if (!selectedMake || !selectedSeries) return;
  if (modelOptions.length !== 1) return;

  const onlyModel = modelOptions[0].value;

  if (selectedModel !== onlyModel) {
    setSelectedModel(onlyModel);
  }
}, [selectedMake, selectedSeries, modelOptions, selectedModel]); 

useEffect(() => {
  if (!requestedGarageStep) return;
  setActiveStep(requestedGarageStep);
}, [requestedGarageStep]);

useEffect(() => {
  let isMounted = true;

  async function checkSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session check failed:", error);
      }

      if (!isMounted) return;

      setIsSignedIn(!!session);
      setSignedInUserEmail(session?.user?.email ?? "");
      setIsCheckingSession(false);
    } catch (error) {
      console.error("Session check failed:", error);

      if (!isMounted) return;

      setIsSignedIn(false);
      setSignedInUserEmail("");
      setIsCheckingSession(false);
    }
  }

  checkSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!isMounted) return;

    setIsSignedIn(!!session);
    setSignedInUserEmail(session?.user?.email ?? "");
    setIsCheckingSession(false);
  });

  return () => {
    isMounted = false;
    subscription.unsubscribe();
  };
}, []);

const yearOptions = selectedMake && selectedSeries && selectedModel
  ? Array.from(
      new Set(
        templateBikeCatalog
          .filter(
            (b) =>
              b.make === selectedMake &&
              b.model === selectedSeries &&
              (b.variant || "Base") === selectedModel
          )
          .map((b) => b.year)
      )
    ).sort((a, b) => b - a)
  : [];

const selectedBike = useMemo(() => {
  if (!selectedBikeId) return null;

  return garageBikeCatalog.find((bike) => bike.id === selectedBikeId) ?? null;
}, [selectedBikeId, garageBikeCatalog]);

const draftMatchedBike = useMemo(() => {
  if (!selectedMake || !selectedSeries || !selectedModel || !selectedYear) {
    return null;
  }

  return (
    templateBikeCatalog.find(
      (bike) =>
        bike.make === selectedMake &&
        bike.model === selectedSeries &&
        (bike.variant || "Base") === selectedModel &&
        bike.year === Number(selectedYear)
    ) ?? null
  );
}, [selectedMake, selectedSeries, selectedModel, selectedYear, templateBikeCatalog]);

    const currentBike = useMemo(() => {
  if (!activeBuildBikeId) return null;

  return garageBikeCatalog.find((bike) => bike.id === activeBuildBikeId) ?? null;
}, [activeBuildBikeId, garageBikeCatalog]);

const activeBikeId = currentBike?.id ?? null;

const hasBikeSelectionDraft = !!(
  selectedMake ||
  selectedSeries ||
  selectedModel ||
  selectedYear
);
const confirmedBikeMatchesDraft = !!(
  selectedBike &&
  (!selectedMake || selectedBike.make === selectedMake) &&
  (!selectedSeries || selectedBike.model === selectedSeries) &&
  (!selectedModel || (selectedBike.variant || "Base") === selectedModel) &&
  (!selectedYear || String(selectedBike.year) === selectedYear)
);
const isBikeSelectionInProgress =
  hasBikeSelectionDraft && !confirmedBikeMatchesDraft;
const bikeStepPreviewBike =
  isBikeSelectionInProgress ? draftMatchedBike : selectedBike;
const bikeStepSelectedCardId = isBikeSelectionInProgress
  ? draftMatchedBike?.id ?? null
  : selectedBikeId || null;

  useEffect(() => {
  if (!selectedBike) return;

  setSelectedMake(selectedBike.make);
  setSelectedSeries(selectedBike.model);
  setSelectedModel(selectedBike.variant || "Base");
  setSelectedYear(String(selectedBike.year));
}, [selectedBike]);
useEffect(() => {
  if (!selectedMake || !selectedSeries || !selectedModel) return;
  if (yearOptions.length !== 1) return;

  const onlyYear = String(yearOptions[0]);

  if (selectedYear !== onlyYear) {
    setSelectedYear(onlyYear);
  }
}, [selectedMake, selectedSeries, selectedModel, yearOptions, selectedYear]);

useEffect(() => {
  const fetchGarageData = async () => {
    const [{ data: bikesData, error: bikesError }, { data: productsData, error: productsError }] =
      await Promise.all([
        supabase.from("bikes").select("*"),
        supabase
  .from("garage_products")
  .select("*")
  .order("featured_order", { ascending: true }),
      ]);

    let nextBikes = demoGarageBikes;
    nextBikes = nextBikes.map((bike) => normalizeBikeSelectorBike(bike));

    if (bikesError) {
      console.error("Error fetching bikes:", bikesError);
    } else if (bikesData) {
      nextBikes = mergeGarageBikeSources(
        demoGarageBikes,
        bikesData as SupabaseBike[]
      );
    }

    setSupabaseBikes(nextBikes);

    let nextProducts = demoGarageProducts;

    if (productsError) {
      console.error("Error fetching garage products:", productsError);
    } else if (productsData) {
      nextProducts = mergeGarageProducts(
        demoGarageProducts,
        (productsData as GarageProductRow[]).map(mapGarageProductRow)
      );
    }

    setProducts(nextProducts);
  };

  fetchGarageData();
}, []);

const selectedProducts = useMemo(
  () => bikeBuilds[activeBuildBikeId] ?? [],
  [activeBuildBikeId, bikeBuilds]
);
const selectedProductCommerceEntries = useMemo(
  () =>
    selectedProducts.map((product) => ({
      product,
      commerce: resolveProductCommerce({ product }),
    })),
  [selectedProducts]
);
const selectedProductsCommerceSummary = useMemo(() => {
  return {
    readyCount: selectedProductCommerceEntries.filter((entry) =>
      entry.commerce.hasPurchaseOptions
    ).length,
    missingCount: selectedProductCommerceEntries.filter(
      (entry) => !entry.commerce.hasPurchaseOptions
    ).length,
  };
}, [selectedProductCommerceEntries]);
const isBuildDirty = dirtyBuilds[activeBuildBikeId] ?? false;
const activeWorkingGarageBuildSource = activeBikeId
  ? workingGarageBuildSourceByBike[activeBikeId] ?? null
  : null;

const myGarageBikes = useMemo<GarageBikeRecord[]>(() => {
  const bikeMap = new Map<string, GarageBikeRecord>();
  const garageBikeIds = new Set<string>();

  Object.keys(garageBuildsByBike).forEach((bikeId) => {
    garageBikeIds.add(bikeId);
  });

  Object.keys(garageBikeMetaById).forEach((bikeId) => {
    garageBikeIds.add(bikeId);
  });

  localGarageBikes.forEach((bike) => {
    garageBikeIds.add(bike.id);
  });

  garageBikeIds.forEach((bikeId) => {
    const matchedBike = garageBikeCatalog.find((bike) => bike.id === bikeId);
    const bikeMeta = garageBikeMetaById[bikeId];

    if (!matchedBike) return;
    if (bikeMeta?.isArchived) return;

    const builds = (garageBuildsByBike[bikeId] ?? []).map((build) =>
      applyGarageBuildMetadata(
        {
          ...build,
          photos: savedBuildPhotosByBuildId[build.id] ?? build.photos ?? [],
        },
        garageBuildMetadataById[build.id] ?? null
      )
    );

    bikeMap.set(
      bikeId,
      createGarageBikeRecord({
        ...matchedBike,
        heroImageUrl: matchedBike.heroImageUrl ?? matchedBike.image ?? null,
        garageBikeName:
          bikeMeta?.garageBikeName ??
          matchedBike.garageBikeName ??
          matchedBike.nickname ??
          null,
        nickname:
          bikeMeta?.nickname ??
          bikeMeta?.garageBikeName ??
          matchedBike.nickname ??
          matchedBike.garageBikeName ??
          (matchedBike.variant ? `${matchedBike.model} ${matchedBike.variant}` : null),
        ownershipStatus: bikeMeta?.ownershipStatus ?? "Owned",
        isArchived: bikeMeta?.isArchived ?? false,
        builds: [...builds],
      })
    );
  });

  return Array.from(bikeMap.values()).map((bike) => {
    const sortedBuilds = [...bike.builds].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const activeBuilds = sortedBuilds.filter((build) => build.status !== "Archived");
    const hasPrimary = activeBuilds.some((build) => build.isPrimary);

    return {
      ...bike,
      builds: hasPrimary
        ? sortedBuilds
        : sortedBuilds.map((build, index) => ({
            ...build,
            isPrimary: build.status !== "Archived" && activeBuilds.length > 0 && build.id === activeBuilds[0].id && index >= 0,
          })),
    };
  });
}, [garageBuildMetadataById, garageBuildsByBike, garageBikeCatalog, localGarageBikes, garageBikeMetaById, savedBuildPhotosByBuildId]);

const allGarageBuildsById = useMemo(() => {
  return myGarageBikes.flatMap((bike) => bike.builds).reduce<Record<string, GarageBuildRecord>>(
    (acc, build) => {
      acc[build.id] = build;
      return acc;
    },
    {}
  );
}, [myGarageBikes]);

const activeWorkingGarageSourceBuild =
  activeWorkingGarageBuildSource?.buildId
    ? allGarageBuildsById[activeWorkingGarageBuildSource.buildId] ?? null
    : null;
const isEditingSavedGarageBuild = !!activeWorkingGarageSourceBuild;
const hasUnsavedGarageBuildChanges = !!(
  activeWorkingGarageSourceBuild &&
  ((buildNameInput.trim() || activeWorkingGarageSourceBuild.name) !==
    activeWorkingGarageSourceBuild.name ||
    selectedProducts.length !== activeWorkingGarageSourceBuild.buildItems.length ||
    activeWorkingGarageSourceBuild.buildItems.some(
      (item, index) => selectedProducts[index]?.id !== item.product.id
    ))
);

const selectedGarageBike =
  myGarageView.level === "bike" || myGarageView.level === "build"
    ? myGarageBikes.find((bike) => bike.id === myGarageView.bikeId) ?? null
    : null;

const selectedGarageBuild =
  myGarageView.level === "build"
    ? getGarageBikeBuild(myGarageBikes, myGarageView.bikeId, myGarageView.buildId)
    : null;
const activeWorkingBikeContext = useMemo<ActiveWorkingBikeContext>(
  () =>
    createActiveWorkingBikeContext({
      selectedBikeId: activeBuildBikeId,
      currentBike,
      garageBikes: myGarageBikes,
      templateBikes: templateBikeCatalog,
    }),
  [activeBuildBikeId, currentBike, myGarageBikes, templateBikeCatalog]
);
const garageResumeEntries = useMemo<GarageResumeEntry[]>(
  () => buildGarageResumeEntries(myGarageBikes),
  [myGarageBikes]
);
const bikeStepPreviewImageBike = useMemo(() => {
  if (isBikeSelectionInProgress) {
    return bikeStepPreviewBike;
  }

  if (selectedBikeId) {
    return myGarageBikes.find((bike) => bike.id === selectedBikeId) ?? bikeStepPreviewBike;
  }

  return bikeStepPreviewBike;
}, [bikeStepPreviewBike, isBikeSelectionInProgress, myGarageBikes, selectedBikeId]);
const bikeStepPreviewBuild = useMemo(() => {
  if (isBikeSelectionInProgress || !selectedGarageResumeBuildId) {
    return null;
  }

  return allGarageBuildsById[selectedGarageResumeBuildId] ?? null;
}, [allGarageBuildsById, isBikeSelectionInProgress, selectedGarageResumeBuildId]);
const buySelectedBike = useMemo(
  () => garageBikeCatalog.find((bike) => bike.id === buySelectedBikeId) ?? null,
  [buySelectedBikeId, garageBikeCatalog]
);
const buyPreferredBikeId = useMemo(() => {
  const selectedGarageBikeId = garageBikeCatalog.some((bike) => bike.id === selectedBikeId)
    ? selectedBikeId
    : "";
  const activeWorkingBuildBikeId = garageBikeCatalog.some((bike) => bike.id === activeBuildBikeId)
    ? activeBuildBikeId
    : "";
  const savedBuildLinkedBikeId =
    activeWorkingGarageSourceBuild?.bikeId &&
    garageBikeCatalog.some((bike) => bike.id === activeWorkingGarageSourceBuild.bikeId)
      ? activeWorkingGarageSourceBuild.bikeId
      : "";

  return (
    selectedGarageBikeId ||
    activeWorkingBuildBikeId ||
    savedBuildLinkedBikeId ||
    ""
  );
}, [activeBuildBikeId, activeWorkingGarageSourceBuild?.bikeId, garageBikeCatalog, selectedBikeId]);
const buySelectedBikeTemplateId =
  buySelectedBike?.sourceBikeId ?? buySelectedBike?.id ?? null;
const buySelectedGarageBike = useMemo(
  () => myGarageBikes.find((bike) => bike.id === buySelectedBikeId) ?? null,
  [buySelectedBikeId, myGarageBikes]
);
const buyRelatedGarageBikes = useMemo(() => {
  if (!buySelectedBikeTemplateId) {
    return [];
  }

  return myGarageBikes.filter(
    (bike) => (bike.sourceBikeId ?? bike.id) === buySelectedBikeTemplateId
  );
}, [buySelectedBikeTemplateId, myGarageBikes]);
const buySelectedBikeLabel = buySelectedBike
  ? getGarageBikeSelectorLabel(buySelectedBike)
  : "";
const buySelectedBikeBuilds = useMemo(
  () =>
    buyRelatedGarageBikes
      .flatMap((bike) => bike.builds)
      .filter((build) => build.status !== "Archived")
      .sort(compareGarageBuildSelectionPriority),
  [buyRelatedGarageBikes]
);
const buyPreferredActiveSavedBuildId =
  activeWorkingGarageSourceBuild?.bikeId &&
  buySelectedBikeTemplateId &&
  ((myGarageBikes.find((bike) => bike.id === activeWorkingGarageSourceBuild.bikeId)?.sourceBikeId ??
    activeWorkingGarageSourceBuild.bikeId) === buySelectedBikeTemplateId)
    ? activeWorkingGarageSourceBuild.id
    : null;
const buySelectedBuild = useMemo(
  () =>
    buySelectedBikeBuilds.find((build) => build.id === buySelectedBuildId) ?? null,
  [buySelectedBikeBuilds, buySelectedBuildId]
);
const buySelectedBuildBike = useMemo(
  () =>
    buySelectedBuild
      ? myGarageBikes.find((bike) => bike.id === buySelectedBuild.bikeId) ?? null
      : null,
  [buySelectedBuild, myGarageBikes]
);
const buyDisplayBike = buySelectedBuildBike ?? buySelectedGarageBike ?? buySelectedBike;
const buySelectedBikeBuildProducts = useMemo(
  () => (buySelectedBikeId ? bikeBuilds[buySelectedBikeId] ?? [] : []),
  [bikeBuilds, buySelectedBikeId]
);
const buySelectedBikeBuildProductIds = useMemo(
  () => new Set(buySelectedBikeBuildProducts.map((product) => product.id)),
  [buySelectedBikeBuildProducts]
);
const buySelectedBuildProductEntries = useMemo(() => {
  if (!buySelectedBuild) {
    return [];
  }

  const seenProductIds = new Set<number>();

  return buySelectedBuild.buildItems.reduce<
    Array<{
      product: Product;
      commerce: ResolvedProductCommerce;
      compatibilityLabel: CompatibilityLabel;
      categoryLabel: string;
    }>
  >((entries, item) => {
    const product = item.product;

    if (!product || seenProductIds.has(product.id)) {
      return entries;
    }

    seenProductIds.add(product.id);
    entries.push({
      product,
      commerce: resolveProductCommerce({ product }),
      compatibilityLabel: buySelectedBikeTemplateId
        ? getCompatibilityLabel(product, buySelectedBikeTemplateId)
        : product.fitmentConfidence ?? "Not confirmed",
      categoryLabel: getCategoryLabel(product.categoryId),
    });

    return entries;
  }, []);
}, [buySelectedBuild, buySelectedBikeTemplateId, getCategoryLabel, getCompatibilityLabel]);
const buySelectedBikeProductEntries = useMemo(() => {
  if (!buySelectedBikeTemplateId) {
    return [];
  }

  return products
    .filter((product) => isProductCompatible(product, buySelectedBikeTemplateId))
    .sort((left, right) => {
      const leftExactFit = left.compatibility.bikeIds.includes(buySelectedBikeTemplateId);
      const rightExactFit = right.compatibility.bikeIds.includes(buySelectedBikeTemplateId);

      if (leftExactFit && !rightExactFit) return -1;
      if (!leftExactFit && rightExactFit) return 1;

      if (left.featuredOrder !== right.featuredOrder) {
        return left.featuredOrder - right.featuredOrder;
      }

      return left.name.localeCompare(right.name);
    })
    .map((product) => ({
      product,
      commerce: resolveProductCommerce({ product }),
      compatibilityLabel: getCompatibilityLabel(product, buySelectedBikeTemplateId),
      categoryLabel: getCategoryLabel(product.categoryId),
    }));
}, [buySelectedBikeTemplateId, products]);
const buySelectedBikeCommerceSummary = useMemo(() => {
  return {
    exactFitCount: buySelectedBikeTemplateId
      ? buySelectedBikeProductEntries.filter(
          (entry) => entry.compatibilityLabel === "Exact fit"
        ).length
      : 0,
    readyCount: buySelectedBikeProductEntries.filter((entry) =>
      entry.commerce.hasPurchaseOptions
    ).length,
    missingCount: buySelectedBikeProductEntries.filter(
      (entry) => !entry.commerce.hasPurchaseOptions
    ).length,
    savedCount: buySelectedBuild?.buildItems.length ?? buySelectedBikeBuildProducts.length,
  };
}, [
  buySelectedBikeBuildProducts.length,
  buySelectedBikeProductEntries,
  buySelectedBikeTemplateId,
  buySelectedBuild,
]);
useEffect(() => {
  if (!selectedMake || !selectedSeries || !selectedModel || !selectedYear) return;
  if (selectedGarageResumeBuildId) return;
  if (selectedBike && myGarageBikes.some((bike) => bike.id === selectedBike.id)) return;
  if (activeWorkingBikeContext.source === "garage") return;

  const matchedTemplateBike = templateBikeCatalog.find(
    (bike) =>
      bike.make === selectedMake &&
      bike.model === selectedSeries &&
      (bike.variant || "Base") === selectedModel &&
      bike.year === Number(selectedYear)
  );

  if (matchedTemplateBike && matchedTemplateBike.id !== selectedBikeId) {
    setSelectedBikeId(matchedTemplateBike.id);
    setSelectedGarageResumeBuildId("");
  }
}, [
  activeWorkingBikeContext.source,
  selectedMake,
  selectedSeries,
  selectedModel,
  selectedYear,
  selectedGarageResumeBuildId,
  selectedBike,
  selectedBikeId,
  myGarageBikes,
  templateBikeCatalog,
]);
const activeCompatibilityBikeId =
  activeWorkingBikeContext.templateBikeId ?? activeBikeId;
const currentGarageBikeLabel = activeWorkingBikeContext.garageBike
  ? getGarageBikeSelectorLabel(activeWorkingBikeContext.garageBike)
  : currentBike
  ? getBikeOptionLabel(currentBike)
  : "Current build";
const currentGarageBikeName =
  currentBike
    ? activeWorkingBikeContext.garageBike?.garageBikeName?.trim() ||
      activeWorkingBikeContext.garageBike?.nickname?.trim() ||
      getBikeOptionLabel(currentBike)
    : "";
const requiresBikeNamingOnSave =
  !!currentBike && !activeWorkingBikeContext.isSavedGarageBike;
const canOpenBuildSaveDialog = !!currentBike && selectedProducts.length > 0;
const hasUnsavedBuildSaveDialogBikeNameChanges = !!(
  activeWorkingBikeContext.isSavedGarageBike &&
  currentBike &&
  buildSaveDialogBikeName.trim().length > 0 &&
  buildSaveDialogBikeName.trim() !== currentGarageBikeName
);
const hasUnsavedBuildSaveDialogNameChanges = !!(
  isEditingSavedGarageBuild &&
  activeWorkingGarageSourceBuild &&
  buildSaveDialogBuildName.trim().length > 0 &&
  buildSaveDialogBuildName.trim() !== activeWorkingGarageSourceBuild.name
);
const canConfirmBuildSave =
  !!currentBike &&
  selectedProducts.length > 0 &&
  buildSaveDialogBikeName.trim().length > 0 &&
  buildSaveDialogBuildName.trim().length > 0 &&
  !isSavingBuildSaveDialog &&
  (!isEditingSavedGarageBuild ||
    garageBuildSaveMode === "duplicate-build" ||
    garageBuildSaveMode === "save-as-version" ||
    hasUnsavedGarageBuildChanges ||
    hasUnsavedBuildSaveDialogBikeNameChanges ||
    hasUnsavedBuildSaveDialogNameChanges);

useEffect(() => {
  if (myGarageView.level === "overview") return;

  if (myGarageView.level === "bike") {
    setMyGarageView({ level: "overview" });
    return;
  }

  if (myGarageView.level === "build" && (!selectedGarageBike || !selectedGarageBuild)) {
    setSaveStepMessage("That saved build is no longer available.");
    setMyGarageView({ level: "overview" });
  }
}, [myGarageView, selectedGarageBike, selectedGarageBuild]);

useEffect(() => {
  if (!isCheckingSession && !hasInitializedBuildSessionRef.current) {
    setActiveBuildBikeId("");
    setBikeBuilds({});
    setDirtyBuilds({});
    setSelectedGarageResumeBuildId("");
    setWorkingGarageBuildSourceByBike({});
    setGarageBuildSaveMode("save-as-new");
    hasInitializedBuildSessionRef.current = true;
    previousSignedInRef.current = isSignedIn;
    return;
  }

  if (!isCheckingSession && isSignedIn && !previousSignedInRef.current) {
    setActiveBuildBikeId("");
    setBikeBuilds({});
    setDirtyBuilds({});
    setSelectedGarageResumeBuildId("");
    setWorkingGarageBuildSourceByBike({});
    setGarageBuildSaveMode("save-as-new");
  }

  previousSignedInRef.current = isSignedIn;
}, [isCheckingSession, isSignedIn]);

useEffect(() => {
  if (previousActiveStepRef.current !== activeStep) {
    scrollGarageViewportToTop();
  }

  if (activeStep === "Expert" && previousActiveStepRef.current !== "Expert") {
    setSelectedExpertBuildId("");
  }

  if (activeStep === "Save" && previousActiveStepRef.current !== "Save") {
    setMyGarageView({ level: "overview" });
  }

  previousActiveStepRef.current = activeStep;
}, [activeStep]);

useEffect(() => {
  const selectedBikeStillExists = garageBikeCatalog.some((bike) => bike.id === buySelectedBikeId);
  const preferredBikeStillExists = buyPreferredBikeId
    ? garageBikeCatalog.some((bike) => bike.id === buyPreferredBikeId)
    : false;

  if (!selectedBikeStillExists) {
    setBuySelectedBikeId(preferredBikeStillExists ? buyPreferredBikeId : "");
    return;
  }

  if (activeStep === "Buy" && preferredBikeStillExists && buySelectedBikeId !== buyPreferredBikeId) {
    setBuySelectedBikeId(buyPreferredBikeId);
    return;
  }

  if (!buySelectedBikeId && preferredBikeStillExists) {
    setBuySelectedBikeId(buyPreferredBikeId);
  }
}, [activeStep, buyPreferredBikeId, buySelectedBikeId, garageBikeCatalog]);

useEffect(() => {
  if (!buySelectedBikeId || buySelectedBikeBuilds.length === 0) {
    if (buySelectedBuildId) {
      setBuySelectedBuildId("");
    }
    return;
  }

  const currentBuildStillExists = buySelectedBikeBuilds.some(
    (build) => build.id === buySelectedBuildId
  );

  if (currentBuildStillExists) {
    return;
  }

  const preferredBuild =
    (buyPreferredActiveSavedBuildId
      ? buySelectedBikeBuilds.find((build) => build.id === buyPreferredActiveSavedBuildId)
      : null) ??
    buySelectedBikeBuilds[0] ??
    null;

  setBuySelectedBuildId(preferredBuild?.id ?? "");
}, [
  buyPreferredActiveSavedBuildId,
  buySelectedBikeBuilds,
  buySelectedBikeId,
  buySelectedBuildId,
]);

useEffect(() => {
  if (!currentBike) {
    setBuildNameInput("");
    setGarageBikeNameInput("");
    setGarageBikeNameSeedKey(null);
    setHasEditedGarageBikeName(false);
    setGarageBuildCompareReferenceId(null);
    return;
  }

  const bikeSeedKey = activeWorkingBikeContext.garageBike?.id ?? currentBike.id;

  if (activeWorkingBikeContext.garageBike) {
    const nextBikeName =
      activeWorkingBikeContext.garageBike.garageBikeName?.trim() ||
      activeWorkingBikeContext.garageBike.nickname?.trim() ||
      getBikeOptionLabel(currentBike);

    if (garageBikeNameSeedKey !== bikeSeedKey) {
      setGarageBikeNameInput(nextBikeName);
      setGarageBikeNameSeedKey(bikeSeedKey);
      setHasEditedGarageBikeName(false);
    }
    return;
  }

  const nextBikeName = getBikeOptionLabel(currentBike);
  if (garageBikeNameSeedKey !== bikeSeedKey) {
    setGarageBikeNameInput(nextBikeName);
    setGarageBikeNameSeedKey(bikeSeedKey);
    setHasEditedGarageBikeName(false);
  }
}, [activeWorkingBikeContext.garageBike, currentBike, garageBikeNameSeedKey]);

useEffect(() => {
  let isMounted = true;

  async function hydrateGaragePersistence() {
    if (isCheckingSession || !isSignedIn) return;

    let snapshot: Awaited<ReturnType<typeof loadGarageFromSupabase>> = null;

    try {
      snapshot = await loadGarageFromSupabase(supabaseBikes);
    } catch (error) {
      const safeError = getSafePersistenceErrorDetails(error);

      if (isBenignGaragePersistenceError(error, safeError)) {
        return;
      }

      console.error("Failed to load garage persistence", {
        step: "loadGarageFromSupabase",
        message: "Unexpected failure while reading persisted garage data.",
        error: safeError,
        fallbackDefaultsApplied: true,
      });
      return;
    }

    if (!isMounted || !snapshot) return;

    setGarageBuildsByBike(snapshot.buildsByBike);
    setGarageBikeMetaById(snapshot.garageBikeMetaById);
    setGarageBuildMetadataById(snapshot.buildMetadataById);
    setSavedBuildPhotosByBuildId(snapshot.buildPhotosByBuildId);
    setLocalGarageBikes(snapshot.bikes);
  }

  hydrateGaragePersistence();

  return () => {
    isMounted = false;
  };
}, [isCheckingSession, isSignedIn, supabaseBikes]);

const persistGarageBikeRecord = async (
  bike: SupabaseBike,
  nicknameOverride?: string | null
) => {
  if (!isSignedIn) return;
  const bikeMeta = garageBikeMetaById[bike.id];
  const resolvedGarageBikeName =
    nicknameOverride ??
    bikeMeta?.garageBikeName ??
    bike.garageBikeName ??
    bikeMeta?.nickname ??
    bike.nickname ??
    (bike.variant ? `${bike.model} ${bike.variant}` : null);

  await upsertGarageBike({
    id: bike.id,
    sourceBikeId:
      bike.sourceBikeId ??
      (supabaseBikes.some((item) => item.id === bike.id) ? bike.id : null),
    make: bike.make,
    model: bike.model,
    year: bike.year,
    variant: bike.variant ?? null,
    garageBikeName: resolvedGarageBikeName,
    nickname: resolvedGarageBikeName,
    ownershipStatus: bikeMeta?.ownershipStatus ?? "Owned",
    isArchived: bikeMeta?.isArchived ?? false,
    heroImageUrl: bike.heroImageUrl ?? bike.image ?? null,
    coverPhotoId: bike.coverPhotoId ?? null,
  });
};

const persistGarageBikeSnapshot = async (bikeId: string, nicknameOverride?: string | null) => {
  const bike = garageBikeCatalog.find((item) => item.id === bikeId);

  if (!bike || !isSignedIn) return;

  await persistGarageBikeRecord(bike, nicknameOverride);
};

const applyGarageBikeNickname = (bikeId: string, nickname: string) => {
  setGarageBikeMetaById((prev) => ({
    ...prev,
    [bikeId]: {
      ...prev[bikeId],
      garageBikeName: nickname,
      nickname,
    },
  }));
};

const persistGarageBuildSnapshot = async (
  build: GarageBuildRecord,
  options?: {
    bikeOverride?: SupabaseBike | null;
    nicknameOverride?: string | null;
    skipBikePersist?: boolean;
  }
) => {
  if (!isSignedIn) return;

  if (!options?.skipBikePersist) {
    try {
      if (options?.bikeOverride) {
        await persistGarageBikeRecord(options.bikeOverride, options.nicknameOverride);
      } else {
        await persistGarageBikeSnapshot(build.bikeId, options?.nicknameOverride);
      }
    } catch (error) {
      throw {
        step: "persistGarageBikeSnapshot",
        error,
      };
    }
  }

  try {
    await upsertGarageBuild({
      id: build.id,
      bikeId: build.bikeId,
      name: build.name,
      status: build.status,
      buildType: build.buildType,
      isPrimary: build.isPrimary,
      notes: build.notes ?? null,
      updatedAt: build.updatedAt,
      metadata: extractGarageBuildMetadata(build),
    });
  } catch (error) {
    throw {
      step: "upsertGarageBuild",
      error,
    };
  }

  try {
    await replaceGarageBuildItems(
      build.id,
      build.buildItems.map((item) => ({
        product: item.product,
        sortOrder: item.sortOrder,
      }))
    );
  } catch (error) {
    throw {
      step: "replaceGarageBuildItems",
      error,
    };
  }
};

const getUniqueGarageBuildName = (
  bikeId: string,
  proposedName: string,
  options?: { excludeBuildId?: string | null }
) => {
  const trimmedName = proposedName.trim();
  const fallbackBike =
    garageBikeCatalog.find((bike) => bike.id === bikeId) ?? currentBike ?? null;
  const baseName =
    trimmedName ||
    (fallbackBike
      ? `${fallbackBike.make} ${fallbackBike.model} Setup`
      : "Saved build");
  const existingNames = new Set(
    (garageBuildsByBike[bikeId] ?? [])
      .filter((build) => build.id !== options?.excludeBuildId)
      .map((build) => build.name.trim().toLowerCase())
  );

  if (!existingNames.has(baseName.toLowerCase())) {
    return baseName;
  }

  let suffix = 2;
  let nextName = `${baseName} ${suffix}`;

  while (existingNames.has(nextName.toLowerCase())) {
    suffix += 1;
    nextName = `${baseName} ${suffix}`;
  }

  return nextName;
};

const createGarageBuildRecordFromWorkingState = (input: {
  bikeId: string;
  buildId: string;
  name: string;
  buildType: GarageBuildRecord["buildType"];
  status: GarageBuildRecord["status"];
  isPrimary: boolean;
  notes?: string | null;
  updatedAt: string;
}) => {
  const buildItems = createGarageBuildItems(
    input.buildId,
    selectedProducts,
    input.updatedAt
  );

  return createGarageBuildRecord({
    id: input.buildId,
    bikeId: input.bikeId,
    name: input.name,
    status: input.status,
    buildType: input.buildType,
    isPrimary: input.isPrimary,
    notes: input.notes ?? null,
    createdAt: input.updatedAt,
    updatedAt: input.updatedAt,
    buildItems,
    productGroups: groupGarageBuildProductsByCategory(selectedProducts, categories),
  });
};

const getBuildsForBike = (bikeId: string) => garageBuildsByBike[bikeId] ?? [];

const createGarageBuildRecordWithMetadata = (input: {
  bike: SupabaseBike | null;
  bikeId: string;
  buildId: string;
  name: string;
  buildType: GarageBuildRecord["buildType"];
  notes?: string | null;
  saveMode: GarageBuildSaveMode;
  sourceBuild: GarageBuildRecord | null;
  sourceExpertBuild?: { id: string; title: string } | null;
  status: GarageBuildRecord["status"];
  isPrimary: boolean;
  updatedAt: string;
}) => {
  const mergeSummary = mapMergeEventToGarageBuildMergeSummary(
    input.sourceExpertBuild ? null : currentBikeMergeEvent
  );
  const metadata = createGarageBuildMetadata({
    buildId: input.buildId,
    buildName: input.name,
    bike: input.bike,
    existingBuilds: getBuildsForBike(input.bikeId),
    mergeSummary,
    now: input.updatedAt,
    saveMode: input.saveMode,
    sourceBuild: input.sourceBuild,
    sourceExpertBuild: input.sourceExpertBuild ?? null,
  });

  return applyGarageBuildMetadata(
    createGarageBuildRecordFromWorkingState({
      bikeId: input.bikeId,
      buildId: input.buildId,
      name: input.name,
      buildType: input.buildType,
      status: input.status,
      isPrimary: input.isPrimary,
      notes: input.notes ?? null,
      updatedAt: input.updatedAt,
    }),
    metadata
  );
};

const upsertGarageBuildMetadataRecord = (build: GarageBuildRecord) => {
  const metadata = extractGarageBuildMetadata(build);

  setGarageBuildMetadataById((prev) => ({
    ...prev,
    [build.id]: {
      createdAt: metadata.createdAt ?? build.updatedAt,
      provenance: metadata.provenance ?? null,
      version: metadata.version ?? null,
      versionSummary: metadata.versionSummary ?? null,
      lineage: metadata.lineage ?? null,
      history: metadata.history ?? [],
    },
  }));
};

const upsertLocalGarageBikeRecord = (
  bikeId: string,
  updater: (bike: SupabaseBike) => SupabaseBike
) => {
  const baseBike = garageBikeCatalog.find((bike) => bike.id === bikeId);

  if (!baseBike) return;

  setLocalGarageBikes((prev) => {
    const existingBike = prev.find((bike) => bike.id === bikeId);
    const nextBike = updater(existingBike ?? baseBike);

    return existingBike
      ? prev.map((bike) => (bike.id === bikeId ? nextBike : bike))
      : [nextBike, ...prev];
  });
};

const recommendedProducts = useMemo(() => {
  if (!activeCompatibilityBikeId) return [];

  const term = searchTerm.trim().toLowerCase();

  return products
    .filter((product) => {
      const compatible = isProductCompatible(product, activeCompatibilityBikeId);
      const isExactFit =
        !!activeCompatibilityBikeId &&
        product.compatibility.bikeIds.includes(activeCompatibilityBikeId);
      const isUniversal = product.compatibility.universal === true;

      if (!compatible) return false;

      if (showExactFitOnly && currentBike && !isExactFit) return false;

      if (!showExactFitOnly && currentBike) {
        if (!isExactFit && !isUniversal) return false;
      }

      
      if (selectedCategory !== "all" && product.categoryId !== selectedCategory) {
        return false;
      }

      if (!term) return true;

      const matchesText =
  product.name.toLowerCase().includes(term) ||
  product.brand.toLowerCase().includes(term) ||
  product.description.toLowerCase().includes(term);

const matchesCategory =
  selectedCategory === "all" ||
  product.categoryId === selectedCategory;

return matchesText && matchesCategory;
    })
    .sort((a, b) => {
      const aExactFit =
        !!activeCompatibilityBikeId &&
        a.compatibility.bikeIds.includes(activeCompatibilityBikeId);
      const bExactFit =
        !!activeCompatibilityBikeId &&
        b.compatibility.bikeIds.includes(activeCompatibilityBikeId);

      if (aExactFit && !bExactFit) return -1;
      if (!aExactFit && bExactFit) return 1;

      if (a.featuredOrder !== b.featuredOrder) {
        return a.featuredOrder - b.featuredOrder;
      }

      return a.name.localeCompare(b.name);
    });
}, [
  products,
  activeCompatibilityBikeId,
  currentBike,
  searchTerm,
  selectedProducts,
  selectedCategory,
  showExactFitOnly,
]);

const buildProducts = useMemo(() => {
  return recommendedProducts
    .map((product, index) => ({ product, index }))
    .sort((a, b) => {
      const aPrice = Number.isFinite(a.product.price) ? a.product.price : null;
      const bPrice = Number.isFinite(b.product.price) ? b.product.price : null;
      const aSupplier = (a.product.brand || "").trim().toLowerCase();
      const bSupplier = (b.product.brand || "").trim().toLowerCase();

      if (buildSortOption === "price-low") {
        if (aPrice === null && bPrice === null) return a.index - b.index;
        if (aPrice === null) return 1;
        if (bPrice === null) return -1;
        if (aPrice !== bPrice) return aPrice - bPrice;
      }

      if (buildSortOption === "price-high") {
        if (aPrice === null && bPrice === null) return a.index - b.index;
        if (aPrice === null) return 1;
        if (bPrice === null) return -1;
        if (aPrice !== bPrice) return bPrice - aPrice;
      }

      if (buildSortOption === "supplier") {
        if (aSupplier !== bSupplier) return aSupplier.localeCompare(bSupplier);
        const nameCompare = a.product.name.localeCompare(b.product.name);
        if (nameCompare !== 0) return nameCompare;
      }

      return a.index - b.index;
    })
    .map(({ product }) => product);
}, [buildSortOption, recommendedProducts]);

const matchedExpertBuilds = useMemo<ResolvedExpertBuild[]>(() => {
  return getExpertBuildsForBike(currentBike, products, selectedProducts);
}, [currentBike, products, selectedProducts]);

const expertBuildOptions = useMemo<ResolvedExpertBuild[]>(() => {
  if (expertBuildPurposeFilter === "all") {
    return matchedExpertBuilds;
  }

  return matchedExpertBuilds.filter(
    (build) => build.dna.purpose === expertBuildPurposeFilter
  );
}, [expertBuildPurposeFilter, matchedExpertBuilds]);

useEffect(() => {
  if (expertBuildOptions.length === 0) {
    if (selectedExpertBuildId) {
      setSelectedExpertBuildId("");
    }
    return;
  }

  if (!expertBuildOptions.some((option) => option.id === selectedExpertBuildId)) {
    setSelectedExpertBuildId("");
  }
}, [expertBuildOptions, selectedExpertBuildId]);

const selectedExpertBuild = useMemo<ResolvedExpertBuild | null>(() => {
  return expertBuildOptions.find((option) => option.id === selectedExpertBuildId) ?? null;
}, [expertBuildOptions, selectedExpertBuildId]);

const activeMergeDraftKey =
  currentBike && activeMergeBuildId ? `${currentBike.id}:${activeMergeBuildId}` : "";

const activeMergeDraft = useMemo(() => {
  if (!activeMergeDraftKey) return null;
  return mergeDraftsByKey[activeMergeDraftKey] ?? null;
}, [activeMergeDraftKey, mergeDraftsByKey]);

const selectedMergeDraftKey =
  currentBike && selectedExpertBuildId ? `${currentBike.id}:${selectedExpertBuildId}` : "";

const selectedPersistedMergeDraft = useMemo(() => {
  if (!selectedMergeDraftKey) {
    return null;
  }

  return persistedMergeDraftsByKey[selectedMergeDraftKey] ?? null;
}, [persistedMergeDraftsByKey, selectedMergeDraftKey]);

const selectedBuildSnapshotFingerprint = useMemo(
  () => fingerprintExpertBuildMergeSnapshot(selectedProducts),
  [selectedProducts]
);

const activeMergePreview = useMemo(() => {
  if (!activeMergeDraft || !selectedExpertBuild || selectedExpertBuild.id !== activeMergeBuildId) {
    return null;
  }

  return createExpertBuildMergePreview(activeMergeDraft, selectedExpertBuild);
}, [activeMergeBuildId, activeMergeDraft, selectedExpertBuild]);

const activeMergeValidation = useMemo(() => {
  if (!activeMergeDraft || !activeMergePreview) {
    return { canApply: false, hasChanges: false, unresolvedCount: 0 };
  }

  return validateExpertBuildMergeDraft(activeMergeDraft, activeMergePreview);
}, [activeMergeDraft, activeMergePreview]);

const activeMergeIsStale = useMemo(() => {
  if (!activeMergeDraft) {
    return false;
  }

  return isExpertBuildMergeDraftStale(activeMergeDraft, selectedProducts);
}, [activeMergeDraft, selectedProducts]);

const selectedPersistedMergeDraftSummary = useMemo(
  () => getPersistedMergeDraftDecisionSummary(selectedPersistedMergeDraft),
  [selectedPersistedMergeDraft]
);

const selectedPersistedDraftIsStale = useMemo(
  () =>
    !!selectedPersistedMergeDraft &&
    selectedPersistedMergeDraft.snapshotFingerprint !== selectedBuildSnapshotFingerprint,
  [selectedBuildSnapshotFingerprint, selectedPersistedMergeDraft]
);

const currentBikeMergeEvent = useMemo(
  () => (currentBike ? mergeLatestEventByBike[currentBike.id] ?? null : null),
  [currentBike, mergeLatestEventByBike]
);

const activeGarageBuildCompareReference = garageBuildCompareReferenceId
  ? allGarageBuildsById[garageBuildCompareReferenceId] ?? null
  : null;

const savedBuildCompareSummary = useMemo(
  () =>
    activeWorkingGarageSourceBuild && activeGarageBuildCompareReference
      ? getGarageBuildComparisonSummary(
          activeWorkingGarageSourceBuild,
          activeGarageBuildCompareReference
        )
      : null,
  [activeGarageBuildCompareReference, activeWorkingGarageSourceBuild]
);

const activeProductCommerce = useMemo(
  () =>
    activeProductDetail
      ? resolveProductCommerce({ product: activeProductDetail })
      : null,
  [activeProductDetail]
);

useEffect(() => {
  setPersistedMergeDraftsByKey(readPersistedExpertBuildMergeDrafts());
  setMergeLatestEventByBike(readPersistedExpertBuildMergeEvents());
  setHasHydratedMergePersistence(true);
}, []);

useEffect(() => {
  if (!hasHydratedMergePersistence) {
    return;
  }

  writePersistedExpertBuildMergeDrafts(persistedMergeDraftsByKey);
}, [hasHydratedMergePersistence, persistedMergeDraftsByKey]);

useEffect(() => {
  if (!hasHydratedMergePersistence) {
    return;
  }

  writePersistedExpertBuildMergeEvents(mergeLatestEventByBike);
}, [hasHydratedMergePersistence, mergeLatestEventByBike]);

useEffect(() => {
  setMergeRebaseSummary(null);
}, [activeBuildBikeId, activeMergeBuildId, selectedExpertBuildId]);

useEffect(() => {
  setGarageBuildSaveMode((prev) => {
    if (!isEditingSavedGarageBuild) {
      return "save-as-new";
    }

    return prev === "duplicate-build" || prev === "save-as-version"
      ? prev
      : "update-existing";
  });
}, [isEditingSavedGarageBuild, activeWorkingGarageSourceBuild?.id]);

const compareSummary = useMemo(
  () => getCompareSummary(selectedExpertBuild, selectedProducts),
  [selectedExpertBuild, selectedProducts]
);

const compareCategorySections = useMemo<CompareCategorySection[]>(
  () => getCompareCategorySections(selectedExpertBuild, selectedProducts, categories),
  [selectedExpertBuild, selectedProducts]
);

const compareFilterCounts = useMemo(
  () => getCompareFilterCounts(compareCategorySections),
  [compareCategorySections]
);

const filteredCompareCategorySections = useMemo<CompareCategorySection[]>(
  () => getFilteredCompareCategorySections(compareCategorySections, activeCompareFilter),
  [activeCompareFilter, compareCategorySections]
);

const activeCompareFilterMeta = useMemo(
  () => getCompareFilterMeta(activeCompareFilter),
  [activeCompareFilter]
);

useEffect(() => {
  if (activeStep !== "Build" && activeStep !== "Buy") {
    setActiveProductDetail(null);
  }
}, [activeStep]);

useEffect(() => {
  setActiveProductDetail(null);
  setActivePurchaseState(null);
}, [activeBuildBikeId]);

useEffect(() => {
  if (activeStep !== "Buy") {
    return;
  }

  setActiveProductDetail(null);
  setActivePurchaseState(null);
}, [activeStep, buySelectedBikeId]);

useEffect(() => {
  setExpertBuildInspiration(null);
  setActiveMergeBuildId("");
}, [activeBuildBikeId]);

useEffect(() => {
  if (
    activeMergeBuildId &&
    !expertBuildOptions.some((build) => build.id === activeMergeBuildId)
  ) {
    setActiveMergeBuildId("");
  }
}, [activeMergeBuildId, expertBuildOptions]);
  
  const addProductToBikeBuild = (bikeId: string, product: Product) => {
    if (!bikeId) return;

    setBikeBuilds((prev) => {
      const currentBuild = prev[bikeId] ?? [];
      const exists = currentBuild.some((item) => item.id === product.id);

      if (exists) return prev;

      return {
        ...prev,
        [bikeId]: [...currentBuild, product],
      };
    });

    setSaveMessage("");
    setDirtyBuilds((prev) => ({
      ...prev,
      [bikeId]: true,
    }));
  };

  const removeProductFromBikeBuild = (bikeId: string, productId: number) => {
    if (!bikeId) return;

    setBikeBuilds((prev) => {
      const currentBuild = prev[bikeId] ?? [];

      return {
        ...prev,
        [bikeId]: currentBuild.filter((item) => item.id !== productId),
      };
    });

    setSaveMessage("");
    setDirtyBuilds((prev) => ({
      ...prev,
      [bikeId]: true,
    }));
  };

  const addToBuild = (product: Product) => {
    addProductToBikeBuild(activeBuildBikeId, product);
  };

  const removeFromBuild = (productId: number) => {
    removeProductFromBikeBuild(activeBuildBikeId, productId);
  };

const handleOpenProductPurchase = (input: {
  accessory?: ResolvedExpertBuildAccessory | null;
  product?: Product | null;
  sourceContext: CommerceSourceContext;
}) => {
  if (!input.accessory && !input.product) {
    return;
  }

  const product = input.product ?? null;
  const commerce = input.accessory
    ? resolveProductCommerce({
        product: product ?? undefined,
        accessory: input.accessory,
      })
    : resolveProductCommerce({
        product: product as Product,
      });

  setActivePurchaseState({
    commerce,
    sourceContext: input.sourceContext,
  });
};

const handleTrackCommerceOutbound = (
  vendorName: string,
  url: string,
  sourceContext: CommerceSourceContext
) => {
  if (!activePurchaseState) {
    return;
  }

  trackProductCommerceClick({
    productId: activePurchaseState.commerce.productId,
    productTitle: activePurchaseState.commerce.title,
    vendorName,
    url,
    sourceContext,
    timestamp: new Date().toISOString(),
  });
};

const handleOpenExpertBuildPurchase = (input: {
  accessoryId?: string;
  itemId?: string;
}) => {
  if (input.accessoryId && selectedExpertBuild) {
    const accessory =
      selectedExpertBuild.resolvedAccessories.find(
        (item) => item.id === input.accessoryId
      ) ?? null;

    if (accessory) {
      handleOpenProductPurchase({
        accessory,
        product: accessory.product,
        sourceContext: "expert-build",
      });
    }

    return;
  }

  if (input.itemId && activeMergeDraft) {
    const mergeItem =
      activeMergeDraft.items.find((item) => item.id === input.itemId) ?? null;

    if (mergeItem) {
      handleOpenProductPurchase({
        accessory: mergeItem.expertAccessory,
        product: mergeItem.expertProduct,
        sourceContext: "merge-studio",
      });
    }
  }
};

const handleCompareExpertBuild = (expertBuildId: string) => {
  setSelectedExpertBuildId(expertBuildId);
  setActiveStep("Compare");
};

const handleOpenMergeStudio = (expertBuildId: string) => {
  if (!currentBike) return;

  const expertBuild =
    expertBuildOptions.find((option) => option.id === expertBuildId) ?? null;

  if (!expertBuild) return;

  const draftKey = `${currentBike.id}:${expertBuildId}`;
  const existingRuntimeDraft = mergeDraftsByKey[draftKey] ?? null;
  const persistedDraft = persistedMergeDraftsByKey[draftKey] ?? null;
  setSelectedExpertBuildId(expertBuildId);
  setActiveMergeBuildId(expertBuildId);
  setMergeRebaseSummary(null);
  setMergeDraftsByKey((prev) => {
    if (prev[draftKey]) {
      return prev;
    }

    const nextDraft = persistedDraft
      ? restoreExpertBuildMergeDraft({
          persisted: persistedDraft,
          sourceBuild: expertBuild,
        })
      : createExpertBuildMergeDraft({
          bikeId: currentBike.id,
          currentProducts: selectedProducts,
          mode: "review-all",
          sourceBuild: expertBuild,
        });

    return {
      ...prev,
      [draftKey]: nextDraft,
    };
  });
  setSaveMessage(
    persistedDraft
      ? `Resumed the ${expertBuild.title} merge draft. Your current build stays unchanged until you apply a preview.`
      : `Opened Merge Studio for ${expertBuild.title}. Your current build stays unchanged until you apply a preview.`
  );
  if (!persistedDraft) {
    const nextDraft =
      existingRuntimeDraft ??
      createExpertBuildMergeDraft({
        bikeId: currentBike.id,
        currentProducts: selectedProducts,
        mode: "review-all",
        sourceBuild: expertBuild,
      });
    setPersistedMergeDraftsByKey((prev) => ({
      ...prev,
      [draftKey]: createExpertBuildMergeDraftPersisted(nextDraft),
    }));
  }
};

const handleCloseMergeStudio = () => {
  setActiveMergeBuildId("");
};

const handleSetMergeMode = (mode: ExpertBuildApplyMode) => {
  if (!activeMergeDraft || !selectedExpertBuild) return;

  const nextDraft = updateExpertBuildMergeMode(
    {
      ...activeMergeDraft,
      mode,
    },
    selectedExpertBuild
  );

  setMergeDraftsByKey((prev) => ({
    ...prev,
    [activeMergeDraft.id]: nextDraft,
  }));
  setPersistedMergeDraftsByKey((prev) => ({
    ...prev,
    [activeMergeDraft.id]: createExpertBuildMergeDraftPersisted(nextDraft),
  }));
};

const handleDecisionMergeItem = (
  itemId: string,
  decision: ExpertBuildMergeDecision
) => {
  if (!activeMergeDraft) return;

  const nextDraft = setExpertBuildMergeItemDecision(
    activeMergeDraft,
    itemId,
    decision
  );

  setMergeDraftsByKey((prev) => ({
    ...prev,
    [activeMergeDraft.id]: nextDraft,
  }));
  setPersistedMergeDraftsByKey((prev) => ({
    ...prev,
    [activeMergeDraft.id]: createExpertBuildMergeDraftPersisted(nextDraft),
  }));
};

const handleCategoryMergeAction = (
  categoryId: string,
  action: "apply" | "skip" | "review"
) => {
  if (!activeMergeDraft) return;

  const nextDraft = applyExpertBuildMergeDecisionToCategory(
    activeMergeDraft,
    categoryId,
    action
  );

  setMergeDraftsByKey((prev) => ({
    ...prev,
    [activeMergeDraft.id]: nextDraft,
  }));
  setPersistedMergeDraftsByKey((prev) => ({
    ...prev,
    [activeMergeDraft.id]: createExpertBuildMergeDraftPersisted(nextDraft),
  }));
};

const handleSaveMergeDraft = () => {
  if (!activeMergeDraft || !selectedExpertBuild) return;

  const nextDraft = markExpertBuildMergeDraftSaved(activeMergeDraft);

  setMergeDraftsByKey((prev) => ({
    ...prev,
    [activeMergeDraft.id]: nextDraft,
  }));
  setPersistedMergeDraftsByKey((prev) => ({
    ...prev,
    [activeMergeDraft.id]: createExpertBuildMergeDraftPersisted(nextDraft),
  }));
  setSaveMessage(
    activeMergeIsStale
      ? `Saved draft. The ${selectedExpertBuild.title} merge draft is ready to resume, but it still needs rebase review against your latest build.`
      : `Saved draft. The ${selectedExpertBuild.title} merge draft is ready to resume later.`
  );
};

const handleResetMergeDraft = (expertBuildId: string) => {
  if (!currentBike) {
    return;
  }

  const draftKey = `${currentBike.id}:${expertBuildId}`;

  setMergeDraftsByKey((prev) => {
    if (!prev[draftKey]) {
      return prev;
    }

    const nextDrafts = { ...prev };
    delete nextDrafts[draftKey];
    return nextDrafts;
  });
  setPersistedMergeDraftsByKey((prev) => {
    if (!prev[draftKey]) {
      return prev;
    }

    const nextDrafts = { ...prev };
    delete nextDrafts[draftKey];
    return nextDrafts;
  });
  if (activeMergeBuildId === expertBuildId) {
    setActiveMergeBuildId("");
  }
  setMergeRebaseSummary(null);
  setSaveMessage("Cleared the saved merge draft so you can start fresh.");
};

const handleRebaseMergeDraft = () => {
  if (!activeMergeDraft || !selectedExpertBuild) {
    return;
  }

  const rebaseResult = rebaseExpertBuildMergeDraft({
    draft: activeMergeDraft,
    currentProducts: selectedProducts,
    sourceBuild: selectedExpertBuild,
  });

  setMergeDraftsByKey((prev) => ({
    ...prev,
    [activeMergeDraft.id]: rebaseResult.draft,
  }));
  setPersistedMergeDraftsByKey((prev) => ({
    ...prev,
    [activeMergeDraft.id]: createExpertBuildMergeDraftPersisted(rebaseResult.draft),
  }));
  setMergeRebaseSummary(
    rebaseResult.downgradedDecisionCount > 0
      ? `Rebased onto your latest build. Preserved ${rebaseResult.preservedDecisionCount} decisions and sent ${rebaseResult.downgradedDecisionCount} item${rebaseResult.downgradedDecisionCount === 1 ? "" : "s"} back for review.`
      : `Rebased onto your latest build and preserved ${rebaseResult.preservedDecisionCount} prior decision${rebaseResult.preservedDecisionCount === 1 ? "" : "s"}.`
  );
  setSaveMessage("Rebased the merge draft onto your current working build.");
};

const handleRebaseSelectedPersistedDraft = () => {
  if (!currentBike || !selectedExpertBuild || !selectedPersistedMergeDraft) {
    return;
  }

  const restoredDraft = restoreExpertBuildMergeDraft({
    persisted: selectedPersistedMergeDraft,
    sourceBuild: selectedExpertBuild,
  });
  const rebaseResult = rebaseExpertBuildMergeDraft({
    draft: restoredDraft,
    currentProducts: selectedProducts,
    sourceBuild: selectedExpertBuild,
  });

  setSelectedExpertBuildId(selectedExpertBuild.id);
  setActiveMergeBuildId(selectedExpertBuild.id);
  setMergeDraftsByKey((prev) => ({
    ...prev,
    [restoredDraft.id]: rebaseResult.draft,
  }));
  setPersistedMergeDraftsByKey((prev) => ({
    ...prev,
    [restoredDraft.id]: createExpertBuildMergeDraftPersisted(rebaseResult.draft),
  }));
  setMergeRebaseSummary(
    rebaseResult.downgradedDecisionCount > 0
      ? `Rebased onto your latest build. Preserved ${rebaseResult.preservedDecisionCount} decisions and sent ${rebaseResult.downgradedDecisionCount} item${rebaseResult.downgradedDecisionCount === 1 ? "" : "s"} back for review.`
      : `Rebased onto your latest build and preserved ${rebaseResult.preservedDecisionCount} prior decision${rebaseResult.preservedDecisionCount === 1 ? "" : "s"}.`
  );
  setSaveMessage("Rebased the saved merge draft onto your current working build.");
};

const handleApplyMergeDraft = () => {
  if (!currentBike || !selectedExpertBuild || !activeMergeDraft || !activeMergePreview) {
    return;
  }

  if (activeMergeIsStale) {
    setSaveMessage(
      "This merge draft is based on an older build snapshot. Rebase it against your current build before applying changes."
    );
    return;
  }

  if (!activeMergeValidation.canApply) {
    setSaveMessage(
      activeMergeValidation.unresolvedCount > 0
        ? "Resolve the remaining merge conflicts before applying changes."
        : "Choose at least one merge change before applying."
    );
    return;
  }

  const provenance = createExpertBuildMergeProvenance({
    sourceBuild: selectedExpertBuild,
    preview: activeMergePreview,
    mode: activeMergeDraft.mode,
  });
  const mergeEvent = createExpertBuildMergeEvent({
    bikeId: currentBike.id,
    provenance,
    restoreAvailable: true,
  });

  setLastPreMergeSnapshotByBike((prev) => ({
    ...prev,
    [currentBike.id]: {
      bikeId: currentBike.id,
      sourceBuildId: selectedExpertBuild.id,
      sourceBuildTitle: selectedExpertBuild.title,
      capturedAt: provenance.appliedAt,
      products: selectedProducts,
      previousProvenance: mergeLatestEventByBike[currentBike.id]
        ? {
            sourceBuildId: mergeLatestEventByBike[currentBike.id].sourceBuildId,
            sourceBuildTitle: mergeLatestEventByBike[currentBike.id].sourceBuildTitle,
            appliedAt: mergeLatestEventByBike[currentBike.id].appliedAt,
            mergeMode: mergeLatestEventByBike[currentBike.id].mergeMode,
            additions: mergeLatestEventByBike[currentBike.id].additions,
            replacements: mergeLatestEventByBike[currentBike.id].replacements,
            affectedCategories: mergeLatestEventByBike[currentBike.id].affectedCategories,
            impactSummary: mergeLatestEventByBike[currentBike.id].impactSummary,
          }
        : null,
    },
  }));
  setBikeBuilds((prev) => {
    const currentBuild = prev[currentBike.id] ?? [];

    if (areProductArraysEquivalent(currentBuild, activeMergePreview.mergedProducts)) {
      return prev;
    }

    return {
      ...prev,
      [currentBike.id]: activeMergePreview.mergedProducts,
    };
  });
  setDirtyBuilds((prev) => ({
    ...prev,
    [currentBike.id]: true,
  }));
  setMergeLatestEventByBike((prev) => ({
    ...prev,
    [currentBike.id]: mergeEvent,
  }));
  setMergeDraftsByKey((prev) => {
    const nextDrafts = { ...prev };
    delete nextDrafts[activeMergeDraft.id];
    return nextDrafts;
  });
  setPersistedMergeDraftsByKey((prev) => {
    if (!prev[activeMergeDraft.id]) {
      return prev;
    }

    const nextDrafts = { ...prev };
    delete nextDrafts[activeMergeDraft.id];
    return nextDrafts;
  });
  setSaveMessage(
    `Applied ${activeMergePreview.summary.safeToAddCount + activeMergePreview.summary.replaceCount} merge change${
      activeMergePreview.summary.safeToAddCount + activeMergePreview.summary.replaceCount === 1 ? "" : "s"
    } from ${selectedExpertBuild.title}.`
  );
  setActiveMergeBuildId("");
};

const handleRestorePreMergeBuild = () => {
  if (!currentBike) return;

  const snapshot = lastPreMergeSnapshotByBike[currentBike.id];

  if (!snapshot) return;

  setBikeBuilds((prev) => {
    const currentBuild = prev[currentBike.id] ?? [];

    if (areProductArraysEquivalent(currentBuild, snapshot.products)) {
      return prev;
    }

    return {
      ...prev,
      [currentBike.id]: snapshot.products,
    };
  });
  setDirtyBuilds((prev) => ({
    ...prev,
    [currentBike.id]: true,
  }));
  setMergeLatestEventByBike((prev) => {
    if (snapshot.previousProvenance) {
      return {
        ...prev,
        [currentBike.id]: createExpertBuildMergeEvent({
          bikeId: currentBike.id,
          provenance: snapshot.previousProvenance,
          restoreAvailable: false,
        }),
      };
    }

    if (!prev[currentBike.id]) {
      return prev;
    }

    const nextEvents = { ...prev };
    delete nextEvents[currentBike.id];
    return nextEvents;
  });
  setLastPreMergeSnapshotByBike((prev) => {
    if (!prev[currentBike.id]) {
      return prev;
    }

    const nextSnapshots = { ...prev };
    delete nextSnapshots[currentBike.id];
    return nextSnapshots;
  });
  setSaveMessage(`Restored the pre-merge build snapshot from ${snapshot.sourceBuildTitle}.`);
};

const handleAddExpertBuildToInspiration = (
  mode: "all" | "missing-only"
) => {
  if (!selectedExpertBuild) return;

  const items =
    mode === "missing-only"
      ? getMissingInspirationProducts(selectedExpertBuild, selectedProducts)
      : selectedExpertBuild.items;

  if (items.length === 0) {
    setSaveMessage(
      mode === "missing-only"
        ? "Your current build already covers this expert setup."
        : "This expert build does not have any inspiration items yet."
    );
    return;
  }

  setExpertBuildInspiration(
    createExpertBuildInspirationSelection({
      build: selectedExpertBuild,
      mode,
      items,
    })
  );
  setSaveMessage(
    mode === "missing-only"
      ? `Added ${items.length} missing expert item${items.length === 1 ? "" : "s"} to inspiration.`
      : `Added ${items.length} expert item${items.length === 1 ? "" : "s"} to inspiration.`
  );
};

const handleClearExpertBuildInspiration = () => {
  setExpertBuildInspiration(null);
  setSaveMessage("Cleared the current inspiration tray.");
};

const handleSaveExpertBuildToGarage = async (expertBuildId: string) => {
  const expertBuild =
    expertBuildOptions.find((option) => option.id === expertBuildId) ?? null;

  if (!isSignedIn) {
    setSaveStepMessage("Sign in to save expert builds to My Garage.");
    setActiveStep("Save");
    return;
  }

  if (!currentBike || !expertBuild) {
    setSaveStepMessage("Choose a bike and expert build before saving to My Garage.");
    setActiveStep("Save");
    return;
  }

  const createdAt = new Date().toISOString();
  const nextBuildId = `${currentBike.id}-expert-${Date.now()}`;
  const existingNames = new Set(
    (garageBuildsByBike[currentBike.id] ?? []).map((build) => build.name.trim().toLowerCase())
  );
  const baseBuildName = expertBuild.title.trim();
  let nextBuildName = baseBuildName;
  let buildNameSuffix = 2;

  while (existingNames.has(nextBuildName.toLowerCase())) {
    nextBuildName = `${baseBuildName} ${buildNameSuffix}`;
    buildNameSuffix += 1;
  }

  const buildItems = createGarageBuildItems(
    nextBuildId,
    expertBuild.items,
    createdAt
  );
  const nextBuildRecord = applyGarageBuildMetadata(
    createGarageBuildRecord({
      id: nextBuildId,
      bikeId: currentBike.id,
      name: nextBuildName,
      status: "Saved",
      buildType: "Expert Match",
      isPrimary: false,
      notes: `Cloned from ${expertBuild.title}`,
      createdAt,
      updatedAt: createdAt,
      buildItems,
      productGroups: mapExpertBuildCategoryGroups(expertBuild),
    }),
    createGarageBuildMetadata({
      buildId: nextBuildId,
      buildName: nextBuildName,
      bike: currentBike,
      existingBuilds: getBuildsForBike(currentBike.id),
      mergeSummary: null,
      now: createdAt,
      saveMode: "save-as-new",
      sourceBuild: null,
      sourceExpertBuild: { id: expertBuild.id, title: expertBuild.title },
    })
  );

  setGarageBuildsByBike((prev) => ({
    ...prev,
    [currentBike.id]: [nextBuildRecord, ...(prev[currentBike.id] ?? [])],
  }));
  upsertGarageBuildMetadataRecord(nextBuildRecord);
  setMyGarageView({
    level: "build",
    bikeId: currentBike.id,
    buildId: nextBuildId,
  });
  setActiveStep("Save");
  setSaveStepMessage(`Saved ${expertBuild.title} to My Garage.`);

  try {
    await persistGarageBuildSnapshot(nextBuildRecord);
  } catch (error) {
    console.error("Failed to persist expert build clone", error);
    setSaveStepMessage("We couldn't save that expert build right now.");
  }
};

const compatibleCount = useMemo(() => {
  return products.filter((product) =>
    isProductCompatible(product, activeCompatibilityBikeId)
  ).length;
}, [products, activeCompatibilityBikeId]);

const genericBikePlaceholder = FALLBACK_BIKE_PLACEHOLDER;

const heroImage = resolveGarageBikePreviewImage({
  bike: bikeStepPreviewImageBike,
  build: bikeStepPreviewBuild,
});

const bikeStepFilteredBikeOptions = useMemo(() => {
  if (!selectedMake && !selectedSeries && !selectedModel && !selectedYear) {
    return [];
  }

  return supabaseBikes.filter((bike) => {
    if (selectedMake && bike.make !== selectedMake) return false;
    if (selectedSeries && bike.model !== selectedSeries) return false;
    if (selectedModel && (bike.variant || "Base") !== selectedModel) return false;
    if (selectedYear && String(bike.year) !== selectedYear) return false;
    return true;
  });
}, [selectedMake, selectedSeries, selectedModel, selectedYear, supabaseBikes]);

const isBikeStepBlankState =
  !selectedMake && !selectedSeries && !selectedModel && !selectedYear;
const isBikeStepFullyFiltered =
  !!selectedMake && !!selectedSeries && !!selectedModel && !!selectedYear;
const bikeStepHelperText = isBikeStepBlankState
  ? "Start by choosing a make"
  : isBikeStepFullyFiltered
  ? "Select your exact bike from the matches below"
  : "Refine your filters to narrow the matches";
const isSelectedBikeSavedGarageBike = !!selectedBike && myGarageBikes.some((bike) => bike.id === selectedBike.id);
  
  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setIsLoading(true);
      setPageError("");

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        const signedIn = !!user;
        setIsSignedIn(signedIn);
        setSignedInUserEmail(user?.email ?? "");

      } catch (error) {
        console.error("garage load failed:", error);
        if (isMounted) {
          setPageError("We couldn’t load your garage right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const signedIn = !!session?.user;
      setIsSignedIn(signedIn);
      setSignedInUserEmail(session?.user?.email ?? "");

      if (!signedIn) {
        setBikeBuilds({});
        setDirtyBuilds({});
        setSelectedBikeId("");
        setSelectedGarageResumeBuildId("");
        setActiveBuildBikeId("");
        setWorkingGarageBuildSourceByBike({});
        setGarageBuildSaveMode("save-as-new");
        setIsLoading(false);
        return;
      }

      try {
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = () => {
  setPageError("");
  setSaveMessage("");
  const nextPath =
    typeof window === "undefined"
      ? "/garage"
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;
  router.push(buildLoginHref({ next: nextPath, mode: "login" }));
};

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setSaveMessage("Signed out.");
    } catch (error) {
      console.error(error);
      setPageError("We couldn’t sign you out right now.");
    }
  };

  const initializeFreshWorkingBuildForBike = (bikeId: string) => {
    setSelectedGarageResumeBuildId("");
    setBikeBuilds((prev) => ({
      ...prev,
      [bikeId]: [],
    }));
    setDirtyBuilds((prev) => ({
      ...prev,
      [bikeId]: false,
    }));
    setWorkingGarageBuildSourceByBike((prev) => ({
      ...prev,
      [bikeId]: null,
    }));
  };

  const selectTemplateBikeInternal = (bikeId: string) => {
    setSelectedBikeId(bikeId);
    setSelectedGarageResumeBuildId("");
    setGarageBuildSaveMode("save-as-new");
    setGarageBuildCompareReferenceId(null);
    setSaveMessage("");
    setSaveStepMessage("");
    setBuildNameInput("");
  };

  const handleSelectGarageResumeEntry = (buildId: string) => {
    const resumeEntry =
      garageResumeEntries.find((entry) => entry.buildId === buildId) ?? null;
    const resumeBike = resumeEntry
      ? myGarageBikes.find((bike) => bike.id === resumeEntry.bikeId) ?? null
      : null;

    if (!resumeEntry || !resumeBike) {
      setSaveStepMessage("That saved bike is no longer available.");
      return;
    }

    setSelectedBikeId(resumeBike.id);
    setSelectedGarageResumeBuildId(resumeEntry.buildId);
    setSelectedMake(resumeBike.make);
    setSelectedSeries(resumeBike.model);
    setSelectedModel(resumeBike.variant || "Base");
    setSelectedYear(String(resumeBike.year));
    setGarageBuildCompareReferenceId(null);
    setSaveStepMessage(`Selected ${getGarageBikePickerLabel(resumeBike)}.`);
  };

  const handleSelectTemplateBike = (bikeId: string) => {
    promptForSavedBuildContextReplacement(() => selectTemplateBikeInternal(bikeId), {
      title: "Leave this saved build?",
      message:
        "You have unsaved changes to the saved build you opened in Build. Save them before switching bikes, or discard them and continue.",
    });
  };

  const handleClearBikeSelection = () => {
    setSelectedBikeId("");
    setSelectedGarageResumeBuildId("");
    setSelectedMake("");
    setSelectedSeries("");
    setSelectedModel("");
    setSelectedYear("");
    setBuildNameInput("");
    setGarageBikeNameInput("");
    setGarageBikeNameSeedKey(null);
    setHasEditedGarageBikeName(false);
    setGarageBuildCompareReferenceId(null);
    setSelectedExpertBuildId("");
    setActiveCompareFilter("all");
    setMyGarageView({ level: "overview" });
    setSaveMessage("");
    setSaveStepMessage("");
    setIsBuildSaveDialogOpen(false);
  };

  const handleSaveBuild = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaveMessage("Please sign in to save your build.");
        return;
      }

      const { error } = await supabase.from("saved_builds").upsert(
        {
          user_id: user.id,
          bike_id: selectedBikeId,
          products: selectedProducts,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,bike_id",
        }
      );

      if (error) {
        console.error(error);
        setSaveMessage("Error saving build.");
        return;
      }

      setSaveMessage("Build saved successfully.");
      setDirtyBuilds((prev) => ({
        ...prev,
        [selectedBikeId]: false,
      }));
    } catch (err) {
      console.error(err);
      setSaveMessage("Unexpected error saving build.");
    }
  };

  const executeGarageBuildSave = async (input?: {
    bikeNameOverride?: string;
    buildNameOverride?: string;
    surfaceErrorsInDialog?: boolean;
  }) => {
    if (!isSignedIn) {
      const message = "Sign in to save this build to Saved Builds.";
      if (input?.surfaceErrorsInDialog) {
        setBuildSaveDialogError(message);
      } else {
        setSaveMessage(message);
      }
      return false;
    }

    if (!currentBike || selectedProducts.length === 0) {
      const message = "Select a bike and add accessories before saving.";
      if (input?.surfaceErrorsInDialog) {
        setBuildSaveDialogError(message);
      } else {
        setSaveMessage(message);
      }
      return false;
    }

    const effectiveSaveMode: GarageBuildSaveMode = activeWorkingBikeContext.isSavedGarageBike
      ? garageBuildSaveMode
      : "save-as-new";
    const nextBikeName = (input?.bikeNameOverride ?? buildSaveDialogBikeName).trim();
    const nextBuildNameInput = (
      input?.buildNameOverride ??
      buildSaveDialogBuildName ??
      (effectiveSaveMode === "update-existing" ? activeWorkingGarageSourceBuild?.name ?? "" : "")
    ).trim();

    if (requiresBikeNamingOnSave && !nextBikeName) {
      const message = "Name this bike before saving it to Garage.";
      if (input?.surfaceErrorsInDialog) {
        setBuildSaveDialogError(message);
      } else {
        setSaveMessage(message);
      }
      return false;
    }

    if (!nextBuildNameInput) {
      const message =
        effectiveSaveMode === "update-existing"
          ? "This saved build needs a valid name before it can be updated."
          : "Enter a build name before saving.";
      if (input?.surfaceErrorsInDialog) {
        setBuildSaveDialogError(message);
      } else {
        setSaveMessage(message);
      }
      return false;
    }

    const updatedAt = new Date().toISOString();
    let targetBike = currentBike;
    let targetBikeId = currentBike.id;
    const isCreatingSavedGarageBike = !activeWorkingBikeContext.isSavedGarageBike;

    if (isCreatingSavedGarageBike) {
      const templateBike = activeWorkingBikeContext.templateBike ?? currentBike;
      const garageBikeId = createGarageBikeInstanceId(templateBike);
      const createdBike = createGarageBikeInstanceFromTemplate({
        templateBike,
        garageBikeId,
        nickname: nextBikeName,
      });

      createdBike.ownershipStatus = "Owned";
      targetBike = createdBike;
      targetBikeId = createdBike.id;
    }

    const currentBikeBuilds = getBuildsForBike(targetBikeId);
    const baseName = getSuggestedGarageBuildName({
      bike: targetBike,
      currentNameInput: nextBuildNameInput,
      existingBuilds: currentBikeBuilds,
      mergeSummary: mapMergeEventToGarageBuildMergeSummary(currentBikeMergeEvent),
      saveMode: effectiveSaveMode,
      sourceBuild: activeWorkingGarageSourceBuild,
    });
    const nextBuildId =
      effectiveSaveMode === "update-existing" && activeWorkingGarageSourceBuild
        ? activeWorkingGarageSourceBuild.id
        : `${targetBikeId}-${Date.now()}`;
    const nextBuildRecord = createGarageBuildRecordWithMetadata({
      bike: targetBike,
      bikeId: targetBikeId,
      buildId: nextBuildId,
      name: baseName,
      buildType: activeWorkingGarageSourceBuild?.buildType ?? "Personal Build",
      notes:
        effectiveSaveMode === "duplicate-build" && activeWorkingGarageSourceBuild
          ? `Duplicated from ${activeWorkingGarageSourceBuild.name}`
          : effectiveSaveMode === "save-as-version" && activeWorkingGarageSourceBuild
          ? `Versioned from ${activeWorkingGarageSourceBuild.name}`
          : null,
      saveMode: effectiveSaveMode,
      sourceBuild: activeWorkingGarageSourceBuild,
      status: "Saved",
      isPrimary:
        effectiveSaveMode === "update-existing" && activeWorkingGarageSourceBuild
          ? activeWorkingGarageSourceBuild.isPrimary
          : currentBikeBuilds.filter((build) => build.status !== "Archived").length === 0,
      updatedAt,
    });

    const nextBuildsForBike =
      effectiveSaveMode === "update-existing" && activeWorkingGarageSourceBuild
        ? currentBikeBuilds.map((build) =>
            build.id === activeWorkingGarageSourceBuild.id ? nextBuildRecord : build
          )
        : [nextBuildRecord, ...currentBikeBuilds];

    setBuildSaveDialogError("");
    setIsSavingBuildSaveDialog(true);

    try {
      await persistGarageBuildSnapshot(nextBuildRecord, {
        bikeOverride: targetBike,
        nicknameOverride: nextBikeName,
        skipBikePersist:
          !isCreatingSavedGarageBike && !hasUnsavedBuildSaveDialogBikeNameChanges,
      });

      if (isCreatingSavedGarageBike) {
        setLocalGarageBikes((prev) => [
          targetBike,
          ...prev.filter((bike) => bike.id !== targetBikeId),
        ]);
        setGarageBikeMetaById((prev) => ({
          ...prev,
          [targetBikeId]: {
            garageBikeName: nextBikeName || null,
            nickname: nextBikeName || null,
            ownershipStatus: targetBike.ownershipStatus ?? "Owned",
            isArchived: false,
          },
        }));
        setBikeBuilds((prev) => ({
          ...prev,
          [targetBikeId]: selectedProducts,
        }));
        setSelectedBikeId(targetBikeId);
      }

      setActiveBuildBikeId(targetBikeId);

      if (nextBikeName) {
        applyGarageBikeNickname(targetBikeId, nextBikeName);
      }

      setGarageBuildsByBike((prev) => ({
        ...prev,
        [targetBikeId]: nextBuildsForBike,
      }));
      upsertGarageBuildMetadataRecord(nextBuildRecord);
      setWorkingGarageBuildSourceByBike((prev) => ({
        ...prev,
        [targetBikeId]: {
          buildId: nextBuildRecord.id,
          buildName: nextBuildRecord.name,
        },
      }));
      setGarageBuildSaveMode("update-existing");
      setDirtyBuilds((prev) => ({
        ...prev,
        [targetBikeId]: false,
      }));
      setBuildNameInput(nextBuildRecord.name);
      setGarageBikeNameInput(nextBikeName);
      setHasEditedGarageBikeName(false);
      setMyGarageView({ level: "bike", bikeId: targetBikeId });
      setSaveMessage(
        effectiveSaveMode === "update-existing"
          ? `Updated ${nextBuildRecord.name}.`
          : effectiveSaveMode === "save-as-version"
          ? `Saved ${nextBuildRecord.name} as a new version.`
          : effectiveSaveMode === "duplicate-build"
          ? `Saved ${nextBuildRecord.name} as a duplicate build.`
          : activeWorkingBikeContext.isSavedGarageBike
          ? `Saved ${nextBuildRecord.name} as a new build.`
          : `Saved ${nextBuildRecord.name} under ${nextBikeName}.`
      );
      setIsBuildSaveDialogOpen(false);
      return true;
    } catch (error) {
      const persistenceError = isRecord(error) ? error : null;
      const failingStep =
        persistenceError && typeof persistenceError.step === "string"
          ? persistenceError.step
          : "persistGarageBuildSnapshot";
      const safeError = getSafePersistErrorDetails(
        persistenceError?.error ?? error
      );

      if (safeError && !isBenignRemoteSyncPersistError(safeError)) {
        console.error("Failed to persist garage build", {
          step: failingStep,
          message: "Unexpected failure while syncing the saved build remotely.",
          error: safeError,
          fallbackDefaultsApplied: false,
        });
      }
      const message = "We couldn't save your build right now.";
      if (input?.surfaceErrorsInDialog) {
        setBuildSaveDialogError(message);
      } else {
        setSaveMessage(message);
      }
      return false;
    } finally {
      setIsSavingBuildSaveDialog(false);
    }
  };

  const handleOpenBuildSaveDialog = () => {
    if (!isSignedIn) {
      setSaveMessage("Sign in to save this build to Saved Builds.");
      return;
    }

    if (!currentBike || selectedProducts.length === 0) {
      setSaveMessage("Select a bike and add accessories before saving.");
      return;
    }

    if (!hasEditedGarageBikeName && !garageBikeNameInput.trim() && currentBike) {
      setGarageBikeNameInput(currentGarageBikeName || getBikeOptionLabel(currentBike));
      setHasEditedGarageBikeName(false);
    }

    const nextBikeName =
      garageBikeNameInput.trim() || currentGarageBikeName || getBikeOptionLabel(currentBike);
    const existingSavedBuildName =
      activeWorkingGarageSourceBuild?.name?.trim() || buildNameInput.trim();
    const canUpdateExistingNamedBuild =
      isEditingSavedGarageBuild &&
      garageBuildSaveMode === "update-existing" &&
      activeWorkingBikeContext.isSavedGarageBike &&
      existingSavedBuildName.length > 0;

    setGarageBuildSaveMode(
      isEditingSavedGarageBuild ? "update-existing" : "save-as-new"
    );

    if (canUpdateExistingNamedBuild) {
      setSaveMessage("");
      void executeGarageBuildSave({
        bikeNameOverride: nextBikeName,
        buildNameOverride: existingSavedBuildName,
        surfaceErrorsInDialog: false,
      });
      return;
    }

    setBuildSaveDialogBikeName(nextBikeName);
    setBuildSaveDialogBuildName(
      isEditingSavedGarageBuild
        ? buildNameInput.trim() || activeWorkingGarageSourceBuild?.name || ""
        : ""
    );
    setBuildSaveDialogError("");
    setIsSavingBuildSaveDialog(false);
    setSaveMessage("");
    setIsBuildSaveDialogOpen(true);
  };

  const handleOpenDuplicateBuildSaveDialog = () => {
    if (!isSignedIn) {
      setSaveMessage("Sign in to save this build to Saved Builds.");
      return;
    }

    if (!currentBike || selectedProducts.length === 0) {
      setSaveMessage("Select a bike and add accessories before saving.");
      return;
    }

    const nextBikeName =
      garageBikeNameInput.trim() || currentGarageBikeName || getBikeOptionLabel(currentBike);

    setGarageBuildSaveMode("duplicate-build");
    setBuildSaveDialogBikeName(nextBikeName);
    setBuildSaveDialogBuildName("");
    setBuildSaveDialogError("");
    setIsSavingBuildSaveDialog(false);
    setSaveMessage("");
    setIsBuildSaveDialogOpen(true);
  };

  const handleSaveBuildCard = async () => {
    await executeGarageBuildSave({ surfaceErrorsInDialog: true });
  };

const closeSavedBuildGuardDialog = () => {
  pendingSavedBuildGuardActionRef.current = null;
  setSavedBuildGuardDialogState(null);
  setIsResolvingSavedBuildGuard(false);
};

const runPendingSavedBuildGuardAction = () => {
  const pendingAction = pendingSavedBuildGuardActionRef.current;
  closeSavedBuildGuardDialog();
  pendingAction?.();
};

const promptForSavedBuildContextReplacement = (
  onContinue: () => void,
  dialogCopy: { title: string; message: string }
) => {
  if (!(isEditingSavedGarageBuild && hasUnsavedGarageBuildChanges)) {
    onContinue();
    return;
  }

  pendingSavedBuildGuardActionRef.current = onContinue;
  setSavedBuildGuardDialogState(dialogCopy);
  setIsResolvingSavedBuildGuard(false);
};

const handleDiscardSavedBuildGuardChanges = () => {
  runPendingSavedBuildGuardAction();
};

const handleSaveAndContinueSavedBuildGuard = async () => {
  if (!currentBike || !activeWorkingGarageSourceBuild) {
    runPendingSavedBuildGuardAction();
    return;
  }

  const existingSavedBuildName = activeWorkingGarageSourceBuild.name.trim();
  const nextBikeName =
    garageBikeNameInput.trim() || currentGarageBikeName || getBikeOptionLabel(currentBike);

  setIsResolvingSavedBuildGuard(true);
  const didSave = await executeGarageBuildSave({
    bikeNameOverride: nextBikeName,
    buildNameOverride: existingSavedBuildName,
    surfaceErrorsInDialog: false,
  });

  if (!didSave) {
    setIsResolvingSavedBuildGuard(false);
    return;
  }

  runPendingSavedBuildGuardAction();
};

const handleRevertGarageBuildWorkspaceChanges = () => {
  if (!currentBike || !activeWorkingGarageSourceBuild) {
    setSaveMessage("There is no saved build session to revert.");
    return;
  }

  const snapshotProducts = activeWorkingGarageSourceBuild.buildItems.map(
    (item) => item.product
  );

  setBikeBuilds((prev) => ({
    ...prev,
    [currentBike.id]: snapshotProducts,
  }));
  setBuildNameInput(activeWorkingGarageSourceBuild.name);
  setDirtyBuilds((prev) => ({
    ...prev,
    [currentBike.id]: false,
  }));
  setSaveMessage(`Reverted to the last saved ${activeWorkingGarageSourceBuild.name} snapshot.`);
};

const handleStopEditingGarageBuild = () => {
  if (!currentBike || !activeWorkingGarageBuildSource) {
    setSaveMessage("There is no saved build editing session to stop.");
    return;
  }

  setWorkingGarageBuildSourceByBike((prev) => ({
    ...prev,
    [currentBike.id]: null,
  }));
  setGarageBuildSaveMode("save-as-new");
  setSaveMessage(
    `Stopped editing ${activeWorkingGarageBuildSource.buildName}. Your working build stays open as an unsaved session.`
  );
};

const handleOpenGarageBuild = (bikeId: string, buildId: string) => {
  setSaveStepMessage("");
  setMyGarageView({ level: "build", bikeId, buildId });
};

const handleBackToGarageOverview = () => {
  setSaveStepMessage("");
  setMyGarageView({ level: "overview" });
};

const createGarageBuildForBikeInternal = (bikeId: string) => {
  const bike = myGarageBikes.find((item) => item.id === bikeId) ?? null;
  initializeFreshWorkingBuildForBike(bikeId);
  setSelectedBikeId(bikeId);
  setActiveBuildBikeId(bikeId);
  setGarageBikeNameInput(bike ? getGarageBikeDisplayName(bike) : "");
  setHasEditedGarageBikeName(false);
  setBuildNameInput("");
  setGarageBuildSaveMode("save-as-new");
  setGarageBuildCompareReferenceId(null);
  setSaveMessage("");
  setActiveStep("Build");
  setSaveStepMessage("");
};

const handleCreateGarageBuild = (bikeId: string) => {
  promptForSavedBuildContextReplacement(() => createGarageBuildForBikeInternal(bikeId), {
    title: "Replace the current build session?",
    message:
      "You have unsaved changes to the saved build you are editing. Save them before starting another build session, or discard them and continue.",
  });
};

const handleCreateGarageBike = async () => {
  const make = window.prompt("Bike make", "");
  if (!make?.trim()) return;

  const model = window.prompt("Bike model", "");
  if (!model?.trim()) return;

  const yearInput = window.prompt("Bike year", String(new Date().getFullYear()));
  if (!yearInput?.trim()) return;

  const parsedYear = Number(yearInput);

  if (!Number.isFinite(parsedYear)) {
    setSaveStepMessage("Enter a valid year to create a bike.");
    return;
  }

  const variant = window.prompt("Variant or trim (optional)", "")?.trim() || null;
  const nickname = window.prompt("Nickname (optional)", "")?.trim() || null;
  const ownershipStatus = normalizeOwnershipStatus(
    window.prompt("Ownership status: Owned, In service, Previously owned, or Wishlist", "Owned")
  );
  const newBikeId = `local-bike-${Date.now()}`;

  setLocalGarageBikes((prev) => [
    {
      id: newBikeId,
      make: make.trim(),
      model: model.trim(),
      variant,
      year: parsedYear,
      category: null,
      engine_cc: null,
      image: null,
      heroImageUrl: null,
      photoCount: 0,
      coverPhotoId: null,
      photos: [],
      garageBikeName: nickname,
      nickname,
    },
    ...prev,
  ]);
  setGarageBikeMetaById((prev) => ({
    ...prev,
    [newBikeId]: {
      garageBikeName: nickname,
      nickname,
      ownershipStatus: ownershipStatus ?? "Owned",
      isArchived: false,
    },
  }));
  setGarageBikeNameInput(nickname ?? "");
  setHasEditedGarageBikeName(false);
  setMyGarageView({ level: "overview" });
  setSaveStepMessage("Bike added to Garage.");

  try {
    await upsertGarageBike({
      id: newBikeId,
      sourceBikeId: null,
      make: make.trim(),
      model: model.trim(),
      year: parsedYear,
      variant,
      garageBikeName: nickname,
      nickname,
      ownershipStatus: ownershipStatus ?? "Owned",
      isArchived: false,
      heroImageUrl: null,
      coverPhotoId: null,
    });
  } catch (error) {
    console.error("Failed to persist garage bike", error);
    setSaveStepMessage("We couldn't save that bike right now.");
  }
};

const handleEditGarageBike = async (bikeId: string) => {
  const bike = garageBikeCatalog.find((item) => item.id === bikeId);

  if (!bike) {
    setSaveStepMessage("That bike could not be edited.");
    return;
  }

  const existingMeta = garageBikeMetaById[bikeId];
  const nextNickname = window.prompt(
    "Bike nickname",
    existingMeta?.garageBikeName ??
      existingMeta?.nickname ??
      bike.garageBikeName ??
      bike.nickname ??
      (bike.variant ? `${bike.model} ${bike.variant}` : `${bike.make} ${bike.model}`)
  );

  if (nextNickname === null) return;

  const nextOwnershipStatus = normalizeOwnershipStatus(
    window.prompt(
      "Ownership status: Owned, In service, Previously owned, or Wishlist",
      existingMeta?.ownershipStatus ?? "Owned"
    )
  );

  const nextVariant = window.prompt("Variant or trim", bike.variant ?? "");

  if (nextVariant === null) return;

  setGarageBikeMetaById((prev) => ({
    ...prev,
    [bikeId]: {
      ...prev[bikeId],
      garageBikeName: nextNickname.trim() || null,
      nickname: nextNickname.trim() || null,
      ownershipStatus: nextOwnershipStatus ?? prev[bikeId]?.ownershipStatus ?? "Owned",
      isArchived: prev[bikeId]?.isArchived ?? false,
    },
  }));

  setLocalGarageBikes((prev) =>
    prev.some((item) => item.id === bikeId)
      ? prev.map((item) =>
          item.id === bikeId
            ? { ...item, variant: nextVariant.trim() || null }
            : item
        )
      : prev
  );

  setSaveStepMessage("Bike details updated.");

  try {
    await persistGarageBikeSnapshot(bikeId);
  } catch (error) {
    if (!isBenignGarageBikePersistError(error)) {
      console.error("Failed to persist bike edits", getSafePersistErrorDetails(error));
    }
    setSaveStepMessage("We couldn't save those bike changes right now.");
  }
};

const handleArchiveGarageBike = async (bikeId: string) => {
  setGarageBikeMetaById((prev) => ({
    ...prev,
    [bikeId]: {
      ...prev[bikeId],
      isArchived: true,
    },
  }));
  setMyGarageView({ level: "overview" });
  setSaveStepMessage("Bike removed from Garage.");

  try {
    await persistGarageBikeSnapshot(bikeId);
  } catch (error) {
    if (!isBenignGarageBikePersistError(error)) {
      console.error("Failed to persist bike archive", getSafePersistErrorDetails(error));
    }
    setSaveStepMessage("We couldn't update that bike right now.");
  }
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read image file."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });

const handleUploadGarageBikePhotos = async (bikeId: string, files: FileList | null) => {
  if (!files || files.length === 0) return;

  if (!isSignedIn) {
    setSaveStepMessage("Sign in to add bike photos.");
    return;
  }

  try {
    const persistedPhotos: BikePhoto[] = [];

    for (const file of Array.from(files)) {
      const uploadedPhoto = await uploadGarageBikePhoto({
        bikeId,
        file,
        caption: file.name,
      });
      if (uploadedPhoto) {
        persistedPhotos.push(uploadedPhoto);
      }
    }

    if (persistedPhotos.length > 0) {
      upsertLocalGarageBikeRecord(bikeId, (bike) => {
        const existingPhotos = bike.photos ?? [];
        const mergedPhotos = [...existingPhotos, ...persistedPhotos]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((photo, index) => ({ ...photo, sortOrder: index }));
        const coverPhoto = mergedPhotos.find((photo) => photo.isCover) ?? mergedPhotos[0] ?? null;

        return {
          ...bike,
          heroImageUrl: coverPhoto?.imageUrl ?? bike.heroImageUrl ?? bike.image ?? null,
          coverPhotoId: coverPhoto?.id ?? null,
          photoCount: mergedPhotos.length,
          photos: mergedPhotos,
        };
      });
      setSaveStepMessage(`Uploaded ${persistedPhotos.length} bike photo${persistedPhotos.length === 1 ? "" : "s"}.`);
    }
  } catch (error) {
    console.error("Failed to upload bike photos", error);
    setSaveStepMessage("We couldn't upload those bike photos right now.");
  }
};

const handleSetGarageBikeCover = async (bikeId: string, photoId: string) => {
  upsertLocalGarageBikeRecord(bikeId, (bike) => {
    const nextPhotos = (bike.photos ?? []).map((photo) => ({
      ...photo,
      isCover: photo.id === photoId,
    }));
    const coverPhoto = nextPhotos.find((photo) => photo.id === photoId) ?? null;

    return {
      ...bike,
      heroImageUrl: coverPhoto?.imageUrl ?? bike.heroImageUrl ?? bike.image ?? null,
      coverPhotoId: coverPhoto?.id ?? null,
      photoCount: nextPhotos.length,
      photos: nextPhotos,
    };
  });

  setSaveStepMessage("Bike cover updated.");

  if (!isSignedIn) return;

  try {
    const coverPhoto = await setGarageBikeCoverPhoto({ bikeId, photoId });

    upsertLocalGarageBikeRecord(bikeId, (bike) => {
      const nextPhotos = (bike.photos ?? []).map((photo) => ({
        ...photo,
        isCover: photo.id === photoId,
      }));

      return {
        ...bike,
        heroImageUrl: coverPhoto.imageUrl,
        coverPhotoId: coverPhoto.id,
        photoCount: nextPhotos.length,
        photos: nextPhotos,
      };
    });
  } catch (error) {
    console.error("Failed to persist bike cover photo", error);
    setSaveStepMessage("We couldn't update the bike cover right now.");
  }
};

const handleUploadGarageBuildPhotos = async (buildId: string, files: FileList | null) => {
  if (!files || files.length === 0) {
    return;
  }

  if (!isSignedIn) {
    setSaveStepMessage("Sign in to add saved-build photos.");
    return;
  }

  try {
    const uploadedPhotos: SavedBuildPhoto[] = [];

    for (const file of Array.from(files)) {
      const uploadedPhoto = await uploadGarageBuildPhoto({
        buildId,
        file,
        caption: file.name,
      });

      if (uploadedPhoto) {
        uploadedPhotos.push(uploadedPhoto);
      }
    }

    if (uploadedPhotos.length > 0) {
      setSavedBuildPhotosByBuildId((prev) => {
        const existingPhotos = prev[buildId] ?? [];
        return {
          ...prev,
          [buildId]: [...existingPhotos, ...uploadedPhotos]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((photo, index) => ({
              ...photo,
              sortOrder: index,
              isCover: existingPhotos.length === 0 ? index === 0 || photo.isCover : photo.isCover,
            })),
        };
      });
      if (myGarageView.level === "build" && myGarageView.buildId !== buildId) {
        setMyGarageView({
          level: "build",
          bikeId:
            myGarageBikes.find((bike) => bike.builds.some((build) => build.id === buildId))?.id ??
            myGarageView.bikeId,
          buildId,
        });
      }
      setSaveStepMessage(`Uploaded ${uploadedPhotos.length} saved-build photo${uploadedPhotos.length === 1 ? "" : "s"}.`);
    }
  } catch (error) {
    console.error("Failed to upload saved-build photos", error);
    setSaveStepMessage("We couldn't upload those saved-build photos right now.");
  }
};

const handleDeleteGarageBuildPhoto = async (buildId: string, photoId: string) => {
  const build = myGarageBikes.flatMap((bike) => bike.builds).find((entry) => entry.id === buildId) ?? null;

  if (!build) {
    setSaveStepMessage("That photo could not be deleted.");
    return;
  }

  if (!isSignedIn) {
    setSaveStepMessage("Sign in to manage saved-build photos.");
    return;
  }

  try {
    await deleteGarageBuildPhoto({ buildId, photoId });
  } catch (error) {
    console.error("Failed to delete saved-build photo", error);
    setSaveStepMessage("We couldn't delete that saved-build photo right now.");
    return;
  }

  setSavedBuildPhotosByBuildId((prev) => {
    const existingPhotos = prev[buildId] ?? build.photos ?? [];
    const remainingPhotos = existingPhotos
      .filter((photo) => photo.id !== photoId)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((photo, index) => ({
        ...photo,
        sortOrder: index,
        isCover: index === 0,
      }));

    return {
      ...prev,
      [buildId]: remainingPhotos,
    };
  });
  setSaveStepMessage("Saved-build photo deleted.");
};

const deleteGarageBuildConfirmed = async (buildId: string) => {
  const sourceBuild = myGarageBikes.flatMap((bike) => bike.builds).find((build) => build.id === buildId);

  if (!sourceBuild) {
    setSaveStepMessage("That build could not be deleted.");
    return;
  }

  if (!isSignedIn) {
    setSaveStepMessage("Sign in to manage saved builds.");
    return;
  }

  try {
    await deleteGarageBuild(buildId);
  } catch (error) {
    console.error("Failed to delete saved build", error);
    setSaveStepMessage("We couldn't delete that saved build right now.");
    return;
  }

  setGarageBuildsByBike((prev) => ({
    ...prev,
    [sourceBuild.bikeId]: (prev[sourceBuild.bikeId] ?? []).filter((build) => build.id !== buildId),
  }));
  setSavedBuildPhotosByBuildId((prev) => {
    if (!prev[buildId]) {
      return prev;
    }

    const next = { ...prev };
    delete next[buildId];
    return next;
  });
  setGarageBuildMetadataById((prev) => {
    if (!prev[buildId]) {
      return prev;
    }

    const next = { ...prev };
    delete next[buildId];
    return next;
  });
  setWorkingGarageBuildSourceByBike((prev) =>
    prev[sourceBuild.bikeId]?.buildId === buildId
      ? {
          ...prev,
          [sourceBuild.bikeId]: null,
        }
      : prev
  );
  if (activeWorkingGarageSourceBuild?.id === buildId) {
    setGarageBuildSaveMode("save-as-new");
    setGarageBuildCompareReferenceId(null);
  }
  setMyGarageView({ level: "overview" });
  if (garageBuildCompareReferenceId === buildId) {
    setGarageBuildCompareReferenceId(null);
  }
  setSaveStepMessage("Saved build deleted.");
};

const handleDeleteGarageBuild = (buildId: string) => {
  const sourceBuild = myGarageBikes.flatMap((bike) => bike.builds).find((build) => build.id === buildId);

  if (!sourceBuild) {
    setSaveStepMessage("That build could not be deleted.");
    return;
  }

  setGarageDeleteDialogState({
    type: "build",
    id: sourceBuild.id,
    title: "Delete saved build?",
    message: `Delete ${sourceBuild.name}? This removes only the saved build and keeps the bike in Garage.`,
    confirmLabel: "Delete build",
  });
};

const deleteGarageBikeConfirmed = async (bikeId: string) => {
  const bike = myGarageBikes.find((item) => item.id === bikeId) ?? null;

  if (!bike) {
    setSaveStepMessage("That bike could not be deleted.");
    return;
  }

  if (!isSignedIn) {
    setSaveStepMessage("Sign in to manage Garage bikes.");
    return;
  }

  try {
    await deleteGarageBike(bikeId);
  } catch (error) {
    console.error("Failed to delete garage bike", error);
    setSaveStepMessage("We couldn't delete that bike right now.");
    return;
  }

  const buildIds = (garageBuildsByBike[bikeId] ?? []).map((build) => build.id);

  setLocalGarageBikes((prev) => prev.filter((item) => item.id !== bikeId));
  setGarageBikeMetaById((prev) => {
    const next = { ...prev };
    delete next[bikeId];
    return next;
  });
  setGarageBuildsByBike((prev) => {
    const next = { ...prev };
    delete next[bikeId];
    return next;
  });
  setBikeBuilds((prev) => {
    if (!prev[bikeId]) return prev;
    const next = { ...prev };
    delete next[bikeId];
    return next;
  });
  setDirtyBuilds((prev) => {
    if (!prev[bikeId]) return prev;
    const next = { ...prev };
    delete next[bikeId];
    return next;
  });
  setWorkingGarageBuildSourceByBike((prev) => {
    if (!(bikeId in prev)) return prev;
    const next = { ...prev };
    delete next[bikeId];
    return next;
  });
  setSavedBuildPhotosByBuildId((prev) => {
    const next = { ...prev };
    buildIds.forEach((buildIdToRemove) => {
      delete next[buildIdToRemove];
    });
    return next;
  });
  setGarageBuildMetadataById((prev) => {
    const next = { ...prev };
    buildIds.forEach((buildIdToRemove) => {
      delete next[buildIdToRemove];
    });
    return next;
  });
  if (buildIds.includes(activeWorkingGarageSourceBuild?.id ?? "")) {
    setGarageBuildSaveMode("save-as-new");
    setGarageBuildCompareReferenceId(null);
  }
  if (buildIds.includes(garageBuildCompareReferenceId ?? "")) {
    setGarageBuildCompareReferenceId(null);
  }

  if (selectedBikeId === bikeId) {
    setSelectedBikeId("");
  }
  if (activeBuildBikeId === bikeId) {
    setActiveBuildBikeId("");
  }

  setMyGarageView({ level: "overview" });
  setSaveStepMessage("Bike and its saved content were deleted.");
};

const handleDeleteGarageBike = (bikeId: string) => {
  const bike = myGarageBikes.find((item) => item.id === bikeId) ?? null;

  if (!bike) {
    setSaveStepMessage("That bike could not be deleted.");
    return;
  }

  setGarageDeleteDialogState({
    type: "bike",
    id: bike.id,
    title: "Delete bike?",
    message: `Delete ${getGarageBikeDisplayName(bike)} and all of its saved builds and bike photos from Garage?`,
    confirmLabel: "Delete bike",
  });
};

const handleConfirmGarageDelete = async () => {
  if (!garageDeleteDialogState) {
    return;
  }

  setIsDeletingGarageItem(true);

  try {
    if (garageDeleteDialogState.type === "build") {
      await deleteGarageBuildConfirmed(garageDeleteDialogState.id);
    } else {
      await deleteGarageBikeConfirmed(garageDeleteDialogState.id);
    }
    setGarageDeleteDialogState(null);
  } finally {
    setIsDeletingGarageItem(false);
  }
};

const handleRenameGarageBuild = (buildId: string) => {
  const sourceBuild = myGarageBikes.flatMap((bike) => bike.builds).find((build) => build.id === buildId);

  if (!sourceBuild) {
    setSaveStepMessage("That build could not be renamed.");
    return;
  }

  setRenameBuildDialogState({
    buildId: sourceBuild.id,
    value: sourceBuild.name,
  });
  setRenameBuildDialogError("");
  setIsRenamingBuildDialog(false);
};

const handleConfirmRenameGarageBuild = async () => {
  if (!renameBuildDialogState) return;

  const sourceBuild =
    myGarageBikes
      .flatMap((bike) => bike.builds)
      .find((build) => build.id === renameBuildDialogState.buildId) ?? null;

  if (!sourceBuild) {
    setRenameBuildDialogError("That build could not be renamed.");
    return;
  }

  const trimmedName = renameBuildDialogState.value.trim();

  if (!trimmedName) {
    setRenameBuildDialogError("Build name cannot be empty.");
    return;
  }

  if (trimmedName === sourceBuild.name) {
    setRenameBuildDialogState(null);
    return;
  }

  const renamedAt = new Date().toISOString();
  const updatedBuilds = (garageBuildsByBike[sourceBuild.bikeId] ?? []).map((build) =>
    build.id === sourceBuild.id
      ? {
          ...build,
          name: trimmedName,
          updatedAt: renamedAt,
        }
      : build
  );
  const renamedBuild = updatedBuilds.find((build) => build.id === sourceBuild.id) ?? null;

  if (!renamedBuild) {
    setRenameBuildDialogError("That build could not be renamed.");
    return;
  }

  const renameHistoryEvent: GarageBuildHistoryEvent = {
    id: `updated:${renamedAt}:rename`,
    type: "updated",
    at: renamedAt,
    summary: `Renamed to ${trimmedName}`,
    sourceBuildId: sourceBuild.id,
    sourceBuildName: sourceBuild.name,
    mergeSourceTitle: null,
  };
  const renamedBuildWithMetadata = applyGarageBuildMetadata(
    {
      ...renamedBuild,
      history: [
        ...(renamedBuild.history ?? []),
        renameHistoryEvent,
      ].slice(-6),
      provenance: renamedBuild.provenance
        ? {
            ...renamedBuild.provenance,
            updatedAt: renamedAt,
          }
        : renamedBuild.provenance,
    },
    null
  );

  setRenameBuildDialogError("");
  setIsRenamingBuildDialog(true);

  try {
    await persistGarageBuildSnapshot(renamedBuildWithMetadata, {
      skipBikePersist: true,
    });

    setGarageBuildsByBike((prev) => ({
      ...prev,
      [sourceBuild.bikeId]: updatedBuilds,
    }));
    upsertGarageBuildMetadataRecord(renamedBuildWithMetadata);
    setSaveStepMessage("Build renamed.");
    setRenameBuildDialogState(null);
  } catch (error) {
    const safeError = getSafePersistErrorDetails(error);

    if (safeError && !isBenignRemoteSyncPersistError(safeError)) {
      console.error("Failed to persist build rename", safeError);
    }

    setRenameBuildDialogError("We couldn't rename that build right now.");
  } finally {
    setIsRenamingBuildDialog(false);
  }
};

const handleDuplicateGarageBuild = async (buildId: string) => {
  const sourceBuild = selectedGarageBuild?.id === buildId
    ? selectedGarageBuild
    : myGarageBikes.flatMap((bike) => bike.builds).find((build) => build.id === buildId);

  if (!sourceBuild) {
    setSaveStepMessage("That build could not be duplicated.");
    return;
  }

  const duplicatedAt = new Date().toISOString();
  const duplicateId = `${sourceBuild.id}-copy-${Date.now()}`;
  const duplicateProducts = sourceBuild.buildItems.map((item) => item.product);
  const duplicateItems = createGarageBuildItems(duplicateId, duplicateProducts, duplicatedAt);
  const duplicateName = getSuggestedGarageBuildName({
    bike: garageBikeCatalog.find((bike) => bike.id === sourceBuild.bikeId) ?? null,
    currentNameInput: "",
    existingBuilds: getBuildsForBike(sourceBuild.bikeId),
    mergeSummary: sourceBuild.provenance?.latestMerge ?? null,
    saveMode: "duplicate-build",
    sourceBuild,
  });
  const duplicateBuild = applyGarageBuildMetadata(
    createGarageBuildRecord({
      id: duplicateId,
      bikeId: sourceBuild.bikeId,
      name: duplicateName,
      status: sourceBuild.status,
      buildType: sourceBuild.buildType,
      isPrimary: false,
      notes: sourceBuild.notes ?? null,
      createdAt: duplicatedAt,
      updatedAt: duplicatedAt,
      buildItems: duplicateItems,
      productGroups: groupGarageBuildProductsByCategory(duplicateProducts, categories),
    }),
    createGarageBuildMetadata({
      buildId: duplicateId,
      buildName: duplicateName,
      bike: garageBikeCatalog.find((bike) => bike.id === sourceBuild.bikeId) ?? null,
      existingBuilds: getBuildsForBike(sourceBuild.bikeId),
      mergeSummary: sourceBuild.provenance?.latestMerge ?? null,
      now: duplicatedAt,
      saveMode: "duplicate-build",
      sourceBuild,
    })
  );

  setGarageBuildsByBike((prev) => ({
    ...prev,
    [sourceBuild.bikeId]: [duplicateBuild, ...(prev[sourceBuild.bikeId] ?? [])],
  }));
  upsertGarageBuildMetadataRecord(duplicateBuild);

  setMyGarageView({ level: "overview" });

  setSaveStepMessage("Build duplicated.");

  try {
    await persistGarageBuildSnapshot(duplicateBuild);
  } catch (error) {
    console.error("Failed to persist duplicated build", error);
    setSaveStepMessage("We couldn't duplicate that build right now.");
  }
};

const loadGarageBuildIntoWorkingState = (
  buildId: string
): GarageBuildRecord | null => {
  const sourceBuild = allGarageBuildsById[buildId] ?? null;

  if (!sourceBuild) {
    return null;
  }

  const bikeId = sourceBuild.bikeId;
  const buildProducts = sourceBuild.buildItems.map((item) => item.product);

  setSelectedGarageResumeBuildId(sourceBuild.id);
  setActiveBuildBikeId(bikeId);
  setBikeBuilds((prev) => ({
    ...prev,
    [bikeId]: buildProducts,
  }));
  setDirtyBuilds((prev) => ({
    ...prev,
    [bikeId]: false,
  }));
  setWorkingGarageBuildSourceByBike((prev) => ({
    ...prev,
    [bikeId]: {
      buildId: sourceBuild.id,
      buildName: sourceBuild.name,
    },
  }));
  setMergeLatestEventByBike((prev) => {
    const latestMerge = sourceBuild.provenance?.latestMerge;

    if (!latestMerge) {
      if (!prev[bikeId]) {
        return prev;
      }

      const nextEvents = { ...prev };
      delete nextEvents[bikeId];
      return nextEvents;
    }

    return {
      ...prev,
      [bikeId]: {
        id: `${bikeId}:${latestMerge.sourceBuildId}:${latestMerge.appliedAt}`,
        bikeId,
        sourceBuildId: latestMerge.sourceBuildId,
        sourceBuildTitle: latestMerge.sourceBuildTitle,
        appliedAt: latestMerge.appliedAt,
        mergeMode: latestMerge.mergeMode as ExpertBuildApplyMode,
        additions: latestMerge.additions,
        replacements: latestMerge.replacements,
        affectedCategories: latestMerge.affectedCategories,
        impactSummary: latestMerge.impactSummary,
        restoreAvailable: false,
      },
    };
  });
  const sourceBike = myGarageBikes.find((bike) => bike.id === bikeId) ?? null;

  if (sourceBike) {
    setGarageBikeNameInput(getGarageBikeDisplayName(sourceBike));
    setHasEditedGarageBikeName(false);
  }

  return sourceBuild;
};

const openGarageBuildInWorkspaceInternal = (buildId: string) => {
  const sourceBuild = loadGarageBuildIntoWorkingState(buildId);

  if (!sourceBuild) {
    setSaveStepMessage("That build could not be opened in Build.");
    return;
  }

  setBuildNameInput(sourceBuild.name);
  setGarageBuildSaveMode("update-existing");
  setGarageBuildCompareReferenceId(null);
  setSaveStepMessage("");
  setSaveMessage(`Opened ${sourceBuild.name} in the Build workspace.`);
  setActiveStep("Build");
};

const handleOpenGarageBuildInWorkspace = (buildId: string) => {
  if (activeWorkingGarageSourceBuild?.id === buildId) {
    openGarageBuildInWorkspaceInternal(buildId);
    return;
  }

  promptForSavedBuildContextReplacement(() => openGarageBuildInWorkspaceInternal(buildId), {
    title: "Open another saved build?",
    message:
      "You have unsaved changes to the saved build you are editing. Save them before opening another saved build in Build, or discard them and continue.",
  });
};

const compareGarageBuildInternal = (buildId: string) => {
  const previousWorkingBuild = activeWorkingGarageSourceBuild;
  const candidateBuild = allGarageBuildsById[buildId] ?? null;

  if (!candidateBuild) {
    setSaveStepMessage("That build could not be opened for comparison.");
    return;
  }

  const hasCompareReference =
    !!candidateBuild.lineage?.parentBuildId ||
    !!(previousWorkingBuild && previousWorkingBuild.id !== candidateBuild.id);

  if (!hasCompareReference) {
    setSaveStepMessage(
      "To compare this build, return one saved build to Build first. If this build has an earlier saved version, Compare Builds can use that parent automatically."
    );
    return;
  }

  const sourceBuild = loadGarageBuildIntoWorkingState(buildId);

  if (!sourceBuild) {
    setSaveStepMessage("That build could not be opened for comparison.");
    return;
  }

  const compareReference =
    (sourceBuild.lineage?.parentBuildId
      ? allGarageBuildsById[sourceBuild.lineage.parentBuildId] ?? null
      : null) ??
    (previousWorkingBuild && previousWorkingBuild.id !== sourceBuild.id
      ? previousWorkingBuild
      : null);

  setGarageBuildCompareReferenceId(compareReference?.id ?? null);
  setSaveMessage("");
  setActiveStep("Compare");
  setSaveStepMessage(`Loaded ${sourceBuild.name} into the comparison flow.`);
};

const handleCompareGarageBuild = (buildId: string) => {
  if (activeWorkingGarageSourceBuild?.id === buildId) {
    compareGarageBuildInternal(buildId);
    return;
  }

  promptForSavedBuildContextReplacement(() => compareGarageBuildInternal(buildId), {
    title: "Switch comparison build?",
    message:
      "You have unsaved changes to the saved build you are editing. Save them before loading another saved build into Compare Builds, or discard them and continue.",
  });
};

const handleArchiveGarageBuild = async (_buildId: string) => {
  const sourceBuild = myGarageBikes.flatMap((bike) => bike.builds).find((build) => build.id === _buildId);

  if (!sourceBuild) {
    setSaveStepMessage("That build could not be archived.");
    return;
  }

  const remainingActiveBuilds = (garageBuildsByBike[sourceBuild.bikeId] ?? []).filter(
    (build) => build.id !== _buildId && build.status !== "Archived"
  );
  const fallbackPrimaryId = sourceBuild.isPrimary ? remainingActiveBuilds[0]?.id ?? null : null;

  const archivedAt = new Date().toISOString();
  const updatedBuilds: GarageBuildRecord[] = (garageBuildsByBike[sourceBuild.bikeId] ?? []).map((build) => {
      if (build.id === _buildId) {
        return {
          ...build,
          status: "Archived" as const,
          isPrimary: false,
          updatedAt: archivedAt,
        };
      }

      if (fallbackPrimaryId && build.id === fallbackPrimaryId) {
        return {
          ...build,
          isPrimary: true,
          updatedAt: archivedAt,
        };
      }

      return build;
    });

  setGarageBuildsByBike((prev) => ({
    ...prev,
    [sourceBuild.bikeId]: updatedBuilds,
  }));

  setMyGarageView({ level: "overview" });
  setSaveStepMessage("Build archived.");

  try {
    const archivedBuild = updatedBuilds.find((build) => build.id === _buildId);
    const fallbackPrimaryBuild = fallbackPrimaryId
      ? updatedBuilds.find((build) => build.id === fallbackPrimaryId) ?? null
      : null;

    if (archivedBuild) {
      await persistGarageBuildSnapshot(archivedBuild);
    }

    if (fallbackPrimaryBuild) {
      await persistGarageBuildSnapshot(fallbackPrimaryBuild);
    }
  } catch (error) {
    console.error("Failed to persist build archive", error);
    setSaveStepMessage("We couldn't archive that build right now.");
  }
};

const handleSetPrimaryGarageBuild = async (bikeId: string, buildId: string) => {
  const promotedAt = new Date().toISOString();
  const updatedBuilds: GarageBuildRecord[] = (garageBuildsByBike[bikeId] ?? []).map((build) => ({
    ...build,
    isPrimary: build.id === buildId && build.status !== "Archived",
    updatedAt: build.id === buildId ? promotedAt : build.updatedAt,
  }));

  setGarageBuildsByBike((prev) => ({
    ...prev,
    [bikeId]: updatedBuilds,
  }));
  setSaveStepMessage("Primary build updated for this bike.");

  try {
    for (const build of updatedBuilds) {
      if (build.id === buildId || build.isPrimary === false) {
        await persistGarageBuildSnapshot(build);
      }
    }
  } catch (error) {
    console.error("Failed to persist primary build update", error);
    setSaveStepMessage("We couldn't update the primary build right now.");
  }
};

const garageStepShellCopy: Record<GarageStepId, { title: string; subtitle: string }> = {
  Bike: {
    title: "Bike",
    subtitle:
      "Lock in the right bike first, then move into a cleaner build flow.",
  },
  Build: {
    title: "Build",
    subtitle:
      "Browse compatible accessories, add the right pieces, and keep your build moving.",
  },
  Expert: {
    title: "Expert",
    subtitle:
      "Explore curated inspiration for this bike, then borrow what fits your direction.",
  },
  Compare: {
    title: "Compare",
    subtitle:
      "Review differences without the noise so the next change feels obvious.",
  },
  Save: {
    title: "Saved",
    subtitle:
      "Name the build, keep confidence high, and manage saved versions without clutter.",
  },
  Buy: {
    title: "Shop",
    subtitle:
      "Browse compatible accessories, inspect fit, and head to supplier links when you are ready.",
  },
};

const activeShellCopy = garageStepShellCopy[activeStep];
const isPhone = viewportWidth !== null ? viewportWidth < 768 : true;
const isTablet =
  viewportWidth !== null ? viewportWidth >= 768 && viewportWidth < 1100 : false;
const isDesktop = viewportWidth !== null ? viewportWidth >= 1100 : false;
const isCompactGarageShell = !isDesktop;
const buildViewModeResolved = isPhone ? "list" : buildViewMode;

return (
   <main
   style={{
      minHeight: "100vh",
      background:
        "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(243,244,246,1) 100%)",
      padding: isPhone ? "0 0 40px" : "0 20px 48px",
    }}
  >
<GarageStepNav
  activeShellCopy={activeShellCopy}
  activeStep={activeStep}
  isCheckingSession={isCheckingSession}
  isCompactGarageShell={isCompactGarageShell}
  isPhone={isPhone}
  isSignedIn={isSignedIn}
  onBackHome={() => router.push("/")}
  onSignIn={handleSignIn}
  onSignOut={handleSignOut}
  selectedBikeId={selectedBikeId || activeBuildBikeId}
  setActiveStep={setActiveStep}
  signedInUserEmail={signedInUserEmail}
/>

{activeStep === "Bike" && (
  <GarageBikeStep
    bikeStepFilteredBikeOptions={bikeStepFilteredBikeOptions}
    bikeStepHelperText={bikeStepHelperText}
    compatibleCount={compatibleCount}
    garageResumeEntries={garageResumeEntries}
    getBikeOptionLabel={getBikeOptionLabel}
    heroImage={heroImage}
    isBikeStepBlankState={isBikeStepBlankState}
    isDesktop={isDesktop}
    isPhone={isPhone}
    isSelectedBikeSavedGarageBike={isSelectedBikeSavedGarageBike}
    makeOptions={makeOptions}
    modelOptions={modelOptions}
    onClearBikeSelection={handleClearBikeSelection}
    onContinueToBuild={() => {
      if (!selectedBikeId) return;

      setGarageBuildCompareReferenceId(null);
      setSaveMessage("");
      setSaveStepMessage("");

      const preferredSavedBuild = getPreferredGarageBuildForBike({
        garageBikes: myGarageBikes,
        selectedBikeId,
        preferredBuildId: selectedGarageResumeBuildId || null,
      });

      if (preferredSavedBuild) {
        openGarageBuildInWorkspaceInternal(preferredSavedBuild.id);
        return;
      }

      initializeFreshWorkingBuildForBike(selectedBikeId);
      setActiveBuildBikeId(selectedBikeId);
      setActiveStep("Build");
    }}
    onSelectGarageResumeEntry={handleSelectGarageResumeEntry}
    onSelectMake={(value) => {
      setSelectedMake(value);
      if (value !== selectedMake) {
        setSelectedBikeId("");
        setSelectedGarageResumeBuildId("");
        setSelectedSeries("");
        setSelectedModel("");
        setSelectedYear("");
      }
    }}
    onSelectModel={(value) => {
      setSelectedModel(value);
      if (value !== selectedModel) {
        setSelectedBikeId("");
        setSelectedGarageResumeBuildId("");
        setSelectedYear("");
      }
    }}
    onSelectSeries={(value) => {
      setSelectedSeries(value);
      if (value !== selectedSeries) {
        setSelectedBikeId("");
        setSelectedGarageResumeBuildId("");
        setSelectedModel("");
        setSelectedYear("");
      }
    }}
    onSelectTemplateBike={handleSelectTemplateBike}
    onSelectYear={(value) => {
      if (value !== selectedYear) {
        setSelectedBikeId("");
        setSelectedGarageResumeBuildId("");
      }
      setSelectedYear(value);
    }}
    previewBike={bikeStepPreviewBike}
    isSelectionInProgress={isBikeSelectionInProgress}
    selectedBike={selectedBike}
    selectedBikeCardId={bikeStepSelectedCardId}
    selectedBikeId={selectedBikeId}
    selectedMake={selectedMake}
    selectedModel={selectedModel}
    selectedSeries={selectedSeries}
    selectedYear={selectedYear}
    seriesOptions={seriesOptions}
    yearOptions={yearOptions}
  />
)}
{activeStep === "Build" && (
  !activeBuildBikeId ? (
    <GarageStepShell isPhone={isPhone}>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
        }}
      >
        <h2 style={{ margin: "0 0 10px", fontSize: 30, color: "#0f172a" }}>
          Start a build
        </h2>
        <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6, maxWidth: 720 }}>
          Choose a bike and press Continue to Build, or return to Build from a saved build to start working here.
        </p>
      </div>
    </GarageStepShell>
  ) : (
    <GarageBuildStep
      activeCompatibilityBikeId={activeCompatibilityBikeId}
      activeWorkingGarageBuildSource={activeWorkingGarageBuildSource}
      buildNameInput={buildNameInput}
      buildProducts={buildProducts}
      buildSortOption={buildSortOption}
      buildViewMode={buildViewMode}
      buildViewModeResolved={buildViewModeResolved}
      canOpenBuildSaveDialog={canOpenBuildSaveDialog}
      categories={categories}
      compatibleCount={compatibleCount}
      currentBike={currentBike}
      currentGarageBikeLabel={currentGarageBikeLabel}
      formatBuildWorkspacePriceLabel={formatBuildWorkspacePriceLabel}
      formatCurrency={formatCurrency}
      getCompatibilityLabel={getCompatibilityLabel}
      getGarageNoticeTone={getGarageNoticeTone}
      getProductSupplierName={getProductSupplierName}
      hasUnsavedGarageBuildChanges={hasUnsavedGarageBuildChanges}
      isDesktop={isDesktop}
      isEditingSavedGarageBuild={isEditingSavedGarageBuild}
      isPhone={isPhone}
      onAddToBuild={addToBuild}
      onBuildSortOptionChange={setBuildSortOption}
      onBuildViewModeChange={setBuildViewMode}
      onGoToBike={() => setActiveStep("Bike")}
      onGoToExpert={() => setActiveStep("Expert")}
      onGoToSave={() => setActiveStep("Save")}
      onOnlyCompatibleChange={setOnlyCompatible}
      onOpenBuildSaveDialog={handleOpenBuildSaveDialog}
      onOpenDuplicateBuildSaveDialog={handleOpenDuplicateBuildSaveDialog}
      onOpenProductDetail={setActiveProductDetail}
      onOpenProductPurchase={handleOpenProductPurchase}
      onRemoveFromBuild={removeFromBuild}
      onResetFilters={() => {
        setSearchTerm("");
        setSelectedCategory("all");
        setShowExactFitOnly(false);
        setOnlyCompatible(true);
      }}
      onSearchTermChange={(value) => {
        setSearchTerm(value);
        const matchedCategory = categories.find((cat) =>
          cat.label.toLowerCase().includes(value.toLowerCase())
        );
        if (matchedCategory) {
          setSelectedCategory(matchedCategory.id);
        }
      }}
      onSelectCategory={setSelectedCategory}
      onShowExactFitOnlyChange={setShowExactFitOnly}
      onlyCompatible={onlyCompatible}
      saveMessage={saveMessage}
      searchTerm={searchTerm}
      selectedCategory={selectedCategory}
      selectedProducts={selectedProducts}
      selectedProductsCommerceSummary={selectedProductsCommerceSummary}
      showExactFitOnly={showExactFitOnly}
    />
  )
)}
<GarageProductDetailModal
  compatibilityLabel={
    activeProductDetail
      ? getCompatibilityLabel(activeProductDetail, activeCompatibilityBikeId || "")
      : null
  }
  commerce={activeProductCommerce}
  formatCurrency={formatCurrency}
  inBuild={!!activeProductDetail && selectedProducts.some((item) => item.id === activeProductDetail.id)}
  isOpen={!!activeProductDetail && activeStep !== "Buy"}
  onClose={() => setActiveProductDetail(null)}
  onOpenPurchase={() => {
    if (!activeProductDetail) return;
    handleOpenProductPurchase({
      product: activeProductDetail,
      sourceContext: "product-detail",
    });
  }}
  onToggleBuild={() => {
    if (!activeProductDetail) return;
    const alreadyAdded = selectedProducts.some((item) => item.id === activeProductDetail.id);
    if (alreadyAdded) {
      removeFromBuild(activeProductDetail.id);
      return;
    }
    addToBuild(activeProductDetail);
  }}
  product={activeProductDetail}
  productCategoryLabel={activeProductDetail ? getCategoryLabel(activeProductDetail.categoryId) : "Category"}
  productSupplierName={activeProductDetail ? getProductSupplierName(activeProductDetail) : "Supplier to be confirmed"}
/>

{activeStep === "Expert" && (
  <ExpertBuildsStep
    currentBike={currentBike}
    expertBuildPurposeFilter={expertBuildPurposeFilter}
    expertBuilds={expertBuildOptions}
    onChangePurposeFilter={setExpertBuildPurposeFilter}
    onCompareExpertBuild={handleCompareExpertBuild}
    onOpenPurchase={handleOpenExpertBuildPurchase}
    onSelectExpertBuild={setSelectedExpertBuildId}
    selectedExpertBuild={selectedExpertBuild}
    selectedProducts={selectedProducts}
  />
  )}

{activePurchaseState && (
  <ProductPurchaseOptions
    commerce={activePurchaseState.commerce}
    sourceContext={activePurchaseState.sourceContext}
    onClose={() => setActivePurchaseState(null)}
    onTrackOutbound={handleTrackCommerceOutbound}
  />
)}

{activeStep === "Compare" && (
  <CompareBuildsStep
    activeCompareFilter={activeCompareFilter}
    activeCompareFilterMeta={activeCompareFilterMeta}
    addToBuild={addToBuild}
    compareCategorySections={compareCategorySections}
    compareFilterCounts={compareFilterCounts}
    currentBike={currentBike ?? undefined}
    filteredCompareCategorySections={filteredCompareCategorySections}
    formatCurrency={formatCurrency}
    getProductSupplierName={getProductSupplierName}
    isBuildDirty={isBuildDirty}
    onChangeExpertBuild={() => setActiveStep("Expert")}
    onFilterChange={setActiveCompareFilter}
    onOpenProductDetail={setActiveProductDetail}
    onOpenProductPurchase={handleOpenProductPurchase}
    onSaveBuild={handleSaveBuild}
    selectedExpertBuild={selectedExpertBuild}
    selectedProducts={selectedProducts}
  />
)}


{garageDeleteDialogState && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.45)",
      display: "grid",
      placeItems: "center",
      padding: 20,
      zIndex: 80,
    }}
  >
    <div
      style={{
        width: "min(100%, 520px)",
        background: "#ffffff",
        borderRadius: 22,
        border: "1px solid #e5e7eb",
        boxShadow: "0 24px 48px rgba(15,23,42,0.22)",
        padding: 22,
        display: "grid",
        gap: 16,
      }}
    >
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: "#64748b" }}>
          Garage
        </div>
        <h3 style={{ margin: 0, fontSize: 24, color: "#0f172a", lineHeight: 1.1 }}>
          {garageDeleteDialogState.title}
        </h3>
        <p style={{ margin: 0, color: "#64748b", lineHeight: 1.55 }}>
          {garageDeleteDialogState.message}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={() => setGarageDeleteDialogState(null)}
          disabled={isDeletingGarageItem}
          style={{
            minHeight: 44,
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontWeight: 700,
            cursor: isDeletingGarageItem ? "not-allowed" : "pointer",
            opacity: isDeletingGarageItem ? 0.6 : 1,
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirmGarageDelete}
          disabled={isDeletingGarageItem}
          style={{
            minHeight: 44,
            padding: "10px 16px",
            borderRadius: 14,
            border: "1px solid #fecaca",
            background: isDeletingGarageItem ? "#fca5a5" : "#b91c1c",
            color: "#ffffff",
            fontWeight: 800,
            cursor: isDeletingGarageItem ? "not-allowed" : "pointer",
            boxShadow: isDeletingGarageItem ? "none" : "0 12px 24px rgba(185,28,28,0.18)",
          }}
        >
          {isDeletingGarageItem ? "Deleting..." : garageDeleteDialogState.confirmLabel}
        </button>
      </div>
    </div>
  </div>
)}

{savedBuildGuardDialogState && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.45)",
      display: "grid",
      placeItems: "center",
      padding: 20,
      zIndex: 80,
    }}
  >
    <div
      style={{
        width: "min(100%, 520px)",
        background: "#ffffff",
        borderRadius: 22,
        border: "1px solid #e5e7eb",
        boxShadow: "0 24px 48px rgba(15,23,42,0.22)",
        padding: 22,
        display: "grid",
        gap: 16,
      }}
    >
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: "#64748b" }}>
          Unsaved changes
        </div>
        <h3 style={{ margin: 0, fontSize: 24, color: "#0f172a", lineHeight: 1.1 }}>
          {savedBuildGuardDialogState.title}
        </h3>
        <p style={{ margin: 0, color: "#64748b", lineHeight: 1.55 }}>
          {savedBuildGuardDialogState.message}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={closeSavedBuildGuardDialog}
          disabled={isResolvingSavedBuildGuard}
          style={{
            minHeight: 44,
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontWeight: 700,
            cursor: isResolvingSavedBuildGuard ? "not-allowed" : "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDiscardSavedBuildGuardChanges}
          disabled={isResolvingSavedBuildGuard}
          style={{
            minHeight: 44,
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid #fecaca",
            background: "#fff1f2",
            color: "#b91c1c",
            fontWeight: 700,
            cursor: isResolvingSavedBuildGuard ? "not-allowed" : "pointer",
          }}
        >
          Discard changes
        </button>
        <button
          type="button"
          onClick={handleSaveAndContinueSavedBuildGuard}
          disabled={isResolvingSavedBuildGuard}
          style={{
            minHeight: 44,
            padding: "10px 16px",
            borderRadius: 14,
            border: "none",
            background: isResolvingSavedBuildGuard ? "#94a3b8" : "#0f172a",
            color: "#ffffff",
            fontWeight: 800,
            cursor: isResolvingSavedBuildGuard ? "not-allowed" : "pointer",
            boxShadow: isResolvingSavedBuildGuard ? "none" : "0 12px 24px rgba(15,23,42,0.16)",
          }}
        >
          {isResolvingSavedBuildGuard ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  </div>
)}

{activeStep === "Build" && isBuildSaveDialogOpen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 70,
      background: "rgba(15,23,42,0.44)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
    }}
  >
    <div
      onClick={(event) => event.stopPropagation()}
      style={{
        width: "min(100%, 560px)",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 24,
        boxShadow: "0 28px 70px rgba(15,23,42,0.22)",
        padding: 22,
        display: "grid",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.7,
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            {garageBuildSaveMode === "duplicate-build" ? "Save as new" : "Save Build"}
          </div>
          <h3 style={{ margin: 0, fontSize: 24, color: "#0f172a", lineHeight: 1.1 }}>
            {garageBuildSaveMode === "duplicate-build" ? "Save as a new build" : "Name this build"}
          </h3>
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.55, maxWidth: 420 }}>
            {garageBuildSaveMode === "duplicate-build"
              ? "Create a new saved build from the current setup without overwriting the original."
              : "Save this setup now and manage it later from Saved Builds."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsBuildSaveDialogOpen(false);
            setGarageBuildSaveMode(isEditingSavedGarageBuild ? "update-existing" : "save-as-new");
          }}
          disabled={isSavingBuildSaveDialog}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "1px solid #dbe3ee",
            background: "#ffffff",
            color: "#475569",
            fontSize: 20,
            lineHeight: 1,
            cursor: isSavingBuildSaveDialog ? "not-allowed" : "pointer",
            opacity: isSavingBuildSaveDialog ? 0.6 : 1,
            flexShrink: 0,
          }}
          aria-label="Close save dialog"
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          padding: 14,
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", color: "#475569", fontSize: 12 }}>
          <span>{currentBike ? currentGarageBikeLabel : "No bike selected"}</span>
          <span>{selectedProducts.length} item{selectedProducts.length === 1 ? "" : "s"} selected</span>
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Indicative build total: {formatCurrency(selectedProducts.reduce((total, item) => total + item.price, 0))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Bike name
        </label>
        <input
          type="text"
          value={buildSaveDialogBikeName}
          required
          aria-required="true"
          disabled={isSavingBuildSaveDialog}
          onChange={(e) => {
            setBuildSaveDialogBikeName(e.target.value);
            if (buildSaveDialogError) {
              setBuildSaveDialogError("");
            }
          }}
          placeholder={currentBike ? `${currentBike.make} ${currentBike.model} ${currentBike.year}` : "My Adventure Bike"}
          style={{
            minHeight: 48,
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            fontSize: 14,
            color: "#0f172a",
            outline: "none",
            boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
          }}
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Build name
        </label>
        <input
          type="text"
          value={buildSaveDialogBuildName}
          required
          aria-required="true"
          disabled={isSavingBuildSaveDialog}
          onChange={(e) => {
            setBuildSaveDialogBuildName(e.target.value);
            if (buildSaveDialogError) {
              setBuildSaveDialogError("");
            }
          }}
          placeholder={
            garageBuildSaveMode === "duplicate-build" ? "Name this new build" : "Name this build"
          }
          style={{
            minHeight: 48,
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            fontSize: 14,
            color: "#0f172a",
            outline: "none",
            boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
          }}
        />
      </div>

      {buildSaveDialogError && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            background: getGarageNoticeTone(buildSaveDialogError).background,
            border: `1px solid ${getGarageNoticeTone(buildSaveDialogError).border}`,
            color: getGarageNoticeTone(buildSaveDialogError).color,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {buildSaveDialogError}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, maxWidth: 320 }}>
          Purchases happen on supplier sites. Saved Builds is your library for reopening, comparing, and managing saved setups.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => {
            setIsBuildSaveDialogOpen(false);
            setGarageBuildSaveMode(isEditingSavedGarageBuild ? "update-existing" : "save-as-new");
          }}
          disabled={isSavingBuildSaveDialog}
          style={{
            minHeight: 46,
              padding: "11px 16px",
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#0f172a",
              fontWeight: 700,
              cursor: isSavingBuildSaveDialog ? "not-allowed" : "pointer",
              opacity: isSavingBuildSaveDialog ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
        <button
          type="button"
          onClick={handleSaveBuildCard}
          disabled={!canConfirmBuildSave}
            style={{
              minHeight: 46,
              padding: "11px 18px",
              borderRadius: 14,
              border: "none",
              background: !canConfirmBuildSave ? "#94a3b8" : "#0f172a",
              color: "#ffffff",
              fontWeight: 800,
              cursor: !canConfirmBuildSave ? "not-allowed" : "pointer",
              boxShadow: !canConfirmBuildSave ? "none" : "0 12px 24px rgba(15,23,42,0.16)",
            }}
        >
          {isSavingBuildSaveDialog
            ? "Saving..."
            : garageBuildSaveMode === "duplicate-build"
            ? "Save as new"
            : "Save Build"}
        </button>
        </div>
      </div>
    </div>
  </div>
)}

{activeStep === "Save" && renameBuildDialogState && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 70,
      background: "rgba(15,23,42,0.44)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
    }}
  >
    <div
      style={{
        width: "min(100%, 520px)",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 24,
        boxShadow: "0 28px 70px rgba(15,23,42,0.22)",
        padding: 22,
        display: "grid",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.7,
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Saved Builds
          </div>
          <h3 style={{ margin: 0, fontSize: 24, color: "#0f172a", lineHeight: 1.1 }}>
            Rename build
          </h3>
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.55, maxWidth: 400 }}>
            Update the saved build name. This change is written to your saved record.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRenameBuildDialogState(null)}
          disabled={isRenamingBuildDialog}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "1px solid #dbe3ee",
            background: "#ffffff",
            color: "#475569",
            fontSize: 18,
            lineHeight: 1,
            cursor: isRenamingBuildDialog ? "not-allowed" : "pointer",
            opacity: isRenamingBuildDialog ? 0.6 : 1,
            flexShrink: 0,
          }}
          aria-label="Close rename dialog"
        >
          x
        </button>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Build name
        </label>
        <input
          type="text"
          value={renameBuildDialogState.value}
          disabled={isRenamingBuildDialog}
          onChange={(event) => {
            setRenameBuildDialogState((prev) =>
              prev
                ? {
                    ...prev,
                    value: event.target.value,
                  }
                : prev
            );
            if (renameBuildDialogError) {
              setRenameBuildDialogError("");
            }
          }}
          style={{
            minHeight: 48,
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            fontSize: 14,
            color: "#0f172a",
            outline: "none",
            boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
          }}
        />
      </div>

      {renameBuildDialogError && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            background: getGarageNoticeTone(renameBuildDialogError).background,
            border: `1px solid ${getGarageNoticeTone(renameBuildDialogError).border}`,
            color: getGarageNoticeTone(renameBuildDialogError).color,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {renameBuildDialogError}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setRenameBuildDialogState(null)}
          disabled={isRenamingBuildDialog}
          style={{
            minHeight: 46,
            padding: "11px 16px",
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontWeight: 700,
            cursor: isRenamingBuildDialog ? "not-allowed" : "pointer",
            opacity: isRenamingBuildDialog ? 0.6 : 1,
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirmRenameGarageBuild}
          disabled={isRenamingBuildDialog || renameBuildDialogState.value.trim().length === 0}
          style={{
            minHeight: 46,
            padding: "11px 18px",
            borderRadius: 14,
            border: "none",
            background:
              isRenamingBuildDialog || renameBuildDialogState.value.trim().length === 0
                ? "#94a3b8"
                : "#0f172a",
            color: "#ffffff",
            fontWeight: 800,
            cursor:
              isRenamingBuildDialog || renameBuildDialogState.value.trim().length === 0
                ? "not-allowed"
                : "pointer",
            boxShadow:
              isRenamingBuildDialog || renameBuildDialogState.value.trim().length === 0
                ? "none"
                : "0 12px 24px rgba(15,23,42,0.16)",
          }}
        >
          {isRenamingBuildDialog ? "Saving..." : "Save name"}
        </button>
      </div>
    </div>
  </div>
)}

{activeStep === "Save" && (
  <GarageStepShell isPhone={isPhone}>
    {isCheckingSession ? (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
          color: "#475569",
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        Checking your saved builds...
      </div>
    ) : !isSignedIn ? (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 24,
          padding: 22,
          boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
        }}
      >
        <h2 style={{ margin: "0 0 8px", fontSize: 24, color: "#0f172a" }}>
          Sign in to view your saved builds
        </h2>
        <p style={{ color: "#6b7280", margin: "0 0 18px", maxWidth: 720, lineHeight: 1.55 }}>
          Sign in to keep your named builds connected to your garage and ready to reopen later.
        </p>
        <button
          type="button"
          onClick={handleSignIn}
          style={{
            minHeight: 48,
            padding: "12px 18px",
            borderRadius: 14,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#111827",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
          }}
        >
          Sign in
        </button>
      </div>
    ) : (
      <div
        style={{
          display: "grid",
          gap: 16,
        }}
      >
        {saveStepMessage && (
          <div
            style={{
              background: getGarageNoticeTone(saveStepMessage).background,
              border: `1px solid ${getGarageNoticeTone(saveStepMessage).border}`,
              color: getGarageNoticeTone(saveStepMessage).color,
              padding: "10px 12px",
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {saveStepMessage}
          </div>
        )}
        <GarageScreen
          bikes={myGarageBikes}
          selectedBike={selectedGarageBike}
          selectedBuild={selectedGarageBuild}
          onSwitchBike={handleBackToGarageOverview}
        />
      </div>
    )}
  </GarageStepShell>
)}

{activeStep === "Buy" && (
  <GarageShopStep
    activeProductCommerce={activeProductCommerce}
    activeProductDetail={activeProductDetail}
    buySelectedBike={buyDisplayBike}
    buySelectedBikeBuilds={buySelectedBikeBuilds}
    buySelectedBikeBuildProductIds={buySelectedBikeBuildProductIds}
    buySelectedBikeCommerceSummary={buySelectedBikeCommerceSummary}
    buySelectedBikeId={buySelectedBikeId}
    buySelectedBikeLabel={buySelectedBikeLabel}
    buySelectedBuild={buySelectedBuild}
    buySelectedBuildId={buySelectedBuildId}
    buySelectedBuildProductEntries={buySelectedBuildProductEntries}
    buySelectedBikeProductEntries={buySelectedBikeProductEntries}
    buySelectedBikeTemplateId={buySelectedBikeTemplateId}
    formatAccessoryPriceLabel={formatAccessoryPriceLabel}
    genericBikePlaceholder={genericBikePlaceholder}
    getCategoryLabel={getCategoryLabel}
    getCompatibilityLabel={getCompatibilityLabel}
    getProductSupplierName={getProductSupplierName}
    isPhone={isPhone}
    onAddProductToBikeBuild={addProductToBikeBuild}
    onBackToResults={() => {
      setActiveProductDetail(null);
      setActivePurchaseState(null);
    }}
    onChangeSelectedBuild={(buildId) => {
      setBuySelectedBuildId(buildId);
      setActivePurchaseState(null);
      setActiveProductDetail(null);
    }}
    onOpenProductDetail={(product) => {
      setActiveProductDetail(product);
      setActivePurchaseState(null);
    }}
    onOpenProductPurchase={handleOpenProductPurchase}
    onRemoveProductFromBikeBuild={removeProductFromBikeBuild}
  />
)}
    </main>
);
}

