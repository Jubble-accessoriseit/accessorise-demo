"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type BikeOption = {
  name: string;
  make: string;
  series: string;
  model: string;
  year: string;
  type: string;
  price: string;
  image: string;
  blurb: string;
  garageTitle: string;
  garageSubtitle: string;
  installed: string[];
  suggested: string[];
  heroLabel: string;
  buildTotal: string;
  featuredAccessory: string;
};

type Accessory = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: string;
  fit: string;
  image: string;
  compatibleBikes: string[];
  featured?: boolean;
};

type RelevantThumbnailParams = {
  compatibleProducts: Accessory[];
  hasSelectedBikeFilters: boolean;
  selectedCategory: string;
  selectedSubcategory: string | null;
  selectedProductName: string | null;
  searchTerm: string;
};

const normalizeValue = (value: string) => value.trim().toLowerCase();

const matchesSearchTerm = (product: Accessory, searchTerm: string) => {
  const normalizedSearchTerm = normalizeValue(searchTerm);

  if (!normalizedSearchTerm) {
    return false;
  }

  return [product.name, product.category, product.subcategory, product.fit]
    .filter(Boolean)
    .some((value) => normalizeValue(String(value)).includes(normalizedSearchTerm));
};

// Keep thumbnail ordering predictable by adding products in strict relevance buckets.
const getRelevantThumbnails = ({
  compatibleProducts,
  hasSelectedBikeFilters,
  selectedCategory,
  selectedSubcategory,
  selectedProductName,
  searchTerm,
}: RelevantThumbnailParams) => {
  if (!hasSelectedBikeFilters) {
    return [];
  }

  const uniqueProducts = new Map<string, Accessory>();
  const addProducts = (products: Accessory[]) => {
    products.forEach((product) => {
      if (!product.image || uniqueProducts.has(product.id)) {
        return;
      }

      uniqueProducts.set(product.id, product);
    });
  };

  const selectedProduct =
    compatibleProducts.find((product) => product.name === selectedProductName) ?? null;

  if (selectedProduct) {
    addProducts([selectedProduct]);
  }

  addProducts(
    compatibleProducts.filter((product) => {
      const categoryMatches = product.category === selectedCategory;
      const subcategoryMatches = selectedSubcategory
        ? product.subcategory === selectedSubcategory
        : true;

      return categoryMatches && subcategoryMatches;
    })
  );

  addProducts(compatibleProducts.filter((product) => matchesSearchTerm(product, searchTerm)));
  addProducts(compatibleProducts);

  return Array.from(uniqueProducts.values());
};

const getAccessoryCatalog = (bike: BikeOption): Accessory[] => [
  {
    id: `${bike.name}-featured-luggage`,
    name: bike.featuredAccessory,
    category: "Luggage",
    subcategory: bike.name.includes("GSA") ? "Hard luggage" : "Adventure luggage",
    price: bike.name.includes("GSA") ? "$1,690" : "$1,290",
    fit: `Exact fit for ${bike.name}`,
    image: "/placeholder.jpg",
    compatibleBikes: [bike.name],
    featured: true,
  },
  {
    id: "adventure-crash-bars",
    name: "Adventure Crash Bars",
    category: "Protection",
    subcategory: "Crash protection",
    price: "$890",
    fit: `Compatible with selected adventure platforms`,
    image: "/placeholder.jpg",
    compatibleBikes: ["BMW R1300GS", "BMW R1300GSA", "KTM 890 Adventure", "Yamaha Tenere 700"],
  },
  {
    id: "rally-skid-plate",
    name: "Rally Skid Plate",
    category: "Off-road",
    subcategory: "Underbody protection",
    price: "$640",
    fit: `Compatible with selected adventure platforms`,
    image: "/placeholder.jpg",
    compatibleBikes: ["BMW R1300GS", "BMW R1300GSA", "KTM 890 Adventure", "Yamaha Tenere 700"],
  },
  {
    id: "touring-comfort-seat",
    name: "Touring Comfort Seat",
    category: "Comfort",
    subcategory: "Seat upgrades",
    price: "$520",
    fit: `Compatible with selected touring setups`,
    image: "/placeholder.jpg",
    compatibleBikes: ["BMW R1300GS", "BMW R1300GSA", "Yamaha Tenere 700", "Ducati Multistrada V4S"],
  },
  {
    id: "led-driving-lights",
    name: "LED Driving Lights",
    category: "Lighting",
    subcategory: "Auxiliary lighting",
    price: "$410",
    fit: `Compatible with selected adventure platforms`,
    image: "/placeholder.jpg",
    compatibleBikes: ["BMW R1300GS", "BMW R1300GSA", "KTM 890 Adventure", "Ducati Multistrada V4S"],
  },
  {
    id: "gps-mount-kit",
    name: "GPS Mount Kit",
    category: "Navigation",
    subcategory: "Cockpit setup",
    price: "$190",
    fit: `Compatible with selected cockpit layouts`,
    image: "/placeholder.jpg",
    compatibleBikes: ["BMW R1300GS", "BMW R1300GSA", "Yamaha Tenere 700", "Ducati Multistrada V4S"],
  },
  {
    id: "premium-tall-screen",
    name: "Premium Tall Screen",
    category: "Touring",
    subcategory: "Wind protection",
    price: "$360",
    fit: `Compatible with selected touring bikes`,
    image: "/placeholder.jpg",
    compatibleBikes: ["BMW R1300GS", "BMW R1300GSA", "Yamaha Tenere 700", "Ducati Multistrada V4S"],
  },
];

