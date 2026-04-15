import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import {
  GarageBikeRecord,
  GarageBuildRecord,
  MyGarageView,
  SavedBuildPhoto,
} from "@/types/garage";
import { formatGaragePriceDisplay } from "@/lib/garage/price-display";

type MyGarageStepProps = {
  isPhone: boolean;
  view: MyGarageView;
  bikes: GarageBikeRecord[];
  selectedBike: GarageBikeRecord | null;
  selectedBuild: GarageBuildRecord | null;
  activeWorkspaceBuildId?: string | null;
  onOpenBuild: (bikeId: string, buildId: string) => void;
  onBackToOverview: () => void;
  onDeleteBuildPhoto: (buildId: string, photoId: string) => void;
  onUploadBuildPhotos: (buildId: string, files: FileList | null) => void;
  onOpenInBuild: (buildId: string) => void;
  onCompareBuild: (buildId: string) => void;
  onRenameBuild: (buildId: string) => void;
  onArchiveBuild: (buildId: string) => void;
};

const shellCardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
} satisfies CSSProperties;

const sectionEyebrowStyle = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.65,
  textTransform: "uppercase",
  color: "#64748b",
} satisfies CSSProperties;

const metaPillStyle = {
  borderRadius: 999,
  padding: "5px 9px",
  fontSize: 11,
  fontWeight: 700,
} satisfies CSSProperties;

const secondaryButtonStyle = {
  minHeight: 34,
  padding: "7px 11px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontSize: 12,
  lineHeight: 1.1,
} satisfies CSSProperties;

const primaryButtonStyle = {
  ...secondaryButtonStyle,
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
} satisfies CSSProperties;

const subtleHintStyle = {
  fontSize: 12,
  lineHeight: 1.45,
  color: "#64748b",
} satisfies CSSProperties;

function formatBuildUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(new Date(value));
}

function getCompareGuidance(build: GarageBuildRecord, activeWorkspaceBuildId?: string | null) {
  if (build.lineage?.parentBuildId) {
    return "Compare Builds can open this saved build against its earlier saved version.";
  }

  if (activeWorkspaceBuildId && activeWorkspaceBuildId !== build.id) {
    return "Compare Builds will use the build currently active in Build as the reference.";
  }

  return "To compare this build, return one saved build to Build first, then compare against it here.";
}

function getBuildThumbnail(build: GarageBuildRecord) {
  return build.photos?.find((photo) => photo.isCover)?.imageUrl ?? build.photos?.[0]?.imageUrl ?? null;
}

function getPreferredSelectedPhoto(photos: SavedBuildPhoto[]) {
  return photos.find((photo) => photo.isCover) ?? photos[0] ?? null;
}

function formatSavedAccessoryPrice(price: number) {
  return formatGaragePriceDisplay(price, {
    locale: "en-AU",
    currency: "AUD",
    maximumFractionDigits: 2,
  });
}

function getBikeSummary(bike: GarageBikeRecord) {
  const primaryName = bike.nickname?.trim() || `${bike.make} ${bike.model}`;
  const secondaryParts = [bike.make, bike.model, bike.variant, String(bike.year)].filter(Boolean);

  return {
    primaryName,
    secondaryName: secondaryParts.join(" "),
  };
}

function getBuildDetailItems(build: GarageBuildRecord, bike: GarageBikeRecord) {
  return [
    { label: "Ownership", value: bike.ownershipStatus ?? "Owned" },
    { label: "Year", value: String(bike.year) },
    bike.category ? { label: "Segment", value: bike.category } : null,
    bike.engine_cc ? { label: "Engine", value: `${bike.engine_cc} cc` } : null,
    {
      label: "Indicative total",
      value: formatGaragePriceDisplay(build.indicativeTotal, {
        locale: "en-AU",
        currency: "AUD",
        maximumFractionDigits: 2,
      }),
    },
  ].filter((item): item is { label: string; value: string } => Boolean(item));
}

