import { HouseData } from "../data/modelData";

const API_URL = "http://localhost:5000";

// Check if backend model is loaded and ready
export async function checkModelStatus(): Promise<{ trained: boolean; modelPath: string | null }> {
  try {
    const response = await fetch(`${API_URL}/api/model/status`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API status check failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking model status:', error);
    return { trained: false, modelPath: null };
  }
}

export async function predictPriceFromAPI(data: HouseData): Promise<number | null> {
  try {
    console.log('Sending data to backend:', JSON.stringify(data, null, 2));
    
    const response = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        squareFootage: data.squareFootage,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        yearBuilt: data.yearBuilt,
        neighborhood: data.neighborhood,
        lotSize: data.lotSize,
        garage: data.garage,
        basement: data.basement,
        centralAir: data.centralAir,
        kitchenQuality: data.kitchenQuality
      }),
      mode: 'cors',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('Received prediction:', result);
    return result.prediction;
  } catch (error) {
    console.error("Error in predictPriceFromAPI:", error);
    return null;
  }
}

export function predictPrice(data: HouseData): number {
  // Enhanced fallback function with more realistic calculations
  const BASE_PRICE = 150000;
  const PRICE_PER_SQFT = 100;
  const BEDROOM_VALUE = 15000;
  const BATHROOM_VALUE = 20000;
  const YEAR_MULTIPLIER = 500;
  const BASE_YEAR = 1950;
  const LOT_SIZE_VALUE = 100000;
  const GARAGE_VALUE = 10000;
  const BASEMENT_VALUE = 20000;
  const CENTRAL_AIR_VALUE = 15000;
  const KITCHEN_QUALITY_MULTIPLIER = 10000;

  const neighborhoodFactors: Record<string, number> = {
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

  // Calculate components separately for better debugging
  const sqftValue = data.squareFootage * PRICE_PER_SQFT;
  const bedroomValue = data.bedrooms * BEDROOM_VALUE;
  const bathroomValue = data.bathrooms * BATHROOM_VALUE;
  const yearValue = (data.yearBuilt - BASE_YEAR) * YEAR_MULTIPLIER;
  const neighborhoodFactor = neighborhoodFactors[data.neighborhood] || 1.0;
  const lotSizeValue = data.lotSize * LOT_SIZE_VALUE;
  const garageValue = data.garage * GARAGE_VALUE;
  const basementValue = data.basement ? BASEMENT_VALUE : 0;
  const centralAirValue = data.centralAir ? CENTRAL_AIR_VALUE : 0;
  const kitchenQualityValue = (data.kitchenQuality - 1) * KITCHEN_QUALITY_MULTIPLIER;

  let predictedPrice = BASE_PRICE + sqftValue + bedroomValue + bathroomValue + 
                      yearValue + lotSizeValue + garageValue + 
                      basementValue + centralAirValue + kitchenQualityValue;

  // Apply neighborhood factor
  predictedPrice *= neighborhoodFactor;

  // Add realistic market variation (5-10%)
  const marketVariation = 0.95 + Math.random() * 0.1;
  predictedPrice *= marketVariation;

  return Math.round(predictedPrice);
}

export function formatPrice(price: number): string {
  if (isNaN(price)) {
    console.warn('Attempted to format non-numeric price:', price);
    return "$0";
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// Utility function for API health check
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/model/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}