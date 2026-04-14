import type {
  GarageBuildRecord,
  GarageOwnershipStatus,
  SavedBuildPhoto,
  SupabaseBike,
} from "@/types/garage";

const GARAGE_LOCAL_SNAPSHOT_STORAGE_KEY = "accessorise-it.garage-local-snapshot.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeBuildPhotos(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as SavedBuildPhoto[];
  }

  return value.reduce<SavedBuildPhoto[]>((acc, photo) => {
    if (
      !isRecord(photo) ||
      typeof photo.id !== "string" ||
      typeof photo.buildId !== "string" ||
      typeof photo.imageUrl !== "string" ||
      typeof photo.sortOrder !== "number" ||
      typeof photo.isCover !== "boolean" ||
      typeof photo.createdAt !== "string"
    ) {
      return acc;
    }

    acc.push({
      id: photo.id,
      buildId: photo.buildId,
      imageUrl: photo.imageUrl,
      caption: typeof photo.caption === "string" ? photo.caption : null,
      sortOrder: photo.sortOrder,
      isCover: photo.isCover,
      createdAt: photo.createdAt,
    });

    return acc;
  }, []);
}

function normalizeBike(value: unknown): SupabaseBike | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.make !== "string" ||
    typeof value.model !== "string" ||
    typeof value.year !== "number"
  ) {
    return null;
  }

  return {
    id: value.id,
    sourceBikeId: typeof value.sourceBikeId === "string" ? value.sourceBikeId : null,
    make: value.make,
    model: value.model,
    variant: typeof value.variant === "string" ? value.variant : null,
    year: value.year,
    category: typeof value.category === "string" ? value.category : null,
    engine_cc: typeof value.engine_cc === "number" ? value.engine_cc : null,
    image: typeof value.image === "string" ? value.image : null,
    heroImageUrl: typeof value.heroImageUrl === "string" ? value.heroImageUrl : null,
    photoCount: typeof value.photoCount === "number" ? value.photoCount : 0,
    coverPhotoId: typeof value.coverPhotoId === "string" ? value.coverPhotoId : null,
    photos: Array.isArray(value.photos) ? value.photos : [],
    sourceLabel: typeof value.sourceLabel === "string" ? value.sourceLabel : null,
    sourceUrl: typeof value.sourceUrl === "string" ? value.sourceUrl : null,
    nickname: typeof value.nickname === "string" ? value.nickname : null,
    ownershipStatus:
      value.ownershipStatus === "Owned" ||
      value.ownershipStatus === "In service" ||
      value.ownershipStatus === "Previously owned" ||
      value.ownershipStatus === "Wishlist"
        ? (value.ownershipStatus as GarageOwnershipStatus)
        : null,
    isArchived: value.isArchived === true,
  };
}

export type PersistedGarageLocalSnapshot = {
  bikes: SupabaseBike[];
  buildsByBike: Record<string, GarageBuildRecord[]>;
  bikeMetaById: Record<
    string,
    { nickname?: string | null; ownershipStatus?: GarageOwnershipStatus | null; isArchived?: boolean }
  >;
  buildPhotosByBuildId: Record<string, SavedBuildPhoto[]>;
};

export function readPersistedGarageLocalSnapshot(): PersistedGarageLocalSnapshot {
  if (typeof window === "undefined") {
    return {
      bikes: [],
      buildsByBike: {},
      bikeMetaById: {},
      buildPhotosByBuildId: {},
    };
  }

  try {
    const raw = window.localStorage.getItem(GARAGE_LOCAL_SNAPSHOT_STORAGE_KEY);

    if (!raw) {
      return {
        bikes: [],
        buildsByBike: {},
        bikeMetaById: {},
        buildPhotosByBuildId: {},
      };
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!isRecord(parsed)) {
      return {
        bikes: [],
        buildsByBike: {},
        bikeMetaById: {},
        buildPhotosByBuildId: {},
      };
    }

    const bikes = Array.isArray(parsed.bikes)
      ? parsed.bikes
          .map(normalizeBike)
          .filter((bike): bike is SupabaseBike => bike !== null)
      : [];

    const buildsByBike = isRecord(parsed.buildsByBike)
      ? Object.entries(parsed.buildsByBike).reduce<Record<string, GarageBuildRecord[]>>(
          (acc, [bikeId, builds]) => {
            if (Array.isArray(builds)) {
              acc[bikeId] = builds as GarageBuildRecord[];
            }

            return acc;
          },
          {}
        )
      : {};

    const bikeMetaById = isRecord(parsed.bikeMetaById)
      ? (parsed.bikeMetaById as PersistedGarageLocalSnapshot["bikeMetaById"])
      : {};

    const buildPhotosByBuildId = isRecord(parsed.buildPhotosByBuildId)
      ? Object.entries(parsed.buildPhotosByBuildId).reduce<Record<string, SavedBuildPhoto[]>>(
          (acc, [buildId, photos]) => {
            acc[buildId] = normalizeBuildPhotos(photos);
            return acc;
          },
          {}
        )
      : {};

    return {
      bikes,
      buildsByBike,
      bikeMetaById,
      buildPhotosByBuildId,
    };
  } catch {
    return {
      bikes: [],
      buildsByBike: {},
      bikeMetaById: {},
      buildPhotosByBuildId: {},
    };
  }
}

export function writePersistedGarageLocalSnapshot(
  snapshot: PersistedGarageLocalSnapshot
) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(
      GARAGE_LOCAL_SNAPSHOT_STORAGE_KEY,
      JSON.stringify(snapshot)
    );
    return true;
  } catch {
    return false;
  }
}