function BuildThumbnail({
  build,
  fullWidth = false,
  width = 128,
  height = 80,
}: {
  build: GarageBuildRecord;
  fullWidth?: boolean;
  width?: number;
  height?: number;
}) {
  const thumbnailUrl = getBuildThumbnail(build);

  if (thumbnailUrl) {
    return (
      <div
        style={{
          width: fullWidth ? "100%" : width,
          minWidth: fullWidth ? 0 : width,
          height,
          borderRadius: 14,
          overflow: "hidden",
          boxSizing: "border-box",
          background: `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.18)), url(${thumbnailUrl}) center/cover`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: fullWidth ? "100%" : width,
        minWidth: fullWidth ? 0 : width,
        height,
        borderRadius: 14,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 22% 20%, rgba(255,255,255,0.82), transparent 30%), linear-gradient(135deg, #dbeafe 0%, #f8fafc 55%, #c7d2fe 100%)",
        border: "1px solid #dbeafe",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
      }}
    />
  );
}

function BuildActionRow({
  build,
  bikeId,
  isPhone,
  isDetailView,
  isOpenInSavedBuilds,
  isOpenInWorkspace,
  canCompareBuild,
  compareGuidance,
  onOpenBuild,
  onOpenInBuild,
  onCompareBuild,
  onRenameBuild,
  onArchiveBuild,
}: {
  build: GarageBuildRecord;
  bikeId: string;
  isPhone: boolean;
  isDetailView: boolean;
  isOpenInSavedBuilds: boolean;
  isOpenInWorkspace: boolean;
  canCompareBuild: boolean;
  compareGuidance?: string | null;
  onOpenBuild: (bikeId: string, buildId: string) => void;
  onOpenInBuild: (buildId: string) => void;
  onCompareBuild: (buildId: string) => void;
  onRenameBuild: (buildId: string) => void;
  onArchiveBuild: (buildId: string) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        justifyItems: isPhone || isDetailView ? "stretch" : "stretch",
        minWidth: 0,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "minmax(0, 1fr)" : "repeat(auto-fit, minmax(140px, max-content))",
          gap: 6,
          justifyContent: isDetailView ? "flex-start" : "flex-end",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {!isDetailView && (
          <button
            type="button"
            onClick={() => onOpenBuild(bikeId, build.id)}
            disabled={isOpenInSavedBuilds}
            style={{
              ...secondaryButtonStyle,
              width: "100%",
              border: isOpenInSavedBuilds ? "1px solid #bfdbfe" : secondaryButtonStyle.border,
              background: isOpenInSavedBuilds ? "#eff6ff" : secondaryButtonStyle.background,
              color: isOpenInSavedBuilds ? "#1d4ed8" : secondaryButtonStyle.color,
              cursor: isOpenInSavedBuilds ? "default" : "pointer",
            }}
          >
            View Details
          </button>
        )}
        <button
          type="button"
          onClick={() => onOpenInBuild(build.id)}
          style={{
            ...secondaryButtonStyle,
            width: "100%",
            border: isOpenInWorkspace ? "1px solid #bfdbfe" : secondaryButtonStyle.border,
            background: isOpenInWorkspace ? "#eff6ff" : secondaryButtonStyle.background,
            color: isOpenInWorkspace ? "#1d4ed8" : secondaryButtonStyle.color,
          }}
        >
          Return to Build
        </button>
        <button
          type="button"
          onClick={() => onCompareBuild(build.id)}
          disabled={!canCompareBuild}
          style={{
            ...primaryButtonStyle,
            width: "100%",
            background: canCompareBuild ? primaryButtonStyle.background : "#94a3b8",
            cursor: canCompareBuild ? "pointer" : "not-allowed",
            opacity: canCompareBuild ? 1 : 0.8,
          }}
        >
          Compare Builds
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fit, minmax(120px, max-content))",
          gap: 6,
          justifyContent: isDetailView ? "flex-start" : "flex-end",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        <button
          type="button"
          onClick={() => onRenameBuild(build.id)}
          style={{ ...secondaryButtonStyle, width: "100%" }}
        >
          Rename
        </button>
        <button
          type="button"
          onClick={() => onArchiveBuild(build.id)}
          style={{
            ...secondaryButtonStyle,
            width: "100%",
            border: "1px solid #fecaca",
            background: "#fff1f2",
            color: "#b91c1c",
          }}
        >
          Delete
        </button>
      </div>
      {!canCompareBuild && compareGuidance ? (
        <div
          style={{
            ...subtleHintStyle,
            textAlign: "left",
            maxWidth: isPhone ? "100%" : isDetailView ? 420 : 360,
            justifySelf: "stretch",
            width: "100%",
          }}
        >
          {compareGuidance}
        </div>
      ) : null}
    </div>
  );
}

