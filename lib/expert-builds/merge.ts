import type { Product } from "../../types/garage";
import type { ResolvedExpertBuild, ResolvedExpertBuildAccessory } from "./types";

export type ExpertBuildApplyMode =
  | "add-missing-only"
  | "review-all"
  | "category-led";

export type ExpertBuildMergeDecision =
  | "already-have"
  | "add"
  | "skip"
  | "replace-existing"
  | "keep-mine"
  | "unresolved";

export type ExpertBuildMergeConflict = {
  categoryId: string;
  categoryLabel: string;
  currentProducts: Product[];
  strongestMatch: Product | null;
  reason: "similar-item" | "category-overlap";
  similarityScore: number;
};

export type ExpertBuildMergeItem = {
  id: string;
  accessoryId: string;
  categoryId: string;
  categoryLabel: string;
  expertAccessory: ResolvedExpertBuildAccessory;
  expertProduct: Product;
  directMatch: boolean;
  decision: ExpertBuildMergeDecision;
  currentProducts: Product[];
  replacementProductIds: number[];
  conflict: ExpertBuildMergeConflict | null;
};

export type ExpertBuildMergeSummary = {
  alreadyHaveCount: number;
  safeToAddCount: number;
  replaceCount: number;
  skipCount: number;
  keepMineCount: number;
  unresolvedCount: number;
};

export type ExpertBuildMergeSnapshotFingerprint = string;

export type ExpertBuildMergeDraftDecisionRecord = {
  accessoryId: string;
  decision: ExpertBuildMergeDecision;
  replacementProductIds: number[];
};

export type ExpertBuildMergePreview = {
  mergedProducts: Product[];
  additions: Product[];
  replacements: Array<{ removed: Product[]; added: Product }>;
  unchangedProducts: Product[];
  unresolvedItems: ExpertBuildMergeItem[];
  affectedCategories: string[];
  resultingCategoryMix: Array<{ categoryId: string; count: number }>;
  summary: ExpertBuildMergeSummary;
  impactSummary: string;
};

export type ExpertBuildMergeDraft = {
  id: string;
  bikeId: string;
  buildId: string;
  mode: ExpertBuildApplyMode;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string | null;
  snapshotFingerprint: ExpertBuildMergeSnapshotFingerprint;
  currentBuildSnapshot: Product[];
  items: ExpertBuildMergeItem[];
};

export type ExpertBuildMergeDraftPersisted = {
  id: string;
  bikeId: string;
  buildId: string;
  mode: ExpertBuildApplyMode;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string | null;
  snapshotFingerprint: ExpertBuildMergeSnapshotFingerprint;
  snapshotProducts: Product[];
  itemDecisions: ExpertBuildMergeDraftDecisionRecord[];
};

export type ExpertBuildMergeProvenance = {
  sourceBuildId: string;
  sourceBuildTitle: string;
  appliedAt: string;
  mergeMode: ExpertBuildApplyMode;
  additions: number;
  replacements: number;
  affectedCategories: string[];
  impactSummary: string;
};

export type ExpertBuildMergeRestorePoint = {
  bikeId: string;
  sourceBuildId: string;
  sourceBuildTitle: string;
  capturedAt: string;
  products: Product[];
  previousProvenance: ExpertBuildMergeProvenance | null;
};

export type ExpertBuildMergeEvent = {
  id: string;
  bikeId: string;
  sourceBuildId: string;
  sourceBuildTitle: string;
  appliedAt: string;
  mergeMode: ExpertBuildApplyMode;
  additions: number;
  replacements: number;
  affectedCategories: string[];
  impactSummary: string;
  restoreAvailable: boolean;
};

