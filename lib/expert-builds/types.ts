export type ExpertBuildStatus = "draft" | "submitted" | "approved" | "rejected" | "hidden";

export type ExpertBuildPhotoType = "build" | "accessory";

export type ExpertBuild = {
  id: string;
  owner_user_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  bike_id: string | null;
  bike_make: string;
  bike_model: string;
  bike_year: number;
  bike_variant: string | null;
  riding_style: string | null;
  status: ExpertBuildStatus;
  approval_status: ExpertBuildStatus;
  featured_photo_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpertBuildPhoto = {
  id: string;
  expert_build_id: string;
  uploaded_by_user_id: string;
  image_url: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  photo_type: ExpertBuildPhotoType;
  created_at: string;
};

export type ExpertBuildAccessory = {
  id: string;
  expert_build_id: string;
  product_id: number | null;
  accessory_name: string;
  brand: string;
  category: string;
  description: string | null;
  affiliate_link: string | null;
  owner_comment: string | null;
  install_notes: string | null;
  sort_order: number;
  created_at: string;
};

export type ExpertBuildAccessoryPhoto = {
  id: string;
  build_accessory_id: string;
  build_photo_id: string;
};

export type ExpertBuildWithRelations = {
  build: ExpertBuild;
  photos: ExpertBuildPhoto[];
  accessories: ExpertBuildAccessory[];
  accessoryPhotoLinks: ExpertBuildAccessoryPhoto[];
};