import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, ChevronDown, Sparkles, Hotel as HotelIcon, Compass, Utensils, Bus, ShoppingBag, ShieldAlert, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { ItineraryData } from '../../types';
import { toast } from '../../store/toastStore';

interface BudgetSectionProps {
  itinerary: ItineraryData;
  tripDays: string;
  groupSize: string;
  destination: string;
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', rate: 1 },
  { code: 'USD', symbol: '$', rate: 0.012 },
  { code: 'EUR', symbol: '€', rate: 0.011 },
  { code: 'GBP', symbol: '£', rate: 0.0095 },
  { code: 'JPY', symbol: '¥', rate: 1.85 },
];

export default function BudgetSection({ itinerary, tripDays, groupSize }: BudgetSectionProps) {
  const daysCount = parseInt(tripDays, 10) || 1;
  const travelersCount = parseInt(groupSize, 10) || 1;

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);

  // Extract base cost in INR
  const baseCostINR = useMemo(() => {
    if (!itinerary?.estimatedTotalCost) return 125000;
    const digitsOnly = itinerary.estimatedTotalCost.replace(/,/g, '').match(/\d+/);
    if (!digitsOnly) return 125000;
    const val = parseInt(digitsOnly[0], 10);
    // If it was generated in USD, convert to INR
    if (itinerary.estimatedTotalCost.includes('$')) return Math.round(val * 83.5);
    return val;
  }, [itinerary]);

  const formatMoney = (inrAmount: number) => {
    const converted = Math.round(inrAmount * selectedCurrency.rate);
    return `${selectedCurrency.symbol}${converted.toLocaleString('en-IN')}`;
  };

  const accommodationCostINR = Math.round(baseCostINR * 0.35);
  const foodCostINR = Math.round(baseCostINR * 0.25);
  const activitiesCostINR = Math.round(baseCostINR * 0.25);
  const transportCostINR = Math.round(baseCostINR * 0.15);

  const categoryBreakdown = [
    { name: 'Accommodation', amount: accommodationCostINR, icon: HotelIcon, color: '#3b82f6', percent: '35%' },
    { name: 'Food & Dining', amount: foodCostINR, icon: Utensils, color: '#10b981', percent: '25%' },
    { name: 'Activities & Passes', amount: activitiesCostINR, icon: Compass, color: '#8b5cf6', percent: '25%' },
    { name: 'Transport & Commute', amount: transportCostINR, icon: Bus, color: '#f59e0b', percent: '15%' },
  ];

  const chartData = categoryBreakdown.map(c => ({
    name: c.name,
    amountUSD: c.amount,
  }));

  return (
    <div id="budget" className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Header & Main Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2D9] dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <span>Budget Overview</span>
          </div>
          <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100">Estimated Trip Budget</h2>
          <p className="text-xs text-[#7D7A74] dark:text-zinc-400 mt-1">
            Calculated for {travelersCount} traveler{travelersCount > 1 ? 's' : ''} across {daysCount} days
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#A8A399] tracking-wider block">Total Estimated</span>
            <span className="text-2xl font-extrabold text-[#2D2D2D] dark:text-zinc-100">{formatMoney(baseCostINR)}</span>
          </div>

          <select
            value={selectedCurrency.code}
            onChange={(e) => {
              const found = CURRENCIES.find(c => c.code === e.target.value);
              if (found) setSelectedCurrency(found);
            }}
            className="bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 text-xs font-bold py-1.5 px-2.5 rounded-xl text-[#2D2D2D] dark:text-zinc-200 focus:outline-none cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Simplified Category Cards Grid (As requested: Accommodation, Food, Activities, Transport) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryBreakdown.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.name} className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800" style={{ color: cat.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-[#7D7A74]">{cat.percent}</span>
              </div>
              <div className="text-xs text-[#7D7A74] dark:text-zinc-400 font-medium">{cat.name}</div>
              <div className="text-lg font-bold text-[#2D2D2D] dark:text-zinc-100">{formatMoney(cat.amount)}</div>
            </div>
          );
        })}
      </div>

      {/* Progressive Disclosure Toggle Button for Detailed Charts */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 rounded-2xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 text-xs font-bold text-[#2D2D2D] dark:text-zinc-200 hover:border-blue-500 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <PieChartIcon className="w-4 h-4 text-blue-500" />
          <span>{isExpanded ? 'Hide Detailed Charts & Breakdown' : 'View Detailed Charts & Breakdown'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expandable Charts & Graphs */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-4 border-t border-[#E5E2D9] dark:border-zinc-800 space-y-6"
          >
            <div className="h-60 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="amountUSD"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: any) => [formatMoney(Number(value)), 'Estimated Cost']}
                    contentStyle={{
                      backgroundColor: 'rgba(24, 24, 27, 0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