export type ExpertBuildMergeRebaseResult = {
  draft: ExpertBuildMergeDraft;
  stale: boolean;
  changed: boolean;
  preservedDecisionCount: number;
  downgradedDecisionCount: number;
  previousFingerprint: ExpertBuildMergeSnapshotFingerprint;
  nextFingerprint: ExpertBuildMergeSnapshotFingerprint;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

function getCategoryLabel(categoryId: string) {
  return categoryId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function fingerprintExpertBuildMergeSnapshot(products: Product[]) {
  return products
    .map((product) =>
      [
        product.id,
        product.categoryId,
        normalizeText(product.brand),
        normalizeText(product.name),
      ].join(":")
    )
    .sort()
    .join("|");
}

export function getProductSimilarityScore(left: Product, right: Product) {
  if (left.id === right.id) {
    return 1;
  }

  const leftTokens = tokenize(`${left.brand} ${left.name}`);
  const rightTokens = tokenize(`${right.brand} ${right.name}`);
  const overlapCount = leftTokens.filter((token) => rightTokens.includes(token)).length;
  const unionCount = new Set([...leftTokens, ...rightTokens]).size || 1;
  const tokenScore = overlapCount / unionCount;
  const brandBonus =
    normalizeText(left.brand) === normalizeText(right.brand) ? 0.25 : 0;

  return Math.min(1, tokenScore + brandBonus);
}

function createConflict(
  categoryId: string,
  expertProduct: Product,
  currentProducts: Product[]
): ExpertBuildMergeConflict | null {
  if (currentProducts.length === 0) {
    return null;
  }

  const strongestMatch =
    [...currentProducts].sort(
      (left, right) =>
        getProductSimilarityScore(right, expertProduct) -
        getProductSimilarityScore(left, expertProduct)
    )[0] ?? null;
  const similarityScore = strongestMatch
    ? getProductSimilarityScore(strongestMatch, expertProduct)
    : 0;

  return {
    categoryId,
    categoryLabel: getCategoryLabel(categoryId),
    currentProducts,
    strongestMatch,
    reason: similarityScore >= 0.45 ? "similar-item" : "category-overlap",
    similarityScore,
  };
}

function getInitialDecision(input: {
  conflict: ExpertBuildMergeConflict | null;
  currentProducts: Product[];
  directMatch: boolean;
  mode: ExpertBuildApplyMode;
}) {
  if (input.directMatch) {
    return "already-have" as const;
  }

  if (input.currentProducts.length === 0) {
    return "add" as const;
  }

  if (input.mode === "add-missing-only") {
    return "keep-mine" as const;
  }

  if (input.mode === "category-led") {
    return "unresolved" as const;
  }

  return "unresolved" as const;
}

function withUpdatedTimestamp(draft: ExpertBuildMergeDraft, items: ExpertBuildMergeItem[]) {
  return {
    ...draft,
    items,
    updatedAt: new Date().toISOString(),
  };
}

export function createExpertBuildMergeDraft(input: {
  bikeId: string;
  currentProducts: Product[];
  mode: ExpertBuildApplyMode;
  sourceBuild: ResolvedExpertBuild;
}): ExpertBuildMergeDraft {
  const currentProductsByCategory = input.currentProducts.reduce<Record<string, Product[]>>(
    (acc, product) => {
      acc[product.categoryId] = [...(acc[product.categoryId] ?? []), product];
      return acc;
    },
    {}
  );
  const currentProductIds = new Set(input.currentProducts.map((product) => product.id));
  const now = new Date().toISOString();

  return {
    id: `${input.bikeId}:${input.sourceBuild.id}`,
    bikeId: input.bikeId,
    buildId: input.sourceBuild.id,
    mode: input.mode,
    createdAt: now,
    updatedAt: now,
    lastSavedAt: null,
    snapshotFingerprint: fingerprintExpertBuildMergeSnapshot(input.currentProducts),
    currentBuildSnapshot: input.currentProducts,
    items: input.sourceBuild.resolvedAccessories.map((accessory) => {
      const currentProducts = currentProductsByCategory[accessory.categoryId] ?? [];
      const directMatch = currentProductIds.has(accessory.product.id);
      const conflict = createConflict(
        accessory.categoryId,
        accessory.product,
        currentProducts.filter((product) => product.id !== accessory.product.id)
      );
      const decision = getInitialDecision({
        conflict,
        currentProducts,
        directMatch,
        mode: input.mode,
      });

      return {
        id: `${input.sourceBuild.id}:${accessory.id}`,
        accessoryId: accessory.id,
        categoryId: accessory.categoryId,
        categoryLabel: getCategoryLabel(accessory.categoryId),
        expertAccessory: accessory,
        expertProduct: accessory.product,
        directMatch,
        decision,
        currentProducts,
        replacementProductIds: [],
        conflict,
      } satisfies ExpertBuildMergeItem;
    }),
  };
}

export function updateExpertBuildMergeMode(
  draft: ExpertBuildMergeDraft,
  sourceBuild: ResolvedExpertBuild
) {
  const nextDraft = createExpertBuildMergeDraft({
    bikeId: draft.bikeId,
    currentProducts: draft.currentBuildSnapshot,
    mode: draft.mode,
    sourceBuild,
  });

  return {
    ...nextDraft,
    createdAt: draft.createdAt,
    lastSavedAt: draft.lastSavedAt,
  };
}

export function setExpertBuildMergeItemDecision(
  draft: ExpertBuildMergeDraft,
  itemId: string,
  decision: ExpertBuildMergeDecision
) {
  const nextItems = draft.items.map((item) => {
    if (item.id !== itemId || item.directMatch) {
      return item;
    }

    return {
      ...item,
      decision,
      replacementProductIds:
        decision === "replace-existing"
          ? item.currentProducts.map((product) => product.id)
          : [],
    };
  });

  return withUpdatedTimestamp(draft, nextItems);
}

export function applyExpertBuildMergeDecisionToCategory(
  draft: ExpertBuildMergeDraft,
  categoryId: string,
  action: "apply" | "skip" | "review"
) {
  const nextItems: ExpertBuildMergeItem[] = draft.items.map((item) => {
    if (item.categoryId !== categoryId || item.directMatch) {
      return item;
    }

    if (action === "skip") {
      return {
        ...item,
        decision: item.currentProducts.length > 0 ? "keep-mine" : "skip",
        replacementProductIds: [],
      } satisfies ExpertBuildMergeItem;
    }

    if (action === "review") {
      return {
        ...item,
        decision: item.currentProducts.length > 0 ? "unresolved" : "add",
        replacementProductIds: [],
      } satisfies ExpertBuildMergeItem;
    }

    if (item.currentProducts.length === 0) {
      return {
        ...item,
        decision: "add",
        replacementProductIds: [],
      } satisfies ExpertBuildMergeItem;
    }

    const categoryItems = draft.items.filter(
      (draftItem) => draftItem.categoryId === categoryId
    );
    const currentCategoryProductIds = Array.from(
      new Set(
        categoryItems.flatMap((draftItem) =>
          draftItem.currentProducts.map((product) => product.id)
        )
      )
    );

    if (categoryItems.length === 1 && currentCategoryProductIds.length === 1) {
      return {
        ...item,
        decision: "replace-existing",
        replacementProductIds: currentCategoryProductIds,
      } satisfies ExpertBuildMergeItem;
    }

    return {
      ...item,
      decision: "unresolved",
      replacementProductIds: [],
    } satisfies ExpertBuildMergeItem;
  });

  return withUpdatedTimestamp(draft, nextItems);
}

export function getExpertBuildMergeSummary(items: ExpertBuildMergeItem[]): ExpertBuildMergeSummary {
  return {
    alreadyHaveCount: items.filter((item) => item.decision === "already-have").length,
    safeToAddCount: items.filter((item) => item.decision === "add").length,
    replaceCount: items.filter((item) => item.decision === "replace-existing").length,
    skipCount: items.filter((item) => item.decision === "skip").length,
    keepMineCount: items.filter((item) => item.decision === "keep-mine").length,
    unresolvedCount: items.filter((item) => item.decision === "unresolved").length,
  };
}

export function markExpertBuildMergeDraftSaved(draft: ExpertBuildMergeDraft) {
  const timestamp = new Date().toISOString();

  return {
    ...draft,
    updatedAt: timestamp,
    lastSavedAt: timestamp,
  };
}

export function createExpertBuildMergeDraftPersisted(
  draft: ExpertBuildMergeDraft
): ExpertBuildMergeDraftPersisted {
  return {
    id: draft.id,
    bikeId: draft.bikeId,
    buildId: draft.buildId,
    mode: draft.mode,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    lastSavedAt: draft.lastSavedAt,
    snapshotFingerprint: draft.snapshotFingerprint,
    snapshotProducts: draft.currentBuildSnapshot,
    itemDecisions: draft.items.map((item) => ({
      accessoryId: item.accessoryId,
      decision: item.decision,
      replacementProductIds: item.replacementProductIds,
    })),
  };
}

function applyDecisionRecordToDraft(
  draft: ExpertBuildMergeDraft,
  itemId: string,
  decision: ExpertBuildMergeDecision,
  replacementProductIds: number[]
) {
  return withUpdatedTimestamp(
    draft,
    draft.items.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      return {
        ...item,
        decision,
        replacementProductIds,
      };
    })
  );
}

