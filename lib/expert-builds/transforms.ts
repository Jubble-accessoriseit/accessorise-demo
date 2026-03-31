import {
  ExpertBuildAccessory,
  ExpertBuildAccessoryPhoto,
  ExpertBuildPhoto,
} from "./types";

export function getWholeBuildPhotos(photos: ExpertBuildPhoto[]) {
  return photos.filter((photo) => photo.photo_type === "build");
}

export function getAccessoryPhotos(photos: ExpertBuildPhoto[]) {
  return photos.filter((photo) => photo.photo_type === "accessory");
}

export function getAllBuildPhotos(photos: ExpertBuildPhoto[]) {
  return [...photos].sort((a, b) => a.sort_order - b.sort_order);
}

export function getPhotosForAccessory(params: {
  accessory: ExpertBuildAccessory;
  photos: ExpertBuildPhoto[];
  links: ExpertBuildAccessoryPhoto[];
}) {
  const { accessory, photos, links } = params;

  const linkedPhotoIds = links
    .filter((link) => link.build_accessory_id === accessory.id)
    .map((link) => link.build_photo_id);

  return photos.filter((photo) => linkedPhotoIds.includes(photo.id));
}