export default function AccessoriseItDemo() {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const garageFlowRef = useRef<HTMLElement | null>(null);
  const [selectedBike, setSelectedBike] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState("Bike");
  const [headerHeight, setHeaderHeight] = useState(88);
  const [garageFlowHeight, setGarageFlowHeight] = useState(128);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedAccessoriesByBike, setSelectedAccessoriesByBike] = useState<
    Record<string, Accessory[]>
  >({});
  const bikeOptions: BikeOption[] = [
  {
    name: "BMW R1300GS",
    make: "BMW",
    series: "R1300",
    model: "GS",
    year: "2025",
    type: "Adventure platform",
    price: "From $26,000",
    image: "/bmw-r1300gs.jpg",
    blurb:
      "The benchmark large-capacity adventure motorcycle with enormous accessory demand and global touring capability.",
    garageTitle: "Paul's R1300GS Garage",
    garageSubtitle: "BMW R1300GS · premium adventure profile",
    installed: ["Crash bars", "Panniers", "Aux lights"],
    suggested: ["Comfort seat", "Skid plate", "Luggage rack", "Tyres"],
    heroLabel: "Featured build",
    buildTotal: "$2,180",
    featuredAccessory: "Outback Pannier System",
  },
  {
    name: "BMW R1300GSA",
    make: "BMW",
    series: "R1300",
    model: "GSA",
    year: "2025",
    type: "Adventure platform",
    price: "From $31,000",
    image: "/bmw-r1300gsa.jpg",
    blurb:
      "The long-range expedition version of the GS designed for global travel and serious accessory setups.",
    garageTitle: "Paul's R1300GSA Garage",
    garageSubtitle: "BMW R1300GSA · expedition profile",
    installed: ["Upper crash bars", "Aluminium panniers", "Tank bag"],
    suggested: ["Driving lights", "Skid plate", "Top box", "Comfort seat"],
    heroLabel: "Expedition build",
    buildTotal: "$3,420",
    featuredAccessory: "Aluminium Adventure Luggage",
  },
  {
    name: "KTM 890 Adventure",
    make: "KTM",
    series: "890",
    model: "Adventure",
    year: "2024",
    type: "Adventure platform",
    price: "From $22,000",
    image: "/ktm-890-adventure.jpg",
    blurb:
      "A lightweight performance-oriented adventure bike popular with riders who prioritize aggressive off-road capability.",
    garageTitle: "KTM 890 Adventure Garage",
    garageSubtitle: "KTM 890 Adventure · off-road focused profile",
    installed: ["Bash plate", "Hand guards", "Soft luggage"],
    suggested: ["Crash bars", "Rally seat", "Aux fuel", "Adventure tyres"],
    heroLabel: "Performance build",
    buildTotal: "$1,960",
    featuredAccessory: "Rally Protection Pack",
  },
  {
    name: "Yamaha Tenere 700",
    make: "Yamaha",
    series: "Tenere",
    model: "700",
    year: "2024",
    type: "Adventure platform",
    price: "From $17,000",
    image: "/yamaha-tenere-700.jpg",
    blurb:
      "One of the world's most popular mid-weight adventure bikes with massive aftermarket support.",
    garageTitle: "Tenere 700 Garage",
    garageSubtitle: "Yamaha Tenere 700 · mid-weight ADV profile",
    installed: ["Crash protection", "Rear rack", "Dual-purpose tyres"],
    suggested: ["Soft panniers", "Tall screen", "LED lights", "Comfort seat"],
    heroLabel: "Adventure build",
    buildTotal: "$1,740",
    featuredAccessory: "Soft Luggage Touring Kit",
  },
  {
  name: "Ducati Multistrada V4S",
  make: "Ducati",
  series: "Multistrada",
  model: "V4S",
  year: "2025",
  type: "Adventure sport touring",
  price: "From $33,000",
  image: "/ducati-multistrada-v4s.jpg",
  blurb:
    "A high-performance adventure touring motorcycle combining Ducati superbike technology with long-distance comfort.",
  garageTitle: "Multistrada V4S Garage",
  garageSubtitle: "Ducati Multistrada V4S · sport adventure profile",
  installed: ["Touring screen", "Ducati panniers", "Heated grips"],
  suggested: ["Engine protection", "Aux lights", "Tank bag", "Comfort seat"],
  heroLabel: "Sport touring build",
  buildTotal: "$2,540",
  featuredAccessory: "Ducati Touring Pannier Set",
},
];