export function restoreExpertBuildMergeDraft(input: {
  persisted: ExpertBuildMergeDraftPersisted;
  sourceBuild: ResolvedExpertBuild;
}) {
  const decisionMap = new Map(
    input.persisted.itemDecisions.map((record) => [record.accessoryId, record])
  );
  let draft = createExpertBuildMergeDraft({
    bikeId: input.persisted.bikeId,
    currentProducts: input.persisted.snapshotProducts,
    mode: input.persisted.mode,
    sourceBuild: input.sourceBuild,
  });

  draft = {
    ...draft,
    id: input.persisted.id,
    createdAt: input.persisted.createdAt,
    updatedAt: input.persisted.updatedAt,
    lastSavedAt: input.persisted.lastSavedAt,
    snapshotFingerprint: input.persisted.snapshotFingerprint,
  };

  draft.items.forEach((item) => {
    const record = decisionMap.get(item.accessoryId);

    if (!record) {
      return;
    }

    draft = applyDecisionRecordToDraft(
      draft,
      item.id,
      item.directMatch ? "already-have" : record.decision,
      record.decision === "replace-existing"
        ? item.currentProducts
            .map((product) => product.id)
            .filter((productId) => record.replacementProductIds.includes(productId))
        : []
    );
  });

  return {
    ...draft,
    updatedAt: input.persisted.updatedAt,
  };
}

