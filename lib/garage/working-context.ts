import type {
  ActiveWorkingBikeContext,
  GarageBikeRecord,
  GarageResumeEntry,
  SupabaseBike,
} from "@/types/garage";

export function getGarageBikeDisplayName(bike: {
  make: string;
  model: string;
  year: number;
  variant?: string | null;
  nickname?: string | null;
}) {
  const variant = bike.variant?.trim();
  return bike.nickname?.trim() || `${bike.make} ${bike.model}${variant ? ` ${variant}` : ""} ${bike.year}`;
}

export function createGarageBikeInstanceId(templateBike: SupabaseBike) {
  return `garage-bike:${templateBike.id}:${Date.now()}`;
}

export function createGarageBikeInstanceFromTemplate(input: {
  templateBike: SupabaseBike;
  garageBikeId: string;
  nickname: string;
}): SupabaseBike {
  const { templateBike, garageBikeId, nickname } = input;

  return {
    ...templateBike,
    id: garageBikeId,
    sourceBikeId: templateBike.id,
    nickname: nickname.trim() || null,
    ownershipStatus: "Owned",
    isArchived: false,
    photos: [],
    photoCount: 0,
    coverPhotoId: null,
  };
}

export function createActiveWorkingBikeContext(input: {
  selectedBikeId: string;
  currentBike: SupabaseBike | null;
  garageBikes: GarageBikeRecord[];
  templateBikes: SupabaseBike[];
}): ActiveWorkingBikeContext {
  const { selectedBikeId, currentBike, garageBikes, templateBikes } = input;

  if (!selectedBikeId || !currentBike) {
    return {
      selectedBikeId: null,
      source: "none",
      bike: null,
      templateBike: null,
      garageBike: null,
      garageBikeId: null,
      templateBikeId: null,
      isSavedGarageBike: false,
    };
  }

  const garageBike = garageBikes.find((bike) => bike.id === selectedBikeId) ?? null;
  const templateBikeId = garageBike?.sourceBikeId ?? (garageBike ? null : currentBike.id);
  const templateBike =
    (templateBikeId
      ? templateBikes.find((bike) => bike.id === templateBikeId) ?? null
      : null) ?? (!garageBike ? currentBike : null);

  return {
    selectedBikeId,
    source: garageBike ? "garage" : "template",
    bike: currentBike,
    templateBike,
    garageBike,
    garageBikeId: garageBike?.id ?? null,
    templateBikeId: templateBike?.id ?? null,
    isSavedGarageBike: !!garageBike,
  };
}

export function buildGarageResumeEntries(bikes: GarageBikeRecord[]): GarageResumeEntry[] {
  return bikes
    .flatMap((bike) =>
      bike.builds
        .filter((build) => build.status !== "Archived")
        .map((build) => ({
          key: `${bike.id}:${build.id}`,
          bikeId: bike.id,
          buildId: build.id,
          bikeName: getGarageBikeDisplayName(bike),
          buildName: build.name,
          bikeLabel: `${bike.make} ${bike.model} ${bike.year}`,
          updatedAt: build.updatedAt,
          isPrimary: build.isPrimary,
        }))
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}
