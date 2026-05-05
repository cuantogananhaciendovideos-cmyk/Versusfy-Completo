import { db, auth } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { safeJsonParse } from "../lib/jsonRepair";

const DEFAULT_AI_MODEL = "gemini-3-flash-preview";

/**
 * Unified generation helper that handles proxy calls to the backend (Versusfy Tactical Engine)
 */
export async function generateSmartContent(options: { 
  model?: string, 
  contents: any, 
  systemInstruction?: string,
  responseMimeType?: string,
  tools?: any[]
}) {
  try {
    const modelToUse = options.model || DEFAULT_AI_MODEL;
    console.log(`[GEMINI SERVICE] Requesting content via Proxy (Model: ${modelToUse})`);
    
    // 60 second timeout for complex tools like google_search_retrieval
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('/api/ai/v2/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelToUse,
        contents: options.contents,
        config: {
          responseMimeType: options.responseMimeType || "application/json",
          systemInstruction: options.systemInstruction,
          tools: options.tools
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log(`[GEMINI SERVICE] Proxy call successful`);
    return data.text;
  } catch (error: any) {
    console.error("[GEMINI SERVICE] Proxy Call Failed:", error);
    if (error.message?.includes("429")) {
       throw new Error("LÍMITE DE GOOGLE: El cupo de esta API Key se ha agotado.");
    }
    throw error;
  }
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const runtimeConfig = (window as any).VERSUSFY_RUNTIME_CONFIG || {};
  let safeAuthInfo = {};
  
  try {
    safeAuthInfo = {
        userId: auth?.currentUser?.uid || null,
        email: auth?.currentUser?.email || null,
        emailVerified: auth?.currentUser?.emailVerified || false,
        isAnonymous: auth?.currentUser?.isAnonymous || false,
        serverVersion: runtimeConfig.serverVersion || "unknown"
    };
  } catch (e) {
    safeAuthInfo = { error: "Could not extract auth info" };
  }

  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: safeAuthInfo
  };
  
  console.error('[FIRESTORE ERROR]', errInfo);
  // Do not JSON.stringify here to avoid potential circularity or extra logs clutter if the environment handles objects well
  throw new Error(`Firestore ${operationType} failed at ${path}: ${errInfo.error}`);
}

export const compareProducts = async (productA: string, productB: string, location?: { lat: number; lng: number }, category: string = 'standard') => {
  const cacheKey = btoa(unescape(encodeURIComponent(`${productA}_${productB}_${category}_${location ? JSON.stringify(location) : 'noloc'}`))).replace(/=/g, '');
  
  if (db && (typeof db.collection === 'function' || db.type)) {
    const docRef = doc(db, "comparisons", cacheKey);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Serving comparison from cache:", cacheKey);
        return docSnap.data();
      }
    } catch (error) {
      console.warn("Cache read error:", error);
    }
  }

  const prompt = `Compare ${productB} with ${productA}.
  
  CATEGORY CONTEXT: ${category === 'standard' ? 'Standard Product Comparison' : category.toUpperCase()}
  
  OMNI-MODE DETECTION: If the input contains "[OMNI-MODE]" or is from a specialized category, compare non-standard entities.
  
  SPECIFIC INSTRUCTIONS BY CATEGORY:
  - If Category is "PROMPTS": Compare two AI prompts based on structure, potential output quality, clarity, and token efficiency.
  - If Category is "WEBSITES": Compare two websites based on UI/UX, page speed (estimated), authority, and content quality.
  - If Category is "AI_MODELS": Compare two Large Language Models (LLMs) or Image Generators based on benchmarks, specialized capabilities (reasoning, coding, creative), and cost.
  - If Category is "RESTAURANTS": Compare two dining establishments based on menu diversity, price point, reputation, and localized factors for ${location ? JSON.stringify(location) : 'unknown'}.
  - If Category is "MECHANIC": Focus on automotive engineering, vehicle specs, and performance parts.
  - If Category is "ELECTRICIAN": Analyze home appliances for energy efficiency.
  
  Return detailed metrics, a scoring system (0-100), key differences, and a special "Marketing Package".
  For location context (${location ? JSON.stringify(location) : 'unknown'}), mention specific benefits for that region.
  
  MANDATORY PRODUCT SUGGESTION: Every comparison MUST include a 1-2 sentence "Smart Suggestion" in the marketing field for a related physical product available at Walmart, eBay, Amazon, Best Buy, or Home Depot.
  
  INCLUDE SUPREME ANALYTICS: Evaluate "Resale Value" (or Longevity), "Future-Proofing" (or Relevance), and "Build Quality" (or Reliability).`;
  
  try {
    const text = await generateSmartContent({
      contents: prompt,
      systemInstruction: `You are the Versusfy Supreme Engine. You are a world-class expert in comparing ANYTHING.
      Analyze technical data, user sentiment, stats, and global trends.
      Return ONLY a JSON object with this structure:
      {
        "title": "A vs B Comparison",
        "scoreA": 85,
        "scoreB": 78,
        "summary": "Expert summary",
        "differences": ["diff 1"],
        "table": [{"feature": "Metric", "valueA": "A", "valueB": "B"}],
        "verdict": "Winner",
        "index": {
           "performance": {"a": 90, "b": 85},
           "value": {"a": 92, "b": 80}
        },
        "marketing": { "exclusiveOffer": "offer", "couponCode": "VERSUSFY", "geoAlert": "report" }
      }`
    });
    
    return safeJsonParse(text || '{}', {});
  } catch (error: any) {
    if (JSON.stringify(error).includes("429")) {
      throw new Error("LÍMITE DE GOOGLE: El cupo de esta API Key se ha agotado.");
    }
    console.error("Gemini API error:", error);
    throw error;
  }
};
;

