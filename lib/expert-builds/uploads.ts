import { supabase } from "@/lib/supabase";

const EXPERT_BUILD_BUCKET = "expert-build-photos";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-");
}

export async function uploadExpertBuildPhoto(params: {
  file: File;
  userId: string;
  buildId: string;
  type: "build" | "accessory";
}) {
  const { file, userId, buildId, type } = params;

  const safeFileName = sanitizeFileName(file.name);
  const filePath = `${userId}/${buildId}/${type}/${Date.now()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(EXPERT_BUILD_BUCKET)
    .upload(filePath, file, {
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading expert build photo:", uploadError);
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(EXPERT_BUILD_BUCKET)
    .getPublicUrl(filePath);

  return {
    imageUrl: data.publicUrl,
    storagePath: filePath,
  };
}

export async function saveExpertBuildPhotoRecord(params: {
  expertBuildId: string;
  uploadedByUserId: string;
  imageUrl: string;
  storagePath: string;
  caption?: string;
  sortOrder?: number;
  photoType: "build" | "accessory";
}) {
  const {
    expertBuildId,
    uploadedByUserId,
    imageUrl,
    storagePath,
    caption,
    sortOrder = 0,
    photoType,
  } = params;

  const { data, error } = await supabase
    .from("expert_build_photos")
    .insert({
      expert_build_id: expertBuildId,
      uploaded_by_user_id: uploadedByUserId,
      image_url: imageUrl,
      storage_path: storagePath,
      caption: caption ?? null,
      sort_order: sortOrder,
      photo_type: photoType,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving expert build photo record:", error);
    throw new Error(error.message);
  }

  return data;
}