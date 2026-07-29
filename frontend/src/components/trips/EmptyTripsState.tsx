import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, Plane, ChevronRight, Sparkles, MapPin, Calendar, Wallet } from 'lucide-react';

const popularDestinations = [
  { name: 'Kyoto, Japan', days: '5', image: 'kyoto japan traditional pagoda cherry blossom', style: 'Cultural', budget: 'Moderate' },
  { name: 'Amalfi Coast, Italy', days: '7', image: 'amalfi coast italy cliffside scenic ocean village', style: 'Luxury', budget: 'Luxury' },
  { name: 'Paris, France', days: '4', image: 'paris eiffel tower evening romantic', style: 'Romantic', budget: 'Moderate' },
  { name: 'Banff, Canada', days: '6', image: 'banff national park lake louise turquoise water', style: 'Adventure', budget: 'Moderate' }
];

export const EmptyTripsState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      {/* Main Empty State Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-[28px] border border-[#E5E2D9] dark:border-zinc-800 p-8 md:p-16 text-center shadow-sm relative overflow-hidden"
      >
        <div className="w-20 h-20 bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Compass className="w-10 h-10 text-[#3b82f6] dark:text-blue-400" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Ready For Exploration
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] dark:text-zinc-100 mb-3">
          Your Travel Canvas is Empty
        </h3>
        
        <p className="text-[#7D7A74] dark:text-zinc-400 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
          Create your first custom travel plan! Our AI will craft a personalized day-by-day itinerary, curated hotels, and cost breakdown in seconds.
        </p>

        <button
          onClick={() => navigate('/planner')}
          className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-[14px] text-white bg-[#3b82f6] dark:bg-blue-600 hover:bg-[#1d4ed8] dark:hover:bg-blue-700 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
        >
          Plan New AI Itinerary
          <Plane className="w-4 h-4 ml-2" />
        </button>
      </motion.div>

      {/* Popular Destination Inspiration */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-zinc-100">Popular Travel Inspiration</h3>
            <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Tap any location below to start generating an itinerary</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDestinations.map((dest, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => navigate(`/planner?destination=${encodeURIComponent(dest.name)}&auto=true`)}
              className="bg-white dark:bg-zinc-900 rounded-[20px] border border-[#E5E2D9] dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="h-44 bg-[#E5E2D9] dark:bg-zinc-800 relative overflow-hidden">
                <img 
                  src={`https://image.pollinations.ai/prompt/${encodeURIComponent(dest.image)}?width=600&height=400&nologo=true`}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-bold text-lg leading-snug">{dest.name}</h4>
                  <p className="text-xs text-white/80">{dest.days} Days • {dest.style}</p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs font-bold text-[#3b82f6] dark:text-blue-400 group-hover:text-[#1d4ed8]">
                <span>Generate Itinerary</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyTripsState;
