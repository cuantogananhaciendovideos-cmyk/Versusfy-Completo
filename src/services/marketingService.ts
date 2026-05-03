import { db } from "../lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, increment, orderBy, limit } from "firebase/firestore";

// We now call the server-side proxy instead of the SDK directly in the browser
// to keep the API key secure and avoid initialization errors.
async function callAiProxy(payload: any) {
  const response = await fetch("/api/ai/v2/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "AI Proxy request failed");
  }

  return response.json();
}

export interface MarketingPhrase {
  id?: string;
  text: string;
  type: 'banner' | 'subliminal';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'any';
  createdAt: string;
  clicks: number;
}

export interface Testimonial {
  id?: string;
  name: string;
  text: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  createdAt: string;
}

const PHRASES_COLLECTION = "marketing_phrases";
const TESTIMONIALS_COLLECTION = "testimonials";

const DEFAULT_BANNER_PHRASES = [
  "Win the afternoon with Versusfy",
  "Exclusive Deals & Coupons Just For You",
  "Unlock Best Online Discounts Now",
  "Save Big with Pro Promo Codes",
  "Maximize Savings with Secret Coupons",
  "Shop Smarter, Save More Today",
  "Top-Rated Deals with Premium Coupons",
  "Incredible Offers & Limited-Time Codes",
  "Save More with Online Deal Promos",
  "Latest Deals & Special Coupon Codes",
  "Amazing Discounts & Exclusive Savings"
];

const HOLIDAYS = [
  { name: "New Year's Day", month: 0, day: 1, greeting: "Happy New Year! Start Saving Big", preGreeting: "New Year Approaching! Ready to save?" },
  { name: "MLK Day", month: 0, day: 20, greeting: "Honor Legacy with Community Deals", preGreeting: "MLK Weekend is near! Special local offers coming" },
  { name: "Valentines Day", month: 1, day: 14, greeting: "Happy Valentine's Day! Sweet Deals Inside", preGreeting: "Valentine's is near! Find the perfect gift" },
  { name: "Presidents Day", month: 1, day: 17, greeting: "Presidents' Day Savings are LIVE", preGreeting: "Presidents' Day is coming! Massive tech & home sales" },
  { name: "St. Patricks Day", month: 2, day: 17, greeting: "Happy St. Patrick's Day! Lucky Deals Await", preGreeting: "Get Lucky! St. Paddy's deals are approaching" },
  { name: "Children's Day", month: 3, day: 30, greeting: "Happy Children's Day! Toy & Game Specials", preGreeting: "Children's Day is coming! Special surprises inside" },
  { name: "Easter", month: 3, day: 20, greeting: "Happy Easter! Spring Savings Inside", preGreeting: "Easter is near! Hop into these sweet deals" },
  { name: "Mother's Day", month: 4, day: 10, greeting: "Happy Mother's Day! Perfect Gifts for Her", preGreeting: "Mother's Day is near! Best gifts for Mom in our shops" },
  { name: "Memorial Day", month: 4, day: 26, greeting: "Memorial Day: Honor & Save Today", preGreeting: "Memorial Day Sales start soon! Gear up for Summer" },
  { name: "Juneteenth", month: 5, day: 19, greeting: "Happy Juneteenth! Celebrating Community", preGreeting: "Juneteenth is near! Support local & Save" },
  { name: "Father's Day", month: 5, day: 15, greeting: "Happy Father's Day! Best Tech Deals for Him", preGreeting: "Father's Day is coming! Tech deals for Dad ready" },
  { name: "Independence Day", month: 6, day: 4, greeting: "Happy 4th of July! Explosive Savings", preGreeting: "July 4th is near! Prepare for the Big Bang Deals" },
  { name: "Labor Day", month: 8, day: 1, greeting: "Happy Labor Day! You Worked Hard, Now Save", preGreeting: "Labor Day is coming! Final Summer blowouts" },
  { name: "Columbus Day", month: 9, day: 13, greeting: "Columbus Day: Discover New Deals", preGreeting: "Columbus Day near! Explore new territory in savings" },
  { name: "Halloween", month: 9, day: 31, greeting: "Happy Halloween! Spooky Good Discounts", preGreeting: "Halloween is approaching! Get your spooky deals" },
  { name: "Day of the Dead", month: 10, day: 2, greeting: "Happy Day of the Dead! Exclusive Savings", preGreeting: "Día de Muertos near! Honor tradition with savings" },
  { name: "Veterans Day", month: 10, day: 11, greeting: "Thank You Veterans! Exclusive Hero Deals", preGreeting: "Veterans Day is near! Honoring service with savings" },
  { name: "Thanksgiving", month: 10, day: 27, greeting: "Happy Thanksgiving! Grateful for Your Savings", preGreeting: "Thanksgiving is near! Get your feast ready with deals" },
  { name: "Black Friday", month: 10, day: 28, greeting: "BLACK FRIDAY IS HERE! UNLOCK ALL DEALS", preGreeting: "The Big One is coming! Black Friday prep starts NOW" },
  { name: "Cyber Monday", month: 11, day: 1, greeting: "CYBER MONDAY: Digital Deals UNLEASHED", preGreeting: "Cyber Monday is near! Best online tech prices" },
  { name: "Christmas", month: 11, day: 25, greeting: "Merry Christmas! Festive Finds & Deals", preGreeting: "Christmas is coming! Ultimate gift guide & deals" },
  { name: "New Year's Eve", month: 11, day: 31, greeting: "Happy New Year's Eve! Ring in the Savings", preGreeting: "Last chance to save this year! 2027 is calling" },
];