function SavedBuildDetailFacts({
  build,
  bike,
}: {
  build: GarageBuildRecord;
  bike: GarageBikeRecord;
}) {
  return (
    <div style={{ ...shellCardStyle, padding: 16, display: "grid", gap: 10 }}>
      <div style={sectionEyebrowStyle}>Bike details</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))",
          gap: 8,
        }}
      >
        {getBuildDetailItems(build, bike).map((item) => (
          <div
            key={item.label}
            style={{
              borderRadius: 12,
              background: "#f8fafc",
              padding: "10px 12px",
              display: "grid",
              gap: 2,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: "#94a3b8",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.25,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SavedBuildAccessoriesSection({ build }: { build: GarageBuildRecord }) {
  return (
    <div style={{ ...shellCardStyle, padding: 16, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={sectionEyebrowStyle}>Saved accessories</div>
        {build.productGroups.length > 0 ? (
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
            {build.productGroups.length} categor{build.productGroups.length === 1 ? "y" : "ies"}
          </div>
        ) : null}
      </div>

      {build.productGroups.length === 0 ? (
        <div
          style={{
            borderRadius: 12,
            border: "1px dashed #cbd5e1",
            padding: 14,
            background: "#f8fafc",
            color: "#64748b",
            fontSize: 14,
          }}
        >
          This build does not have saved accessories yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {build.productGroups.map((group) => (
            <div
              key={group.categoryId}
              style={{
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                padding: 12,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                {group.categoryLabel}
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 11px",
                      borderRadius: 10,
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ display: "grid", gap: 2 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#0f172a",
                          lineHeight: 1.25,
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{item.brand}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {formatSavedAccessoryPrice(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SavedBuildPhotosPanel({
  build,
  detailPhotos,
  onDeleteBuildPhoto,
  onSelectPhoto,
  onUploadBuildPhotos,
  selectedDetailPhoto,
}: {
  build: GarageBuildRecord;
  detailPhotos: SavedBuildPhoto[];
  onDeleteBuildPhoto: (buildId: string, photoId: string) => void;
  onSelectPhoto: (photoId: string) => void;
  onUploadBuildPhotos: (buildId: string, files: FileList | null) => void;
  selectedDetailPhoto: SavedBuildPhoto | null;
}) {
  return (
    <div style={{ ...shellCardStyle, padding: 14, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 2 }}>
          <div style={sectionEyebrowStyle}>Build Photos</div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>
            Photos here belong to this saved build only and power its list thumbnail.
          </div>
        </div>
        <label
          style={{
            minHeight: 34,
            padding: "7px 11px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 12,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Upload photos
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(event) => {
              onUploadBuildPhotos(build.id, event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {detailPhotos.length > 0 && selectedDetailPhoto ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
              {detailPhotos.length} photo{detailPhotos.length === 1 ? "" : "s"} in this saved build gallery.
            </div>
            <button
              type="button"
              onClick={() => onDeleteBuildPhoto(build.id, selectedDetailPhoto.id)}
              style={{
                ...secondaryButtonStyle,
                border: "1px solid #fecaca",
                background: "#fff1f2",
                color: "#b91c1c",
              }}
            >
              Delete photo
            </button>
          </div>
          <div
            style={{
              minHeight: 248,
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              background: `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.18)), url(${selectedDetailPhoto.imageUrl}) center/cover`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
              gap: 8,
            }}
          >
            {detailPhotos.map((photo) => {
              const isSelected = photo.id === selectedDetailPhoto.id;

              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onSelectPhoto(photo.id)}
                  style={{
                    minHeight: 78,
                    borderRadius: 12,
                    border: isSelected ? "2px solid #2563eb" : "1px solid #dbe3ee",
                    padding: 0,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.14)), url(${photo.imageUrl}) center/cover`,
                    boxShadow: isSelected ? "0 0 0 3px rgba(37,99,235,0.14)" : "none",
                  }}
                  aria-label="Select build photo"
                />
              );
            })}
          </div>
        </>
      ) : (
        <div
          style={{
            borderRadius: 12,
            border: "1px dashed #cbd5e1",
            padding: 14,
            background: "#f8fafc",
            color: "#64748b",
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          Upload a few photos of this exact accessory setup to create this build gallery and list thumbnail.
        </div>
      )}
    </div>
  );
}

function SavedBuildListCard({
  activeWorkspaceBuildId,
  bike,
  build,
  isPhone,
  onArchiveBuild,
  onCompareBuild,
  onOpenBuild,
  onOpenInBuild,
  onRenameBuild,
  selectedBuildId,
}: {
  activeWorkspaceBuildId: string | null;
  bike: GarageBikeRecord;
  build: GarageBuildRecord;
  isPhone: boolean;
  onArchiveBuild: (buildId: string) => void;
  onCompareBuild: (buildId: string) => void;
  onOpenBuild: (bikeId: string, buildId: string) => void;
  onOpenInBuild: (buildId: string) => void;
  onRenameBuild: (buildId: string) => void;
  selectedBuildId: string | null;
}) {
  const bikeSummary = getBikeSummary(bike);
  const isOpenInSavedBuilds = selectedBuildId === build.id;
  const isOpenInWorkspace = activeWorkspaceBuildId === build.id;
  const canCompareBuild = Boolean(
    build.lineage?.parentBuildId ||
      (activeWorkspaceBuildId && activeWorkspaceBuildId !== build.id)
  );
  const compareGuidance = getCompareGuidance(build, activeWorkspaceBuildId);

  return (
    <div
      style={{
        ...shellCardStyle,
        border: isOpenInWorkspace ? "1px solid #bfdbfe" : shellCardStyle.border,
        background: isOpenInWorkspace
          ? "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)"
          : shellCardStyle.background,
        boxShadow: isOpenInWorkspace
          ? "0 16px 28px rgba(37,99,235,0.08)"
          : shellCardStyle.boxShadow,
        padding: isPhone ? 12 : "12px 14px",
        display: "grid",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPhone ? "minmax(0, 1fr)" : "minmax(112px, 136px) minmax(0, 1fr)",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div style={{ width: isPhone ? "100%" : "100%", minWidth: 0, maxWidth: isPhone ? "100%" : 136 }}>
          <BuildThumbnail build={build} fullWidth={isPhone} width={136} height={isPhone ? 176 : 84} />
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: isPhone ? 10 : 14,
            alignItems: "start",
            minWidth: 0,
          }}
        >
          <div style={{ display: "grid", gap: 4, minWidth: 0, flex: "1 1 280px" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", lineHeight: 1.2, overflowWrap: "anywhere" }}>
              {build.name}
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.35, overflowWrap: "anywhere" }}>
              {bikeSummary.primaryName}
              {bikeSummary.secondaryName !== bikeSummary.primaryName ? ` - ${bikeSummary.secondaryName}` : ""}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.35 }}>
                Updated {formatBuildUpdatedAt(build.updatedAt)}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: "#cbd5e1" }} />
              <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.35 }}>
                {build.accessoryCount} accessories
              </span>
            </div>
            {(isOpenInSavedBuilds || isOpenInWorkspace) && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {isOpenInSavedBuilds ? (
                  <div
                    style={{
                      ...metaPillStyle,
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      padding: "3px 8px",
                      fontSize: 10,
                    }}
                  >
                    Opened here
                  </div>
                ) : null}
                {isOpenInWorkspace ? (
                  <div
                    style={{
                      ...metaPillStyle,
                      background: "#ecfdf5",
                      color: "#047857",
                      padding: "3px 8px",
                      fontSize: 10,
                    }}
                  >
                    Active in Build
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <div style={{ marginLeft: isPhone ? 0 : "auto", minWidth: 0, flex: isPhone ? "1 1 100%" : "0 1 340px", width: isPhone ? "100%" : undefined }}>
            <BuildActionRow
              build={build}
              bikeId={bike.id}
              isPhone={isPhone}
              isDetailView={false}
              isOpenInSavedBuilds={isOpenInSavedBuilds}
              isOpenInWorkspace={isOpenInWorkspace}
              canCompareBuild={canCompareBuild}
              compareGuidance={compareGuidance}
              onOpenBuild={onOpenBuild}
              onOpenInBuild={onOpenInBuild}
              onCompareBuild={onCompareBuild}
              onRenameBuild={onRenameBuild}
              onArchiveBuild={onArchiveBuild}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyGarageStep({
  isPhone,
  view,
  bikes,
  selectedBike,
  selectedBuild,
  activeWorkspaceBuildId = null,
  onOpenBuild,
  onBackToOverview,
  onDeleteBuildPhoto,
  onUploadBuildPhotos,
  onOpenInBuild,
  onCompareBuild,
  onRenameBuild,
  onArchiveBuild,
}: MyGarageStepProps) {
  const savedBuildEntries = bikes
    .flatMap((bike) =>
      bike.builds
        .filter((build) => build.status !== "Archived")
        .map((build) => ({
          bike,
          build,
        }))
    )
    .sort((left, right) => {
      const leftIsActive = activeWorkspaceBuildId === left.build.id;
      const rightIsActive = activeWorkspaceBuildId === right.build.id;

      if (leftIsActive !== rightIsActive) {
        return leftIsActive ? -1 : 1;
      }

      return right.build.updatedAt.localeCompare(left.build.updatedAt);
    });

  const detailPhotos = useMemo(() => selectedBuild?.photos ?? [], [selectedBuild]);
  const [selectedDetailPhotoState, setSelectedDetailPhotoState] = useState<{
    buildId: string | null;
    photoId: string | null;
  }>({
    buildId: null,
    photoId: null,
  });

  const selectedDetailPhoto = useMemo(() => {
    if (!selectedBuild) {
      return null;
    }

    if (selectedDetailPhotoState.buildId === selectedBuild.id && selectedDetailPhotoState.photoId) {
      const matchedPhoto = detailPhotos.find((photo) => photo.id === selectedDetailPhotoState.photoId);

      if (matchedPhoto) {
        return matchedPhoto;
      }
    }

    return getPreferredSelectedPhoto(detailPhotos);
  }, [detailPhotos, selectedBuild, selectedDetailPhotoState]);

  if (view.level !== "build" || !selectedBike || !selectedBuild) {
    return (
      <section style={{ maxWidth: 1600, margin: "0 auto", padding: "0 10px 32px" }}>
        <div style={{ ...shellCardStyle, padding: 18, display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={sectionEyebrowStyle}>Saved builds</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Saved Builds</div>
            <div style={{ color: "#64748b", fontSize: 14, maxWidth: 760, lineHeight: 1.45 }}>
              Open a saved build to manage its gallery, return it to the Build tab, or compare it against another setup.
            </div>
          </div>

          {savedBuildEntries.length === 0 ? (
            <div
              style={{
                borderRadius: 16,
                border: "1px dashed #cbd5e1",
                background: "#f8fafc",
                padding: 18,
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              No saved builds yet. Save a build from the Build tab to start a library here.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {savedBuildEntries.map(({ bike, build }) => (
                <SavedBuildListCard
                  key={build.id}
                  activeWorkspaceBuildId={activeWorkspaceBuildId}
                  bike={bike}
                  build={build}
                  isPhone={isPhone}
                  onArchiveBuild={onArchiveBuild}
                  onCompareBuild={onCompareBuild}
                  onOpenBuild={onOpenBuild}
                  onOpenInBuild={onOpenInBuild}
                  onRenameBuild={onRenameBuild}
                  selectedBuildId={view.level === "build" ? selectedBuild?.id ?? null : null}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  const bikeSummary = getBikeSummary(selectedBike);
  const canCompareSelectedBuild = Boolean(
    selectedBuild.lineage?.parentBuildId ||
      (activeWorkspaceBuildId && activeWorkspaceBuildId !== selectedBuild.id)
  );
  const selectedBuildCompareGuidance = getCompareGuidance(selectedBuild, activeWorkspaceBuildId);

  return (
    <section style={{ maxWidth: 1600, margin: "0 auto", padding: "0 10px 32px" }}>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ ...shellCardStyle, padding: 18, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onBackToOverview}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                color: "#2563eb",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Back to saved builds
            </button>
            <BuildActionRow
              build={selectedBuild}
              bikeId={selectedBike.id}
              isPhone={isPhone}
              isDetailView
              isOpenInSavedBuilds
              isOpenInWorkspace={activeWorkspaceBuildId === selectedBuild.id}
              canCompareBuild={canCompareSelectedBuild}
              compareGuidance={selectedBuildCompareGuidance}
              onOpenBuild={onOpenBuild}
              onOpenInBuild={onOpenInBuild}
              onCompareBuild={onCompareBuild}
              onRenameBuild={onRenameBuild}
              onArchiveBuild={onArchiveBuild}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
              <div style={{ ...shellCardStyle, padding: 16, display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "152px minmax(0, 1fr)",
                    gap: 14,
                    alignItems: "start",
                  }}
                >
                  <BuildThumbnail build={selectedBuild} fullWidth={isPhone} width={152} height={isPhone ? 188 : 100} />
                  <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
                    <div style={sectionEyebrowStyle}>
                      Saved build
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", lineHeight: 1.12, overflowWrap: "anywhere" }}>{selectedBuild.name}</div>
                    <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.4, overflowWrap: "anywhere" }}>
                      {bikeSummary.primaryName}
                      {bikeSummary.secondaryName !== bikeSummary.primaryName ? ` - ${bikeSummary.secondaryName}` : ""}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {activeWorkspaceBuildId === selectedBuild.id && (
                        <div style={{ ...metaPillStyle, background: "#ecfdf5", color: "#047857" }}>
                          Active in Build
                        </div>
                      )}
                      <div style={{ ...metaPillStyle, background: "#eff6ff", color: "#1d4ed8" }}>
                        {selectedBuild.buildType}
                      </div>
                      <div style={{ ...metaPillStyle, background: "#f8fafc", color: "#334155" }}>
                        {selectedBuild.accessoryCount} accessories
                      </div>
                      <div style={{ ...metaPillStyle, background: "#f8fafc", color: "#334155" }}>
                        Updated {formatBuildUpdatedAt(selectedBuild.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <SavedBuildDetailFacts build={selectedBuild} bike={selectedBike} />
              <SavedBuildAccessoriesSection build={selectedBuild} />
            </div>

            <aside
              style={{
                display: "grid",
                gap: 12,
                position: "sticky",
                top: 88,
                alignSelf: "start",
                minWidth: 0,
                width: "100%",
              }}
            >
              <SavedBuildPhotosPanel
                build={selectedBuild}
                detailPhotos={detailPhotos}
                onDeleteBuildPhoto={onDeleteBuildPhoto}
                onSelectPhoto={(photoId) =>
                  setSelectedDetailPhotoState({
                    buildId: selectedBuild.id,
                    photoId,
                  })
                }
                onUploadBuildPhotos={onUploadBuildPhotos}
                selectedDetailPhoto={selectedDetailPhoto}
              />
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
