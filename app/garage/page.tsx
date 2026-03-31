"use client";
import GarageHeader from "../components/GarageHeader";
import GaragePhotoGallery from "../components/GaragePhotoGallery";
import BikeSummary from "../components/BikeSummary";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  deleteBuildPhoto,
  getBuildPhotos,
  uploadBuildPhoto,
} from "@/lib/build-storage";
import {
  bikes,
  getMakes,
  getSeriesByMake,
  getModelsByMakeAndSeries,
  getYearsByMakeSeriesAndModel,
  getBikeByDetails,
} from "@/lib/bikes";


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

type SupabaseBike = {
  id: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  category: string | null;
  engine_cc: number | null;
};

export default function GaragePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedBikeId, setSelectedBikeId] = useState("bmw-r-series-r1300gsa-2025");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showExactFitOnly, setShowExactFitOnly] = useState(false);
  const [onlyCompatible, setOnlyCompatible] = useState(true);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [pageError, setPageError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [supabaseBikes, setSupabaseBikes] = useState<SupabaseBike[]>([]);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [bikeBuilds, setBikeBuilds] = useState<Record<string, Product[]>>({});
  const [dirtyBuilds, setDirtyBuilds] = useState<Record<string, boolean>>({});
  const [loadedBuilds, setLoadedBuilds] = useState<Record<string, boolean>>({});

  const makeOptions = [
  ...new Set(supabaseBikes.map((b) => b.make)),
].sort();

const seriesOptions = selectedMake
  ? [...new Set(
      supabaseBikes
        .filter((b) => b.make === selectedMake)
        .map((b) => b.model)
    )].sort()
  : [];

const modelOptions = selectedMake && selectedSeries
  ? [
      ...new Set(
        supabaseBikes
          .filter(
            (b) => b.make === selectedMake && b.model === selectedSeries
          )
          .map((b) => b.variant || "Base")
      ),
    ].sort()
  : [];

useEffect(() => {
  if (!selectedMake || !selectedSeries) return;
  if (modelOptions.length !== 1) return;

  const onlyModel = modelOptions[0];

  if (selectedModel !== onlyModel) {
    setSelectedModel(onlyModel);
  }
}, [selectedMake, selectedSeries, modelOptions, selectedModel]);  

const yearOptions = selectedMake && selectedSeries && selectedModel
  ? [
      ...new Set(
        supabaseBikes
          .filter(
            (b) =>
              b.make === selectedMake &&
              b.model === selectedSeries &&
              (b.variant || "Base") === selectedModel
          )
          .map((b) => b.year)
      ),
    ].sort((a, b) => b - a)
  : [];

  const currentBike = useMemo(() => {
  return (
    supabaseBikes.find((bike) => bike.id === selectedBikeId) ??
    supabaseBikes[0] ??
    null
  );
}, [selectedBikeId, supabaseBikes]);

  useEffect(() => {
  if (!currentBike) return;

  setSelectedMake(currentBike.make);
  setSelectedSeries(currentBike.model);
  setSelectedModel(currentBike.variant || "Base");
  setSelectedYear(String(currentBike.year));
}, [currentBike]);
useEffect(() => {
  if (!selectedMake || !selectedSeries || !selectedModel) return;
  if (yearOptions.length !== 1) return;

  const onlyYear = String(yearOptions[0]);

  if (selectedYear !== onlyYear) {
    setSelectedYear(onlyYear);
  }
}, [selectedMake, selectedSeries, selectedModel, yearOptions, selectedYear]);
useEffect(() => {
  if (!selectedMake || !selectedSeries || !selectedModel || !selectedYear) return;

  const matchedBike = supabaseBikes.find(
  (bike) =>
    bike.make === selectedMake &&
    bike.model === selectedSeries &&
    (bike.variant || "Base") === selectedModel &&
    bike.year === Number(selectedYear)
);

console.log("MATCH TEST:", selectedMake, selectedSeries, selectedModel, selectedYear, matchedBike);

  if (matchedBike && matchedBike.id !== selectedBikeId) {
    setSelectedBikeId(matchedBike.id);
  }
}, [
  selectedMake,
  selectedSeries,
  selectedModel,
  selectedYear,
  selectedBikeId,
]);

useEffect(() => {
  const fetchBikes = async () => {
    const { data, error } = await supabase
      .from("bikes")
      .select("*");

    if (error) {
      console.error("Error fetching bikes:", error);
      return;
    }

    if (data) {
      setSupabaseBikes(data);
      console.log("Supabase bikes loaded:", data.length);
    }
  };

  fetchBikes();
}, []);

  const selectedProducts = bikeBuilds[selectedBikeId] ?? [];
  const isBuildDirty = dirtyBuilds[selectedBikeId] ?? false;
const recommendedProducts = useMemo(() => {
  const term = searchTerm.trim().toLowerCase();

  return products
    .filter((product) => {
      const isExactFit =
        !!currentBike &&
        product.compatibility?.bikeIds?.includes(currentBike.id);

      const isUniversal = product.compatibility?.universal === true;

      const matchesBike =
        !currentBike ||
        isExactFit ||
        (isUniversal && showExactFitOnly === false);

      if (!matchesBike) return false;

      if (selectedProducts.some((item) => item.id === product.id)) return false;

      if (selectedCategory !== "all" && product.categoryId !== selectedCategory) {
        return false;
      }

      if (!term) return true;

      return (
        product.name.toLowerCase().includes(term) ||
        product.brand.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const aExactFit =
        !!currentBike && a.compatibility?.bikeIds?.includes(currentBike.id);
      const bExactFit =
        !!currentBike && b.compatibility?.bikeIds?.includes(currentBike.id);

      // Exact fit first
      if (aExactFit && !bExactFit) return -1;
      if (!aExactFit && bExactFit) return 1;

      // Then featured order
      if (a.featuredOrder !== b.featuredOrder) {
        return a.featuredOrder - b.featuredOrder;
      }

      // Then alphabetical
      return a.name.localeCompare(b.name);
    });
}, [
  products,
  currentBike,
  showExactFitOnly,
  selectedProducts,
  selectedCategory,
  searchTerm,
]);
  
useEffect(() => {
    let isMounted = true;

    async function loadBuildForBike() {
      if (loadedBuilds[selectedBikeId]) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (!user) {
          setBikeBuilds((prev) => ({
            ...prev,
            [selectedBikeId]: prev[selectedBikeId] ?? [],
          }));
          setLoadedBuilds((prev) => ({
            ...prev,
            [selectedBikeId]: true,
          }));
          return;
        }

        const { data, error } = await supabase
          .from("saved_builds")
          .select("products")
          .eq("user_id", user.id)
          .eq("bike_id", selectedBikeId)
          .maybeSingle();

        if (error) {
          console.error("Failed to load saved build", error);
          setBikeBuilds((prev) => ({
            ...prev,
            [selectedBikeId]: prev[selectedBikeId] ?? [],
          }));
          setLoadedBuilds((prev) => ({
            ...prev,
            [selectedBikeId]: true,
          }));
          return;
        }

        const loadedProducts = Array.isArray(data?.products)
          ? (data.products as Product[])
          : [];

        setBikeBuilds((prev) => ({
          ...prev,
          [selectedBikeId]: loadedProducts,
        }));

        setDirtyBuilds((prev) => ({
          ...prev,
          [selectedBikeId]: false,
        }));

        setLoadedBuilds((prev) => ({
          ...prev,
          [selectedBikeId]: true,
        }));
      } catch (err) {
        console.error("Unexpected error loading saved build", err);
        setBikeBuilds((prev) => ({
          ...prev,
          [selectedBikeId]: prev[selectedBikeId] ?? [],
        }));
        setLoadedBuilds((prev) => ({
          ...prev,
          [selectedBikeId]: true,
        }));
      }
    }

    loadBuildForBike();

    return () => {
      isMounted = false;
    };
  }, [selectedBikeId, loadedBuilds]);

  const addToBuild = (product: Product) => {
    setBikeBuilds((prev) => {
      const currentBuild = prev[selectedBikeId] ?? [];
      const exists = currentBuild.some((item) => item.id === product.id);

      if (exists) return prev;

      return {
        ...prev,
        [selectedBikeId]: [...currentBuild, product],
      };
    });

    setSaveMessage("");
    setDirtyBuilds((prev) => ({
      ...prev,
      [selectedBikeId]: true,
    }));
  };

  const removeFromBuild = (productId: number) => {
    setBikeBuilds((prev) => {
      const currentBuild = prev[selectedBikeId] ?? [];

      return {
        ...prev,
        [selectedBikeId]: currentBuild.filter((item) => item.id !== productId),
      };
    });

    setSaveMessage("");
    setDirtyBuilds((prev) => ({
      ...prev,
      [selectedBikeId]: true,
    }));
  };
const getRecommendationReason = (product: Product) => {
  const isExactFit =
    !!currentBike && product.compatibility?.bikeIds?.includes(currentBike.id);

  if (isExactFit) return "Exact fit for your bike";

  if (product.compatibility?.universal) return "Universal fit option";

  return "Recommended for your build";
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

const uploadedHeroImage =
  uploadedPhotos.length > 0
    ? uploadedPhotos[
        Math.min(selectedPhotoIndex, uploadedPhotos.length - 1)
      ]?.url
    : null;

const heroImage =
  uploadedHeroImage || currentBike?.heroImage || "/placeholder-new.jpg";
  const bikeMatchedProducts = products.filter((product) => {
  if (!currentBike) return true;

  if (product.compatibility?.universal) return true;

  return product.compatibility?.bikeIds?.includes(currentBike.id);
});
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
        setBikeBuilds({});
        setDirtyBuilds({});
        setLoadedBuilds({});
        setIsLoading(false);
        return;
      }

      try {
        const saved = (await getBuildPhotos()) as SavedPhotoRecord[];
        const filtered = saved ?? [];
        const mapped = mapSavedPhotosToUploaded(filtered);
        setUploadedPhotos(mapped);
        setSelectedPhotoIndex(0);

        setLoadedBuilds({});
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
    setSaveMessage("");
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
        const uploaded = await Promise.all(
          acceptedFiles.map((file) => uploadBuildPhoto(file, selectedBikeId))
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
        error instanceof Error
          ? error.message
          : "Photo upload failed. Please try again.";

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
      const redirectTo = `${window.location.origin}/auth/callback`;

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

  const handleSaveBuild = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaveMessage("Please sign in to save your build.");
        return;
      }

      const { error } = await supabase.from("saved_builds").upsert(
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
        return;
      }

      setSaveMessage("Build saved successfully.");
      setDirtyBuilds((prev) => ({
        ...prev,
        [selectedBikeId]: false,
      }));
    } catch (err) {
      console.error(err);
      setSaveMessage("Unexpected error saving build.");
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

  {/* Step Navigation */}
<div
  style={{
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: 24,
  }}
>
  <div
    style={{
      maxWidth: 1280,
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      padding: "14px 10px",
    }}
  >
    {["Bike", "Build", "Compare", "Save", "Buy"].map((step, index) => (
      <div
        key={step}
        style={{
          flex: 1,
          textAlign: "center",
          fontSize: 13,
          fontWeight: 600,
          color: index === 0 ? "#111827" : "#9ca3af",
background: index === 0 ? "#f3f4f6" : "transparent",
padding: "10px 0",
borderRadius: 999,
        }}
      >
        {step}
      </div>
    ))}
  </div>
</div>  

    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
  <GarageHeader
  isSignedIn={isSignedIn}
  isUploadingPhotos={isUploadingPhotos}
  uploadedPhotos={uploadedPhotos}
  totalPhotoSlotsLeft={totalPhotoSlotsLeft}
  saveMessage={saveMessage}
  photoError={photoError}
  pageError={pageError}
  handleSignIn={handleSignIn}
  handleSignOut={handleSignOut}
  handlePhotoUpload={handlePhotoUpload}
/>


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
  id="bike-step"
  style={{
    background: "#ffffff",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    marginBottom: 18,
  }}
>
            <GaragePhotoGallery
  uploadedPhotos={uploadedPhotos}
  selectedPhotoIndex={selectedPhotoIndex}
  setSelectedPhotoIndex={setSelectedPhotoIndex}
  heroImage={heroImage}
  handleDeletePhoto={handleDeletePhoto}
/>
          </div>

                    <BikeSummary
            currentBike={currentBike}
            heroImage={heroImage}
            compatibleCount={compatibleCount}
          />
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
                  gridTemplateColumns: "1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products (e.g. panniers, BMW, lights...)"
                  style={{
                    width: "100%",
                    maxWidth: 500,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                  }}
                />

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: 14,
                      color: "#374151",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showExactFitOnly}
                      onChange={(event) => setShowExactFitOnly(event.target.checked)}
                    />
                    <span>Only show exact fit</span>
                  </label>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "grid", gap: 6 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#374151",
                        letterSpacing: 0.3,
                      }}
                    >
                      Make
                    </label>
                    <select
                      value={selectedMake}
