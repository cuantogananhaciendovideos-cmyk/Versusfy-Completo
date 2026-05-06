import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, TrendingUp, ThumbsDown, UserCheck } from 'lucide-react';
import { TrendingComparison, voteTrending } from '../services/trendsService';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const LEDMarquee = ({ text }: { text: string }) => {
  return (
    <div className="relative w-full h-12 bg-black border-2 border-neutral-800 overflow-hidden flex items-center group">
      <div className="absolute inset-0 z-10 pointer-events-none opacity-40 bg-[radial-gradient(#ff0000_1px,transparent_1px)] bg-[size:4px_4px]" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-red-500/30 blur-[2px]" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-red-500/30 blur-[2px]" />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{
          repeat: Infinity,
          duration: 25,
          ease: "linear"
        }}
        className="whitespace-nowrap flex gap-8 items-center"
      >
        <span className="text-red-500 font-mono font-black text-xl tracking-[0.2em] drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] uppercase">
          {text} • {text} • {text}
        </span>
      </motion.div>
    </div>
  );
};

const ProductVoteZone = ({ 
  productName, 
  side, 
  comparisonId, 
  stats, 
  hasVoted, 
  onVote 
}: { 
  productName: string; 
  side: 'productA' | 'productB'; 
  comparisonId: string; 
  stats: any; 
  hasVoted: boolean;
  onVote: () => void;
}) => {
  const [hoverStar, setHoverStar] = useState<number | null>(null);
  const prefix = `${side}_`;
  const likes = stats?.[`${prefix}likes`] || 0;
  const dislikes = stats?.[`${prefix}dislikes`] || 0;
  const rating = stats?.[`${prefix}averageRating`] || 0;

  return (
    <div className={`flex flex-col gap-3 p-3 rounded-xl border ${hasVoted ? 'bg-neutral-800/20 border-neutral-800' : 'bg-neutral-900 border-neutral-800/50 hover:border-emerald-green/30 transition-colors'}`}>
      <div className="text-[10px] font-black text-white uppercase tracking-tighter truncate mb-1">
        {productName}
      </div>
      
      <div className="flex items-center justify-between gap-2">
        {/* Like */}
        <button 
          onClick={() => { voteTrending(comparisonId, 'like', side); onVote(); }}
          disabled={hasVoted}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${hasVoted ? 'opacity-50' : 'hover:bg-red-500/10 text-neutral-400 hover:text-red-500'}`}
        >
          <Heart size={16} fill={hasVoted ? "currentColor" : "none"} className={hasVoted ? "text-red-500" : ""} />
          <span className="text-[9px] font-bold">{likes}</span>
        </button>

        {/* Dislike */}
        <button 
          onClick={() => { voteTrending(comparisonId, 'dislike', side); onVote(); }}
          disabled={hasVoted}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${hasVoted ? 'opacity-50' : 'hover:bg-neutral-700 text-neutral-400 hover:text-white'}`}
        >
          <ThumbsDown size={16} />
          <span className="text-[9px] font-bold">{dislikes}</span>
        </button>

        {/* Stars */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => !hasVoted && setHoverStar(star)}
                onMouseLeave={() => setHoverStar(null)}
                onClick={() => { voteTrending(comparisonId, 'star', side, star); onVote(); }}
                disabled={hasVoted}
                className="transition-transform active:scale-125"
              >
                <Star 
                  size={10} 
                  fill={(hoverStar || rating) >= star ? "#fbbf24" : "none"}
                  className={(hoverStar || rating) >= star ? "text-amber-400" : "text-neutral-700"}
                />
              </button>
            ))}
          </div>
          <span className="text-[9px] font-black text-neutral-500">{rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export const TrendingWindow = ({ comparison, side }: { comparison: TrendingComparison; side: 'left' | 'right' }) => {
  const [stats, setStats] = useState<any>({});
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "trending_votes", comparison.id), (snap) => {
      if (snap.exists()) {
        setStats(snap.data());
      }
    });
    return () => unsub();
  }, [comparison.id]);

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      className="w-full max-w-sm bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl group flex flex-col"
    >
      {/* Header */}
      <div className="p-4 bg-black flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-green" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Weekly Duel</span>
        </div>
        <span className="text-[9px] font-black text-neutral-600 uppercase border border-neutral-800 px-2 py-0.5 rounded-full">
          {comparison.category}
        </span>
      </div>

      <LEDMarquee text={comparison.marqueeText} />

      <div className="p-5 flex-1 space-y-4">
        <div>
          <h3 className="text-white font-black text-lg leading-tight mb-1">{comparison.title}</h3>
          <p className="text-neutral-500 text-xs leading-relaxed">{comparison.description}</p>
        </div>

        {/* Individual Voting Zones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
          <ProductVoteZone 
            productName={comparison.productA} 
            side="productA" 
            comparisonId={comparison.id} 
            stats={stats} 
            hasVoted={hasVoted}
            onVote={() => setHasVoted(true)}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-black border border-neutral-800 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-green italic shadow-lg">
            VS
          </div>
          <ProductVoteZone 
            productName={comparison.productB} 
            side="productB" 
            comparisonId={comparison.id} 
            stats={stats} 
            hasVoted={hasVoted}
            onVote={() => setHasVoted(true)}
          />
        </div>

        <button className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2">
          {hasVoted ? (
            <><UserCheck size={14} className="text-emerald-green" /> Vote Registered</>
          ) : (
            "Select to Vote"
          )}
        </button>
      </div>
    </motion.div>
  );
};
