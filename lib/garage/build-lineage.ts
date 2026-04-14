import type { ExpertBuildMergeEvent } from "../expert-builds/merge";
import type {
  GarageBuildCloneIntent,
  GarageBuildHistoryEvent,
  GarageBuildLatestMergeSummary,
  GarageBuildLineage,
  GarageBuildProvenance,
  GarageBuildRecord,
  GarageBuildSaveMode,
  GarageBuildVersion,
  GarageBuildVersionSummary,
  SupabaseBike,
} from "@/types/garage";

type GarageBuildMetadata = {
  createdAt: string;
  provenance: GarageBuildProvenance | null;
  version: GarageBuildVersion | null;
  versionSummary: GarageBuildVersionSummary | null;
  lineage: GarageBuildLineage | null;
  history: GarageBuildHistoryEvent[];
};

function createHistoryEvent(
  input: Omit<GarageBuildHistoryEvent, "id">
): GarageBuildHistoryEvent {
  return {
    ...input,
    id: `${input.type}:${input.at}:${input.sourceBuildId ?? input.mergeSourceTitle ?? input.summary}`,
  };
}

export function getGarageBuildVersionLabel(version: GarageBuildVersion | null | undefined) {
  return version?.revisionLabel ?? "Original";
}

export function getGarageBuildVersionSummary(
  version: GarageBuildVersion | null | undefined
): GarageBuildVersionSummary | null {
  if (!version) {
    return null;
  }

  return {
    label: version.revisionLabel,
    parentLabel: version.parentBuildId ? `From ${version.parentBuildId}` : null,
    rootBuildId: version.rootBuildId,
    isRoot: version.parentBuildId === null,
  };
}

export function mapMergeEventToGarageBuildMergeSummary(
  mergeEvent: ExpertBuildMergeEvent | null
): GarageBuildLatestMergeSummary | null {
  if (!mergeEvent) {
    return null;
  }

  return {
    sourceBuildId: mergeEvent.sourceBuildId,
    sourceBuildTitle: mergeEvent.sourceBuildTitle,
    appliedAt: mergeEvent.appliedAt,
    mergeMode: mergeEvent.mergeMode,
    additions: mergeEvent.additions,
    replacements: mergeEvent.replacements,
    affectedCategories: mergeEvent.affectedCategories,
    impactSummary: mergeEvent.impactSummary,
  };
}

function getBikeLabel(bike: SupabaseBike | null) {
  if (!bike) {
    return "Build";
  }

  return `${bike.make} ${bike.model}`;
}

