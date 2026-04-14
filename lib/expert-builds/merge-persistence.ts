import type { Product } from "../../types/garage";
import type {
  ExpertBuildApplyMode,
  ExpertBuildMergeDecision,
  ExpertBuildMergeDraftPersisted,
  ExpertBuildMergeEvent,
} from "./merge";

const EXPERT_BUILD_MERGE_DRAFTS_STORAGE_KEY =
  "accessorise-it.expert-build-merge-drafts.v1";
const EXPERT_BUILD_MERGE_EVENTS_STORAGE_KEY =
  "accessorise-it.expert-build-merge-events.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeNumberArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is number => typeof item === "number");
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

  return {
    id: value.id,
    name: value.name,
    brand: value.brand,
    price: value.price,
    supplierUrl: typeof value.supplierUrl === "string" ? value.supplierUrl : null,
    categoryId: value.categoryId,
    description: value.description,
    image: value.image,
    featuredOrder: value.featuredOrder,
    compatibility: {
      bikeIds: normalizeStringArray(compatibility?.bikeIds),
      universal: compatibility?.universal === true,
    },
  };
}

function normalizeProducts(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<Product[]>((acc, item) => {
    const normalized = normalizeProduct(item);

    if (normalized) {
      acc.push(normalized);
    }

    return acc;
  }, []);
}

function normalizeApplyMode(value: unknown): ExpertBuildApplyMode | null {
  return value === "add-missing-only" ||
    value === "review-all" ||
    value === "category-led"
    ? value
    : null;
}

function normalizeDecision(value: unknown): ExpertBuildMergeDecision | null {
  return value === "already-have" ||
    value === "add" ||
    value === "skip" ||
    value === "replace-existing" ||
    value === "keep-mine" ||
    value === "unresolved"
    ? value
    : null;
}

function normalizeDraftDecisionRecords(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<ExpertBuildMergeDraftPersisted["itemDecisions"]>((acc, item) => {
    if (!isRecord(item) || typeof item.accessoryId !== "string") {
      return acc;
    }

    const decision = normalizeDecision(item.decision);

    if (!decision) {
      return acc;
    }

    acc.push({
      accessoryId: item.accessoryId,
      decision,
      replacementProductIds: normalizeNumberArray(item.replacementProductIds),
    });
    return acc;
  }, []);
}

function normalizePersistedDraft(value: unknown): ExpertBuildMergeDraftPersisted | null {
  if (!isRecord(value)) {
    return null;
  }

  const mode = normalizeApplyMode(value.mode);

  if (
    typeof value.id !== "string" ||
    typeof value.bikeId !== "string" ||
    typeof value.buildId !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    typeof value.snapshotFingerprint !== "string" ||
    !mode
  ) {
    return null;
  }

  return {
    id: value.id,
    bikeId: value.bikeId,
    buildId: value.buildId,
    mode,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    lastSavedAt: typeof value.lastSavedAt === "string" ? value.lastSavedAt : null,
    snapshotFingerprint: value.snapshotFingerprint,
    snapshotProducts: normalizeProducts(value.snapshotProducts),
    itemDecisions: normalizeDraftDecisionRecords(value.itemDecisions),
  };
}

function normalizePersistedDraftMap(value: unknown) {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, ExpertBuildMergeDraftPersisted>>(
    (acc, [key, draftValue]) => {
      const draft = normalizePersistedDraft(draftValue);

      if (draft) {
        acc[key] = draft;
      }

      return acc;
    },
    {}
  );
}

function normalizePersistedEvent(value: unknown): ExpertBuildMergeEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const mergeMode = normalizeApplyMode(value.mergeMode);

  if (
    typeof value.id !== "string" ||
    typeof value.bikeId !== "string" ||
    typeof value.sourceBuildId !== "string" ||
    typeof value.sourceBuildTitle !== "string" ||
    typeof value.appliedAt !== "string" ||
    typeof value.additions !== "number" ||
    typeof value.replacements !== "number" ||
    typeof value.impactSummary !== "string" ||
    typeof value.restoreAvailable !== "boolean" ||
    !mergeMode
  ) {
    return null;
  }

  return {
    id: value.id,
    bikeId: value.bikeId,
    sourceBuildId: value.sourceBuildId,
    sourceBuildTitle: value.sourceBuildTitle,
    appliedAt: value.appliedAt,
    mergeMode,
    additions: value.additions,
    replacements: value.replacements,
    affectedCategories: normalizeStringArray(value.affectedCategories),
    impactSummary: value.impactSummary,
    restoreAvailable: value.restoreAvailable,
  };
}

function normalizePersistedEventMap(value: unknown) {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, ExpertBuildMergeEvent>>(
    (acc, [key, eventValue]) => {
      const event = normalizePersistedEvent(eventValue);

      if (event) {
        acc[key] = event;
      }

      return acc;
    },
    {}
  );
}

function readStorageValue(storageKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as unknown;
  } catch {
    return null;
  }
}

function writeStorageValue(storageKey: string, value: unknown) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readPersistedExpertBuildMergeDrafts() {
  return normalizePersistedDraftMap(
    readStorageValue(EXPERT_BUILD_MERGE_DRAFTS_STORAGE_KEY)
  );
}

export function writePersistedExpertBuildMergeDrafts(
  draftsByKey: Record<string, ExpertBuildMergeDraftPersisted>
) {
  return writeStorageValue(EXPERT_BUILD_MERGE_DRAFTS_STORAGE_KEY, draftsByKey);
}

export function readPersistedExpertBuildMergeEvents() {
  return normalizePersistedEventMap(
    readStorageValue(EXPERT_BUILD_MERGE_EVENTS_STORAGE_KEY)
  );
}

export function writePersistedExpertBuildMergeEvents(
  eventsByBike: Record<string, ExpertBuildMergeEvent>
) {
  return writeStorageValue(EXPERT_BUILD_MERGE_EVENTS_STORAGE_KEY, eventsByBike);
}