export function isExpertBuildMergeDraftStale(
  draft: Pick<ExpertBuildMergeDraft, "snapshotFingerprint">,
  currentProducts: Product[]
) {
  return draft.snapshotFingerprint !== fingerprintExpertBuildMergeSnapshot(currentProducts);
}

function resolveRebasedDecision(
  previousItem: ExpertBuildMergeItem | undefined,
  nextItem: ExpertBuildMergeItem
): {
  decision: ExpertBuildMergeDecision;
  replacementProductIds: number[];
  preserved: boolean;
  downgraded: boolean;
} {
  if (!previousItem) {
    return {
      decision: nextItem.decision,
      replacementProductIds: nextItem.replacementProductIds,
      preserved: false,
      downgraded: false,
    };
  }

  if (nextItem.directMatch) {
    return {
      decision: "already-have" as const,
      replacementProductIds: [],
      preserved: previousItem.decision === "already-have",
      downgraded: previousItem.decision !== "already-have",
    };
  }

  if (previousItem.decision === "replace-existing") {
    const matchingReplacementIds = nextItem.currentProducts
      .map((product) => product.id)
      .filter((productId) => previousItem.replacementProductIds.includes(productId));

    if (matchingReplacementIds.length > 0) {
      return {
        decision: "replace-existing" as const,
        replacementProductIds: matchingReplacementIds,
        preserved: true,
        downgraded: false,
      };
    }

    if (nextItem.currentProducts.length === 0) {
      return {
        decision: "add" as const,
        replacementProductIds: [],
        preserved: false,
        downgraded: true,
      };
    }

    return {
      decision: "unresolved" as const,
      replacementProductIds: [],
      preserved: false,
      downgraded: true,
    };
  }

  if (previousItem.decision === "add") {
    if (nextItem.currentProducts.length === 0) {
      return {
        decision: "add" as const,
        replacementProductIds: [],
        preserved: true,
        downgraded: false,
      };
    }

    return {
      decision: "unresolved" as const,
      replacementProductIds: [],
      preserved: false,
      downgraded: true,
    };
  }

  if (previousItem.decision === "keep-mine" || previousItem.decision === "skip") {
    return {
      decision:
        previousItem.decision === "keep-mine" && nextItem.currentProducts.length === 0
          ? "skip"
          : previousItem.decision,
      replacementProductIds: [],
      preserved: true,
      downgraded: false,
    };
  }

  if (previousItem.decision === "unresolved") {
    return {
      decision: nextItem.currentProducts.length === 0 ? "add" : "unresolved",
      replacementProductIds: [],
      preserved: nextItem.currentProducts.length > 0,
      downgraded: false,
    };
  }

  return {
    decision: nextItem.decision,
    replacementProductIds: nextItem.replacementProductIds,
    preserved: false,
    downgraded: false,
  };
}

