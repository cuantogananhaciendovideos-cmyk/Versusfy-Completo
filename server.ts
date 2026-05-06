// Versusfy Server - v2.2.0-OMNI (Tactical Release)
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// TACTICAL NODEMAILER FIX
const createTransporter = (options: any) => {
    // Some versions of nodemailer in ESM need special handling
    const fn = (nodemailer as any).createTransport || nodemailer;
    if (typeof fn !== 'function') throw new Error("Could not find createTransport in nodemailer.");
    return (nodemailer as any).createTransport(options);
};

dotenv.config();

// Critical Environment Snapshot
const envKeys = Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('GEMINI'));
fs.writeFileSync(path.join(process.cwd(), 'env_snapshot.log'), `KEYS: ${envKeys.join(', ')}\nTS: ${new Date().toISOString()}`);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load local config as default source of truth
let localFirebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    localFirebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log(`Versusfy: Loaded local configuration.`);
  }
} catch (e) {
  console.warn("Versusfy: No local config fallback available.");
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API HEALTH CHECK
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "alive", 
      version: "2.2.0-OMNI",
      time: new Date().toISOString(),
      keys_detected: [
        process.env.GEMINI_API_KEY ? 'YES' : 'NO',
        process.env.VITE_GEMINI_API_KEY ? 'YES' : 'NO',
        process.env.NEW_GEMINI_API_KEY ? 'YES' : 'NO'
      ]
    });
  });

  // TEST ENDPOINT FOR AI
  app.get("/api/ai/test", async (req, res) => {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "No key found in env" });
    
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }, { apiVersion: 'v1beta' });
      const response = await model.generateContent("Hello, are you alive?");
      res.json({ success: true, text: response.response.text() });
    } catch (e: any) {
      res.status(500).json({ error: e.message, stack: e.stack });
    }
  });

  // API: AI Proxy for marketing generation (PRIORITY 1) - v2 to bypass cache
  app.post("/api/ai/v2/generate", async (req: any, res: any) => {
    const { model: clientModel, contents, config } = req.body;
    
    console.log(`[AI PROXY V2] >>> NEW REQUEST RECEIVED <<<`);
    console.log(`[AI PROXY V2] Client requested: ${clientModel}`);

    // OBTENCIÓN DE LLAVES (v8.0 - Official SDK Migration)
    const sources = [
      { name: 'GEMINI_API_KEY', val: process.env.GEMINI_API_KEY },
      { name: 'NEW_GEMINI_API_KEY', val: process.env.NEW_GEMINI_API_KEY },
      { name: 'GEMINI_API_KEY_NEW', val: process.env.GEMINI_API_KEY_NEW },
      { name: 'GEMINI_API_KEY_RESERVE', val: process.env.GEMINI_API_KEY_RESERVE },
      { name: 'CLAVE_GEMINI_API_KEY', val: process.env.CLAVE_GEMINI_API_KEY },
      { name: 'VITE_GEMINI_API_KEY', val: process.env.VITE_GEMINI_API_KEY }
    ];

    const validKeys = sources
      .map(s => {
        let raw = s.val?.toString().trim() || "";
        const match = raw.match(/AIza[A-Za-z0-9\-_]{30,60}/);
        return { name: s.name, key: match ? match[0] : null };
      })
      .filter(s => s.key);

    if (validKeys.length === 0) {
      console.error(`[AI PROXY] NO VALID KEYS FOUND IN ENV.`);
      return res.status(500).json({ 
        error: "NO_KEYS",
        message: "❌ ERROR: No hay llaves configuradas. Por favor, revisa los Settings del Applet."
      });
    }

    let lastError: any = null;

    // MODELS TO TRY FOR THIS KEY (v14.0 - Specialized TTS Priority)
    const isAudioReq = config?.responseModalities?.includes('audio') || 
                       config?.responseModalities?.includes('AUDIO') || 
                       (Array.isArray(config?.responseModalities) && config.responseModalities.some((m: any) => String(m).toLowerCase() === 'audio'));

    for (const keyObj of validKeys) {
      const apiKey = keyObj.key!;
      const sourceName = keyObj.name;
      
      const modelsToTry = isAudioReq 
        ? ["gemini-3.1-flash-tts-preview", "gemini-flash-latest"] 
        : ["gemini-3-flash-preview", "gemini-3.1-pro-preview", "gemini-flash-latest"];

      let skipToNextKey = false;
      for (const modelToUse of modelsToTry) {
        if (skipToNextKey) break;
        
        let retryCount = 0;
        const maxRetries = 1; // Faster fallback
        
        while (retryCount <= maxRetries) {
          try {
            // Priority: v1beta for features, v1 for stability discovery
            const versions = isAudioReq ? ['v1beta'] : ['v1beta', 'v1'];
            let finalData: any = null;
            let success = false;
            let lastTrialError: any = null;
            for (const apiVersion of versions) {
              try {
                const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelToUse}:generateContent?key=${apiKey}`;

                // Determine casing based on version
                const isV1 = apiVersion === 'v1';
                
                // Construct parameters
                const temperature = config?.temperature || 0.7;
                const topP = config?.topP || 0.95;
                const topK = config?.topK || 40;
                const maxTokens = config?.maxOutputTokens || 1024; // Smaller for speed

                const generationConfig: any = {
                  temperature,
                  [isV1 ? 'topP' : 'top_p']: topP,
                  [isV1 ? 'topK' : 'top_k']: topK,
                  [isV1 ? 'maxOutputTokens' : 'max_output_tokens']: maxTokens,
                };

                if (isAudioReq) {
                  generationConfig.response_modalities = ["AUDIO"];
                  generationConfig.speech_config = {
                    voice_config: { 
                      prebuilt_voice_config: { 
                        voice_name: (config?.speechConfig?.voiceConfig?.prebuiltVoiceConfig?.voiceName || 'Aoide') 
                      } 
                    }
                  };
                } else if (config?.responseMimeType) {
                  generationConfig[isV1 ? 'responseMimeType' : 'response_mime_type'] = config.responseMimeType;
                }

                const formattedContents = Array.isArray(contents) ? contents.map((c: any) => {
                  if (typeof c === 'string') return { role: 'user', parts: [{ text: c }] };
                  if (c.parts && !c.role) return { role: 'user', parts: c.parts };
                  return c;
                }) : (typeof contents === 'string' ? [{ role: 'user', parts: [{ text: contents }] }] : 
                     (contents?.parts && !contents?.role ? [{ role: 'user', parts: contents.parts }] : [contents]));

                const body: any = {
                  contents: formattedContents,
                  generationConfig,
                };

                if (config?.systemInstruction) {
                  body[isV1 ? 'systemInstruction' : 'system_instruction'] = { parts: [{ text: config.systemInstruction }] };
                }

                const response = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body)
                });

                if (!response.ok) {
                  const errStatus = response.status;
                  // If quota or auth, skip this key entirely
                  if (errStatus === 429 || errStatus === 403) {
                     skipToNextKey = true;
                     break;
                  }
                  continue; 
                }

                const responseText = await response.text();
                finalData = JSON.parse(responseText);
                
                if (finalData.error) {
                   if (finalData.error.code === 429) { skipToNextKey = true; break; }
                   continue;
                }

                success = true;
                break; 
              } catch (trialErr: any) {
                continue;
              }
            }

          if (skipToNextKey) break;
          if (!success) throw new Error(`Model ${modelToUse} failed version check`);



          const resText = finalData.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text || "";
          const result: any = {
            text: resText,
            modelUsed: modelToUse,
            source: sourceName
          };

          // Audio Extraction (handle both camelCase and snake_case)
          const candidates = finalData.candidates || [];
          const candidateParts = candidates[0]?.content?.parts || [];
          const audioPart = candidateParts.find((p: any) => 
            (p.inlineData && p.inlineData.mimeType?.includes('audio')) || 
            (p.inline_data && p.inline_data.mime_type?.includes('audio'))
          );
          
          if (audioPart) {
            const data = audioPart.inlineData || audioPart.inline_data;
            result.audio = data.data;
            result.audioMimeType = data.mimeType || data.mime_type;
            const prefix = result.audio.substring(0, 20);
            console.log(`[AI PROXY V2] SUCCESS: Audio captured (${result.audio ? result.audio.length : 0} bytes, type: ${result.audioMimeType}, prefix: ${prefix}) using ${modelToUse}`);
          }
          
            if (isAudioReq && !result.audio) {
              console.warn(`[AI PROXY V2] Model ${modelToUse} returned success but no audio data. Next...`);
              continue;
            }

            console.log(`[AI PROXY V2] FINAL SUCCESS: ${sourceName} | Model: ${modelToUse}${retryCount > 0 ? ` (after ${retryCount} retries)` : ''}`);
            return res.json(result);

          } catch (error: any) {
          lastError = error;
          const msg = error.message || String(error);
          
          // Retry on transient errors (500, 503)
          if ((msg.includes('500') || msg.includes('503')) && retryCount < maxRetries) {
            retryCount++;
            const backoff = 500 * Math.pow(2, retryCount) + (Math.random() * 500);
            console.warn(`[AI PROXY V2] Transient error (HTTP 500/503) on ${modelToUse}. Retrying ${retryCount}/${maxRetries} after ${Math.round(backoff)}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            continue;
          }

          console.warn(`[AI PROXY V2] Sub-trial failed: ${sourceName} | Model: ${modelToUse} | Error: ${msg.substring(0, 150)}`);
          
          if (msg.includes('404') || msg.includes('not found') || msg.includes('501') || (msg.includes('400') && msg.includes('modality'))) {
             break; // Next model
          }
          
          if (msg.includes('429') || msg.includes('403') || msg.includes('permission')) {
             skipToNextKey = true;
             break; // Next key
          }
          
          break; // Next model for other errors
        }
      } // End of retry loop
    } // End of model loop

    } // End of key loop

    // Final failure
    const finalMsg = lastError?.message || String(lastError);
    
    // TACTICAL FALLBACK: If audio failed, try one last text-only request to ensure a response
    if (isAudioReq) {
        console.warn(`[AI PROXY] Audio failed for all keys. Attempting emergency text-only fallback...`);
        try {
            const fallbackBody = {
               contents: Array.isArray(contents) ? contents : [{ role: 'user', parts: [{ text: typeof contents === 'string' ? contents : JSON.stringify(contents) }] }],
               generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            };
            const fallbackRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${validKeys[0].key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fallbackBody)
            });
            if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                const fallbackText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, my voice systems are under high demand. Looking at the data...";
                console.log(`[AI PROXY] Emergency text fallback successful.`);
                return res.json({ text: fallbackText, modelUsed: "gemini-3-flash-preview", source: validKeys[0].name, isFallback: true });
            }
        } catch (fallbackErr) {
            console.error(`[AI PROXY] Emergency fallback also failed.`);
        }
    }

    console.error(`[AI PROXY] All keys failed. Last error: ${finalMsg}`);
    res.status(lastError?.status || 500).json({ 
      error: "AI_PROXY_TOTAL_FAILURE", 
      message: "Todas las llaves fallaron. " + finalMsg,
      details: finalMsg
    });
  });

  // TACTICAL SECURITY: Force HTTPS and Trust Proxy
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.get("host")}${req.url}`);
    }
    next();
  });

  // API: Email via Gmail (Nodemailer)
  app.post("/api/notify/email", async (req, res) => {
    const { to, subject, text, html } = req.body;
    
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.error("Versusfy: Gmail credentials missing.");
      return res.status(500).json({ error: "Email service not configured (GMAIL_USER/GMAIL_APP_PASSWORD missing)." });
    }

    try {
      const transporter = createTransporter({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });

      await transporter.sendMail({
        from: `"Versusfy Alerts" <${user}>`,
        to,
        subject,
        text,
        html
      });

      console.log(`Versusfy: Notification email sent to ${to}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Notification Nodemailer Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // In-memory rate limiting and simple spam detection
  const contactRateLimits = new Map<string, { count: number, lastReset: number }>();
  const SPAM_KEYWORDS = ['crypto', 'bitcoin', 'viagra', 'casino', 'lottery', 'inheritance', 'win money', 'porn', 'sex', 'dating', 'hack', 'click here', 'buy now'];

  // API: Contact Form Helper
  app.post("/api/contact", async (req, res) => {
    const { email, message, _hp } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipKey = String(clientIp);

    // 1. HONEYPOT CHECK
    if (_hp && _hp.length > 0) {
      console.warn(`SECURITY: Bot detected (Honeypot filled) from ${ipKey}`);
      return res.status(403).json({ error: "Spam detected (HP)." });
    }

    // 2. RATE LIMIT CHECK (3 messages per 15 mins)
    const now = Date.now();
    const limit = contactRateLimits.get(ipKey) || { count: 0, lastReset: now };
    if (now - limit.lastReset > 15 * 60 * 1000) {
      limit.count = 0;
      limit.lastReset = now;
    }
    
    // Explicitly allow ADMIN email if provided in env to bypass rate limits during testing
    const isAdmin = email && process.env.GMAIL_USER && email.toLowerCase() === process.env.GMAIL_USER.toLowerCase();
    
    if (limit.count >= 3 && !isAdmin) {
      console.warn(`SECURITY: Rate limit exceeded for ${ipKey}`);
      return res.status(429).json({ error: "Too many messages. Please wait 15 minutes." });
    }

    // 3. CONTENT FILTERING
    const lowerMessage = message.toLowerCase();
    const hasSpamKeyword = SPAM_KEYWORDS.some(kw => lowerMessage.includes(kw));
    const linkCount = (message.match(/http/gi) || []).length;

    if ((hasSpamKeyword || linkCount > 2) && !isAdmin) {
      console.warn(`SECURITY: Spam content detected from ${ipKey}`);
      return res.status(403).json({ error: "Message looks like spam (keyword/links)." });
    }

    const user = process.env.GMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn("Versusfy: Contact form active but GMAIL/SMTP credentials missing.");
      return res.status(500).json({ error: "Contact service currently unavailable (Credentials Missing)." });
    }

    try {
      console.log(`Versusfy: Attempting to send tactical email for ${email} using ${user}...`);
      const transporter = createTransporter({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // use TLS
        auth: { user: user.trim(), pass: pass.trim() },
        family: 4, // Force IPv4 to avoid ENETUNREACH issues
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection immediately
      await transporter.verify().catch((err: any) => {
        console.error("Nodemailer Verification failed:", err);
        throw new Error(`SMTP Verification failed: ${err.message}. Check if GMAIL_APP_PASSWORD is a 16-character code.`);
      });

      await transporter.sendMail({
        from: `"Versusfy Support" <${user}>`,
        to: user, // Send to self
        replyTo: email,
        subject: `[Versusfy Support] Message from ${email}`,
        text: `Message: ${message}\nFrom: ${email}`
      });

      // Increment limit on success
      limit.count++;
      contactRateLimits.set(ipKey, limit);

      console.log(`✅ Versusfy: Contact message successfully routed.`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Tactical Nodemailer Error:", error);
      res.status(500).json({ error: error.message || "Failed to route message." });
    }
  });

  // API Retailer Proxy (Dynamic)
  const retailers = ['amazon', 'walmart', 'ebay', 'homedepot', 'bestbuy', 'officedepot', 'toysrus', 'walgreens', 'cvs', 'autozone', 'pepboys', 'advanceauto', 'oreilly', 'guitarcenter', 'sweetwater', 'musiciansfriend', 'samash'];
  retailers.forEach(retailer => {
    app.post(`/api/${retailer}`, (req, res) => {
      const { keywords } = req.body;
      console.log(`Versusfy: Searching ${retailer} for "${keywords}"`);
      
      let customUrl = `https://www.${retailer === 'officedepot' ? 'officedepot.com' : retailer === 'toysrus' ? 'toysrus.com' : retailer === 'musiciansfriend' ? 'musiciansfriend.com' : `${retailer}.com`}/search?q=${encodeURIComponent(keywords)}`;
      
      // Mocked response for now (to be replaced with actual Affiliate API logic)
      res.json({
        retailer,
        productName: keywords,
        price: (Math.random() * 500 + 50).toFixed(2),
        currency: 'USD',
        url: customUrl,
        available: true,
        logo: `https://logo.clearbit.com/${retailer === 'officedepot' ? 'officedepot.com' : retailer === 'toysrus' ? 'toysrus.com' : retailer === 'musiciansfriend' ? 'musiciansfriend.com' : `${retailer}.com`}`
      });
    });
  });

  // Shared Runtime Config Generator
  const getRuntimeConfig = (req: any) => {
    const getVal = (key: string) => {
        const viteKey = `VITE_${key}`;
        const baseKey = key.replace('FIREBASE_', '');
        const parts = baseKey.toLowerCase().split('_');
        const camelKey = parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        
        const envVal = process.env[viteKey] || process.env[key];
        const configVal = (localFirebaseConfig as any)[camelKey] || 
                          (localFirebaseConfig as any)[`firestore${camelKey.charAt(0).toUpperCase()}${camelKey.slice(1)}`] ||
                          (localFirebaseConfig as any)[key] || 
                          (localFirebaseConfig as any)[key.toLowerCase()];

        // If environment has generic placeholders, but config has a real value, prefer config
        if (key.includes('PROJECT_ID') && envVal?.startsWith('gen-lang-client-') && configVal) {
          return configVal;
        }
        if (key.includes('DATABASE_ID') && (envVal === 'default' || envVal === '(default)') && configVal && configVal !== '(default)' && configVal !== 'default') {
          return configVal;
        }

        return envVal || configVal;
    };

    const firebaseConfig: any = {
      apiKey: getVal('FIREBASE_API_KEY'),
      authDomain: getVal('FIREBASE_AUTH_DOMAIN'),
      projectId: getVal('FIREBASE_PROJECT_ID'),
      storageBucket: getVal('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getVal('FIREBASE_MESSAGING_SENDER_ID'),
      appId: getVal('FIREBASE_APP_ID'),
      measurementId: getVal('FIREBASE_MEASUREMENT_ID'),
      databaseId: getVal('FIREBASE_DATABASE_ID') || (localFirebaseConfig as any).firestoreDatabaseId || 'ai-studio-f0c1260c-872e-4bbe-ba1c-fdb9dc1d1205',
      geminiApiKey: process.env.GEMINI_API_KEY ? 'HIDDEN_PRESENT' : 'MISSING',
      gmailStatus: (process.env.GMAIL_USER || process.env.SMTP_USER) ? 'READY' : 'MISSING',
      detectedKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('GMAIL') || k.includes('SMTP')),
      serverVersion: "2.2.0-OMNI",
      environment: process.env.NODE_ENV || 'development'
    };

    console.log(`Versusfy OMNI-Diagnostics: PID: ${firebaseConfig.projectId}, DB: ${firebaseConfig.databaseId}, GMAIL: ${firebaseConfig.gmailStatus}`);
    
    return {
      ...firebaseConfig,
      detectedCity: (() => {
        const match = req.originalUrl.match(/\/best-deals-in-([a-z-]+)/i);
        return match ? match[1].split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
      })(),
      heroName: (() => {
        const match = req.originalUrl.match(/\/hero-status\/([a-z-]+)/i);
        return match ? match[1].split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
      })(),
      autoCompare: (() => {
        const match = req.originalUrl.match(/\/compare\/(.+)-vs-(.+)/i);
        return match ? { a: match[1].replace(/-/g, ' '), b: match[2].replace(/-/g, ' ') } : null;
      })()
    };
  };

  // SEO Injection Engine (MEG-SEO AGGRESSIVE SHIELD)
  const injectSEO = (html: string, url: string) => {
    let title = "Versusfy | Global Tactical Intelligence Network for Savings & Market Dominance";
    let description = "Versusfy is the ultimate AI-powered system for extreme savings. Featuring specialized Scouts for Coupons, Jobs, Style, Mechanics, Pathfinder GPS, and Energy Optimization. Compare Amazon, Walmart, and eBay with precision AI audits.";
    let keywords = "AI savings, product comparison, tactical coupons, Versusfy, Pathfinder GPS, Job Scout, Style Scout, price tracker, Walmart vs Amazon, Best Buy deals, extreme savings network";
    let jsonLd = "";

    // Default Home SEO (Extensive as requested)
    if (url === '/' || url === '') {
      description = "Versusfy: The world's most advanced AI Tactical Intelligence Network. Secure extreme savings with Omni-Assistant (Supreme Command), Coupon Scout (high-yield discount auditor), Pathfinder Intelligence (traffic & GPS), Style Scout (personal aesthetics), and Fuel Scout. Audit Amazon, Walmart, eBay, and Best Buy in real-time. Join the global movement of Savings Heroes and dominate the marketplace with tactical price alerts and precision spec battles.";
    }

    // Pattern: /best-deals-in-[city]
    const dealMatch = url.match(/\/best-deals-in-([a-z-]+)/i);
    if (dealMatch) {
      const city = dealMatch[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      title = `Best Local Product Deals in ${city} | Versusfy AI Tactical Savings`;
      description = `Unlock hidden coupons and exclusive retail nodes in ${city}. Versusfy's AI monitors Walmart, Amazon, and local hubs to save you a fortune in ${city}. Tactical GPS Pathfinder and localized fuel audits active.`;
      keywords += `, deals in ${city}, savings in ${city}, local coupons ${city}`;
      jsonLd = `
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Versusfy ${city}",
          "description": "Premium AI price comparison and coupon hunting for residents of ${city}.",
          "url": "https://versusfy.com${url}",
          "areaServed": "${city}",
          "priceRange": "$",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "${city}",
            "addressRegion": "USA"
          }
        }
        </script>
      `;
    }

    // Pattern: /compare/[p1]-vs-[p2]
    const compareMatch = url.match(/\/compare\/(.+)-vs-(.+)/i);
    if (compareMatch) {
      const p1 = compareMatch[1].replace(/-/g, ' ').toUpperCase();
      const p2 = compareMatch[2].replace(/-/g, ' ').toUpperCase();
      title = `${p1} vs ${p2}: Tactical AI Battle & Lowest Price Audit`;
      description = `Strategic spec battle: ${p1} vs ${p2}. See the Omni-Assistant verdict, technical precision reports, and secure high-yield coupons for both products. Don't pay more for ${p1} or ${p2}.`;
      keywords += `, ${p1} vs ${p2}, compare ${p1} ${p2}, ${p1} reviews, ${p2} reviews`;
      jsonLd = `
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "ComparisonPage",
          "mainEntity": {
            "@type": "Product",
            "name": "${p1} vs ${p2} Comparison"
          },
          "description": "Versusfy tactical AI comparison for ${p1} and ${p2}."
        }
        </script>
      `;
    }

    return html
      .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
      .replace(/<meta name="keywords" content=".*?" \/>/, `<meta name="keywords" content="${keywords}" />`)
      .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
      .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
      .replace('<!-- SEO_INJECTION_POINT -->', jsonLd);
  };

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Inject SEO and config into dev server
    app.use(async (req, res, next) => {
      if (req.url === '/' || req.url.startsWith('/compare/') || req.url.startsWith('/best-deals-in-') || req.url.startsWith('/hero-status/')) {
        try {
          let html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
          html = await vite.transformIndexHtml(req.url, html);
          
          const runtimeConfig = getRuntimeConfig(req);
          html = injectSEO(html, req.url);
          
          const configScript = `<script>window.VERSUSFY_RUNTIME_CONFIG = ${JSON.stringify(runtimeConfig)};</script>`;
          html = html.replace('</head>', `${configScript}</head>`);
          
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
          return;
        } catch (e) {
          next(e);
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', (req, res) => {
      try {
        let html = fs.readFileSync(indexPath, 'utf-8');
        const runtimeConfig = getRuntimeConfig(req);
        
        // Inject SEO Metadata based on URL path
        html = injectSEO(html, req.url);

        const configScript = `<script>window.VERSUSFY_RUNTIME_CONFIG = ${JSON.stringify(runtimeConfig)};</script>`;
        html = html.replace('</head>', `${configScript}</head>`);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } catch (err) {
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(parseInt(PORT as string), "0.0.0.0", () => {
    console.log(`Versusfy Server v2.2.0-OMNI running on https://localhost:${PORT}`);
    
    // Tactical Environment Check
    const check = (key: string) => (process.env[key] || process.env[`VITE_${key}`]) ? '✅ PRESENT' : '❌ MISSING';
    console.log("--- Railway Variables Check ---");
    console.log(`GEMINI_API_KEY: ${check('GEMINI_API_KEY')}`);
    console.log(`FIREBASE_PROJECT_ID: ${check('FIREBASE_PROJECT_ID')}`);
    console.log(`FIREBASE_API_KEY: ${check('FIREBASE_API_KEY')}`);
    console.log(`GMAIL_USER: ${check('GMAIL_USER')}`);
    console.log(`GMAIL_APP_PASSWORD: ${check('GMAIL_APP_PASSWORD')}`);
    console.log("-------------------------------");
    
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      console.log(`✅ Versusfy: Production assets ready.`);
    } else {
      console.warn("⚠️ Versusfy: Running in Source Mode (dist folder not found). This is normal for development.");
    }
  });
}

startServer();