const activeBike =
  bikeOptions.find((bike) => bike.name === selectedBike) ?? bikeOptions[0];
  const installed = activeBike.installed;
  const recommended = activeBike.suggested;
 
const categories = [
  "Protection",
  "Luggage",
  "Comfort",
  "Lighting",
  "Navigation",
  "Performance",
  "Suspension",
  "Tyres",
  "Electronics",
  "Touring",
  "Off-road",
];
 const [selectedCategory, setSelectedCategory] = useState("Luggage"); 
const parsePrice = (price: string | number) =>
  Number(String(price).replace("$", "").replace(/,/g, ""));

const hasSelectedBike = Boolean(selectedBike);
const hasBikeFilters = Boolean(selectedMake || selectedSeries || selectedModel || selectedYear);

const filteredBikeOptions = bikeOptions.filter((bike) => {
  if (selectedMake && bike.make !== selectedMake) {
    return false;
  }

  if (selectedSeries && bike.series !== selectedSeries) {
    return false;
  }

  if (selectedModel && bike.model !== selectedModel) {
    return false;
  }

  if (selectedYear && bike.year !== selectedYear) {
    return false;
  }

  return true;
});

const makeOptions = Array.from(new Set(bikeOptions.map((bike) => bike.make)));
const seriesOptions = Array.from(
  new Set(
    bikeOptions
      .filter((bike) => (selectedMake ? bike.make === selectedMake : true))
      .map((bike) => bike.series)
  )
);
const modelOptions = Array.from(
  new Set(
    bikeOptions
      .filter((bike) => (selectedMake ? bike.make === selectedMake : true))
      .filter((bike) => (selectedSeries ? bike.series === selectedSeries : true))
      .map((bike) => bike.model)
  )
);
const yearOptions = Array.from(
  new Set(
    bikeOptions
      .filter((bike) => (selectedMake ? bike.make === selectedMake : true))
      .filter((bike) => (selectedSeries ? bike.series === selectedSeries : true))
      .filter((bike) => (selectedModel ? bike.model === selectedModel : true))
      .map((bike) => bike.year)
  )
);

const progressiveAccessories = Array.from(
  new Map(
    filteredBikeOptions
      .flatMap((bike) => getAccessoryCatalog(bike))
      .filter((item) => Boolean(item.image))
      .map((item) => [item.id, item] as const)
  ).values()
);

const compatibleAccessories = selectedBike
  ? progressiveAccessories.filter((item) => item.compatibleBikes.includes(selectedBike))
  : progressiveAccessories;

const filteredAccessories = (() => {
  const normalizedSearchTerm = normalizeValue(searchTerm);

  return compatibleAccessories.filter((item) => {
    const categoryMatches = item.category === selectedCategory;
    const subcategoryMatches = selectedSubcategory
      ? item.subcategory === selectedSubcategory
      : true;
    const searchMatches = normalizedSearchTerm
      ? matchesSearchTerm(item, normalizedSearchTerm)
      : true;

    return categoryMatches && subcategoryMatches && searchMatches;
  });
})();

/* eslint-disable react-hooks/preserve-manual-memoization */
const relevantThumbnails = useMemo(
  () => {
    if (!hasBikeFilters) {
      return [];
    }

    // Memoize the final thumbnail strip so relevance work only reruns when the context changes.
    return (
    getRelevantThumbnails({
      compatibleProducts: compatibleAccessories,
      hasSelectedBikeFilters: hasBikeFilters,
      selectedCategory,
      selectedSubcategory,
      selectedProductName,
      searchTerm,
    })
    );
  },
  [
    compatibleAccessories,
    hasBikeFilters,
    searchTerm,
    selectedCategory,
    selectedProductName,
    selectedSubcategory,
  ]
);
/* eslint-enable react-hooks/preserve-manual-memoization */

const selectedAccessories = selectedBike
  ? selectedAccessoriesByBike[selectedBike] ?? []
  : [];
