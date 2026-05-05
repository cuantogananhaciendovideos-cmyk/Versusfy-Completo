import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Upload, Camera, Loader2, CheckCircle2, TrendingDown, DollarSign, X, ShieldCheck, Zap, RotateCcw, ChevronRight, Send, User, Mic } from 'lucide-react';
import { analyzeGasBill, GasAdvice, getQuickGasAdvice, chatWithGasMaster } from '../services/gasService';

import { speak, stopSpeaking } from '../lib/speech';
import { VolumeX } from 'lucide-react';

interface GasMasterProps {
  onClose: () => void;
  userName: string | null;
}

export const GasMaster: React.FC<GasMasterProps> = ({ onClose, userName }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<GasAdvice | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quickTips, setQuickTips] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'agent', text: string }[]>([]);
  const [chatQuery, setChatQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'es-ES'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatQuery(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || isChatLoading) return;

    const userMessage = chatQuery.trim();
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatQuery('');
    setIsChatLoading(true);

    try {
      const response = await chatWithGasMaster(userMessage, advice || undefined, userName || undefined);
      setChatHistory(prev => [...prev, { role: 'agent', text: response }]);
      
      speak(response, {
        voice: 'Charon',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target?.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    
    // Immediate verbal feedback
    try {
      speak(`Tactical sensors online. Analyzing gas consumption for ${userName || 'User'}. Tracking thermal efficiency anomalies now.`, {
        voice: 'Charon',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    } catch (e) {
      console.warn("Speech failed but continuing analysis", e);
    }

    try {
      // Parallelize heavy operations
      const [result, tips] = await Promise.all([
        analyzeGasBill(file, userName || undefined),
        getQuickGasAdvice().catch(() => ["Use pot lids", "Match pot size to burner", "Optimize burner air-flow"])
      ]);
      
      setAdvice(result);
      setQuickTips(tips);
      
      // Speak the actual results once found
      if (result.spokenResponse) {
        speak(result.spokenResponse, { 
          voice: 'Charon',
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false)
        });
      }
    } catch (error) {
      console.error("Gas analysis failed", error);
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
      <div className="bg-neutral-900 border border-orange-500/30 w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(249,115,22,0.1)]">
        
        {/* Tactical Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className={`bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20 ${isSpeaking ? 'animate-pulse border-orange-400' : ''}`}>
              <Flame size={28} className={isSpeaking ? 'text-orange-400' : 'text-orange-500'} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Gas Master</h2>
              <p className="text-[10px] text-orange-500 font-bold tracking-widest uppercase mt-1">Thermal Efficiency & Cooking Tactical Audit</p>
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
                <div className="bg-orange-500/5 border border-orange-500/10 p-8 rounded-3xl">
                  <h3 className="text-xl font-black text-white uppercase italic mb-4">Tactical Gas Audit</h3>
                  <p className="text-neutral-400 text-sm mb-8 max-w-lg mx-auto">
                    Upload a photo of your gas bill or cooking gas consumption. Our AI will analyze your usage and deploy tactical cooking/heating countermeasures.
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
                    className="group relative bg-orange-500 hover:bg-orange-400 text-black font-black py-6 px-12 rounded-2xl flex items-center justify-center gap-3 transition mx-auto overflow-hidden shadow-lg shadow-orange-500/20"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                    <span className="relative z-10">AUDIT GAS BILL</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: ShieldCheck, title: "Thermal Analysis", text: "Efficiency audit of your cooking/heating cycles." },
                    { icon: Zap, title: "Heat Capture", text: "Strategies to maximize every BTU consumed." },
                    { icon: TrendingDown, title: "Economic Win", text: "Significant reduction in your monthly gas bill." }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-neutral-800/30 border border-neutral-800 p-6 rounded-2xl">
                      <item.icon size={24} className="text-orange-500 mb-3 mx-auto" />
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
                  <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl text-center">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest block mb-2">Projected Monthly Win</span>
                    <div className="text-3xl font-black text-white">{advice.estimatedSavings}</div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase">Saving Counter-Strike</span>
                  </div>
                  <div className="bg-neutral-800/50 border border-neutral-700 p-6 rounded-2xl text-center">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-2">Consumption Intel</span>
                    <div className="text-sm font-bold text-white line-clamp-2">{advice.consumptionAnalysis}</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Optimized Cost</span>
                    <div className="text-3xl font-black text-emerald-500">{advice.projectedCost}</div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase">Tactical Projection</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck size={16} /> SURVIVAL STRATEGIES
                    </h3>
                    <div className="space-y-3">
                      {advice.tacticalTips.map((tip, idx) => (
                        <div key={idx} className="bg-neutral-800/30 border border-neutral-800 p-4 rounded-xl flex gap-3 items-start">
                          <div className="bg-orange-500/20 rounded-full p-1 mt-0.5">
                            <CheckCircle2 size={14} className="text-orange-500" />
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
                      onClick={() => { setAdvice(null); setSelectedImage(null); setChatHistory([]); }}
                      className="w-full py-4 border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={14} /> NEW GAS AUDIT
                    </button>
                  </div>
                </div>

                {/* Chat Section */}
                <div className="mt-12 space-y-6">
                   <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-neutral-800 pb-4">
                     <Flame size={16} className="text-orange-500" /> SECURE COMMS: GAS MASTER CONVERSATION
                   </h3>
                   
                   <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {chatHistory.length === 0 && (
                        <p className="text-center text-[10px] text-neutral-500 uppercase font-black py-8 border-2 border-dashed border-neutral-800 rounded-3xl">
                          The comms line is open. Ask me anything about your thermal efficiency.
                        </p>
                      )}
                      
                      {chatHistory.map((chat, idx) => (
                        <div 
                          key={idx} 
                          className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`p-4 rounded-2xl max-w-[80%] text-sm ${
                            chat.role === 'user' 
                              ? 'bg-orange-500 text-black font-bold' 
                              : 'bg-neutral-800 border border-neutral-700 text-neutral-200'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                               {chat.role === 'agent' ? <Flame size={12} className="text-orange-500" /> : <User size={12} />}
                               <span className="text-[10px] uppercase font-black tracking-tighter">
                                 {chat.role === 'user' ? 'Strategic Inquiry' : 'Gas Master Intel'}
                               </span>
                            </div>
                            {chat.text}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                   </div>

                   <form onSubmit={handleChatSubmit} className="relative">
                      <input 
                        type="text"
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        placeholder="ASK GAS MASTER FOR MORE TACTICAL ADVICE..."
                        className="w-full bg-black border border-neutral-800 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white outline-none focus:border-orange-500 transition-all pr-24 shadow-inner"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                        <button 
                          type="button"
                          onClick={startListening}
                          className={`p-2 rounded-xl transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-neutral-800 text-neutral-400 hover:text-orange-500'}`}
                        >
                          <Mic size={18} />
                        </button>
                        <button 
                          type="submit"
                          disabled={isChatLoading || !chatQuery.trim()}
                          className="p-2 bg-orange-500 text-black rounded-xl hover:bg-orange-400 transition disabled:opacity-50"
                        >
                           {isChatLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                      </div>
                   </form>
                </div>
              </motion.div>
            )}

          </div>
        </div>
        
        <div className="p-4 bg-black/50 border-t border-neutral-800 flex justify-center">
           <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Versusfy Energy Tactical: Master Your Consumption.</p>
        </div>
      </div>
    </motion.div>
  );
};
