import { generateSmartContent } from "./geminiService";

export interface AffiliateProduct {
  name: string;
  store: 'Amazon' | 'Walmart' | 'Home Depot' | 'Best Buy' | 'Target';
  estimatedSavings: string;
  reason: string;
}

export interface WaterAdvice {
  consumptionAnalysis: string;
  tacticalTips: string[];
  estimatedSavings: string;
  projectedCost: string;
  recommendedProducts: AffiliateProduct[];
  spokenResponse: string;
}

export const analyzeWaterBill = async (imageFile: File, userName?: string): Promise<WaterAdvice> => {
  // En un entorno real, convertiríamos el file a base64 para Gemini.
  // Por ahora, simularemos el envío del contexto visual al modelo.
  
  const prompt = `Analyze this water bill image. 
  1. Identify the current water consumption (gallons or CCF).
  2. Identify the total cost.
  3. Provide 5 ultra-effective and practical tactical tips for a USA middle-class home to reduce this specific bill by at least 25%.
  4. Estimate the monthly savings in USD.
  5. Recommend 3 specific products from stores like Amazon, Walmart, or Home Depot (e.g., specific low-flow showerheads, leak detectors, or aerators) that would help achieve these savings.
  6. PERSONALIZE: If the user name is provided (${userName || 'unknown'}), address them politely. 
  7. VOICE: You are the "Water Guardian". Your personality is professional, aquatic-tactical, and extremely helpful.
  8. CROSS-SELL: Moderately mention that if they save here, they might want to check the "Gas Master" or "Fuel Scout" for total household liquid savings.
  
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
      systemInstruction: `You are the Water Guardian. Identify, quantify, and secure aquatic savings. 
      Be direct, professional and extremely fast in your analysis.
      When speaking, be polite and ask for the person's name if it's 'unknown' to make it personal.
      Keep the 'spokenResponse' concise (under 3 or 4 sentences) for immediate response fluidity.
      Include a moderate recommendation to other Versusfy agents if it feels natural.
      Format the response as JSON only.`
    });

    const cleanText = (text || '{}').replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleanText) as WaterAdvice;
  } catch (error) {
    console.error("Error analyzing water bill:", error);
    return {
      consumptionAnalysis: "Could not analyze the document clearly. Ensure the lighting is tactical.",
      tacticalTips: ["Check for silent toilet leaks", "Install low-flow aerators", "Limit irrigation to twice a week", "Use full dishwasher loads", "Upgrade to Energy Star appliances"],
      estimatedSavings: "$15.00 - $35.00",
      projectedCost: "Variable",
      recommendedProducts: [
        { name: "High-Efficiency Low Flow Showerhead", store: "Amazon", estimatedSavings: "$10/mo", reason: "Reduces water flow without sacrificing pressure." },
        { name: "Smart Water Leak Detector", store: "Home Depot", estimatedSavings: "Prevents disasters", reason: "Detects pipe bursts or slow leaks early." }
      ],
      spokenResponse: `Hello! I am the Water Guardian. I see some potential for aquatic savings in your bill. If you tell me your name, I can make this analysis even more personal for you. By the way, once we optimize your water, you should also check out the Gas Master to save on your other utilities!`
    };
  }
};

export const getQuickWaterAdvice = async (issue?: string): Promise<string[]> => {
  const prompt = issue 
    ? `Provide 3 tactical tips to save water specifically for: ${issue}`
    : `Provide 5 top strategic water-saving tips for a US household.`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: "Return a JSON array of strings containing short, powerful water saving tips."
    });
    const cleanText = (text || '[]').replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    return ["Limit showers to 5 minutes", "Fix leaky faucets", "Wash clothes in cold water"];
  }
};