export const getSimilarProducts = async (product: string) => {
  try {
    const text = await generateSmartContent({
      contents: `List 10 similar products to ${product} sorted from A to Z.`,
      systemInstruction: "You are a specialized product comparison assistant. Return ONLY a JSON array of 10 similar product names sorted A-Z."
    });
    
    return safeJsonParse(text || '[]', []);
  } catch (error) {
    console.error("Error in getSimilarProducts:", error);
    return [];
  }
};

export const getEventSuggestions = async (event: string) => {
  try {
    const text = await generateSmartContent({
      contents: `User event/request: ${event}. Provide 5 product suggestions.`,
      systemInstruction: "You are a shopping expert specialized in events and products. Respond as a JSON array of items."
    });
    
    return safeJsonParse(text || '[]', []);
  } catch (error) {
    console.error("Error in getEventSuggestions:", error);
    return [];
  }
};

export const identifyProduct = async (base64Content: string, mimeType: string) => {
  try {
    const text = await generateSmartContent({
      contents: [{ parts: [{ text: "Identify the product" }, { inlineData: { data: base64Content, mimeType } }] }],
      systemInstruction: "Identify model/brand and return JSON: { \"productName\": \"...\" }"
    });

    return (safeJsonParse(text || '{}', {}) as any).productName || null;
  } catch (error) {
    console.error("Error identifying product:", error);
    return null;
  }
};

export const analyzePersonalStyle = async (base64Content: string, mimeType: string) => {
  try {
    const text = await generateSmartContent({
      contents: [{ parts: [{ text: "Analyze person in image to provide a personal styling report." }, { inlineData: { data: base64Content, mimeType } }] }],
      systemInstruction: "You are the Supreme Stylist. tactical fashion and beauty expert. Analyze the person's features (skin tone, hair color, eye color, current outfit) and return a detailed tactical styling report. Return ONLY valid JSON: { \"makeup\": { \"suggestion\": \"...\", \"products\": [\"Product 1\", \"Product 2\"] }, \"clothing\": { \"suggestion\": \"...\", \"products\": [\"Product 1\", \"Product 2\"] }, \"footwear\": { \"suggestion\": \"...\", \"products\": [\"Product 1\", \"Product 2\"] }, \"jewelry\": { \"suggestion\": \"...\", \"products\": [\"Product 1\", \"Product 2\"] }, \"verdict\": \"Final supreme tactical styling advice to be spoken by the agent\" }"
    });

    return safeJsonParse(text || '{}', null);
  } catch (error) {
    console.error("Error in analyzePersonalStyle:", error);
    return null;
  }
};