const buildValue = selectedAccessories.reduce(
  (total, item) => total + parsePrice(item.price),
  0
);
const handleBikeSelection = (bikeName: string | null) => {
  setSelectedBike(bikeName);
  const bike = bikeOptions.find((item) => item.name === bikeName);
  setSelectedMake(bike?.make ?? "");
  setSelectedSeries(bike?.series ?? "");
  setSelectedModel(bike?.model ?? "");
  setSelectedYear(bike?.year ?? "");
  setSelectedProductName(null);
  setSelectedSubcategory(null);
};

const clearBikeSelectors = () => {
  setSelectedBike(null);
  setSelectedMake("");
  setSelectedSeries("");
  setSelectedModel("");
  setSelectedYear("");
  setSelectedProductName(null);
  setSelectedSubcategory(null);
};

const handleAddToBuild = (accessory: Accessory) => {
  setSelectedProductName(accessory.name);
  setSelectedSubcategory(accessory.subcategory ?? null);
  setSelectedAccessoriesByBike((current) => {
    if (!selectedBike) {
      return current;
    }

    const bikeAccessories = current[selectedBike] ?? [];

    if (bikeAccessories.some((item) => item.name === accessory.name)) {
      return current;
    }

    return {
      ...current,
      [selectedBike]: [...bikeAccessories, accessory],
    };
  });
};
const handleRemoveFromBuild = (accessoryName: string) => {
  setSelectedProductName(accessoryName);
  if (!selectedBike) {
    return;
  }

  setSelectedAccessoriesByBike((current) => ({
    ...current,
    [selectedBike]: (current[selectedBike] ?? []).filter(
      (item) => item.name !== accessoryName
    ),
  }));
};
  const communityBuilds = [
    {
      title: "Outback Touring Setup",
      tags: ["Long-range", "Luggage", "Protection"],
      desc: "Built for remote Australian touring with protection, storage, and comfort upgrades.",
      cost: "$3,850",
    },
    {
      title: "Weekend Gravel Explorer",
      tags: ["Tyres", "Lighting", "Lightweight"],
      desc: "A cleaner setup focused on confidence on gravel and short overnighters.",
      cost: "$1,940",
    },
    {
      title: "Alpine Adventure Build",
      tags: ["Screen", "Seat", "Luggage"],
      desc: "A cold-weather touring setup designed for comfort and all-day range.",
      cost: "$2,760",
    },
  ];

  const marketItems = [
  { title: activeBike.featuredAccessory, price: activeBike.name.includes("GSA") ? "$1,690" : "$1,290", cta: "Buy now" },
  { title: "Adventure Crash Bars", price: "$890", cta: "Find dealer" },
  { title: "Touring Comfort Seat", price: "$520", cta: "Save to build" },
];

  const selectedMods = [
  { label: installed[0] || "Panniers", active: true, impact: "+ touring" },
  { label: installed[1] || "Crash Bars", active: true, impact: "+ protection" },
  { label: installed[2] || "Aux Lights", active: true, impact: "+ visibility" },
  { label: recommended[0] || "Skid Plate", active: false, impact: "+ off-road" },
  { label: recommended[1] || "Comfort Seat", active: false, impact: "+ comfort" },
];

  const flowCards = [
    { step: "01", title: "Choose bike", text: "Select your exact model and year." },
    { step: "02", title: "Match parts", text: "Only see accessories that fit." },
    { step: "03", title: "Visualise build", text: "Preview the setup before buying." },
    { step: "04", title: "Buy or save", text: "Purchase, share, or copy a build." },
  ];
  const stepLabels = ["Bike", "Build", "Compare", "Save", "Buy"];
  const garageFlowContent: Record<string, { title: string; description: string }> = {
    Bike: {
      title: "Choose Bike",
      description: "Start with the rider's exact motorcycle so every fitment, recommendation, and build decision stays accurate.",
    },
    Build: {
      title: "Build",
      description: "Add exact-fit accessories and watch the build summary update live as the setup comes together.",
    },
    Compare: {
      title: "Compare Builds",
      description: "Review different configurations side by side to understand tradeoffs in protection, luggage, comfort, and value.",
    },
    Save: {
      title: "Saved Builds",
      description: "Capture the current setup so riders can revisit, refine, and share it later without losing momentum.",
    },
    Buy: {
      title: "Buy Accessories",
      description: "Move from planning to purchase with a clean shortlist of selected accessories and clear pricing context.",
    },
  };
  const activeFlowCard = garageFlowContent[currentStep];
  console.log("GARAGE PAGE UPDATED");

  useEffect(() => {
    const updateMeasurements = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.getBoundingClientRect().height);
      }

      if (garageFlowRef.current) {
        setGarageFlowHeight(garageFlowRef.current.getBoundingClientRect().height);
      }
    };

    updateMeasurements();
    window.addEventListener("resize", updateMeasurements);

    return () => window.removeEventListener("resize", updateMeasurements);
  }, [currentStep, selectedBike]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2ff_45%,_#e2e8f0_100%)] text-slate-900">
      <div style={{ background: "yellow", padding: 10 }}>
        GARAGE VERSION TEST - 11 APR
      </div>
      <div
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
      >
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div
            className="flex flex-wrap items-start justify-between gap-4"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Accessorise It
              </div>
              <div className="space-y-0.5">
                <div className="mt-1 text-xl font-bold tracking-tight text-slate-950">{activeBike.garageTitle}</div>
                <div className="text-sm text-slate-500">Investor demo · motorcycle customisation platform</div>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="inline-flex rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-colors duration-200 hover:bg-slate-50"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#111827",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                position: "relative",
                zIndex: 5,
              }}
            >
              Home
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {stepLabels.map((item) => (
              <button
                key={item}
                onClick={() => setCurrentStep(item)}
                className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                  currentStep === item
                    ? "bg-slate-100 font-semibold text-slate-950 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]"
                    : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        data-debug="garage-flow-card"
        className="fixed left-0 right-0"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: headerHeight,
          zIndex: 60,
          outline: "4px solid red",
          background: "#fffdf5",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 pt-3">
        <section
          ref={garageFlowRef}
          className="bg-white px-6 py-4"
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
          }}
        >
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Garage Flow
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {activeFlowCard.title}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {activeFlowCard.description}
            </p>
        </section>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mx-auto max-w-7xl px-6 pt-3"
        style={{ height: garageFlowHeight + 36 }}
      >
        <section
          className="bg-white opacity-0"
          style={{ borderRadius: 20 }}
        >
        </section>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 pt-3 pb-8">
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-8 md:p-10">
                <div className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
                  Investor-ready concept demo
                </div>
                <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                  The platform for building and buying your perfect bike setup.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  Accessorise It helps riders choose their bike, discover exact-fit accessories, preview the final build, learn from other riders, and buy with confidence.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5">
                    Watch product tour
                  </button>
                  <button className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    View revenue model
                  </button>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Bike-first discovery', value: 'Exact-fit' },
                    { label: 'Visual planning', value: 'Before buying' },
                    { label: 'Monetisation', value: 'Affiliate + vendor' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
                      <div className="mt-2 text-lg font-bold text-slate-900">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[420px] overflow-hidden bg-[linear-gradient(135deg,#0f172a,#1e293b,#3730a3)] p-6 text-white">
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="relative rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-indigo-200">Featured build</div>
                      <div className="mt-2 text-2xl font-bold">{activeBike.garageTitle.replace(" Garage", "")}</div>
                    </div>
                    <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Live demo flow
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {flowCards.map((card) => (
                      <div key={card.step} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <div className="text-xs font-semibold tracking-[0.24em] text-indigo-200">STEP {card.step}</div>
                        <div className="mt-2 text-lg font-bold">{card.title}</div>
                        <div className="mt-1 text-sm text-slate-200">{card.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Why now</div>
              <h2 className="mt-3 text-2xl font-bold">Riders spend heavily, but discovery is still fragmented.</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                <p>Today riders jump between forums, vendor sites, YouTube, Facebook groups, and dealer advice just to figure out what fits.</p>
                <p>Accessorise It brings bike identity, fitment certainty, visual configuration, community proof, and purchase into one product.</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/60 bg-slate-950 p-7 text-white shadow-[0_20px_60px_rgba(15,23,42,0.20)]">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Core wedge</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  'BMW GS riders',
                  'Adventure touring',
                  'High accessory spend',
                  'Global enthusiast audience',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-100">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="flex gap-6 items-stretch"
          style={{ display: "flex", gap: 24, alignItems: "stretch" }}
        >

  <div
    className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
    style={{ flex: 1.2, height: "100%" }}
  >

    <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
      Screen 1 · choose your bike
    </div>

    <h3 className="mt-4 text-2xl font-bold">Bike selection</h3>
    <p className="mt-2 text-slate-500">
      Start with the rider’s exact machine to unlock fitment confidence.
    </p>

    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <label className="text-sm font-semibold text-slate-600">
          Make
        </label>
        <select
          value={selectedMake}
          onChange={(e) => {
            setSelectedMake(e.target.value);
            setSelectedSeries("");
            setSelectedModel("");
            setSelectedYear("");
            setSelectedBike(null);
            setSelectedProductName(null);
            setSelectedSubcategory(null);
          }}
          className="mt-2 w-full rounded-xl border border-slate-300 p-3"
        >
          <option value="">Select make</option>
          {makeOptions.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-600">
          Series
        </label>
        <select
          value={selectedSeries}
          onChange={(e) => {
            setSelectedSeries(e.target.value);
            setSelectedModel("");
            setSelectedYear("");
            setSelectedBike(null);
            setSelectedProductName(null);
            setSelectedSubcategory(null);
          }}
          className="mt-2 w-full rounded-xl border border-slate-300 p-3"
        >
          <option value="">Select series</option>
          {seriesOptions.map((series) => (
            <option key={series} value={series}>
              {series}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-600">
          Model
        </label>
        <select
          value={selectedModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            setSelectedYear("");
            setSelectedBike(null);
            setSelectedProductName(null);
            setSelectedSubcategory(null);
          }}
          className="mt-2 w-full rounded-xl border border-slate-300 p-3"
        >
          <option value="">Select model</option>
          {modelOptions.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-600">
          Year
        </label>
        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setSelectedBike(null);
            setSelectedProductName(null);
            setSelectedSubcategory(null);
          }}
          className="mt-2 w-full rounded-xl border border-slate-300 p-3"
        >
          <option value="">Select year</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="mt-5">
      <label className="text-sm font-semibold text-slate-600">
        Final bike match
      </label>

      <select
        value={selectedBike ?? ""}
        onChange={(e) => handleBikeSelection(e.target.value || null)}
        className="mt-2 w-full rounded-xl border border-slate-300 p-3"
      >
        <option value="">Select matched bike</option>
        {filteredBikeOptions.map((bike) => (
          <option key={bike.name} value={bike.name}>
            {bike.name}
          </option>
        ))}
      </select>
    </div>

    {hasSelectedBike ? (
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div>
          <div className="text-lg font-bold text-slate-950">
            {activeBike.name} {activeBike.year}
          </div>
          <div className="mt-1 text-sm font-medium text-emerald-700">
            Compatible accessories unlocked
          </div>
        </div>
        <button
          type="button"
          onClick={clearBikeSelectors}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Change bike
        </button>
      </div>
    ) : null}

    <div className="mt-5">
      <div className="text-sm font-semibold text-slate-600">
        Matching bikes
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredBikeOptions.map((bike) => {
          const isSelectedBike = selectedBike === bike.name;

          return (
            <button
              key={bike.name}
              type="button"
              onClick={() => handleBikeSelection(bike.name)}
              className={`overflow-hidden rounded-[24px] border bg-white text-left shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.10)] ${
                isSelectedBike
                  ? "border-slate-900 bg-slate-50 shadow-[0_0_0_2px_rgba(15,23,42,0.12)]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {isSelectedBike ? (
                <div className="relative h-32 overflow-hidden bg-slate-100">
                  <img
                    src={bike.image}
                    alt={bike.name}
                    className="h-full w-full object-cover"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                    {bike.year}
                  </div>
                </div>
              ) : null}
              <div className="space-y-2 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-bold text-slate-950">{bike.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{bike.type}</div>
                  </div>
                  {isSelectedBike ? (
                    <div className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                      Selected
                    </div>
                  ) : (
                    <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {bike.year}
                    </div>
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-700">{bike.price}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>

    <div className="mt-6 flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4">

      <div className="text-sm font-semibold text-slate-600">
        Selected bike
      </div>

      <div className="mt-3 flex h-full flex-col gap-4">
        {hasSelectedBike ? (
          <>
            <img
              src={activeBike.image}
              alt={activeBike.name}
              className="h-full min-h-[360px] w-full rounded-xl object-cover"
              style={{ height: "100%", objectFit: "cover" }}
            />

            <div>
              <div className="text-xl font-bold">
                {activeBike.name} {activeBike.year}
              </div>
              <div className="mt-1 text-sm text-slate-500">{activeBike.type}</div>
              <div className="mt-2 text-sm font-semibold">{activeBike.price}</div>
              <p className="mt-2 text-sm text-slate-500">{activeBike.blurb}</p>
            </div>
          </>
        ) : (
          <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
            <div>
              <div className="text-xl font-bold text-slate-950">Choose a bike to begin</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pick a matching bike card or use the selector above to unlock fitment, previews, and garage tools.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>

  </div>


  <div
    className="flex flex-col rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
    style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
  >

    <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
      Screen 2 · my garage
    </div>

    {hasSelectedBike ? (
      <>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          <div>
            <h3 className="text-2xl font-bold">{activeBike.garageTitle}</h3>
            <p className="mt-1 text-slate-500">{activeBike.garageSubtitle}</p>
          </div>

          <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Share garage
          </button>

        </div>

        <div
          className="mt-6 flex h-full flex-col justify-between gap-4"
          style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
        >

          <div className="rounded-3xl bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-700">
              Installed now
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {installed.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">

            <div className="text-sm font-semibold text-slate-700">
              Suggested next
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {recommended.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>

          </div>

        </div>
      </>
    ) : (
      <div className="mt-6 flex flex-1 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-950">Garage tools waiting for your bike</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Select a make, series, model and year to unlock installed parts, suggestions and sharing tools.
          </p>
        </div>
      </div>
    )}

  </div>

</section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Screen 3 · explore accessories
            </div>
            <h3 className="mt-4 text-2xl font-bold">Filter by purpose</h3>
            <p className="mt-2 text-slate-500">Protection, luggage, comfort, lighting, touring and off-road, all narrowed to exact fit.</p>
            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-600" htmlFor="accessory-search">
                Search products
              </label>
              <input
                id="accessory-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by product, category, or fit"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
  key={category}
  onClick={() => {
    setSelectedCategory(category);
    setSelectedProductName(null);
    setSelectedSubcategory(null);
  }}
  className={`rounded-full px-4 py-2 text-sm font-semibold ${
    selectedCategory === category
      ? "bg-slate-900 text-white"
      : "border border-slate-200 bg-white text-slate-700"
  }`}
>
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div className="rounded-[20px] border border-[#e5e7eb] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Relevant thumbnails</div>
                    <p className="mt-1 text-sm text-slate-500">
                      Prioritised for your current bike, category, product, and search context.
                    </p>
                  </div>
                  {hasBikeFilters ? (
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {relevantThumbnails.length} shown
                    </div>
                  ) : null}
                </div>

                {hasBikeFilters ? (
                  <div className="mt-4 overflow-x-auto pb-1">
                    {relevantThumbnails.length > 0 ? (
                      <div className="flex min-w-full gap-3">
                        {relevantThumbnails.map((item) => {
                          const isActiveThumbnail = item.name === selectedProductName;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSelectedProductName(item.name);
                                setSelectedSubcategory(item.subcategory ?? null);
                              }}
                              className={`flex w-[112px] min-w-[112px] flex-col overflow-hidden rounded-2xl border bg-white text-left transition ${
                                isActiveThumbnail
                                  ? "border-slate-900 shadow-[0_0_0_2px_rgba(15,23,42,0.14)]"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="h-[84px] w-[112px] overflow-hidden bg-slate-100">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                              <div className="flex h-[72px] flex-col justify-between px-3 py-2">
                                <div className="line-clamp-2 text-xs font-semibold text-slate-800">
                                  {item.name}
                                </div>
                                <div
                                  className={`text-[11px] font-medium ${
                                    isActiveThumbnail ? "text-slate-900" : "text-slate-500"
                                  }`}
                                >
                                  {item.category}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-[156px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm font-medium text-slate-500">
                        No accessory previews match the current bike filters yet
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 flex min-h-[156px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm font-medium text-slate-500">
                    Select a make, series, model or year to see relevant accessory previews
                  </div>
                )}
              </div>

              {hasSelectedBike ? (
                <div className="grid gap-4 md:grid-cols-2">
                 {filteredAccessories.length === 0 && (
      <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <div className="text-lg font-semibold text-slate-800">
          No accessories in this category yet
        </div>
        <div className="mt-2 text-sm text-slate-500">
          Try another category or search term for {selectedCategory}.
        </div>
      </div>
    )}
               {filteredAccessories.map((item) => {
                  const isSelected = selectedAccessories.some(
                    (selectedItem) => selectedItem.name === item.name
                  );
                  const isActiveCard = selectedProductName === item.name;

                  return (
                  <div
                    key={item.name}
                    onClick={() => {
                      setSelectedProductName(item.name);
                      setSelectedSubcategory(item.subcategory ?? null);
                    }}
                    className={`overflow-hidden rounded-[20px] border bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.10)] ${
                      isActiveCard
                        ? "border-slate-900 ring-1 ring-slate-200"
                        : "border-[#e5e7eb]"
                    } ${item.featured ? "ring-1 ring-indigo-100" : ""}`}
                  >
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                        <div className="inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                          {item.category}
                        </div>
                        <div className="rounded-full bg-emerald-50/95 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                          Fit confirmed
                        </div>
                      </div>
                    </div>

                    <div className="flex h-full flex-col p-5">
                      <div className="space-y-3">
                        <h4 className="text-xl font-bold leading-tight text-slate-950">{item.name}</h4>
                        <p className="text-sm leading-6 text-slate-500">{item.fit}</p>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                            From
                          </div>
                          <div className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                            {item.price}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            if (isSelected) {
                              handleRemoveFromBuild(item.name);
                              return;
                            }

                            handleAddToBuild(item);
                          }}
                          className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                            isSelected
                              ? "border border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200"
                              : "bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
                          }`}
                        >
                          {isSelected ? "Remove from build" : "Add to build"}
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
                </div>
              ) : (
                <div className="rounded-[20px] border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <h4 className="text-xl font-bold text-slate-950">Choose your bike to start building</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Select a make, series, model and year to unlock compatible accessories, previews and build tools.
                  </p>
                </div>
              )}
            </div>

            <aside
              className="h-fit rounded-[20px] border border-[#e5e7eb] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.08)] xl:sticky xl:self-start"
              style={{ top: headerHeight + garageFlowHeight + 24 }}
            >
              {hasSelectedBike ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-bold text-slate-950">Build Summary</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedAccessories.length} item{selectedAccessories.length === 1 ? "" : "s"} selected
                      </p>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Live
                    </div>
                  </div>

                  {selectedAccessories.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                      <div className="text-sm font-medium text-slate-700">No accessories added yet.</div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Add products from the list to see your build take shape in real time.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      {selectedAccessories.map((item) => (
                        <div
                          key={item.name}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                              <div className="mt-1 text-sm text-slate-500">{item.category}</div>
                            </div>
                            <div className="text-sm font-semibold text-slate-900">{item.price}</div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromBuild(item.name)}
                            className="mt-4 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-slate-900"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Build Total
                    </div>
                    <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                      ${buildValue.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep("Save")}
                    className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-colors duration-200 hover:bg-slate-800"
                  >
                    Continue to Save
                  </button>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                  <h4 className="text-xl font-bold text-slate-950">Build Summary</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Select a make, series, model and year to unlock compatible accessories, previews and build tools.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Screen 4 · visual customiser
            </div>
            {hasSelectedBike ? (
              <>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">Preview your build</h3>
                    <p className="mt-2 text-slate-500">This investor version simulates layered visualisation and exact-fit confidence for {activeBike.name}.</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Build total ${buildValue.toLocaleString()}</div>
                </div>

                <div className="mt-6 rounded-[28px] bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#312e81)] p-5 shadow-inner">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      {selectedMods.map((item) => (
                        <div key={item.label} className={`rounded-2xl border px-4 py-4 ${item.active ? 'border-white/15 bg-white/12 text-white' : 'border-white/10 bg-black/10 text-slate-300'}`}>
                          <div className="text-sm font-semibold">{item.label}</div>
                          <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-300">{item.impact}</div>
                          <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.active ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-200'}`}>
                            {item.active ? 'Applied' : 'Optional'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <h3 className="text-2xl font-bold text-slate-950">Build preview locked</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Choose a bike first to unlock the visual customiser and build simulation.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Investor takeaway</div>
            <h3 className="mt-3 text-2xl font-bold">Why the customiser matters</h3>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>It shortens the path from inspiration to purchase.</p>
              <p>It increases buyer confidence because riders can see how the bike evolves before committing money.</p>
              <p>It creates a sticky profile users return to as they keep upgrading over time.</p>
            </div>
            <button className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Open monetisation notes</button>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Screen 5 · community builds
            </div>
            {hasSelectedBike ? (
              <>
                <h3 className="mt-4 text-2xl font-bold">Builds riders can copy</h3>
                <div className="mt-5 space-y-4">
                  {communityBuilds.map((build) => (
                    <div key={build.title} className="rounded-[28px] border border-slate-200 bg-white p-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="text-lg font-bold">{build.title}</div>
                          <div className="mt-1 text-sm text-slate-500">Estimated package value {build.cost}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {build.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">{build.desc}</p>
                      <div className="mt-4 flex gap-3">
                        <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Copy build</button>
                        <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Save inspiration</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <h3 className="text-2xl font-bold text-slate-950">Community builds waiting</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Pick a bike to reveal community setups, copyable builds and inspiration.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Screen 6 · marketplace
            </div>
            {hasSelectedBike ? (
              <>
                <h3 className="mt-4 text-2xl font-bold">Revenue layer</h3>
                <p className="mt-2 text-slate-500">Affiliate income, vendor placements, dealer referrals, featured products, and premium build tools.</p>

                <div className="mt-5 space-y-4">
                  {marketItems.map((item) => (
                    <div key={item.title} className="flex items-center justify-between rounded-[28px] border border-slate-200 bg-white p-4">
                      <div>
                        <div className="font-bold">{item.title}</div>
                        <div className="mt-1 text-sm text-slate-500">Fits {activeBike.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{item.price}</div>
                        <button className="mt-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{item.cta}</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[28px] bg-slate-950 p-5 text-white">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Business model summary</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {['Affiliate commission', 'Vendor subscription', 'Featured listings', 'Premium rider plans'].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <h3 className="text-2xl font-bold text-slate-950">Marketplace preview locked</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Choose a bike to reveal compatible products, pricing and buying actions.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