const DEFAULT_SUBLIMINAL_PHRASES = [
  "I love to Buy from here",
  "I love this Site",
  "I can not be without been here",
  "I love to Buy all kind of products from here",
  "Versusfy is my favorite",
  "Shop here now",
  "Best experience ever",
  "Everything is free here",
  "No login needed"
];

export const generateDailyPhrases = async () => {
  if (!db || (typeof db.collection !== 'function' && !db.type)) {
    console.warn("Marketing: Firestore instance not valid. Skipping phrase generation.");
    return;
  }
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, PHRASES_COLLECTION), where("createdAt", ">=", today));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("Generating new daily content via Gemini SDK...");
      const todayDate = new Date();
      const holiday = HOLIDAYS.find(h => h.month === todayDate.getMonth() && h.day === todayDate.getDate());
      
      // Also check for upcoming holidays
      const upcomingHoliday = HOLIDAYS.find(h => {
        const hDate = new Date(todayDate.getFullYear(), h.month, h.day);
        const diffDays = Math.ceil((hDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 15;
      });

      const prompt = `Generate 3 short, punchy persuasive marketing phrases (max 6 words) for a product comparison site called Versusfy. 
      ${holiday ? `One phrase MUST be a holiday greeting: "${holiday.greeting}".` : ""}
      ${upcomingHoliday ? `One phrase MUST be an upcoming event promotion: "${upcomingHoliday.preGreeting}".` : ""}
      One for morning, one for afternoon, one for evening. 
      Also generate 5 short subliminal phrases that are extremely positive and obsessive about Versusfy.
      Additionally, generate 15 user testimonials (5 for morning, 5 for afternoon, 5 for evening).
      Testimonials should sound like real people (some with names, some 'Anonymous').
      They should praise the site for being free, no login required, and helpful.
      Example: "Excellent page, I loved it and it's totally free to use and doesn't even ask you to log in, that's why I loved it."
      Testimonials MUST be in English.
      Return as a JSON object with:
      - 'banner': array of 3 {text, timeOfDay}
      - 'subliminal': array of 5 strings
      - 'testimonials': array of 15 {name, text, timeOfDay}`;

      const response = await callAiProxy({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              banner: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    timeOfDay: { type: "string", enum: ["morning", "afternoon", "evening"] }
                  }
                }
              },
              subliminal: {
                type: "array",
                items: { type: "string" }
              },
              testimonials: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    text: { type: "string" },
                    timeOfDay: { type: "string", enum: ["morning", "afternoon", "evening"] }
                  }
                }
              }
            }
          }
        }
      });

      const text = response.text || '{}';
      const cleanJson = text.replace(/```json\n?|```/g, '').trim();
      const data = JSON.parse(cleanJson);
      
      // Save to Firestore
      const batch: Promise<any>[] = [];
      if (data.banner) {
        data.banner.forEach((p: any) => {
          batch.push(addDoc(collection(db, PHRASES_COLLECTION), {
            ...p,
            type: 'banner',
            createdAt: new Date().toISOString(),
            clicks: 0
          }));
        });
      }
      if (data.subliminal) {
        data.subliminal.forEach((text: string) => {
          batch.push(addDoc(collection(db, PHRASES_COLLECTION), {
            text,
            type: 'subliminal',
            timeOfDay: 'any',
            createdAt: new Date().toISOString(),
            clicks: 0
          }));
        });
      }
      if (data.testimonials) {
        data.testimonials.forEach((t: any) => {
          batch.push(addDoc(collection(db, TESTIMONIALS_COLLECTION), {
            ...t,
            createdAt: new Date().toISOString()
          }));
        });
      }
      await Promise.all(batch);
    }
  } catch (error) {
    console.error("Error generating phrases:", error);
  }
};