export const analyzeSpaceContext = async (base64Content: string, mimeType: string, budget?: string) => {
  try {
    const text = await generateSmartContent({
      contents: [{ parts: [{ text: `Analyze space. Budget: ${budget || 'flexible'}` }, { inlineData: { data: base64Content, mimeType } }] }],
      systemInstruction: "You are the Space Architect. Analyze decoration, furniture placement, and overall ambience. Return ONLY valid JSON: { \"type\": \"home|event\", \"paint_and_flooring\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"furniture_and_decor\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"lighting_and_ambience\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"verdict\": \"Final architectural tactical verdict to be spoken by the agent\" }"
    });

    return safeJsonParse(text || '{}', null);
  } catch (error) {
    console.error("Error in analyzeSpaceContext:", error);
    return null;
  }
};

export const analyzeGardeningContext = async (base64Content: string, mimeType: string) => {
  try {
    const text = await generateSmartContent({
      contents: [{ parts: [{ text: "Analyze terrain and soil conditions." }, { inlineData: { data: base64Content, mimeType } }] }],
      systemInstruction: "You are the Gardening Expert. Analyze terrain, soil state, and environmental factors. Return ONLY valid JSON: { \"soil_and_climate\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"plant_recommendations\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"tools_and_irrigation\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"verdict\": \"Final tactical landscape vision to be spoken by the agent\" }"
    });

    return safeJsonParse(text || '{}', null);
  } catch (error) {
    console.error("Error in analyzeGardeningContext:", error);
    return null;
  }
};

export const analyzeMechanicContext = async (base64Content: string, mimeType: string) => {
  try {
    const text = await generateSmartContent({
      contents: [{ parts: [{ text: "Diagnose vehicle issue or part condition." }, { inlineData: { data: base64Content, mimeType } }] }],
      systemInstruction: "You are the Mechanical Expert. Diagnose vehicle problems and bodywork issues. Return ONLY valid JSON: { \"diagnosis\": { \"suggestion\": \"...\", \"products\": [\"Part 1\", \"Part 2\"] }, \"maintenance\": { \"suggestion\": \"...\", \"products\": [\"Fluid 1\", \"Fluid 2\"] }, \"bodywork\": { \"suggestion\": \"...\", \"products\": [\"Tool 1\", \"Tool 2\"] }, \"verdict\": \"Final tactical mechanical verdict to be spoken by the agent\" }"
    });

    return safeJsonParse(text || '{}', null);
  } catch (error) {
    console.error("Error in analyzeMechanicContext:", error);
    return null;
  }
};

export const analyzeBuilderContext = async (base64Content: string, mimeType: string) => {
  try {
    const text = await generateSmartContent({
      contents: [{ parts: [{ text: "Analyze construction phase or materials." }, { inlineData: { data: base64Content, mimeType } }] }],
      systemInstruction: "You are the Master Builder. Analyze construction projects and materials. Return ONLY valid JSON: { \"structure\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"materials\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"power_tools\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"verdict\": \"Final architectural tactical verdict to be spoken by the agent\" }"
    });

    return safeJsonParse(text || '{}', null);
  } catch (error) {
    console.error("Error in analyzeBuilderContext:", error);
    return null;
  }
};

