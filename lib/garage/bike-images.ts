import type { SupabaseBike } from "@/types/garage";
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
