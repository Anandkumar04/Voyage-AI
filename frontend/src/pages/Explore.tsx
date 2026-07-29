import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, Navigation, Heart, LayoutGrid, Rows } from 'lucide-react';
import { toast } from '../store/toastStore';
import { useSEO } from '../hooks/useSEO';

interface ExploreDestination {
  id: string;
  title: string;
  category: string;
  prompt: string;
  desc: string;
  duration: string;
  rating: string;
  tag: string;
}

const CATEGORIZED_DESTINATIONS: { category: string; icon: string; items: ExploreDestination[] }[] = [
  {
    category: "Trending Destinations",
    icon: "🔥",
    items: [
      { id: "kyoto", title: "Kyoto, Japan", category: "Trending", prompt: "kyoto japan traditional pagoda cherry blossom temple garden", desc: "Ancient temples, traditional gardens, tea houses, and geisha districts.", duration: "5 Days", rating: "4.9 ★", tag: "Cultural Heritage" },
      { id: "amalfi", title: "Amalfi Coast, Italy", category: "Trending", prompt: "amalfi coast italy cliffside scenic ocean village blue water", desc: "Dramatic cliffside villages, limoncello groves, and pristine blue Mediterranean waters.", duration: "4 Days", rating: "4.8 ★", tag: "Scenic Coast" },
      { id: "santorini", title: "Santorini, Greece", category: "Trending", prompt: "santorini greece white blue domes island sunset ocean", desc: "Iconic whitewashed buildings, vibrant sunsets, and caldera view dining.", duration: "3 Days", rating: "4.9 ★", tag: "Romantic Getaway" },
      { id: "paris", title: "Paris, France", category: "Trending", prompt: "paris eiffel tower evening sidewalk cafe autumn", desc: "World-class museums, historic boulevards, pastry shops, and timeless romantic charm.", duration: "5 Days", rating: "4.7 ★", tag: "Classic City" }
    ]
  },
  {
    category: "Luxury Escapes",
    icon: "✨",
    items: [
      { id: "maldives", title: "Maldives Overwater Villas", category: "Luxury Escapes", prompt: "maldives overwater villa turquoise lagoon crystal ocean resort", desc: "Exclusive private overwater bungalows, coral reef diving, and world-class spas.", duration: "6 Days", rating: "5.0 ★", tag: "Ultra Luxury" },
      { id: "swiss-alps", title: "St. Moritz, Switzerland", category: "Luxury Escapes", prompt: "st moritz swiss alps luxury ski chalet snow mountain resort", desc: "High-end alpine ski resorts, gourmet dining, and panoramic mountain chalets.", duration: "5 Days", rating: "4.9 ★", tag: "Alpine Retreat" },
      { id: "dubai", title: "Dubai, UAE", category: "Luxury Escapes", prompt: "dubai skyline burj khalifa luxury hotel desert resort sunset", desc: "Futuristic architecture, private desert safaris, and 7-star hospitality.", duration: "4 Days", rating: "4.8 ★", tag: "Modern Opulence" }
    ]
  },
  {
    category: "Weekend Trips",
    icon: "⚡",
    items: [
      { id: "barcelona", title: "Barcelona, Spain", category: "Weekend Trips", prompt: "barcelona gaudi sagrada familia gothic quarter architecture", desc: "Gaudí architecture, vibrant tapas bars, and lively Mediterranean beaches.", duration: "3 Days", rating: "4.8 ★", tag: "Quick City Break" },
      { id: "reykjavik", title: "Reykjavik, Iceland", category: "Weekend Trips", prompt: "reykjavik iceland blue lagoon hot spring northern lights", desc: "Geothermal lagoons, waterfalls, volcanic landscapes, and Northern Lights.", duration: "3 Days", rating: "4.9 ★", tag: "Nature Express" },
      { id: "vienna", title: "Vienna, Austria", category: "Weekend Trips", prompt: "vienna austria imperial palace classical music cafe culture", desc: "Imperial palaces, grand coffeehouses, and world-famous classical music halls.", duration: "3 Days", rating: "4.7 ★", tag: "Imperial Charm" }
    ]
  },
  {
    category: "Hidden Gems",
    icon: "💎",
    items: [
      { id: "slovenia", title: "Lake Bled, Slovenia", category: "Hidden Gems", prompt: "lake bled slovenia island church castle reflection mountains", desc: "Enchanting glacial lake with a castle perched on a cliff and island church.", duration: "4 Days", rating: "4.9 ★", tag: "Undiscovered" },
      { id: "matera", title: "Matera, Italy", category: "Hidden Gems", prompt: "matera italy ancient cave town sassi stones sunset architecture", desc: "Ancient cave dwellings carved directly into limestone canyons.", duration: "3 Days", rating: "4.8 ★", tag: "Historic Wonder" },
      { id: "faroe", title: "Faroe Islands", category: "Hidden Gems", prompt: "faroe islands waterfall green cliff dramatic ocean fog", desc: "Dramatic green sea cliffs, cascading ocean waterfalls, and remote villages.", duration: "5 Days", rating: "4.9 ★", tag: "Remote Paradise" }
    ]
  },
  {
    category: "Beach & Tropical",
    icon: "🏝️",
    items: [
      { id: "bali", title: "Bali, Indonesia", category: "Beach & Tropical", prompt: "bali indonesia ubud lush jungle rice terraces tropical resort", desc: "Lush jungles, tranquil rice terraces, spiritual temples, and surf beaches.", duration: "7 Days", rating: "4.8 ★", tag: "Island Life" },
      { id: "maui", title: "Maui, Hawaii", category: "Beach & Tropical", prompt: "maui hawaii tropical beach palm trees ocean waves green hills", desc: "Road to Hana coastal views, volcanic craters, and pristine snorkeling bays.", duration: "6 Days", rating: "4.9 ★", tag: "Island Magic" },
      { id: "tulum", title: "Tulum, Mexico", category: "Beach & Tropical", prompt: "tulum mexico white sand beach turquoise ocean cenote jungle", desc: "Mayan ruins overlooking turquoise waters, jungle cenotes, and beach clubs.", duration: "4 Days", rating: "4.7 ★", tag: "Coastal Vibe" }
    ]
  },
  {
    category: "Nature & Adventure",
    icon: "🏔️",
    items: [
      { id: "banff", title: "Banff, Canada", category: "Nature & Adventure", prompt: "banff national park lake louise turquoise water rocky mountains", desc: "Turquoise glacial lakes and towering Canadian Rocky Mountain peaks.", duration: "5 Days", rating: "4.9 ★", tag: "Alpine Wonderland" },
      { id: "patagonia", title: "Patagonia, Chile", category: "Nature & Adventure", prompt: "patagonia torres del paine chile mountain peaks glacier lake", desc: "Untamed wilderness, massive ice glaciers, and world-renowned hiking trails.", duration: "8 Days", rating: "5.0 ★", tag: "Trekking Haven" },
      { id: "queenstown", title: "Queenstown, New Zealand", category: "Nature & Adventure", prompt: "queenstown new zealand lake wakatipu mountain fjord adventure", desc: "The adventure capital of the world surrounded by alpine lakes and fjords.", duration: "6 Days", rating: "4.9 ★", tag: "Thrill Seeker" }
    ]
  }
];

