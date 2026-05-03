import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Upload, Camera, Loader2, CheckCircle2, TrendingDown, DollarSign, X, ShieldCheck, Zap, ChevronRight, VolumeX } from 'lucide-react';
import { analyzeWaterBill, WaterAdvice, getQuickWaterAdvice } from '../services/waterService';

import { speak, stopSpeaking } from '../lib/speech';

interface WaterGuardianProps {
  onClose: () => void;
  userName: string | null;
}

export const WaterGuardian: React.FC<WaterGuardianProps> = ({ onClose, userName }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<WaterAdvice | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quickTips, setQuickTips] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target?.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const result = await analyzeWaterBill(file, userName || undefined);
      setAdvice(result);
      const tips = await getQuickWaterAdvice();
      setQuickTips(tips);
      
      speak(result.spokenResponse, { 
        voice: 'Kore',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="bg-neutral-900 border border-blue-500/30 w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(59,130,246,0.1)]">
        
        {/* Tactical Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className={`bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 ${isSpeaking ? 'animate-pulse border-blue-400' : ''}`}>
              <Droplets size={28} className={isSpeaking ? 'text-blue-400' : 'text-blue-500'} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Water Guardian</h2>
              <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase mt-1">Hydraulic Efficiency Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSpeaking && (
               <button 
                onClick={() => { stopSpeaking(); setIsSpeaking(false); }}
                className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition"
              >
                <VolumeX size={20} />
              </button>
            )}
            <button 
              onClick={() => { stopSpeaking(); onClose(); }}
              className="p-3 hover:bg-neutral-800 rounded-2xl transition text-neutral-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {!advice ? (
              <div className="space-y-6 text-center">
                <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-3xl">
                  <h3 className="text-xl font-black text-white uppercase italic mb-4">Tactical Water Audit</h3>
                  <p className="text-neutral-400 text-sm mb-8 max-w-lg mx-auto">
                    Upload a photo of your current water bill. Our AI will analyze your consumption patterns and provide immediate saving countermeasures.
                  </p>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="group relative bg-blue-500 hover:bg-blue-400 text-black font-black py-6 px-12 rounded-2xl flex items-center justify-center gap-3 transition mx-auto overflow-hidden shadow-lg shadow-blue-500/20"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                    <span className="relative z-10">CAPTURE BILL DATA</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: ShieldCheck, title: "Bill Analysis", text: "Visual processing of your monthly usage." },
                    { icon: Zap, title: "Quick Fixes", text: "Immediate actions to stop wastage." },
                    { icon: TrendingDown, title: "Cost Reduction", text: "Goal-oriented strategies for savings." }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-neutral-800/30 border border-neutral-800 p-6 rounded-2xl">
                      <item.icon size={24} className="text-blue-500 mb-3 mx-auto" />
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{item.title}</h4>
                      <p className="text-[10px] text-neutral-500 uppercase mt-2 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Result Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl text-center">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-2">Operational Goal</span>
                    <div className="text-3xl font-black text-white">{advice.estimatedSavings}</div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase">Monthly Saving Target</span>
                  </div>
                  <div className="bg-neutral-800/50 border border-neutral-700 p-6 rounded-2xl text-center">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-2">Usage Analysis</span>
                    <div className="text-sm font-bold text-white line-clamp-2">{advice.consumptionAnalysis}</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-2">New Projected Cost</span>
                    <div className="text-3xl font-black text-emerald-500">{advice.projectedCost}</div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase">With Countermeasures Applied</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={16} /> TACTICAL COUNTERMEASURES
                    </h3>
                    <div className="space-y-3">
                      {advice.tacticalTips.map((tip, idx) => (
                        <div key={idx} className="bg-neutral-800/30 border border-neutral-800 p-4 rounded-xl flex gap-3 items-start">
                          <div className="bg-blue-500/20 rounded-full p-1 mt-0.5">
                            <CheckCircle2 size={14} className="text-blue-500" />
                          </div>
                          <p className="text-sm text-neutral-300 font-medium">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                       <Zap size={16} /> TACTICAL EQUIPMENT (AFFILIATE)
                    </h3>
                    <div className="space-y-3">
                      {advice.recommendedProducts.map((product, idx) => (
                        <div key={idx} className="bg-neutral-800/50 border border-amber-500/20 p-4 rounded-xl group hover:border-amber-500 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-black text-amber-500 uppercase">{product.store} Recommendation</span>
                             <span className="text-[9px] font-black text-emerald-500 uppercase">Save {product.estimatedSavings}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">{product.name}</h4>
                          <p className="text-[10px] text-neutral-500 mb-3 leading-relaxed">{product.reason}</p>
                          <a 
                            href={`https://www.google.com/search?q=${encodeURIComponent(product.name + ' ' + product.store)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[9px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest transition"
                          >
                             Secure This Asset <ChevronRight size={10} />
                          </a>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => { setAdvice(null); setSelectedImage(null); }}
                      className="w-full py-4 border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={14} /> NEW TACTICAL AUDIT
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
        
        <div className="p-4 bg-black/50 border-t border-neutral-800 flex justify-center">
           <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Versusfy Defense: Save Water, Secure Your Future.</p>
        </div>
      </div>
    </motion.div>
  );
};

const RotateCcw = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);