export function rebaseExpertBuildMergeDraft(input: {
  draft: ExpertBuildMergeDraft;
  currentProducts: Product[];
  sourceBuild: ResolvedExpertBuild;
}): ExpertBuildMergeRebaseResult {
  const nextDraftBase = createExpertBuildMergeDraft({
    bikeId: input.draft.bikeId,
    currentProducts: input.currentProducts,
    mode: input.draft.mode,
    sourceBuild: input.sourceBuild,
  });
  const previousItemsByAccessoryId = new Map(
    input.draft.items.map((item) => [item.accessoryId, item])
  );
  let preservedDecisionCount = 0;
  let downgradedDecisionCount = 0;

  const nextDraft = {
    ...nextDraftBase,
    id: input.draft.id,
    createdAt: input.draft.createdAt,
    lastSavedAt: input.draft.lastSavedAt,
    items: nextDraftBase.items.map((item) => {
      const resolution = resolveRebasedDecision(
        previousItemsByAccessoryId.get(item.accessoryId),
        item
      );

      if (resolution.preserved) {
        preservedDecisionCount += 1;
      }

      if (resolution.downgraded) {
        downgradedDecisionCount += 1;
      }

      return {
        ...item,
        decision: resolution.decision,
        replacementProductIds: resolution.replacementProductIds,
      };
    }),
    updatedAt: new Date().toISOString(),
  } satisfies ExpertBuildMergeDraft;

  return {
    draft: nextDraft,
    stale: isExpertBuildMergeDraftStale(input.draft, input.currentProducts),
    changed:
      nextDraft.snapshotFingerprint !== input.draft.snapshotFingerprint ||
      downgradedDecisionCount > 0,
    preservedDecisionCount,
    downgradedDecisionCount,
    previousFingerprint: input.draft.snapshotFingerprint,
    nextFingerprint: nextDraft.snapshotFingerprint,
  };
}

export function createExpertBuildMergeProvenance(input: {
  sourceBuild: ResolvedExpertBuild;
  preview: ExpertBuildMergePreview;
  mode: ExpertBuildApplyMode;
}) {
  return {
    sourceBuildId: input.sourceBuild.id,
    sourceBuildTitle: input.sourceBuild.title,
    appliedAt: new Date().toISOString(),
    mergeMode: input.mode,
    additions: input.preview.summary.safeToAddCount,
    replacements: input.preview.summary.replaceCount,
    affectedCategories: input.preview.affectedCategories,
    impactSummary: input.preview.impactSummary,
  } satisfies ExpertBuildMergeProvenance;
}

export function createExpertBuildMergeEvent(input: {
  bikeId: string;
  provenance: ExpertBuildMergeProvenance;
  restoreAvailable: boolean;
}) {
  return {
    id: `${input.bikeId}:${input.provenance.sourceBuildId}:${input.provenance.appliedAt}`,
    bikeId: input.bikeId,
    sourceBuildId: input.provenance.sourceBuildId,
    sourceBuildTitle: input.provenance.sourceBuildTitle,
    appliedAt: input.provenance.appliedAt,
    mergeMode: input.provenance.mergeMode,
    additions: input.provenance.additions,
    replacements: input.provenance.replacements,
    affectedCategories: input.provenance.affectedCategories,
    impactSummary: input.provenance.impactSummary,
    restoreAvailable: input.restoreAvailable,
  } satisfies ExpertBuildMergeEvent;
}

