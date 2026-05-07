import React from 'react';
import { motion } from 'motion/react';
import { Fuel, Zap, Droplets, Flame, TrendingDown, Clock, MapPin, ExternalLink, Newspaper } from 'lucide-react';

const DailyInsights: React.FC = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const cityGasPrices = [
    { city: 'Houston, TX', prices: ['Costco $2.85', 'Sam\'s Club $2.87', 'Buc-ee\'s $2.89', 'Circle K $2.91', 'Shell $2.95'] },
    { city: 'Los Angeles, CA', prices: ['Costco $4.15', 'ARCO $4.19', '76 $4.25', 'Mobil $4.29', 'Chevron $4.35'] },
    { city: 'New York, NY', prices: ['BJ\'s $3.15', 'Gulf $3.19', 'Sunoco $3.22', 'BP $3.25', 'Exxon $3.29'] },
    { city: 'Miami, FL', prices: ['BJ\'s $3.05', 'Speedway $3.09', 'Wawa $3.12', 'Valero $3.15', 'RaceTrac $3.19'] },
    { city: 'Washington DC', prices: ['Costco $3.10', 'Sheetz $3.14', 'Royal Farms $3.18', '7-Eleven $3.20', 'Liberty $3.25'] },
  ];

  const savingsArticles = [
    {
      title: "Tactical Electricity Audit: How to Slash Your Bill by 30%",
      content: "Unseen 'Phantom' loads account for 10% of household energy waste. Unplug non-essential electronics and switch to high-efficiency LED nodes. Calibrate your thermostat to 78°F during summer cycles for maximum neutralization of costs.",
      icon: <Zap className="text-yellow-400" size={18} />
    },
    {
      title: "Strategic Water Conservation Protocols",
      content: "A single leaky faucet node can waste up to 3,000 gallons annually. Install high-yield aerators and low-flow shower systems. Audit your irrigation grid for nocturnal cycles to minimize evaporation and maximize savings.",
      icon: <Droplets className="text-blue-400" size={18} />
    },
    {
      title: "Energy Grid Efficiency: Natural Gas Optimization",
      content: "Seal drafts around windows and structural entry points with weather-stripping. Lower your water heater temperature to 120°F to reduce standby heat loss. Strategic insulation of attic nodes results in immediate thermal retention.",
      icon: <Flame className="text-orange-500" size={18} />
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto px-4 mb-12"
    >
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <div className="bg-emerald-green p-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Newspaper className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-white font-black uppercase tracking-tighter text-xl leading-none">Daily Tactical Insights</h2>
              <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest mt-1">Market Intel & Regional Savings Node Audit</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            <Clock size={14} className="text-white/80" />
            <span className="text-white font-mono text-[11px] uppercase">{today}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Main Content Area - Articles */}
          <div className="lg:col-span-8 p-6 lg:p-8 space-y-8 border-b lg:border-b-0 lg:border-r border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1 bg-emerald-green rounded-full" />
              <h3 className="text-lg font-black dark:text-white uppercase tracking-tight italic">Global Efficiency Reports</h3>
            </div>

            <div className="space-y-6">
              {savingsArticles.map((article, idx) => (
                <motion.article 
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="group cursor-default"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 group-hover:border-emerald-green/30 transition-colors">
                      {article.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-emerald-green transition-colors mb-2">{article.title}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic">{article.content}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* CTA/SEO Links */}
            <div className="mt-8 p-4 bg-emerald-green/5 rounded-2xl border border-emerald-green/10 flex flex-wrap gap-4 items-center justify-between">
              <p className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-widest">
                Systemically saving on Amazon, Walmart, Home Depot & eBay
              </p>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-green hover:underline">
                View Full Archive <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Sidebar Area - Gas Station Intel */}
          <div className="lg:col-span-4 bg-neutral-50/50 dark:bg-neutral-800/30 p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Fuel className="text-emerald-green" size={20} />
              <h3 className="font-black dark:text-white uppercase tracking-tighter text-base">Fuel Saving Recon Intelligence</h3>
            </div>
            
            <div className="space-y-6">
              {cityGasPrices.map((data, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-1">
                    <span className="text-[10px] font-black text-emerald-green uppercase tracking-tighter flex items-center gap-1">
                      <MapPin size={10} /> {data.city}
                    </span>
                    <TrendingDown size={12} className="text-emerald-green animate-bounce" />
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {data.prices.map((price, pIdx) => (
                      <div key={pIdx} className="flex justify-between items-center bg-white dark:bg-neutral-800 p-2 rounded-lg border border-neutral-100 dark:border-neutral-700 shadow-sm hover:border-emerald-green/30 transition-colors">
                        <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">{price.split(' ')[0]}</span>
                        <span className="text-[11px] font-mono font-black text-emerald-green">{price.split(' ')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-3 bg-apple-red/5 border border-apple-red/10 rounded-xl">
              <p className="text-[9px] text-apple-red font-black uppercase text-center leading-tight">
                Warning: Prices are localized based on regional retail node signatures and may vary by specific coordinates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default DailyInsights;
