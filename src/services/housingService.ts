import { generateSmartContent } from "./geminiService";
import { safeJsonParse } from "../lib/jsonRepair";

export interface HousingListing {
  id: string;
  type: 'rent' | 'sale';
  price: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  features: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  coordinates: { lat: number; lng: number };
}

export interface AffiliateProduct {
  name: string;
  store: 'Amazon' | 'Walmart' | 'Home Depot' | 'Best Buy' | 'Target';
  estimatedSavings: string;
  reason: string;
}

export const getHousingProducts = async (): Promise<AffiliateProduct[]> => {
  const prompt = `Recommend 3 specific products from Amazon, Walmart, or Home Depot (e.g., heavy-duty moving boxes, smart locks for a new home, or energy-efficient thermostats) that help someone moving into a new home or apartment save money or secure their investment.`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: `You are the Versusfy Housing Tactical Expert. Return ONLY a JSON array of objects with keys: name, store, estimatedSavings, and reason.`
    });
    return safeJsonParse<AffiliateProduct[]>(text || '[]', [
      { name: "Ecobee Smart Thermostat Premium", store: "Amazon", estimatedSavings: "Up to 26% on heating/cooling", reason: "AI-driven temperature scheduling reduces wasteful energy consumption." },
      { name: "Heavy Duty Moving Box Kit (30 Pack)", store: "Home Depot", estimatedSavings: "$40 vs buying individually", reason: "Pre-bundled tactical packaging for high-density moves." }
    ]);
  } catch (error) {
    return [
      { name: "Ecobee Smart Thermostat Premium", store: "Amazon", estimatedSavings: "Up to 26% on heating/cooling", reason: "AI-driven temperature scheduling reduces wasteful energy consumption." },
      { name: "Heavy Duty Moving Box Kit (30 Pack)", store: "Home Depot", estimatedSavings: "$40 vs buying individually", reason: "Pre-bundled tactical packaging for high-density moves." }
    ];
  }
};

export const getHousingSpeech = async (city: string, resultsCount: number, userName?: string): Promise<string> => {
  const prompt = `Generate a short, polite, and welcoming spoken greeting for the "Housing Search" agent. 
  Context: Found ${resultsCount} listings in ${city}. 
  User Name: ${userName || 'unknown'}.
  PERSONALITY: You are the Housing Architect. You are structural, welcoming, and focus on long-term investment security.
  CROSS-SELL: Suggest that once they find a home, they should use "Water Guardian" and "Gas Master" to optimize their new utility bills.
  
  Return ONLY the speech string.`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: "You are the Housing Architect. Speak clearly, politely, and ask for their name if unknown. Format: Just the string."
    });
    return text || `Welcome. I've secured ${resultsCount} housing options in ${city}. If you share your name, I can help you find a truly personal fit. Also, once you're settled, my colleagues the Water Guardian and Gas Master can help you minimize your new utility costs.`;
  } catch (error) {
    return `Welcome. I've secured ${resultsCount} housing options in ${city}. If you share your name, I can help you find a truly personal fit. Also, once you're settled, my colleagues the Water Guardian and Gas Master can help you minimize your new utility costs.`;
  }
};

export const searchHousing = async (options: {
  type: 'rent' | 'sale';
  city: string;
  state: string;
  zipCode?: string;
  budget?: string;
}) => {
  const prompt = `Find 5 real-time ${options.type} listings (properties currently available for ${options.type}) in ${options.city}, ${options.state} ${options.zipCode ? options.zipCode : ''}.
  Budget: ${options.budget || 'Any'}.
  
  For each listing, find the physical address, price, and contact information (Name, Phone, Email).
  Format the coordinates (latitude and longitude) for Google Maps integration.
  
  IMPORTANT: Ensure you differentiate clearly between properties for RENT and properties for SALE based on the requested type: ${options.type}.
  
  Your response must be a valid JSON array of housing objects.`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      systemInstruction: `You are the Versusfy Real Estate Tactical Expert. Use your real-time search capabilities to find actual housing listings in the USA.
      Return ONLY a JSON array of objects with the following keys:
      id (string), type ("rent" or "sale"), price (string), address (string), city (string), state (string), zipCode (string), description (string), features (string array), contactName (string), contactPhone (string), contactEmail (string), coordinates (object with lat and lng number).
      
      If you cannot find exact real-time matches, provide highly realistic and representative active examples for that specific area to guide the user's tactical planning.
      
      Ensure you prioritize current and accurate data for the middle and lower class families in the USA.`
    });

    return safeJsonParse<HousingListing[]>(text || '[]', []);
  } catch (error) {
    console.error("Error searching housing:", error);
    return [];
  }
};
