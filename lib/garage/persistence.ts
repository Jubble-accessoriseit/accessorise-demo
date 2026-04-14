import { supabase } from "@/lib/supabase";
import type { PersistedGarageBuildMetadata } from "./build-lineage-persistence";
import type {
  BikePhoto,
  GarageBikeRecord,
  GarageBuildItem,
  GarageBuildRecord,
  GarageBuildStatus,
  GarageBuildType,
  GarageOwnershipStatus,
  Product,
  SavedBuildPhoto,
  SupabaseBike,
} from "@/types/garage";

type GarageBikeRow = {
  id: string;
  user_id: string;
  source_bike_id: string | null;
  make: string;
  model: string;
  year: number;
  variant: string | null;
  garage_bike_name: string | null;
  nickname: string | null;
  ownership_status: GarageOwnershipStatus | null;
  is_archived: boolean;
  hero_image_url: string | null;
  cover_photo_id: string | null;
  created_at: string;
  updated_at: string;
};

type GarageBuildRow = {
  id: string;
  user_id: string;
  bike_id: string;
  name: string;
  status: GarageBuildStatus;
  build_type: GarageBuildType;
  is_primary: boolean;
  is_archived: boolean;
  notes: string | null;
  provenance_json: PersistedGarageBuildMetadata["provenance"] | null;
  version_json: PersistedGarageBuildMetadata["version"] | null;
  version_summary_json: PersistedGarageBuildMetadata["versionSummary"] | null;
  lineage_json: PersistedGarageBuildMetadata["lineage"] | null;
  history_json: PersistedGarageBuildMetadata["history"] | null;
  created_at: string;
  updated_at: string;
};

type GarageBuildItemRow = {
  id: string;
  build_id: string;
  user_id: string;
  product_id: number;
  product_snapshot: Product;
  sort_order: number;
  created_at: string;
};

type GarageBikePhotoRow = {
  id: string;
  bike_id: string;
  user_id: string;
  image_url: string;
  storage_path: string | null;
  caption: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
};

type GarageBuildPhotoRow = {
  id: string;
  build_id: string;
  user_id: string;
  image_url: string;
  storage_path: string | null;
  caption: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
};

export type PersistedGarageSnapshot = {
  bikes: GarageBikeRecord[];
  buildsByBike: Record<string, GarageBuildRecord[]>;
  garageBikeMetaById: Record<
    string,
    {
      nickname?: string | null;
      ownershipStatus?: GarageOwnershipStatus | null;
      isArchived?: boolean;
    }
  >;
  buildMetadataById: Record<string, PersistedGarageBuildMetadata>;
  buildPhotosByBuildId: Record<string, SavedBuildPhoto[]>;
};

const GARAGE_BIKE_PHOTO_BUCKET = "garage-bike-photos";
const GARAGE_BUILD_PHOTO_BUCKET = "garage-build-photos";

function isStorageUnavailableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    message?: unknown;
    statusCode?: unknown;
    status?: unknown;
    error?: unknown;
  };

  const message =
    typeof maybeError.message === "string"
      ? maybeError.message.toLowerCase()
      : "";
  const statusCode =
    typeof maybeError.statusCode === "number"
      ? maybeError.statusCode
      : typeof maybeError.status === "number"
      ? maybeError.status
      : null;
  const errorCode =
    typeof maybeError.error === "string"
      ? maybeError.error.toLowerCase()
      : "";

  return (
    message.includes("bucket not found") ||
    errorCode.includes("bucket not found") ||
    statusCode === 404 ||
    statusCode === 400
  );
}

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

