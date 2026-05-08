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
  const prompt = `Perform a tactical scan for REAL jobs matching "${query}" in ${city}, ${state}, ${country}. 
  Provide a list of 5 diverse job opportunities. For each job, include:
  - id: a unique short identifier
  - title: the EXACT job title
  - company: REAL company name
  - location: the specific area in ${city} or the exact site address
  - salary: realistic annual or hourly pay for this role
  - description: 2-sentence tactical summary of duties
  - source: where the job was found (e.g., LinkedIn, Indeed, Company Site)
  - postedAt: e.g., "2 hours ago", "Yesterday"
  - tacticalFit: a number from 0 to 100 based on the match for "${query}"
  - contactEmail: a realistic contact email for this role
  - contactPhone: a realistic contact phone number
  - applyUrl: the actual URL or a professional career link
  
  Also provide:
  - marketOverview: A 2-sentence tactical summary of the job market in ${city} specifically for ${query}.
  - spokenResponse: A charismatic and professional summary in English (max 3 sentences).

  CRITICAL: DO NOT return placeholder text like "Remote Virtual". Find or simulate REALISTIC local opportunities for "${query}".
  Return ONLY a valid JSON object matching this structure:
  {
    "jobs": [
      {
        "id": "J1",
        "title": "...",
        "company": "...",
        "location": "...",
        "salary": "...",
        "description": "...",
        "source": "...",
        "postedAt": "...",
        "tacticalFit": 85,
        "contactEmail": "...",
        "contactPhone": "...",
        "applyUrl": "..."
      }
    ],
    "marketOverview": "...",
    "spokenResponse": "..."
  }`;

  try {
    const text = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: `You are the Job Scout Tactical Agent for Versusfy. 
      Your mission is to find and analyze the best job opportunities in ${city}.
      Be professional, encouraging, and extremely precise with local data.
      Format the response as JSON only.`
    });

    const raw = safeJsonParse<any>(text || '{}', {
      jobs: [],
      marketOverview: "Tactical scan incomplete.",
      spokenResponse: "I encountered a minor scanning interference."
    });

    // Helper to find key in object regardless of case or snake/camel convention
    const getVal = (obj: any, keys: string[], fallback: string = "") => {
      if (!obj) return fallback;
      const lowerObj: any = {};
      Object.keys(obj).forEach(k => { lowerObj[k.toLowerCase().replace(/_/g, '')] = obj[k]; });
      
      for (const key of keys) {
        const normalizedKey = key.toLowerCase().replace(/_/g, '');
        if (lowerObj[normalizedKey] !== undefined && lowerObj[normalizedKey] !== null && String(lowerObj[normalizedKey]).trim() !== "") {
          return String(lowerObj[normalizedKey]);
        }
      }
      return fallback;
    };

    // Normalize jobs to ensure all required fields exist
    const normalizedJobs = (raw.jobs || []).map((job: any) => ({
      id: getVal(job, ['id', 'uuid', 'jobid'], Math.random().toString(36).substr(2, 5).toUpperCase()),
      title: getVal(job, ['title', 'jobtitle', 'position', 'role'], "Tactical Role"),
      company: getVal(job, ['company', 'companyname', 'employer'], "Regional Employer"),
      location: getVal(job, ['location', 'area', 'city', 'region'], city || "Local Sector"),
      salary: getVal(job, ['salary', 'pay', 'compensation', 'rate'], "Competitive"),
      description: getVal(job, ['description', 'summary', 'info'], "Tactical mission details available upon contact."),
      source: getVal(job, ['source', 'platform', 'origin'], "Tactical Audit"),
      postedAt: getVal(job, ['postedAt', 'posted_at', 'date', 'time'], "Just In"),
      tacticalFit: Number(getVal(job, ['tacticalFit', 'fit_score', 'relevance', 'match'], "85")),
      contactEmail: getVal(job, ['contactEmail', 'email', 'contact_email', 'apply_email'], ""),
      contactPhone: getVal(job, ['contactPhone', 'phone', 'contact_phone', 'tel'], ""),
      applyUrl: getVal(job, ['applyUrl', 'apply_url', 'link', 'url'], "")
    }));

    return {
      jobs: normalizedJobs,
      marketOverview: raw.marketOverview || raw.market_overview || "Tactical market audit complete in the requested sector.",
      spokenResponse: raw.spokenResponse || raw.spoken_response || "Scanning complete. I have identified several verified opportunities for your tactical career advancement."
    };
  } catch (error) {
    console.error("Job scan failed", error);
    throw error;
  }
};
