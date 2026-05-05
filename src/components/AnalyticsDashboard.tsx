import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { 
  Users, TrendingUp, Globe, Activity, Eye, 
  Clock, Calendar, MousePointer2 
} from 'lucide-react';
import { motion } from 'motion/react';
import { VisitorStats, getVisitorStats } from '../services/analyticsService';

export const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [chartData, setChartData] = useState<{time: string, users: number}[]>([]);
  const [activeMetric, setActiveMetric] = useState<'online' | 'visits'>('online');

  useEffect(() => {
    const stopStats = getVisitorStats(setStats);

    // Initial dummy historical data for the chart based on current time
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      users: Math.floor(Math.random() * 5) + 1
    }));
    setChartData(initialData);

    // Simulated real-time updates every 10 seconds for the chart
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          users: stats?.online || Math.floor(Math.random() * 5) + 1
        }];
        return newData;
      });
    }, 10000);

    return () => {
      stopStats();
      clearInterval(interval);
    };
  }, [stats?.online]);

  const statsCards = [
    { label: 'Online Now', value: stats?.online || 1, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Last Hour', value: stats?.lastHour || 0, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Last 24h', value: stats?.last24Hours || 0, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'This Week', value: stats?.lastWeek || 0, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'This Month', value: stats?.lastMonth || 0, icon: Eye, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { label: 'All Time', value: stats?.lastYear || 0, icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const distributionData = [
    { name: 'Direct', value: 45, color: '#10b981' },
    { name: 'Organic Search', value: 30, color: '#3b82f6' },
    { name: 'Social', value: 15, color: '#f59e0b' },
    { name: 'Referral', value: 10, color: '#8b5cf6' },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <card.icon className={card.color} size={20} />
            </div>
            <div className="text-2xl font-black text-neutral-900 dark:text-white mb-1">
              {(card.value || 0).toLocaleString()}
            </div>
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              {card.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Traffic Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase">Traffic Pulse</h3>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Real-time user engagement levels</p>
            </div>
            <div className="flex gap-2">
               <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg animate-pulse">
                <Activity size={10} /> LIVE FEED
               </span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#888'}} 
                  interval="preserveStartEnd"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#888'}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#171717', 
                    borderRadius: '12px', 
                    border: 'none', 
                    fontSize: '12px', 
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }} 
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Acquisition Bar Chart */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-[2rem] shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase mb-2 text-center">Acquisition</h3>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center mb-8">Traffic Source Distribution</p>
          
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#888', fontWeight: 'bold'}}
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#171717', borderRadius: '12px', border: 'none', fontSize: '10px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {distributionData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-neutral-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Event Feed */}
      <div className="bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity size={120} className="text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-emerald-500" size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Tactical Engagement Feed</h3>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Live interaction monitoring</p>
            </div>
          </div>

          <div className="space-y-3">
             {[
               { id: 1, event: 'Product Comparison Initiated', user: 'User_4922', time: 'Just Now', icon: MousePointer2, color: 'text-blue-400' },
               { id: 2, event: 'Savings Analysis Completed', user: 'Hero_Savings_99', time: '2 min ago', icon: TrendingUp, color: 'text-emerald-400' },
               { id: 3, event: 'New Listing Scoped', user: 'Housing_Scout_Alpha', time: '5 min ago', icon: Globe, color: 'text-purple-400' },
               { id: 4, event: 'Fuel Tactical Scan Executed', user: 'Driver_Efficiency', time: '12 min ago', icon: Activity, color: 'text-amber-400' },
             ].map((evt) => (
               <div key={evt.id} className="bg-black/40 border border-neutral-800 p-4 rounded-2xl flex items-center gap-4 hover:border-neutral-700 transition group">
                 <div className={`p-2 rounded-lg bg-neutral-800 group-hover:scale-110 transition-transform ${evt.color}`}>
                    <evt.icon size={16} />
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-start">
                     <h4 className="text-xs font-bold text-white uppercase tracking-tight">{evt.event}</h4>
                     <span className="text-[9px] font-black text-neutral-600 uppercase">{evt.time}</span>
                   </div>
                   <p className="text-[10px] text-neutral-500 font-medium">Session Identifier: <span className="text-neutral-400">{evt.user}</span></p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
