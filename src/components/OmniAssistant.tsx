import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, X, Volume2, VolumeX, Loader2, Wand2, HardHat, Sprout, Wrench, Fuel, Zap } from 'lucide-react';
import { chatWithOmniAssistant } from '../services/geminiService';

import { speak as omniSpeak, stopSpeaking as omniStop } from '../lib/speech';

interface OmniAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onComparisonRequested: (a: string, b: string) => void;
  userName: string | null;
  autoStartListening?: boolean;
  agentMode?: 'style' | 'pharmacy' | 'mechanic' | 'builder' | 'space' | 'gardening' | 'energy' | 'office' | 'toy' | 'gamer' | 'academic' | 'musical' | 'job' | 'pathfinder' | 'coupon';
  onUserNameDetected?: (name: string) => void;
}

export const OmniAssistant: React.FC<OmniAssistantProps> = ({ isOpen, onClose, onComparisonRequested, userName, autoStartListening, agentMode, onUserNameDetected }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Clear response and history when switching modes to prevent identity bleeding
    setResponse('');
    setHistory([]);
    setSuggestions([]);
    
    if (isOpen && autoStartListening) {
      // Auto-start listening is now handled by the onEnd callback of the greeting speak() call for better precision
    }
    return () => {
      if (isListening) {
        try { recognitionRef.current?.stop(); } catch(e) {}
      }
    };
  }, [isOpen, autoStartListening, agentMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = navigator.language || 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsListening(false);
          // Auto-submit for hands-free experience
          if (transcript.trim()) {
            performChat(transcript);
          }
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const getVoiceForMode = () => {
    switch (agentMode) {
      case 'builder':
      case 'mechanic':
        return 'Charon';
      case 'energy':
      case 'job':
      case 'pathfinder':
      case 'coupon':
        return 'Fenrir';
      case 'gardening':
      case 'academic':
        return 'Zephyr';
      case 'style':
      case 'toy':
      case 'pharmacy':
        return 'Kore';
      case 'musical':
      case 'office':
      case 'gamer':
        return 'Puck';
      default:
        return 'Puck';
    }
  };

  useEffect(() => {
    if (isOpen) {
      let initialGreeting = "";
      
      if (agentMode === 'style') {
        initialGreeting = userName 
          ? `Hello, ${userName}. I am your Personal Style Scout. How can I elevate your look today, darling?`
          : "I am your Personal Style Scout. How can I elevate your look today, darling? By the way, what is your name?";
      } else if (agentMode === 'pharmacy') {
        initialGreeting = "Unidades del Pharmacy Scout activas. Dime qué medicamento deseas analizar o comparar para encontrar el mejor precio.";
      } else if (agentMode === 'builder') {
        initialGreeting = userName
          ? `Listen up, ${userName}. Master Builder here. What's the plan for the site today? Let's get to work.`
          : "Master Builder on site. What are we building today? Tell me your name so I can add you to the payroll.";
      } else if (agentMode === 'gardening') {
        initialGreeting = userName
          ? `Welcome back to the field, ${userName}. Gardening Scout here. How is the terrain looking today?`
          : "Gardening Scout reporting for duty. I can analyze your soil, plants, and irrigation. What's your name, fellow grower?";
      } else if (agentMode === 'mechanic') {
        initialGreeting = userName
          ? `Status check, ${userName}. Mechanical Scout here. What's the diagnostic on the vehicle today?`
          : "Mechanical Scout active. I can analyze engine parts, performance specs, and drivetrain issues. Give me a name to log this session.";
      } else if (agentMode === 'energy') {
        initialGreeting = userName
          ? `High efficiency greetings, ${userName}. Fuel Scout ready to optimize your consumption. Where are we heading?`
          : "Fuel Scout operational. I can locate the best fuel prices and optimize your energy consumption. What is your name?";
      } else if (agentMode === 'office') {
        initialGreeting = `Productivity Architect online. Ready to optimize your flow state and workspace. What's the mission?`;
      } else if (agentMode === 'toy') {
        initialGreeting = `Toy Scout reporting for duty! Let's find some fun and safe magic for the little ones.`;
      } else if (agentMode === 'gamer') {
        initialGreeting = `Pro Gamer Scout online. Let's optimize the meta. What hardware are we analyzing?`;
      } else if (agentMode === 'academic') {
        initialGreeting = `Academic Master ready. Let's pursue intellectual excellence. What subject requires focus?`;
      } else if (agentMode === 'musical') {
        initialGreeting = `Musical Scout aquí. ¿Qué onda? Busquemos ese tono perfecto para tu setup. ¿Qué equipo escaneamos hoy?`;
      } else if (agentMode === 'job') {
        initialGreeting = userName
          ? `Status check, ${userName}. Job Scout active. Ready for a regional career audit? What sector are we scanning today?`
          : "Job Scout tactical unit online. I can scan your city for top-tier employment opportunities and market growth. For a personalized audit, please tell me your name.";
      } else if (agentMode === 'pathfinder') {
        initialGreeting = userName
          ? `High precision greetings, ${userName}. Pathfinder Intelligence online. Monitoring regional transit telemetry. Which sector requires situational awareness?`
          : "Pathfinder Intelligence unit active. I am monitoring real-time GPS and satellite transit nodes. For a personalized tactical briefing, please state your identifier.";
      } else if (agentMode === 'coupon') {
        initialGreeting = userName
          ? `Status check, ${userName}. Coupon Scout active. Ready for a high-yield discount audit. What brand or item are we auditing for coupons today?`
          : "Coupon Scout unit online. I can scan retailer nodes for validated discount vectors. For a detailed tactical report, please provide your identification.";
      } else {
        initialGreeting = userName 
          ? `Hello, ${userName}. Welcome back to Versusfy.com, your most effective and efficient destination. Which product or tactical comparison would you like to perform today to optimize your budget?`
          : "Hello, welcome to Versusfy.com, your most effective and efficient place to compare and find the best prices at your favorite stores. You can compare all your favorite products, but more than that, we have a suite of Agents dedicated to making your daily life easier and more budget-friendly. Now, to make our communication more personal, could you please tell me your name?";
      }
      
      speak(initialGreeting, { 
        voice: getVoiceForMode(),
        localOnly: true, 
        onEnd: () => {
          if (autoStartListening && recognitionRef.current && !isListening) {
            try {
              setIsListening(true);
              recognitionRef.current.start();
            } catch (e) {
              console.warn("Auto-listening start failed:", e);
              setIsListening(false);
            }
          }
        }
      });
    } else {
      stopSpeaking();
    }
  }, [isOpen]); // Instant trigger on dialog open

  const speak = (text: string, options: { voice?: any, onEnd?: () => void, localOnly?: boolean } = {}) => {
    omniSpeak(text, {
      voice: options.voice || getVoiceForMode(),
      onStart: () => setIsSpeaking(true),
      localOnly: options.localOnly,
      onEnd: () => {
        setIsSpeaking(false);
        if (options.onEnd) options.onEnd();
      },
    });
  };

  const stopSpeaking = () => {
    omniStop();
    setIsSpeaking(false);
  };

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const performChat = async (currentQuery: string) => {
    if (!currentQuery.trim() || loading) return;

    setLoading(true);
    setQuery('');
    setResponse('');
    
    try {
      const result = await chatWithOmniAssistant(currentQuery, userName || undefined, agentMode, history);
      setResponse(result.response);
      setSuggestions(result.suggestions || []);
      speak(result.spokenResponse || result.response, { voice: getVoiceForMode() });

      // Update history
      setHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: currentQuery }] },
        { role: 'model', parts: [{ text: result.response }] }
      ].slice(-10)); // Keep last 10 turns for memory

      if (result.action === 'compare' && result.comparisonEntityA && result.comparisonEntityB) {
        onComparisonRequested(result.comparisonEntityA, result.comparisonEntityB);
      }
      
      if (result.detectedUserName && onUserNameDetected) {
        onUserNameDetected(result.detectedUserName);
      }
    } catch (error) {
      console.error(error);
      setResponse("I'm sorry, I couldn't process that. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    performChat(query);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>

            {/* Pulsating Sphere Header */}
            <div className={`p-8 flex flex-col items-center gap-6 bg-gradient-to-b ${agentMode === 'style' ? 'from-pink-500/10' : agentMode === 'builder' ? 'from-orange-500/10' : agentMode === 'mechanic' ? 'from-red-600/10' : agentMode === 'energy' ? 'from-yellow-500/10' : agentMode === 'gardening' ? 'from-emerald-green/10' : 'from-emerald-green/10'} to-transparent`}>
              <div className="relative w-32 h-32">
                {/* The Sphere with dynamic color based on mode */}
                <div className="w-full h-full rounded-full flex flex-col overflow-hidden border-2 border-white/10 shadow-2xl relative">
                  {/* Top Layer */}
                  <div className={`flex-1 ${agentMode === 'style' ? 'bg-pink-500' : agentMode === 'builder' ? 'bg-orange-500' : agentMode === 'mechanic' ? 'bg-red-600' : (agentMode === 'energy' || agentMode === 'pathfinder') ? 'bg-yellow-500' : agentMode === 'gardening' ? 'bg-emerald-green' : 'bg-emerald-green'} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 blur-xl" />
                  </div>
                  
                  {/* Middle: White (Fixed Mouth) */}
                  <div className="h-10 bg-white flex items-center justify-center relative overflow-hidden">
                    {agentMode === 'style' && <Wand2 className="text-pink-500 absolute animate-pulse" size={24} />}
                    {agentMode === 'builder' && <HardHat className="text-orange-500 absolute animate-pulse" size={24} />}
                    {agentMode === 'gardening' && <Sprout className="text-emerald-green absolute animate-pulse" size={24} />}
                    {agentMode === 'mechanic' && <Wrench className="text-red-600 absolute animate-pulse" size={24} />}
                    {(agentMode === 'energy' || agentMode === 'pathfinder') && <Fuel className="text-yellow-600 absolute animate-pulse" size={24} />}
                    <div className="bg-black/10 rounded-full h-1/2 w-1/2" />
                    <div className="absolute inset-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] mix-blend-overlay" />
                  </div>

                  {/* Bottom: Apple Red / Neutral */}
                  <div className={`flex-1 ${agentMode === 'style' ? 'bg-purple-600' : agentMode === 'builder' ? 'bg-neutral-700' : (agentMode === 'mechanic' || agentMode === 'pathfinder') ? 'bg-black' : agentMode === 'energy' ? 'bg-orange-600' : 'bg-[#ff0800]'} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/5 blur-xl" />
                  </div>
                </div>
                
                {/* Glow effects */}
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-4 ${agentMode === 'style' ? 'bg-pink-500/40' : agentMode === 'builder' ? 'bg-orange-500/40' : agentMode === 'mechanic' ? 'bg-red-600/40' : (agentMode === 'energy' || agentMode === 'pathfinder') ? 'bg-yellow-500/40' : 'bg-emerald-green/40'} h-4 blur-xl rounded-full`} />
                <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-4 ${agentMode === 'style' ? 'bg-purple-500/40' : agentMode === 'builder' ? 'bg-neutral-500/40' : (agentMode === 'mechanic' || agentMode === 'pathfinder') ? 'bg-black/40' : agentMode === 'energy' ? 'bg-orange-600/40' : 'bg-apple-red/40'} h-4 blur-xl rounded-full`} />
              </div>

              <h2 className={`text-xl font-bold tracking-tight text-center uppercase tracking-[0.2em] ${agentMode === 'style' ? 'text-pink-500' : agentMode === 'builder' ? 'text-orange-500' : (agentMode === 'mechanic' || agentMode === 'pathfinder') ? 'text-red-600' : agentMode === 'energy' ? 'text-yellow-500' : agentMode === 'gardening' ? 'text-emerald-green' : 'text-white'}`}>
                {agentMode === 'style' ? 'Personal Style Scout' : 
                 agentMode === 'mechanic' ? 'Mechanical Scout' : 
                 agentMode === 'pharmacy' ? 'Pharmacy Scout' : 
                 agentMode === 'builder' ? 'Master Builder Scout' :
                 agentMode === 'gardening' ? 'Gardening Scout' :
                 agentMode === 'energy' ? 'Versusfy Fuel Scout' :
                 agentMode === 'office' ? 'Productivity Architect' :
                 agentMode === 'toy' ? 'Toy Scout' :
                 agentMode === 'gamer' ? 'Pro Gamer Scout' :
                 agentMode === 'academic' ? 'Academic Master' :
                 agentMode === 'musical' ? 'Musical Scout' :
                 agentMode === 'pathfinder' ? 'Pathfinder Intelligence' :
                 'Versusfy Supreme Intelligence'}
              </h2>
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-6 overflow-y-auto max-h-[40vh] space-y-4 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl text-neutral-300 leading-relaxed italic"
                  >
                    <p className={`text-sm font-medium mb-2 flex items-center gap-2 ${agentMode === 'style' ? 'text-pink-500' : agentMode === 'builder' ? 'text-orange-500' : agentMode === 'mechanic' ? 'text-red-600' : agentMode === 'energy' ? 'text-yellow-500' : agentMode === 'gardening' ? 'text-emerald-green' : 'text-emerald-green'}`}>
                      <button 
                        onClick={() => speak(response)}
                        className={`p-1 rounded-full transition-colors flex items-center gap-2 ${agentMode === 'style' ? 'hover:bg-pink-500/10' : agentMode === 'builder' ? 'hover:bg-orange-500/10' : agentMode === 'mechanic' ? 'hover:bg-red-600/10' : agentMode === 'energy' ? 'hover:bg-yellow-500/10' : agentMode === 'gardening' ? 'hover:bg-emerald-green/10' : 'hover:bg-emerald-green/10'}`}
                        title="Read message"
                      >
                        <Volume2 size={14} className={isSpeaking ? 'text-white' : ''} />
                        <span>
                          {agentMode === 'style' ? 'Style Scout' : 
                           agentMode === 'mechanic' ? 'Mech Scout' : 
                           agentMode === 'pharmacy' ? 'Pharmacy Scout' : 
                           agentMode === 'builder' ? 'Master Builder' :
                           agentMode === 'gardening' ? 'Gardening Scout' :
                           agentMode === 'energy' ? 'Fuel Scout' :
                           agentMode === 'pathfinder' ? 'Pathfinder' :
                           'Omni-Assistant'}
                        </span>
                      </button>
                    </p>
                    {response}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {loading && (
                <div className="flex justify-center p-4">
                  <Loader2 className={`animate-spin ${(agentMode === 'builder' || agentMode === 'mechanic') ? 'text-orange-500' : agentMode === 'energy' ? 'text-yellow-500' : 'text-emerald-green'}`} size={24} />
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(s)}
                      className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${agentMode === 'builder' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20' : 'bg-emerald-green/10 text-emerald-green border-emerald-green/20 hover:bg-emerald-green/20'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-black/40 border-t border-white/5">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <button
                  type="button"
                  onClick={handleToggleListening}
                  className={`p-4 rounded-xl transition ${isListening ? 'bg-apple-red text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                >
                  <Mic size={20} />
                </button>
                <input
                  type="text"
                  placeholder={agentMode === 'style' ? "How can I elevate your look, darling?" : (agentMode === 'builder' || agentMode === 'mechanic') ? "What's the status boss?" : agentMode === 'energy' ? "Where are we heading? Scout ready." : agentMode === 'gardening' ? "How is the soil looking, fellow grower?" : agentMode === 'pathfinder' ? "Reporting transit anomaly?" : "How can I assist you today, dear?"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`flex-grow bg-neutral-800 p-4 rounded-xl text-white placeholder:text-neutral-500 outline-none transition focus:ring-2 ${agentMode === 'style' ? 'focus:ring-pink-500' : agentMode === 'builder' ? 'focus:ring-orange-500' : (agentMode === 'mechanic' || agentMode === 'pathfinder') ? 'focus:ring-red-600' : agentMode === 'energy' ? 'focus:ring-yellow-500' : agentMode === 'gardening' ? 'focus:ring-emerald-green' : 'focus:ring-emerald-green'}`}
                />
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className={`p-4 text-white rounded-xl transition disabled:opacity-50 ${agentMode === 'style' ? 'bg-pink-500 hover:bg-pink-600' : agentMode === 'builder' ? 'bg-orange-500 hover:bg-orange-600' : agentMode === 'mechanic' ? 'bg-red-600 hover:bg-red-700' : agentMode === 'energy' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-emerald-green hover:bg-emerald-600'}`}
                >
                  <Send size={20} />
                </button>
              </form>
              <p className="text-[9px] text-neutral-600 mt-3 text-center uppercase tracking-widest font-bold">
                Voice Commands & Text-to-Speech Active
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
