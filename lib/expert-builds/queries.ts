import { supabase } from "@/lib/supabase";
import {
  ExpertBuild,
  ExpertBuildAccessory,
  ExpertBuildAccessoryPhoto,
  ExpertBuildPhoto,
  ExpertBuildWithRelations,
} from "./types";

export async function getApprovedExpertBuilds(): Promise<ExpertBuild[]> {
  const { data, error } = await supabase
    .from("expert_builds")
    .select("*")
    .eq("approval_status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching approved expert builds:", error);
    throw new Error(error.message);
  }

  return (data ?? []) as ExpertBuild[];
}

export async function getExpertBuildById(
  buildId: string
): Promise<ExpertBuildWithRelations | null> {
  const { data: build, error: buildError } = await supabase
    .from("expert_builds")
    .select("*")
    .eq("id", buildId)
    .single();

  if (buildError) {
    console.error("Error fetching expert build:", buildError);
    return null;
  }

  const { data: photos, error: photosError } = await supabase
    .from("expert_build_photos")
    .select("*")
    .eq("expert_build_id", buildId)
    .order("sort_order", { ascending: true });

  if (photosError) {
    console.error("Error fetching expert build photos:", photosError);
    throw new Error(photosError.message);
  }

  const { data: accessories, error: accessoriesError } = await supabase
    .from("expert_build_accessories")
    .select("*")
    .eq("expert_build_id", buildId)
    .order("sort_order", { ascending: true });

  if (accessoriesError) {
    console.error("Error fetching expert build accessories:", accessoriesError);
    throw new Error(accessoriesError.message);
  }

  const accessoryIds = (accessories ?? []).map((item) => item.id);

  let accessoryPhotoLinks: ExpertBuildAccessoryPhoto[] = [];

  if (accessoryIds.length > 0) {
    const { data: links, error: linksError } = await supabase
      .from("expert_build_accessory_photos")
      .select("*")
      .in("build_accessory_id", accessoryIds);

    if (linksError) {
      console.error("Error fetching expert build accessory photo links:", linksError);
      throw new Error(linksError.message);
    }

    accessoryPhotoLinks = (links ?? []) as ExpertBuildAccessoryPhoto[];
  }

  return {
    build: build as ExpertBuild,
    photos: (photos ?? []) as ExpertBuildPhoto[],
    accessories: (accessories ?? []) as ExpertBuildAccessory[],
    accessoryPhotoLinks,
  };
}

export async function getApprovedExpertBuildsForBike(
  bikeMake: string,
  bikeModel: string,
  bikeYear: number
): Promise<ExpertBuild[]> {
  const { data, error } = await supabase
    .from("expert_builds")
    .select("*")
    .eq("approval_status", "approved")
    .eq("bike_make", bikeMake)
    .eq("bike_model", bikeModel)
    .eq("bike_year", bikeYear)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching approved expert builds for bike:", error);
    throw new Error(error.message);
  }

  return (data ?? []) as ExpertBuild[];
}