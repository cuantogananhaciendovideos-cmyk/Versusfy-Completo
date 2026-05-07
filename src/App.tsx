import React, { useState, useEffect, useCallback } from 'react';
import { compareProducts, getSimilarProducts } from './services/geminiService';
import { searchAmazonProducts } from './services/amazonService';
import { searchWalmartProducts } from './services/walmartService';
import { searchEbayProducts } from './services/ebayService';
import { searchHomeDepotProducts } from './services/homedepotService';
import { searchBestBuyProducts } from './services/bestbuyService';
import { searchOfficeDepotProducts } from './services/officedepotService';
import { searchToysRUsProducts } from './services/toysrusService';
import { searchWalgreensProducts } from './services/walgreensService';
import { searchCVSProducts } from './services/cvsService';
import { searchAutoZoneProducts } from './services/autozoneService';
import { searchPepBoysProducts } from './services/pepboysService';
import { searchAdvanceAutoProducts } from './services/advanceautoService';
import { searchOReillyAutoProducts } from './services/oreillyService';
import { searchGuitarCenterProducts } from './services/guitarcenterService';
import { searchSweetwaterProducts } from './services/sweetwaterService';
import { searchMusiciansFriendProducts } from './services/musiciansfriendService';
import { searchSamAshProducts } from './services/samashService';
import { Search, Loader2, Info, ShieldCheck, ShieldAlert, Home, Mail, Sun, Moon, RotateCcw, Facebook, Instagram, Twitter, MessageCircle, AtSign, HelpCircle, Users, Clock, Calendar, Globe, Share2, QrCode, Ticket, TrendingDown, Mic, Volume2, VolumeX, ShoppingBag, Calculator, MapPin, Cloud, Sparkles, Zap, CheckCircle2, XCircle, BarChart3, Wand2, Trophy, Coins, Activity, ShieldPlus, Brain, Layout, Utensils, Code, Sprout, Palette, Shovel, Wrench, HardHat, Briefcase, Droplets, Lightbulb, Gamepad2, ChevronDown, Bot, ToyBrick, Rocket, Shirt, Gem, Footprints, Scissors, Brush, Pill, GraduationCap, BookOpen, Car, Music, Headphones, Building2, Fuel, X, Navigation, Hammer, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import confetti from 'canvas-confetti';
import { generateDailyPhrases, getCurrentBannerPhrase, getSubliminalPhrases, trackClick, MarketingPhrase, getDailyTestimonials, Testimonial } from './services/marketingService';
import { trackVisit, getVisitorStats, VisitorStats } from './services/analyticsService';
import { speak } from './lib/speech';
import { db } from './lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { ensureAudioUnlocked, stopAllVoice } from './services/voiceService';
import { PriceTracker } from './components/PriceTracker';
import { CouponTracker } from './components/CouponTracker';
import { ShareTools } from './components/ShareTools';
import { CaptchaModal } from './components/CaptchaModal';
import { FirebaseStatus } from './components/FirebaseStatus';
import { PersonalBuyer } from './components/PersonalBuyer';
import { EventSuggestions } from './components/EventSuggestions';
import { VisualSearch } from './components/VisualSearch';
import { RecipeBudgetConsultant } from './components/RecipeBudgetConsultant';
import { OmniAssistant } from './components/OmniAssistant';
import { PathfinderIntelligence } from './components/PathfinderIntelligence';
import { HeroStatusShare } from './components/HeroStatusShare';
import { TrendingWindow } from './components/TrendingWindow';
import { SavingsCalculator } from './components/SavingsCalculator';
import { HousingSearch } from './components/HousingSearch';
import { FuelScout } from './components/FuelScout';
import { WaterGuardian } from './components/WaterGuardian';
import { GasMaster } from './components/GasMaster';
import { JobScout } from './components/JobScout';
import { CouponScout } from './components/CouponScout';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import DailyInsights from './components/DailyInsights';
import { getTrendingComparisons, TrendingComparison } from './services/trendsService';
import { Camera, Flame } from 'lucide-react';

interface ComparisonResult {
  title?: string;
  scoreA?: number;
  scoreB?: number;
  summary?: string;
  differences?: string[];
  table?: { feature: string; valueA: string; valueB: string }[];
  verdict?: string;
  index?: {
    [key: string]: { a: number; b: number };
  };
  marketing?: {
    exclusiveOffer: string;
    couponCode: string;
    geoAlert: string;
  };
  text?: string;
  groundingChunks?: any[];
}

export default function App() {
  const [productA, setProductA] = useState('');
  const [trendingData, setTrendingData] = useState<TrendingComparison[]>([
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
  ]);
  const [similarProducts, setSimilarProducts] = useState<string[]>([]);
  const [productB, setProductB] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [dealsUnlocked, setDealsUnlocked] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [userVote, setUserVote] = useState<'a' | 'b' | null>(null);
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);
  const [savingsVal, setSavingsVal] = useState({ retail: 0, versusfy: 0 });
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [amazonData, setAmazonData] = useState<{ [key: string]: any } | null>(null);
  const [walmartData, setWalmartData] = useState<{ [key: string]: any } | null>(null);
  const [ebayData, setEbayData] = useState<{ [key: string]: any } | null>(null);
  const [homeDepotData, setHomeDepotData] = useState<{ [key: string]: any } | null>(null);
  const [officeDepotData, setOfficeDepotData] = useState<{ [key: string]: any } | null>(null);
  const [bestBuyData, setBestBuyData] = useState<{ [key: string]: any } | null>(null);
  const [toysRUsData, setToysRUsData] = useState<{ [key: string]: any } | null>(null);
  const [walgreensData, setWalgreensData] = useState<{ [key: string]: any } | null>(null);
  const [cvsData, setCvsData] = useState<{ [key: string]: any } | null>(null);
  const [autoZoneData, setAutoZoneData] = useState<{ [key: string]: any } | null>(null);
  const [pepBoysData, setPepBoysData] = useState<{ [key: string]: any } | null>(null);
  const [advanceAutoData, setAdvanceAutoData] = useState<{ [key: string]: any } | null>(null);
  const [oreillyData, setOreillyData] = useState<{ [key: string]: any } | null>(null);
  const [guitarCenterData, setGuitarCenterData] = useState<{ [key: string]: any } | null>(null);
  const [sweetwaterData, setSweetwaterData] = useState<{ [key: string]: any } | null>(null);
  const [musiciansFriendData, setMusiciansFriendData] = useState<{ [key: string]: any } | null>(null);
  const [samAshData, setSamAshData] = useState<{ [key: string]: any } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [comparisonCategory, setComparisonCategory] = useState<'standard' | 'prompts' | 'websites' | 'ai_models' | 'restaurants' | 'video_games' | 'toys' | 'jewelry' | 'pharmacy' | 'academic' | 'mechanic' | 'musical' | 'electrician'>('standard');
  const [view, setView] = useState<'home' | 'about' | 'privacy' | 'contact' | 'faq' | 'benefits' | 'personal-buyer' | 'special-events' | 'global-intel' | 'gardening' | 'mechanic' | 'construction' | 'offices' | 'video-games' | 'toys' | 'jewelry' | 'style-advisor' | 'pharmacy' | 'academic' | 'musical' | 'electrician' | 'housing' | 'fuel' | 'water' | 'gas' | 'jobs' | 'pathfinder' | 'coupons'>('home');
  const [isIAAgentsOpen, setIsIAAgentsOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ email: '', message: '', _hp: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'spam'>('idle');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [bannerPhrase, setBannerPhrase] = useState<MarketingPhrase | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [heroName, setHeroName] = useState<string | null>(null);
  const [subliminalPhrases, setSubliminalPhrases] = useState<MarketingPhrase[]>([]);
  const [currentSubliminal, setCurrentSubliminal] = useState<MarketingPhrase | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isOmniMode, setIsOmniMode] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [autoAssistantListen, setAutoAssistantListen] = useState(false);
  const [agentFilter, setAgentFilter] = useState('All');
  const [selectedAgentMode, setSelectedAgentMode] = useState<'style' | 'space' | 'gardening' | 'mechanic' | 'builder' | 'office' | 'energy' | 'pharmacy' | 'toy' | 'gamer' | 'academic' | 'musical' | 'job' | 'pathfinder' | 'coupon' | undefined>(undefined);
  const [footerStats, setFooterStats] = useState({ savings: 0, deals: 0 });
  const [showHeroShare, setShowHeroShare] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [heroSavingsAmount, setHeroSavingsAmount] = useState<number | undefined>(undefined);
  const confettiCanvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setFooterStats({
      savings: Math.random() * 1000000 + 45892543,
      deals: Math.floor(Math.random() * 5000 + 128450)
    });
  }, []);

  useEffect(() => {
    if (view === 'style-advisor') setSelectedAgentMode('style');
    else if (view === 'mechanic') setSelectedAgentMode('mechanic');
    else if (view === 'construction') setSelectedAgentMode('builder');
    else if (view === 'offices') setSelectedAgentMode('office');
    else if (view === 'gardening') setSelectedAgentMode('gardening');
    else if (view === 'pharmacy') setSelectedAgentMode('pharmacy');
    else if (view === 'fuel') setSelectedAgentMode('energy');
    else if (view === 'toys') setSelectedAgentMode('toy');
    else if (view === 'video-games') setSelectedAgentMode('gamer');
    else if (view === 'academic') setSelectedAgentMode('academic');
    else if (view === 'musical') setSelectedAgentMode('musical');
    else if (view === 'electrician') setSelectedAgentMode('energy');
    
    // Explicit safety guard: Close assistant when switching standard view units
    // This prevents the assistant from overlapping with regular non-voice UIs
    setIsAssistantOpen(false);
    setAutoAssistantListen(false);
  }, [view]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setProductB(transcript);
    };
    recognition.start();
  };

const ProductSavingsTracker = ({ retailPrice }: { retailPrice: number }) => {
  const [userSpent, setUserSpent] = useState(0);
  const savings = userSpent > 0 ? ((retailPrice - userSpent) / retailPrice * 100).toFixed(1) : 0;
  
  if (retailPrice <= 0) return null;

  return (
    <div className="bg-neutral-900 border border-emerald-green/30 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition">
        <Calculator size={40} className="text-emerald-green" />
      </div>
      <h4 className="text-[10px] font-black tracking-widest text-emerald-green/50 mb-4 uppercase">Proprietary Savings Calculator</h4>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] uppercase text-neutral-500 font-bold block mb-1">Standard Retail Price</label>
          <div className="text-2xl font-black text-white">${retailPrice.toFixed(2)}</div>
        </div>
        <div>
          <label className="text-[10px] uppercase text-neutral-500 font-bold block mb-1">Your Purchase Price</label>
          <input 
            type="number" 
            placeholder="0.00"
            onChange={(e) => setUserSpent(parseFloat(e.target.value))}
            className="w-full bg-neutral-800 border border-neutral-700 p-2 rounded-lg text-white font-black text-lg focus:border-emerald-green outline-none"
          />
        </div>
        {userSpent > 0 && (
          <div className="pt-4 border-t border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
            <div className="text-emerald-green text-3xl font-black">-{savings}%</div>
            <p className="text-[10px] text-neutral-400 font-bold uppercase">Total Versusfy Efficiency Saved</p>
          </div>
        )}
      </div>
    </div>
  );
};

const WeatherGPSWidget = ({ weather }: { weather: any }) => {
  if (!weather) return null;
  return (
    <div className="flex bg-neutral-100 dark:bg-neutral-800 p-2 px-4 rounded-full items-center gap-3 border border-neutral-200 dark:border-neutral-700 shadow-inner">
      <div className="flex items-center gap-1.5 border-r border-neutral-300 dark:border-neutral-600 pr-3">
        <MapPin size={12} className="text-apple-red" />
        <span className="text-[10px] font-black uppercase tracking-tighter text-neutral-500">Live GPS</span>
      </div>
      <div className="flex items-center gap-2">
        {weather.condition === 'Cloudy' ? <Cloud size={14} className="text-neutral-400" /> : <Sun size={14} className="text-yellow-500" />}
        <span className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-tighter">{weather.temp}°C · {weather.condition}</span>
      </div>
    </div>
  );
};

