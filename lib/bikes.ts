export type Bike = {
  id: string;
  make: string;
  series: string;
  model: string;
  year: number;
  displayName: string;
};

export const bikes: Bike[] = [
  {
    id: "bmw-r-series-r1300gsa-2025",
    make: "BMW",
    series: "R Series",
    model: "R1300GSA",
    year: 2025,
    displayName: "BMW R Series R1300GSA 2025",
  },
  {
    id: "bmw-r-series-r1300gs-2025",
    make: "BMW",
    series: "R Series",
    model: "R1300GS",
    year: 2025,
    displayName: "BMW R Series R1300GS 2025",
  },
  {
    id: "yamaha-tenere-tenere-700-2024",
    make: "Yamaha",
    series: "Tenere",
    model: "Tenere 700",
    year: 2024,
    displayName: "Yamaha Tenere Tenere 700 2024",
  },
  {
    id: "yamaha-tenere-tenere-700-2025",
    make: "Yamaha",
    series: "Tenere",
    model: "Tenere 700",
    year: 2025,
    displayName: "Yamaha Tenere Tenere 700 2025",
  },
  {
    id: "honda-crf-crf300l-2024",
    make: "Honda",
    series: "CRF",
    model: "CRF300L",
    year: 2024,
    displayName: "Honda CRF CRF300L 2024",
  },
  {
    id: "suzuki-dr-dr650-2024",
    make: "Suzuki",
    series: "DR",
    model: "DR650",
    year: 2024,
    displayName: "Suzuki DR DR650 2024",
  },
];

export function getMakes(): string[] {
  return [...new Set(bikes.map((bike) => bike.make))].sort();
}

export function getSeriesByMake(make: string): string[] {
  return [
    ...new Set(
      bikes
        .filter((bike) => bike.make === make)
        .map((bike) => bike.series)
    ),
  ].sort();
}

export function getModelsByMakeAndSeries(make: string, series: string): string[] {
  return [
    ...new Set(
      bikes
        .filter((bike) => bike.make === make && bike.series === series)
        .map((bike) => bike.model)
    ),
  ].sort();
}

export function getYearsByMakeSeriesAndModel(
  make: string,
  series: string,
  model: string
): number[] {
  return [
    ...new Set(
      bikes
        .filter(
          (bike) =>
            bike.make === make &&
            bike.series === series &&
            bike.model === model
        )
        .map((bike) => bike.year)
    ),
  ].sort((a, b) => b - a);
}

export function getBikeByDetails(
  make: string,
  series: string,
  model: string,
  year: number
): Bike | undefined {
  return bikes.find(
    (bike) =>
      bike.make === make &&
      bike.series === series &&
      bike.model === model &&
      bike.year === year
  );
}