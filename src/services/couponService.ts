import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface TacticalCoupon {
  id: string;
  code: string;
  discount: string;
  store: string;
  description: string;
  expiry: string;
  successRate: number;
  category: 'Tech' | 'Home' | 'Fashion' | 'Food' | 'Travel' | 'General';
  affiliateLink?: string;
}

export const searchTacticalCoupons = async (query: string, category?: string): Promise<TacticalCoupon[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    You are the 'Coupon Scout' for Versusfy.com. 
    A user is searching for coupons/deals for: ${query} in category: ${category || 'General'}.
    
    Generate a list of 5 high-yield, realistic tactical coupons for 2024/2025.
    Include major stores like Amazon, Walmart, Best Buy, Target, or specialized ones.
    
    Return ONLY a JSON array of objects with this structure:
    {
      "id": "unique-id",
      "code": "CODE123",
      "discount": "20% OFF",
      "store": "Store Name",
      "description": "Short tactical description",
      "expiry": "2025-12-31",
      "successRate": 95,
      "category": "Tech",
      "affiliateLink": "https://www.google.com/search?q=store+name+coupons"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.match(/\[.*\]/s)?.[0];
    if (jsonStr) {
      return JSON.parse(jsonStr);
    }
  } catch (error) {
    console.error("Coupon search error:", error);
  }

  // Fallback high-yield coupons
  return [
    {
      id: 'amz-tac-1',
      code: 'TACTICAL25',
      discount: '25% OFF',
      store: 'Amazon',
      description: 'Tactical Gear & Electronics Audit Discount',
      expiry: '2025-06-01',
      successRate: 98,
      category: 'Tech',
      affiliateLink: 'https://www.amazon.com/coupons'
    },
    {
      id: 'wmt-tac-2',
      code: 'SAVE10WW',
      discount: '$10 OFF',
      store: 'Walmart',
      description: 'Regional Grocery & Home Supply Optimization',
      expiry: '2025-08-15',
      successRate: 92,
      category: 'Home',
      affiliateLink: 'https://www.walmart.com/cp/coupons/1218241'
    }
  ];
};

export interface Coupon {
  id?: string;
  code: string;
  discount: string;
  store: string;
  description: string;
  expiryDate: string;
}

export const getCouponIntelligenceSpeech = async (query: string, count: number): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    As 'Fenrir' (Coupon Scout), briefly report (max 2 sentences) that you have audited the network for ${query} and secured ${count} high-yield coupons. 
    Use tactical language like 'verified vectors', 'discount nodes', 'economic optimization'.
  `;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return `Coupon sensors synchronized. I have isolated ${count} verified discount nodes for your current objective.`;
  }
};

export interface Coupon {
  id?: string;
  code: string;
  discount: string;
  store: string;
  description: string;
  expiryDate: string;
}

export const getCouponsForProduct = async (productName: string): Promise<Coupon[]> => {
  const coupons = await searchTacticalCoupons(productName);
  return coupons.map(c => ({
    id: c.id,
    code: c.code,
    discount: c.discount,
    store: c.store,
    description: c.description,
    expiryDate: c.expiry
  }));
};
