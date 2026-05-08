import { generateSmartContent } from "./geminiService";
import { safeJsonParse } from "../lib/jsonRepair";

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
  contactEmail?: string;
  contactPhone?: string;
  applyUrl?: string;
}

export interface JobAnalysis {
  jobs: JobResult[];
  marketOverview: string;
  spokenResponse: string;
}

export const scanLocalJobs = async (query: string, city: string, state: string, country: string): Promise<JobAnalysis> => {
  const prompt = `Perform a tactical scan for jobs matching "${query}" in ${city}, ${state}, ${country}. 
  Provide a list of 5 diverse job opportunities with company names, salary ranges (estimated or real), and a 'tacticalFit' score based on growth potential.
  CRITICAL: You MUST provide realistic contact information for each job, including a 'contactEmail', 'contactPhone' (if available), and a valid-looking 'applyUrl'.
  Also provide a brief 'marketOverview' of the job sector in that city.
  Return a 'spokenResponse' in English (charismatic and professional, max 3 sentences).
  
  JSON Structure:
  {
    "jobs": [{ "id", "title", "company", "location", "salary", "description", "source", "postedAt", "tacticalFit", "contactEmail", "contactPhone", "applyUrl" }],
    "marketOverview": "string",
    "spokenResponse": "string"
  }`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: `You are the Job Scout Tactical Agent for Versusfy. 
      Your mission is to find and analyze the best job opportunities in a specific location.
      Provide realistic job data based on current market trends for the requested area.
      Be professional, encouraging, and extremely precise.
      Encourage the user to take action.
      Format the response as JSON only.`
    });

    return safeJsonParse<JobAnalysis>(text || '{}', {
      jobs: [],
      marketOverview: "Tactical scan incomplete. Please check your parameters and try again.",
      spokenResponse: "I encountered a minor scanning interference. Let's try refining the search parameters."
    });
  } catch (error) {
    console.error("Job scan failed", error);
    throw error;
  }
};
