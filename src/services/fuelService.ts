import { generateSmartContent } from "./geminiService";
import { safeJsonParse } from "../lib/jsonRepair";

export interface GasStation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  prices: {
    regular: string;
    midgrade?: string;
    premium?: string;
    diesel?: string;
  };
  lastUpdated: string;
  coordinates: { lat: number; lng: number };
}

export interface AffiliateProduct {
  name: string;
  store: 'Amazon' | 'Walmart' | 'Home Depot' | 'Best Buy' | 'Target';
  estimatedSavings: string;
  reason: string;
}

export const getFuelSavingProducts = async (): Promise<AffiliateProduct[]> => {
  const prompt = `Recommend 3 specific products from Amazon or Walmart (e.g., fuel additives like Sea Foam, fuel-efficient tires, or OBDII scanners for car health) that help a vehicle owner save on gasoline costs over time.`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: `You are the Versusfy Fuel Tactical Expert. Return ONLY a JSON array of objects with keys: name, store, estimatedSavings, and reason.`
    });
    return safeJsonParse<AffiliateProduct[]>(text || '[]', [
      { name: "Sea Foam Motor Treatment (16 oz.)", store: "Amazon", estimatedSavings: "2-5 MPG gain", reason: "Cleans fuel injectors and intake valves for optimal combustion." },
      { name: "Michelin Defender T+H All-Season Tires", store: "Walmart", estimatedSavings: "$250 over tire life", reason: "Low rolling resistance optimizes fuel economy across miles." }
    ]);
  } catch (error) {
    return [
      { name: "Sea Foam Motor Treatment (16 oz.)", store: "Amazon", estimatedSavings: "2-5 MPG gain", reason: "Cleans fuel injectors and intake valves for optimal combustion." },
      { name: "Michelin Defender T+H All-Season Tires", store: "Walmart", estimatedSavings: "$250 over tire life", reason: "Low rolling resistance optimizes fuel economy across miles." }
    ];
  }
};

export const getFuelScoutSpeech = async (city: string, stationsCount: number, userName?: string): Promise<string> => {
  const prompt = `Generate a short, polite, and tactical spoken greeting for the "Fuel Scout" agent. 
  Context: Found ${stationsCount} cheap gas stations in ${city}. 
  User Name: ${userName || 'unknown'}.
  PERSONALITY: You are the Fuel Scout. You are sharp, fast-paced, and focus on mobility.
  CROSS-SELL: Suggest that if they are driving around, they might want to check "Housing Search" if they are looking for a new base of operations.
  
  Return ONLY the speech string.`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: "You are the Fuel Scout. Speak clearly, politely, and ask for their name if unknown. Be brief and tactical. Format: Just the string."
    });
    return text || `Results are in from ${city}, soldier. If you tell me your name, I can optimize your route even better. Also, if you're scouting for a new base, our Housing Search agent is ready for deployment.`;
  } catch (error) {
    return `Results are in from ${city}, soldier. If you tell me your name, I can optimize your route even better. Also, if you're scouting for a new base, our Housing Search agent is ready for deployment.`;
  }
};

export const searchGasStations = async (options: {
  city: string;
  state?: string;
  zipCode?: string;
}) => {
  const locationStr = `${options.city}${options.state ? ', ' + options.state : ''} ${options.zipCode || ''}`.trim();
  const prompt = `Find 5 currently cheapest gas stations in ${locationStr}.
  
  For each station, find the current price for Regular, Midgrade, Premium, and Diesel if available.
  Include the exact address and format the coordinates (latitude and longitude) for Google Maps integration.
  
  Your response must be a valid JSON array of gas station objects.`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      tools: [{ google_search_retrieval: {} }],
      systemInstruction: `You are the Versusfy Fuel Tactical Expert. Use your real-time search capabilities to find the most accurate and cheapest gas station prices in the USA.
      Return ONLY a pure JSON array of objects. Keys:
      - name (official station name)
      - address (FULL street address)
      - city
      - state
      - zipCode
      - prices (object with regular, midgrade, premium, diesel strings e.g. "$3.15")
      - lastUpdated (e.g. "1 hour ago")
      - coordinates (object with lat and lng float numbers)
      
      CRITICAL: You MUST include the exact "name" and "address" for every station. Priority: lowest "regular" price first.`
    });

    return safeJsonParse<GasStation[]>(text || '[]', []);
  } catch (error) {
    console.error("Error searching gas stations:", error);
    return [];
  }
};

