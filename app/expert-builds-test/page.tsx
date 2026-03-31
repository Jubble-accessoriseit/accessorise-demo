"use client";

import { useEffect, useState } from "react";
import { getApprovedExpertBuilds } from "@/lib/expert-builds/queries";
import { ExpertBuild } from "@/lib/expert-builds/types";

export default function ExpertBuildsTestPage() {
  const [builds, setBuilds] = useState<ExpertBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBuilds() {
      try {
        setIsLoading(true);
        const data = await getApprovedExpertBuilds();
        setBuilds(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load expert builds.");
      } finally {
        setIsLoading(false);
      }
    }

    loadBuilds();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Expert Builds Test</h1>
        <p style={{ color: "#6b7280", marginBottom: 24 }}>
          Phase 1 test page for Expert Builds.
        </p>

        {isLoading ? (
          <p>Loading expert builds...</p>
        ) : error ? (
          <p style={{ color: "#dc2626" }}>{error}</p>
        ) : builds.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 20,
              border: "1px solid #e5e7eb",
            }}
          >
            No approved expert builds yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            {builds.map((build) => (
              <div
                key={build.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  padding: 20,
                  border: "1px solid #e5e7eb",
                }}
              >
                <h2 style={{ margin: "0 0 8px 0", fontSize: 22 }}>{build.title}</h2>
                <div style={{ color: "#6b7280", marginBottom: 8 }}>
                  {build.bike_make} {build.bike_model} {build.bike_year}
                </div>
                <div style={{ color: "#374151" }}>
                  {build.description || "No description yet."}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}