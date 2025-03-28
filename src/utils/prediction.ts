import { HouseData } from "../data/modelData";

const API_URL = "http://localhost:5000";

// This function calls our Python API to get predictions
export async function predictPriceFromAPI(data: HouseData): Promise<number | null> {
  try {
    const response = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(errorData.error || "Failed to get prediction from API");
    }
    
    const result = await response.json();
    return result.prediction;
  } catch (error) {
    console.error("Error fetching prediction:", error);
    return null;
  }
}

// Existing fallback function - will be used if API call fails
// This is a simplified model that simulates what a real ML model would do
export function predictPrice(data: HouseData): number {
  // Base price
  let predictedPrice = 150000;
  
  // Square footage has big impact (average $100 per sq ft)
  predictedPrice += data.squareFootage * 100;
  
  // Bedrooms add value
  predictedPrice += data.bedrooms * 15000;
  
  // Bathrooms add value
  predictedPrice += data.bathrooms * 20000;
  
  // Newer houses are worth more
  predictedPrice += (data.yearBuilt - 1950) * 500;
  
  // Neighborhood factors
  const neighborhoodFactors: {[key: string]: number} = {
    "Downtown": 1.2,
    "Suburban Heights": 1.1,
    "Riverside": 1.15,
    "West End": 0.95,
    "North Hills": 1.05,
    "Oak Park": 1.0,
    "Maplewood": 0.9,
    "Cedar Ridge": 1.1,
    "Brookside": 1.05,
    "Highland Park": 1.2
  };
  
  predictedPrice *= neighborhoodFactors[data.neighborhood] || 1.0;
  
  // Lot size adds value
  predictedPrice += data.lotSize * 100000;
  
  // Garage adds value
  predictedPrice += data.garage * 10000;
  
  // Basement adds value
  if (data.basement) {
    predictedPrice += 20000;
  }
  
  // Central air adds value
  if (data.centralAir) {
    predictedPrice += 15000;
  }
  
  // Kitchen quality (1-5) adds value
  predictedPrice += (data.kitchenQuality - 1) * 10000;
  
  // Add some randomness to make it more realistic
  const randomFactor = 0.95 + Math.random() * 0.1; // Random between 0.95 and 1.05
  predictedPrice *= randomFactor;
  
  return Math.round(predictedPrice);
}

// Format the price with commas and dollar sign
export function formatPrice(price: number): string {
  return "$" + price.toLocaleString();
}
