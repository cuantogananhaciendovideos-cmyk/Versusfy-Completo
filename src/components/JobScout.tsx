import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, MapPin, Search, TrendingUp, 
  X, Activity, Globe, DollarSign, 
  ShieldCheck, Share2, Download, Zap,
  Mail, Phone, ExternalLink
} from 'lucide-react';
import { scanLocalJobs, JobAnalysis, JobResult } from '../services/jobService';
import { speak } from '../lib/speech';

interface JobScoutProps {
  isOpen: boolean;
  onClose: () => void;
  detectedCity?: string;
  userName?: string;
}

export const JobScout: React.FC<JobScoutProps> = ({ isOpen, onClose, detectedCity, userName }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState({ 
    city: detectedCity || '', 
    state: 'Active Region', 
    country: 'USA' 
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<JobAnalysis | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small intro sound or vibration feel can be added here
    }
  }, [isOpen]);

  const handleScan = async () => {
    if (!query) return;
    setLoading(true);
    
    speak("Tactical career scan initiated. Analyzing local market sectors now.", {
      voice: 'Fenrir',
      localOnly: true,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false)
    });

    try {
      const data = await scanLocalJobs(query, location.city, location.state, location.country);
      setResults(data);
      
      if (data.spokenResponse) {
        speak(data.spokenResponse, {
          voice: 'Fenrir',
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false)
        });
      }
    } catch (error) {
      console.error("Job scan failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job: JobResult) => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to searching the company if no URL
      window.open(`https://www.google.com/search?q=${encodeURIComponent(job.company + ' careers ' + job.title)}`, '_blank');
    }
  };

  const handleShare = async (job: JobResult) => {
    const shareData = {
      title: `Job Opportunity: ${job.title} at ${job.company}`,
      text: `Tactical Job Alert: I found this ${job.title} position at ${job.company} with a ${job.tacticalFit}% fit score on Versusfy!`,
      url: job.applyUrl || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} Check it out: ${shareData.url}`);
        alert("Tactical data copied to clipboard!");
      }
    } catch (err) {
      console.error("Tactical share failed", err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-[2.5rem] shadow-[0_0_80px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Briefcase className="text-blue-500" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Job Scout <span className="text-blue-500 underline decoration-2">Tactical</span></h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">
                   <Activity size={10} className="text-blue-500 animate-pulse" /> Sector Analysis Online | Loc: {location.city || 'Scanning...'}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-neutral-800 rounded-full transition text-neutral-500 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Search Input Area */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Job Designation / Industry</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Software Engineer, Delivery Driver"
                      className="w-full bg-black border-2 border-neutral-800 focus:border-blue-500/50 p-4 rounded-xl outline-none font-bold text-white transition-all pl-12"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Tactical Search Zone</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={location.city}
                      onChange={(e) => setLocation({...location, city: e.target.value})}
                      placeholder="Enter City"
                      className="w-full bg-black border-2 border-neutral-800 focus:border-blue-500/50 p-4 rounded-xl outline-none font-bold text-white transition-all pl-12"
                    />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={20} />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleScan}
                disabled={loading || !query}
                className="w-full mt-6 h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-40 disabled:grayscale"
              >
                {loading ? <Zap size={20} className="animate-spin" /> : <TrendingUp size={20} />}
                {loading ? 'Executing Regional Audit...' : 'Execute Local Job Scan'}
              </button>
            </div>

            {/* Results Display */}
            {results && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-4">
                  <Globe className="text-blue-500 mt-1 shrink-0" size={20} />
                  <div>
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">Market Overview</h4>
                    <p className="text-sm text-neutral-300 font-medium leading-relaxed">{results.marketOverview}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {results.jobs.length > 0 ? (
                    results.jobs.map((job, idx) => (
                      <motion.div 
                        key={job.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl hover:border-blue-500/40 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <Briefcase size={80} />
                        </div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1">{job.title}</h3>
                            <p className="text-sm font-bold text-blue-500 uppercase tracking-wide">{job.company}</p>
                          </div>
                          <div className="p-3 bg-black rounded-xl border border-neutral-800 text-center min-w-[80px]">
                            <p className="text-[10px] font-bold text-neutral-500 uppercase">Fit Score</p>
                            <p className="text-lg font-black text-emerald-500 italic">{job.tacticalFit}%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-black/40 p-2 rounded-lg border border-neutral-800/50">
                            <p className="text-[8px] text-neutral-600 font-bold uppercase mb-1 flex items-center gap-1"><MapPin size={8} /> Location</p>
                            <p className="text-[10px] font-bold text-white uppercase truncate">{job.location}</p>
                          </div>
                          <div className="bg-black/40 p-2 rounded-lg border border-neutral-800/50">
                            <p className="text-[8px] text-neutral-600 font-bold uppercase mb-1 flex items-center gap-1"><DollarSign size={8} /> Salary</p>
                            <p className="text-[10px] font-bold text-white uppercase truncate">{job.salary}</p>
                          </div>
                          <div className="bg-black/40 p-2 rounded-lg border border-neutral-800/50">
                            <p className="text-[8px] text-neutral-600 font-bold uppercase mb-1 flex items-center gap-1"><ShieldCheck size={8} /> Posted</p>
                            <p className="text-[10px] font-bold text-white uppercase truncate">{job.postedAt}</p>
                          </div>
                          <div className="bg-black/40 p-2 rounded-lg border border-neutral-800/50">
                            <p className="text-[8px] text-neutral-600 font-bold uppercase mb-1 flex items-center gap-1"><Globe size={8} /> Source</p>
                            <p className="text-[10px] font-bold text-white uppercase truncate">{job.source}</p>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-400 mb-4 line-clamp-2 italic">{job.description}</p>
                        
                        {/* Contact Info Block */}
                        <div className="flex flex-wrap gap-4 mb-5 p-3 bg-black/30 rounded-xl border border-neutral-800/50">
                          {job.contactEmail && (
                            <div className="flex items-center gap-2">
                              <Mail size={12} className="text-blue-400" />
                              <span className="text-[10px] font-bold text-neutral-300 break-all">{job.contactEmail}</span>
                            </div>
                          )}
                          {job.contactPhone && (
                            <div className="flex items-center gap-2">
                              <Phone size={12} className="text-emerald-400" />
                              <span className="text-[10px] font-bold text-neutral-300">{job.contactPhone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApply(job)}
                            className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                          >
                            Apply Now <ExternalLink size={14} />
                          </button>
                          <button 
                            onClick={() => handleShare(job)}
                            className="w-12 h-12 bg-neutral-800 text-neutral-400 flex items-center justify-center rounded-xl hover:text-white transition hover:bg-neutral-700"
                          >
                            <Share2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-12 text-center border-2 border-dashed border-neutral-800 rounded-3xl">
                      <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-800">
                         <Search className="text-neutral-500" size={32} />
                      </div>
                      <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">Tactical Scan Failure</h3>
                      <p className="text-sm text-neutral-500 max-w-xs mx-auto">No job nodes detected in the current sector. Try broadening your parameters or target a different region.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-neutral-900/30 border-t border-neutral-800 flex items-center justify-between">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 hover:text-white transition uppercase tracking-widest">
                <Download size={12} /> Save Report
              </button>
              <button className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 hover:text-white transition uppercase tracking-widest">
                <Share2 size={12} /> Share Search
              </button>
            </div>
            <p className="text-[9px] font-medium text-neutral-700 italic">SYSTEM ID: SCOUT-JOB-{Math.random().toString(16).slice(2, 6).toUpperCase()}</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