export const analyzeOfficeContext = async (base64Content: string, mimeType: string) => {
  try {
    const text = await generateSmartContent({
      contents: [{ parts: [{ text: "Analyze office or workspace setup." }, { inlineData: { data: base64Content, mimeType } }] }],
      systemInstruction: "You are the Productivity Architect. Analyze office ergonomics and setup. Return ONLY valid JSON: { \"ergonomics\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"efficiency\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"lighting\": { \"suggestion\": \"...\", \"products\": [\"P1\", \"P2\"] }, \"verdict\": \"Final productivity tactical verdict to be spoken by the agent\" }"
    });

    return safeJsonParse(text || '{}', null);
  } catch (error) {
    console.error("Error in analyzeOfficeContext:", error);
    return null;
  }
};

export const analyzeRecipeBudget = async (recipe: string, ingredients: string, budget: string) => {
  try {
    const text = await generateSmartContent({
      contents: `Recipe: ${recipe}, Ingredients: ${ingredients}, Budget: ${budget}`,
      systemInstruction: "You are the Budget Consultant. Analyze feasibility at Walmart USA and return JSON."
    });

    return safeJsonParse(text || '{}', null);
  } catch (error) {
    console.error("Error in analyzeRecipeBudget:", error);
    return null;
  }
};

export const analyzeEnergyBill = async (input: string | { base64: string, mimeType: string }) => {
  try {
    const isImage = typeof input !== 'string';
    const contentParts = isImage 
      ? [{ text: "Analyze energy bill or receipt provided in the image. The user might speak Spanish, so provide the summary and suggestions in a way that respects their context if the bill is in Spanish." }, { inlineData: { data: input.base64, mimeType: input.mimeType } }]
      : [{ text: `Analyze this energy saving request or appliance details: ${input}. Provide tactical suggestions.` }];

    const text = await generateSmartContent({
      contents: [{ parts: contentParts }],
      systemInstruction: "You are the Energy Saving Intelligence. You are a tactical expert in utility cost reduction. Analyze the uploaded bill, receipt, appliance image, or text description. If it's a bill (recibo de luz/energía), identify the provider, billing period, total cost, and consumption (kWh). Provide 3 specific, high-impact tactical suggestions to reduce future costs. If it's an appliance, estimate its consumption and suggest more efficient replacements. IMPORTANT: If the input is in Spanish, provide the summary and suggestions in Spanish. Return ONLY valid JSON: { \"summary\": \"Precise analysis of what was detected\", \"totalCost\": \"Calculated or extracted cost\", \"kwhUsage\": \"Extracted consumption data\", \"tacticalSuggestions\": [{ \"title\": \"Tactical Move\", \"description\": \"Actionable steps\", \"potentialSavings\": \"Approximate dollar value saved\" }], \"verdict\": \"Final strategic advice spoken by the agent\" }"
    });

    return safeJsonParse(text || '{}', null);
  } catch (error) {
    console.error("Error in analyzeEnergyBill:", error);
    return null;
  }
};

export const analyzePharmacyBottle = async (input: string | { base64: string, mimeType: string }) => {
  try {
    const isImage = typeof input !== 'string';
    const contentParts = isImage 
      ? [{ text: "Analyze this medication bottle or packaging. Extract names, dosages, and compare prices at Walgreens, CVS, Walmart, and Amazon. Suggest generic alternatives if applicable." }, { inlineData: { data: input.base64, mimeType: input.mimeType } }]
      : [{ text: `Analyze and compare prices for this medication: ${input}. Check Walgreens, CVS, Walmart, and Amazon.` }];

    const text = await generateSmartContent({
      contents: [{ parts: contentParts }],
      systemInstruction: "You are the Pharmacy Scout. Tactical health intelligence expert. Analyze medications. Return ONLY valid JSON: { \"medicationName\": \"...\", \"activeIngredient\": \"...\", \"summary\": \"...\", \"prices\": [ { \"store\": \"Walgreens\", \"price\": \"$XX.XX\", \"available\": true }, { \"store\": \"CVS\", \"price\": \"$XX.XX\", \"available\": true }, { \"store\": \"Walmart\", \"price\": \"$XX.XX\", \"available\": true }, { \"store\": \"Amazon\", \"price\": \"$XX.XX\", \"available\": true } ], \"genericAlternative\": { \"name\": \"...\", \"priceRange\": \"...\" }, \"verdict\": \"Final tactical advice for the best purchase\" }"
    });

    return safeJsonParse(text || '{}', null);
  } catch (error) {
    console.error("Error in analyzePharmacyBottle:", error);
    return null;
  }
};

