import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Heart, ThumbsUp, Star, Camera, 
  User, Shield, Send, Image as ImageIcon, 
  Ticket, UserCircle2, X, MoreHorizontal,
  Search, TrendingUp, Users, MessageSquarePlus,
  Palette, Type, Smile, RefreshCw, Lock, Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ForumPost, subscribeToPosts, createPost, updateEngagement } from '../services/forumService';

const COLORS = [
  { name: 'Pure White', value: '#FFFFFF' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue Sky', value: '#3b82f6' },
  { name: 'Neon Pink', value: '#ec4899' },
  { name: 'Amber Glow', value: '#f59e0b' },
  { name: 'Cyber Purple', value: '#a855f7' }
];

const FONTS = [
  { name: 'Tactical', value: 'font-mono' },
  { name: 'Bold', value: 'font-black sans-serif' },
  { name: 'Elegant', value: 'serif' },
  { name: 'Modern', value: 'font-sans italic' }
];

const SIZES = [
  { name: 'SM', value: 'text-sm' },
  { name: 'MD', value: 'text-base' },
  { name: 'LG', value: 'text-xl' },
  { name: 'XL', value: 'text-3xl' }
];

const EMOJI_CATEGORIES = [
  { name: 'Tactical', icons: ['🔥', '💎', '🚀', '🎯', '⚡', '🏆', '🛒', '📈', '✅', '👑', '💯', '🦾', '🧿', '🛡️', '💰', '🏷️'] },
  { name: 'Faces', icons: ['😂', '😎', '🤔', '🤫', '🤯', '🥳', '🧐', '😈', '😍', '😭', '😡', '😴', '🙄', '🤤', '🤡', '💀'] },
  { name: 'Hands', icons: ['👍', '🤝', '🙌', '👊', '🤘', '🤙', '✍️', '👋', '👏', '🙏', '👈', '👉', '👆', '👇', '🖕', '🖖'] },
  { name: 'Items', icons: ['✨', '🌟', '💥', '💢', '💦', '💨', '💫', '🎁', '🧨', '🧿', '🧬', '🔮', '🌈', '❄️', '📍', '🔔'] }
];

export const VersusfyCommunity: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [activeEmojiCat, setActiveEmojiCat] = useState('Tactical');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [newPost, setNewPost] = useState({
    firstName: '',
    lastName: '',
    isAnonymous: false,
    content: '',
    photoUrl: '',
    sharedImage: '',
    heroTicketId: '',
    rating: 5,
    fontFamily: 'font-mono',
    fontSize: 'text-xl',
    color: '#FFFFFF'
  });

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = subscribeToPosts(setPosts);
      generateCaptcha();
      return () => unsubscribe();
    }
  }, [isOpen]);

  const wordCount = (newPost.content.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]+/g) || []).length;
  const isWordLimitReached = wordCount > 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;
    if (isWordLimitReached) return;
    if (captchaInput.toUpperCase() !== captchaCode) {
      alert("CAPTCHA Verification Failed. Please solve to prove you are an elite user.");
      generateCaptcha();
      return;
    }

    try {
      await createPost({
        firstName: newPost.isAnonymous ? '' : newPost.firstName,
        lastName: newPost.isAnonymous ? '' : newPost.lastName,
        isAnonymous: newPost.isAnonymous,
        content: newPost.content,
        photoUrl: newPost.photoUrl,
        sharedImage: newPost.sharedImage,
        heroTicketId: newPost.heroTicketId,
        rating: newPost.rating,
        fontFamily: newPost.fontFamily,
        fontSize: newPost.fontSize,
        color: newPost.color
      });
      setNewPost({
        firstName: '',
        lastName: '',
        isAnonymous: false,
        content: '',
        photoUrl: '',
        sharedImage: '',
        heroTicketId: '',
        rating: 5,
        fontFamily: 'font-mono',
        fontSize: 'text-xl',
        color: '#FFFFFF'
      });
      setCaptchaInput('');
      generateCaptcha();
      setIsPosting(false);
    } catch (err) {
      console.error("Failed to post:", err);
    }
  };

  const addEmoji = (emoji: string) => {
    setNewPost(prev => ({ ...prev, content: prev.content + emoji }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl h-[85vh] bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/30">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Versusfy Community</h1>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Verified Social Intelligence</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth custom-scrollbar">
          
          <div className="bg-gradient-to-r from-emerald-900/20 to-blue-900/10 p-6 rounded-3xl border border-emerald-500/20">
            <h2 className="text-lg font-black text-white mb-2 italic">Elite Network Access.</h2>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Connect with the **Versusfy Community**. Share short tactical insights (max 10 words). Customize your presence with fonts and colors. No tracking—just pure data.
            </p>
          </div>

          {!isPosting ? (
            <button 
              onClick={() => setIsPosting(true)}
              className="w-full h-16 bg-neutral-800 border border-neutral-700/50 rounded-2xl flex items-center px-6 gap-4 text-neutral-500 hover:border-emerald-500/50 transition group"
            >
              <UserCircle2 size={32} className="text-neutral-600 group-hover:text-emerald-500 transition" />
              <div className="flex-1 text-left">
                <span className="font-bold flex items-center gap-2">
                  Share a tactical phrase... <Lock size={12} className="text-neutral-700" />
                </span>
                <p className="text-[9px] uppercase tracking-widest text-neutral-600 mt-1">Word Limit & CAPTCHA Protected</p>
              </div>
              <MessageSquarePlus className="ml-auto text-neutral-600" size={20} />
            </button>
          ) : (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              onSubmit={handleSubmit}
              className="bg-neutral-800/50 border border-neutral-700 p-6 rounded-3xl space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setNewPost(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition ${newPost.isAnonymous ? 'bg-blue-500 text-white' : 'bg-neutral-700 text-neutral-400'}`}
                    >
                      <Shield size={14} /> {newPost.isAnonymous ? 'ID Masked' : 'Public ID'}
                    </button>
                  </div>

                  {!newPost.isAnonymous && (
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="First Name" 
                        value={newPost.firstName}
                        onChange={e => setNewPost(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-black/40 border border-neutral-700 p-3 rounded-xl text-sm focus:border-emerald-500 outline-none transition"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Last Name" 
                        value={newPost.lastName}
                        onChange={e => setNewPost(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-black/40 border border-neutral-700 p-3 rounded-xl text-sm focus:border-emerald-500 outline-none transition"
                        required
                      />
                    </div>
                  )}

                  <div className="relative">
                    <textarea 
                      placeholder="Tactical phrase... (Max 10 words)"
                      value={newPost.content}
                      onChange={e => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      style={{ color: newPost.color }}
                      className={`w-full h-24 bg-black/40 border border-neutral-700 p-4 rounded-2xl focus:border-emerald-500 outline-none transition resize-none ${newPost.fontFamily} ${newPost.fontSize}`}
                      required
                    />
                    <div className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded bg-black/60 border ${isWordLimitReached ? 'text-red-500 border-red-500/50' : 'text-neutral-500 border-neutral-800'}`}>
                      {wordCount} / 10 words
                    </div>
                  </div>

                  <div className="space-y-3 bg-black/20 p-3 rounded-2xl border border-neutral-700/30">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                      {EMOJI_CATEGORIES.map(cat => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setActiveEmojiCat(cat.name)}
                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition whitespace-nowrap border ${activeEmojiCat === cat.name ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20' : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-white'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 h-20 overflow-y-auto custom-scrollbar pr-2">
                      {EMOJI_CATEGORIES.find(c => c.name === activeEmojiCat)?.icons.map((emoji, idx) => (
                        <button 
                          key={`${emoji}-${idx}`}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center bg-neutral-900/50 rounded-lg hover:bg-neutral-700 hover:scale-110 transition text-base flex-shrink-0 border border-neutral-800"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Style Lab */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 p-4 rounded-2xl border border-neutral-700/50">
                        <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                          <Palette size={12} /> Color Lab
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map(c => (
                            <button 
                              key={c.value}
                              type="button"
                              onClick={() => setNewPost(prev => ({ ...prev, color: c.value }))}
                              className={`w-6 h-6 rounded-full border-2 transition ${newPost.color === c.value ? 'border-white scale-110 shadow-lg shadow-white/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                              style={{ backgroundColor: c.value }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="bg-black/20 p-4 rounded-2xl border border-neutral-700/50">
                        <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                          <Type size={12} /> Font Matrix
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {FONTS.map(f => (
                            <button 
                              key={f.value}
                              type="button"
                              onClick={() => setNewPost(prev => ({ ...prev, fontFamily: f.value }))}
                              className={`px-2 py-1 rounded border text-[10px] transition ${newPost.fontFamily === f.value ? 'bg-emerald-500 border-emerald-400 text-black font-black' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                            >
                              {f.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/20 p-4 rounded-2xl border border-neutral-700/50">
                      <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                        <Maximize size={12} className="rotate-45" /> Size Matrix
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SIZES.map(s => (
                          <button 
                            key={s.value}
                            type="button"
                            onClick={() => setNewPost(prev => ({ ...prev, fontSize: s.value }))}
                            className={`px-4 py-1 rounded border text-[10px] transition ${newPost.fontSize === s.value ? 'bg-blue-500 border-blue-400 text-white font-black' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Anti-Bot Captcha */}
                  <div className="bg-black/40 p-5 rounded-3xl border border-blue-500/20">
                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                      <Shield size={12} /> Tactical Verification
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-xl flex items-center gap-4">
                        <div className="bg-blue-500/10 text-xl font-black italic text-blue-500 tracking-[0.5rem] px-4 py-2 rounded-lg select-none line-through decoration-blue-500/30">
                          {captchaCode}
                        </div>
                        <button 
                          type="button"
                          onClick={generateCaptcha}
                          className="p-2 text-neutral-500 hover:text-white transition"
                        >
                          <RefreshCw size={16} />
                        </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="CODE"
                        value={captchaInput}
                        onChange={e => setCaptchaInput(e.target.value.toUpperCase())}
                        maxLength={4}
                        className="w-24 h-14 bg-black border border-neutral-700 rounded-xl text-center font-black text-xl tracking-widest focus:border-blue-500 outline-none transition uppercase"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-neutral-800">
                <button 
                  type="button"
                  onClick={() => setIsPosting(false)}
                  className="px-6 py-3 text-neutral-400 font-bold uppercase text-[10px] tracking-widest"
                >
                  ABORT
                </button>
                <button 
                  type="submit"
                  disabled={isWordLimitReached}
                  className={`px-10 py-4 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition shadow-xl flex items-center gap-3 ${isWordLimitReached ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'}`}
                >
                  DEPOY INTEL <Send size={16} />
                </button>
              </div>
            </motion.form>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <motion.div 
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-800/30 border border-neutral-800 p-6 rounded-[2.5rem] hover:border-neutral-700 transition relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden">
                      {post.photoUrl ? (
                        <img src={post.photoUrl} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-emerald-500/50">
                          <User size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white leading-none mb-1 flex items-center gap-2">
                        {post.isAnonymous ? 'Anonymous Intel' : `${post.firstName} ${post.lastName}`}
                        {post.isAnonymous && <Shield size={12} className="text-blue-500" />}
                      </h4>
                      <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                        {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'SECURED'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 text-emerald-500">
                    {Array.from({ length: post.rating }).map((_, i) => (
                      <Star key={i} size={10} fill="currentColor" />
                    ))}
                  </div>
                </div>

                <p 
                  className={`leading-relaxed mb-6 ${post.fontFamily || 'font-mono'} ${post.fontSize || 'text-xl'}`}
                  style={{ color: post.color || '#FFFFFF' }}
                >
                  {post.content}
                </p>

                {post.sharedImage && (
                  <div className="mb-6 rounded-[2rem] overflow-hidden border border-neutral-700 shadow-2xl relative group/img">
                    <img src={post.sharedImage} alt="Tactical Evidence" className="w-full max-h-[500px] object-cover group-hover/img:scale-105 transition duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                    
                    {post.heroTicketId && (
                      <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-400 uppercase flex items-center gap-2">
                          <Ticket size={12} /> Certified Victory
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 tracking-widest">#{post.heroTicketId}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-neutral-800/50 relative z-10">
                  <button 
                    onClick={() => updateEngagement(post.id!, 'likes')}
                    className="flex items-center gap-2 text-neutral-500 hover:text-emerald-500 transition group/btn"
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover/btn:bg-emerald-500/10 group-hover/btn:border-emerald-500/30 transition">
                      <ThumbsUp size={16} className={post.likes > 0 ? 'text-emerald-500' : ''} />
                    </div>
                    <span className="text-xs font-black tracking-widest">{post.likes}</span>
                  </button>
                  <button 
                    onClick={() => updateEngagement(post.id!, 'hearts')}
                    className="flex items-center gap-2 text-neutral-500 hover:text-pink-500 transition group/btn"
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover/btn:bg-pink-500/10 group-hover/btn:border-pink-500/30 transition">
                      <Heart size={16} className={post.hearts > 0 ? 'text-pink-500 fill-pink-500' : ''} />
                    </div>
                    <span className="text-xs font-black tracking-widest">{post.hearts}</span>
                  </button>
                  <div className="ml-auto">
                    <button className="p-3 bg-neutral-900 rounded-xl text-neutral-600 hover:text-white border border-neutral-800 hover:border-neutral-700 transition">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