onChange={(e) => {
  const value = e.target.value;
  setSelectedMake(value);

  if (value !== selectedMake) {
    setSelectedSeries("");
    setSelectedModel("");
    setSelectedYear("");
  }
}}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1px solid #d1d5db",
                        background: "#ffffff",
                        fontSize: 14,
                        outline: "none",
                      }}
                    >
                      <option value="">Select Make</option>
                      {makeOptions.map((make) => (
                        <option key={make} value={make}>
                          {make}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#374151",
                        letterSpacing: 0.3,
                      }}
                    >
                      Series
                    </label>
                    <select
                      value={selectedSeries}
onChange={(e) => {
  const value = e.target.value;
  setSelectedSeries(value);

  if (value !== selectedSeries) {
    setSelectedModel("");
    setSelectedYear("");
  }
}}
                      disabled={!selectedMake}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1px solid #d1d5db",
                        background: selectedMake ? "#ffffff" : "#f3f4f6",
                        fontSize: 14,
                        outline: "none",
                        color: selectedMake ? "#111827" : "#9ca3af",
                      }}
                    >
                      <option value="">Select Series</option>
                      {seriesOptions.map((series) => (
                        <option key={series} value={series}>
                          {series}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#374151",
                        letterSpacing: 0.3,
                      }}
                    >
                      Model
                    </label>
                    <select
  value={selectedModel}
  onChange={(e) => {
    const value = e.target.value;
    setSelectedModel(value);

    if (value !== selectedModel) {
      setSelectedYear("");
    }
  }}
  disabled={!selectedSeries || modelOptions.length === 0}
  style={{
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: !selectedSeries || modelOptions.length === 0 ? "#f3f4f6" : "#ffffff",
    fontSize: 14,
    outline: "none",
    color: !selectedSeries || modelOptions.length === 0 ? "#9ca3af" : "#111827",
  }}
>
  <option value="">
    {!selectedSeries
      ? "Select Series first"
      : modelOptions.length === 0
      ? "No models available"
      : "Select Model"}
  </option>
  {modelOptions.map((model) => (
    <option key={model} value={model}>
      {model}
    </option>
  ))}
</select>
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
  <label
    style={{
      fontSize: 12,
      fontWeight: 700,
      color: "#374151",
      letterSpacing: 0.3,
    }}
  >
    Year
  </label>

  <select
    value={selectedYear}
    onChange={(e) => {
      setSelectedYear(e.target.value);
    }}
    disabled={!selectedModel || yearOptions.length === 0}
    style={{
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid #d1d5db",
      background:
        !selectedModel || yearOptions.length === 0 ? "#f3f4f6" : "#ffffff",
      fontSize: 14,
      outline: "none",
      color:
        !selectedModel || yearOptions.length === 0 ? "#9ca3af" : "#111827",
    }}
  >
    <option value="">
      {!selectedModel
        ? "Select Model first"
        : yearOptions.length === 0
        ? "No years available"
        : "Select Year"}
    </option>
    {yearOptions.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
</div>
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
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              {recommendedProducts.map((product) => {
                const compatibilityLabel = getCompatibilityLabel(product, selectedBikeId);
                const alreadyAdded = selectedProducts.some(
                  (item) => item.id === product.id
                );

                return (
                  <div
                    key={product.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 6px 14px rgba(0,0,0,0.05)",
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

                          <div style={{ marginBottom: 8 }}>
                            {product.compatibility?.bikeIds?.includes(currentBike?.id) ? (
                              <span
                                style={{
                                  fontSize: 12,
                                  background: "#d1fae5",
                                  color: "#065f46",
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                }}
                              >
                                Exact fit
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: 12,
                                  background: "#e5e7eb",
                                  color: "#374151",
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                }}
                              >
                                Universal
                              </span>
                            )}
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
                            onClick={() =>
                              alreadyAdded
                                ? removeFromBuild(product.id)
                                : addToBuild(product)
                            }
                            style={{
                              padding: "10px 14px",
                              borderRadius: 12,
                              border: "none",
                              background: alreadyAdded ? "#6b7280" : "#111827",
                              color: "#ffffff",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {alreadyAdded ? "Remove" : "Add to Build"}
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
            key={selectedBikeId}
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

            <h3 style={{ margin: "10px 0 12px", fontSize: 24 }}>
              Ready for next phase
            </h3>

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

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 16,
                background: "#ffffff",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                Selected bike
              </div>

              <div style={{ fontWeight: 800, fontSize: 16 }}>
                {currentBike
  ? `${currentBike.make} ${currentBike.model} ${currentBike.variant || "Base"} (${currentBike.year})`
  : "No bike selected"}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#6b7280",
                }}
              >
                {compatibleCount} compatible accessories
              </div>
            </div>

            <h4 style={{ margin: "16px 0 10px" }}>My Build</h4>

            {selectedProducts.length > 0 && (
              <button
                type="button"
                onClick={handleSaveBuild}
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
                    selectedProducts.reduce(
                      (total, item) => total + item.price,
                      0
                    )
                  )}
                </div>
              </div>
            )}

            {selectedProducts.length === 0 && recommendedProducts.length === 0 && (
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                No items selected yet for this bike.
              </p>
            )}

            {selectedProducts.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 8,
                  background: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={item.image || "/placeholder-new.jpg"}
                    alt={item.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder-new.jpg";
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 6,
                      background: "#f3f4f6",
                      flexShrink: 0,
                    }}
                  />

                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {item.brand}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 6,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {formatCurrency(item.price)}
                  </div>

                  <button
                    onClick={() => removeFromBuild(item.id)}
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
              </div>
            ))}
          </aside>
        </section>
          </div>
        </main>
  );
}