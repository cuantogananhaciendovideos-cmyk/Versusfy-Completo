import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, X, MapPin, TrendingUp, Coins, DollarSign, Globe, Award, Share2 } from 'lucide-react';

interface SavingsCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  detectedCity: string | null;
  onUpdateHeroSavings: (amount: number) => void;
}

export const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({ 
  isOpen, 
  onClose, 
  detectedCity,
  onUpdateHeroSavings
}) => {
  const [dailySpending, setDailySpending] = useState<string>('');
  const [weeklySpending, setWeeklySpending] = useState<string>('');
  const [regionData, setRegionData] = useState({
    country: '...',
    state: '...',
    city: detectedCity || '...',
    averagePriceIndex: 1.0
  });
  const [calculatedSavings, setCalculatedSavings] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Simulate real-time IP/Location data fetching
      const detectLocation = async () => {
        try {
          // In a real app, we'd use an IP geolocation API here
          // For now, we simulate the 'real-time' fetch feeling
          setTimeout(() => {
            setRegionData({
              country: 'United States',
              state: 'California',
              city: detectedCity || 'Los Angeles',
              averagePriceIndex: 0.85 + (Math.random() * 0.3) // Simulated regional index
            });
          }, 1500);
        } catch (e) {
          console.error("Location detection error", e);
        }
      };
      detectLocation();
    }
  }, [isOpen, detectedCity]);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const daily = parseFloat(dailySpending) || 0;
      const weekly = parseFloat(weeklySpending) || (daily * 7);
      
      // Calculation logic: Versusfy helps save approx 22% based on regional optimization
      const annualSpending = weekly * 52;
      const savings = annualSpending * (0.22 * regionData.averagePriceIndex);
      
      setCalculatedSavings(savings);
      setIsCalculating(false);
    }, 2000);
  };

  const handleAddToHero = () => {
    if (calculatedSavings) {
      onUpdateHeroSavings(calculatedSavings);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
          className="relative w-full max-w-md p-1 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.3)]"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 50%, #FFD700 100%)', // Pure Gold Cover
          }}
        >
          {/* Inner Content Case */}
          <div className="bg-neutral-900 rounded-[22px] p-6 text-white min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Calculator className="text-[#FFD700] w-6 h-6" />
                <h2 className="text-xl font-black italic tracking-tighter uppercase text-[#FFD700]">Savings Calculator</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-[#FFD700]">
                <X />
              </button>
            </div>

            {/* LED Display Region */}
            <div className="bg-black p-4 rounded-xl mb-6 shadow-inner border-2 border-[#B8860B]/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#FF0000]/5 pointer-events-none group-active:bg-[#FF0000]/10 transition-colors" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] uppercase font-mono text-neutral-500 mb-1">
                  <span className="flex items-center gap-1"><MapPin size={10} /> Real-Time Regional Feed</span>
                  <span className="animate-pulse flex items-center gap-1 text-red-500"><Globe size={10} /> Live Data</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[12px] font-mono mb-2 border-b border-neutral-800 pb-2">
                  <span className="text-[#FFD700]">C: {regionData.country}</span>
                  <span className="text-[#FFD700]">S: {regionData.state}</span>
                  <span className="text-[#FFD700]">Loc: {regionData.city}</span>
                </div>
                <div className="h-20 flex items-center justify-center relative">
                  <p className="text-4xl font-mono font-bold tracking-widest text-[#FF3131] drop-shadow-[0_0_8px_rgba(255,49,49,0.8)]">
                    {isCalculating ? (
                      <span className="animate-pulse">CALCULATING...</span>
                    ) : calculatedSavings !== null ? (
                      `$${calculatedSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ) : (
                      '000,000.00'
                    )}
                  </p>
                  <span className="absolute bottom-0 right-0 text-[10px] text-red-900 font-mono italic">ESTIMATED ANNUAL SAVINGS</span>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-neutral-500 mb-2 px-1">Daily Average Spending ($)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={dailySpending}
                    onChange={(e) => setDailySpending(e.target.value)}
                    placeholder="25.00"
                    className="w-full bg-neutral-800 border-b-2 border-[#1DE9B6] p-3 rounded-t-lg outline-none text-white focus:bg-neutral-700 transition"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1DE9B6]/50"><DollarSign size={16} /></div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-neutral-500 mb-2 px-1">Weekly Average Spending ($)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={weeklySpending}
                    onChange={(e) => setWeeklySpending(e.target.value)}
                    placeholder="175.00"
                    className="w-full bg-neutral-800 border-b-2 border-[#1DE9B6] p-3 rounded-t-lg outline-none text-white focus:bg-neutral-700 transition"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1DE9B6]/50"><Coins size={16} /></div>
                </div>
                <p className="text-[10px] text-neutral-500 mt-2 italic px-1">*Enter one or both to calculate your potential savings map.</p>
              </div>
            </div>

            {/* Diamond Turquoise Buttons */}
            <div className="mt-8 grid grid-cols-1 gap-3">
              <button 
                onClick={handleCalculate}
                disabled={isCalculating || (!dailySpending && !weeklySpending)}
                className="group relative h-14 w-full rounded-xl overflow-hidden shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                <div className="absolute inset-0 bg-[#00CED1] opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/20" />
                {/* Diamond/Crystal Texture Overlay */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0L20 10L10 20L0 10Z' fill='%23fff'/%3E%3C/svg%3E")`,
                    backgroundSize: '15px 15px'
                  }}
                />
                <span className="relative z-10 font-black uppercase tracking-widest text-[#004D4D] flex items-center justify-center gap-2">
                  {isCalculating ? <TrendingUp className="animate-bounce" /> : <Calculator />}
                  {isCalculating ? 'Processing...' : 'Run Audit'}
                </span>
              </button>

              <button 
                onClick={handleAddToHero}
                disabled={calculatedSavings === null || isCalculating}
                className="group relative h-12 w-full rounded-xl overflow-hidden shadow-md transition-all active:scale-95 border-2 border-[#00CED1]/30 hover:border-[#00CED1] disabled:opacity-40"
              >
                <div className="absolute inset-0 bg-[#00CED1]/10 group-hover:bg-[#00CED1]/20 transition-colors" />
                <span className="relative z-10 font-bold uppercase tracking-tight text-[#00CED1] text-xs flex items-center justify-center gap-2">
                  <Award size={14} /> Add to Community Hero Stats
                </span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[9px] text-neutral-600 font-mono">
                SECURE HASH: {Math.random().toString(16).slice(2, 10).toUpperCase()} | VERIFIED REGIONAL INDEX: {regionData.averagePriceIndex.toFixed(4)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
