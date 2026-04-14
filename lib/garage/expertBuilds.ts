import type {
  ExpertBuildOption,
  GarageCategory,
  Product,
  SupabaseBike,
} from "../../types/garage";

type ExpertBuildSeed = {
  id: string;
  name: string;
  bike: {
    make: string;
    model: string;
    year: number;
  };
  theme: string;
  builderLabel: string;
  summary: string;
  bestFor: string[];
  styleTags: string[];
  categories: string[];
  compatibility: {
    make: string;
    model: string;
    yearRange: [number, number];
  };
  metadata: {
    buildType: string;
    completenessScore: number;
    style: string;
    visibilityLevel: string;
  };
  heroImageTag?: string;
  image?: string;
  categoryGroups?: Array<{
    id?: string;
    name: string;
    items: Array<{
      name: string;
      brand: string;
      description: string;
      price?: number;
      categoryId?: string;
    }>;
  }>;
};

type GetExpertBuildOptionsParams = {
  activeBikeId: string;
  categories: GarageCategory[];
  currentBike: SupabaseBike;
  products: Product[];
  isProductCompatible: (product: Product, currentBikeId: string) => boolean;
};

function normalizeSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createExpertMockProduct(input: {
  id: number;
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  image: string;
  bikeId: string;
  price?: number;
}) {
  return {
    id: input.id,
    name: input.name,
    brand: input.brand,
    price: input.price ?? 0,
    categoryId: input.categoryId,
    description: input.description,
    image: input.image,
    featuredOrder: 10_000 + Math.abs(input.id),
    compatibility: {
      bikeIds: [input.bikeId],
    },
  } satisfies Product;
}

