import type {
  ActiveWorkingBikeContext,
  GarageBikeRecord,
  GarageBuildRecord,
  GarageResumeEntry,
  SupabaseBike,
} from "@/types/garage";

function normalizeGarageBikeLabelPart(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function createGarageBikeLabelSignature(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsGarageBikeLabelSignature(haystack: string, needle: string) {
  if (!haystack || !needle) {
    return false;
  }

  return (` ${haystack} `).includes(` ${needle} `);
}

function isGeneratedGarageBikeIdentityName(input: {
  candidate: string;
  make: string;
  model: string;
  variant?: string | null;
  year: number;
}) {
  const candidateSignature = createGarageBikeLabelSignature(input.candidate);

  if (!candidateSignature) {
    return false;
  }

  const identitySignatures = new Set(
    [
      [input.make, input.model, input.variant, input.year],
      [input.make, input.model, input.year],
      [input.model, input.variant, input.year],
      [input.make, input.model, input.variant],
      [input.model, input.variant],
      [input.make, input.model],
    ]
      .map((parts) =>
        createGarageBikeLabelSignature(
          parts
            .map((value) => normalizeGarageBikeLabelPart(value))
            .filter(Boolean)
            .join(" ")
        )
      )
      .filter(Boolean)
  );

  return identitySignatures.has(candidateSignature);
}

export function getGarageBikeIdentityLabel(bike: {
  make: string;
  model: string;
  year: number;
  variant?: string | null;
}) {
  return [
    normalizeGarageBikeLabelPart(bike.make),
    normalizeGarageBikeLabelPart(bike.model),
    normalizeGarageBikeLabelPart(bike.variant),
    normalizeGarageBikeLabelPart(bike.year),
  ]
    .filter(Boolean)
    .join(" ");
}

export function getGarageBikeDisplayName(bike: {
  make: string;
  model: string;
  year: number;
  variant?: string | null;
  garageBikeName?: string | null;
  nickname?: string | null;
}) {
  return (
    bike.garageBikeName?.trim() ||
    bike.nickname?.trim() ||
    getGarageBikeIdentityLabel(bike)
  );
}

export function getGarageBikeSelectorLabel(bike: {
  make: string;
  model: string;
  year: number;
  variant?: string | null;
  garageBikeName?: string | null;
  nickname?: string | null;
}) {
  const nickname = normalizeGarageBikeLabelPart(
    bike.garageBikeName ?? bike.nickname
  );
  const identityLabel = getGarageBikeIdentityLabel(bike);

  if (nickname && identityLabel) {
    return `${nickname} — ${identityLabel}`;
  }

  return nickname || identityLabel;
}

export function getGarageBikePickerLabel(bike: {
  make: string;
  model: string;
  year: number;
  variant?: string | null;
  garageBikeName?: string | null;
  nickname?: string | null;
}) {
  const make = normalizeGarageBikeLabelPart(bike.make);
  const model = normalizeGarageBikeLabelPart(bike.model);
  const variant = normalizeGarageBikeLabelPart(bike.variant);
  const year = normalizeGarageBikeLabelPart(bike.year);
  const savedBikeName = normalizeGarageBikeLabelPart(
    bike.garageBikeName ?? bike.nickname
  );
  const savedBikeNameSignature = createGarageBikeLabelSignature(savedBikeName);

  const seen = new Set<string>();

  return [
    savedBikeName,
    containsGarageBikeLabelSignature(savedBikeNameSignature, createGarageBikeLabelSignature(make))
      ? ""
      : make,
    containsGarageBikeLabelSignature(savedBikeNameSignature, createGarageBikeLabelSignature(model))
      ? ""
      : model,
    containsGarageBikeLabelSignature(savedBikeNameSignature, createGarageBikeLabelSignature(variant))
      ? ""
      : variant,
    containsGarageBikeLabelSignature(savedBikeNameSignature, createGarageBikeLabelSignature(year))
      ? ""
      : year,
  ]
    .filter((part) => {
      if (!part) {
        return false;
      }

      const signature = createGarageBikeLabelSignature(part);

      if (!signature || seen.has(signature)) {
        return false;
      }

      seen.add(signature);
      return true;
    })
    .join(" ");
}

function getGarageResumeEntrySavedBikeName(input: {
  bike: {
    make: string;
    model: string;
    year: number;
    variant?: string | null;
    garageBikeName?: string | null;
    nickname?: string | null;
  };
  build: {
    name: string;
  };
}) {
  const garageBikeName = normalizeGarageBikeLabelPart(input.bike.garageBikeName);
  const nickname = normalizeGarageBikeLabelPart(input.bike.nickname);
  const buildName = normalizeGarageBikeLabelPart(input.build.name);
  const buildNameIsIdentity = buildName
    ? isGeneratedGarageBikeIdentityName({
        candidate: buildName,
        make: input.bike.make,
        model: input.bike.model,
        variant: input.bike.variant,
        year: input.bike.year,
      })
    : false;
  const garageBikeNameIsIdentity = garageBikeName
    ? isGeneratedGarageBikeIdentityName({
        candidate: garageBikeName,
        make: input.bike.make,
        model: input.bike.model,
        variant: input.bike.variant,
        year: input.bike.year,
      })
    : false;
  const nicknameIsIdentity = nickname
    ? isGeneratedGarageBikeIdentityName({
        candidate: nickname,
        make: input.bike.make,
        model: input.bike.model,
        variant: input.bike.variant,
        year: input.bike.year,
      })
    : false;

  if (buildName && !buildNameIsIdentity) {
    return buildName;
  }

  if (garageBikeName && !garageBikeNameIsIdentity) {
    return garageBikeName;
  }

  if (nickname && !nicknameIsIdentity) {
    return nickname;
  }

  return buildName || garageBikeName || nickname;
}

export function getGarageResumeEntryPickerLabel(input: {
  bike: {
    make: string;
    model: string;
    year: number;
    variant?: string | null;
    garageBikeName?: string | null;
    nickname?: string | null;
  };
  build: {
    name: string;
  };
}) {
  const make = normalizeGarageBikeLabelPart(input.bike.make);
  const model = normalizeGarageBikeLabelPart(input.bike.model);
  const variant = normalizeGarageBikeLabelPart(input.bike.variant);
  const year = normalizeGarageBikeLabelPart(input.bike.year);
  const savedBikeName = getGarageResumeEntrySavedBikeName(input);
  const savedBikeNameSignature = createGarageBikeLabelSignature(savedBikeName);
  const seen = new Set<string>();

  return [
    savedBikeName,
    containsGarageBikeLabelSignature(savedBikeNameSignature, createGarageBikeLabelSignature(make))
      ? ""
      : make,
    containsGarageBikeLabelSignature(savedBikeNameSignature, createGarageBikeLabelSignature(model))
      ? ""
      : model,
    containsGarageBikeLabelSignature(savedBikeNameSignature, createGarageBikeLabelSignature(variant))
      ? ""
      : variant,
    containsGarageBikeLabelSignature(savedBikeNameSignature, createGarageBikeLabelSignature(year))
      ? ""
      : year,
  ]
    .filter((part) => {
      if (!part) {
        return false;
      }

      const signature = createGarageBikeLabelSignature(part);

      if (!signature || seen.has(signature)) {
        return false;
      }

      seen.add(signature);
      return true;
    })
    .join(" ");
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
    garageBikeName: nickname.trim() || null,
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
          bikeName: getGarageResumeEntrySavedBikeName({ bike, build }),
          buildName: build.name,
          bikeLabel: getGarageBikeIdentityLabel(bike),
          optionLabel: getGarageResumeEntryPickerLabel({ bike, build }),
          updatedAt: build.updatedAt,
          isPrimary: build.isPrimary,
        }))
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function compareGarageBuildSelectionPriority(
  left: GarageBuildRecord,
  right: GarageBuildRecord
) {
  if (left.isPrimary !== right.isPrimary) {
    return left.isPrimary ? -1 : 1;
  }

  const leftUpdated = new Date(left.updatedAt || left.createdAt || 0).getTime();
  const rightUpdated = new Date(right.updatedAt || right.createdAt || 0).getTime();

  if (leftUpdated !== rightUpdated) {
    return rightUpdated - leftUpdated;
  }

  return left.name.localeCompare(right.name);
}

export function getPreferredGarageBuildForBike(input: {
  garageBikes: GarageBikeRecord[];
  selectedBikeId: string;
  preferredBuildId?: string | null;
}) {
  const selectedBike = input.garageBikes.find((bike) => bike.id === input.selectedBikeId) ?? null;

  if (!selectedBike) {
    return null;
  }

  const templateBikeId = selectedBike.sourceBikeId ?? selectedBike.id;
  const relatedBuilds = input.garageBikes
    .filter((bike) => (bike.sourceBikeId ?? bike.id) === templateBikeId)
    .flatMap((bike) => bike.builds)
    .filter((build) => build.status !== "Archived")
    .sort(compareGarageBuildSelectionPriority);

  if (relatedBuilds.length === 0) {
    return null;
  }

  if (input.preferredBuildId) {
    return (
      relatedBuilds.find((build) => build.id === input.preferredBuildId) ?? relatedBuilds[0]
    );
  }

  return relatedBuilds[0];
}
