"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function ExpertBuildDetailPage() {
  const params = useParams();
  const buildId = params?.id as string;

  const [build, setBuild] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBuild() {
      const { data, error } = await supabase
        .from("expert_builds")
        .select(`
          *,
          expert_build_items (
            *,
            products (*)
          )
        `)
        .eq("id", buildId)
        .single();

      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      setBuild(data);
      setIsLoading(false);
    }

    if (buildId) loadBuild();
  }, [buildId]);

  if (isLoading) return <p style={{ padding: 20 }}>Loading build...</p>;
  if (!build) return <p style={{ padding: 20 }}>Build not found</p>;

  const heroImage =
  build.hero_image_url ||
  (Array.isArray(build.expert_build_items?.[0]?.products)
    ? build.expert_build_items?.[0]?.products[0]?.image_url
    : build.expert_build_items?.[0]?.products?.image_url) ||
  "/bike-placeholder.jpg";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(243,244,246,1) 100%)",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

    <Link
  href="/expert-builds"
  style={{
    display: "inline-block",
    marginBottom: 16,
    textDecoration: "none",
    background: "#111827",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
  }}
>
  ← Back to Expert Builds
</Link>    
        
        {/* HERO IMAGE */}
        <div
          style={{
            borderRadius: 24,
            overflow: "hidden",
            marginBottom: 24,
            background: "#f3f4f6",
          }}
        >
          <img
            src={heroImage}
            alt={build.title}
            style={{
              width: "100%",
              height: 420,
              objectFit: "cover",
            }}
          />
        </div>

        {/* HEADER */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>{build.title}</h1>
          <p style={{ color: "#6b7280", marginTop: 8 }}>
            {build.description}
          </p>
        </div>

        {/* ACCESSORIES */}
        <div>
          <h2 style={{ marginBottom: 16 }}>Included Accessories</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {build.expert_build_items?.map((item: any) => {
              const product = Array.isArray(item.products)
                ? item.products[0]
                : item.products;

              if (!product) return null;

              return (
                <div
  key={item.id}
  style={{
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    background: "#ffffff",
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
      width: 72,
      height: 72,
      objectFit: "cover",
      borderRadius: 12,
      background: "#f3f4f6",
      flexShrink: 0,
    }}
  />

  <div>
    <div style={{ fontWeight: 700 }}>
      {product.name}
    </div>

    <div
      style={{
        fontSize: 13,
        color: "#6b7280",
        marginTop: 4,
      }}
    >
      {product.brand} • {product.category}
    </div>

    {item.owner_comment && (
      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          color: "#374151",
        }}
      >
        {item.owner_comment}
      </div>
    )}
  </div>
</div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}