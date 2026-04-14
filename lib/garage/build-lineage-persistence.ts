import type {
  GarageBuildCloneIntent,
  GarageBuildHistoryEvent,
  GarageBuildLatestMergeSummary,
  GarageBuildLineage,
  GarageBuildProvenance,
  GarageBuildVersion,
  GarageBuildVersionSummary,
} from "@/types/garage";

export type PersistedGarageBuildMetadata = {
  createdAt: string;
  provenance: GarageBuildProvenance | null;
  version: GarageBuildVersion | null;
  versionSummary: GarageBuildVersionSummary | null;
  lineage: GarageBuildLineage | null;
  history: GarageBuildHistoryEvent[];
};

const GARAGE_BUILD_METADATA_STORAGE_KEY =
  "accessorise-it.garage-build-metadata.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeCloneIntent(value: unknown): GarageBuildCloneIntent | null {
  return value === "saved-copy" ||
    value === "workspace-copy" ||
    value === "version-branch"
    ? value
    : null;
}

function normalizeLatestMerge(value: unknown): GarageBuildLatestMergeSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.sourceBuildId !== "string" ||
    typeof value.sourceBuildTitle !== "string" ||
    typeof value.appliedAt !== "string" ||
    typeof value.mergeMode !== "string" ||
    typeof value.additions !== "number" ||
    typeof value.replacements !== "number" ||
    typeof value.impactSummary !== "string"
  ) {
    return null;
  }

  return {
    sourceBuildId: value.sourceBuildId,
    sourceBuildTitle: value.sourceBuildTitle,
    appliedAt: value.appliedAt,
    mergeMode: value.mergeMode,
    additions: value.additions,
    replacements: value.replacements,
    affectedCategories: normalizeStringArray(value.affectedCategories),
    impactSummary: value.impactSummary,
  };
}

function normalizeProvenance(value: unknown): GarageBuildProvenance | null {
  if (!isRecord(value) || typeof value.creationMode !== "string") {
    return null;
  }

  return {
    creationMode:
      value.creationMode === "manual" ||
      value.creationMode === "cloned" ||
      value.creationMode === "merged-from-expert" ||
      value.creationMode === "versioned" ||
      value.creationMode === "saved-from-expert"
        ? value.creationMode
        : "manual",
    createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
    sourceBuildId: typeof value.sourceBuildId === "string" ? value.sourceBuildId : null,
    sourceBuildName:
      typeof value.sourceBuildName === "string" ? value.sourceBuildName : null,
    sourceExpertBuildId:
      typeof value.sourceExpertBuildId === "string" ? value.sourceExpertBuildId : null,
    sourceExpertBuildTitle:
      typeof value.sourceExpertBuildTitle === "string"
        ? value.sourceExpertBuildTitle
        : null,
    parentBuildId: typeof value.parentBuildId === "string" ? value.parentBuildId : null,
    parentBuildName:
      typeof value.parentBuildName === "string" ? value.parentBuildName : null,
    cloneIntent: normalizeCloneIntent(value.cloneIntent),
    latestMerge: normalizeLatestMerge(value.latestMerge),
    lineageNote: typeof value.lineageNote === "string" ? value.lineageNote : null,
  };
}

function normalizeVersion(value: unknown): GarageBuildVersion | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.buildId !== "string" ||
    typeof value.rootBuildId !== "string" ||
    typeof value.versionNumber !== "number" ||
    typeof value.revisionLabel !== "string" ||
    typeof value.familyName !== "string"
  ) {
    return null;
  }

  return {
    buildId: value.buildId,
    rootBuildId: value.rootBuildId,
    parentBuildId:
      typeof value.parentBuildId === "string" ? value.parentBuildId : null,
    versionNumber: value.versionNumber,
    revisionLabel: value.revisionLabel,
    familyName: value.familyName,
  };
}

function normalizeVersionSummary(value: unknown): GarageBuildVersionSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.label !== "string" ||
    typeof value.rootBuildId !== "string" ||
    typeof value.isRoot !== "boolean"
  ) {
    return null;
  }

  return {
    label: value.label,
    parentLabel: typeof value.parentLabel === "string" ? value.parentLabel : null,
    rootBuildId: value.rootBuildId,
    isRoot: value.isRoot,
  };
}

function normalizeLineage(value: unknown): GarageBuildLineage | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.buildId !== "string" ||
    typeof value.rootBuildId !== "string"
  ) {
    return null;
  }

  return {
    buildId: value.buildId,
    rootBuildId: value.rootBuildId,
    parentBuildId:
      typeof value.parentBuildId === "string" ? value.parentBuildId : null,
    derivedFromBuildId:
      typeof value.derivedFromBuildId === "string"
        ? value.derivedFromBuildId
        : null,
    derivedFromBuildName:
      typeof value.derivedFromBuildName === "string"
        ? value.derivedFromBuildName
        : null,
    breadcrumbs: normalizeStringArray(value.breadcrumbs),
    relatedBuildIds: normalizeStringArray(value.relatedBuildIds),
    latestVersionLabel:
      typeof value.latestVersionLabel === "string" ? value.latestVersionLabel : null,
  };
}

function normalizeHistory(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<GarageBuildHistoryEvent[]>((acc, item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.type !== "string" ||
      typeof item.at !== "string" ||
      typeof item.summary !== "string"
    ) {
      return acc;
    }

    acc.push({
      id: item.id,
      type:
        item.type === "created" ||
        item.type === "updated" ||
        item.type === "duplicated" ||
        item.type === "versioned" ||
        item.type === "expert-merged" ||
        item.type === "saved-from-expert"
          ? item.type
          : "updated",
      at: item.at,
      summary: item.summary,
      sourceBuildId:
        typeof item.sourceBuildId === "string" ? item.sourceBuildId : null,
      sourceBuildName:
        typeof item.sourceBuildName === "string" ? item.sourceBuildName : null,
      mergeSourceTitle:
        typeof item.mergeSourceTitle === "string" ? item.mergeSourceTitle : null,
    });

    return acc;
  }, []);
}

function normalizeMetadata(value: unknown): PersistedGarageBuildMetadata | null {
  if (!isRecord(value) || typeof value.createdAt !== "string") {
    return null;
  }

  return {
    createdAt: value.createdAt,
    provenance: normalizeProvenance(value.provenance),
    version: normalizeVersion(value.version),
    versionSummary: normalizeVersionSummary(value.versionSummary),
    lineage: normalizeLineage(value.lineage),
    history: normalizeHistory(value.history),
  };
}

export function readPersistedGarageBuildMetadata() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(GARAGE_BUILD_METADATA_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<Record<string, PersistedGarageBuildMetadata>>(
      (acc, [buildId, metadata]) => {
        const normalized = normalizeMetadata(metadata);

        if (normalized) {
          acc[buildId] = normalized;
        }

        return acc;
      },
      {}
    );
  } catch {
    return {};
  }
}

export function writePersistedGarageBuildMetadata(
  metadataByBuildId: Record<string, PersistedGarageBuildMetadata>
) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(
      GARAGE_BUILD_METADATA_STORAGE_KEY,
      JSON.stringify(metadataByBuildId)
    );
    return true;
  } catch {
    return false;
  }
}
