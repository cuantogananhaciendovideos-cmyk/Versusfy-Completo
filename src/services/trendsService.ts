import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { generateSmartContent } from "./geminiService";

export interface TrendingComparison {
  id: string;
  title: string;
  category: string;
  productA: string;
  productB: string;
  description: string;
  marqueeText: string;
}

/**
 * Fetches or generates the "Trending Comparison of the Week"
 * Goal: SEO Aggressive content and user engagement.
 */
export const getTrendingComparisons = async (): Promise<TrendingComparison[]> => {
  if (!db) {
    console.warn("Versusfy: Firebase DB not initialized. Using fallbacks.");
    return getDefaultTrends();
  }
  const weekId = new Date().toISOString().split('T')[0].slice(0, 7); // YYYY-MM
  const docRef = doc(db, "meta", `trends_${weekId}`);
  
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().comparisons;
    }
  } catch (e) {
    console.warn("Trends fetch error, generating fresh data:", e);
  }

  // Generate 2 fresh comparisons based on current trends
  try {
    const prompt = `Generate 2 trending product comparisons for this week. 
    Focus on tech, appliances, or lifestyle. 
    Category should be one of (A-Z list: Tech, Home, Kitchen, Outdoor, Office, etc).
    Return a JSON array of 2 objects:
    {
      "id": "unique-id",
      "title": "Short title",
      "category": "Category",
      "productA": "Product A",
      "productB": "Product B",
      "description": "Brief SEO description",
      "marqueeText": "RED LED STYLE TEXT: COMPARISON OF THE WEEK: X VS Y - VOTE NOW!"
    }`;

    const response = await generateSmartContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      systemInstruction: "You are a trends analyst for Versusfy. Generate SEO-optimized trending comparisons."
    });

    const cleanText = (response || '[]').replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const comparisons = JSON.parse(cleanText);

    // Save to cache
    await setDoc(docRef, { comparisons, generatedAt: new Date().toISOString() });
    
    return comparisons;
  } catch (err) {
    console.error("Gemini Trends Error:", err);
    return getDefaultTrends();
  }
};

const getDefaultTrends = (): TrendingComparison[] => [
  {
    id: 'default-1',
    title: 'iPhone 15 Pro vs S24 Ultra',
    category: 'Tech',
    productA: 'iPhone 15 Pro',
    productB: 'Samsung S24 Ultra',
    description: 'The ultimate smartphone showdown.',
    marqueeText: 'TRENDING: IPHONE 15 PRO VS S24 ULTRA - WHO WINS THE CAMERA WAR?'
  },
  {
    id: 'default-2',
    title: 'MacBook M3 vs XPS 13Plus',
    category: 'Laptops',
    productA: 'MacBook Air M3',
    productB: 'Dell XPS 13 Plus',
    description: 'Elite portability analysis.',
    marqueeText: 'LAPTOP BATTLE: APPLE M3 VS DELL XPS - SILICON SUPREMACY?'
  }
];

export const voteTrending = async (
  comparisonId: string, 
  type: 'like' | 'star' | 'dislike', 
  side?: 'productA' | 'productB',
  value: number = 1
) => {
  if (!db) {
    console.warn("Versusfy: Cannot vote, Firebase not ready.");
    return;
  }
  const docRef = doc(db, "trending_votes", comparisonId);
  const snap = await getDoc(docRef);
  
  const sidePrefix = side ? `${side}_` : '';
  
  if (!snap.exists()) {
    const initialData: any = {
      totalVotes: 1,
    };
    
    if (type === 'like') initialData[`${sidePrefix}likes`] = 1;
    if (type === 'dislike') initialData[`${sidePrefix}dislikes`] = 1;
    if (type === 'star') {
      initialData[`${sidePrefix}stars`] = value;
      initialData[`${sidePrefix}ratingCount`] = 1;
      initialData[`${sidePrefix}averageRating`] = value;
    }
    
    await setDoc(docRef, initialData);
  } else {
    const data = snap.data();
    const updates: any = { totalVotes: increment(1) };
    
    if (type === 'like') {
      updates[`${sidePrefix}likes`] = increment(1);
    } else if (type === 'dislike') {
      updates[`${sidePrefix}dislikes`] = increment(1);
    } else if (type === 'star') {
      const currentStars = data[`${sidePrefix}stars`] || 0;
      const currentCount = data[`${sidePrefix}ratingCount`] || 0;
      const newTotalStars = currentStars + value;
      const newTotalCount = currentCount + 1;
      
      updates[`${sidePrefix}stars`] = newTotalStars;
      updates[`${sidePrefix}ratingCount`] = newTotalCount;
      updates[`${sidePrefix}averageRating`] = newTotalStars / newTotalCount;
    }
    
    await updateDoc(docRef, updates);
  }
};
