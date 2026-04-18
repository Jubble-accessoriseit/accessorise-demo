import type { BikePhoto, SavedBuildPhoto, SupabaseBike } from "@/types/garage";
import { demoBikeImages } from "@/lib/demo-content/images";

export const FALLBACK_BIKE_PLACEHOLDER = "/bike-placeholder.jpg";

function normalizeBikeCategory(category: string | null | undefined) {
  return category?.trim().toLowerCase() ?? "";
}

export const GARAGE_BIKE_CATEGORY_IMAGE_MAP: Record<string, string> = {
  adventure: demoBikeImages.yamahaTenere700.path,
  "adventure touring": demoBikeImages.bmwR1300GSA.path,
  touring: demoBikeImages.bmwR1300GS.path,
  "sport touring": demoBikeImages.bmwR1300GS.path,
  dualsport: demoBikeImages.yamahaTenere700.path,
  "dual sport": demoBikeImages.yamahaTenere700.path,
  scrambler: demoBikeImages.yamahaTenere700.path,
  enduro: demoBikeImages.ktm890Adventure.path,
  offroad: demoBikeImages.ktm890Adventure.path,
  "off-road": demoBikeImages.ktm890Adventure.path,
  trail: demoBikeImages.ktm890Adventure.path,
};

export function getGarageBikeCategoryImage(category: string | null | undefined) {
  const normalized = normalizeBikeCategory(category);
  return GARAGE_BIKE_CATEGORY_IMAGE_MAP[normalized] ?? null;
}

export function resolveGarageBikeImage(
  bike:
    | Pick<SupabaseBike, "heroImageUrl" | "image" | "category">
    | null
    | undefined
) {
  if (!bike) {
    return FALLBACK_BIKE_PLACEHOLDER;
  }

  return (
    bike.heroImageUrl ||
    bike.image ||
    getGarageBikeCategoryImage(bike.category) ||
    FALLBACK_BIKE_PLACEHOLDER
  );
}

function getPreferredGaragePhotoUrl(
  photos: Array<Pick<BikePhoto, "imageUrl" | "isCover" | "sortOrder">> | Array<Pick<SavedBuildPhoto, "imageUrl" | "isCover" | "sortOrder">> | null | undefined
) {
  if (!photos || photos.length === 0) {
    return null;
  }

  const preferredPhoto =
    photos.find((photo) => photo.isCover) ??
    [...photos].sort((left, right) => left.sortOrder - right.sortOrder)[0] ??
    null;

  return preferredPhoto?.imageUrl ?? null;
}

export function resolveGarageBikePreviewImage(input: {
  bike:
    | Pick<SupabaseBike, "heroImageUrl" | "image" | "category" | "photos">
    | null
    | undefined;
  build?:
    | {
        photos?: Array<Pick<SavedBuildPhoto, "imageUrl" | "isCover" | "sortOrder">>;
      }
    | null
    | undefined;
}) {
  const buildPhotoUrl = getPreferredGaragePhotoUrl(input.build?.photos);

  if (buildPhotoUrl) {
    return buildPhotoUrl;
  }

  const bikePhotoUrl = getPreferredGaragePhotoUrl(input.bike?.photos);

  if (bikePhotoUrl) {
    return bikePhotoUrl;
  }

  return resolveGarageBikeImage(input.bike);
}
