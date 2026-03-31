"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getApprovedExpertBuilds } from "@/lib/expert-builds/queries";
import { ExpertBuild } from "@/lib/expert-builds/types";
import {
  saveExpertBuildPhotoRecord,
  uploadExpertBuildPhoto,
} from "@/lib/expert-builds/uploads";

export default function UploadExpertBuildPhotoPage() {
  const [builds, setBuilds] = useState<ExpertBuild[]>([]);
  const [selectedBuildId, setSelectedBuildId] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingBuilds, setIsLoadingBuilds] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBuilds() {
      try {
        setIsLoadingBuilds(true);
        const data = await getApprovedExpertBuilds();
        setBuilds(data);
        if (data.length > 0) {
          setSelectedBuildId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load expert builds.");
      } finally {
        setIsLoadingBuilds(false);
      }
    }

    loadBuilds();
  }, []);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsUploading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (!session?.user) {
        throw new Error("You must be signed in to upload a build photo.");
      }

      if (!selectedBuildId) {
        throw new Error("Please select an expert build.");
      }

      if (!selectedFile) {
        throw new Error("Please choose a photo to upload.");
      }

      const uploadResult = await uploadExpertBuildPhoto({
        file: selectedFile,
        userId: session.user.id,
        buildId: selectedBuildId,
        type: "build",
      });

      await saveExpertBuildPhotoRecord({
        expertBuildId: selectedBuildId,
        uploadedByUserId: session.user.id,
        imageUrl: uploadResult.imageUrl,
        storagePath: uploadResult.storagePath,
        caption,
        sortOrder: 0,
        photoType: "build",
      });

      setMessage("Build photo uploaded successfully.");
      setCaption("");
      setSelectedFile(null);

      const input = document.getElementById("build-photo-file") as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0, fontSize: 32 }}>Upload Expert Build Photo</h1>
        <p style={{ color: "#6b7280", marginBottom: 24 }}>
          Phase 2.1 test page for uploading one build photo.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: 24,
            display: "grid",
            gap: 18,
          }}
        >
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
              Select build
            </label>

            {isLoadingBuilds ? (
              <div>Loading builds...</div>
            ) : (
              <select
                value={selectedBuildId}
                onChange={(e) => setSelectedBuildId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                  background: "#ffffff",
                }}
              >
                <option value="">Select a build</option>
                {builds.map((build) => (
                  <option key={build.id} value={build.id}>
                    {build.title} — {build.bike_make} {build.bike_model} {build.bike_year}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
              Photo caption
            </label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional caption"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
              Build photo
            </label>
            <input
              id="build-photo-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "10px 0",
                fontSize: 14,
              }}
            />
          </div>

          {message ? (
            <div
              style={{
                background: "#ecfdf5",
                color: "#065f46",
                border: "1px solid #a7f3d0",
                borderRadius: 12,
                padding: 12,
              }}
            >
              {message}
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                borderRadius: 12,
                padding: 12,
              }}
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isUploading}
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              border: "none",
              background: isUploading ? "#9ca3af" : "#111827",
              color: "#ffffff",
              fontWeight: 700,
              cursor: isUploading ? "not-allowed" : "pointer",
            }}
          >
            {isUploading ? "Uploading photo..." : "Upload Build Photo"}
          </button>
        </form>
      </div>
    </main>
  );
}