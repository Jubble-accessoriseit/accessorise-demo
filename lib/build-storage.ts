import { supabase } from "@/lib/supabase";

export type SavedBuildItem = {
  id: number;
  name: string;
  brand: string;
  price: number;
  categoryId: string;
  description: string;
  image: string;
  featuredOrder: number;
  compatibility: {
    bikeIds: string[];
    universal?: boolean;
  };
};

export type SavedBuildRecord = {
  selected_bike_id: string;
  build_items: SavedBuildItem[];
};

export type SavedPhotoRecord = {
  id: string;
  file_name: string;
  file_path: string;
  public_url: string;
  sort_order: number;
};

const PHOTO_BUCKET = "bike-photos";

export async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function loadBuild() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles_builds")
    .select("selected_bike_id, build_items")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data as SavedBuildRecord | null;
}

export async function saveBuild(record: SavedBuildRecord) {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("You need to sign in before saving your build.");
  }

  const { error } = await supabase.from("profiles_builds").upsert(
    {
      user_id: userId,
      selected_bike_id: record.selected_bike_id,
      build_items: record.build_items,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) throw error;
}

export async function loadBuildPhotos() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("build_photos")
    .select("id, file_name, file_path, public_url, sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []) as SavedPhotoRecord[];
}

export async function getBuildPhotos() {
  return loadBuildPhotos();
}

export async function uploadBuildPhoto(file: File, bikeName: string | null) {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("You need to sign in before uploading photos.");
  }

  const fileExt = file.name.split(".").pop() || "jpg";
  const filePath = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(filePath, file, {
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from(PHOTO_BUCKET)
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  const { data, error } = await supabase
    .from("build_photos")
    .insert({
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      public_url: publicUrl,
      sort_order: 0,
      bike_name: bikeName,
    })
    .select("id, file_name, file_path, public_url, sort_order")
    .single();

  if (error) throw error;

  return data as SavedPhotoRecord;
}

export async function deleteBuildPhoto(photoId: string, filePath: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("You need to sign in before deleting photos.");
  }

  const { error: dbError } = await supabase
    .from("build_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", userId);

  if (dbError) throw dbError;

  const { error: storageError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .remove([filePath]);

  if (storageError) throw storageError;
}