export default function Explore() {
  useSEO('Explore Destinations', 'Discover handpicked global travel destinations organized into curated collections.');

  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  const toggleFavorite = (title: string) => {
    const isFav = !!favorites[title];
    setFavorites(prev => ({ ...prev, [title]: !isFav }));
    if (!isFav) {
      toast.success(`Saved to Favorites`, `Added ${title} to your wishlist.`);
    } else {
      toast.info(`Removed`, `Removed ${title} from wishlist.`);
    }
  };

  return (
    <div className="flex-grow bg-[#FAF9F6] dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 py-6 sm:py-10 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        
        {/* Header Hero Banner */}
        <div className="bg-white dark:bg-zinc-900 rounded-[20px] sm:rounded-[28px] border border-[#E5E2D9] dark:border-zinc-800 p-6 sm:p-10 md:p-12 text-center shadow-xs relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2.5">
            <Compass className="w-3.5 h-3.5" />
            Curated Global Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2D2D2D] dark:text-zinc-100 tracking-tight mb-2.5">
            Explore Destinations
          </h1>
          <p className="text-[#7D7A74] dark:text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
            Browse handpicked collections. Tap any destination card to generate an instant AI-crafted itinerary.
          </p>

          {/* View Mode Toggle */}
          <div className="mt-5 inline-flex items-center p-1 rounded-xl bg-[#FAF9F6] dark:bg-zinc-800 border border-[#E5E2D9] dark:border-zinc-700">
            <button
              onClick={() => setViewMode('carousel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-white dark:bg-zinc-900 text-[#2D2D2D] dark:text-zinc-100 shadow-2xs'
                  : 'text-[#7D7A74] dark:text-zinc-400 hover:text-[#2D2D2D]'
              }`}
            >
              <Rows className="w-3.5 h-3.5" />
              <span>Carousel</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-900 text-[#2D2D2D] dark:text-zinc-100 shadow-2xs'
                  : 'text-[#7D7A74] dark:text-zinc-400 hover:text-[#2D2D2D]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>
        </div>

        {/* Categorized Destinations */}
        <div className="space-y-10 sm:space-y-12">
          {CATEGORIZED_DESTINATIONS.map((catGroup) => (
            <div key={catGroup.category} className="space-y-3.5 sm:space-y-4">
              
              {/* Category Section Title */}
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">{catGroup.icon}</span>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100 tracking-tight">
                    {catGroup.category}
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#E5E2D9]/50 dark:bg-zinc-800 text-[11px] font-semibold text-[#7D7A74] dark:text-zinc-400">
                  {catGroup.items.length} Places
                </span>
              </div>

              {/* Responsive Layout: Carousel or Grid */}
              {viewMode === 'carousel' ? (
                /* Horizontal Scroll Carousel */
                <div className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory hide-scrollbar">
                  {catGroup.items.map((dest) => (
                    <motion.div
                      key={dest.id}
                      whileHover={{ y: -3 }}
                      className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px] bg-white dark:bg-zinc-900 rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#E5E2D9] dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      {/* Image Header */}
                      <div className="relative h-44 sm:h-52 overflow-hidden bg-[#E5E2D9] dark:bg-zinc-800">
                        <img 
                          src={`https://image.pollinations.ai/prompt/${encodeURIComponent(dest.prompt)}?width=700&height=450&nologo=true`} 
                          alt={dest.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            img.onerror = null;
                            img.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
                        
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                            {dest.tag}
                          </span>
                        </div>

                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(dest.title)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                            favorites[dest.title] 
                              ? 'bg-rose-500 text-white shadow-md' 
                              : 'bg-black/30 hover:bg-black/50 text-white'
                          }`}
                          title="Save to Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${favorites[dest.title] ? 'fill-current' : ''}`} />
                        </button>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <div className="flex items-center justify-between text-xs font-medium text-zinc-200 mb-0.5">
                            <span>{dest.duration}</span>
                            <span className="text-amber-400 font-bold">{dest.rating}</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold leading-tight drop-shadow-sm truncate">{dest.title}</h3>
                        </div>
                      </div>

                      {/* Card Content & CTA */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3.5">
                        <p className="text-xs text-[#7D7A74] dark:text-zinc-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                          {dest.desc}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            toast.info(`Generating Trip`, `Creating itinerary for ${dest.title}...`);
                            navigate(`/planner?destination=${encodeURIComponent(dest.title)}&auto=true`);
                          }}
                          className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-[0.99]"
                        >
                          <span>Plan Trip Here</span>
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {/* End Spacer for Mobile Scroll */}
                  <div className="w-1 flex-shrink-0" />
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {catGroup.items.map((dest) => (
                    <motion.div
                      key={dest.id}
                      whileHover={{ y: -3 }}
                      className="bg-white dark:bg-zinc-900 rounded-[20px] sm:rounded-[24px] overflow-hidden border border-[#E5E2D9] dark:border-zinc-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      {/* Image Header */}
                      <div className="relative h-48 sm:h-52 overflow-hidden bg-[#E5E2D9] dark:bg-zinc-800">
                        <img 
                          src={`https://image.pollinations.ai/prompt/${encodeURIComponent(dest.prompt)}?width=700&height=450&nologo=true`} 
                          alt={dest.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            img.onerror = null;
                            img.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
                        
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                            {dest.tag}
                          </span>
                        </div>

                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(dest.title)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                            favorites[dest.title] 
                              ? 'bg-rose-500 text-white shadow-md' 
                              : 'bg-black/30 hover:bg-black/50 text-white'
                          }`}
                          title="Save to Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${favorites[dest.title] ? 'fill-current' : ''}`} />
                        </button>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <div className="flex items-center justify-between text-xs font-medium text-zinc-200 mb-0.5">
                            <span>{dest.duration}</span>
                            <span className="text-amber-400 font-bold">{dest.rating}</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold leading-tight drop-shadow-sm truncate">{dest.title}</h3>
                        </div>
                      </div>

                      {/* Card Content & CTA */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3.5">
                        <p className="text-xs text-[#7D7A74] dark:text-zinc-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                          {dest.desc}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            toast.info(`Generating Trip`, `Creating itinerary for ${dest.title}...`);
                            navigate(`/planner?destination=${encodeURIComponent(dest.title)}&auto=true`);
                          }}
                          className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-[0.99]"
                        >
                          <span>Plan Trip Here</span>
                          <Navigation className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