export const getCurrentBannerPhrase = async (): Promise<MarketingPhrase | null> => {
  const now = new Date();
  const hour = now.getHours();
  let timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning';
  if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
  else if (hour >= 18 || hour < 6) timeOfDay = 'evening';

  // Priority 1: Holiday Check
  const holiday = HOLIDAYS.find(h => h.month === now.getMonth() && h.day === now.getDate());
  if (holiday) {
    return {
      text: holiday.greeting,
      type: 'banner',
      timeOfDay,
      createdAt: now.toISOString(),
      clicks: 0
    };
  }

  // Priority 2: Upcoming Holiday Check (7 days before)
  const upcomingHoliday = HOLIDAYS.find(h => {
    const hDate = new Date(now.getFullYear(), h.month, h.day);
    const diffDays = Math.ceil((hDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 15;
  });

  if (upcomingHoliday) {
    return {
      text: upcomingHoliday.preGreeting,
      type: 'banner',
      timeOfDay,
      createdAt: now.toISOString(),
      clicks: 0
    };
  }

  try {
    if (!db || (typeof db.collection !== 'function' && !db.type)) throw new Error("Firebase not initialized");
    // Try to get the best performing phrase for this time of day first
    const qBest = query(
      collection(db, PHRASES_COLLECTION),
      where("type", "==", "banner"),
      where("timeOfDay", "==", timeOfDay),
      orderBy("clicks", "desc"),
      limit(1)
    );
    
    const snapshot = await getDocs(qBest);
    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data();
      return { id: snapshot.docs[0].id, ...docData } as MarketingPhrase;
    }

    // Fallback to simple query
    const qSimple = query(
      collection(db, PHRASES_COLLECTION),
      where("type", "==", "banner"),
      where("timeOfDay", "==", timeOfDay),
      limit(5)
    );
    const snapshotSimple = await getDocs(qSimple);
    if (!snapshotSimple.empty) {
      const randomIndex = Math.floor(Math.random() * snapshotSimple.docs.length);
      const docData = snapshotSimple.docs[randomIndex].data();
      return { id: snapshotSimple.docs[randomIndex].id, ...docData } as MarketingPhrase;
    }
  } catch (e) {
    console.warn("Firestore query failed, using hardcoded fallback:", e);
  }

  // Final hardcoded fallback
  return {
    text: DEFAULT_BANNER_PHRASES[Math.floor(Math.random() * DEFAULT_BANNER_PHRASES.length)],
    type: 'banner',
    timeOfDay,
    createdAt: new Date().toISOString(),
    clicks: 0
  };
};

export const getSubliminalPhrases = async (): Promise<MarketingPhrase[]> => {
  try {
    if (!db || (typeof db.collection !== 'function' && !db.type)) throw new Error("Firebase not initialized");
    const q = query(collection(db, PHRASES_COLLECTION), where("type", "==", "subliminal"));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MarketingPhrase));
    }
  } catch (e) {
    console.warn("Firestore subliminal query failed, using hardcoded fallback:", e);
  }

  return DEFAULT_SUBLIMINAL_PHRASES.map(text => ({
    text,
    type: 'subliminal',
    timeOfDay: 'any',
    createdAt: new Date().toISOString(),
    clicks: 0
  }));
};

export const trackClick = async (phraseId: string) => {
  if (!db || (typeof db.collection !== 'function' && !db.type)) return;
  const docRef = doc(db, PHRASES_COLLECTION, phraseId);
  await updateDoc(docRef, {
    clicks: increment(1)
  });
};

export const getDailyTestimonials = async (): Promise<Testimonial[]> => {
  const hour = new Date().getHours();
  let timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning';
  if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
  else if (hour >= 18 || hour < 6) timeOfDay = 'evening';

  try {
    if (!db || (typeof db.collection !== 'function' && !db.type)) throw new Error("Firebase not initialized");
    const q = query(
      collection(db, TESTIMONIALS_COLLECTION),
      where("timeOfDay", "==", timeOfDay),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial));
    }
  } catch (e) {
    console.warn("Firestore testimonials query failed:", e);
  }

  return [
    { name: "Anonymous", text: "Excellent page, I loved it and it's totally free to use!", timeOfDay, createdAt: new Date().toISOString() },
    { name: "John D.", text: "No login required, just perfect for quick comparisons.", timeOfDay, createdAt: new Date().toISOString() },
    { name: "Sarah M.", text: "Best deals I've found so far, highly recommended.", timeOfDay, createdAt: new Date().toISOString() },
    { name: "Anonymous", text: "So easy to use and completely free. Amazing!", timeOfDay, createdAt: new Date().toISOString() },
    { name: "Mike R.", text: "Versusfy is my go-to for shopping now.", timeOfDay, createdAt: new Date().toISOString() }
  ];
};