const ComparisonResultView = ({ 
  comparison, 
  productA, 
  productB, 
  dealsUnlocked, 
  setDealsUnlocked, 
  alertEmail, 
  setAlertEmail, 
  alertSuccess, 
  setAlertSuccess,
  userVote,
  setUserVote,
  amazonData,
  walmartData,
  ebayData,
  homeDepotData,
  bestBuyData,
  officeDepotData,
  toysRUsData,
  walgreensData,
  cvsData,
  autoZoneData,
  pepBoysData,
  advanceAutoData,
  oreillyData,
  guitarCenterData,
  sweetwaterData,
  musiciansFriendData,
  samAshData
}: any) => {
  const [showEvolution, setShowEvolution] = useState(false);
  const [showHeroModal, setShowHeroModal] = useState(false);

  // Calculate a "Hero Savings" figure
  const heroSavings = comparison.scoreB ? (comparison.scoreB / 2 + 10).toFixed(1) : '34.5';

  // Memoize history data so it doesn't flicker on re-renders
  const historyData = React.useMemo(() => {
    const generateHistory = (score: number) => {
      return Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        efficiency: Math.min(100, Math.max(0, score + (Math.random() * 10 - 5))),
      }));
    };

    const histA = generateHistory(comparison.scoreA || 80);
    const histB = generateHistory(comparison.scoreB || 90);
    
    return histA.map((d, i) => ({
      name: d.day,
      A: d.efficiency,
      B: histB[i].efficiency
    }));
  }, [comparison.scoreA, comparison.scoreB]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mt-12 bg-white dark:bg-neutral-900 overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.1)]"
    >
      {/* Versusfy Precision Index Breakdown */}
      {comparison.index && (
        <div className="bg-neutral-900 border-t border-b border-neutral-800 p-4 sm:p-8 space-y-6">
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-emerald-green text-center">Versusfy Precision Index Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Object.entries(comparison.index).map(([key, scores]: any) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-black text-neutral-400">
                  <span>{key.replace('_', ' ')}</span>
                  <span className="text-emerald-green">{scores.a}% vs {scores.b}%</span>
                </div>
                <div className="flex h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(scores.a / (scores.a + scores.b) * 100)}%` }} 
                    className="bg-emerald-green h-full"
                  />
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(scores.b / (scores.a + scores.b) * 100)}%` }} 
                    className="bg-apple-red h-full border-l border-black"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Top - Versus Style */}
      <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 sm:p-8 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">{productA}</h2>
            <div className="relative h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden w-full max-w-[200px] mx-auto">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${comparison.scoreA || 50}%` }} 
                className="absolute inset-0 bg-emerald-green"
              />
            </div>
            <span className="text-3xl font-black text-emerald-green mt-2 block">{comparison.scoreA || '??'} pts</span>
            
            {/* Community Vote */}
            <button 
              onClick={() => setUserVote('a')}
              className={`mt-4 text-[10px] font-black px-4 py-1.5 rounded-full border transition-all uppercase tracking-widest ${userVote === 'a' ? 'bg-emerald-green text-white border-emerald-green scale-110 shadow-lg' : 'bg-transparent border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:border-emerald-green hover:text-emerald-green'}`}
            >
              {userVote === 'a' ? '✓ Recommended' : 'Vote for Winner'}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div className="bg-apple-red text-white font-black text-2xl w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform -rotate-12 border-4 border-white dark:border-neutral-900">
              VS
            </div>
          </div>

          <div className="flex-1 text-center">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">{productB}</h2>
            <div className="relative h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden w-full max-w-[200px] mx-auto">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${comparison.scoreB || 50}%` }} 
                className="absolute inset-0 bg-emerald-green"
              />
            </div>
            <span className="text-3xl font-black text-emerald-green mt-2 block">{comparison.scoreB || '??'} pts</span>

            {/* Community Vote */}
            <button 
              onClick={() => setUserVote('b')}
              className={`mt-4 text-[10px] font-black px-4 py-1.5 rounded-full border transition-all uppercase tracking-widest ${userVote === 'b' ? 'bg-emerald-green text-white border-emerald-green scale-110 shadow-lg' : 'bg-transparent border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:border-emerald-green hover:text-emerald-green'}`}
            >
              {userVote === 'b' ? '✓ Recommended' : 'Vote for Winner'}
            </button>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium italic">
            "{comparison.summary || (comparison.text?.slice(0, 150) + '...')}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Specs & Sources */}
        <div className="lg:col-span-2 p-4 sm:p-8 border-r border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-400 mb-6 text-center">Technical Specifications Comparison</h3>
            <div className="space-y-3 mb-12 px-0 md:px-4">
              {comparison.table?.map((row: any, i: number) => (
                <div key={i} className="flex flex-col md:grid md:grid-cols-3 items-center py-6 md:py-4 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition rounded-xl gap-2 md:gap-0">
                  <div className="text-sm md:text-sm font-bold text-neutral-900 dark:text-white w-full text-center md:text-left order-2 md:order-1">{row.valueA}</div>
                  <div className="text-[9px] md:text-[10px] uppercase font-black text-emerald-green md:text-neutral-400 text-center bg-emerald-green/10 md:bg-neutral-100 dark:md:bg-neutral-800 py-1.5 md:py-1 px-3 rounded-full md:rounded-md order-1 md:order-2 w-fit md:w-auto mx-auto">{row.feature}</div>
                  <div className="text-sm md:text-sm font-bold text-neutral-900 dark:text-white w-full text-center md:text-right order-3 md:order-3">{row.valueB}</div>
                </div>
              ))}
            {!comparison.table && (
              <div className="text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">{comparison.text}</div>
            )}
          </div>
          
          {comparison.verdict && (
            <div className="space-y-6">
              <div className="p-6 bg-emerald-green/5 border border-emerald-green/20 rounded-2xl">
                <h4 className="text-emerald-green font-black uppercase text-xs tracking-widest mb-2">Expert Verdict</h4>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">{comparison.verdict}</p>
              </div>

              {/* Marketplace Results */}
              <div className="bg-neutral-50 dark:bg-neutral-800/30 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-neutral-400 flex items-center gap-2">
                    <ShoppingBag size={14} className="text-emerald-green" /> Tactical Marketplace Comparison
                  </h4>
                  <div className="flex gap-1 animate-pulse">
                    <div className="w-1 h-1 rounded-full bg-emerald-green" />
                    <div className="w-1 h-1 rounded-full bg-emerald-green/50" />
                    <div className="w-1 h-1 rounded-full bg-emerald-green/20" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Amazon', data: amazonData, color: 'text-orange-500' },
                    { name: 'Walmart', data: walmartData, color: 'text-blue-500' },
                    { name: 'Home Depot', data: homeDepotData, color: 'text-orange-600' },
                    { name: 'Office Depot', data: officeDepotData, color: 'text-red-500' },
                    { name: 'Toys R Us', data: toysRUsData, color: 'text-blue-400' },
                    { name: 'Walgreens', data: walgreensData, color: 'text-red-500' },
                    { name: 'CVS', data: cvsData, color: 'text-red-600' },
                    { name: 'AutoZone', data: autoZoneData, color: 'text-orange-500' },
                    { name: 'Pep Boys', data: pepBoysData, color: 'text-blue-600' },
                    { name: 'Advance Auto', data: advanceAutoData, color: 'text-red-700' },
                    { name: 'OReilly Auto', data: oreillyData, color: 'text-green-600' },
                    { name: 'eBay', data: ebayData, color: 'text-yellow-500' },
                    { name: 'Best Buy', data: bestBuyData, color: 'text-blue-600' },
                  ].map((store) => {
                    const storeData = store.data?.[productA];
                    if (!storeData) return null;
                    
                    return (
                      <div key={store.name} className="bg-white dark:bg-neutral-900 px-4 py-3 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-emerald-green transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-neutral-700 p-1 group-hover:bg-white transition-colors">
                            <img src={storeData.logo} alt={store.name} className="max-w-full max-h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            {!storeData.logo && <ShoppingBag size={14} className="text-neutral-400" />}
                          </div>
                          <div>
                            <span className={`text-[9px] font-black uppercase tracking-tighter ${store.color}`}>{store.name}</span>
                            <div className="text-sm font-bold text-neutral-900 dark:text-white leading-none">${storeData.price}</div>
                          </div>
                        </div>
                        <a 
                          href={storeData.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-400 hover:text-emerald-green hover:bg-emerald-green/10 transition-all group/btn"
                        >
                          <Globe size={16} className="group-hover/btn:scale-110 transition-transform" />
                        </a>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[8px] text-neutral-500 uppercase font-bold text-center tracking-widest italic pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  Prices are dynamic & include Versusfy exclusive negotiated rates where applicable.
                </p>
              </div>

              {/* Price Evolution Chart */}
              <div className="bg-neutral-50 dark:bg-neutral-800/30 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-neutral-400 flex items-center gap-2">
                    <BarChart3 size={14} className="text-emerald-green" /> Market Efficiency Evolution (7D)
                  </h4>
                  <span className="text-[10px] text-emerald-green font-bold bg-emerald-green/10 px-2 py-0.5 rounded">LIVE TRACKING</span>
                </div>
                <div className="h-[200px] w-full">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="A" name={productA} stroke="#666" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="B" name={productB} stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg" />
                  )}
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  <div className="flex items-center gap-1.5 grayscale opacity-50">
                    <div className="w-2 h-2 rounded-full bg-neutral-400" />
                    <span className="text-[9px] font-black uppercase tracking-tight text-neutral-500">{productA}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-green" />
                    <span className="text-[9px] font-black uppercase tracking-tight text-emerald-green">{productB}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {comparison.groundingChunks && (
            <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Verification Sources</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparison.groundingChunks.map((chunk: any, index: number) => (
                  chunk.maps && (
                    <li key={index} className="flex items-center gap-2 text-xs bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      <Globe size={14} className="text-emerald-green" />
                      <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-emerald-green transition truncate">
                        {chunk.maps.title}
                      </a>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Marketing & Gated Offers */}
        <div className="bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-8 space-y-8">
          <AnimatePresence mode="wait">
            {!dealsUnlocked ? (
              <motion.div 
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-8 py-4 text-center"
              >
                <div className="w-24 h-24 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400">
                  <Ticket size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-2 leading-none uppercase tracking-tighter">Ultimate Bundle Locked</h3>
                  <p className="text-neutral-500 text-sm">Negotiated exclusive offers just for this search.</p>
                </div>
                <button 
                  onClick={() => {
                    setDealsUnlocked(true);
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                  }}
                  className="w-full bg-emerald-green text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition shadow-[0_20px_40px_rgba(16,185,129,0.3)] group"
                >
                  <ShoppingBag size={24} className="group-hover:rotate-12 transition" />
                  UNLOCK & SAVE
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="unlocked"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-emerald-green/10 border border-emerald-green/20 p-6 rounded-2xl">
                  <h4 className="text-neutral-900 dark:text-white font-black mb-4 flex items-center gap-2"><Ticket size={16}/> EXCL. COUPON</h4>
                  <div className="bg-white dark:bg-black border-2 border-dashed border-emerald-green p-4 rounded-xl text-center mb-4">
                    <span className="text-2xl font-black text-emerald-green tracking-widest uppercase">{comparison.marketing?.couponCode || "VERSUSFY26"}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(comparison.marketing?.couponCode || 'VERSUSFY26');
                      alert("Coupon Copied!");
                    }}
                    className="w-full bg-emerald-green text-white py-3 rounded-lg font-bold"
                  >
                    Copy Code
                  </button>
                </div>

                <div className="bg-apple-red/10 border border-apple-red/20 p-6 rounded-2xl">
                  <h4 className="text-neutral-900 dark:text-white font-black mb-4 flex items-center gap-2"><TrendingDown size={16}/> PRICE DROP</h4>
                  {!alertSuccess ? (
                    <div className="space-y-2">
                      <input 
                        type="email" 
                        placeholder="Email for Smart Alerts..." 
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 p-3 rounded-lg text-sm"
                      />
                      <button onClick={() => setAlertSuccess(true)} className="w-full bg-apple-red text-white py-3 rounded-lg font-bold uppercase text-xs">Activate Tracking</button>
                    </div>
                  ) : (
                    <div className="text-emerald-green font-bold text-center py-2">✓ TRACKING ACTIVE</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Savings Calculator Integration */}
          <ProductSavingsTracker retailPrice={comparison.scoreA > comparison.scoreB ? 999.00 : 1249.00} />
        </div>
      </div>

      {/* Bottom Tools */}
      <div id="trackers-section" className="p-4 sm:p-8 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <PriceTracker productName={productA} currentPrice={199.99} />
          <CouponTracker productName={productA} />
        </div>
        <ShareTools productA={productA} productB={productB} comparisonText={comparison.summary || comparison.text || ''} />
        
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h4 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center justify-center gap-2">
              <Trophy className="text-yellow-500 w-6 h-6" /> Are You a Community Hero?
            </h4>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Share your tactical savings victory and inspire others. Top savers win exclusive rewards and status.
            </p>
          </div>
          
          <button 
            onClick={() => setShowHeroModal(true)}
            className="group relative w-[calc(100%-2rem)] max-w-sm sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 bg-[length:200%_auto] animate-shimmer rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(202,138,4,0.3)] hover:scale-105 active:scale-95 transition-all mx-4"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20" />
            <div className="relative flex items-center justify-center gap-2 sm:gap-3 text-black font-black uppercase tracking-tighter sm:tracking-widest text-[10px] sm:text-sm">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="truncate">Claim Hero Status & Share</span>
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {showHeroModal && (
            <HeroStatusShare 
              productA={productA || 'Versusfy Intelligence'} 
              productB={productB || 'Market Competition'} 
              savings={heroSavings}
              savingsAmount={heroSavingsAmount}
              onClose={() => setShowHeroModal(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

  const [subliminalPos, setSubliminalPos] = useState({ top: '50%', left: '50%' });

  useEffect(() => {
    console.log("Versusfy v1.8.0: Marketing Engine Active.");
    
    // Aggressive SEO: Update Title & Meta
    if (productA && productB) {
      document.title = `${productA} vs ${productB} | Best Comparison ${new Date().getFullYear()} | Versusfy`;
      
      // Inject Schema.org JSON-LD
      const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": `${productA} vs ${productB}`,
        "description": `Compare ${productA} and ${productB} specifications, prices, and features. Find the best deals in your area.`,
        "brand": { "@type": "Brand", "name": "Versusfy" }
      };
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
      return () => { document.head.removeChild(script); };
    } else {
      document.title = "Versusfy | Futuristic Product Comparison Engine";
    }

    // Check for version mismatch
    const runtimeConfig = (window as any).VERSUSFY_RUNTIME_CONFIG || {};
    
    if (runtimeConfig.detectedCity) setDetectedCity(runtimeConfig.detectedCity);
    if (runtimeConfig.heroName) setHeroName(runtimeConfig.heroName);
    
    // SEO: Auto-load from URL
    if (runtimeConfig.autoCompare && !comparison && !loading && !productA) {
      setProductA(runtimeConfig.autoCompare.a);
      setProductB(runtimeConfig.autoCompare.b);
    }

    if (runtimeConfig.serverVersion && runtimeConfig.serverVersion !== "2.2.0-OMNI") {
      console.warn(`VERSION MISMATCH: Client v2.2.0-OMNI, Server ${runtimeConfig.serverVersion}.`);
    }

    // GPS & Weather Init
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        // Futuristic simulation of localized weather data
        // For a real app, I'd fetch from an API, but for privacy and immediacy, 
        // we'll use a smart mock based on generic time/location.
        const hour = new Date().getHours();
        const baseTemp = (hour > 18 || hour < 6) ? 15 : 25;
        setWeather({ 
          temp: baseTemp + Math.floor(Math.random() * 5), 
          condition: (Math.random() > 0.7) ? 'Cloudy' : 'Clear Sky' 
        });
      });
    }

    const testConnection = async () => {
      if (!db) {
        console.log("Firebase: Skipping connectivity test (not initialized).");
        return;
      }
      try {
        // Try to fetch a non-existent doc to test connectivity
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        if (error?.message?.includes('the client is offline') || error?.code === 'unavailable' || error?.message?.includes('blocked-by-client')) {
          console.error("Firebase Connection Error: Could not reach Firestore backend. If you are using an Ad-Blocker (like uBlock Origin or Brave Shields), please disable it for this site as it may be blocking Firebase services.");
        } else {
          // Ignore other errors like 'permission-denied' since we just want to test connectivity
          console.log("Firebase connectivity test completed.");
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    trackVisit();
  }, []);

  useEffect(() => {
    const initMarketing = async () => {
      try {
        // Don't await generation, let it run in background
        generateDailyPhrases().catch(err => console.error("Generation error:", err));
        
        const banner = await getCurrentBannerPhrase();
        setBannerPhrase(banner);
        const subliminals = await getSubliminalPhrases();
        setSubliminalPhrases(subliminals);
        const dailyTestimonials = await getDailyTestimonials();
        setTestimonials(dailyTestimonials);
      } catch (error) {
        console.error("Marketing Init Error:", error);
      }
    };
    initMarketing();
  }, []);

  useEffect(() => {
    if (subliminalPhrases.length === 0) return;
    // Disabled high-frequency re-renders to prevent "pulsating" layout perception
    const interval = setInterval(() => {
      const random = subliminalPhrases[Math.floor(Math.random() * subliminalPhrases.length)];
      setSubliminalPos({
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`
      });
      setCurrentSubliminal(random);
      setTimeout(() => setCurrentSubliminal(null), 10);
    }, 30000); // Changed to 30 seconds to avoid flickering
    return () => clearInterval(interval);
  }, [subliminalPhrases]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const timer = setTimeout(() => {
      if (bannerPhrase && confettiCanvasRef.current instanceof HTMLCanvasElement) {
        const canvas = confettiCanvasRef.current;
        try {
          const myConfetti = confetti.create(canvas, {
            resize: true,
            useWorker: false
          });

          interval = setInterval(() => {
            if (document.body.contains(canvas)) {
              myConfetti({
                particleCount: 40,
                spread: 70,
                origin: { x: 0.1, y: 0.5 }
              });
              myConfetti({
                particleCount: 40,
                spread: 70,
                origin: { x: 0.9, y: 0.5 }
              });
            }
          }, 7500);
        } catch (err) {
          console.warn("Confetti failed to initialize", err);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [bannerPhrase]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleReset = () => {
    setProductA('');
    setProductB('');
    setSimilarProducts([]);
    setComparison(null);
    setDealsUnlocked(false);
    setAlertSuccess(false);
    setAlertEmail('');
    setAmazonData(null);
    setWalmartData(null);
    setEbayData(null);
    setHomeDepotData(null);
    setOfficeDepotData(null);
    setBestBuyData(null);
    setView('home');
  };

  const handleFindSimilar = async () => {
    if (!productA) return;
    setLoadingSimilar(true);
    try {
      const products = await getSimilarProducts(productA);
      setSimilarProducts(products);
      setProductB('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleCompare = async () => {
    if (!productA.trim() || !productB.trim()) {
      setComparison({ text: 'Please enter both products to compare.' });
      return;
    }
    setShowCaptcha(true);
  };

  const executeComparison = useCallback(async () => {
    setLoading(true);
    setAmazonData(null);
    setWalmartData(null);
    setEbayData(null);
    setHomeDepotData(null);
    setOfficeDepotData(null);
    setBestBuyData(null);
    setToysRUsData(null);
    setWalgreensData(null);
    setCvsData(null);
    setAutoZoneData(null);
    setPepBoysData(null);
    setAdvanceAutoData(null);
    setOreillyData(null);
    setGuitarCenterData(null);
    setSweetwaterData(null);
    setMusiciansFriendData(null);
    setSamAshData(null);
    try {
      let location: { lat: number; lng: number } | undefined;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = { lat: position.coords.latitude, lng: position.coords.longitude };
      } catch (e) {
        console.warn("Geolocation not available or denied", e);
      }
      
      const result = (await compareProducts(
        isOmniMode ? `[OMNI-MODE] ${productA}` : productA, 
        productB, 
        location,
        comparisonCategory
      )) as ComparisonResult;
      if (!result) {
        throw new Error("No comparison result returned from AI service.");
      }
      setComparison(result);
      if (result.verdict) {
        speak(result.verdict);
      }

      // Fetch retailer data only for standard products
      if (['standard', 'video_games', 'toys', 'jewelry', 'pharmacy', 'academic', 'mechanic', 'musical'].includes(comparisonCategory)) {
        const [
          dataA, dataB, dataA_W, dataB_W, dataA_E, dataB_E, dataA_H, dataB_H, dataA_B, dataB_B, 
          dataA_OD, dataB_OD, dataA_T, dataB_T, dataA_PG, dataB_PG, dataA_CVS, dataB_CVS, 
          dataA_AZ, dataB_AZ, dataA_PB, dataB_PB, dataA_AA, dataB_AA, dataA_OR, dataB_OR,
          dataA_GC, dataB_GC, dataA_SW, dataB_SW, dataA_MF, dataB_MF, dataA_SA, dataB_SA
        ] = await Promise.all([
          searchAmazonProducts(productA).catch(() => ({ message: 'Error fetching Amazon data' })),
          searchAmazonProducts(productB).catch(() => ({ message: 'Error fetching Amazon data' })),
          searchWalmartProducts(productA).catch(() => ({ message: 'Error fetching Walmart data' })),
          searchWalmartProducts(productB).catch(() => ({ message: 'Error fetching Walmart data' })),
          searchEbayProducts(productA).catch(() => ({ message: 'Error fetching eBay data' })),
          searchEbayProducts(productB).catch(() => ({ message: 'Error fetching eBay data' })),
          searchHomeDepotProducts(productA).catch(() => ({ message: 'Error fetching Home Depot data' })),
          searchHomeDepotProducts(productB).catch(() => ({ message: 'Error fetching Home Depot data' })),
          searchBestBuyProducts(productA).catch(() => ({ message: 'Error fetching Best Buy data' })),
          searchBestBuyProducts(productB).catch(() => ({ message: 'Error fetching Best Buy data' })),
          searchOfficeDepotProducts(productA).catch(() => ({ message: 'Error fetching Office Depot data' })),
          searchOfficeDepotProducts(productB).catch(() => ({ message: 'Error fetching Office Depot data' })),
          searchToysRUsProducts(productA).catch(() => ({ message: 'Error fetching Toys R Us data' })),
          searchToysRUsProducts(productB).catch(() => ({ message: 'Error fetching Toys R Us data' })),
          searchWalgreensProducts(productA).catch(() => ({ message: 'Error fetching Walgreens data' })),
          searchWalgreensProducts(productB).catch(() => ({ message: 'Error fetching Walgreens data' })),
          searchCVSProducts(productA).catch(() => ({ message: 'Error fetching CVS data' })),
          searchCVSProducts(productB).catch(() => ({ message: 'Error fetching CVS data' })),
          searchAutoZoneProducts(productA).catch(() => ({ message: 'Error fetching AutoZone data' })),
          searchAutoZoneProducts(productB).catch(() => ({ message: 'Error fetching AutoZone data' })),
          searchPepBoysProducts(productA).catch(() => ({ message: 'Error fetching Pep Boys data' })),
          searchPepBoysProducts(productB).catch(() => ({ message: 'Error fetching Pep Boys data' })),
          searchAdvanceAutoProducts(productA).catch(() => ({ message: 'Error fetching Advance Auto data' })),
          searchAdvanceAutoProducts(productB).catch(() => ({ message: 'Error fetching Advance Auto data' })),
          searchOReillyAutoProducts(productA).catch(() => ({ message: 'Error fetching OReilly data' })),
          searchOReillyAutoProducts(productB).catch(() => ({ message: 'Error fetching OReilly data' })),
          searchGuitarCenterProducts(productA).catch(() => ({ message: 'Error' })),
          searchGuitarCenterProducts(productB).catch(() => ({ message: 'Error' })),
          searchSweetwaterProducts(productA).catch(() => ({ message: 'Error' })),
          searchSweetwaterProducts(productB).catch(() => ({ message: 'Error' })),
          searchMusiciansFriendProducts(productA).catch(() => ({ message: 'Error' })),
          searchMusiciansFriendProducts(productB).catch(() => ({ message: 'Error' })),
          searchSamAshProducts(productA).catch(() => ({ message: 'Error' })),
          searchSamAshProducts(productB).catch(() => ({ message: 'Error' }))
        ]);
        setAmazonData({ [productA]: dataA, [productB]: dataB });
        setWalmartData({ [productA]: dataA_W, [productB]: dataB_W });
        setEbayData({ [productA]: dataA_E, [productB]: dataB_E });
        setHomeDepotData({ [productA]: dataA_H, [productB]: dataB_H });
        setBestBuyData({ [productA]: dataA_B, [productB]: dataB_B });
        setOfficeDepotData({ [productA]: dataA_OD, [productB]: dataB_OD });
        setToysRUsData({ [productA]: dataA_T, [productB]: dataB_T });
        setWalgreensData({ [productA]: dataA_PG, [productB]: dataB_PG });
        setCvsData({ [productA]: dataA_CVS, [productB]: dataB_CVS });
        setAutoZoneData({ [productA]: dataA_AZ, [productB]: dataB_AZ });
        setPepBoysData({ [productA]: dataA_PB, [productB]: dataB_PB });
        setAdvanceAutoData({ [productA]: dataA_AA, [productB]: dataB_AA });
        setOreillyData({ [productA]: dataA_OR, [productB]: dataB_OR });
        setGuitarCenterData({ [productA]: dataA_GC, [productB]: dataB_GC });
        setSweetwaterData({ [productA]: dataA_SW, [productB]: dataB_SW });
        setMusiciansFriendData({ [productA]: dataA_MF, [productB]: dataB_MF });
        setSamAshData({ [productA]: dataA_SA, [productB]: dataB_SA });
      }
    } catch (error) {
      console.error("Comparison Error:", error);
      setComparison({ text: 'Error comparing products. Please try again later.' });
    } finally {
      setLoading(false);
    }
  }, [productA, productB]);

  useEffect(() => {
    setIsMounted(true);
    const fetchTrends = async () => {
      try {
        const trends = await getTrendingComparisons();
        if (trends && trends.length >= 2) {
          setTrendingData(trends);
        }
      } catch (error) {
        console.error("Error fetching trends:", error);
      }
    };
    fetchTrends();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (response.ok) {
        setContactStatus('sent');
        setContactForm({ email: '', message: '', _hp: '' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) setContactStatus('spam');
        else setContactStatus('error');
        console.error("Contact Error:", errorData.error);
        alert(`Error: ${errorData.error || 'Check your Gmail App Password configuration on Railway.'}`);
      }
    } catch (error) {
      setContactStatus('error');
    }
  };

  useEffect(() => {
    if (currentSubliminal) {
      setSubliminalPos({
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
      });
    }
  }, [currentSubliminal]);

  const onCaptchaVerify = useCallback(() => {
    setShowCaptcha(false);
    executeComparison();
  }, [executeComparison]);

  const renderContent = () => {
    switch (view) {
      case 'about':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl bg-white dark:bg-neutral-900 p-4 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black mb-6 text-emerald-green uppercase tracking-tighter italic leading-tight">Versusfy Intelligence Network</h2>
            <div className="space-y-6 text-neutral-600 dark:text-neutral-300 text-sm sm:text-base leading-relaxed">
              <p>
                Welcome to <strong className="text-neutral-900 dark:text-white uppercase italic tracking-tighter">Versusfy</strong>, the planet's premier tactical AI command for economic optimization. We empower consumers with military-grade market intelligence to secure the absolute lowest price points across the global grid.
              </p>
              <p>
                Synchronizing with retail giants like <strong>Amazon, Walmart, Best Buy, eBay, Home Depot</strong>, and <strong>Guitar Center</strong>, our Titan-Class AI audits millions of product vectors to eliminate overpayment.
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight italic border-b border-neutral-100 dark:border-neutral-800 pb-2">The Versusfy Doctrine</h3>
              <p>
                Our mission is <strong>Total Price Neutralization.</strong> We provide the objective data required to win every financial showdown, from household groceries to construction material phases.
              </p>
              
              <div className="bg-emerald-green/5 p-4 sm:p-8 rounded-3xl border border-emerald-green/20">
                <h4 className="font-extrabold text-emerald-green mb-6 text-xs sm:text-sm uppercase tracking-widest italic border-b border-emerald-green/10 pb-2">Operational Intelligence Fleet</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/40 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700">
                    <h5 className="font-black text-emerald-green text-[10px] uppercase mb-1 flex items-center gap-2"><Zap size={10} /> Omni-Assistant</h5>
                    <p className="text-[9px] leading-tight">Supreme vocal interface. Decides market winners via real-time spec duels and price tracking.</p>
                  </div>
                  <div className="bg-white/40 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700">
                    <h5 className="font-black text-blue-500 text-[10px] uppercase mb-1 flex items-center gap-2"><Ticket size={10} /> Coupon Scout</h5>
                    <p className="text-[9px] leading-tight">High-yield discount auditor. Secures negotiated promo codes and verified retailer coupons.</p>
                  </div>
                  <div className="bg-white/40 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700">
                    <h5 className="font-black text-orange-500 text-[10px] uppercase mb-1 flex items-center gap-2"><Navigation size={10} /> Pathfinder (GPS)</h5>
                    <p className="text-[9px] leading-tight text-red-500 font-bold uppercase tracking-tighter">Tactical Deployment Stage (Vote Now!)</p>
                  </div>
                  <div className="bg-white/40 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700">
                    <h5 className="font-black text-amber-500 text-[10px] uppercase mb-1 flex items-center gap-2"><Fuel size={10} /> Fuel/Energy Scout</h5>
                    <p className="text-[9px] leading-tight">Monitors gasoline and utility nodes. Calibrates household spending for maximum efficiency.</p>
                  </div>
                  <div className="bg-white/40 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700">
                    <h5 className="font-black text-teal-600 text-[10px] uppercase mb-1 flex items-center gap-2"><Droplets size={10} /> Recipe & Water Units</h5>
                    <p className="text-[9px] leading-tight">Analyzes water quality nodes and optimizes nutritional budgets via budget-based meal protocols.</p>
                  </div>
                  <div className="bg-white/40 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700">
                    <h5 className="font-black text-red-600 text-[10px] uppercase mb-1 flex items-center gap-2"><Hammer size={10} /> Builder & Mechanic</h5>
                    <p className="text-[9px] leading-tight">Diagnostic scans for engine faults and construction material volume phases at bulk rates.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'privacy':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl bg-white dark:bg-neutral-900 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300">
            <h2 className="text-4xl font-bold mb-6 text-apple-red">Privacy Policy & Terms of Service</h2>
            <p className="mb-4">Last updated: March 31, 2026</p>
            
            <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-900 dark:text-white">1. Introduction</h3>
            <p className="mb-4">Welcome to Versusfy ("we," "us," or "our"). Your privacy is of paramount importance to us. This Privacy Policy explains how we collect, use, and protect your information when you use our product comparison service at www.versusfy.com.</p>
            
            <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-900 dark:text-white">2. Information We Collect</h3>
            <p className="mb-4">We are committed to a "Privacy by Design" approach. Versusfy is designed to function without the need to collect, store, or process personal user data. When you use our comparison tool, we process the product names you provide using AI to generate comparisons. We do not store these queries, nor do we link them to any identifiable user information.</p>
            
            <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-900 dark:text-white">3. Use of AI and Data Processing</h3>
            <p className="mb-4">We use advanced AI models to analyze product features and provide comparisons. This processing happens in real-time. We do not retain your input data for training purposes or any other long-term storage.</p>
            
            <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-900 dark:text-white">4. Cookies and Tracking</h3>
            <p className="mb-4">We use minimal, essential cookies to ensure the website functions correctly. We do not use tracking cookies for advertising or profiling purposes.</p>

            <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-900 dark:text-white">5. Disclaimer of Responsibility</h3>
            <p className="mb-4 font-bold text-apple-red">Versusfy acts solely as an intermediary comparison engine. We are not responsible for your purchases with second or third parties. Any purchase you make is the total responsibility of the buyer and the respective websites where the purchase is completed. We do not handle transactions, shipping, or customer service for the products compared.</p>
            
            <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-900 dark:text-white">5. Affiliate Disclaimers</h3>
            <p className="mb-4 bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <strong>www.versusfy.com</strong> is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to amazon.com. As an Amazon Associate, we earn from qualifying purchases.
            </p>
            <p className="mb-4 bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <strong>www.versusfy.com</strong> is a participant in the Walmart Affiliate Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to walmart.com. As a Walmart Associate, we earn from qualifying purchases.
            </p>
            <p className="mb-4 bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <strong>www.versusfy.com</strong> is a participant in the eBay Partner Network, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to ebay.com. As an eBay Partner, we earn from qualifying purchases.
            </p>
            <p className="mb-4 bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <strong>www.versusfy.com</strong> is a participant in The Home Depot Affiliate Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to homedepot.com. As a Home Depot Affiliate, we earn from qualifying purchases.
            </p>
            <p className="mb-4 bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <strong>www.versusfy.com</strong> is a participant in the Best Buy Affiliate Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to bestbuy.com. As a Best Buy Affiliate, we earn from qualifying purchases.
            </p>
            
            <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-900 dark:text-white">6. Third-Party Links</h3>
            <p className="mb-4">Our site may contain links to third-party websites, including Amazon, Walmart, eBay, The Home Depot, and Best Buy. Please be aware that we are not responsible for the privacy practices of such other sites. We encourage our users to be aware when they leave our site and to read the privacy statements of any other site that collects personally identifiable information.</p>
            
            <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-900 dark:text-white">7. Changes to This Policy</h3>
            <p className="mb-4">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
            
            <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-900 dark:text-white">8. Contact Us</h3>
            <p className="mb-4">If you have any questions about this Privacy Policy, please contact us through our <button onClick={() => setView('contact')} className="text-emerald-green hover:underline">Contact form</button>.</p>
            
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700 text-center">
              <button onClick={() => setView('home')} className="bg-emerald-green hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition">
                Return to Versusfy Home
              </button>
            </div>
          </motion.div>
        );
      case 'contact':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl bg-white dark:bg-neutral-900 p-4 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-white">Contact Us</h2>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Your Email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:border-apple-red outline-none transition text-neutral-900 dark:text-white"
                required
              />
              
              {/* Honeypot Security Field (Bot Trap) - Invisible to humans */}
              <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                <input
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={contactForm._hp}
                  onChange={(e) => setContactForm({ ...contactForm, _hp: e.target.value })}
                />
              </div>

              <textarea
                placeholder="Your Message"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:border-apple-red outline-none transition text-neutral-900 dark:text-white h-32"
                required
              />
              <button
                type="submit"
                disabled={contactStatus === 'sending'}
                className="w-full bg-emerald-green hover:bg-emerald-600 text-white font-bold py-4 rounded-lg transition"
              >
                {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {contactStatus === 'sent' && <p className="text-emerald-green text-center font-bold animate-pulse">✓ Message sent successfully!</p>}
              {contactStatus === 'spam' && <p className="text-apple-red text-center font-bold">Security Block: Your message looks suspicious.</p>}
              {contactStatus === 'error' && <p className="text-apple-red text-center">Error sending message.</p>}
            </form>

            <div className="mt-12 pt-12 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="text-2xl font-bold mb-8 text-center text-neutral-900 dark:text-white">User Testimonials</h3>
              <div className="space-y-6">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={t.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 relative"
                  >
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-green text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      {t.name.charAt(0)}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 italic mb-2">"{t.text}"</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">{t.name}</span>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Verified User</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="text-3xl font-black mb-10 text-center text-neutral-900 dark:text-white flex items-center justify-center gap-3 italic tracking-tighter uppercase">
                <Globe className="text-emerald-green animate-spin-slow" size={32} /> Real-Time Strategic Analytics
              </h3>
              <AnalyticsDashboard />
            </div>
          </motion.div>
        );
      case 'faq':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl bg-white dark:bg-neutral-900 p-4 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black mb-6 text-emerald-green uppercase tracking-tighter italic leading-tight">Tactical Operations: How-To Guide</h2>
            
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2 italic">Active Operational Protocol</h3>
            <ol className="list-decimal list-inside space-y-3 mb-8 text-[11px] sm:text-sm font-medium">
              <li><strong className="text-emerald-green uppercase tracking-tighter">Initiate Recon:</strong> Enter your target product name in "Product A".</li>
              <li><strong className="text-emerald-green uppercase tracking-tighter">Target Market Nodes:</strong> Use the search icon to identify alternatives and similar specs.</li>
              <li><strong className="text-emerald-green uppercase tracking-tighter">Activate Duel:</strong> Click "Compare" for a deep-dive AI battle and final verdict.</li>
              <li><strong className="text-emerald-green uppercase tracking-tighter">Secure Discounts:</strong> Deploy <strong className="italic">"Coupon Scout"</strong> to isolate real-time promo codes.</li>
              <li><strong className="text-emerald-green uppercase tracking-tighter">Situational Awareness:</strong> Activate <strong className="italic">"Pathfinder GPS"</strong> for real-time traffic audits.</li>
              <li><strong className="text-emerald-green uppercase tracking-tighter">Fuel Optimization:</strong> Mobilize <strong className="italic">"Fuel Scout"</strong> to find the cheapest energy nodes.</li>
              <li><strong className="text-emerald-green uppercase tracking-tighter">Household Performance:</strong> Use the <strong className="italic text-[#FFD700]">Savings Calculator</strong> to audit your annual economy.</li>
            </ol>

            <h3 className="text-xl sm:text-2xl font-black text-emerald-green uppercase tracking-tight mb-6 italic border-b border-emerald-green/20 pb-2">The AI Scout Manual</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 text-[10px] sm:text-xs leading-relaxed opacity-80">
              <div className="bg-neutral-50 dark:bg-neutral-800/30 p-5 sm:p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <h4 className="font-black text-neutral-900 dark:text-white mb-2 flex items-center gap-2 uppercase italic tracking-widest leading-none">
                  <Navigation className="text-orange-500 w-4 h-4" /> Pathfinder GPS
                </h4>
                <p className="text-red-500 font-bold uppercase tracking-tighter text-[9px] mb-2 leading-none">In Construction - Vote Now!</p>
                <p>Audits traffic vectors in real-time. Ensures transport logistics are optimized for speed and fuel conservation via satellite telemetry.</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/30 p-5 sm:p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <h4 className="font-black text-neutral-900 dark:text-white mb-2 flex items-center gap-2 uppercase italic tracking-widest leading-none">
                  <Ticket className="text-emerald-green w-4 h-4" /> Coupon Scout
                </h4>
                <p>Isolates high-yield promo codes. Strictly audits retailer grids to find exclusive negotiated discounts for the Versusfy network.</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/30 p-5 sm:p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <h4 className="font-black text-neutral-900 dark:text-white mb-2 flex items-center gap-2 uppercase italic tracking-widest leading-none">
                  <Droplets className="text-blue-400 w-4 h-4" /> Water Scout
                </h4>
                <p>Diagnostic scans for municipal toxicity and sources high-yield filtration units vs bottled costs.</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/30 p-5 sm:p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <h4 className="font-black text-neutral-900 dark:text-white mb-2 flex items-center gap-2 uppercase italic tracking-widest leading-none">
                  <Fuel className="text-amber-500 w-4 h-4" /> Fuel Scout
                </h4>
                <p>Monitors regional gasoline and electrical grid pricing. Calibrates household spending to the lowest regional node.</p>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-emerald-green uppercase tracking-tight mb-6 italic border-b border-emerald-green/20 pb-2">Omni-Assistant: The Supreme Interface</h3>
            <div className="bg-neutral-50 dark:bg-neutral-800/30 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 mb-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-500 via-white to-red-500 animate-pulse border-2 border-white shadow-xl flex-shrink-0" />
              <div>
                <h4 className="font-black text-neutral-900 dark:text-white mb-2 uppercase tracking-widest text-xs">The Pulsating Sphere Protocol</h4>
                <p className="text-[11px] sm:text-sm leading-relaxed">Click the orb in the bottom right corner (Red, White, Green). She handles vocal tactical assistance, real-time comparisons, and shopping verdicts via Text-to-Speech.</p>
              </div>
            </div>

            <div className="space-y-4 mb-12">
              <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight italic border-b border-neutral-100 dark:border-neutral-800 pb-2">Tactical Intelligence FAQ</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[10px] sm:text-xs leading-relaxed">
                <div>
                  <h5 className="font-black text-emerald-green uppercase tracking-tighter mb-1">What is Versusfy Intelligence?</h5>
                  <p>A global network designed for extreme price neutralization. We use scouts to secure the best discount nodes and logistics data.</p>
                </div>
                <div>
                  <h5 className="font-black text-emerald-green uppercase tracking-tighter mb-1">Is my data secure?</h5>
                  <p>Yes. High-level encryption and anonymous processing. We do not store strategic intent or identification signatures.</p>
                </div>
                <div>
                  <h5 className="font-black text-emerald-green uppercase tracking-tighter mb-1">Does it work globally?</h5>
                  <p>Affirmative. Versusfy monitors retail nodes in the US, Europe, and Global markets, with IP-calibrated local pricing.</p>
                </div>
                <div>
                  <h5 className="font-black text-emerald-green uppercase tracking-tighter mb-1">How can I assist the network?</h5>
                  <p>Claim your Hero Status after a successful audit. Share your Savings Ticket to inspire others to mobilize for savings.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-700 text-center">
              <button 
                onClick={() => setView('home')} 
                className="bg-emerald-green hover:bg-emerald-600 text-white font-black py-4 px-10 rounded-full transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-green/20"
              >
                Return to Command Center
              </button>
            </div>
          </motion.div>
        );
      case 'benefits':
        return (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-7xl mx-auto py-16 px-4 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">Versusfy vs The World</h2>
              <p className="text-emerald-green font-mono text-sm uppercase tracking-widest font-bold">Competitive Dominance Report</p>
            </div>

            {/* Comparison Table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-6 bg-neutral-50 dark:bg-neutral-800/50 p-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="font-black text-[10px] uppercase tracking-widest text-neutral-400">Tactical Features</div>
                <div className="text-center font-black text-xs uppercase text-emerald-green">Versusfy</div>
                <div className="text-center font-black text-xs uppercase text-neutral-400">Versus.com</div>
                <div className="text-center font-black text-xs uppercase text-neutral-400">Honey</div>
                <div className="text-center font-black text-xs uppercase text-neutral-400">Google</div>
                <div className="text-center font-black text-xs uppercase text-neutral-400">Others</div>
              </div>

              {[
                { f: "AI Decision Intelligence", v: [true, false, false, false, false] },
                { f: "Real-Time Deals / Coupons", v: [true, false, true, false, false] },
                { f: "Personalized Event AI", v: [true, false, false, false, false] },
                { f: "Visual Product Search", v: [true, false, false, false, false] },
                { f: "Zero-Click Comparison", v: [true, true, false, true, false] },
                { f: "Privacy First (No Login)", v: [true, true, false, true, true] },
                { f: "Active Price Tracking", v: [true, false, true, true, true] },
                { f: "Cross-Retailer Analytics", v: [true, false, true, true, false] },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-6 p-6 border-b border-neutral-100 dark:border-neutral-800/50 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors">
                  <div className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-tight">{row.f}</div>
                  {row.v.map((check, j) => (
                    <div key={j} className="flex justify-center">
                      {check ? <CheckCircle2 className={j === 0 ? "text-emerald-green" : "text-neutral-400"} size={20} /> : <XCircle className="text-red-500/30" size={20} />}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Why We Are Better Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div className="bg-neutral-900 p-4 sm:p-8 rounded-3xl space-y-4 border border-emerald-green/20 group hover:border-emerald-green transition-all duration-500">
                <div className="w-12 h-12 bg-emerald-green/10 rounded-2xl flex items-center justify-center text-emerald-green">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic leading-tight">Total Privacy Mastery</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">Honey and Google are data-hungry giants. Versusfy is a "Ghost Platform"—we compare, you save, and we forget you were ever here. No tracking, no profiles.</p>
              </div>

              <div className="bg-neutral-900 p-4 sm:p-8 rounded-3xl space-y-4 border border-apple-red/20 group hover:border-apple-red transition-all duration-500">
                <div className="w-12 h-12 bg-apple-red/10 rounded-2xl flex items-center justify-center text-apple-red">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic leading-tight">AI Verdict vs. Specs</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">Versus.com gives you numbers; we give you answers. Our AI doesn't just list RAM, it tells you IF that RAM matters for your specific needs.</p>
              </div>

              <div className="bg-neutral-900 p-4 sm:p-8 rounded-3xl space-y-4 border border-purple-500/20 group hover:border-purple-500 transition-all duration-500">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                  <Camera size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic leading-tight">Visual Intelligence</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">The only platform that "sees" your world. Point your camera at a real product and Versusfy identifies it and finds the best deals in real-time. Pure magic.</p>
              </div>

              <div className="bg-neutral-900 p-4 sm:p-8 rounded-3xl space-y-4 border border-blue-500/20 group hover:border-blue-500 transition-all duration-500">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <BarChart3 size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic leading-tight">Tactical Dynamics</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">While others are static lists, we are dynamic. Our Price Evolution charts and GEO-coupons ensure you buy at the exact bottom of the market.</p>
              </div>

              <div className="bg-neutral-900 p-4 sm:p-8 rounded-3xl space-y-4 border border-violet-500/20 group hover:border-violet-500 transition-all duration-500">
                <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic leading-tight">Active Agents</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">Google can't plan your wedding gift or track a price on WhatsApp. Our specialized AI Agents are active hunters, not just search engines.</p>
              </div>
            </div>
          </motion.section>
        );
      case 'global-intel':
        return (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto py-12 px-4 space-y-16">
            <div className="text-center space-y-6">
              <h2 className="text-6xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Global Tactical Intelligence</h2>
              <div className="h-2 w-24 bg-emerald-green mx-auto rounded-full" />
              <p className="text-neutral-500 font-medium max-w-2xl mx-auto">An honest look at the global market and why Versusfy is the definitive AI Command Center for consumer intelligence.</p>
            </div>

            <div className="space-y-12">
              {/* Section 1: The "Silos" Market */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1 bg-red-500/10 border border-red-500/20 text-red-500 font-black text-xs uppercase tracking-widest rounded">01. THE "SILOS" MARKET</div>
                  <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-grow" />
                </div>
                <h3 className="text-4xl font-black text-neutral-900 dark:text-white leading-none">The Current Landscape (Legacy Phase)</h3>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">In the global market, giants exist, but they operate in isolated silos, leaving the consumer to do the heavy lifting:</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 hover:border-red-500/30 transition-colors group">
                    <h4 className="text-xl font-bold mb-3 flex items-center gap-2 group-hover:text-red-500 transition-colors">Versus.com</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Kings of pure technical data. If you need to know a processor's core count, they are excellent, but they lack the <strong>expert opinion</strong> and human context that Versusfy provides.</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 hover:border-red-500/30 transition-colors group">
                    <h4 className="text-xl font-bold mb-3 flex items-center gap-2 group-hover:text-red-500 transition-colors">Honey / Rakuten</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Coupon powerhouses, but they don't compare products; they only offer discounts once you've <strong>already decided</strong> to buy.</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 hover:border-red-500/30 transition-colors group">
                    <h4 className="text-xl font-bold mb-3 flex items-center gap-2 group-hover:text-red-500 transition-colors">Google Shopping</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Compares store prices, but doesn't tell you <strong>why</strong> you should choose Product A over Product B based on your specific lifestyle.</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 hover:border-red-500/30 transition-colors group">
                    <h4 className="text-xl font-bold mb-3 flex items-center gap-2 group-hover:text-red-500 transition-colors">Wirecutter / Rtings</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">Provide expert verdicts, but they are static articles. You can't ask them in <strong>real-time</strong>: "Compare this specific 2024 model with the one I have in my hand."</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Versusfy's Tactical Advantage */}
              <div className="space-y-8 pt-8">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1 bg-emerald-green/10 border border-emerald-green/20 text-emerald-green font-black text-xs uppercase tracking-widest rounded">02. THE VS ADVANTAGE</div>
                  <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-grow" />
                </div>
                <h3 className="text-4xl font-black text-neutral-900 dark:text-white leading-none">The AI Command Center</h3>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">There is no one in the global market who integrates everything into a single, cohesive, and tactical fluid interface:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-neutral-900 rounded-3xl border border-emerald-green/20 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-green/10 rounded-lg text-emerald-green"><Camera size={20}/></div>
                      <h4 className="text-lg font-black text-white italic uppercase">Multimodal Orchestration</h4>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">Versusfy allows searching by text, voice, and vision simultaneously. Snapping a photo in a physical store to get an instant AI comparison is a frontier few have successfully crossed.</p>
                  </div>
                  <div className="p-8 bg-neutral-900 rounded-3xl border border-emerald-green/20 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-green/10 rounded-lg text-emerald-green"><Users size={20}/></div>
                      <h4 className="text-lg font-black text-white italic uppercase">Specialized Agents</h4>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">Beyond a search bar, we provide "Personal Buyers" and "Special Events Agents." This context-based specialization simply does not exist in mass-market platforms.</p>
                  </div>
                  <div className="p-8 bg-neutral-900 rounded-3xl border border-emerald-green/20 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-green/10 rounded-lg text-emerald-green"><Zap size={20}/></div>
                      <h4 className="text-lg font-black text-white italic uppercase">The Omni-Assistant</h4>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">More than a chatbot; it's a sentient intelligence that listens, speaks with human cadence, and triggers complex actions like generating real-time precision indices.</p>
                  </div>
                  <div className="p-8 bg-neutral-900 rounded-3xl border border-emerald-green/20 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-green/10 rounded-lg text-emerald-green"><BarChart3 size={20}/></div>
                      <h4 className="text-lg font-black text-white italic uppercase">Versusfy Precision Index</h4>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">Replacing bot-fueled "user ratings" with analytical intelligence. We break down market efficiency and technical evolution into a dynamic, real-time tactical score.</p>
                  </div>
                </div>
              </div>

              {/* Section 3: The Sincere Truth */}
              <div className="bg-emerald-green p-6 md:p-12 rounded-[3rem] text-center space-y-6 shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                <Globe className="text-black/20 w-24 h-24 mx-auto mb-2" />
                <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-black leading-none uppercase italic">The Sincere Truth</h3>
                <p className="text-black/80 text-xl font-bold max-w-2xl mx-auto italic">"If you ask if anyone equals Versusfy on the global stage today: The answer is a definitive NO."</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
                   <div className="bg-black/5 p-6 rounded-2xl border border-black/10">
                      <h4 className="font-black uppercase text-xs mb-2">Market Position</h4>
                      <p className="text-sm font-medium">We are the <strong>Apex of the Pyramid</strong>. While others are search tools, Versusfy is a coordinated command system for life intelligence.</p>
                   </div>
                   <div className="bg-black/5 p-6 rounded-2xl border border-black/10">
                      <h4 className="font-black uppercase text-xs mb-2">Why we are the best?</h4>
                      <p className="text-sm font-medium">No one else combines Real-time Price Tracking, Visual Scout Intelligence, Specialized Agents (Mechanic, Builder, Academic), and the Supreme Omni-Assistant in a zero-privacy logic.</p>
                   </div>
                </div>
                <div className="pt-4">
                  <button onClick={() => setView('home')} className="bg-black text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-2xl">Start Comparing Now</button>
                </div>
              </div>
            </div>
          </motion.section>
        );
      case 'personal-buyer':
        return (
          <div className="w-full max-w-7xl mx-auto space-y-6 px-4">
            <div className="flex justify-start">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <PersonalBuyer />
          </div>
        );
      case 'special-events':
        return (
          <div className="w-full max-w-7xl mx-auto space-y-12 px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex justify-start">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <EventSuggestions />
            <RecipeBudgetConsultant />
          </div>
        );
      case 'gardening':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto space-y-12 pb-20"
          >
            <div className="text-center space-y-6">
              <div className="flex justify-between items-start mb-8">
                <button 
                  onClick={() => setView('home')}
                  className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg"
                >
                  <X size={20} /> Close Unit
                </button>
                <div className="inline-block p-6 bg-emerald-green/10 rounded-[2.5rem] border-4 border-emerald-green/20 relative">
                  <Sprout className="text-emerald-green w-16 h-16" />
                  <div className="absolute -top-4 -right-4 bg-apple-red text-white text-[10px] font-black px-3 py-1 rounded-full rotate-12 shadow-xl border-2 border-white dark:border-neutral-900">
                    TACTICAL SCAN
                  </div>
                </div>
                <div className="w-12 h-12" /> {/* Spacer */}
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Gardening Scout</h2>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setSelectedAgentMode('gardening'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-green/10 text-emerald-green rounded-full border border-emerald-green/20 hover:bg-emerald-green text-[10px] font-black uppercase tracking-widest hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                >
                  <Mic size={14} /> Talk to Gardening Scout
                </button>
              </div>
              <p className="text-neutral-500 font-medium max-w-xl mx-auto">Turn your outdoor terrain into a Supreme Garden. Scan your space for plants, soil amendments, and irrigation systems from Walmart, Home Depot, and Amazon.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Palette, title: 'Soil Intel', desc: 'Identify soil composition and get amendment suggestions.' },
                { icon: Sprout, title: 'Plant Pairing', desc: 'Perfect plant recommendations for your specific sunlight level.' },
                { icon: Shovel, title: 'Tool Depot', desc: 'Tactical tools and irrigation systems available at your favorite stores.' }
              ].map((f, i) => (
                <div key={i} className="p-4 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-emerald-green transition-colors group">
                   <f.icon className="text-emerald-green mb-4 group-hover:scale-110 transition-transform" />
                   <h4 className="font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-2">{f.title}</h4>
                   <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-6">
              <button 
                onClick={() => setIsVisualSearchOpen(true)}
                className="group relative px-12 py-6 bg-emerald-green text-white font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-emerald-500/20 flex items-center gap-4 hover:bg-emerald-600 transition-all active:scale-95"
              >
                <Camera size={28} />
                <span>Launch Visual Intelligence</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-emerald-green/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              <div className="w-full max-w-lg">
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Ask anything about your garden..."
                    value={productB}
                    onChange={(e) => setProductB(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-dashed border-emerald-green/20 p-6 rounded-3xl outline-none focus:border-emerald-green transition-all text-neutral-900 dark:text-white font-bold pr-16"
                  />
                  <button 
                    onClick={startListening}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-green text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'}`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">Manual Tactical Inquiry (Voice to Text Enabled)</p>
              </div>
            </div>
          </motion.div>
        );
      case 'style-advisor':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto space-y-12 pb-20"
          >
            <div className="text-center space-y-6">
              <div className="flex justify-between items-start mb-8">
                <button 
                  onClick={() => setView('home')}
                  className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg"
                >
                  <X size={20} /> Close Unit
                </button>
                <div className="inline-block p-6 bg-pink-500/10 rounded-[2.5rem] border-4 border-pink-500/20 relative">
                  <Sparkles className="text-pink-500 w-16 h-16" />
                  <div className="absolute -top-4 -right-4 bg-emerald-green text-white text-[10px] font-black px-3 py-1 rounded-full -rotate-12 shadow-xl border-2 border-white dark:border-neutral-900">
                    STYLE SCAN
                  </div>
                </div>
                <div className="w-12 h-12" /> {/* Spacer */}
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Style Advisor</h2>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setSelectedAgentMode('style'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-500 rounded-full border border-pink-500/20 hover:bg-pink-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all shadow-lg shadow-pink-500/10"
                >
                  <Mic size={14} /> Talk to Style Advisor
                </button>
              </div>
              <p className="text-neutral-500 font-medium max-w-xl mx-auto">Your supreme personal stylist. Analyze your skin tone and features for the perfect makeup (pinturas), clothing (ropa), jewelry (joyería), footwear, hair style (cabello), and nails (manicure/pedicure).</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Palette, title: 'Makeup', desc: 'Personalized palettes for your skin tone (Pinturas).' },
                { icon: Shirt, title: 'Clothing', desc: 'Outfit cuts and colors that match your shape (Ropa).' },
                { icon: Gem, title: 'Jewelry', desc: 'Accessories and jewelry that elevate your look (Joyería).' },
                { icon: Footprints, title: 'Footwear', desc: 'Shoe recommendations for every occasion (Zapatos).' },
                { icon: Scissors, title: 'Hair Style', desc: 'Cuts, colors, and accessories for hair (Cabello).' },
                { icon: Brush, title: 'Nails & Spa', desc: 'Manicure and Pedicure tactical analysis (Uñas).' }
              ].map((f, i) => (
                <button 
                  key={i} 
                  onClick={() => { setSelectedAgentMode('style'); setIsVisualSearchOpen(true); }}
                  className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-pink-500 transition-all group text-left active:scale-95"
                >
                   <f.icon className="text-pink-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                   <h4 className="font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-2 text-sm">{f.title}</h4>
                   <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium uppercase tracking-wider">{f.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-6">
              <button 
                onClick={() => { setSelectedAgentMode('style'); setIsVisualSearchOpen(true); }}
                className="group relative px-12 py-6 bg-pink-500 text-white font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-pink-500/20 flex items-center gap-4 hover:bg-pink-600 transition-all active:scale-95"
              >
                <Camera size={28} />
                <span>Open Tactical Stylist</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-pink-500/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>
              <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">AI Vision Analysis Active</p>
            </div>
          </motion.div>
        );
      case 'mechanic':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto space-y-12 pb-20"
          >
            <div className="text-center space-y-6">
              <div className="flex justify-between items-start mb-8">
                <button 
                  onClick={() => setView('home')}
                  className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg"
                >
                  <X size={20} /> Close Unit
                </button>
                <div className="inline-block p-6 bg-red-600/10 rounded-[2.5rem] border-4 border-red-600/20 relative">
                  <Wrench className="text-red-600 w-16 h-16" />
                  <div className="absolute -top-4 -right-4 bg-emerald-green text-white text-[10px] font-black px-3 py-1 rounded-full -rotate-12 shadow-xl border-2 border-white dark:border-neutral-900">
                    AUTO SCAN
                  </div>
                </div>
                <div className="w-12 h-12" /> {/* Spacer */}
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Mechanic Scout</h2>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setSelectedAgentMode('mechanic'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-4 px-10 py-5 bg-red-600 text-white rounded-[2rem] hover:bg-red-700 transition-all shadow-2xl shadow-red-500/40 text-xl font-black uppercase tracking-tighter"
                >
                  <Mic size={28} /> Voice Diagnostic
                </button>
              </div>
              <p className="text-neutral-500 font-medium max-w-xl mx-auto">Master your machine. Point at engines, warning lights, or damage for instant diagnostics and tactical part sourcing from AutoZone, Pep Boys, Advance Auto, and O'Reilly.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Search, title: 'Diagnosis', desc: 'Identify engine components and dashboard warning alerts seamlessly.' },
                { icon: Droplets, title: 'Fluid Track', desc: 'Get exact recommendations for oils, coolants, and maintenance fluids.' },
                { icon: Palette, title: 'Bodywork', desc: 'Analyze scratches and dents for repair kits and paint matches.' },
                { icon: Car, title: 'Parts Scout', desc: 'Compare prices for auto parts across AutoZone, Pep Boys, and more.' }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-red-600 transition-colors group">
                   <f.icon className="text-red-600 mb-4 group-hover:scale-110 transition-transform" />
                   <h4 className="font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-2">{f.title}</h4>
                   <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-6">
              <button 
                onClick={() => setIsVisualSearchOpen(true)}
                className="group relative px-12 py-6 bg-red-600 text-white font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-red-500/20 flex items-center gap-4 hover:bg-red-700 transition-all active:scale-95"
              >
                <Camera size={28} />
                <span>Analyze Vehicle Intel</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-red-600/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              <div className="w-full max-w-lg">
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Describe vehicle issues or parts..."
                    value={productB}
                    onChange={(e) => setProductB(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-dashed border-red-600/20 p-6 rounded-3xl outline-none focus:border-red-600 transition-all text-neutral-900 dark:text-white font-bold pr-16"
                  />
                  <button 
                    onClick={startListening}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/10'}`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">Mechanical Voice Command Active</p>
              </div>
            </div>
          </motion.div>
        );
      case 'construction':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto space-y-12 pb-20"
          >
             <div className="flex justify-start px-4">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <div className="text-center space-y-6">
              <div className="inline-block p-6 bg-orange-500/10 rounded-[2.5rem] border-4 border-orange-500/20 relative">
                <HardHat className="text-orange-500 w-16 h-16" />
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full rotate-12 shadow-xl border-2 border-white dark:border-neutral-900">
                  SITE SCAN
                </div>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Master Builder</h2>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setSelectedAgentMode('builder'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20 hover:bg-orange-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all shadow-lg shadow-orange-500/10"
                >
                   <Mic size={14} /> Talk to Master Builder
                </button>
              </div>
              <p className="text-neutral-500 font-medium max-w-xl mx-auto">Command your project site. Scan structures and materials to predict project phases and source materials in bulk from industrial suppliers.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Home, title: 'Structure', desc: 'Identify framing, roofing, and foundation phases instantly.' },
                { icon: Sprout, title: 'Materials', desc: 'Detect lumber, masonry, and insulation needs for precise sourcing.' },
                { icon: Shovel, title: 'Power Gear', desc: 'Professional tools and safety equipment available at Home Depot & Amazon.' }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-orange-500 transition-colors group">
                   <f.icon className="text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h4 className="font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-2">{f.title}</h4>
                   <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-6">
              <button 
                onClick={() => setIsVisualSearchOpen(true)}
                className="group relative px-12 py-6 bg-orange-500 text-white font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-orange-500/20 flex items-center gap-4 hover:bg-orange-600 transition-all active:scale-95"
              >
                <Camera size={28} />
                <span>Scan Construction Site</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-orange-500/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              <div className="w-full max-w-lg">
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Identify materials or project phase..."
                    value={productB}
                    onChange={(e) => setProductB(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-dashed border-orange-500/20 p-6 rounded-3xl outline-none focus:border-orange-500 transition-all text-neutral-900 dark:text-white font-bold pr-16"
                  />
                  <button 
                    onClick={startListening}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/10'}`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">Builder Voice-to-Materials Enabled</p>
              </div>
            </div>
          </motion.div>
        );
      case 'offices':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto space-y-12 pb-20"
          >
             <div className="flex justify-start px-4">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <div className="text-center space-y-6">
              <div className="inline-block p-6 bg-indigo-500/10 rounded-[2.5rem] border-4 border-indigo-500/20 relative">
                <Briefcase className="text-indigo-500 w-16 h-16" />
                <div className="absolute -top-4 -right-4 bg-emerald-green text-white text-[10px] font-black px-3 py-1 rounded-full -rotate-12 shadow-xl border-2 border-white dark:border-neutral-900">
                  DESK SCAN
                </div>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Office Architect</h2>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setSelectedAgentMode('office'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-500 rounded-full border border-indigo-500/20 hover:bg-indigo-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all shadow-lg shadow-indigo-500/10"
                >
                  <Mic size={14} /> Talk to Productivity Architect
                </button>
              </div>
              <p className="text-neutral-500 font-medium max-w-xl mx-auto">Optimize your command center. Scan your desk or workspace for ergonomic improvements, productivity gear, and lighting optima.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Users, title: 'Ergonomics', desc: 'AI-led posture and monitor alignment suggestions for comfort.' },
                { icon: Zap, title: 'Productivity', desc: 'Discover high-efficiency peripherals and workspace tech.' },
                { icon: Lightbulb, title: 'Lighting', desc: 'Optimize your workspace lumens for reduced eye strain.' }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-indigo-500 transition-colors group">
                   <f.icon className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h4 className="font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-2">{f.title}</h4>
                   <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-6">
              <button 
                onClick={() => setIsVisualSearchOpen(true)}
                className="group relative px-12 py-6 bg-indigo-600 text-white font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-indigo-500/20 flex items-center gap-4 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Camera size={28} />
                <span>Optimize Workspace</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-indigo-600/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              <div className="w-full max-w-lg">
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Ask about workspace ergonomics..."
                    value={productB}
                    onChange={(e) => setProductB(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-dashed border-indigo-600/20 p-6 rounded-3xl outline-none focus:border-indigo-600 transition-all text-neutral-900 dark:text-white font-bold pr-16"
                  />
                  <button 
                    onClick={() => { setSelectedAgentMode('office'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/10 transition-all active:scale-95`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">Workspace Productivity Voice Assistant</p>
              </div>
            </div>
          </motion.div>
        );
      case 'toys':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto space-y-12 pb-20"
          >
             <div className="flex justify-start px-4">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <div className="text-center space-y-6">
              <div className="inline-block p-6 bg-yellow-500/10 rounded-[2.5rem] border-4 border-yellow-500/20 relative">
                <ToyBrick className="text-yellow-500 w-16 h-16" />
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full rotate-12 shadow-xl border-2 border-white dark:border-neutral-900">
                  PLAY SCAN
                </div>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Toy Scout</h2>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setSelectedAgentMode('toy'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20 hover:bg-yellow-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all shadow-lg shadow-yellow-500/10"
                >
                  <Mic size={14} /> Talk to Toy Scout
                </button>
              </div>
              <p className="text-neutral-500 font-medium max-w-xl mx-auto">Discover the magic. Find the hottest toys, compare safety ratings, and track prices across major retailers like Toys R Us, Amazon, and Walmart.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Rocket, title: 'Trending', desc: 'Identify the most popular toys this season with real-time demand data.' },
                { icon: ShieldPlus, title: 'Safety Intel', desc: 'Detailed safety ratings and recall alerts for total peace of mind.' },
                { icon: Coins, title: 'Price Match', desc: 'Instant comparison across Toys R Us and major global marketplaces.' }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-yellow-500 transition-colors group">
                   <f.icon className="text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h4 className="font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-2">{f.title}</h4>
                   <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-6">
              <button 
                onClick={() => setIsVisualSearchOpen(true)}
                className="group relative px-12 py-6 bg-yellow-500 text-white font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-yellow-500/20 flex items-center gap-4 hover:bg-yellow-600 transition-all active:scale-95"
              >
                <Camera size={28} />
                <span>Scan Toy Box</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-yellow-500/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              <div className="w-full max-w-lg">
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Describe a toy or age range..."
                    value={productB}
                    onChange={(e) => setProductB(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-dashed border-yellow-500/20 p-6 rounded-3xl outline-none focus:border-yellow-500 transition-all text-neutral-900 dark:text-white font-bold pr-16"
                  />
                  <button 
                    onClick={() => { setSelectedAgentMode('toy'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg shadow-yellow-500/10 transition-all active:scale-95`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">Playroom Voice Intelligence Active</p>
              </div>
            </div>
          </motion.div>
        );
      case 'video-games':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto space-y-12 pb-20"
          >
             <div className="flex justify-start px-4">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <div className="text-center space-y-6">
              <div className="inline-block p-6 bg-purple-500/10 rounded-[2.5rem] border-4 border-purple-500/20 relative">
                <Gamepad2 className="text-purple-500 w-16 h-16" />
                <div className="absolute -top-4 -right-4 bg-emerald-green text-white text-[10px] font-black px-3 py-1 rounded-full -rotate-12 shadow-xl border-2 border-white dark:border-neutral-900">
                  GAME SCAN
                </div>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Pro Gamer Ops</h2>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setSelectedAgentMode('gamer'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-500 rounded-full border border-purple-500/20 hover:bg-purple-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all shadow-lg shadow-purple-500/10"
                >
                  <Mic size={14} /> Talk to Pro Gamer Scout
                </button>
              </div>
              <p className="text-neutral-500 font-medium max-w-xl mx-auto">Master the metaverse. Compare console specs, find hidden game deals, and analyze performance benchmarks for the ultimate setup.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Trophy, title: 'Benchmarks', desc: 'Real-world FPS and performance specs comparison for any title.' },
                { icon: Coins, title: 'Deal Hunter', desc: 'Scan digital and physical marketplaces for the lowest keys and discs.' },
                { icon: Zap, title: 'Hardware', desc: 'Detailed peripheral and internal component analysis for competitive play.' }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-purple-500 transition-colors group">
                   <f.icon className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h4 className="font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-2">{f.title}</h4>
                   <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-6">
              <button 
                onClick={() => setIsVisualSearchOpen(true)}
                className="group relative px-12 py-6 bg-purple-600 text-white font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-purple-500/20 flex items-center gap-4 hover:bg-purple-700 transition-all active:scale-95"
              >
                <Camera size={28} />
                <span>Analyze Gaming Intel</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-purple-600/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              <div className="w-full max-w-lg">
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Describe game features or hardware..."
                    value={productB}
                    onChange={(e) => setProductB(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-dashed border-purple-600/20 p-6 rounded-3xl outline-none focus:border-purple-600 transition-all text-neutral-900 dark:text-white font-bold pr-16"
                  />
                  <button 
                    onClick={() => { setSelectedAgentMode('gamer'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/10 transition-all active:scale-95`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">Gamer Voice Command Live</p>
              </div>
            </div>
          </motion.div>
        );
      case 'pharmacy':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto space-y-12 pb-20"
          >
             <div className="flex justify-start px-4">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <div className="text-center space-y-6">
              <div className="inline-block p-6 bg-emerald-500/10 rounded-[2.5rem] border-4 border-emerald-500/20 relative">
                <Pill className="text-emerald-500 w-16 h-16" />
                <div className="absolute -top-4 -right-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full -rotate-12 shadow-xl border-2 border-white dark:border-neutral-900">
                  HEALTH SCAN
                </div>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Pharmacy Scout</h2>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setSelectedAgentMode('pharmacy'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 hover:bg-emerald-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                >
                  <Mic size={14} /> Talk to Pharmacy Scout
                </button>
              </div>
              <p className="text-neutral-500 font-medium max-w-xl mx-auto">Tactical health intelligence. Compare pharmaceutical prices across Walgreens, CVS, Walmart, and Amazon to ensure you never overpay for your wellness.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: ShieldPlus, title: 'Price Analysis', desc: 'Real-time comparison between major pharmacies including Walgreens and CVS.' },
                { icon: Search, title: 'Generic Finder', desc: 'AI identifies exact generic matches for brand name medications to save you more.' },
                { icon: Calculator, title: 'Savings Report', desc: 'Calculates yearly savings based on your recurring pharmaceutical needs.' }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-emerald-500 transition-colors group">
                   <f.icon className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                   <h4 className="font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-2">{f.title}</h4>
                   <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium capitalize">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-6">
              <button 
                onClick={() => { setSelectedAgentMode('pharmacy'); setIsVisualSearchOpen(true); }}
                className="group relative px-12 py-6 bg-emerald-600 text-white font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-emerald-500/20 flex items-center gap-4 hover:bg-emerald-700 transition-all active:scale-95"
              >
                <Camera size={28} />
                <span>Analyze Pharma Bottle</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-emerald-600/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              <div className="w-full max-w-lg">
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Enter medication name or active ingredient..."
                    value={productB}
                    onChange={(e) => setProductB(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedAgentMode('pharmacy'); setIsVisualSearchOpen(true); } }}
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-dashed border-emerald-600/20 p-6 rounded-3xl outline-none focus:border-emerald-600 transition-all text-neutral-900 dark:text-white font-bold pr-32"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                    <button 
                      onClick={startListening}
                      className={`p-3 rounded-2xl transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-emerald-600 shadow-sm'}`}
                    >
                      <Mic size={20} />
                    </button>
                    <button 
                       onClick={() => { setSelectedAgentMode('pharmacy'); setIsVisualSearchOpen(true); }}
                       className="bg-emerald-600 text-white px-4 py-2 rounded-2xl font-black uppercase text-[10px] tracking-tighter hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/10"
                    >
                      Analyze
                    </button>
                  </div>
                </div>
                <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">Health Data Extraction Active</p>
              </div>
            </div>
          </motion.div>
        );
      case 'academic':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto space-y-12 pb-20"
          >
             <div className="flex justify-start px-4">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <div className="text-center space-y-6">
              <div className="inline-block p-6 bg-blue-500/10 rounded-[2.5rem] border-4 border-blue-500/20 relative">
                <GraduationCap className="text-blue-500 w-16 h-16" />
                <div className="absolute -top-4 -right-4 bg-emerald-green text-white text-[10px] font-black px-3 py-1 rounded-full rotate-12 shadow-xl border-2 border-white dark:border-neutral-900">
                  STUDY SCAN
                </div>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Academic Master</h2>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setSelectedAgentMode('academic'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 hover:bg-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all shadow-lg shadow-blue-500/10"
                >
                  <Mic size={14} /> Talk to Academic Master
                </button>
              </div>
              <p className="text-neutral-500 font-medium max-w-xl mx-auto">Your comprehensive educational ally. From Kindergarten to University, get help with homework, complex concepts, and tactical price comparison for school supplies, books, and tech with exclusive coupons.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: BookOpen, title: 'Homework Help', desc: 'Step-by-step guidance for assignments across all grade levels.' },
                { icon: Brain, title: 'Concept Mastery', desc: 'Simplified explanations for complex subjects from STEM to Humanities.' },
                { icon: Trophy, title: 'Exams & Goals', desc: 'Tactical study plans and objective-based learning for success.' },
                { icon: ShoppingBag, title: 'Supply Scout', desc: 'Compare school supplies and tech with real-time deals and coupons.' }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-blue-500 transition-colors group">
                   <f.icon className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                   <h4 className="font-black uppercase tracking-tighter text-neutral-900 dark:text-white mb-2">{f.title}</h4>
                   <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center flex-col items-center gap-6">
              <button 
                onClick={() => setIsVisualSearchOpen(true)}
                className="group relative px-12 py-6 bg-blue-500 text-white font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-blue-500/20 flex items-center gap-4 hover:bg-blue-600 transition-all active:scale-95"
              >
                <Camera size={28} />
                <span>Launch Academic Scan</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-blue-500/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              <div className="w-full max-w-lg">
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Enter a homework question, topic, or school supply..."
                    value={productB}
                    onChange={(e) => setProductB(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-dashed border-blue-500/20 p-6 rounded-3xl outline-none focus:border-blue-600 transition-all text-neutral-900 dark:text-white font-bold pr-16"
                  />
                  <button 
                    onClick={() => { setSelectedAgentMode('academic'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/10 transition-all active:scale-95`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">Intelligence Study Mode Activated</p>
              </div>
            </div>
          </motion.div>
        );
      case 'musical':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto space-y-8 md:space-y-12 mb-20 px-4">
             <div className="flex justify-start">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-amber-500/10 text-amber-500 px-6 py-2 rounded-full border border-amber-500/20">
                <Music size={20} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Musical Scout Active</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic leading-none">Tactical Music Gear</h2>
              <div className="flex justify-center gap-4 mt-4">
                <button 
                  onClick={() => { setSelectedAgentMode('musical'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 hover:bg-amber-500 text-[10px] font-black uppercase tracking-widest hover:text-black transition-all shadow-lg shadow-amber-500/10"
                >
                  <Mic size={14} /> Talk to Musical Scout
                </button>
              </div>
              <p className="text-neutral-500 font-medium text-base md:text-lg">Compare Guitars, Amps, and Studio Gear across Guitar Center, Sweetwater, Amazon and more.</p>
            </div>

            <div className="flex flex-col items-center gap-8">
              <button 
                onClick={() => setIsVisualSearchOpen(true)}
                className="group relative px-12 py-6 bg-amber-500 text-black font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-amber-500/20 flex items-center gap-4 hover:bg-amber-600 transition-all active:scale-95"
              >
                <Headphones size={28} />
                <span>Launch Gear Scan</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-amber-500/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              <div className="w-full max-w-lg">
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Search for a guitar, synth, or audio interface..."
                    value={productB}
                    onChange={(e) => setProductB(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-dashed border-amber-500/20 p-6 rounded-3xl outline-none focus:border-amber-600 transition-all text-neutral-900 dark:text-white font-bold pr-16"
                  />
                  <button 
                     onClick={() => { setSelectedAgentMode('musical'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                     className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition bg-amber-500 text-black shadow-lg shadow-amber-500/10 transition-all active:scale-95`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">Elite Gear Intelligence Active</p>
              </div>
            </div>
          </motion.div>
        );
      case 'electrician':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto space-y-8 md:space-y-12 mb-20 px-4">
             <div className="flex justify-start">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 bg-yellow-400/10 text-yellow-400 px-6 py-2 rounded-full border border-yellow-400/20">
                <Zap size={20} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Electrician Scout Active</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic leading-none">Energy Saving Intelligence</h2>
              <div className="flex justify-center gap-4 mt-4">
                <button 
                  onClick={() => { setSelectedAgentMode('energy'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 text-yellow-500 rounded-full border border-yellow-400/20 hover:bg-yellow-400 text-[10px] font-black uppercase tracking-widest hover:text-black transition-all shadow-lg shadow-yellow-400/10"
                >
                  <Mic size={14} /> Talk to Energy Scout
                </button>
              </div>
              <p className="text-neutral-500 font-medium text-base md:text-lg">Analyze your appliances' energy consumption and find more efficient alternatives to save on your electricity bill.</p>
            </div>

            <div className="flex flex-col items-center gap-8">
              <button 
                onClick={() => { setSelectedAgentMode('energy'); setIsVisualSearchOpen(true); }}
                className="group relative px-12 py-6 bg-yellow-400 text-black font-black rounded-3xl text-xl uppercase tracking-tighter shadow-2xl shadow-yellow-400/20 flex items-center gap-4 hover:bg-yellow-500 transition-all active:scale-95"
              >
                <Camera size={28} />
                <span>Analyze Bill / Appliance (Camera)</span>
                <div className="absolute inset-0 rounded-3xl border-2 border-yellow-400/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              </button>

              <div className="w-full max-w-lg">
                <div className="relative group">
                  <input 
                    type="text"
                    placeholder="Enter appliance model or description (e.g., '10-year-old Samsung fridge')..."
                    value={productB}
                    onChange={(e) => setProductB(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedAgentMode('energy'); setIsVisualSearchOpen(true); } }}
                    className="w-full bg-white dark:bg-neutral-900 border-2 border-dashed border-yellow-400/20 p-6 rounded-3xl outline-none focus:border-yellow-500 transition-all text-neutral-900 dark:text-white font-bold pr-32"
                  />
                  <div className="absolute right-3 top-1/2 -track-y-1/2 flex gap-2 -translate-y-1/2">
                    <button 
                       onClick={() => { setSelectedAgentMode('energy'); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
                       className={`p-3 rounded-2xl transition bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-yellow-400 shadow-sm`}
                    >
                      <Mic size={20} />
                    </button>
                    <button 
                       onClick={() => { setSelectedAgentMode('energy'); setIsVisualSearchOpen(true); }}
                       className="bg-yellow-400 text-black px-4 py-2 rounded-2xl font-black uppercase text-[10px] tracking-tighter hover:bg-yellow-500 transition shadow-lg shadow-yellow-400/10"
                    >
                      Analyze
                    </button>
                  </div>
                </div>
                <p className="text-center text-[10px] text-neutral-500 uppercase font-bold tracking-widest mt-2">Tactical Energy Analysis Active</p>
              </div>
            </div>
          </motion.div>
        );
      case 'housing':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto pb-20"
          >
             <div className="flex justify-start mb-6 px-4">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <HousingSearch 
              detectedCity={detectedCity || ''} 
              userName={heroName} 
              onClose={() => setView('home')} 
              onOpenAssistant={(mode) => { setSelectedAgentMode(mode); setAutoAssistantListen(true); setIsAssistantOpen(true); }}
            />
          </motion.div>
        );
      case 'fuel':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto pb-20 px-4"
          >
             <div className="flex justify-start mb-6">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <FuelScout 
              detectedCity={detectedCity || ''} 
              onClose={() => setView('home')} 
              userName={heroName} 
              onOpenAssistant={(mode) => {
                setSelectedAgentMode('energy');
                setAutoAssistantListen(true);
                setIsAssistantOpen(true);
              }}
            />
          </motion.div>
        );
      case 'water':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto pb-20 px-4"
          >
             <div className="flex justify-start mb-6">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <WaterGuardian onClose={() => setView('home')} userName={heroName} />
          </motion.div>
        );
      case 'gas':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto pb-20 px-4"
          >
             <div className="flex justify-start mb-6">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <GasMaster onClose={() => setView('home')} userName={heroName} />
          </motion.div>
        );
      case 'jobs':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto pb-20 px-4"
          >
             <div className="flex justify-start mb-6">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <JobScout 
              isOpen={true} 
              onClose={() => setView('home')} 
              detectedCity={detectedCity || undefined} 
              userName={heroName || undefined} 
            />
          </motion.div>
        );
      case 'pathfinder':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mx-auto pb-20 px-4"
          >
             <div className="flex justify-start mb-6">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <PathfinderIntelligence 
              onClose={() => setView('home')} 
              detectedCity={detectedCity || undefined} 
              userName={heroName || undefined} 
            />
          </motion.div>
        );
      case 'coupons':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mx-auto pb-20 px-4"
          >
             <div className="flex justify-start mb-6">
              <button 
                onClick={() => setView('home')}
                className="p-3 bg-white dark:bg-neutral-800 rounded-2xl text-neutral-500 hover:text-red-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <X size={20} /> Close Unit
              </button>
            </div>
            <CouponScout 
              onClose={() => setView('home')} 
              userName={heroName || undefined} 
            />
          </motion.div>
        );
      default:
        return (
          <>
            {detectedCity && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mb-8 bg-emerald-green/10 border border-emerald-green border-dashed rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(16,185,129,0.1)]"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <MapPin className="text-emerald-green animate-bounce" size={24} />
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Localized Intelligence Active</h3>
                </div>
                <p className="text-emerald-green font-bold text-lg">Showing the absolute BEST hidden deals in <span className="underline decoration-2 underline-offset-4">{detectedCity}</span> today.</p>
              </motion.div>
            )}

            {heroName && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl mb-12 bg-gradient-to-r from-yellow-600/20 via-yellow-400/20 to-yellow-600/20 border-2 border-yellow-400/50 rounded-3xl p-10 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="relative z-10">
                  <Trophy className="text-yellow-500 w-16 h-16 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-5xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic mb-4 leading-none">
                    COMMUNITY HERO SPOTLIGHT
                  </h2>
                  <p className="text-2xl font-bold text-yellow-500 mb-6">
                    Saluting <span className="bg-yellow-400 text-black px-4 py-1 rounded inline-block transform -rotate-2">{heroName}</span>
                  </p>
                  <p className="max-w-xl mx-auto text-neutral-500 font-medium leading-relaxed">
                    This hero has saved a fortune for their community using Versusfy. Join the movement and start your tactical comparison today.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Category selection remains here */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <button 
                onClick={() => setIsCalculatorOpen(true)}
                className="group relative px-8 py-3 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-white/20"
              >
                <Calculator className="text-black group-hover:rotate-12 transition-transform" size={20} />
                <span className="text-black font-black uppercase tracking-tighter italic">Launch Savings Calculator</span>
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-bounce">
                  AUDIT NOW
                </div>
              </button>

              <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-2">
              {[
                { id: 'standard', label: 'Products', icon: ShoppingBag, color: 'bg-emerald-green' },
                { id: 'prompts', label: 'AI Prompts', icon: Wand2, color: 'bg-purple-600' },
                { id: 'websites', label: 'Websites', icon: Layout, color: 'bg-blue-600' },
                { id: 'ai_models', label: 'AI Models', icon: Brain, color: 'bg-indigo-600' },
                { id: 'restaurants', label: 'Restaurants', icon: Utensils, color: 'bg-orange-600' },
                { id: 'video_games', label: 'Video Games', icon: Gamepad2, color: 'bg-pink-600' },
                { id: 'toys', label: 'Toys', icon: ToyBrick, color: 'bg-yellow-500' },
                { id: 'jewelry', label: 'Jewelry', icon: Gem, color: 'bg-pink-400' },
                { id: 'pharmacy', label: 'Pharmacy', icon: Pill, color: 'bg-emerald-500' },
                { id: 'academic', label: 'Academic', icon: GraduationCap, color: 'bg-blue-500' },
                { id: 'musical', label: 'Musical', icon: Music, color: 'bg-amber-500' },
                { id: 'electrician', label: 'Electrician', icon: Zap, color: 'bg-yellow-400' }
              ].map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setComparisonCategory(cat.id as any)}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl font-bold text-[10px] md:text-xs transition border ${comparisonCategory === cat.id ? `${cat.color} text-white border-transparent shadow-lg shadow-black/10` : 'bg-white dark:bg-neutral-900 text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'}`}
                >
                  <cat.icon size={13} /> {cat.label}
                </button>
              ))}
            </div>
          </div>

            <p className="text-neutral-500 dark:text-neutral-500 text-center mb-4">
              Ready to find your perfect match? Just tell us which {comparisonCategory === 'standard' ? 'products' : comparisonCategory.replace('_', ' ')} you’d love to compare below.
            </p>
            
            {bannerPhrase && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => trackClick(bannerPhrase.id!)}
                className="w-full max-w-2xl mb-8 p-6 bg-white dark:bg-neutral-900 border-4 border-red-500 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.5)] cursor-pointer overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-center text-red-500 uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                  {bannerPhrase.text}
                </h3>
              </motion.div>
            )}

            <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 p-4 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl">
              <div className="flex flex-col gap-6 mb-6">
                {/* Item A Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">
                    {comparisonCategory === 'standard' ? 'Product A' : 
                     comparisonCategory === 'prompts' ? 'Prompt A' :
                     comparisonCategory === 'websites' ? 'Website A' :
                     comparisonCategory === 'ai_models' ? 'AI Model A' : 
                     comparisonCategory === 'video_games' ? 'Video Game A' : 
                     comparisonCategory === 'toys' ? 'Toy A' : 
                     comparisonCategory === 'jewelry' ? 'Jewelry A' : 
                     comparisonCategory === 'pharmacy' ? 'Medication A' : 
                     comparisonCategory === 'academic' ? 'Topic A' : 'Restaurant A'}
                  </label>
                  <div className="flex flex-col md:flex-row gap-2">
                    {comparisonCategory === 'prompts' ? (
                      <textarea
                        placeholder="Paste first prompt here..."
                        value={productA}
                        onChange={(e) => setProductA(e.target.value)}
                        className="flex-grow bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:border-purple-600 outline-none transition text-neutral-900 dark:text-white h-32 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={`Enter first ${comparisonCategory === 'standard' ? 'product' : comparisonCategory.replace('_', ' ')}...`}
                        value={productA}
                        onChange={(e) => setProductA(e.target.value)}
                        className="flex-grow bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:border-emerald-green outline-none transition text-neutral-900 dark:text-white"
                      />
                    )}
                    {comparisonCategory === 'standard' && (
                      <button
                        onClick={handleFindSimilar}
                        disabled={loadingSimilar || !productA}
                        className="bg-emerald-green hover:bg-emerald-600 text-white px-6 py-4 rounded-lg transition shadow-lg shadow-emerald-green/20 flex items-center justify-center gap-2 font-bold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed h-full md:h-auto"
                      >
                        {loadingSimilar ? <Loader2 className="animate-spin size-5" /> : <Search size={20} />}
                        <span className="md:hidden lg:inline text-sm">Suggestions</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggestions Section */}
                <AnimatePresence>
                  {comparisonCategory === 'standard' && similarProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-3 overflow-hidden"
                    >
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Choose a suggestion</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {similarProducts.map((p) => (
                          <button
                            key={p}
                            onClick={() => setProductB(p)}
                            className={`text-xs p-3 rounded-xl border transition-all text-left truncate ${
                              productB === p 
                                ? 'bg-emerald-green/20 border-emerald-green text-emerald-green font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-emerald-green/50'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tools & Entry Center Box */}
                <div className="flex flex-col gap-2 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700">
                  <div className="flex justify-center items-center gap-2 mb-1">
                    <label className="text-[10px] uppercase tracking-widest text-emerald-green font-bold text-center italic">Tactical Discovery Tools</label>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    {comparisonCategory === 'prompts' ? (
                      <textarea
                        placeholder="Paste second prompt here..."
                        value={productB}
                        onChange={(e) => setProductB(e.target.value)}
                        className="flex-grow bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:border-purple-600 outline-none transition text-neutral-900 dark:text-white h-32 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={comparisonCategory === 'standard' ? "Can't find it? Type here or use tools..." : 
                                     comparisonCategory === 'video_games' ? "Enter second video game..." :
                                     comparisonCategory === 'toys' ? "Enter second toy..." :
                                     comparisonCategory === 'jewelry' ? "Enter second jewelry piece..." :
                                     comparisonCategory === 'pharmacy' ? "Enter second medication..." :
                                     comparisonCategory === 'academic' ? "Enter second academic topic..." :
                                     `Enter second ${comparisonCategory.replace('_', ' ')}...`}
                        value={productB}
                        onChange={(e) => setProductB(e.target.value)}
                        className="flex-grow bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:border-emerald-green outline-none transition text-neutral-900 dark:text-white"
                      />
                    )}
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={startListening}
                        className={`flex-1 md:flex-none p-4 rounded-lg transition shadow-lg flex items-center justify-center ${isListening ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700'}`}
                        title="Voice Entry"
                      >
                        <Mic size={20} />
                      </button>
                      <button
                        onClick={() => setIsVisualSearchOpen(true)}
                        className="flex-1 md:flex-none p-4 rounded-lg bg-emerald-green text-white hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center"
                        title="Visual Intelligence"
                      >
                        <Camera size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Final Selection Confirmation */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Comparison Target</label>
                  <div className="relative group">
                    <input
                      type="text"
                      readOnly
                      placeholder="Selected items..."
                      value={productA && productB ? `${productA.slice(0, 30)}... VS ${productB.slice(0, 30)}...` : ''}
                      className="w-full bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 outline-none transition text-neutral-900 dark:text-white font-black italic select-none"
                    />
                    {(productA || productB) && (
                      <button 
                        onClick={() => { setProductA(''); setProductB(''); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompare}
                disabled={loading || !productA || !productB}
                className={`w-full text-white font-black py-5 rounded-xl transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-tighter shadow-xl active:scale-[0.98] ${
                  comparisonCategory === 'prompts' ? 'bg-purple-600 shadow-purple-600/20 hover:bg-purple-700' :
                  comparisonCategory === 'websites' ? 'bg-blue-600 shadow-blue-600/20 hover:bg-blue-700' :
                  comparisonCategory === 'ai_models' ? 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700' :
                  comparisonCategory === 'restaurants' ? 'bg-orange-600 shadow-orange-600/20 hover:bg-orange-700' :
                  comparisonCategory === 'video_games' ? 'bg-pink-600 shadow-pink-600/20 hover:bg-pink-700' :
                  comparisonCategory === 'toys' ? 'bg-yellow-500 shadow-yellow-500/20 hover:bg-yellow-600' :
                  comparisonCategory === 'jewelry' ? 'bg-pink-400 shadow-pink-400/20 hover:bg-pink-500' :
                  comparisonCategory === 'pharmacy' ? 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700' :
                  comparisonCategory === 'academic' ? 'bg-blue-600 shadow-blue-600/20 hover:bg-blue-700' :
                  'bg-apple-red shadow-red-500/20 hover:bg-red-600'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search className="w-6 h-6" />}
                Compare {comparisonCategory === 'standard' ? 'Products' : 
                         comparisonCategory === 'prompts' ? 'AI Prompts' :
                         comparisonCategory === 'websites' ? 'Websites' :
                         comparisonCategory === 'ai_models' ? 'AI Models' : 
                         comparisonCategory === 'video_games' ? 'Video Games' :
                         comparisonCategory === 'toys' ? 'Toys' : 
                         comparisonCategory === 'jewelry' ? 'Jewelry' : 
                         comparisonCategory === 'pharmacy' ? 'Medication' : 
                         comparisonCategory === 'academic' ? 'Topics' : 'Restaurants'}
              </button>
            </div>

            {comparison && (
               <ComparisonResultView 
                 comparison={comparison} 
                 productA={productA} 
                 productB={productB} 
                 dealsUnlocked={dealsUnlocked}
                 setDealsUnlocked={setDealsUnlocked}
                 alertEmail={alertEmail}
                 setAlertEmail={setAlertEmail}
                 alertSuccess={alertSuccess}
                 setAlertSuccess={setAlertSuccess}
                 userVote={userVote}
                 setUserVote={setUserVote}
                 amazonData={amazonData}
                 walmartData={walmartData}
                 ebayData={ebayData}
                 homeDepotData={homeDepotData}
                 bestBuyData={bestBuyData}
                 officeDepotData={officeDepotData}
                 toysRUsData={toysRUsData}
                 walgreensData={walgreensData}
                 cvsData={cvsData}
                 autoZoneData={autoZoneData}
                 pepBoysData={pepBoysData}
                 advanceAutoData={advanceAutoData}
                 oreillyData={oreillyData}
                 guitarCenterData={guitarCenterData}
                 sweetwaterData={sweetwaterData}
                 musiciansFriendData={musiciansFriendData}
                 samAshData={samAshData}
               />
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-12 flex flex-col items-center relative overflow-x-hidden">
      <AnimatePresence>
        {currentSubliminal && (
          <div
            className="fixed z-50 pointer-events-none text-neutral-500 opacity-[0.005] text-[5px] uppercase tracking-[0.3em] whitespace-nowrap"
            style={{ 
              top: subliminalPos.top, 
              left: subliminalPos.left,
              transform: 'translate(-50%, -50%)' 
            }}
          >
            {currentSubliminal.text}
          </div>
        )}
      </AnimatePresence>

      <FirebaseStatus />

      {/* IA Agents Sidebar Dropdown */}
      <div className="fixed left-3 sm:left-6 top-3 sm:top-6 z-[60]">
        <div className="relative">
          <button 
            onClick={() => setIsIAAgentsOpen(!isIAAgentsOpen)}
            className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl hover:border-emerald-green transition-all group active:scale-95"
          >
            <div className="w-8 h-8 sm:w-8 sm:h-8 bg-emerald-green/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-green group-hover:text-white transition-colors">
              <Bot size={16} className={`sm:w-5 sm:h-5 ${isIAAgentsOpen ? 'rotate-12' : ''}`} />
            </div>
            <span className="font-black uppercase tracking-tighter text-[10px] sm:text-sm text-neutral-900 dark:text-white pr-2">IA Agents</span>
            <ChevronDown className={`transition-transform duration-300 transform-gpu ${isIAAgentsOpen ? 'rotate-180' : ''}`} size={16} />
          </button>

          <AnimatePresence>
            {isIAAgentsOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: -20, transformOrigin: 'top left' }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                className="absolute top-full left-0 mt-3 w-[calc(100vw-2.5rem)] sm:w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-y-auto max-h-[70vh] p-3 space-y-1 z-50 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95 custom-scrollbar pb-6"
              >
                <div className="px-4 py-3 mb-2 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md z-10 pt-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[.2em]">Operational Units</h4>
                    <p className="text-[8px] font-bold text-emerald-green uppercase tracking-widest mt-0.5">Deployment Ready</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsIAAgentsOpen(false); }}
                    className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl text-neutral-500 hover:text-red-500 transition-all shadow-sm"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-4 pt-2 px-2 no-scrollbar scroll-smooth">
                  {[
                    { label: 'All', icon: Bot },
                    { label: 'Shop', icon: ShoppingBag },
                    { label: 'Home', icon: Home },
                    { label: 'Tech', icon: Zap },
                    { label: 'Style', icon: Sparkles }
                  ].map((cat, i) => (
                    <button 
                      key={i} 
                      onClick={() => setAgentFilter(cat.label)}
                      className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${agentFilter === cat.label ? 'bg-emerald-green text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                    >
                      <cat.icon size={12} />
                      {cat.label}
                    </button>
                  ))}
                </div>
                {[
                  { view: 'personal-buyer', label: 'My Personal Buyer', icon: ShoppingBag, color: 'text-emerald-green', bg: 'hover:bg-emerald-green/5', category: 'Shop' },
                  { view: 'style-advisor', label: 'Style Advisor', icon: Sparkles, color: 'text-pink-500', bg: 'hover:bg-pink-500/5', category: 'Style' },
                  { view: 'special-events', label: 'Special Events', icon: Sparkles, color: 'text-purple-500', bg: 'hover:bg-purple-500/5', category: 'Home' },
                  { view: 'gardening', label: 'Gardening Scout', icon: Sprout, color: 'text-green-500', bg: 'hover:bg-green-500/5', category: 'Home' },
                  { view: 'mechanic', label: 'Mechanic Scout', icon: Wrench, color: 'text-red-600', bg: 'hover:bg-red-600/5', category: 'Tech' },
                  { view: 'construction', label: 'Master Builder', icon: HardHat, color: 'text-orange-500', bg: 'hover:bg-orange-500/5', category: 'Home' },
                  { view: 'offices', label: 'Office Productivity', icon: Briefcase, color: 'text-indigo-500', bg: 'hover:bg-indigo-500/5', category: 'Tech' },
                  { view: 'video-games', label: 'Video Games Assistant', icon: Gamepad2, color: 'text-pink-600', bg: 'hover:bg-pink-600/5', category: 'Tech' },
                  { view: 'toys', label: 'Toy Scout', icon: ToyBrick, color: 'text-yellow-500', bg: 'hover:bg-yellow-500/5', category: 'Shop' },
                  { view: 'pharmacy', label: 'Pharmacy Scout', icon: Pill, color: 'text-emerald-500', bg: 'hover:bg-emerald-500/5', category: 'Shop' },
                  { view: 'academic', label: 'Academic Master', icon: GraduationCap, color: 'text-blue-500', bg: 'hover:bg-blue-500/5', category: 'Tech' },
                  { view: 'musical', label: 'Musical Scout', icon: Music, color: 'text-amber-500', bg: 'hover:bg-amber-500/5', category: 'Tech' },
                  { view: 'electrician', label: 'Electrician Scout', icon: Zap, color: 'text-yellow-400', bg: 'hover:bg-yellow-400/5', category: 'Tech' },
                  { view: 'housing', label: 'Housing Locator', icon: Building2, color: 'text-amber-600', bg: 'hover:bg-amber-600/5', category: 'Home' },
                  { view: 'fuel', label: 'Fuel Scout', icon: Fuel, color: 'text-amber-500', bg: 'hover:bg-amber-500/5', category: 'Home' },
                  { view: 'water', label: 'Water Guardian', icon: Droplets, color: 'text-blue-500', bg: 'hover:bg-blue-500/5', category: 'Home' },
                  { view: 'gas', label: 'Gas Master', icon: Flame, color: 'text-orange-500', bg: 'hover:bg-orange-500/5', category: 'Home' },
                  { view: 'jobs', label: 'Job Scout', icon: Briefcase, color: 'text-blue-500', bg: 'hover:bg-blue-500/5', category: 'Tech' },
                  { view: 'pathfinder', label: 'Pathfinder Intelligence', icon: Navigation, color: 'text-red-500', bg: 'hover:bg-red-500/5', category: 'Tech' },
                  { view: 'coupons', label: 'Coupon Scout', icon: Ticket, color: 'text-emerald-500', bg: 'hover:bg-emerald-500/5', category: 'Sale' },
                ].filter(agent => agentFilter === 'All' || agent.category === agentFilter).map((agent: any) => (
                   <button
                      key={agent.view}
                      onClick={() => { setView(agent.view); setIsIAAgentsOpen(false); }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition group/item ${view === agent.view ? 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700' : `bg-transparent ${agent.bg}`}`}
                   >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 group-hover/item:scale-110 transition-transform ${agent.color}`}>
                          <agent.icon size={20} />
                        </div>
                        <span className={`font-bold text-xs uppercase tracking-tight ${view === agent.view ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400 group-hover/item:text-neutral-900 dark:group-hover/item:text-white'}`}>{agent.label}</span>
                      </div>
                      {view === agent.view && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-green animate-pulse" />
                      )}
                   </button>
                ))}
                
                <div className="pt-2 mt-2 px-1">
                   <button 
                     onClick={() => setIsIAAgentsOpen(false)}
                     className="w-full flex items-center justify-center gap-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-500 hover:text-red-500 font-black uppercase text-[10px] tracking-widest transition-all border border-transparent hover:border-red-500/20"
                   >
                     <X size={14} /> Close Menu
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <header className="mb-12 text-center flex flex-col items-center gap-4">
        <div className="flex gap-2 items-center">
          <WeatherGPSWidget weather={weather} />
          <button onClick={toggleTheme} className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white transition">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={handleReset} className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white transition">
            <RotateCcw size={20} />
          </button>
        </div>
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 px-4">
          {/* Left Trending Window */}
          <AnimatePresence>
            {trendingData.length >= 2 && (
              <div className="hidden xl:block">
                <TrendingWindow comparison={trendingData[0]} side="left" />
              </div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-emerald-green relative">
              <img src="https://i.imgur.com/Oyl75Xx.png" alt="Versusfy Logo" className="h-24 md:h-40 w-auto" referrerPolicy="no-referrer" />
              <div className="absolute -top-4 -right-12 bg-apple-red text-white text-[8px] font-black px-2 py-0.5 rounded-full rotate-12 shadow-lg border-2 border-white dark:border-neutral-950">
                SUPREME ELITE
              </div>
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400 mt-2">
              ( Coming Soon) We are in construction!
            </p>
          </div>

          {/* Right Trending Window */}
          <AnimatePresence>
            {trendingData.length >= 2 && (
              <div className="hidden xl:block">
                <TrendingWindow comparison={trendingData[1]} side="right" />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Trending Windows (Visible below logo on smaller screens) */}
        <AnimatePresence>
          {trendingData.length >= 2 && (
            <div className="flex flex-col md:flex-row xl:hidden gap-4 mt-6">
              <TrendingWindow comparison={trendingData[0]} side="left" />
              <TrendingWindow comparison={trendingData[1]} side="right" />
            </div>
          )}
        </AnimatePresence>
        
        <DailyInsights />

        <p className="text-neutral-600 dark:text-neutral-400">Pick Your Winner!</p>
        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-4 text-center">
            <span className={`flex items-center gap-1 text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded transition-colors ${comparison ? 'bg-blue-500/20 text-blue-500' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
              <TrendingDown size={11} /> {comparison ? 'Price Tracking Active' : 'Price Tracking Ready'}
            </span>
            <span className={`flex items-center gap-1 text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded transition-colors ${comparison ? 'bg-purple-500/20 text-purple-500' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
              <Ticket size={11} /> {comparison ? 'Coupons Found' : 'Coupon Tracker Ready'}
            </span>
          </div>
          {comparison && (
            <button 
              onClick={() => document.getElementById('trackers-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[10px] uppercase tracking-widest text-emerald-green font-black hover:underline flex items-center gap-1"
            >
              Scroll to Deals & Alerts ↓
            </button>
          )}
        </div>
      </header>

      {renderContent()}

      <div className="mt-12 flex flex-wrap gap-4 justify-center">
        <button 
          onClick={() => {
            const subject = "Versusfy Supreme Intel";
            const body = `Discover tactical savings with Versusfy: ${window.location.href}`;
            window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
          }}
          className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:text-emerald-green transition" 
          title="Share via Gmail"
        >
          <Mail size={20} />
        </button>

        <button 
          onClick={() => {
            const text = `Join the Versusfy Tactical Squad for supreme savings: ${window.location.href}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }}
          className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:text-emerald-green transition" 
          title="Share via WhatsApp"
        >
          <MessageCircle size={20} />
        </button>

        <a href="https://www.facebook.com/sharer/sharer.php?u=https://ais-dev-rjoxv6rallpuqxkdtqgktv-88535320641.us-east1.run.app" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:text-emerald-green transition"><Facebook size={20} /></a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:text-emerald-green transition"><Instagram size={20} /></a>
        <a href="https://twitter.com/intent/tweet?url=https://ais-dev-rjoxv6rallpuqxkdtqgktv-88535320641.us-east1.run.app" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:text-emerald-green transition"><Twitter size={20} /></a>
        <a href="https://www.threads.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:text-emerald-green transition"><AtSign size={20} /></a>
      </div>

      <footer className="mt-auto pt-8 sm:pt-12 flex flex-col items-center gap-4 text-neutral-500 pb-8">
        <div className="w-full bg-neutral-900 border-t border-b border-emerald-green/10 py-1 sm:py-2 overflow-hidden mb-4 sm:mb-8 shadow-2xl">
          <div className="flex gap-8 sm:gap-12 whitespace-nowrap animate-marquee">
            {Array.from({ length: 15 }).map((_, i) => (
              <span key={i} className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 sm:gap-4">
                {i % 3 === 0 ? (
                  <>
                    <Zap size={8} className="text-emerald-green sm:w-2.5 sm:h-2.5" /> 
                    <span className="text-emerald-green">Win the afternoon with Versusfy</span>
                    <span className="text-emerald-green/20">|</span>
                  </>
                ) : i % 3 === 1 ? (
                  <>
                    <Zap size={8} className="text-emerald-green sm:w-2.5 sm:h-2.5" /> 
                    <span className="text-apple-red">Mother's Day Special: Gifts & Deals</span>
                    <span className="text-emerald-green/20">|</span>
                  </>
                ) : (
                  <>
                    <Zap size={8} className="text-emerald-green sm:w-2.5 sm:h-2.5" /> 
                    GLOBAL SAVINGS: <span className="text-white">${footerStats.savings.toLocaleString()}</span>
                    <span className="text-emerald-green/20">|</span>
                  </>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 justify-center px-4 text-[10px] sm:text-xs">
          <button onClick={() => setView('home')} className="flex items-center gap-1 hover:text-white transition"><Home size={14}/> Home</button>
          <button onClick={() => setView('special-events')} className="flex items-center gap-1 hover:text-white transition group"><Sparkles size={14}/> Events</button>
          <button onClick={() => setIsCalculatorOpen(true)} className="flex items-center gap-1 hover:text-white transition group">
            <Calculator size={14} className="text-[#FFD700] group-hover:animate-pulse"/>
            <span className="text-[#FFD700] font-black uppercase tracking-tighter">Savings</span>
          </button>
          <button onClick={() => setView('about')} className="flex items-center gap-1 hover:text-white transition"><Info size={14}/> About</button>
          <button onClick={() => setView('faq')} className="flex items-center gap-1 hover:text-white transition"><HelpCircle size={14}/> FAQ</button>
          <button onClick={() => setView('benefits')} className="flex items-center gap-1 hover:text-white transition"><Info size={14}/> Benefits</button>
          <button onClick={() => setView('global-intel')} className="flex items-center gap-1 hover:text-white transition font-black text-emerald-green"><Globe size={14}/> Intel</button>
          <button onClick={() => setView('privacy')} className="flex items-center gap-1 hover:text-white transition"><ShieldCheck size={14}/> Privacy</button>
          <button onClick={() => setView('contact')} className="flex items-center gap-1 hover:text-white transition"><Mail size={14}/> Contact</button>
        </div>
        <div className="text-[10px] opacity-30 uppercase tracking-[0.2em] font-mono">
          Versusfy Engine v2.2.0-OMNI
        </div>
        {(window as any).VERSUSFY_RUNTIME_CONFIG?.serverVersion !== "2.2.0-OMNI" && (
          <div className="text-[11px] text-red-500 font-bold uppercase text-center mt-2 px-4 py-2 border border-red-500/20 rounded-lg bg-red-500/5">
            CRITICAL CACHE CONFLICT: Please Clear Browser Data & Refresh (Ctrl+Shift+R)
          </div>
        )}
      </footer>

      <canvas 
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none -z-10 w-full h-full"
      />

      <CaptchaModal 
        isOpen={showCaptcha}
        onVerify={onCaptchaVerify}
        onClose={() => setShowCaptcha(false)}
      />

      <VisualSearch 
        isOpen={isVisualSearchOpen}
        onClose={() => { 
          setIsVisualSearchOpen(false); 
          // Only clear if not in a scout view
          if (!['fuel', 'pharmacy', 'gardening', 'mechanic', 'construction', 'style-advisor', 'offices', 'pathfinder'].includes(view)) {
            setSelectedAgentMode(undefined); 
          }
        }}
        initialAgentMode={selectedAgentMode}
        initialQuery={(selectedAgentMode === 'energy' || selectedAgentMode === 'pharmacy') ? productB : undefined}
        onIdentified={(name) => {
          setProductB(name);
          setShowCaptcha(true); // Trigger comparison immediately after identification
        }}
      />

      <OmniAssistant 
        isOpen={isAssistantOpen}
        onClose={() => { 
          setIsAssistantOpen(false); 
          setAutoAssistantListen(false); 
          if (!['fuel', 'pharmacy', 'gardening', 'mechanic', 'construction', 'style-advisor', 'offices', 'pathfinder'].includes(view)) {
            setSelectedAgentMode(undefined); 
          }
        }}
        userName={heroName}
        onUserNameDetected={(name) => setHeroName(name)}
        autoStartListening={autoAssistantListen}
        agentMode={selectedAgentMode as any}
        onComparisonRequested={(a, b) => {
          setProductA(a);
          setProductB(b);
          setIsOmniMode(true);
          handleCompare();
          setIsAssistantOpen(false);
        }}
      />

      {/* Omni-Mode Magic Button (Floating Assistant) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={async () => {
          await ensureAudioUnlocked().catch(() => {});
          
          // Contextual mode setting if no mode is explicitly active
          if (!selectedAgentMode) {
             if (view === 'fuel') setSelectedAgentMode('energy');
             else if (view === 'style-advisor') setSelectedAgentMode('style');
             else if (view === 'mechanic') setSelectedAgentMode('mechanic');
             else if (view === 'construction') setSelectedAgentMode('builder');
             else if (view === 'offices') setSelectedAgentMode('office');
             else if (view === 'gardening') setSelectedAgentMode('gardening');
             else if (view === 'pharmacy') setSelectedAgentMode('pharmacy');
             else if (view === 'toys') setSelectedAgentMode('toy');
             else if (view === 'video-games') setSelectedAgentMode('gamer');
             else if (view === 'academic') setSelectedAgentMode('academic');
             else if (view === 'musical') setSelectedAgentMode('musical');
             else if (view === 'jobs') setSelectedAgentMode('job');
             else if (view === 'electrician') setSelectedAgentMode('energy');
             else if (view === 'pathfinder') setSelectedAgentMode('pathfinder');
             else if (view === 'coupons') setSelectedAgentMode('coupon');
          }
          
          setIsAssistantOpen(true);
        }}
        className="fixed bottom-24 right-4 sm:right-8 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all overflow-hidden border-4 border-white flex flex-col"
        title="Activate Omni-Assistant Magic"
      >
        <div className="flex-1 bg-emerald-green" />
        <div className="h-3 sm:h-4 bg-white relative">
           <div className="absolute inset-0 bg-black/10 m-auto h-1.5 sm:h-2 w-6 sm:w-8 rounded-full" />
        </div>
        <div className="flex-1 bg-apple-red" />
        {isAssistantOpen && (
          <span className="absolute -top-10 sm:-top-12 right-0 bg-emerald-green text-white text-[7px] sm:text-[8px] font-black px-2 py-1 rounded-lg animate-bounce whitespace-nowrap">
            ASSISTANT ACTIVE
          </span>
        )}
      </motion.button>
      
      {/* Tactical Version Tag */}
      <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[8px] font-mono text-white/40 uppercase tracking-[0.2em]">
          Versusfy System <span className="text-emerald-green font-black">v2.2.0-OMNI</span>
        </div>
      </div>

      <SavingsCalculator 
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        detectedCity={detectedCity}
        onUpdateHeroSavings={(amount) => {
          setHeroSavingsAmount(amount);
          setShowHeroShare(true);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#00CED1', '#FF3131']
          });
        }}
      />

      <AnimatePresence>
        {showHeroShare && (
          <HeroStatusShare 
            productA={productA || 'Versusfy Intelligence'} 
            productB={productB || 'Market Competition'} 
            savings={comparison?.scoreA ? (comparison.scoreA * 0.8).toFixed(0) : "22"}
            savingsAmount={heroSavingsAmount}
            onClose={() => setShowHeroShare(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