function mapBuildItemRow(row: GarageBuildItemRow): GarageBuildItem {
  return {
    id: row.id,
    buildId: row.build_id,
    productId: row.product_id,
    product: row.product_snapshot,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function mapBikePhotoRow(row: GarageBikePhotoRow): BikePhoto {
  return {
    id: row.id,
    bikeId: row.bike_id,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    caption: row.caption,
    sortOrder: row.sort_order,
    isCover: row.is_cover,
    createdAt: row.created_at,
  };
}

function mapBuildPhotoRow(row: GarageBuildPhotoRow): SavedBuildPhoto {
  return {
    id: row.id,
    buildId: row.build_id,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    caption: row.caption,
    sortOrder: row.sort_order,
    isCover: row.is_cover,
    createdAt: row.created_at,
  };
}

function groupPhotosByBike(rows: GarageBikePhotoRow[]) {
  return rows.reduce<Record<string, BikePhoto[]>>((acc, row) => {
    const photo = mapBikePhotoRow(row);
    acc[photo.bikeId] = [...(acc[photo.bikeId] ?? []), photo].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    return acc;
  }, {});
}

function groupPhotosByBuild(rows: GarageBuildPhotoRow[]) {
  return rows.reduce<Record<string, SavedBuildPhoto[]>>((acc, row) => {
    const photo = mapBuildPhotoRow(row);
    acc[photo.buildId] = [...(acc[photo.buildId] ?? []), photo].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    return acc;
  }, {});
}

function groupItemsByBuild(rows: GarageBuildItemRow[]) {
  return rows.reduce<Record<string, GarageBuildItem[]>>((acc, row) => {
    const item = mapBuildItemRow(row);
    acc[item.buildId] = [...(acc[item.buildId] ?? []), item].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    return acc;
  }, {});
}

function buildGroupsFromItems(items: GarageBuildItem[]) {
  const groups = new Map<string, { categoryId: string; categoryLabel: string; items: Product[] }>();

  items.forEach((item) => {
    const categoryId = item.product.categoryId;
    const existingGroup = groups.get(categoryId);
    const categoryLabel = categoryId
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    if (existingGroup) {
      existingGroup.items.push(item.product);
      return;
    }

    groups.set(categoryId, {
      categoryId,
      categoryLabel,
      items: [item.product],
    });
  });

  return Array.from(groups.values());
}

function mapBuildRow(
  row: GarageBuildRow,
  buildItems: GarageBuildItem[],
  photos: SavedBuildPhoto[]
): GarageBuildRecord {
  const productGroups = buildGroupsFromItems(buildItems);
  const indicativeTotal = buildItems.reduce((total, item) => total + item.product.price, 0);

  return {
    id: row.id,
    bikeId: row.bike_id,
    name: row.name,
    status: row.is_archived ? "Archived" : row.status,
    buildType: row.build_type,
    isPrimary: row.is_primary && !row.is_archived,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    accessoryCount: buildItems.length,
    indicativeTotal,
    buildItems,
    productGroups,
    provenance: row.provenance_json ?? null,
    version: row.version_json ?? null,
    versionSummary: row.version_summary_json ?? null,
    lineage: row.lineage_json ?? null,
    history: row.history_json ?? [],
    photos,
  };
}

function mapBikeRow(
  row: GarageBikeRow,
  sourceBike: SupabaseBike | null,
  builds: GarageBuildRecord[],
  photos: BikePhoto[]
): GarageBikeRecord {
  const coverPhoto = photos.find((photo) => photo.isCover) ?? null;

  return {
    id: row.id,
    sourceBikeId: row.source_bike_id,
    make: row.make,
    model: row.model,
    year: row.year,
    variant: row.variant,
    category: sourceBike?.category ?? null,
    engine_cc: sourceBike?.engine_cc ?? null,
    image: sourceBike?.image ?? row.hero_image_url ?? coverPhoto?.imageUrl ?? null,
    heroImageUrl: row.hero_image_url ?? coverPhoto?.imageUrl ?? null,
    photoCount: photos.length,
    coverPhotoId: row.cover_photo_id ?? coverPhoto?.id ?? null,
    photos,
    nickname: row.garage_bike_name ?? row.nickname,
    ownershipStatus: row.ownership_status,
    isArchived: row.is_archived,
    builds,
  };
}

export async function loadGarageFromSupabase(
  sourceBikes: SupabaseBike[]
): Promise<PersistedGarageSnapshot | null> {
  const userId = await getCurrentUserId();

  if (!userId) return null;

  const [
    { data: bikeRows, error: bikeError },
    { data: buildRows, error: buildError },
    { data: itemRows, error: itemError },
    { data: photoRows, error: photoError },
    { data: buildPhotoRows, error: buildPhotoError },
  ] =
    await Promise.all([
      supabase
        .from("garage_bikes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("garage_builds")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("garage_build_items")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("garage_bike_photos")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("garage_build_photos")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true }),
    ]);

  if (bikeError) throw bikeError;
  if (buildError) throw buildError;
  if (itemError) throw itemError;
  if (photoError) throw photoError;
  if (buildPhotoError) throw buildPhotoError;

  const itemsByBuild = groupItemsByBuild((itemRows ?? []) as GarageBuildItemRow[]);
  const photosByBike = groupPhotosByBike((photoRows ?? []) as GarageBikePhotoRow[]);
  const photosByBuild = groupPhotosByBuild((buildPhotoRows ?? []) as GarageBuildPhotoRow[]);
  const buildsByBike = ((buildRows ?? []) as GarageBuildRow[]).reduce<Record<string, GarageBuildRecord[]>>(
    (acc, row) => {
      const build = mapBuildRow(
        row,
        itemsByBuild[row.id] ?? [],
        photosByBuild[row.id] ?? []
      );
      acc[row.bike_id] = [...(acc[row.bike_id] ?? []), build].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
      );
      return acc;
    },
    {}
  );

  const bikes = ((bikeRows ?? []) as GarageBikeRow[])
    .filter((row) => !row.is_archived)
    .map((row) => {
      const sourceBike =
        sourceBikes.find((bike) => bike.id === row.source_bike_id) ?? null;
      const bikeBuilds = buildsByBike[row.id] ?? [];
      const bikePhotos = photosByBike[row.id] ?? [];

      return mapBikeRow(row, sourceBike, bikeBuilds, bikePhotos);
    });

  const garageBikeMetaById = ((bikeRows ?? []) as GarageBikeRow[]).reduce<
    PersistedGarageSnapshot["garageBikeMetaById"]
  >((acc, row) => {
    acc[row.id] = {
      nickname: row.garage_bike_name ?? row.nickname,
      ownershipStatus: row.ownership_status,
      isArchived: row.is_archived,
    };
    return acc;
  }, {});

  const buildMetadataById = ((buildRows ?? []) as GarageBuildRow[]).reduce<
    Record<string, PersistedGarageBuildMetadata>
  >((acc, row) => {
    acc[row.id] = {
      createdAt: row.created_at,
      provenance: row.provenance_json ?? null,
      version: row.version_json ?? null,
      versionSummary: row.version_summary_json ?? null,
      lineage: row.lineage_json ?? null,
      history: row.history_json ?? [],
    };
    return acc;
  }, {});

  return {
    bikes,
    buildsByBike,
    garageBikeMetaById,
    buildMetadataById,
    buildPhotosByBuildId: photosByBuild,
  };
}

export async function upsertGarageBike(input: {
  id?: string;
  sourceBikeId?: string | null;
  make: string;
  model: string;
  year: number;
  variant?: string | null;
  garageBikeName?: string | null;
  nickname?: string | null;
  ownershipStatus?: GarageOwnershipStatus | null;
  isArchived?: boolean;
  heroImageUrl?: string | null;
  coverPhotoId?: string | null;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You need to sign in before saving bikes.");
  }

  const payload = {
    id: input.id,
    user_id: userId,
    source_bike_id: input.sourceBikeId ?? null,
    make: input.make,
    model: input.model,
    year: input.year,
    variant: input.variant ?? null,
    garage_bike_name: input.garageBikeName ?? input.nickname ?? null,
    nickname: input.nickname ?? null,
    ownership_status: input.ownershipStatus ?? null,
    is_archived: input.isArchived ?? false,
    hero_image_url: input.heroImageUrl ?? null,
    cover_photo_id: input.coverPhotoId ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("garage_bikes")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;

  return data as GarageBikeRow;
}

function sanitizeStorageName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function uploadGarageBikePhoto(input: {
  bikeId: string;
  file: File;
  caption?: string | null;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You need to sign in before uploading bike photos.");
  }

  const extension = input.file.name.split(".").pop() || "jpg";
  const safeName = sanitizeStorageName(input.file.name.replace(/\.[^.]+$/, ""));
  const storagePath = `${userId}/${input.bikeId}/${Date.now()}-${safeName}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(GARAGE_BIKE_PHOTO_BUCKET)
    .upload(storagePath, input.file, { upsert: false });

  if (uploadError) {
    if (isStorageUnavailableError(uploadError)) {
      return null;
    }

    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from(GARAGE_BIKE_PHOTO_BUCKET)
    .getPublicUrl(storagePath);

  const { count } = await supabase
    .from("garage_bike_photos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("bike_id", input.bikeId);

  const { data, error } = await supabase
    .from("garage_bike_photos")
    .insert({
      bike_id: input.bikeId,
      user_id: userId,
      image_url: publicUrlData.publicUrl,
      storage_path: storagePath,
      caption: input.caption ?? input.file.name,
      sort_order: count ?? 0,
      is_cover: (count ?? 0) === 0,
    })
    .select("*")
    .single();

  if (error) throw error;

  const row = data as GarageBikePhotoRow;

  if (row.is_cover) {
    await supabase
      .from("garage_bikes")
      .update({
        hero_image_url: row.image_url,
        cover_photo_id: row.id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("id", input.bikeId);
  }

  return mapBikePhotoRow(row);
}

export async function setGarageBikeCoverPhoto(input: {
  bikeId: string;
  photoId: string;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You need to sign in before updating bike cover photos.");
  }

  const { error: clearError } = await supabase
    .from("garage_bike_photos")
    .update({ is_cover: false })
    .eq("user_id", userId)
    .eq("bike_id", input.bikeId);

  if (clearError) throw clearError;

  const { data, error } = await supabase
    .from("garage_bike_photos")
    .update({ is_cover: true })
    .eq("user_id", userId)
    .eq("bike_id", input.bikeId)
    .eq("id", input.photoId)
    .select("*")
    .single();

  if (error) throw error;

  const coverRow = data as GarageBikePhotoRow;

  const { error: bikeError } = await supabase
    .from("garage_bikes")
    .update({
      hero_image_url: coverRow.image_url,
      cover_photo_id: coverRow.id,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("id", input.bikeId);

  if (bikeError) throw bikeError;

  return mapBikePhotoRow(coverRow);
}

export async function deleteGarageBikePhoto(input: {
  bikeId: string;
  photoId: string;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You need to sign in before deleting bike photos.");
  }

  const { data: photo, error: photoError } = await supabase
    .from("garage_bike_photos")
    .select("*")
    .eq("user_id", userId)
    .eq("bike_id", input.bikeId)
    .eq("id", input.photoId)
    .single();

  if (photoError) throw photoError;

  const row = photo as GarageBikePhotoRow;

  const { error: deleteError } = await supabase
    .from("garage_bike_photos")
    .delete()
    .eq("user_id", userId)
    .eq("bike_id", input.bikeId)
    .eq("id", input.photoId);

  if (deleteError) throw deleteError;

  if (row.storage_path) {
    await supabase.storage.from(GARAGE_BIKE_PHOTO_BUCKET).remove([row.storage_path]);
  }
}

export async function upsertGarageBuild(input: {
  id?: string;
  bikeId: string;
  name: string;
  status: GarageBuildStatus;
  buildType: GarageBuildType;
  isPrimary: boolean;
  notes?: string | null;
  updatedAt?: string;
  metadata?: PersistedGarageBuildMetadata | null;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You need to sign in before saving builds.");
  }

  if (input.isPrimary) {
    const { error: clearPrimaryError } = await supabase
      .from("garage_builds")
      .update({ is_primary: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("bike_id", input.bikeId);

    if (clearPrimaryError) throw clearPrimaryError;
  }

  const payload = {
    id: input.id,
    user_id: userId,
    bike_id: input.bikeId,
    name: input.name,
    status: input.status,
    build_type: input.buildType,
    is_primary: input.isPrimary && input.status !== "Archived",
    is_archived: input.status === "Archived",
    notes: input.notes ?? null,
    provenance_json: input.metadata?.provenance ?? null,
    version_json: input.metadata?.version ?? null,
    version_summary_json: input.metadata?.versionSummary ?? null,
    lineage_json: input.metadata?.lineage ?? null,
    history_json: input.metadata?.history ?? [],
    updated_at: input.updatedAt ?? new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("garage_builds")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;

  return data as GarageBuildRow;
}

export async function replaceGarageBuildItems(
  buildId: string,
  items: Array<{ product: Product; sortOrder: number }>
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You need to sign in before saving build items.");
  }

  const { error: deleteError } = await supabase
    .from("garage_build_items")
    .delete()
    .eq("user_id", userId)
    .eq("build_id", buildId);

  if (deleteError) throw deleteError;

  if (items.length === 0) return [];

  const payload = items.map((item, index) => ({
    user_id: userId,
    build_id: buildId,
    product_id: item.product.id,
    product_snapshot: item.product,
    sort_order: item.sortOrder ?? index,
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("garage_build_items")
    .insert(payload)
    .select("*");

  if (error) throw error;

  return (data ?? []) as GarageBuildItemRow[];
}

export async function uploadGarageBuildPhoto(input: {
  buildId: string;
  file: File;
  caption?: string | null;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You need to sign in before uploading build photos.");
  }

  const extension = input.file.name.split(".").pop() || "jpg";
  const safeName = sanitizeStorageName(input.file.name.replace(/\.[^.]+$/, ""));
  const storagePath = `${userId}/${input.buildId}/${Date.now()}-${safeName}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(GARAGE_BUILD_PHOTO_BUCKET)
    .upload(storagePath, input.file, { upsert: false });

  if (uploadError) {
    if (isStorageUnavailableError(uploadError)) {
      return null;
    }

    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from(GARAGE_BUILD_PHOTO_BUCKET)
    .getPublicUrl(storagePath);

  const { count } = await supabase
    .from("garage_build_photos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("build_id", input.buildId);

  const { data, error } = await supabase
    .from("garage_build_photos")
    .insert({
      build_id: input.buildId,
      user_id: userId,
      image_url: publicUrlData.publicUrl,
      storage_path: storagePath,
      caption: input.caption ?? input.file.name,
      sort_order: count ?? 0,
      is_cover: (count ?? 0) === 0,
    })
    .select("*")
    .single();

  if (error) throw error;

  return mapBuildPhotoRow(data as GarageBuildPhotoRow);
}

export async function deleteGarageBuild(buildId: string) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You need to sign in before deleting builds.");
  }

  const { data: photoRows, error: photoError } = await supabase
    .from("garage_build_photos")
    .select("storage_path")
    .eq("user_id", userId)
    .eq("build_id", buildId);

  if (photoError) throw photoError;

  const storagePaths = (photoRows ?? [])
    .map((row) => (typeof row.storage_path === "string" ? row.storage_path : null))
    .filter((path): path is string => !!path);

  const { error: deleteError } = await supabase
    .from("garage_builds")
    .delete()
    .eq("user_id", userId)
    .eq("id", buildId);

  if (deleteError) throw deleteError;

  if (storagePaths.length > 0) {
    await supabase.storage.from(GARAGE_BUILD_PHOTO_BUCKET).remove(storagePaths);
  }
}

export async function deleteGarageBike(bikeId: string) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You need to sign in before deleting bikes.");
  }

  const [{ data: bikePhotos, error: bikePhotoError }, { data: buildRows, error: buildRowsError }] =
    await Promise.all([
      supabase
        .from("garage_bike_photos")
        .select("storage_path")
        .eq("user_id", userId)
        .eq("bike_id", bikeId),
      supabase
        .from("garage_builds")
        .select("id")
        .eq("user_id", userId)
        .eq("bike_id", bikeId),
    ]);

  if (bikePhotoError) throw bikePhotoError;
  if (buildRowsError) throw buildRowsError;

  const buildIds = (buildRows ?? []).map((row) => row.id as string);
  let buildPhotos: Array<{ storage_path: string | null }> = [];

  if (buildIds.length > 0) {
    const { data, error } = await supabase
      .from("garage_build_photos")
      .select("storage_path")
      .eq("user_id", userId)
      .in("build_id", buildIds);

    if (error) throw error;
    buildPhotos = (data ?? []) as Array<{ storage_path: string | null }>;
  }

  const storagePaths = [...(bikePhotos ?? []), ...buildPhotos]
    .map((row) => (typeof row.storage_path === "string" ? row.storage_path : null))
    .filter((path): path is string => !!path);

  const { error: deleteError } = await supabase
    .from("garage_bikes")
    .delete()
    .eq("user_id", userId)
    .eq("id", bikeId);

  if (deleteError) throw deleteError;

  if (storagePaths.length > 0) {
    await Promise.all([
      supabase.storage.from(GARAGE_BIKE_PHOTO_BUCKET).remove(
        storagePaths.filter((path) => path.includes(`/${bikeId}/`))
      ),
      supabase.storage.from(GARAGE_BUILD_PHOTO_BUCKET).remove(
        storagePaths.filter((path) => !path.includes(`/${bikeId}/`))
      ),
    ]);
  }
}

export const garageSchemaSql = `
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.garage_bikes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_bike_id text null,
  make text not null,
  model text not null,
  year integer not null check (year between 1900 and 2100),
  variant text null,
  nickname text null,
  ownership_status text null,
  is_archived boolean not null default false,
  hero_image_url text null,
  cover_photo_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint garage_bikes_ownership_status_check
    check (
      ownership_status is null
      or ownership_status in ('Owned', 'In service', 'Previously owned', 'Wishlist')
    )
);

create table if not exists public.garage_builds (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  bike_id text not null references public.garage_bikes(id) on delete cascade,
  name text not null,
  status text not null default 'Saved',
  build_type text not null default 'Personal Build',
  is_primary boolean not null default false,
  is_archived boolean not null default false,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint garage_builds_status_check
    check (status in ('Draft', 'Saved', 'Archived')),
  constraint garage_builds_build_type_check
    check (build_type in ('Personal Build', 'Expert Match', 'Travel Setup', 'Daily Setup'))
);

create table if not exists public.garage_build_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  build_id text not null references public.garage_builds(id) on delete cascade,
  product_id bigint not null,
  product_snapshot jsonb not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint garage_build_items_snapshot_object_check
    check (jsonb_typeof(product_snapshot) = 'object')
);

create table if not exists public.garage_bike_photos (
  id uuid primary key default gen_random_uuid(),
  bike_id text not null references public.garage_bikes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  storage_path text null,
  caption text null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists garage_bikes_user_id_idx on public.garage_bikes(user_id);
create index if not exists garage_bikes_user_active_idx on public.garage_bikes(user_id, updated_at desc) where is_archived = false;
create index if not exists garage_builds_user_bike_idx on public.garage_builds(user_id, bike_id);
create index if not exists garage_builds_bike_id_idx on public.garage_builds(bike_id);
create index if not exists garage_builds_active_bike_idx on public.garage_builds(bike_id, updated_at desc) where is_archived = false;
create unique index if not exists garage_builds_one_primary_per_bike_idx on public.garage_builds(user_id, bike_id) where is_primary = true and is_archived = false;
create index if not exists garage_build_items_build_id_idx on public.garage_build_items(build_id, sort_order);
create index if not exists garage_build_items_user_id_idx on public.garage_build_items(user_id);
create index if not exists garage_bike_photos_bike_id_idx on public.garage_bike_photos(bike_id, sort_order);
create index if not exists garage_bike_photos_user_id_idx on public.garage_bike_photos(user_id);
create unique index if not exists garage_bike_photos_one_cover_per_bike_idx on public.garage_bike_photos(user_id, bike_id) where is_cover = true;

drop trigger if exists set_garage_bikes_updated_at on public.garage_bikes;
create trigger set_garage_bikes_updated_at
before update on public.garage_bikes
for each row
execute function public.set_updated_at();

drop trigger if exists set_garage_builds_updated_at on public.garage_builds;
create trigger set_garage_builds_updated_at
before update on public.garage_builds
for each row
execute function public.set_updated_at();

alter table public.garage_bikes enable row level security;
alter table public.garage_builds enable row level security;
alter table public.garage_build_items enable row level security;
alter table public.garage_bike_photos enable row level security;

create policy "garage_bikes_select_own"
on public.garage_bikes
for select
to authenticated
using (auth.uid() = user_id);

create policy "garage_bikes_insert_own"
on public.garage_bikes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "garage_bikes_update_own"
on public.garage_bikes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "garage_bikes_delete_own"
on public.garage_bikes
for delete
to authenticated
using (auth.uid() = user_id);

create policy "garage_builds_select_own"
on public.garage_builds
for select
to authenticated
using (auth.uid() = user_id);

create policy "garage_builds_insert_own"
on public.garage_builds
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_bikes b
    where b.id = bike_id
      and b.user_id = auth.uid()
  )
);

create policy "garage_builds_update_own"
on public.garage_builds
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_bikes b
    where b.id = bike_id
      and b.user_id = auth.uid()
  )
);

create policy "garage_builds_delete_own"
on public.garage_builds
for delete
to authenticated
using (auth.uid() = user_id);

create policy "garage_build_items_select_own"
on public.garage_build_items
for select
to authenticated
using (auth.uid() = user_id);

create policy "garage_build_items_insert_own"
on public.garage_build_items
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_builds gb
    where gb.id = build_id
      and gb.user_id = auth.uid()
  )
);

create policy "garage_build_items_update_own"
on public.garage_build_items
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_builds gb
    where gb.id = build_id
      and gb.user_id = auth.uid()
  )
);

create policy "garage_build_items_delete_own"
on public.garage_build_items
for delete
to authenticated
using (auth.uid() = user_id);

create policy "garage_bike_photos_select_own"
on public.garage_bike_photos
for select
to authenticated
using (auth.uid() = user_id);

create policy "garage_bike_photos_insert_own"
on public.garage_bike_photos
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_bikes gb
    where gb.id = bike_id
      and gb.user_id = auth.uid()
  )
);

create policy "garage_bike_photos_update_own"
on public.garage_bike_photos
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.garage_bikes gb
    where gb.id = bike_id
      and gb.user_id = auth.uid()
  )
);

create policy "garage_bike_photos_delete_own"
on public.garage_bike_photos
for delete
to authenticated
using (auth.uid() = user_id);
`;
