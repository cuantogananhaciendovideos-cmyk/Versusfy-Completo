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
  const prompt = `TACTICAL SEARCH PARAMETERS:
  TARGET: REAL and ACTIVE jobs matching "${query}"
  LOCATION: ${city}, ${state}, ${country}
  DATA FIDELITY: ELITE (No generic placeholders, no "Remote Virtual")
  
  TASK: Extract 5 high-yield job opportunities from the sector.
  
  REQUIRED JSON STRUCTURE (STRICT):
  {
    "jobs": [
      {
        "id": "J1",
        "title": "Exact Role Title",
        "company": "Real Company Name",
        "location": "Address or Neighborhood in ${city}",
        "salary": "$X/hr or $Xk/yr",
        "description": "2-sentence tactical summary",
        "source": "Platform/Source",
        "postedAt": "Time relative to now",
        "tacticalFit": 95,
        "contactEmail": "hr@example.com",
        "contactPhone": "555-000-0000",
        "applyUrl": "https://company.com/careers"
      }
    ],
    "marketOverview": "Brief sector audit.",
    "spokenResponse": "Elite mission summary (English, max 3 sentences)."
  }

  CRITICAL: Return ONLY the JSON object. No preamble, no markdown tags. Ensure all colons and commas are present.`;

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
