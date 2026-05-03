import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Home, MapPin, DollarSign, Phone, Mail, User, Loader2, ChevronRight, X, Filter, Navigation, Zap, Mic } from 'lucide-react';
import { searchHousing, HousingListing, getHousingProducts, AffiliateProduct, getHousingSpeech } from '../services/housingService';
import { speak, stopSpeaking } from '../lib/speech';
import { VolumeX } from 'lucide-react';

interface HousingSearchProps {
  onClose: () => void;
  detectedCity?: string;
  userName: string | null;
}

export const HousingSearch: React.FC<HousingSearchProps> = ({ onClose, detectedCity, userName }) => {
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<HousingListing[]>([]);
  const [searchType, setSearchType] = useState<'rent' | 'sale'>('rent');
  const [city, setCity] = useState(detectedCity || '');
  const [state, setState] = useState('USA');
  const [zipCode, setZipCode] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedListing, setSelectedListing] = useState<HousingListing | null>(null);
  const [movingProducts, setMovingProducts] = useState<AffiliateProduct[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCity(transcript);
      };
      recognition.start();
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!city) return;
    
    setLoading(true);
    try {
      const [results, products] = await Promise.all([
        searchHousing({
          type: searchType,
          city,
          state,
          zipCode,
          budget
        }),
        getHousingProducts()
      ]);
      setListings(results);
      setMovingProducts(products);

      const speech = await getHousingSpeech(city, results.length, userName || undefined);
      speak(speech, { 
        voice: 'Charon',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (detectedCity && listings.length === 0) {
      handleSearch();
    }
  }, [detectedCity]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="bg-neutral-900 border border-emerald-green/30 w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(16,185,129,0.1)]">
        
        {/* Header Táctico */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className={`bg-emerald-green/10 p-3 rounded-2xl border border-emerald-green/20 ${isSpeaking ? 'animate-pulse border-emerald-400' : ''}`}>
              <Home size={28} className={isSpeaking ? 'text-emerald-400' : 'text-emerald-green'} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Versusfy Housing</h2>
              <p className="text-[10px] text-emerald-green font-bold tracking-widest uppercase mt-1">USA Strategic Living Finder</p>
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

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Panel de Filtros */}
          <div className="w-full lg:w-80 border-r border-neutral-800 p-6 bg-neutral-900/30 overflow-y-auto">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 block">Operation Mode</label>
                <div className="grid grid-cols-2 gap-2 bg-black p-1 rounded-xl border border-neutral-800">
                  <button 
                    type="button"
                    onClick={() => setSearchType('rent')}
                    className={`py-2 rounded-lg text-xs font-black uppercase transition ${searchType === 'rent' ? 'bg-emerald-green text-black' : 'text-neutral-500 hover:text-white'}`}
                  >
                    Rent
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSearchType('sale')}
                    className={`py-2 rounded-lg text-xs font-black uppercase transition ${searchType === 'sale' ? 'bg-emerald-green text-black' : 'text-neutral-500 hover:text-white'}`}
                  >
                    Sale
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Target City</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Los Angeles"
                      className="w-full bg-black border border-neutral-800 p-3 pl-10 pr-10 rounded-xl text-sm font-bold text-white focus:border-emerald-green outline-none transition"
                    />
                    <button 
                      type="button"
                      onClick={startListening}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-neutral-500 hover:text-white'}`}
                      title="Voice Search"
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">ZIP Code (Optional)</label>
                  <div className="relative">
                    <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                    <input 
                      type="text" 
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="90210"
                      className="w-full bg-black border border-neutral-800 p-3 pl-10 rounded-xl text-sm font-bold text-white focus:border-emerald-green outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Budget Limit</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                    <input 
                      type="text" 
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. Under $2500"
                      className="w-full bg-black border border-neutral-800 p-3 pl-10 rounded-xl text-sm font-bold text-white focus:border-emerald-green outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-green hover:bg-emerald-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                COMMENCE TACTICAL SEARCH
              </button>
            </form>

            <div className="mt-12 p-4 bg-emerald-green/5 border border-emerald-green/10 rounded-2xl">
              <p className="text-[9px] text-emerald-green font-black uppercase tracking-widest leading-relaxed">
                Versusfy Intelligence uses search grounding to find verified active listings for low and middle class US citizens.
              </p>
            </div>

            {movingProducts.length > 0 && (
              <div className="mt-8 space-y-4 pb-10">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-emerald-green" /> Tactical Moving Gear
                </h4>
                <div className="space-y-3">
                  {movingProducts.map((product, idx) => (
                    <div key={idx} className="bg-black/40 border border-neutral-800 p-3 rounded-xl hover:border-emerald-green/30 transition shadow-sm group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-black text-emerald-green/70 uppercase">{product.store}</span>
                        <span className="text-[8px] font-black text-emerald-green uppercase">{product.estimatedSavings}</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-white leading-tight mb-1">{product.name}</h5>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(product.name + ' ' + product.store)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black text-emerald-green hover:text-emerald-400 uppercase flex items-center gap-1 transition"
                      >
                        Secure Item <ChevronRight size={10} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Listado de Resultados */}
          <div className="flex-1 bg-black p-6 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <Loader2 size={48} className="text-emerald-green animate-spin" />
                <p className="text-emerald-green font-black uppercase tracking-[0.2em] text-xs">Scanning USA Databases...</p>
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {listings.map((item) => (
                  <motion.div 
                    layoutId={item.id}
                    key={item.id}
                    onClick={() => setSelectedListing(item)}
                    className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-emerald-green/50 transition cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition">
                      <Home size={64} className="text-emerald-green" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-emerald-green/10 px-3 py-1 rounded-full border border-emerald-green/20">
                        <span className="text-[10px] font-black text-emerald-green uppercase tracking-widest">{item.type}</span>
                      </div>
                      <div className="text-xl font-black text-white">{item.price}</div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight">{item.address}</h3>
                    <p className="text-neutral-500 text-xs font-medium mb-6 flex items-center gap-1.5 line-clamp-1">
                      <MapPin size={12} className="text-apple-red" /> {item.city}, {item.state} {item.zipCode}
                    </p>

                    <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-emerald-green">
                          <User size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{item.contactName}</span>
                      </div>
                      <ChevronRight size={18} className="text-neutral-600 group-hover:text-emerald-green transition group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="bg-neutral-900 p-8 rounded-full mb-6 border border-neutral-800">
                  <Search size={48} className="text-neutral-700" />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">
                  {city ? `No Tactical Matches in ${city}` : 'No Tactical Results Yet'}
                </h3>
                <p className="text-neutral-500 max-w-xs text-sm mb-8">
                  {city 
                    ? `I couldn't secure any active ${searchType} listings in this specific area right now. Try a nearby city or adjust your budget.`
                    : 'Enter a target city in the USA to begin scanning for rent and sale opportunities.'}
                </p>
                {city && (
                  <button 
                    onClick={() => handleSearch()}
                    className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-black rounded-xl border border-neutral-700 transition uppercase text-xs tracking-widest"
                  >
                    Retry Strategic Scan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal De Detalle */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedListing(null)}
          >
            <motion.div 
              layoutId={selectedListing.id}
              className="bg-neutral-900 border border-emerald-green/50 w-full max-w-2xl rounded-3xl p-8 space-y-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="bg-emerald-green/10 px-4 py-1.5 rounded-full border border-emerald-green/20 inline-block mb-4">
                    <span className="text-xs font-black text-emerald-green uppercase tracking-[0.2em]">{selectedListing.type}</span>
                  </div>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter">{selectedListing.address}</h2>
                  <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest mt-2">{selectedListing.city}, {selectedListing.state} {selectedListing.zipCode}</p>
                </div>
                <div className="text-4xl font-black text-emerald-green">{selectedListing.price}</div>
              </div>

              <div className="p-6 bg-black/50 border border-neutral-800 rounded-2xl">
                <h3 className="text-[10px] font-black text-emerald-green uppercase tracking-widest mb-4">Property Description</h3>
                <p className="text-neutral-300 text-sm leading-relaxed">{selectedListing.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Owner / Agent</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-green/10 flex items-center justify-center text-emerald-green">
                      <User size={20} />
                    </div>
                    <div className="text-sm font-black text-white">{selectedListing.contactName}</div>
                  </div>
                </div>
                <div className="bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Map Location</h4>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedListing.coordinates.lat},${selectedListing.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-emerald-green hover:text-emerald-400 transition text-sm font-bold"
                  >
                    <MapPin size={16} /> Open Google Maps
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <a 
                  href={`tel:${selectedListing.contactPhone}`}
                  className="flex-1 bg-emerald-green text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition"
                >
                  <Phone size={20} /> CALL CONTACT
                </a>
                <a 
                  href={`mailto:${selectedListing.contactEmail}?subject=Interest in ${selectedListing.address}`}
                  className="flex-1 bg-neutral-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 border border-neutral-700 hover:bg-neutral-700 transition"
                >
                  <Mail size={20} /> SEND EMAIL
                </a>
              </div>
              
              <button 
                onClick={() => setSelectedListing(null)}
                className="w-full py-2 text-neutral-500 hover:text-white transition text-[10px] font-black uppercase tracking-widest"
              >
                Close Tactical View
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