function sanitizeBaseName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function ensureUniqueBuildName(
  existingBuilds: GarageBuildRecord[],
  proposedName: string,
  options?: { excludeBuildId?: string | null }
) {
  const baseName = sanitizeBaseName(proposedName) || "Saved build";
  const existingNames = new Set(
    existingBuilds
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
}

function getNextVersionNumber(
  existingBuilds: GarageBuildRecord[],
  sourceBuild: GarageBuildRecord
) {
  const rootBuildId = sourceBuild.version?.rootBuildId ?? sourceBuild.id;
  const relatedVersions = existingBuilds.filter((build) => {
    const buildRootId = build.version?.rootBuildId ?? build.id;
    return buildRootId === rootBuildId;
  });
  const highestVersion = relatedVersions.reduce((maxVersion, build) => {
    return Math.max(maxVersion, build.version?.versionNumber ?? 1);
  }, sourceBuild.version?.versionNumber ?? 1);

  return highestVersion + 1;
}

export function getSuggestedGarageBuildName(input: {
  bike: SupabaseBike | null;
  currentNameInput: string;
  existingBuilds: GarageBuildRecord[];
  mergeSummary: GarageBuildLatestMergeSummary | null;
  saveMode: GarageBuildSaveMode;
  sourceBuild: GarageBuildRecord | null;
}) {
  const explicitName = sanitizeBaseName(input.currentNameInput);

  if (explicitName) {
    return ensureUniqueBuildName(input.existingBuilds, explicitName, {
      excludeBuildId:
        input.saveMode === "update-existing" ? input.sourceBuild?.id ?? null : null,
    });
  }

  const bikeLabel = getBikeLabel(input.bike);

  if (input.saveMode === "update-existing" && input.sourceBuild) {
    return input.sourceBuild.name;
  }

  if (input.saveMode === "save-as-version" && input.sourceBuild) {
    const nextVersionNumber = getNextVersionNumber(input.existingBuilds, input.sourceBuild);
    const familyName =
      input.sourceBuild.version?.familyName ?? sanitizeBaseName(input.sourceBuild.name);

    return ensureUniqueBuildName(
      input.existingBuilds,
      `${familyName} v${nextVersionNumber}`
    );
  }

  if (input.saveMode === "duplicate-build" && input.sourceBuild) {
    return ensureUniqueBuildName(
      input.existingBuilds,
      `${sanitizeBaseName(input.sourceBuild.name)} Copy`
    );
  }

  if (input.mergeSummary) {
    return ensureUniqueBuildName(
      input.existingBuilds,
      `${bikeLabel} Expert Merge`
    );
  }

  return ensureUniqueBuildName(input.existingBuilds, `${bikeLabel} Setup`);
}

function createLineage(input: {
  buildId: string;
  name: string;
  sourceBuild: GarageBuildRecord | null;
  version: GarageBuildVersion | null;
  lineageNote: string | null;
}): GarageBuildLineage {
  const rootBuildId =
    input.version?.rootBuildId ??
    input.sourceBuild?.lineage?.rootBuildId ??
    input.sourceBuild?.id ??
    input.buildId;
  const parentBuildId =
    input.version?.parentBuildId ?? input.sourceBuild?.id ?? null;
  const derivedFromBuildId =
    input.sourceBuild && input.version?.parentBuildId === null
      ? input.sourceBuild.id
      : input.sourceBuild?.id ?? null;
  const derivedFromBuildName = input.sourceBuild?.name ?? null;
  const breadcrumbs = [
    input.sourceBuild?.provenance?.creationMode === "manual"
      ? "Manual build"
      : input.sourceBuild?.version?.revisionLabel ?? input.sourceBuild?.name,
    input.lineageNote,
    input.version?.revisionLabel ?? null,
  ].filter((value): value is string => typeof value === "string" && value.length > 0);

  return {
    buildId: input.buildId,
    rootBuildId,
    parentBuildId,
    derivedFromBuildId,
    derivedFromBuildName,
    breadcrumbs,
    relatedBuildIds: [
      rootBuildId,
      ...(parentBuildId ? [parentBuildId] : []),
      ...(derivedFromBuildId && derivedFromBuildId !== parentBuildId
        ? [derivedFromBuildId]
        : []),
    ],
    latestVersionLabel: input.version?.revisionLabel ?? null,
  };
}

export function createGarageBuildMetadata(input: {
  buildId: string;
  buildName: string;
  bike: SupabaseBike | null;
  existingBuilds: GarageBuildRecord[];
  mergeSummary: GarageBuildLatestMergeSummary | null;
  now: string;
  saveMode: GarageBuildSaveMode;
  sourceBuild: GarageBuildRecord | null;
  sourceExpertBuild?: { id: string; title: string } | null;
}): GarageBuildMetadata {
  const latestMerge = input.mergeSummary;
  const creationMode: GarageBuildProvenance["creationMode"] =
    input.saveMode === "save-as-version"
      ? "versioned"
      : input.saveMode === "duplicate-build"
      ? "cloned"
      : input.sourceExpertBuild
      ? "saved-from-expert"
      : latestMerge
      ? "merged-from-expert"
      : "manual";
  const cloneIntent: GarageBuildCloneIntent | null =
    input.saveMode === "duplicate-build"
      ? "saved-copy"
      : input.saveMode === "save-as-version"
      ? "version-branch"
      : null;
  const versionNumber =
    input.saveMode === "save-as-version" && input.sourceBuild
      ? getNextVersionNumber(input.existingBuilds, input.sourceBuild)
      : input.sourceBuild?.version?.versionNumber ?? 1;
  const version =
    input.saveMode === "save-as-version" && input.sourceBuild
      ? ({
          buildId: input.buildId,
          rootBuildId: input.sourceBuild.version?.rootBuildId ?? input.sourceBuild.id,
          parentBuildId: input.sourceBuild.id,
          versionNumber,
          revisionLabel: `v${versionNumber}`,
          familyName: input.sourceBuild.version?.familyName ?? input.sourceBuild.name,
        } satisfies GarageBuildVersion)
      : input.sourceBuild?.version && input.saveMode === "update-existing"
      ? {
          ...input.sourceBuild.version,
          buildId: input.buildId,
        }
      : null;
  const lineageNote =
    input.saveMode === "save-as-version" && input.sourceBuild
      ? `Version of ${input.sourceBuild.name}`
      : input.saveMode === "duplicate-build" && input.sourceBuild
      ? `Derived from ${input.sourceBuild.name}`
      : input.sourceExpertBuild
      ? `Saved from ${input.sourceExpertBuild.title}`
      : latestMerge
      ? `Inspired by ${latestMerge.sourceBuildTitle}`
      : `Manual build for ${getBikeLabel(input.bike)}`;
  const provenance: GarageBuildProvenance = {
    creationMode,
    createdAt:
      input.saveMode === "update-existing"
        ? input.sourceBuild?.createdAt ?? input.now
        : input.now,
    updatedAt: input.now,
    sourceBuildId:
      input.saveMode === "duplicate-build" ? input.sourceBuild?.id ?? null : null,
    sourceBuildName:
      input.saveMode === "duplicate-build" ? input.sourceBuild?.name ?? null : null,
    sourceExpertBuildId: input.sourceExpertBuild?.id ?? latestMerge?.sourceBuildId ?? null,
    sourceExpertBuildTitle:
      input.sourceExpertBuild?.title ?? latestMerge?.sourceBuildTitle ?? null,
    parentBuildId:
      input.saveMode === "save-as-version" ? input.sourceBuild?.id ?? null : null,
    parentBuildName:
      input.saveMode === "save-as-version" ? input.sourceBuild?.name ?? null : null,
    cloneIntent,
    latestMerge,
    lineageNote,
  };
  const lineage = createLineage({
    buildId: input.buildId,
    name: input.buildName,
    sourceBuild: input.sourceBuild,
    version,
    lineageNote,
  });
  const history = [
    ...(input.saveMode === "update-existing" ? input.sourceBuild?.history ?? [] : []),
    createHistoryEvent({
      type:
        input.saveMode === "save-as-version"
          ? "versioned"
          : input.saveMode === "duplicate-build"
          ? "duplicated"
          : input.sourceExpertBuild
          ? "saved-from-expert"
          : "created",
      at: input.now,
      summary:
        input.saveMode === "save-as-version" && input.sourceBuild
          ? `Saved as ${input.buildName} from ${input.sourceBuild.name}`
          : input.saveMode === "duplicate-build" && input.sourceBuild
          ? `Duplicated from ${input.sourceBuild.name}`
          : input.sourceExpertBuild
          ? `Saved from expert build ${input.sourceExpertBuild.title}`
          : `Created ${input.buildName}`,
      sourceBuildId: input.sourceBuild?.id ?? null,
      sourceBuildName: input.sourceBuild?.name ?? null,
      mergeSourceTitle: latestMerge?.sourceBuildTitle ?? null,
    }),
    ...(latestMerge
      ? [
          createHistoryEvent({
            type: "expert-merged",
            at: latestMerge.appliedAt,
            summary: `Latest expert merge from ${latestMerge.sourceBuildTitle}`,
            sourceBuildId: latestMerge.sourceBuildId,
            sourceBuildName: latestMerge.sourceBuildTitle,
            mergeSourceTitle: latestMerge.sourceBuildTitle,
          }),
        ]
      : []),
  ].slice(-6);

  return {
    createdAt: provenance.createdAt,
    provenance,
    version,
    versionSummary: getGarageBuildVersionSummary(version),
    lineage,
    history,
  };
}

export function applyGarageBuildMetadata(
  build: GarageBuildRecord,
  metadata: GarageBuildMetadata | null
): GarageBuildRecord {
  if (!metadata) {
    return build;
  }

  return {
    ...build,
    createdAt: metadata.createdAt ?? build.createdAt,
    provenance: metadata.provenance ?? build.provenance ?? null,
    version: metadata.version ?? build.version ?? null,
    versionSummary: metadata.versionSummary ?? build.versionSummary ?? null,
    lineage: metadata.lineage ?? build.lineage ?? null,
    history: metadata.history ?? build.history ?? [],
  };
}

export function extractGarageBuildMetadata(
  build: GarageBuildRecord
): GarageBuildMetadata {
  return {
    createdAt: build.createdAt ?? build.updatedAt,
    provenance: build.provenance ?? null,
    version: build.version ?? null,
    versionSummary: build.versionSummary ?? null,
    lineage: build.lineage ?? null,
    history: build.history ?? [],
  };
}

export function getGarageBuildSaveRecommendation(input: {
  hasRecentMerge: boolean;
  isEditingSavedBuild: boolean;
  hasUnsavedChanges: boolean;
}) {
  if (input.hasRecentMerge && input.isEditingSavedBuild) {
    return "This build includes recent merge changes. Saving as a new version is recommended.";
  }

  if (input.hasRecentMerge) {
    return "This working build includes expert-merge changes worth preserving as a named build.";
  }

  if (input.isEditingSavedBuild && input.hasUnsavedChanges) {
    return "You are refining a saved build. Update it directly or save a new version to preserve the previous snapshot.";
  }

  return "Save this setup as a named build so you can revisit and evolve it later.";
}

export function getGarageBuildComparisonSummary(
  left: GarageBuildRecord,
  right: GarageBuildRecord
) {
  const leftIds = new Set(left.buildItems.map((item) => item.product.id));
  const rightIds = new Set(right.buildItems.map((item) => item.product.id));
  const sharedCount = left.buildItems.filter((item) => rightIds.has(item.product.id)).length;
  const leftOnlyCount = left.buildItems.filter((item) => !rightIds.has(item.product.id)).length;
  const rightOnlyCount = right.buildItems.filter((item) => !leftIds.has(item.product.id)).length;
  const leftCategories = new Set(left.buildItems.map((item) => item.product.categoryId));
  const rightCategories = new Set(right.buildItems.map((item) => item.product.categoryId));
  const related =
    left.lineage?.rootBuildId &&
    right.lineage?.rootBuildId &&
    left.lineage.rootBuildId === right.lineage.rootBuildId;

  return {
    sharedCount,
    leftOnlyCount,
    rightOnlyCount,
    sharedCategoryCount: Array.from(leftCategories).filter((category) =>
      rightCategories.has(category)
    ).length,
    related,
  };
}
