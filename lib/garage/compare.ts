import type {
  CompareCategorySection,
  CompareCategoryRow,
  CompareFilter,
  CompareFilterMeta,
  CompareSummary,
  GarageCategory,
  Product,
} from "../../types/garage";
import type { ResolvedExpertBuild } from "../expert-builds/types";

export function getCompareSummary(
  selectedExpertBuild: ResolvedExpertBuild | null,
  selectedProducts: Product[]
): CompareSummary {
  if (!selectedExpertBuild) {
    return {
      sharedCount: 0,
      missingCount: 0,
      yourOnlyCount: selectedProducts.length,
      matchCost: 0,
    };
  }

  const yourIds = new Set(selectedProducts.map((product) => product.id));
  const expertIds = new Set(selectedExpertBuild.items.map((product) => product.id));
  const sharedCount = selectedProducts.filter((product) =>
    expertIds.has(product.id)
  ).length;
  const missingProducts = selectedExpertBuild.items.filter(
    (product) => !yourIds.has(product.id)
  );
  const yourOnlyCount = selectedProducts.filter(
    (product) => !expertIds.has(product.id)
  ).length;

  return {
    sharedCount,
    missingCount: missingProducts.length,
    yourOnlyCount,
    matchCost: missingProducts.reduce((total, product) => total + product.price, 0),
  };
}

export function getCompareCategorySections(
  selectedExpertBuild: ResolvedExpertBuild | null,
  selectedProducts: Product[],
  categories: GarageCategory[]
): CompareCategorySection[] {
  if (!selectedExpertBuild) return [];

  const expertCategoryLabels = new Map(
    selectedExpertBuild.categoryGroups.map((group) => [group.id, group.name])
  );

  const yourSharedIds = new Set(
    selectedProducts
      .filter((product) =>
        selectedExpertBuild.items.some((expertProduct) => expertProduct.id === product.id)
      )
      .map((product) => product.id)
  );
  const expertSharedIds = new Set(yourSharedIds);
  const categoryOrder = new Set([
    ...selectedProducts.map((product) => product.categoryId),
    ...selectedExpertBuild.items.map((product) => product.categoryId),
  ]);

  return Array.from(categoryOrder)
    .map((categoryId) => {
      const categoryLabel =
        expertCategoryLabels.get(categoryId) ||
        categories.find((category) => category.id === categoryId)?.label ||
        "Other";
      const categoryYourProducts = selectedProducts.filter(
        (product) => product.categoryId === categoryId
      );
      const categoryExpertProducts = selectedExpertBuild.items.filter(
        (product) => product.categoryId === categoryId
      );
      const rows: CompareCategoryRow[] = [];

      categoryYourProducts
        .filter((product) => yourSharedIds.has(product.id))
        .forEach((product) => {
          rows.push({
            key: `match-${categoryId}-${product.id}`,
            status: "Match",
            yourProduct: product,
            expertProduct: product,
          });
        });

      const remainingYour = categoryYourProducts.filter(
        (product) => !yourSharedIds.has(product.id)
      );
      const remainingExpert = categoryExpertProducts.filter(
        (product) => !expertSharedIds.has(product.id)
      );
      const differentCount = Math.min(remainingYour.length, remainingExpert.length);

      for (let index = 0; index < differentCount; index += 1) {
        rows.push({
          key: `different-${categoryId}-${remainingYour[index].id}-${remainingExpert[index].id}`,
          status: "Different item",
          yourProduct: remainingYour[index],
          expertProduct: remainingExpert[index],
          actionProduct: remainingExpert[index],
        });
      }

      remainingExpert.slice(differentCount).forEach((product) => {
        rows.push({
          key: `missing-${categoryId}-${product.id}`,
          status: "Missing from your build",
          yourProduct: null,
          expertProduct: product,
          actionProduct: product,
        });
      });

      remainingYour.slice(differentCount).forEach((product) => {
        rows.push({
          key: `only-${categoryId}-${product.id}`,
          status: "Only in your build",
          yourProduct: product,
          expertProduct: null,
        });
      });

      return {
        categoryId,
        categoryLabel,
        rows,
      };
    })
    .filter((section) => section.rows.length > 0);
}

export function getCompareFilterCounts(
  compareCategorySections: CompareCategorySection[]
) {
  const allRows = compareCategorySections.flatMap((section) => section.rows);

  return {
    all: allRows.length,
    missing: allRows.filter((row) => row.status === "Missing from your build")
      .length,
    different: allRows.filter((row) => row.status === "Different item").length,
    matches: allRows.filter((row) => row.status === "Match").length,
    "yours-only": allRows.filter((row) => row.status === "Only in your build")
      .length,
  };
}

export function getFilteredCompareCategorySections(
  compareCategorySections: CompareCategorySection[],
  activeCompareFilter: CompareFilter
): CompareCategorySection[] {
  const matchesFilter = (row: CompareCategoryRow) => {
    switch (activeCompareFilter) {
      case "missing":
        return row.status === "Missing from your build";
      case "different":
        return row.status === "Different item";
      case "matches":
        return row.status === "Match";
      case "yours-only":
        return row.status === "Only in your build";
      case "all":
      default:
        return true;
    }
  };

  return compareCategorySections
    .map((section) => ({
      ...section,
      rows: section.rows.filter(matchesFilter),
    }))
    .filter((section) => section.rows.length > 0);
}

export function getCompareFilterMeta(
  activeCompareFilter: CompareFilter
): CompareFilterMeta {
  switch (activeCompareFilter) {
    case "missing":
      return {
        title: "Showing missing items from the expert build",
        emptyTitle: "No missing items",
        emptyBody:
          "Your build already includes everything shown in the selected expert build.",
      };
    case "different":
      return {
        title: "Showing different item recommendations",
        emptyTitle: "No different-item comparisons",
        emptyBody:
          "Your build does not currently have any category conflicts with the selected expert build.",
      };
    case "matches":
      return {
        title: "Showing shared items already aligned",
        emptyTitle: "No exact matches yet",
        emptyBody:
          "There are not any exact item overlaps between your build and the selected expert build yet.",
      };
    case "yours-only":
      return {
        title: "Showing items unique to your build",
        emptyTitle: "No user-only items",
        emptyBody:
          "Everything in your build is also represented in the selected expert build.",
      };
    case "all":
    default:
      return {
        title: "Showing all comparison rows",
        emptyTitle: "No comparison rows available",
        emptyBody:
          "Select an expert build to compare it with your current build.",
      };
  }
}
