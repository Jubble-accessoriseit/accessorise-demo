"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  deleteBuildPhoto,
  getBuildPhotos,
  uploadBuildPhoto,
} from "@/lib/build-storage";

type Bike = {
  id: string;
  brand: string;
  model: string;
  yearLabel: string;
  heroImage: string;
};

type Product = {
  id: number;
  name: string;
  brand: string;
  price: number;
  categoryId: string;
  description: string;
  image: string;
  featuredOrder: number;
  compatibility: {
    bikeIds: string[];
    universal?: boolean;
  };
};

type UploadedPhoto = {
  id: string;
  name: string;
  url: string;
  filePath?: string;
  persisted?: boolean;
};

type SavedPhotoRecord = {
  id: string;
  file_name: string;
  file_path: string;
  public_url: string;
};

const bikes: Bike[] = [
  {
    id: "bmw-r1300gsa-2025",
    brand: "BMW",
    model: "R1300GSA",
    yearLabel: "2025",
    heroImage: "/bikes/bmw-r1300gsa.jpg",
  },
  {
    id: "bmw-r1250gsa-2024",
    brand: "BMW",
    model: "R1250GSA",
    yearLabel: "2024",
    heroImage: "/bikes/bmw-r1250gsa.jpg",
  },
  {
    id: "ktm-1290sar-2024",
    brand: "KTM",
    model: "1290 Super Adventure R",
    yearLabel: "2024",
    heroImage: "/bikes/ktm-1290sar.jpg",
  },
  {
    id: "yamaha-tenere700-2024",
    brand: "Yamaha",
    model: "Ténéré 700",
    yearLabel: "2024",
    heroImage: "/bikes/tenere-700.jpg",
  },
];

const categories = [
  { id: "all", label: "All" },
  { id: "luggage", label: "Luggage" },
  { id: "protection", label: "Protection" },
  { id: "performance", label: "Performance" },
  { id: "lighting", label: "Lighting" },
  { id: "navigation", label: "Navigation" },
  { id: "seats", label: "Seats" },
  { id: "windscreens", label: "Windscreens" },
  { id: "electronics", label: "Electronics" },
  { id: "ergonomics", label: "Ergonomics" },
  { id: "security", label: "Security" },
];

