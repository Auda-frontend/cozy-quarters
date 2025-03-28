
export interface FeatureImportance {
  feature: string;
  importance: number;
  displayName: string;
}

export const featureImportances: FeatureImportance[] = [
  { feature: "squareFootage", importance: 0.35, displayName: "Square Footage" },
  { feature: "bedrooms", importance: 0.15, displayName: "Bedrooms" },
  { feature: "bathrooms", importance: 0.12, displayName: "Bathrooms" },
  { feature: "neighborhood", importance: 0.10, displayName: "Neighborhood" },
  { feature: "yearBuilt", importance: 0.08, displayName: "Year Built" },
  { feature: "garage", importance: 0.07, displayName: "Garage" },
  { feature: "lotSize", importance: 0.05, displayName: "Lot Size" },
  { feature: "basement", importance: 0.04, displayName: "Basement" },
  { feature: "centralAir", importance: 0.03, displayName: "Central Air" },
  { feature: "kitchenQuality", importance: 0.01, displayName: "Kitchen Quality" },
];

export const neighborhoods = [
  "Downtown",
  "Suburban Heights",
  "Riverside",
  "West End",
  "North Hills",
  "Oak Park",
  "Maplewood",
  "Cedar Ridge",
  "Brookside",
  "Highland Park",
];

export interface HouseData {
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  neighborhood: string;
  lotSize: number;
  garage: number;
  basement: boolean;
  centralAir: boolean;
  kitchenQuality: number;
}

// Default values for the house form
export const defaultHouseData: HouseData = {
  squareFootage: 2000,
  bedrooms: 3,
  bathrooms: 2,
  yearBuilt: 2000,
  neighborhood: "Suburban Heights",
  lotSize: 0.25,
  garage: 2,
  basement: true,
  centralAir: true,
  kitchenQuality: 4,
};
