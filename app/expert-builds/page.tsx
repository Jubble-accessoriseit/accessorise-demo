"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  image_url: string | null;
};

type ExpertBuildItem = {
  id: string;
  sort_order: number;
  owner_comment: string | null;
  products: Product | Product[] | null;
};

type ExpertBuild = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  riding_style: string | null;
  hero_image_url: string | null;
  bike_id: string;
  expert_build_items: ExpertBuildItem[] | null;
};

export default function ExpertBuildsPage() {
  const [builds, setBuilds] = useState<ExpertBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadBuilds() {
      setIsLoading(true);
      setPageError("");

      const { data, error } = await supabase
        .from("expert_builds")
        .select(`
          id,
          title,
          subtitle,
          description,
          riding_style,
          hero_image_url,
          bike_id,
          expert_build_items (
            id,
            sort_order,
            owner_comment,
            products (
              id,
              name,
              brand,
              category,
              subcategory,
              description,
              image_url
            )
          )
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setPageError("Could not load expert builds.");
        setIsLoading(false);
        return;
      }

      const normalisedBuilds = (data || []).map((build: any) => ({
        ...build,
        expert_build_items: (build.expert_build_items || []).sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        ),
      }));

      setBuilds(normalisedBuilds);
      setIsLoading(false);
    }

    loadBuilds();
  }, []);

  function getFirstProductImage(build: ExpertBuild) {
    if (!build.expert_build_items) return null;

    for (const item of build.expert_build_items) {
      const product = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      if (product?.image_url) {
        return product.image_url;
      }
    }

    return null;
  }

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          padding: "32px 20px 48px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ marginTop: 0 }}>Expert Builds</h1>
          <p>Loading builds...</p>
        </div>
      </main>
    );
  }

  if (pageError) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          padding: "32px 20px 48px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ marginTop: 0 }}>Expert Builds</h1>
          <p style={{ color: "#b91c1c" }}>{pageError}</p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(243,244,246,1) 100%)",
        padding: "32px 20px 48px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: "#6b7280",
                fontWeight: 700,
              }}
            >
              Accessorise It
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: 36,
                lineHeight: 1.1,
                color: "#111827",
              }}
            >
              Expert Builds
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                color: "#4b5563",
                maxWidth: 700,
                fontSize: 16,
              }}
            >
              Browse curated builds and see which accessories work together on
              real bikes.
            </p>
          </div>

          <Link
            href="/garage"
            style={{
              textDecoration: "none",
              background: "#111827",
              color: "#ffffff",
              padding: "12px 18px",
              borderRadius: 12,
              fontWeight: 600,
            }}
          >
            Back to Garage
          </Link>
        </div>

        {builds.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>No expert builds yet</h2>
            <p style={{ marginBottom: 0, color: "#6b7280" }}>
              Publish your first expert build in Supabase and it will appear
              here.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 20,
            }}
          >
            {builds.map((build) => {
  const heroImage =
    build.hero_image_url ||
    getFirstProductImage(build) ||
    "/bike-placeholder.jpg";

  return (
    <Link
      key={build.id}
      href={`/expert-builds/${build.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <article
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            background: "#f3f4f6",
            height: 240,
            overflow: "hidden",
          }}
        >
          <img
            src={heroImage}
            alt={build.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/bike-placeholder.jpg";
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 10px",
                borderRadius: 999,
                background: "#eef2ff",
                color: "#3730a3",
              }}
            >
              {build.bike_id}
            </span>

            {build.riding_style ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#ecfeff",
                  color: "#155e75",
                  textTransform: "capitalize",
                }}
              >
                {build.riding_style}
              </span>
            ) : null}
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: 24,
              lineHeight: 1.15,
              color: "#111827",
            }}
          >
            {build.title}
          </h2>

          {build.subtitle ? (
            <p
              style={{
                margin: "0 0 12px",
                color: "#374151",
                fontWeight: 600,
              }}
            >
              {build.subtitle}
            </p>
          ) : null}

          {build.description ? (
            <p
              style={{
                margin: "0 0 18px",
                color: "#6b7280",
                lineHeight: 1.5,
              }}
            >
              {build.description}
            </p>
          ) : null}

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: 16,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: 12,
                color: "#111827",
              }}
            >
              Included accessories
            </div>

            {!build.expert_build_items ||
            build.expert_build_items.length === 0 ? (
              <p style={{ margin: 0, color: "#6b7280" }}>
                No products linked yet.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {build.expert_build_items.map((item) => {
                  const product = Array.isArray(item.products)
                    ? item.products[0]
                    : item.products;

                  if (!product) return null;

                  return (
                    <div
  key={item.id}
  style={{
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    background: "#fafafa",
  }}
>
  <div
    style={{
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
    }}
  >
    <img
      src={product.image_url || "/bike-placeholder.jpg"}
      alt={product.name}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = "/bike-placeholder.jpg";
      }}
      style={{
        width: 60,
        height: 60,
        objectFit: "cover",
        borderRadius: 10,
        background: "#f3f4f6",
        flexShrink: 0,
      }}
    />

    <div>
      <div
        style={{
          fontWeight: 700,
          color: "#111827",
          marginBottom: 4,
        }}
      >
        {product.name}
      </div>

      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 6,
        }}
      >
        {product.brand} • {product.category}
        {product.subcategory
          ? ` • ${product.subcategory}`
          : ""}
      </div>

      {item.owner_comment ? (
        <div
          style={{
            fontSize: 13,
            color: "#374151",
          }}
        >
          {item.owner_comment}
        </div>
      ) : null}
    </div>
  </div>
</div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
            </article>
    </Link>
  );
})}
          </div>
        )}
      </div>
    </main>
  );
}