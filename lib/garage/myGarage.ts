import {
  GarageBikeOverviewCard,
  GarageBikeRecord,
  GarageBuildCategoryGroup,
  GarageBuildItem,
  GarageBuildRecord,
  GarageCategory,
  Product,
} from "@/types/garage";
import type { ResolvedExpertBuild } from "../expert-builds/types";

export function groupGarageBuildProductsByCategory(
  products: Product[],
  categories: GarageCategory[]
): GarageBuildCategoryGroup[] {
  return categories
    .filter((category) => category.id !== "all")
    .map((category) => ({
      categoryId: category.id,
      categoryLabel: category.label,
      items: products.filter((product) => product.categoryId === category.id),
    }))
    .filter((group) => group.items.length > 0);
}

export function createGarageBuildRecord(
  build: Omit<
    GarageBuildRecord,
    "accessoryCount" | "indicativeTotal" | "productGroups"
  > & {
    productGroups?: GarageBuildCategoryGroup[];
  }
): GarageBuildRecord {
  const allItems = build.buildItems.map((item) => item.product);
  const productGroups =
    build.productGroups ?? groupGarageBuildProductsByCategory(allItems, []);

  return {
    ...build,
    productGroups,
    accessoryCount: allItems.length,
    indicativeTotal: allItems.reduce((total, item) => total + item.price, 0),
  };
}

export function createGarageBuildItems(
  buildId: string,
  products: Product[],
  createdAt: string
): GarageBuildItem[] {
  return products.map((product, index) => ({
    id: `${buildId}-item-${product.id}-${index}`,
    buildId,
    productId: product.id,
    product,
    sortOrder: index,
    createdAt,
  }));
}

export function mapExpertBuildCategoryGroups(
  expertBuild: ResolvedExpertBuild
): GarageBuildCategoryGroup[] {
  return expertBuild.categoryGroups.map((group) => ({
    categoryId: group.id,
    categoryLabel: group.name,
    items: [...group.items],
  }));
}

export function createGarageBikeRecord(
  bike: Omit<GarageBikeRecord, "photoCount"> & { photoCount?: number }
): GarageBikeRecord {
  return {
    ...bike,
    photoCount: bike.photoCount ?? bike.photos?.length ?? 0,
  };
}

export function buildGarageOverviewCards(
  bikes: GarageBikeRecord[]
): GarageBikeOverviewCard[] {
  return bikes.map((bike) => ({
    id: bike.id,
    heroImageUrl: bike.heroImageUrl ?? bike.photos?.find((photo) => photo.isCover)?.imageUrl ?? bike.image ?? null,
    make: bike.make,
    model: bike.model,
    year: bike.year,
    nickname: bike.nickname ?? null,
    ownershipStatus: bike.ownershipStatus ?? null,
    photoCount: bike.photoCount ?? bike.photos?.length ?? 0,
    buildCount: bike.builds.length,
  }));
}

export function getGarageBikeBuild(
  bikes: GarageBikeRecord[],
  bikeId: string,
  buildId: string
): GarageBuildRecord | null {
  const bike = bikes.find((item) => item.id === bikeId);

  if (!bike) return null;

  return bike.builds.find((build) => build.id === buildId) ?? null;
}
