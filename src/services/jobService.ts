import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  source: string;
  postedAt: string;
  tacticalFit: number; // 0-100 score
}

export interface JobAnalysis {
  jobs: JobResult[];
  marketOverview: string;
  spokenResponse: string;
}

export const scanLocalJobs = async (query: string, city: string, state: string, country: string): Promise<JobAnalysis> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    systemInstruction: `You are the Job Scout Tactical Agent for Versusfy. 
    Your mission is to find and analyze the best job opportunities in a specific location.
    Provide realistic job data based on current market trends for the requested area.
    Be professional, encouraging, and extremely precise.
    Encourage the user to take action.
    Format the response as JSON only.`
  });

  const prompt = `Perform a tactical scan for jobs matching "${query}" in ${city}, ${state}, ${country}. 
  Provide a list of 5 diverse job opportunities with company names, salary ranges (estimated or real), and a 'tacticalFit' score based on growth potential.
  Also provide a brief 'marketOverview' of the job sector in that city.
  Return a 'spokenResponse' in English (charismatic and professional, max 3 sentences).
  
  JSON Structure:
  {
    "jobs": [{ "id", "title", "company", "location", "salary", "description", "source", "postedAt", "tacticalFit" }],
    "marketOverview": "string",
    "spokenResponse": "string"
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedJson = text.replace(/```json|```/gi, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Job scan failed", error);
    throw error;
  }
};
