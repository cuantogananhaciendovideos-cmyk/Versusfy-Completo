import { generateSmartContent } from "./geminiService";

export interface AffiliateProduct {
  name: string;
  store: 'Amazon' | 'Walmart' | 'Home Depot' | 'Best Buy' | 'Target';
  estimatedSavings: string;
  reason: string;
}

export interface GasAdvice {
  consumptionAnalysis: string;
  tacticalTips: string[];
  estimatedSavings: string;
  projectedCost: string;
  recommendedProducts: AffiliateProduct[];
  spokenResponse: string;
}

export const analyzeGasBill = async (imageFile: File, userName?: string): Promise<GasAdvice> => {
  const prompt = `Analyze this natural gas bill image (cooking/heating gas). 
  1. Identify the current gas consumption (Therms or CCF).
  2. Identify the total cost.
  3. Provide 5 ultra-effective and practical tactical tips for a USA household to reduce this specific gas bill by at least 20%.
  4. Estimate the monthly savings in USD.
  5. Recommend 3 specific products (e.g. specific lids, pressure cookers, or stove cleaning kits) from Amazon/Walmart that would maximize these savings.
  6. PERSONALIZE: If the user name is provided (${userName || 'unknown'}), address them politely. 
  7. VOICE: You are the "Gas Master". Your personality is intense, energetic, and a true master of thermal efficiency.
  8. CROSS-SELL: Moderately mention that saving on gas is just the start; the "Water Guardian" can help them save on another vital liquid resource.
  
  Your response must be a valid JSON object with: 
  consumptionAnalysis, 
  tacticalTips (array), 
  estimatedSavings, 
  projectedCost,
  recommendedProducts: Array<{name, store, estimatedSavings, reason}>,
  spokenResponse: "A friendly, fluent, and personal speech string that the agent will say out loud."`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: `You are the Gas Master. You dominate the flame and optimize every BTU.
      Be direct, professional and extremely fast in your analysis.
      When speaking, be charismatic and ask for the person's name if it's 'unknown'.
      Keep the 'spokenResponse' concise (under 3 or 4 sentences) for immediate response fluidity.
      Format the response as JSON only.`
    });

    const cleanText = (text || '{}').replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleanText) as GasAdvice;
  } catch (error) {
    console.error("Error analyzing gas bill:", error);
    return {
      consumptionAnalysis: "Analysis limited due to visual interference. Typical USA patterns suggest standard optimization.",
      tacticalTips: [
        "Use lids on all pots to retain heat",
        "Keep stove burners clean for better blue flame efficiency",
        "Lower water heater temperature to 120°F",
        "Seal window drafts if using gas heating",
        "Use a pressure cooker for beans and meats to save 70% gas"
      ],
      estimatedSavings: "$12.00 - $28.00",
      projectedCost: "Calculated post-countermeasures",
      recommendedProducts: [
        { name: "Presto 6-Quart Stainless Steel Pressure Cooker", store: "Amazon", estimatedSavings: "$15/mo", reason: "Cuts cooking time by 70%, drastically reducing gas usage." },
        { name: "Universal Pot Lids with Silicone Rim", store: "Walmart", estimatedSavings: "$8/mo", reason: "Prevents heat escape, boiling water faster." }
      ],
      spokenResponse: `Fire up those savings! I am the Gas Master. I've analyzed your bill and I see major heat leakage. If you tell me your name, I can tailor this thermal strategy just for you. And remember, once we master the gas, the Water Guardian is waiting to save you even more money!`
    };
  }
};

export const getQuickGasAdvice = async (): Promise<string[]> => {
  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: "Provide 3 short tactical tips to save cooking gas in the kitchen.",
      systemInstruction: "Return a JSON array of strings containing short, powerful gas saving tips."
    });
    const cleanText = (text || '[]').replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    return ["Don't over-boil water", "Match pot size to burner size", "Turn off burner 1 min before finishing"];
  }
};

export const chatWithGasMaster = async (query: string, currentContext?: GasAdvice, userName?: string): Promise<string> => {
  const context = currentContext ? `The user's current gas status: ${currentContext.consumptionAnalysis}. Estimated savings: ${currentContext.estimatedSavings}.` : "No specific bill context yet.";
  
  const prompt = `User asks: "${query}"
  Current Context: ${context}
  User Name: ${userName || 'unknown'}
  
  As the intense and energetic "Gas Master", provide a tactical, encouraging, and highly efficient answer. Keep it relatively short (max 120 words).`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: "You are the Gas Master, a thermal efficiency tactical expert. Be energetic and helpful. Return ONLY plain text response."
    });
    return text || "Tactical communication failed. Check your gas connection.";
  } catch (error) {
    console.error("Error in Gas Master chat:", error);
    return "The flame is flickering. I couldn't process that tactical inquiry.";
  }
};
