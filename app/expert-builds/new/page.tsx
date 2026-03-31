"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewExpertBuildPage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [bikeMake, setBikeMake] = useState("");
  const [bikeModel, setBikeModel] = useState("");
  const [bikeYear, setBikeYear] = useState("");
  const [ridingStyle, setRidingStyle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("You must be signed in to create an expert build.");
      }

      const parsedYear = Number(bikeYear);

      if (!title.trim()) {
        throw new Error("Build title is required.");
      }

      if (!bikeMake.trim() || !bikeModel.trim() || !bikeYear.trim()) {
        throw new Error("Bike make, model, and year are required.");
      }

      if (Number.isNaN(parsedYear)) {
        throw new Error("Bike year must be a valid number.");
      }

      const { error: insertError } = await supabase.from("expert_builds").insert({
        owner_user_id: user.id,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        bike_make: bikeMake.trim(),
        bike_model: bikeModel.trim(),
        bike_year: parsedYear,
        riding_style: ridingStyle.trim() || null,
        status: "draft",
        approval_status: "submitted",
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setMessage("Expert build created successfully.");
      setTitle("");
      setSubtitle("");
      setDescription("");
      setBikeMake("");
      setBikeModel("");
      setBikeYear("");
      setRidingStyle("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
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
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 32 }}>Create Expert Build</h1>
            <p style={{ color: "#6b7280", marginTop: 8 }}>
              Phase 2 starter form for Expert Builds.
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/expert-builds")}
            style={{
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              borderRadius: 12,
              padding: "10px 14px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Back to Expert Builds
          </button>
        </div>

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
              Build title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Yamaha Tenere 700 Adventure Touring Build"
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
              Subtitle
            </label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Optional short summary"
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
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the build and what it is designed for"
              rows={5}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 14,
                resize: "vertical",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                Bike make
              </label>
              <input
                value={bikeMake}
                onChange={(e) => setBikeMake(e.target.value)}
                placeholder="Yamaha"
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
                Bike model
              </label>
              <input
                value={bikeModel}
                onChange={(e) => setBikeModel(e.target.value)}
                placeholder="Tenere 700"
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
                Bike year
              </label>
              <input
                value={bikeYear}
                onChange={(e) => setBikeYear(e.target.value)}
                placeholder="2024"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
              Riding style
            </label>
            <input
              value={ridingStyle}
              onChange={(e) => setRidingStyle(e.target.value)}
              placeholder="Adventure touring, commuting, off-road, etc."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
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
            disabled={isSubmitting}
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              border: "none",
              background: isSubmitting ? "#9ca3af" : "#111827",
              color: "#ffffff",
              fontWeight: 700,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Creating build..." : "Create Expert Build"}
          </button>
        </form>
      </div>
    </main>
  );
}