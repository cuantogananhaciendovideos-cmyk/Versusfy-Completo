import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, DollarSign, Loader2, ChevronRight, X, Navigation, Fuel, Droplets, Clock, Zap } from 'lucide-react';
import { searchGasStations, GasStation, getFuelSavingProducts, AffiliateProduct, getFuelScoutSpeech } from '../services/fuelService';
import { speak, stopSpeaking } from '../lib/speech';
import { VolumeX } from 'lucide-react';

interface FuelScoutProps {
  onClose: () => void;
  detectedCity?: string;
  userName: string | null;
}

export const FuelScout: React.FC<FuelScoutProps> = ({ onClose, detectedCity, userName }) => {
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<GasStation[]>([]);
  const [city, setCity] = useState(detectedCity || '');
  const [zipCode, setZipCode] = useState('');
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [savingProducts, setSavingProducts] = useState<AffiliateProduct[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!city) return;
    
    setLoading(true);
    try {
      const [results, products] = await Promise.all([
        searchGasStations({
          city,
          state: 'USA',
          zipCode
        }),
        getFuelSavingProducts()
      ]);
      setStations(results);
      setSavingProducts(products);

      const speech = await getFuelScoutSpeech(city, results.length, userName || undefined);
      speak(speech, { 
        voice: 'Fenrir',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    } catch (error) {
      console.error("Fuel search failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (detectedCity && stations.length === 0) {
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
      <div className="bg-neutral-900 border border-amber-500/30 w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(245,158,11,0.1)]">
        
        {/* Header Táctico */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className={`bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 ${isSpeaking ? 'animate-pulse border-amber-400' : ''}`}>
              <Fuel size={28} className={isSpeaking ? 'text-amber-400' : 'text-amber-500'} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Versusfy Fuel Scout</h2>
              <p className="text-[10px] text-amber-500 font-bold tracking-widest uppercase mt-1">USA Real-Time Gasoline Audit</p>
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
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Deployment City</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Houston, TX"
                      className="w-full bg-black border border-neutral-800 p-3 pl-10 rounded-xl text-sm font-bold text-white focus:border-amber-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">ZIP Code</label>
                  <div className="relative">
                    <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                    <input 
                      type="text" 
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="77001"
                      className="w-full bg-black border border-neutral-800 p-3 pl-10 rounded-xl text-sm font-bold text-white focus:border-amber-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                SCAN FOR CHEAPEST FUEL
              </button>
            </form>

            <div className="mt-12 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
              <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest leading-relaxed">
                Our intelligence monitors real-time gas prices to prioritize stations with the highest savings per gallon.
              </p>
            </div>

            {savingProducts.length > 0 && (
              <div className="mt-8 space-y-4 pb-10">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" /> Tactical Upgrades
                </h4>
                <div className="space-y-3">
                  {savingProducts.map((product, idx) => (
                    <div key={idx} className="bg-black/40 border border-neutral-800 p-3 rounded-xl hover:border-amber-500/30 transition shadow-sm group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-black text-amber-500/70 uppercase">{product.store}</span>
                        <span className="text-[8px] font-black text-emerald-500 uppercase">{product.estimatedSavings}</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-white leading-tight mb-1">{product.name}</h5>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(product.name + ' ' + product.store)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black text-amber-500 hover:text-amber-400 uppercase flex items-center gap-1 transition"
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
                <Loader2 size={48} className="text-amber-500 animate-spin" />
                <p className="text-amber-500 font-black uppercase tracking-[0.2em] text-xs">Auditing regional fuel prices...</p>
              </div>
            ) : stations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {stations.sort((a,b) => parseFloat(a.prices.regular.replace('$','')) - parseFloat(b.prices.regular.replace('$',''))).map((item) => (
                  <motion.div 
                    layoutId={item.id}
                    key={item.id}
                    onClick={() => setSelectedStation(item)}
                    className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-amber-500/50 transition cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition">
                      <Droplets size={64} className="text-amber-500" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Regular</span>
                      </div>
                      <div className="text-2xl font-black text-white">{item.prices.regular}</div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight uppercase tracking-tighter">{item.name}</h3>
                    <p className="text-neutral-500 text-xs font-medium mb-6 flex items-center gap-1.5 line-clamp-1">
                      <MapPin size={12} className="text-amber-500" /> {item.address}, {item.city}
                    </p>

                    <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-neutral-600" />
                        <span className="text-[9px] font-bold text-neutral-500 uppercase">{item.lastUpdated}</span>
                      </div>
                      <ChevronRight size={18} className="text-neutral-600 group-hover:text-amber-500 transition group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="bg-neutral-900 p-8 rounded-full mb-6 border border-neutral-800">
                  <Fuel size={48} className="text-neutral-700" />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Fuel Search Standby</h3>
                <p className="text-neutral-500 max-w-xs text-sm">Target a city to see the current tactical map of fuel prices.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedStation(null)}
          >
            <motion.div 
              layoutId={selectedStation.id}
              className="bg-neutral-900 border border-amber-500/50 w-full max-w-2xl rounded-3xl p-8 space-y-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 inline-block mb-4">
                    <span className="text-xs font-black text-amber-500 uppercase tracking-[0.2em]">Fuel Details</span>
                  </div>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{selectedStation.name}</h2>
                  <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest mt-2">{selectedStation.address}, {selectedStation.city} {selectedStation.zipCode}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-amber-500">{selectedStation.prices.regular}</div>
                  <div className="text-[10px] font-black text-amber-500/50 uppercase">Regular Price</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-black/50 p-4 rounded-xl border border-neutral-800 text-center">
                    <span className="text-[9px] text-neutral-500 uppercase font-black block mb-2">Midgrade</span>
                    <span className="text-lg font-bold text-white">{selectedStation.prices.midgrade || 'N/A'}</span>
                 </div>
                 <div className="bg-black/50 p-4 rounded-xl border border-neutral-800 text-center">
                    <span className="text-[9px] text-neutral-500 uppercase font-black block mb-2">Premium</span>
                    <span className="text-lg font-bold text-white">{selectedStation.prices.premium || 'N/A'}</span>
                 </div>
                 <div className="bg-black/50 p-4 rounded-xl border border-neutral-800 text-center">
                    <span className="text-[9px] text-neutral-500 uppercase font-black block mb-2">Diesel</span>
                    <span className="text-lg font-bold text-white text-green-500">{selectedStation.prices.diesel || 'N/A'}</span>
                 </div>
                 <div className="bg-black/50 p-4 rounded-xl border border-neutral-800 text-center">
                    <span className="text-[9px] text-neutral-500 uppercase font-black block mb-2">Updated</span>
                    <span className="text-[10px] font-bold text-amber-500">{selectedStation.lastUpdated}</span>
                 </div>
              </div>

              <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Map Navigation</h4>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedStation.coordinates.lat},${selectedStation.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-neutral-800 hover:bg-neutral-700 text-white p-4 rounded-xl transition font-black text-xs uppercase"
                >
                  <MapPin size={18} className="text-amber-500" /> Get Directions via Google Maps
                </a>
              </div>
              
              <button 
                onClick={() => setSelectedStation(null)}
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
