import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Search, Navigation, AlertTriangle, Clock, Map as MapIcon, Layers, Zap, X, ChevronRight, Mic, Volume2, VolumeX, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { getTrafficAnalysis, getAffiliateProducts } from '../services/trafficService';
import { speak, stopSpeaking } from '../lib/speech';
import { submitPathfinderVote, getPathfinderStats } from '../services/voteService';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface PathfinderProps {
  onClose: () => void;
  detectedCity?: string;
  userName?: string;
}

const TrafficLayerComponent = () => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
    return () => trafficLayer.setMap(null);
  }, [map]);
  return null;
};

export const PathfinderIntelligence: React.FC<PathfinderProps> = ({ onClose, detectedCity, userName }) => {
  const [city, setCity] = useState(detectedCity || '');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.006 }); // Default NYC
  const [zoom, setZoom] = useState(12);
  const [isListening, setIsListening] = useState(false);
  const [showConstruction, setShowConstruction] = useState(true);
  const [votes, setVotes] = useState({ upVotes: 0, downVotes: 0, totalVotes: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);
  
  const affiliateProducts = getAffiliateProducts();

  useEffect(() => {
    // Load current stats
    getPathfinderStats().then(data => {
      if (data) setVotes(data as any);
    });
  }, []);

  const handleVote = async (type: 'up' | 'down') => {
    if (hasVoted) return;
    setVotingLoading(true);
    const success = await submitPathfinderVote(type);
    if (success) {
      setHasVoted(true);
      const updatedStats = await getPathfinderStats();
      setVotes(updatedStats as any);
    }
    setVotingLoading(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!city) return;

    setLoading(true);
    setAnalysis('');

    try {
      // 1. Get Lat/Lng from Geocoding
      if (hasValidKey) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: city }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const loc = results[0].geometry.location;
            setCenter({ lat: loc.lat(), lng: loc.lng() });
            setZoom(13);
          }
        });
      }

      const text = await getTrafficAnalysis(city, userName);
      setAnalysis(text);
      speak(text, {
        voice: 'Fenrir',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    } catch (error) {
      console.error("Pathfinder failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (detectedCity && !analysis) {
      handleSearch();
    }
  }, [detectedCity]);

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (analysis) {
      speak(analysis, {
        voice: 'Fenrir',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    }
  };

  // 1. ALWAYS SHOW CONSTRUCTION/VOTING FIRST
  if (showConstruction) {
    return (
      <div className="bg-neutral-900 border border-red-500/30 w-full rounded-3xl overflow-hidden flex flex-col h-[85vh] shadow-[0_0_100px_rgba(239,68,68,0.1)] relative">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 text-center"
        >
          <div className="max-w-xl w-full">
            <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Navigation size={48} className="text-red-500" />
            </div>
            
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Under Construction</h2>
            <p className="text-neutral-300 text-lg mb-8 font-medium leading-relaxed">
              We are currently deploying the tactical infrastructure for Pathfinder Intelligence. 
              <span className="block mt-2 text-red-500 font-bold uppercase tracking-widest text-sm italic">
                Please Vote If You Want This New Agent
              </span>
              to show you real-time traffic and transit telemetry for any sector you wish to navigate.
            </p>

            <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl mb-8">
              <p className="text-[10px] text-neutral-500 uppercase font-black tracking-[0.2em] mb-6">Tactical Deployment Goal: 1,000,000 Votes</p>
              
              <div className="flex items-center justify-center gap-8">
                <button 
                  onClick={() => handleVote('up')}
                  disabled={hasVoted || votingLoading}
                  className={`flex flex-col items-center gap-3 group transition-all ${hasVoted ? 'opacity-50 grayscale' : 'hover:scale-110'}`}
                >
                  <div className={`p-6 rounded-2xl border-2 shadow-lg transition ${hasVoted ? 'border-neutral-800 bg-neutral-800 text-neutral-600' : 'border-red-500/30 bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500'}`}>
                    <ThumbsUp size={32} />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-widest">Affirmative</span>
                  <span className="text-[10px] text-neutral-500 font-bold">{votes.upVotes.toLocaleString()}</span>
                </button>

                <button 
                  onClick={() => handleVote('down')}
                  disabled={hasVoted || votingLoading}
                  className={`flex flex-col items-center gap-3 group transition-all ${hasVoted ? 'opacity-50 grayscale' : 'hover:scale-110'}`}
                >
                  <div className={`p-6 rounded-2xl border-2 shadow-lg transition ${hasVoted ? 'border-neutral-800 bg-neutral-800 text-neutral-600' : 'border-neutral-700 bg-neutral-900 text-neutral-500 group-hover:bg-white group-hover:text-black group-hover:border-white'}`}>
                    <ThumbsDown size={32} />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-widest">Negative</span>
                  <span className="text-[10px] text-neutral-500 font-bold">{votes.downVotes.toLocaleString()}</span>
                </button>
              </div>

              {hasVoted && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-red-500 font-black uppercase text-[10px] tracking-widest"
                >
                  Tactical Vote Recorded. Telemetry Syncing...
                </motion.p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-10 py-4 bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl font-black uppercase text-xs tracking-widest transition border border-neutral-700"
              >
                Return to Base
              </button>
            </div>
            
            <p className="mt-12 text-[9px] text-neutral-600 font-bold uppercase tracking-[0.3em]">
              If we reach 1 million votes we will upload this new Agent to the network.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. CHECK API KEY LATER
  if (!hasValidKey) {
    return (
      <div className="bg-neutral-900 border border-red-500/30 p-8 rounded-3xl text-center shadow-2xl">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Google Maps API Key Required</h2>
        <p className="text-neutral-400 text-sm mb-6 max-w-md mx-auto">
          Tactical Pathfinder Intelligence requires a valid Google Maps Platform Key to render real-time transit telemetry.
        </p>
        <div className="bg-black/50 p-6 rounded-xl border border-neutral-800 text-left space-y-4 mb-6">
          <p className="text-[10px] text-neutral-400 uppercase font-black">Deployment Manual:</p>
          <ol className="text-xs text-neutral-300 space-y-2 list-decimal pl-4">
            <li>Secure a key at <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" className="text-red-500 underline">Google Cloud Console</a>.</li>
            <li>In AIS Settings (⚙️) {'->'} Secrets, add <strong>GOOGLE_MAPS_PLATFORM_KEY</strong>.</li>
            <li>The system will hot-reload once the signal is secured.</li>
          </ol>
        </div>
        <button onClick={onClose} className="px-8 py-3 bg-neutral-800 text-white rounded-xl font-bold uppercase text-xs">Return to Base</button>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="bg-neutral-900 border border-red-500/30 w-full rounded-3xl overflow-hidden flex flex-col h-[85vh] shadow-[0_0_100px_rgba(239,68,68,0.1)] relative">
        {/* Header Táctico */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className={`bg-red-500/10 p-3 rounded-2xl border border-red-500/20 ${isSpeaking ? 'animate-pulse border-red-400' : ''}`}>
              <Navigation size={28} className={isSpeaking ? 'text-red-400' : 'text-red-500'} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Pathfinder Intelligence</h2>
              <p className="text-[10px] text-red-500 font-bold tracking-widest uppercase mt-1">Real-Time Transit & Traffic Situational Audit</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleVoice}
              className={`p-3 rounded-2xl transition border ${isSpeaking ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'}`}
            >
              {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button onClick={onClose} className="p-3 hover:bg-neutral-800 rounded-2xl transition text-neutral-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Dashboard Lateral */}
          <div className="w-full lg:w-80 border-r border-neutral-800 p-6 bg-neutral-900/30 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Deployment Zone</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City, Locality, or Zip"
                    className="w-full bg-black border border-neutral-800 p-3 pl-10 rounded-xl text-sm font-bold text-white focus:border-red-500 outline-none transition"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-400 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-red-500/20"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                SCAN TRAFFIC VECTORS
              </button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Intelligence Report
                </h4>
                {loading ? (
                  <div className="flex items-center gap-3 py-4">
                    <Loader2 size={16} className="animate-spin text-red-500" />
                    <span className="text-[10px] text-neutral-500 uppercase font-black">Syncing Satellites...</span>
                  </div>
                ) : analysis ? (
                  <p className="text-[11px] text-neutral-300 leading-relaxed italic">"{analysis}"</p>
                ) : (
                  <p className="text-[10px] text-neutral-500 uppercase font-black">Awaiting tactical coordinates...</p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-red-500" /> Transit Assets
                </h4>
                {affiliateProducts.map((product, idx) => (
                  <div key={idx} className="bg-black/40 border border-neutral-800 p-3 rounded-xl hover:border-red-500/30 transition">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black text-red-500/70 uppercase">{product.store} Audit</span>
                    </div>
                    <h5 className="text-[11px] font-bold text-white leading-tight mb-1">{product.name}</h5>
                    <p className="text-[9px] text-neutral-500 mb-2 leading-tight">{product.reason}</p>
                    <a 
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase flex items-center gap-1"
                    >
                      Secure Item <ChevronRight size={10} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mapa Visual */}
          <div className="flex-1 relative bg-black">
            <Map 
              center={center}
              zoom={zoom}
              onCenterChanged={ev => setCenter(ev.detail.center)}
              onZoomChanged={ev => setZoom(ev.detail.zoom)}
              mapId="PATHFINDER_TACTICAL_MAP"
              style={{ width: '100%', height: '100%' }}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              mapTypeId={'hybrid'} // Satellite + Terrain labels
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              <TrafficLayerComponent />
            </Map>

            {/* Overlay de Status Real-Time */}
            <div className="absolute top-4 right-4 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-md border border-red-500/30 p-3 rounded-xl flex items-center gap-3">
                <div className="relative">
                  <Layers size={20} className="text-red-500" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-red-500 uppercase tracking-widest leading-none">Signal Status</p>
                  <p className="text-[10px] font-bold text-white uppercase mt-1">Live Telemetry Active</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pointer-events-none">
               <div className="bg-black/60 backdrop-blur-xl border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
                  <div className="h-10 w-1 flex-shrink-0 bg-red-500 rounded-full" />
                  <p className="text-[10px] text-white font-black uppercase tracking-widest leading-relaxed">
                    Satellite Hybrid View Enabled. Traffic vectors updated every 60 seconds via real-time GPS nodes.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </APIProvider>
  );
};