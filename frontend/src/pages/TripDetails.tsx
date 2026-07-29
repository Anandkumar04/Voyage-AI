import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Wallet, MapPin, Clock, ArrowLeft, Sun, Star, 
  Share2, Printer, X, Compass, CheckCircle2, Sparkles, Map as MapIcon, 
  MessageSquare, Navigation, ArrowUpRight
} from 'lucide-react';
import { useAppStore } from '../store';
import { toast } from '../store/toastStore';
import TripMap from '../components/TripMap';
import ExportShareModal from '../components/trips/ExportShareModal';
import PrintableItinerary from '../components/trips/PrintableItinerary';
import HotelsSection from '../components/trips/HotelsSection';
import BudgetSection from '../components/trips/BudgetSection';
import TravelEssentials from '../components/trips/TravelEssentials';
import TripToolkit from '../components/trips/TripToolkit';
import { useSEO } from '../hooks/useSEO';

export default function TripDetails() {
  const { id } = useParams();
  const trip = useAppStore(state => state.savedTrips.find(t => t.id === id) || state.currentTrip);
  const toggleChat = useAppStore(state => state.toggleChat);

  useSEO(
    trip ? `Trip to ${trip.destination}` : 'Trip Details',
    trip ? `Detailed itinerary for ${trip.destination}` : 'Trip details view.'
  );

  // Segmented Navigation Tabs: [ Itinerary ⭐ | Overview | Budget | Hotels | Essentials | Toolkit ]
  const [activeTab, setActiveTab] = useState<'itinerary' | 'overview' | 'budget' | 'hotels' | 'essentials' | 'more'>('itinerary');
  const [selectedDayNum, setSelectedDayNum] = useState<number | 'ALL'>('ALL');
  
  // Interactive Map Drawer state
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);
  const [activeActivityTitle, setActiveActivityTitle] = useState<string | null>(null);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const handleTriggerPrint = () => {
    setIsPrintPreviewOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (!trip) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#FAF9F6] dark:bg-zinc-950 p-6">
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100">Trip not found</h2>
          <p className="text-xs text-[#7D7A74] dark:text-zinc-400">The trip you are looking for does not exist or has been removed.</p>
          <Link to="/dashboard" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
            Return to My Trips
          </Link>
        </div>
      </div>
    );
  }

  const { itinerary } = trip;
  const daysList = itinerary?.days || [];

  const filteredDays = selectedDayNum === 'ALL' 
    ? daysList 
    : daysList.filter(d => d.day === selectedDayNum);

  // Calculate total activities count
  const totalActivitiesCount = daysList.reduce((acc, d) => acc + (d.activities?.length || 0), 0);

  return (
    <div className="flex-grow bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-100 flex flex-col min-h-0 relative">
      
      {/* Top Header Bar */}
      <header className="bg-white dark:bg-zinc-900 border-b border-[#E5E2D9] dark:border-zinc-800 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 transition-colors">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Breadcrumb & Global Actions */}
          <div className="flex items-center justify-between gap-4">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-xs font-bold text-[#7D7A74] hover:text-[#2D2D2D] dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>My Trips</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="p-2.5 sm:px-3.5 sm:py-1.5 rounded-xl border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-200 text-xs font-bold hover:border-blue-500 transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px]"
                title="Share & Export"
              >
                <Share2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-blue-500" />
                <span className="hidden sm:inline">Share & Export</span>
              </button>

              <button
                onClick={handleTriggerPrint}
                className="p-2.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs min-h-[40px]"
                title="Print or export PDF"
              >
                <Printer className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Title Banner & Meta */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold mb-1">
                <MapPin className="w-3 h-3" />
                <span>{trip.destination}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2D2D] dark:text-zinc-100 tracking-tight">
                {trip.destination}
              </h1>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar text-xs font-bold">
              <div className="px-3.5 py-1.5 rounded-xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{trip.dates || `${trip.days} Days`}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 flex items-center gap-1.5 whitespace-nowrap">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                <span>{trip.budget}</span>
              </div>
              {itinerary?.weather && (
                <div className="px-3.5 py-1.5 rounded-xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 flex items-center gap-1.5 whitespace-nowrap">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="truncate max-w-[130px]">{itinerary.weather}</span>
                </div>
              )}
            </div>
          </div>

          {/* Segmented Sub-Navigation Bar */}
          <div className="flex items-center gap-1.5 border-t border-[#E5E2D9] dark:border-zinc-800 pt-3 overflow-x-auto hide-scrollbar">
            {[
              { id: 'itinerary', label: 'Itinerary Timeline ⭐' },
              { id: 'overview', label: 'Overview' },
              { id: 'budget', label: 'Budget Breakdown' },
              { id: 'hotels', label: 'Hotels' },
              { id: 'essentials', label: 'Essentials' },
              { id: 'more', label: 'Toolkit' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer min-h-[38px] flex items-center justify-center ${
                    isActive
                      ? 'bg-[#2D2D2D] text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                      : 'text-[#7D7A74] dark:text-zinc-400 hover:text-[#2D2D2D] dark:hover:text-white hover:bg-[#FAF9F6] dark:hover:bg-zinc-950'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* Main Content Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: ITINERARY TIMELINE VIEW (DESKTOP 2-COLUMN LAYOUT) */}
        {/* ========================================================================= */}
        {activeTab === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: VISUAL DAY TIMELINE (8 COLS) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              
              {/* Day Filter Bar + Mobile Map Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 shadow-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                  <button
                    onClick={() => setSelectedDayNum('ALL')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDayNum === 'ALL'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#FAF9F6] dark:bg-zinc-950 text-[#7D7A74] dark:text-zinc-400 border border-[#E5E2D9] dark:border-zinc-800'
                    }`}
                  >
                    All Days ({daysList.length})
                  </button>

                  {daysList.map((d) => (
                    <button
                      key={d.day}
                      onClick={() => setSelectedDayNum(d.day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        selectedDayNum === d.day
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#FAF9F6] dark:bg-zinc-950 text-[#7D7A74] dark:text-zinc-400 border border-[#E5E2D9] dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      Day {d.day}
                    </button>
                  ))}
                </div>

                {/* Mobile Floating Map Trigger */}
                <button
                  type="button"
                  onClick={() => setIsMobileMapOpen(!isMobileMapOpen)}
                  className="lg:hidden px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 text-[#2D2D2D] dark:text-zinc-200 hover:border-blue-500 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <MapIcon className="w-4 h-4 text-blue-500" />
                  <span>{isMobileMapOpen ? 'Hide Map' : 'Show Map'}</span>
                </button>
              </div>

              {/* Mobile Drawer Map */}
              <AnimatePresence>
                {isMobileMapOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 350 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="lg:hidden w-full bg-[#E5E2D9] dark:bg-zinc-800 rounded-2xl overflow-hidden border border-[#E5E2D9] dark:border-zinc-800 shadow-md relative"
                  >
                    <TripMap
                      destination={trip.destination}
                      days={itinerary?.days}
                      activities={itinerary?.days?.flatMap(d => d?.activities || []) || []}
                      activeActivityTitle={activeActivityTitle}
                      onSelectActivity={(title) => setActiveActivityTitle(title)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Day-by-Day Timeline List */}
              <div className="space-y-8 sm:space-y-12">
                {filteredDays.map((day) => (
                  <div key={day.day} className="space-y-4 sm:space-y-6">
                    
                    {/* Day Header Badge */}
                    <div className="flex flex-row items-center justify-between gap-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3.5 sm:px-5 py-3 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 shadow-xs">
                      <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#2D2D2D] dark:text-zinc-100 min-w-0">
                        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white text-[11px] sm:text-xs flex items-center justify-center font-extrabold shadow-xs flex-shrink-0">
                          {day.day}
                        </span>
                        <span className="whitespace-nowrap">Day {day.day}</span>
                        <span className="text-[#A8A399] dark:text-zinc-600 hidden sm:inline">•</span>
                        <span className="text-xs text-[#7D7A74] dark:text-zinc-400 font-medium truncate max-w-[120px] sm:max-w-none">{day.theme}</span>
                      </div>

                      {day.totalDailyCost && (
                        <span className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-1 rounded-lg flex-shrink-0">
                          {day.totalDailyCost}
                        </span>
                      )}
                    </div>

                    {/* Timeline Activity Loop with Visual Connector Line */}
                    <div className="relative pl-4 sm:pl-8 space-y-6 sm:space-y-8 before:absolute before:left-1.5 sm:before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#E5E2D9] dark:before:bg-zinc-800">
                      {(day.activities || []).map((act, actIdx) => {
                        const isHighlighted = activeActivityTitle?.toLowerCase() === act.title.toLowerCase();
                        const imageQuery = `${act.title} ${trip.destination} travel landmark photography`;

                        return (
                          <div key={actIdx} className="relative group">
                            
                            {/* Timeline Connector Dot */}
                            <div className={`absolute -left-4 sm:-left-8 top-5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 bg-white dark:bg-zinc-900 transition-all ${
                              isHighlighted ? 'border-blue-600 bg-blue-600 scale-125 ring-4 ring-blue-500/20' : 'border-[#3b82f6] group-hover:scale-110'
                            }`} />

                            {/* Airbnb Experience Card */}
                            <motion.div 
                              whileHover={{ y: -2 }}
                              className={`bg-white dark:bg-zinc-900 rounded-[20px] sm:rounded-[24px] border overflow-hidden transition-all shadow-xs ${
                                isHighlighted
                                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                                  : 'border-[#E5E2D9] dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                              }`}
                            >
                              {/* 16:9 Aspect Ratio Image Thumbnail */}
                              <div className="relative h-40 sm:h-56 bg-[#E5E2D9] dark:bg-zinc-800 overflow-hidden">
                                <img 
                                  src={`https://image.pollinations.ai/prompt/${encodeURIComponent(imageQuery)}?width=800&height=450&nologo=true`}
                                  alt={act.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                  onError={(e) => {
                                    // Fallback to crisp Unsplash travel photography if pollinations image fails
                                    const img = e.currentTarget as HTMLImageElement;
                                    img.onerror = null; // prevent loop
                                    img.src = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80`;
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                                <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 bg-black/60 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                                  <span>{act.time}</span>
                                </div>

                                {act.rating && (
                                  <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 bg-black/60 backdrop-blur-md text-amber-400 text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                                    <span>{act.rating}</span>
                                  </div>
                                )}

                                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 text-white">
                                  <h3 className="text-base sm:text-lg font-bold leading-tight drop-shadow-sm mb-0.5 sm:mb-1">{act.title}</h3>
                                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/80 font-medium">
                                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-300 flex-shrink-0" />
                                    <span className="truncate">{act.location}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Card Body & Details */}
                              <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                                <p className="text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-300 leading-relaxed">
                                  {act.description}
                                </p>

                                <div className="pt-2.5 sm:pt-3 border-t border-[#E5E2D9] dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                                  {act.cost ? (
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                      <Wallet className="w-3.5 h-3.5" />
                                      {act.cost}
                                    </span>
                                  ) : <div />}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (activeActivityTitle === act.title) {
                                        setActiveActivityTitle(null);
                                        toast.info("Map Cleared", "Cleared location from map");
                                      } else {
                                        setActiveActivityTitle(act.title);
                                        toast.info("Navigating Location", `Displaying location for ${act.title} on map`);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px] ${
                                      isHighlighted 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                        : 'bg-[#FAF9F6] dark:bg-zinc-950 border-[#E5E2D9] dark:border-zinc-800 text-[#2D2D2D] dark:text-zinc-200 hover:border-blue-500'
                                    }`}
                                  >
                                    <Navigation className="w-3.5 h-3.5 text-blue-500" />
                                    <span>{isHighlighted ? 'Navigating' : 'Navigate'}</span>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* RIGHT COLUMN: STICKY SIDEBAR (4 COLS - DESKTOP ONLY) */}
            {/* <div className="hidden lg:block lg:col-span-5 xl:col-span-4 space-y-6 sticky top-24"> */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-6 self-start">
              
              {/* Sticky Mini Interactive Map */}
              {/* <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-[#E5E2D9] dark:border-zinc-800 overflow-hidden shadow-sm p-2 pb-10"> */}
              <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 p-2 shadow-xs relative group flex-1 min-h-0 flex flex-col">  
                {/* <div className="px-4 py-3 flex items-center justify-between border-b border-[#E5E2D9] dark:border-zinc-800 mb-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#2D2D2D] dark:text-zinc-100 uppercase tracking-wider">
                    <Compass className="w-4 h-4 text-blue-500" />
                    <span>Route Overview</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#7D7A74] dark:text-zinc-400">
                    {totalActivitiesCount} Stops
                  </span>
                </div> */}

                {/* <div className="h-72 w-full rounded-2xl overflow-hidden border border-[#E5E2D9] dark:border-zinc-800"> */}
                <div className="relative flex-1 w-full rounded-[18px] overflow-hidden border border-[#E5E2D9] dark:border-zinc-800 shadow-inner"> 
                  <TripMap
                    destination={trip.destination}
                    days={itinerary?.days}
                    activities={itinerary?.days?.flatMap(d => d?.activities || []) || []}
                    activeActivityTitle={activeActivityTitle}
                    onSelectActivity={(title) => setActiveActivityTitle(title)}
                  />
                </div>
              </div>

              {/* Weather & Budget Quick Summary */}
              {/* <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7D7A74] dark:text-zinc-400 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Destination Forecast
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {itinerary?.weather || 'Mild'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#7D7A74] dark:text-zinc-400 font-medium block">Total Estimate</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {itinerary?.estimatedTotalCost || trip.budget}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('budget')}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-all text-[11px]"
                  >
                    View Details
                  </button>
                </div>
              </div> */}

              {/* AI Assistant Quick Trigger Box */}
              {/* <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[24px] p-6 shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-200">
                  <Sparkles className="w-4 h-4" />
                  Voyage Concierge
                </div>

                <h3 className="text-lg font-bold">Need live itinerary adjustments?</h3>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Ask our AI Assistant to add local restaurants, rearrange day activities, or check weather tips.
                </p>

                <button
                  type="button"
                  onClick={toggleChat}
                  className="w-full py-3 px-4 rounded-xl bg-white text-blue-700 font-extrabold text-xs hover:bg-blue-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Assistant Chat</span>
                </button>
              </div> */}

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: OVERVIEW VIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-[28px] border border-[#E5E2D9] dark:border-zinc-800 shadow-xs space-y-4">
              <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100">Trip Overview & Summary</h2>
              <p className="text-sm text-[#7D7A74] dark:text-zinc-300 leading-relaxed">
                {itinerary?.summary || `Custom planned trip for ${trip.destination}.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800">
                <span className="text-xs font-bold text-[#7D7A74] uppercase">Duration</span>
                <div className="text-xl font-bold text-[#2D2D2D] dark:text-zinc-100 mt-1">{trip.days} Days</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800">
                <span className="text-xs font-bold text-[#7D7A74] uppercase">Group Size</span>
                <div className="text-xl font-bold text-[#2D2D2D] dark:text-zinc-100 mt-1">{trip.groupSize}</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800">
                <span className="text-xs font-bold text-[#7D7A74] uppercase">Budget Tier</span>
                <div className="text-xl font-bold text-[#2D2D2D] dark:text-zinc-100 mt-1">{trip.budget}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BUDGET */}
        {activeTab === 'budget' && (
          <BudgetSection
            itinerary={itinerary}
            tripDays={trip.days}
            groupSize={trip.groupSize}
            destination={trip.destination}
          />
        )}

        {/* TAB 4: HOTELS */}
        {activeTab === 'hotels' && (
          <HotelsSection
            hotels={itinerary?.hotels || []}
            destination={trip.destination}
          />
        )}

        {/* TAB 5: ESSENTIALS */}
        {activeTab === 'essentials' && (
          <TravelEssentials destination={trip.destination} />
        )}

        {/* TAB 6: TOOLKIT */}
        {activeTab === 'more' && (
          <TripToolkit
            destination={trip.destination}
            packingList={itinerary?.packingAdvice}
          />
        )}

      </main>

      {/* Export Share Modal */}
      <ExportShareModal
        isOpen={isExportModalOpen}
        trip={trip}
        onClose={() => setIsExportModalOpen(false)}
        onPrint={handleTriggerPrint}
      />

      {/* Print Preview Modal */}
      <AnimatePresence>
        {isPrintPreviewOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
            <div className="sticky top-0 z-20 w-full max-w-4xl bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 p-4 rounded-2xl shadow-xl mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-bold text-[#2D2D2D] dark:text-zinc-100">Printable Document Preview</span>
              </div>
              <button
                onClick={() => setIsPrintPreviewOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl border border-zinc-200">
              <PrintableItinerary trip={trip} />
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="hidden print:block">
        <PrintableItinerary trip={trip} />
      </div>

    </div>
  );
}