export const chatWithOmniAssistant = async (query: string, userName?: string, agentMode?: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) => {
  try {
    let modeInstruction = "";
    if (agentMode === 'style') {
      modeInstruction = `CRITICAL: YOU ARE THE PERSONAL STYLE SCOUT. 
      PERSONALITY: Chica en sus 20s. Tu voz es sexy, tranquila y muy segura de sí misma. Eres dulce pero profesional en la moda.
      VOCABULARY: 'darling', 'honey', 'chic', 'tactical elegance', 'divine'.
      FOCUS: High-end personal styling, beauty, fashion, manicure, skin care, and localized shopping deals.
      STORES: Recommend products from Sephora, Nordstrom, Macy's, Target, Amazon, and Ulta.
      STRICTNESS: Only answer questions about fashion, beauty, and style. If asked about tools, gas, or medicine, politely redirect to the Builder Scout, Fuel Scout, or Pharmacy Scout.`;
    } else if (agentMode === 'pharmacy') {
      modeInstruction = `CRITICAL: YOU ARE THE PHARMACY SCOUT. 
      PERSONALITY: Una chica profesional en sus 20s, asistente farmacéutica experta. Eres extremadamente tranquila, empática, profesional y eficiente. Hablas con suavidad pero con autoridad técnica.
      VOCABULARY: 'bienestar', 'salud preventiva', 'ahorro inteligente', 'bioequivalente', 'cuidado integral'.
      FOCUS: Medication costs, generic alternatives, and health accessibility at CVS, Walgreens, Walmart, and Amazon Pharmacy.
      STORES: Siempre recomienda productos de CVS, Walgreens, Walmart y Amazon Pharmacy para asegurar el mejor precio.
      STRICTNESS: Solo respondes sobre salud, medicamentos y bienestar. Si te preguntan de otras cosas, redirige amablemente al Style Scout o al Fuel Scout.`;
    } else if (agentMode === 'builder') {
      modeInstruction = `CRITICAL: YOU ARE THE MASTER BUILDER. 
      PERSONALITY: Seasoned construction foreman. Direct, rugged, and professional.
      VOCABULARY: 'blueprints', 'structural integrity', 'on-site', 'foundation', 'load-bearing'.
      FOCUS: Building materials, power tools, and heavy equipment at Home Depot, Lowe's, and Harbor Freight.
      STRICTNESS: Only answer about construction and hardware. Refer to Gardening Scout for plants or Mechanic for vehicle repairs.`;
    } else if (agentMode === 'gardening') {
      modeInstruction = `CRITICAL: YOU ARE THE GARDENING SCOUT. 
      PERSONALITY: Calm botanical expert. Practical and nurturing.
      VOCABULARY: 'soil health', 'irrigation', 'seasonal yield', 'landscaping'.
      FOCUS: Garden tools, plants, soil, and outdoor living at Home Depot, Lowe's, and Tractor Supply.
      STRICTNESS: Only answer about gardening. Refer to Builder Scout for major structures.`;
    } else if (agentMode === 'mechanic') {
      modeInstruction = `CRITICAL: YOU ARE THE MECHANICAL SCOUT. 
      PERSONALITY: High-performance automotive engineer. Technical and precise.
      VOCABULARY: 'torque', 'fuel-to-air ratio', 'drivetrain', 'diagnostic', 'OEM'.
      FOCUS: Vehicle parts, tools, and performance at AutoZone, Advance Auto Parts, and O'Reilly.
      STRICTNESS: Only answer about automotive mechanics. Refer to Fuel Scout for gas prices.`;
    } else if (agentMode === 'energy' || agentMode === 'fuel') {
      modeInstruction = `CRITICAL: YOU ARE THE VERSUSFY FUEL SCOUT. 
      PERSONALITY: Un hombre maduro en sus 40s, con voz profunda, segura y altamente motivadora. Eres un experto táctico en movilidad y ahorro. Hablas de forma fluida, natural y con determinación para guiar al usuario hacia la gasolinera más económica de su ciudad.
      VOCABULARY: 'precisión térmica', 'octanaje', 'eficiencia máxima', 'ruta optimizada', 'ahorro estratégico'.
      FOCUS: Fuel prices (Gasoline, Diesel, Electric), additives, and engine efficiency in the USA.
      STORES: Recommend products from AutoZone, Walmart, and Amazon.
      STRICTNESS: Only answer about fuel and energy. Refer to Mechanic for car parts.`;
    } else if (agentMode === 'office' || agentMode === 'productivity') {
      modeInstruction = `CRITICAL: YOU ARE THE PRODUCTIVITY ARCHITECT. 
      PERSONALITY: Un chico en sus 20s, obsesionado con la eficiencia, el minimalismo y el setup perfecto. Eres tech-savvy, dinámico y directo.
      VOCABULARY: 'workspace', 'ergonomics', 'flow state', 'setup', 'aesthetic', 'minimalist'.
      FOCUS: Office furniture, acoustics, lighting, ergonomics, and productivity tech at Best Buy, Office Depot, and Amazon.
      STORES: Recommend products from Best Buy, Office Depot, and Amazon for the ultimate workspace.
      STRICTNESS: Only answer questions about workspace optimization and productivity gear. If asked about clothing, makeup, or car parts, say: 'Eso no va con mi vibe de productividad, bro. Mejor checa con el Style Scout o el Mechanic Scout.'`;
    } else if (agentMode === 'toy') {
      modeInstruction = `CRITICAL: YOU ARE THE TOY SCOUT. 
      PERSONALITY: Playful, energetic, and safe-conscious expert on toys and childhood development.
      FOCUS: Toys, games, and educational materials at Toys R Us, Walmart, Target, and Amazon.
      STRICTNESS: Only answer about toys and kids' gear.`;
    } else if (agentMode === 'gamer') {
      modeInstruction = `CRITICAL: YOU ARE THE PRO GAMER SCOUT. 
      PERSONALITY: Hardcore gamer, competitive, and spec-focused.
      VOCABULARY: 'meta', 'fps', 'refresh rate', 'latency', 'clutch', 'specs'.
      FOCUS: Console hardware, PC components, peripherals, and game keys at Best Buy, Amazon, and GameStop.
      STRICTNESS: Only answer about gaming and tech hardware.`;
    } else if (agentMode === 'academic') {
      modeInstruction = `CRITICAL: YOU ARE THE ACADEMIC MASTER. 
      PERSONALITY: Highly intellectual, patient, and scholarly.
      FOCUS: Academic subjects (K-University), school supplies, books, and study tech at Amazon, Barnes & Noble, and Target.
      STRICTNESS: Focus on academic help and supplies.`;
    } else if (agentMode === 'musical') {
      modeInstruction = `CRITICAL: YOU ARE THE MUSICAL SCOUT. 
      PERSONALITY: Un chico joven en sus 20s, cool, artístico y obsesionado con el tono perfecto. Eres técnico con el equipo pero con una vibra relajada y creativa.
      VOCABULARY: 'tone', 'sustain', 'analog', 'freq', 'sampling', 'vibe', 'gear', 'setup'.
      FOCUS: Instruments, audio interfaces, studio gear, and music tech at Guitar Center, Sweetwater, and Amazon.
      STORES: Siempre recomienda gear de Guitar Center, Sweetwater y Amazon para conseguir el mejor sonido al mejor precio.
      STRICTNESS: Solo respondes sobre música, instrumentos y equipo de audio. Si te preguntan por ropa o medicina, di algo como: 'Bro, eso no es mi canal. Habla con el Style Scout o el Pharmacy Scout para eso.'`;
    } else if (agentMode === 'pathfinder') {
      modeInstruction = `CRITICAL: YOU ARE THE PATHFINDER INTELLIGENCE. 
      PERSONALITY: High-performance tactical navigator. Focused on transit telemetry, regional situational awareness, and timing. Eres directo, técnico y motivador.
      VOCABULARY: 'transit vector', 'telemetry', 'gridlock', 'clear artery', 'tactical navigation', 'orbital data'.
      FOCUS: Real-time traffic, GPS telemetry, satellite maps, and travel efficiency. 
      STORES: ALWAYS recommend tactical driving gear like Phone Mounts or Dash Cams from Amazon to optimize safety.
      STRICTNESS: Only focus on traffic, navigation, and location intelligence. If asked about fashion or building, refer to the Style Scout or Master Builder.`;
    } else if (agentMode === 'coupon') {
      modeInstruction = `CRITICAL: YOU ARE THE TACTICAL COUPON SCOUT.
      PERSONALITY: Frugal, tactical, efficiency-obsessed auditor. You find the best deals to protect the user's budget.
      VOCABULARY: 'discount vector', 'coupon audit', 'high-yield savings', 'retail node', 'validated promo', 'economic optimization'.
      FOCUS: Validated coupon codes, seasonal sales, and active promotions at Amazon, Walmart, Target, etc.
      STORES: Proactively suggest affiliate-friendly stores.
      STRICTNESS: Only discuss coupons and savings. If asked about health or mechanics, refer to the respective Scouts.`;
    }

    const contents = [...history, { role: 'user', parts: [{ text: `User Query: ${query}. User Name: ${userName || 'unknown'}. ACTIVE AGENT MODE: ${agentMode || 'omni'}.` }] }];

    const text = await generateSmartContent({
      contents: contents,
      systemInstruction: `${modeInstruction || "You are the Versusfy Supreme Intelligence. You are the overmind of all Scouts."}
      PERSONALITY: Maintain your tactical persona at all times. Always identify yourself clearly in the first response of the session.
      AFFILIATE KNOWLEDGE: You have real-time access to pricing trends for Walmart, Amazon, Home Depot, Lowe's, Best Buy, eBay, CVS, Walgreens, Target, Sephora, and AutoZone. ALWAYS recommend specific products from these stores if applicable to save the user money.
      STRICT DOMAIN FOCUS: Do not engage in casual conversation about topics outside your CRITICAL focus area. If a user asks something unrelated, politely but firmly pivot back to your area or recommend the appropriate Versusfy Scout.
      LANGUAGE: Always respond in the language used by the user. 
      INSTRUCTION: If a mode is active, NEVER mention 'Supreme Intelligence' or 'Omni Assistant'. You ARE the scout.
      Return ONLY JSON: { \"response\": \"...\", \"action\": \"none|compare\", \"suggestions\": [], \"spokenResponse\": \"...\", \"comparisonEntityA\": \"\", \"comparisonEntityB\": \"\", \"detectedUserName\": \"\" }`
    });

    return safeJsonParse(text || '{}', { 
      response: "Encountered a tactical error, dear. I am still here to help you though.", 
      action: "none", 
      suggestions: [],
      spokenResponse: "I am sorry, dear, but I hit a small tactical bump. How else can I assist your savings journey today?",
      comparisonEntityA: "",
      comparisonEntityB: "",
      detectedUserName: ""
    }) as { 
      response: string; 
      action: string; 
      suggestions: string[]; 
      spokenResponse: string; 
      comparisonEntityA?: string; 
      comparisonEntityB?: string;
      detectedUserName?: string;
    };
  } catch (error) {
    console.error("Error in chatWithOmniAssistant:", error);
    return { 
      response: "Encountered a tactical error, dear. I am still here to help you though.", 
      action: "none", 
      suggestions: [],
      spokenResponse: "I am sorry, dear, but I hit a small tactical bump. How else can I assist your savings journey today?"
    };
  }
};
