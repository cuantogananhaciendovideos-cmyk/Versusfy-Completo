import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, X, MapPin, TrendingUp, Coins, DollarSign, 
  Globe, Award, Share2, Download, MessageCircle, Twitter, Facebook,
  Zap, Droplets, Flame, ShoppingCart, Calendar, ArrowRightLeft
} from 'lucide-react';

interface SavingsChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  defaultSavingRate: number;
  color: string;
}

const TACTICAL_CHANNELS: SavingsChannel[] = [
  { id: 'fuel', name: 'Fuel Scout', icon: <Zap size={14} />, defaultSavingRate: 0.18, color: '#fbbf24' },
  { id: 'water', name: 'Water Guardian', icon: <Droplets size={14} />, defaultSavingRate: 0.25, color: '#60a5fa' },
  { id: 'gas', name: 'Gas Master', icon: <Flame size={14} />, defaultSavingRate: 0.15, color: '#f87171' },
  { id: 'grocery', name: 'Personal Buyer', icon: <ShoppingCart size={14} />, defaultSavingRate: 0.22, color: '#34d399' },
];

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
  const [spending, setSpending] = useState<string>('');
  const [activeChannels, setActiveChannels] = useState<string[]>(['fuel', 'grocery']);
  const [regionData, setRegionData] = useState({
    country: '...',
    state: '...',
    city: detectedCity || '...',
    averagePriceIndex: 1.0
  });
  const [calculatedSavings, setCalculatedSavings] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [viewMode, setViewMode] = useState<'annual' | 'breakdown'>('annual');

  useEffect(() => {
    if (isOpen) {
      const detectLocation = async () => {
        try {
          setTimeout(() => {
            setRegionData({
              country: 'United States',
              state: 'Tactical region',
              city: detectedCity || 'USA City',
              averagePriceIndex: 0.9 + (Math.random() * 0.2)
            });
          }, 800);
        } catch (e) {
          console.error("Location detection error", e);
        }
      };
      detectLocation();
    }
  }, [isOpen, detectedCity]);

  const stats = useMemo(() => {
    if (!calculatedSavings) return null;
    return {
      day: calculatedSavings / 365,
      week: calculatedSavings / 52,
      month: calculatedSavings / 12,
      year: calculatedSavings
    };
  }, [calculatedSavings]);

  const toggleChannel = (id: string) => {
    setActiveChannels(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setCalculatedSavings(null);

    setTimeout(() => {
      const baseValue = parseFloat(spending) || 0;
      if (baseValue <= 0) {
        setIsCalculating(false);
        return;
      }
      
      const totalSavingRate = activeChannels.reduce((acc, channelId) => {
        const channel = TACTICAL_CHANNELS.find(c => c.id === channelId);
        return acc + (channel?.defaultSavingRate || 0);
      }, 0) / (activeChannels.length || 1);

      // Final Annual Simulation
      const annualSpending = baseValue * 52; 
      const savings = annualSpending * totalSavingRate * regionData.averagePriceIndex;
      
      setCalculatedSavings(savings);
      setIsCalculating(false);
      setViewMode('breakdown');
    }, 1500);
  };

  const shareText = `Tactical update: I just identified an estimated $${calculatedSavings?.toFixed(2)} in annual savings using Versusfy! Efficiency maximized. #Versusfy #SavingsHero`;

  const handleDownload = () => {
    const data = {
      user: "Versusfy Hero",
      city: regionData.city,
      savings: stats,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `versusfy-savings-report.json`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.8, y: 100, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 100, opacity: 0 }}
          className="relative w-full max-w-xl p-1 rounded-[32px] overflow-hidden shadow-[0_0_60px_rgba(0,206,209,0.2)]"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 50%, #FFD700 100%)',
          }}
        >
          <div className="bg-neutral-950 rounded-[28px] p-6 text-white min-h-[600px] flex flex-col relative">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Calculator className="text-amber-500 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black italic tracking-tighter uppercase text-amber-500">Savings Matrix</h2>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={10} /> {regionData.city} | Regional Index: {regionData.averagePriceIndex.toFixed(3)}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition text-neutral-500 hover:text-white">
                <X />
              </button>
            </div>

            {/* Display Component */}
            <div className="bg-black/80 rounded-2xl p-6 mb-8 border border-neutral-800 relative group overflow-hidden">
              <div className="absolute top-2 right-4 flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              
              <div className="flex flex-col items-center justify-center py-4">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em] mb-2">Annual Potential Recovery</span>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={calculatedSavings || 'none'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-black italic text-emerald-500 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    {isCalculating ? 'AUDITING...' : calculatedSavings ? `$${calculatedSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                  </motion.p>
                </AnimatePresence>
              </div>

              {stats && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-4 gap-2 mt-6 pt-6 border-t border-neutral-800"
                >
                  {[
                    { label: 'Day', val: stats.day },
                    { label: 'Week', val: stats.week },
                    { label: 'Month', val: stats.month },
                    { label: 'Year', val: stats.year }
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-[10px] font-black italic text-emerald-500 tracking-tighter">${item.val.toFixed(2)}</p>
                      <p className="text-[8px] text-neutral-600 font-bold uppercase">{item.label}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {/* Input Area */}
              <div>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-3 px-1">Weekly Household Spending ($)</label>
                <div className="relative group">
                  <input 
                    type="number" 
                    value={spending}
                    onChange={(e) => setSpending(e.target.value)}
                    placeholder="250.00"
                    className="w-full bg-neutral-900 border-2 border-neutral-800 focus:border-amber-500/50 p-4 rounded-xl outline-none text-white font-bold transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-amber-500 transition-colors">
                    <DollarSign size={20} />
                  </div>
                </div>
              </div>

              {/* TACTICAL CHANNELS */}
              <div>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 px-1">Active Optimization Channels</label>
                <div className="grid grid-cols-2 gap-3">
                   {TACTICAL_CHANNELS.map(channel => (
                     <button
                        key={channel.id}
                        onClick={() => toggleChannel(channel.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          activeChannels.includes(channel.id) 
                            ? 'bg-neutral-800 border-neutral-600' 
                            : 'bg-transparent border-neutral-900 opacity-40 hover:opacity-100'
                        }`}
                     >
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${channel.color}20`, color: channel.color }}
                        >
                          {channel.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tight">{channel.name}</span>
                        {activeChannels.includes(channel.id) && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                     </button>
                   ))}
                </div>
              </div>

              {/* SOCIAL HUB */}
              {calculatedSavings && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-2xl"
                >
                  <h4 className="text-[9px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Share2 size={12} className="text-amber-500" /> Operation Share: Influence the Community
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                      className="p-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl flex items-center justify-center transition"
                      target="_blank" rel="noreferrer"
                    >
                      <MessageCircle size={18} />
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                      className="p-3 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl flex items-center justify-center transition"
                      target="_blank" rel="noreferrer"
                    >
                      <Twitter size={18} />
                    </a>
                    <a 
                      href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      className="p-3 bg-sky-600/10 hover:bg-sky-600 text-sky-600 hover:text-white rounded-xl flex items-center justify-center transition"
                      target="_blank" rel="noreferrer"
                    >
                      <Facebook size={18} />
                    </a>
                    <button 
                      onClick={handleDownload}
                      className="p-3 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white rounded-xl flex items-center justify-center transition"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 grid grid-cols-1 gap-3">
              <button 
                onClick={handleCalculate}
                disabled={isCalculating || !spending}
                className="group relative h-14 w-full rounded-2xl overflow-hidden shadow-xl active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-[#00CED1] opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20" />
                <span className="relative z-10 font-black uppercase tracking-[0.2em] text-[#004D4D] flex items-center justify-center gap-2">
                  {isCalculating ? <ArrowRightLeft className="animate-spin" /> : <Calculator size={20} />}
                  {isCalculating ? 'Auditing Markets...' : 'Execute Calculation'}
                </span>
              </button>

              {calculatedSavings && (
                <button 
                  onClick={() => {
                    onUpdateHeroSavings(calculatedSavings);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-white transition py-2"
                >
                  <Award size={14} /> Submit Findings to Community Feed
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