export function createExpertBuildMergePreview(
  draft: ExpertBuildMergeDraft,
  sourceBuild: ResolvedExpertBuild
): ExpertBuildMergePreview {
  const removedProductIds = new Set<number>();
  const additions = new Map<number, Product>();
  const replacements = new Map<
    number,
    { removed: Product[]; added: Product }
  >();
  const unresolvedItems = draft.items.filter((item) => item.decision === "unresolved");

  draft.items.forEach((item) => {
    if (item.decision === "add") {
      additions.set(item.expertProduct.id, item.expertProduct);
      return;
    }

    if (item.decision === "replace-existing") {
      const removed = item.currentProducts.filter((product) =>
        item.replacementProductIds.includes(product.id)
      );

      removed.forEach((product) => removedProductIds.add(product.id));
      additions.set(item.expertProduct.id, item.expertProduct);
      replacements.set(item.expertProduct.id, {
        removed,
        added: item.expertProduct,
      });
    }
  });

  const mergedProducts = [
    ...draft.currentBuildSnapshot.filter((product) => !removedProductIds.has(product.id)),
    ...Array.from(additions.values()).filter(
      (product) =>
        !draft.currentBuildSnapshot.some((currentProduct) => currentProduct.id === product.id)
    ),
  ];
  const resultingCategoryMix = mergedProducts.reduce<
    Array<{ categoryId: string; count: number }>
  >((acc, product) => {
    const existing = acc.find((entry) => entry.categoryId === product.categoryId);

    if (existing) {
      existing.count += 1;
      return acc;
    }

    acc.push({ categoryId: product.categoryId, count: 1 });
    return acc;
  }, []);
  const affectedCategories = Array.from(
    new Set(
      draft.items
        .filter((item) => item.decision === "add" || item.decision === "replace-existing")
        .map((item) => item.categoryLabel)
    )
  );
  const impactSummary = getExpertBuildMergeImpactSummary(draft, sourceBuild);

  return {
    mergedProducts,
    additions: Array.from(additions.values()).filter(
      (product) => !replacements.has(product.id)
    ),
    replacements: Array.from(replacements.values()),
    unchangedProducts: draft.currentBuildSnapshot.filter(
      (product) => !removedProductIds.has(product.id)
    ),
    unresolvedItems,
    affectedCategories,
    resultingCategoryMix,
    summary: getExpertBuildMergeSummary(draft.items),
    impactSummary,
  };
}

export function validateExpertBuildMergeDraft(
  draft: ExpertBuildMergeDraft,
  preview: ExpertBuildMergePreview
) {
  return {
    canApply:
      preview.unresolvedItems.length === 0 &&
      draft.items.some(
        (item) => item.decision === "add" || item.decision === "replace-existing"
      ),
    hasChanges: preview.summary.safeToAddCount + preview.summary.replaceCount > 0,
    unresolvedCount: preview.unresolvedItems.length,
  };
}

export function getExpertBuildMergeImpactSummary(
  draft: ExpertBuildMergeDraft,
  sourceBuild: ResolvedExpertBuild
) {
  const selectedCategoryWeights = draft.items
    .filter((item) => item.decision === "add" || item.decision === "replace-existing")
    .map((item) => ({
      categoryId: item.categoryId,
      label: item.categoryLabel,
      weight:
        sourceBuild.emphasisSummary.find((entry) => entry.category === item.categoryId)
          ?.strength ?? 1,
    }))
    .reduce<Record<string, { label: string; weight: number }>>((acc, entry) => {
      acc[entry.categoryId] = {
        label: entry.label,
        weight: (acc[entry.categoryId]?.weight ?? 0) + entry.weight,
      };
      return acc;
    }, {});
  const topCategories = Object.values(selectedCategoryWeights)
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 3)
    .map((entry) => entry.label.toLowerCase());

  if (topCategories.length === 0) {
    return "No merge changes selected yet. Choose items or categories to preview how this build would shift your setup.";
  }

  if (topCategories.length === 1) {
    return `Selected changes primarily strengthen ${topCategories[0]}.`;
  }

  if (topCategories.length === 2) {
    return `Selected changes primarily strengthen ${topCategories[0]} and ${topCategories[1]}.`;
  }

  return `Selected changes primarily strengthen ${topCategories[0]}, ${topCategories[1]}, and ${topCategories[2]}.`;
}