const products: Product[] = [
  {
    id: 1,
    name: "Adventure Top Box 40L",
    brand: "BMW",
    price: 850,
    categoryId: "luggage",
    description: "Premium rear storage for touring and daily use.",
    image: "/accessories/top-box.jpg",
    featuredOrder: 1,
    compatibility: {
      bikeIds: ["bmw-r1300gsa-2025", "bmw-r1250gsa-2024"],
    },
  },
  {
    id: 2,
    name: "Alloy Side Panniers",
    brand: "Touratech",
    price: 1200,
    categoryId: "luggage",
    description: "Hard-wearing side luggage built for long-distance rides.",
    image: "/accessories/panniers.jpg",
    featuredOrder: 2,
    compatibility: {
      bikeIds: ["bmw-r1300gsa-2025", "bmw-r1250gsa-2024", "ktm-1290sar-2024"],
    },
  },
  {
    id: 3,
    name: "Upper Crash Bars",
    brand: "Outback Motortek",
    price: 600,
    categoryId: "protection",
    description: "Added protection for fairings and upper bodywork.",
    image: "/accessories/crash-bars.jpg",
    featuredOrder: 3,
    compatibility: {
      bikeIds: ["bmw-r1300gsa-2025", "ktm-1290sar-2024", "yamaha-tenere700-2024"],
    },
  },
  {
    id: 4,
    name: "Heavy Duty Skid Plate",
    brand: "SW-Motech",
    price: 450,
    categoryId: "protection",
    description: "Underbody protection for rough tracks and remote touring.",
    image: "/accessories/skid-plate.jpg",
    featuredOrder: 4,
    compatibility: {
      bikeIds: ["bmw-r1300gsa-2025", "bmw-r1250gsa-2024", "yamaha-tenere700-2024"],
    },
  },
  {
    id: 5,
    name: "Slip-On Exhaust",
    brand: "Akrapovič",
    price: 900,
    categoryId: "performance",
    description: "Sharper look, lighter weight, stronger character.",
    image: "/accessories/exhaust.jpg",
    featuredOrder: 5,
    compatibility: {
      bikeIds: ["bmw-r1300gsa-2025", "ktm-1290sar-2024"],
    },
  },
  {
    id: 6,
    name: "Performance Air Filter",
    brand: "DNA",
    price: 180,
    categoryId: "performance",
    description: "A simple upgrade for better airflow and response.",
    image: "/accessories/air-filter.jpg",
    featuredOrder: 6,
    compatibility: {
      bikeIds: ["bmw-r1300gsa-2025", "bmw-r1250gsa-2024", "ktm-1290sar-2024"],
    },
  },
  {
    id: 7,
    name: "Auxiliary LED Lights",
    brand: "Denali",
    price: 520,
    categoryId: "lighting",
    description: "Improved visibility for night riding and remote touring.",
    image: "/accessories/led-lights.jpg",
    featuredOrder: 7,
    compatibility: { bikeIds: [], universal: true },
  },
  {
    id: 8,
    name: "GPS Mount Bracket",
    brand: "Garmin",
    price: 140,
    categoryId: "navigation",
    description: "Clean cockpit mounting point for GPS or navigation device.",
    image: "/accessories/gps-mount.jpg",
    featuredOrder: 8,
    compatibility: {
      bikeIds: ["bmw-r1300gsa-2025", "bmw-r1250gsa-2024"],
    },
  },
  {
    id: 9,
    name: "Heated Comfort Seat",
    brand: "BMW",
    price: 780,
    categoryId: "seats",
    description: "Long-distance comfort upgrade with extra support.",
    image: "/accessories/seat.jpg",
    featuredOrder: 9,
    compatibility: { bikeIds: ["bmw-r1300gsa-2025"] },
  },
  {
    id: 10,
    name: "Tall Touring Screen",
    brand: "Puig",
    price: 310,
    categoryId: "windscreens",
    description: "Better wind protection for highway and cold weather riding.",
    image: "/accessories/touring-screen.jpg",
    featuredOrder: 10,
    compatibility: {
      bikeIds: ["bmw-r1300gsa-2025", "yamaha-tenere700-2024"],
    },
  },
  {
    id: 11,
    name: "USB Charging Hub",
    brand: "Quad Lock",
    price: 120,
    categoryId: "electronics",
    description: "Power your devices while riding with tidy integration.",
    image: "/accessories/usb-hub.jpg",
    featuredOrder: 11,
    compatibility: { bikeIds: [], universal: true },
  },
  {
    id: 12,
    name: "Handlebar Risers",
    brand: "Rox",
    price: 160,
    categoryId: "ergonomics",
    description: "Improved standing posture and comfort for taller riders.",
    image: "/accessories/risers.jpg",
    featuredOrder: 12,
    compatibility: { bikeIds: [], universal: true },
  },
  {
    id: 13,
    name: "Tank Bag",
    brand: "Mosko Moto",
    price: 260,
    categoryId: "luggage",
    description: "Quick-access storage for essentials on day rides and touring.",
    image: "/accessories/tank-bag.jpg",
    featuredOrder: 13,
    compatibility: { bikeIds: [], universal: true },
  },
  {
    id: 14,
    name: "Disc Lock Alarm",
    brand: "Oxford",
    price: 110,
    categoryId: "security",
    description: "Compact theft deterrent for extra peace of mind.",
    image: "/accessories/disc-lock.jpg",
    featuredOrder: 14,
    compatibility: { bikeIds: [], universal: true },
  },
];

function isCompatible(product: Product, bikeId: string) {
  return (
    product.compatibility.universal ||
    product.compatibility.bikeIds.includes(bikeId)
  );
}

type CompatibilityLabel = "Exact fit" | "Universal fit" | "Not confirmed";

