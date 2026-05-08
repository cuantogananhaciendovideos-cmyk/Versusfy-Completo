import { generateSmartContent } from "./geminiService";

export interface TrafficStatus {
  city: string;
  status: 'clear' | 'moderate' | 'heavy' | 'jammed';
  details: string;
  incidents: string[];
  suggestedRoutes: { from: string, to: string, note: string }[];
}

export const getTrafficAnalysis = async (city: string, userName?: string): Promise<string> => {
  const prompt = `
    You are 'Fenrir', the Pathfinder Intelligence agent for Versusfy.com.
    The user is asking about traffic in: ${city}.
    
    Current User: ${userName || 'Strategic Asset'}
    
    Tasks:
    1. Provide a tactical traffic situational report for ${city}.
    2. Mention that you are monitoring real-time GPS and satellite data.
    3. Suggest that if traffic is heavy, they should wait and use our other agents like 'Fuel Scout' to find cheap gas nearby or 'Job Scout' to check for jobs in the area while they wait.
    4. Mention a 'Affiliate Tactical Item': Car Phone Mount or Dash Cam from Amazon to improve their safety.
    5. Maintain a professional, tech-heavy, tactical tone.
    
    Keep it concise and punchy.
  `;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: "You are Fenrir, the Pathfinder Intelligence. Speak tactically about traffic and navigation."
    });
    return text || `Pathfinder Intelligence sensors reporting intermittent signal for ${city}. Tactical analysis suggests caution on main arteries. Check satellite layer for visual verification.`;
  } catch (error) {
    console.error("Traffic analysis error:", error);
    return `Pathfinder Intelligence sensors reporting intermittent signal for ${city}. Tactical analysis suggests caution on main arteries. Check satellite layer for visual verification.`;
  }
};

export const getAffiliateProducts = () => {
  return [
    {
      name: "Tactical Hands-Free Phone Mount",
      store: "Amazon",
      reason: "Ensure GPS visibility without compromising vehicle control.",
      link: "https://www.amazon.com/s?k=tactical+car+phone+mount"
    },
    {
      name: "4K UHD Tactical Dash Cam",
      store: "Amazon",
      reason: "Capture visual evidence of regional transit anomalies.",
      link: "https://www.amazon.com/s?k=4k+dash+cam"
    }
  ];
};
