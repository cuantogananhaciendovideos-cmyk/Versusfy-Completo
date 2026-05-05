import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Search, CheckCircle2, Copy, ExternalLink, Loader2, Zap, ShieldCheck, Clock, X, Volume2, VolumeX } from 'lucide-react';
import { searchTacticalCoupons, TacticalCoupon, getCouponIntelligenceSpeech } from '../services/couponService';
import { speak, stopSpeaking } from '../lib/speech';

export const CouponScout = ({ onClose, userName }: { onClose: () => void, userName?: string }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<TacticalCoupon[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const results = await searchTacticalCoupons(query);
      setCoupons(results);
      
      const speech = await getCouponIntelligenceSpeech(query, results.length);
      speak(speech, {
        voice: 'Fenrir',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCoupon = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      setVerifyingId(null);
    }, 2000);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-neutral-900 border border-emerald-500/30 w-full rounded-3xl overflow-hidden flex flex-col h-[85vh] shadow-[0_0_100px_rgba(16,185,129,0.1)]">
      {/* Header */}
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
        <div className="flex items-center gap-4">
          <div className={`bg-emerald-green/10 p-3 rounded-2xl border border-emerald-green/20 ${isSpeaking ? 'animate-pulse' : ''}`}>
            <Ticket size={28} className="text-emerald-green" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Tactical Coupon Scout</h2>
            <p className="text-[10px] text-emerald-green font-bold tracking-widest uppercase mt-1">High-Yield Discount Audit Unit</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {isSpeaking && (
             <button onClick={() => { stopSpeaking(); setIsSpeaking(false); }} className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 transition-all hover:bg-red-500/20"><VolumeX size={18} /></button>
           )}
           <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-xl transition text-neutral-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full lg:w-80 border-r border-neutral-800 p-6 bg-neutral-900/30 space-y-6 overflow-y-auto">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Search Objective</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Brand or Product Type..."
                  className="w-full bg-black border border-neutral-800 p-3 pl-10 rounded-xl text-sm font-bold text-white focus:border-emerald-green outline-none transition"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading || !query}
              className="w-full bg-emerald-green hover:bg-emerald-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-emerald-green/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              COMMENCE AUDIT
            </button>
          </form>

          <div className="p-4 bg-emerald-green/5 border border-emerald-green/10 rounded-2xl">
            <h4 className="text-[10px] font-black text-emerald-green uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck size={14} /> Mission Protocol
            </h4>
            <p className="text-[10px] text-neutral-500 uppercase font-black leading-relaxed">
              We intercept validated discount vectors across the grid. Prioritize nodes with successful verification status for maximum economic yield.
            </p>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 bg-black p-6 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-4 text-center"
              >
                <Loader2 size={48} className="text-emerald-green animate-spin" />
                <p className="text-emerald-green font-black uppercase tracking-[0.2em] text-xs">Scanning Retailer Nodes & Affinity Layers...</p>
              </motion.div>
            ) : coupons.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20"
              >
                {coupons.map((coupon) => (
                  <motion.div 
                    layout
                    key={coupon.id}
                    className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-emerald-green/50 transition group relative overflow-hidden flex flex-col justify-between h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-emerald-green/10 px-3 py-1 rounded-full border border-emerald-green/20">
                        <span className="text-[10px] font-black text-emerald-green uppercase tracking-widest">{coupon.store}</span>
                      </div>
                      <div className="text-2xl font-black text-white italic tracking-tighter">{coupon.discount}</div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 leading-tight uppercase tracking-tighter">{coupon.description}</h3>
                    
                    <div className="flex items-center gap-4 text-[10px] text-neutral-500 font-black uppercase mb-6">
                      <div className="flex items-center gap-1.5"><Clock size={12} /> Exp: {coupon.expiry}</div>
                      <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-green" /> Success: {coupon.successRate}%</div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => copyCode(coupon.code, coupon.id)}
                        className={`flex-1 p-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition border-2 ${copiedId === coupon.id ? 'bg-emerald-green border-emerald-green text-black' : 'bg-neutral-800 border-neutral-700 text-white hover:border-emerald-green'}`}
                      >
                        {copiedId === coupon.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        {copiedId === coupon.id ? 'Secured' : coupon.code}
                      </button>
                      {coupon.affiliateLink && (
                        <a 
                          href={coupon.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-neutral-800 border-2 border-neutral-700 rounded-xl text-emerald-green hover:bg-neutral-700 transition"
                          title="Open Store"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>

                    {verifyingId === coupon.id && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-emerald-green" />
                        <span className="text-[10px] font-black text-emerald-green uppercase tracking-widest">Verifying Code...</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="bg-neutral-900 p-8 rounded-full mb-6 border border-neutral-800">
                  <Ticket size={48} className="text-neutral-700" />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Tactical Reserve Empty</h3>
                <p className="text-neutral-500 max-w-xs text-sm">Target a specific brand or product to begin the high-yield discount audit.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