export function getExpertBuildOptions({
  activeBikeId,
  categories,
  currentBike,
  products,
  isProductCompatible,
}: GetExpertBuildOptionsParams): ExpertBuildOption[] {
  const compatibleProducts = products.filter((product) =>
    isProductCompatible(product, activeBikeId)
  );
  const usedIds = new Set<number>();
  const pickProduct = (
    categoryId: string,
    fallbackMatcher?: (product: Product) => boolean
  ) => {
    const nextProduct = compatibleProducts.find((product) => {
      if (usedIds.has(product.id)) return false;
      if (product.categoryId === categoryId) return true;
      return fallbackMatcher ? fallbackMatcher(product) : false;
    });

    if (nextProduct) {
      usedIds.add(nextProduct.id);
    }

    return nextProduct ?? null;
  };

  const buildLabel = `${currentBike.make} ${currentBike.model} ${
    currentBike.variant || "Base"
  }`;
  const bikeSlug = `${normalizeSlugPart(currentBike.make)}-${normalizeSlugPart(
    currentBike.model
  )}`;

  const options: ExpertBuildSeed[] = [
    {
      id: "touring",
      name: "Touring Expert Build",
      bike: {
        make: currentBike.make,
        model: currentBike.model,
        year: currentBike.year,
      },
      theme: "Long-distance comfort",
      builderLabel: "Expert Garage",
      summary: `Balanced for multi-day riding on the ${buildLabel}.`,
      bestFor: ["Long-distance touring riders"],
      styleTags: ["Touring", "Comfort", "Distance"],
      categories: ["luggage", "protection", "lighting", "navigation"],
      compatibility: {
        make: currentBike.make,
        model: currentBike.model,
        yearRange: [currentBike.year, currentBike.year],
      },
      metadata: {
        buildType: "Expert Build",
        completenessScore: 84,
        style: "Touring",
        visibilityLevel: "Medium",
      },
    },
    {
      id: "commuter",
      name: "Daily Commuter Build",
      bike: {
        make: currentBike.make,
        model: currentBike.model,
        year: currentBike.year,
      },
      theme: "Practical daily setup",
      builderLabel: "Urban Builder Notes",
      summary: `Focused on utility and visibility for the ${buildLabel}.`,
      bestFor: ["Daily commuting riders"],
      styleTags: ["Daily", "Practical", "Utility"],
      categories: ["lighting", "security", "luggage", "electronics"],
      compatibility: {
        make: currentBike.make,
        model: currentBike.model,
        yearRange: [currentBike.year, currentBike.year],
      },
      metadata: {
        buildType: "Expert Build",
        completenessScore: 79,
        style: "Daily Utility",
        visibilityLevel: "Medium",
      },
    },
    {
      id: "adventure",
      name: "Adventure Weekender Build",
      bike: {
        make: currentBike.make,
        model: currentBike.model,
        year: currentBike.year,
      },
      theme: "Weekend exploration",
      builderLabel: "Adventure Lab",
      summary: `A durable mixed-surface setup for the ${buildLabel}.`,
      bestFor: ["Weekend adventure riders"],
      styleTags: ["Adventure", "Protection", "Weekend"],
      categories: ["protection", "luggage", "ergonomics", "navigation"],
      compatibility: {
        make: currentBike.make,
        model: currentBike.model,
        yearRange: [currentBike.year, currentBike.year],
      },
      metadata: {
        buildType: "Expert Build",
        completenessScore: 81,
        style: "Adventure",
        visibilityLevel: "Medium",
      },
    },
  ];

  if (
    currentBike.make === "BMW" &&
    currentBike.model.toLowerCase().includes("r1300gsa") &&
    currentBike.year >= 2024 &&
    currentBike.year <= 2026
  ) {
    options.unshift({
      id: "bmw-r1300gsa-tech-touring-01",
      name: "R1300GSA Tech Touring Build",
      bike: {
        make: "BMW",
        model: "R1300GSA",
        year: 2024,
      },
      theme: "Technology-led touring with strong safety coverage",
      builderLabel: "BMW Tech Touring Studio",
      summary:
        "A premium long-distance BMW R1300GSA setup that prioritizes visibility, integrated cockpit tech, and clean electrical control.",
      image: "/bikes/bmw-r1300gsa.jpg",
      heroImageTag: "r1300gsa-tech-build-hero",
      bestFor: [
        "Long-distance touring riders",
        "Safety-focused riders",
        "Tech-integrated cockpit users",
        "Premium build enthusiasts",
      ],
      styleTags: [
        "Adventure Touring",
        "High Visibility",
        "Tech Loaded",
        "Safety Focused",
        "Long Distance",
        "Premium Build",
      ],
      compatibility: {
        make: "BMW",
        model: "R1300GSA",
        yearRange: [2024, 2026],
      },
      metadata: {
        buildType: "Expert Build",
        completenessScore: 92,
        style: "Tech Touring",
        visibilityLevel: "High",
      },
      categories: [
        "lighting",
        "electronics",
        "navigation",
        "ergonomics",
        "performance",
      ],
      categoryGroups: [
        {
          id: "safety-visibility",
          name: "Safety & Visibility",
          items: [
            {
              name: "Weiser Rear Dongles",
              brand: "Weiser",
              description:
                "High-visibility rear signal enhancement for the R1300GSA touring platform.",
              price: 289,
              categoryId: "safety-visibility",
            },
            {
              name: "Denali B6 Rear Light",
              brand: "Denali",
              description:
                "Compact auxiliary rear brake light for stronger conspicuity in traffic.",
              price: 219,
              categoryId: "safety-visibility",
            },
            {
              name: "Denali Split SoundBomb Horn",
              brand: "Denali",
              description:
                "High-output split horn setup for stronger road presence and safety signaling.",
              price: 169,
              categoryId: "safety-visibility",
            },
          ],
        },
        {
          id: "rider-tech-recording",
          name: "Rider Tech & Recording",
          items: [
            {
              name: "Innovv K7 Dashcam",
              brand: "Innovv",
              description:
                "Dual-channel recording system for premium ride capture and incident coverage.",
              price: 699,
              categoryId: "rider-tech-recording",
            },
            {
              name: "Chigee TR100 Radar",
              brand: "Chigee",
              description:
                "Rear radar awareness module for tech-focused touring and lane monitoring.",
              price: 559,
              categoryId: "rider-tech-recording",
            },
          ],
        },
        {
          id: "connectivity-navigation",
          name: "Connectivity & Navigation",
          items: [
            {
              name: "Chigee Play for BMW",
              brand: "Chigee",
              description:
                "Integrated BMW-compatible navigation and display interface for connected touring.",
              price: 899,
              categoryId: "connectivity-navigation",
            },
            {
              name: "Peak Design Wireless Charger Mount",
              brand: "Peak Design",
              description:
                "Secure cockpit charging mount for phones and navigation devices.",
              price: 199,
              categoryId: "connectivity-navigation",
            },
          ],
        },
        {
          id: "electrical",
          name: "Electrical",
          items: [
            {
              name: "Hex EZCAN",
              brand: "HEX",
              description:
                "Accessory controller for neat integration of lights, horn, and touring electronics.",
              price: 479,
              categoryId: "electrical",
            },
          ],
        },
        {
          id: "ergonomics",
          name: "Ergonomics",
          items: [
            {
              name: "Gilles Footpegs",
              brand: "Gilles",
              description:
                "Premium footpeg upgrade to improve long-distance support and riding feel.",
              price: 329,
              categoryId: "ergonomics",
            },
          ],
        },
        {
          id: "power-support",
          name: "Power",
          items: [
            {
              name: "GYS Flash Charger",
              brand: "GYS",
              description:
                "Battery support and charger solution for a tech-loaded touring bike between rides.",
              price: 249,
              categoryId: "power-support",
            },
          ],
        },
      ],
    });
  }

  return options
    .map((option) => {
      const categoryGroups =
        option.categoryGroups?.map((group, groupIndex) => {
          const resolvedCategoryId =
            group.id || normalizeSlugPart(group.name) || "electronics";

          const items = group.items.map((item, itemIndex) =>
            createExpertMockProduct({
              id: 90_000 + groupIndex * 100 + itemIndex + 1,
              name: item.name,
              brand: item.brand,
              categoryId: item.categoryId || resolvedCategoryId,
              description: item.description,
              image:
                option.image || currentBike.image || `/bikes/${bikeSlug}.jpg`,
              bikeId: activeBikeId,
              price: item.price,
            })
          );

          return {
            id: resolvedCategoryId,
            name: group.name,
            items,
          };
        }) ||
        option.categories
          .map((categoryId) => {
            const items = [
              pickProduct(categoryId, (product) => {
                const text = `${product.name} ${product.brand} ${product.description}`.toLowerCase();
                return text.includes(categoryId.replace("-", " "));
              }),
            ].filter((product): product is Product => product !== null);

            return {
              id: categoryId,
              name:
                categories.find((category) => category.id === categoryId)?.label ||
                "Other",
              items,
            };
          })
          .filter((group) => group.items.length > 0);

      const items = categoryGroups.flatMap((group) => group.items);

      return {
        ...option,
        image:
          option.image ||
          items[0]?.image ||
          currentBike.image ||
          "/bike-placeholder.jpg",
        categoryGroups,
        items,
      };
    })
    .filter((option) => option.items.length > 0);
}