function getCompatibilityLabel(
  product: Product,
  bikeId: string
): CompatibilityLabel {
  if (product.compatibility.universal) return "Universal fit";
  if (product.compatibility.bikeIds.includes(bikeId)) return "Exact fit";
  return "Not confirmed";
}

function mapSavedPhotosToUploaded(photos: SavedPhotoRecord[]): UploadedPhoto[] {
  return photos.map((photo) => ({
    id: photo.id,
    name: photo.file_name,
    url: photo.public_url,
    filePath: photo.file_path,
    persisted: true,
  }));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function GaragePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedBikeId, setSelectedBikeId] = useState("bmw-r1300gsa-2025");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlyCompatible, setOnlyCompatible] = useState(true);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [pageError, setPageError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBike, setSelectedBike] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isBuildDirty, setIsBuildDirty] = useState(false);
useEffect(() => {
  const saved = localStorage.getItem("savedBuild");

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      setSelectedProducts(parsed);
    } catch (err) {
      console.error("Failed to load saved build");
    }
  }
}, []);useEffect(() => {
  const loadSavedBuild = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("saved_builds")
        .select("products")
        .eq("user_id", user.id)
        .eq("bike_id", selectedBikeId)
        .maybeSingle();

      if (error) {
  console.error("Failed to load saved build", error);
  return;
}

      if (data?.products) {
        setSelectedProducts(data.products as Product[]);
      }
    } catch (err) {
      console.error("Unexpected error loading saved build", err);
    }
  };

  loadSavedBuild();
}, [selectedBikeId]);
  const currentBike = useMemo(() => {
  return bikes.find((bike) => bike.name === selectedBike) ?? bikes[0] ?? null;
}, [bikes, selectedBike]);
const addToBuild = (product: Product) => {
  setSelectedProducts((prev) => {
    const exists = prev.some((item) => item.id === product.id);
    if (exists) return prev;

    setSaveMessage("");
    setIsBuildDirty(true);

    return [...prev, product];
  });
};
  const filteredProducts = useMemo(() => {
    let next = [...products];

    if (selectedCategory !== "all") {
      next = next.filter((product) => product.categoryId === selectedCategory);
    }

    if (onlyCompatible) {
      next = next.filter((product) => isCompatible(product, selectedBikeId));
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();

      next = next.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.brand.toLowerCase().includes(term)
      );
    }

    return next.sort((a, b) => a.featuredOrder - b.featuredOrder);
  }, [selectedCategory, onlyCompatible, selectedBikeId, searchTerm]);

  const compatibleCount = useMemo(() => {
    return products.filter((product) => isCompatible(product, selectedBikeId))
      .length;
  }, [selectedBikeId]);

  const totalPhotoSlotsLeft = Math.max(0, 10 - uploadedPhotos.length);
  const heroImage = uploadedPhotos[selectedPhotoIndex]?.url || currentBike?.heroImage || "";

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setIsLoading(true);
      setPageError("");

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        const signedIn = !!user;
        setIsSignedIn(signedIn);

        if (signedIn) {
          try {
            const saved = (await getBuildPhotos()) as SavedPhotoRecord[];

            if (!isMounted) return;

            const mapped = mapSavedPhotosToUploaded(saved ?? []);
            setUploadedPhotos(mapped);
            setSelectedPhotoIndex(0);
          } catch (error) {
            console.error("getBuildPhotos failed:", error);
            if (isMounted) {
              setUploadedPhotos([]);
              setSelectedPhotoIndex(0);
            }
          }
        } else {
          setUploadedPhotos([]);
          setSelectedPhotoIndex(0);
        }
      } catch (error) {
        console.error("garage load failed:", error);
        if (isMounted) {
          setPageError("We couldn’t load your garage right now.");
          setUploadedPhotos([]);
          setSelectedPhotoIndex(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const signedIn = !!session?.user;
      setIsSignedIn(signedIn);

      if (!signedIn) {
        setUploadedPhotos([]);
        setSelectedPhotoIndex(0);
        setIsLoading(false);
        return;
      }

      try {
        const saved = (await getBuildPhotos()) as SavedPhotoRecord[];
const filtered = (saved ?? []).filter((photo) => photo.bike_name === selectedBike);
const mapped = mapSavedPhotosToUploaded(filtered);
setUploadedPhotos(mapped);
setSelectedPhotoIndex(0);
      } catch (error) {
        console.error("auth photo reload failed:", error);
        setUploadedPhotos([]);
        setSelectedPhotoIndex(0);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleBikeChange = (bikeId: string) => {
    setSelectedBikeId(bikeId);
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setPhotoError("");
    setSaveMessage("");
    setPageError("");

    if (uploadedPhotos.length >= 10) {
      setPhotoError("You already have 10 photos uploaded.");
      event.target.value = "";
      return;
    }

    const remainingSlots = 10 - uploadedPhotos.length;
    const acceptedFiles = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setPhotoError(`Only ${remainingSlots} more photo(s) can be added.`);
    }

    try {
      setIsUploadingPhotos(true);

      if (isSignedIn) {
        const startSortOrder = uploadedPhotos.length;
        const uploaded = await Promise.all(
          acceptedFiles.map((file, index) =>
            uploadBuildPhoto(file, selectedBike)
          )
        );

        const mapped = mapSavedPhotosToUploaded(uploaded as SavedPhotoRecord[]);
        setUploadedPhotos((prev) => {
          const next = [...prev, ...mapped];
          if (prev.length === 0 && next.length > 0) {
            setSelectedPhotoIndex(0);
          }
          return next;
        });
        setSaveMessage("Photo upload complete.");
      } else {
        const localPhotos: UploadedPhoto[] = acceptedFiles.map((file, index) => ({
          id: `${file.name}-${file.size}-${Date.now()}-${index}`,
          name: file.name,
          url: URL.createObjectURL(file),
          persisted: false,
        }));

        setUploadedPhotos((prev) => {
          const next = [...prev, ...localPhotos];
          if (prev.length === 0 && next.length > 0) {
            setSelectedPhotoIndex(0);
          }
          return next;
        });
        setSaveMessage("Photos added locally. Sign in to save them permanently.");
      }
    } catch (error: unknown) {
  console.error("Photo upload error:", error);

  const message =
    error instanceof Error ? error.message : "Photo upload failed. Please try again.";

  setPhotoError(message);
} finally {
      setIsUploadingPhotos(false);
      event.target.value = "";
    }
  };

  const handleDeletePhoto = async (photo: UploadedPhoto) => {
    if (!confirm("Remove this photo from your build?")) return;

    try {
      setPageError("");
      setSaveMessage("");
      setPhotoError("");

      if (photo.persisted && photo.filePath) {
        await deleteBuildPhoto(photo.id, photo.filePath);
      }

      setUploadedPhotos((prev) => {
        const next = prev.filter((item) => item.id !== photo.id);

        setSelectedPhotoIndex((currentIndex) => {
          if (next.length === 0) return 0;
          if (currentIndex >= next.length) return next.length - 1;
          return currentIndex;
        });

        return next;
      });

      setSaveMessage("Photo removed.");
    } catch (error) {
      console.error(error);
      setPhotoError("We couldn’t remove that photo. Please try again.");
    }
  };

  const handleSignIn = async () => {
    const email = window.prompt("Enter your email to sign in:");
    if (!email) return;

    setPageError("");
    setSaveMessage("");

    try {
      const redirectTo = `${window.location.origin}/garage`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) throw error;

      setSaveMessage("Check your email for the sign-in link.");
    } catch (error) {
      console.error(error);
      setPageError("We couldn’t send the sign-in link. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setSaveMessage("Signed out.");
    } catch (error) {
      console.error(error);
      setPageError("We couldn’t sign you out right now.");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(243,244,246,1) 100%)",
        padding: "32px 20px 48px",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <section
          style={{
            background: "#111827",
            color: "#ffffff",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 20px 40px rgba(17,24,39,0.18)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                  color: "#9ca3af",
                }}
              >
                Accessorise It
              </p>

              <h1 style={{ margin: "8px 0 10px", fontSize: 34, lineHeight: 1.1 }}>
                My Garage
              </h1>

              <p
                style={{
                  margin: 0,
                  maxWidth: 700,
                  color: "#d1d5db",
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                Upload up to 10 photos of your actual bike build, then scroll through
                them in your own gallery.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {isSignedIn ? (
                <button
                  onClick={handleSignOut}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "#1f2937",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Sign out
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "none",
                    background: "#ffffff",
                    color: "#111827",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Sign in
                </button>
              )}

              <label
                htmlFor="bike-photo-upload"
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: isUploadingPhotos ? "#6b7280" : "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: isUploadingPhotos ? "default" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {isUploadingPhotos ? "Uploading..." : "Upload Photos"}
              </label>
            </div>
          </div>

          <input
            id="bike-photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            style={{ display: "none" }}
            disabled={isUploadingPhotos}
          />

          <div
            style={{
              marginTop: 14,
              fontSize: 14,
              color: "#cbd5e1",
            }}
          >
            {uploadedPhotos.length}/10 photos uploaded
            {totalPhotoSlotsLeft > 0 ? ` • ${totalPhotoSlotsLeft} slot(s) left` : ""}
          </div>

          {saveMessage ? (
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(34,197,94,0.15)",
                color: "#dcfce7",
                fontSize: 14,
              }}
            >
              {saveMessage}
            </div>
          ) : null}

          {photoError ? (
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(239,68,68,0.14)",
                color: "#fecaca",
                fontSize: 14,
              }}
            >
              {photoError}
            </div>
          ) : null}

          {pageError ? (
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(239,68,68,0.14)",
                color: "#fecaca",
                fontSize: 14,
              }}
            >
              {pageError}
            </div>
          ) : null}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 0.8fr)",
            gap: 24,
            alignItems: "start",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: 20,
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              border: "1px solid #e5e7eb",
            }}
          >
            {uploadedPhotos.length > 0 ? (
              <>
                <div
  style={{
  borderRadius: 20,
  overflow: "hidden",
  position: "relative",
  background: "#f3f4f6",
  marginBottom: 16,
}}
>
<button
  onClick={() =>
    setSelectedPhotoIndex((prev) =>
      prev > 0 ? prev - 1 : uploadedPhotos.length - 1
    )
  }
  style={{
    position: "absolute",
    left: 20,
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    cursor: "pointer",
    fontSize: 18,
  }}
>
  ‹
</button>
  <img
    src={heroImage}
    alt="Bike"
    style={{
      width: "100%",
      height: 360,
      objectFit: "cover",
      display: "block",
    }}
  />
</div>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    scrollBehavior: "smooth",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    paddingBottom: 8,
                  }}
                >
                  {uploadedPhotos.map((photo, index) => {
                    const active = index === selectedPhotoIndex;

                    return (
                      <div key={photo.id} style={{ minWidth: 150, width: 150 }}>
                        <button
                          onClick={() => setSelectedPhotoIndex(index)}
                          style={{
                            width: "100%",
                            border: active ? "3px solid #2563eb" : "1px solid #d1d5db",
                            padding: 0,
                            borderRadius: 14,
                            overflow: "hidden",
                            background: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          <img
  src={photo.url}
  alt={photo.name}
  style={{
    width: "100%",
    height: 90,
    objectFit: "cover",
    display: "block",
    backgroundColor: "#f3f4f6",
  }}
/>
                        </button>

                        <button
                          onClick={() => handleDeletePhoto(photo)}
                          style={{
                            marginTop: 8,
                            width: "100%",
                            border: "1px solid #e5e7eb",
                            background: "#fff",
                            borderRadius: 10,
                            padding: "8px 10px",
                            cursor: "pointer",
                            color: "#b00020",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div
                style={{
                  position: "relative",
                  height: 360,
                  borderRadius: 20,
                  border: "2px dashed #cbd5e1",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 24,
                  color: "#64748b",
                  lineHeight: 1.6,
                }}
              >
                Upload your first bike photo to start your build gallery.
              </div>
            )}
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              padding: 22,
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              border: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "#6b7280",
              }}
            >
              Bike Summary
            </p>

            <h2 style={{ margin: "10px 0 8px", fontSize: 28 }}>My Motorcycle</h2>

            <p
              style={{
                marginTop: 0,
                color: "#4b5563",
                lineHeight: 1.6,
                fontSize: 14,
              }}
            >
              Products are matched against the selected bike and your uploaded build
              photos become the hero image automatically.
            </p>

            <div
              style={{
                marginTop: 18,
                height: 220,
                borderRadius: 18,
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#f3f4f6",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
                marginTop: 16,
              }}
            >
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280" }}>Bike</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{currentBike?.brand || ""}</div>
              </div>

              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280" }}>Model</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{currentBike?.model || ""}</div>
              </div>

              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280" }}>Year</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{currentBike?.yearLabel || ""}</div>
              </div>

              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280" }}>Compatible</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{compatibleCount} items</div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                background: "#ffffff",
                borderRadius: 20,
                padding: 18,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <input
                  type="text"
                  placeholder="Search products (e.g. panniers, BMW, lights...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    fontSize: 14,
                    outline: "none",
                  }}
                />

                <select
                  value={selectedBikeId}
                  onChange={(e) => handleBikeChange(e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  {bikes.map((bike) => (
                    <option key={bike.id} value={bike.id}>
                      {bike.brand} {bike.model} ({bike.yearLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    fontSize: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={onlyCompatible}
                    onChange={(e) => setOnlyCompatible(e.target.checked)}
                  />
                  Only show compatible items
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {categories.map((category) => {
                  const active = selectedCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 999,
                        border: active ? "1px solid #111827" : "1px solid #d1d5db",
                        background: active ? "#111827" : "#ffffff",
                        color: active ? "#ffffff" : "#111827",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              {filteredProducts.map((product) => {
                const compatibilityLabel = getCompatibilityLabel(product, selectedBikeId);

                return (
                  <div
  key={product.id}
  style={{
    background: "#ffffff",
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 14px rgba(0,0,0,0.05)",

    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    cursor: "pointer",
  }}
>
                    <div
                      style={{
                        height: 220,
                        backgroundImage: `url(${product.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: "#f3f4f6",
                      }}
                    />

                    <div style={{ padding: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "start",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b7280",
                              textTransform: "uppercase",
                              letterSpacing: 0.9,
                              marginBottom: 6,
                            }}
                          >
                            {product.brand}
                          </div>

                          <h3 style={{ margin: 0, fontSize: 20 }}>{product.name}</h3>
                        </div>

                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 18,
                            whiteSpace: "nowrap",
                            color: "#111827",
                          }}
                        >
                          {formatCurrency(product.price)}
                        </div>
                      </div>

                      <p
                        style={{
                          margin: "12px 0 14px",
                          color: "#4b5563",
                          lineHeight: 1.6,
                          fontSize: 14,
                        }}
                      >
                        {product.description}
                      </p>

                     <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  }}
>
  <span
    style={{
      display: "inline-flex",
      padding: "8px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background:
        compatibilityLabel === "Exact fit"
          ? "#dcfce7"
          : compatibilityLabel === "Universal fit"
          ? "#dbeafe"
          : "#f3f4f6",
      color:
        compatibilityLabel === "Exact fit"
          ? "#166534"
          : compatibilityLabel === "Universal fit"
          ? "#1d4ed8"
          : "#4b5563",
    }}
  >
    {compatibilityLabel}
  </span>

  <div style={{ display: "flex", gap: 8 }}>
    <button
      onClick={() => addToBuild(product)}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "none",
        background: "#111827",
        color: "#ffffff",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Add to Build
    </button>

    <button
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#111827",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      View product
    </button>
  </div>
</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside
            style={{
              background: "#ffffff",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              border: "1px solid #e5e7eb",
              position: "sticky",
              top: 20,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "#6b7280",
              }}
            >
              Build Snapshot
            </p>

            <h3 style={{ margin: "10px 0 12px", fontSize: 24 }}>Ready for next phase</h3>
            {saveMessage && (
  <div
    style={{
      background: "#dcfce7",
      color: "#166534",
      padding: "10px 12px",
      borderRadius: 10,
      marginBottom: 12,
      fontSize: 14,
      fontWeight: 600,
    }}
  >
    {saveMessage}
  </div>
)}
            <h4 style={{ margin: "16px 0 10px" }}>My Build</h4>
            {selectedProducts.length > 0 && (
  <button
    type="button"
    onClick={async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setSaveMessage("Please sign in to save your build.");
          return;
        }

        const { error } = await supabase
          .from("saved_builds")
          .upsert(
            {
              user_id: user.id,
              bike_id: selectedBikeId,
              products: selectedProducts,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,bike_id",
            }
          );

        if (error) {
          console.error(error);
          setSaveMessage("Error saving build.");
        } else {
          setSaveMessage("Build saved successfully.");
          setIsBuildDirty(false);
        }
      } catch (err) {
        console.error(err);
        setSaveMessage("Unexpected error saving build.");
      }
    }}
    style={{
      width: "100%",
      padding: "10px 14px",
      borderRadius: 12,
      border: "none",
      background: isBuildDirty ? "#111827" : "#9ca3af",
      color: "#ffffff",
      fontWeight: 700,
      cursor: "pointer",
      marginBottom: 12,
      opacity: isBuildDirty ? 1 : 0.7,
    }}
  >
    {isBuildDirty ? "Save Build" : "Saved"}
  </button>
)}
            
{selectedProducts.length > 0 && (
  <div
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      background: "#f9fafb",
    }}
  >
    <div style={{ fontSize: 12, color: "#6b7280" }}>
      Total Build Value
    </div>
    <div style={{ fontSize: 20, fontWeight: 800 }}>
      {formatCurrency(
        selectedProducts.reduce((total, item) => total + item.price, 0)
      )}
    </div>
  </div>
)}
{selectedProducts.length === 0 && (
  <p style={{ color: "#6b7280", fontSize: 14 }}>
    No items selected yet.
  </p>
)}
{selectedProducts.map((item) => (
  <div
    key={item.id}
    style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 10,
      marginBottom: 8,
      background: "#ffffff",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontWeight: 700 }}>{item.name}</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {item.brand}
        </div>
      </div>

      <button
        onClick={() =>
  setSelectedProducts((prev) => {
    const updated = prev.filter((p) => p.id !== item.id);
    setSaveMessage("");
    setIsBuildDirty(true);
    return updated;
  })
}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          color: "#dc2626",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        Remove
      </button>
    </div>

    <div style={{ fontWeight: 600, marginTop: 6 }}>
      {formatCurrency(item.price)}
    </div>
  </div>
))}


            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                  background: "#f9fafb",
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280" }}>Garage photos</div>
                <div style={{ fontWeight: 800, marginTop: 4 }}>{uploadedPhotos.length}/10</div>
              </div>

              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                  background: "#f9fafb",
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280" }}>Selected bike</div>
                <div style={{ fontWeight: 800, marginTop: 4 }}>
                  {currentBike ? `${currentBike.brand} ${currentBike.model}` : ""}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 14,
                  background: "#f9fafb",
                }}
              >
                <div style={{ fontSize: 12, color: "#6b7280" }}>Compatible products</div>
                <div style={{ fontWeight: 800, marginTop: 4 }}>{compatibleCount}</div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 16,
                background: "#eff6ff",
                color: "#1e3a8a",
                lineHeight: 1.6,
                fontSize: 14,
              }}
            >
              Next build step: save the selected bike against the signed-in user, then
              persist chosen accessories to the build.
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}