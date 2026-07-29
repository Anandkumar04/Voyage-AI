import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Sparkles, Compass, Download, Upload, 
  MapPin, Calendar, Wallet, Clock, ArrowRight, Edit3, Trash2, CheckCircle2, Heart, Flame
} from 'lucide-react';
import { useAppStore } from '../store';
import { toast } from '../store/toastStore';
import { Trip } from '../types';
import TripCard from '../components/trips/TripCard';
import TripEditModal from '../components/trips/TripEditModal';
import TripFilterBar from '../components/trips/TripFilterBar';
import EmptyTripsState from '../components/trips/EmptyTripsState';
import { useSEO } from '../hooks/useSEO';

type TripCategory = 'all' | 'upcoming' | 'completed' | 'wishlist';

export default function Dashboard() {
  useSEO('My Trips', 'Manage, edit, export, wishlist, and organize your AI travel itineraries.');

  const navigate = useNavigate();
  const savedTrips = useAppStore(state => state.savedTrips);
  const deleteTrip = useAppStore(state => state.deleteTrip);
  const toggleWishlist = useAppStore(state => state.toggleWishlist);
  const updateTripDetails = useAppStore(state => state.updateTripDetails);
  const importTrips = useAppStore(state => state.importTrips);

  // Category Tab state
  const [activeCategory, setActiveCategory] = useState<TripCategory>('all');

  // Filtering & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Helper to determine trip status
  const getTripCategory = (trip: Trip): 'upcoming' | 'completed' | 'wishlist' => {
    if (trip.isWishlist) return 'wishlist';
    const daysCount = parseInt(trip.days || '0');
    if (daysCount < 3) return 'completed';
    return 'upcoming';
  };

  // Filter & Sort Logic
  const filteredTrips = useMemo(() => {
    return savedTrips
      .filter((trip) => {
        // Category filter
        if (activeCategory !== 'all') {
          if (activeCategory === 'wishlist') {
            if (!trip.isWishlist) return false;
          } else {
            const cat = getTripCategory(trip);
            if (cat !== activeCategory) return false;
          }
        }

        const matchesSearch = 
          trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.interests.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (trip.notes && trip.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesBudget = selectedBudget === 'All' || trip.budget.toLowerCase().includes(selectedBudget.toLowerCase());
        const matchesStyle = selectedStyle === 'All' || trip.style.toLowerCase().includes(selectedStyle.toLowerCase());

        return matchesSearch && matchesBudget && matchesStyle;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'destination') {
          return a.destination.localeCompare(b.destination);
        }
        if (sortBy === 'duration') {
          return parseInt(b.days || '0') - parseInt(a.days || '0');
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [savedTrips, activeCategory, searchTerm, selectedBudget, selectedStyle, sortBy]);

  // Handler for toggling wishlist
  const handleToggleWishlist = (trip: Trip) => {
    toggleWishlist(trip.id);
    if (!trip.isWishlist) {
      toast.success(`Added to Wishlist`, `Saved "${trip.destination}" to your wishlist.`);
    } else {
      toast.info(`Removed from Wishlist`, `Removed "${trip.destination}" from your wishlist.`);
    }
  };

  // Handler for deleting
  const handleDelete = (trip: Trip) => {
    deleteTrip(trip.id);
    toast.info(`Trip Deleted`, `Removed itinerary for "${trip.destination}".`);
  };

  // Handler for editing
  const handleEditOpen = (trip: Trip) => {
    setEditingTrip(trip);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (id: string, updatedFields: Partial<Trip>) => {
    updateTripDetails(id, updatedFields);
    toast.success(`Trip Updated`, `Saved changes for "${updatedFields.destination || 'your trip'}".`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedBudget('All');
    setSelectedStyle('All');
    setSortBy('newest');
    setActiveCategory('all');
  };

  // Export Trips JSON
  const handleExportJSON = () => {
    if (savedTrips.length === 0) {
      toast.warning('No trips to export', 'Create a trip before exporting data.');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedTrips, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `voyage_ai_saved_trips_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Backup Exported', 'Saved trips downloaded in JSON format.');
  };

  // Import Trips JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          importTrips(importedData);
          toast.success('Trips Imported!', `Successfully loaded ${importedData.length} saved trips.`);
        } else {
          toast.error('Invalid Format', 'JSON must contain an array of trip objects.');
        }
      } catch (err) {
        toast.error('Import Failed', 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const categoryCounts = useMemo(() => {
    const counts = { all: savedTrips.length, upcoming: 0, completed: 0, wishlist: 0 };
    savedTrips.forEach(t => {
      if (t.isWishlist) counts.wishlist++;
      const cat = getTripCategory(t);
      if (cat === 'upcoming' && !t.isWishlist) counts.upcoming++;
      if (cat === 'completed' && !t.isWishlist) counts.completed++;
    });
    return counts;
  }, [savedTrips]);

  return (
    <div className="flex-grow bg-[#FAF9F6] dark:bg-zinc-950 px-4 py-8 sm:py-12 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Console */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[28px] border border-[#E5E2D9] dark:border-zinc-800 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              My Travel Portfolio
            </div>
            <h1 className="text-3xl font-extrabold text-[#2D2D2D] dark:text-zinc-100 tracking-tight">My Trips</h1>
            <p className="text-[#7D7A74] dark:text-zinc-400 text-xs sm:text-sm mt-1">
              {savedTrips.length === 0
                ? 'Your portfolio is empty'
                : `${savedTrips.length} itineraries in your personal travel library`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {savedTrips.length > 0 && (
              <button
                onClick={handleExportJSON}
                className="px-4 py-2.5 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 text-xs font-bold text-[#2D2D2D] dark:text-zinc-300 hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Backup saved trips to JSON file"
              >
                <Download className="w-4 h-4 text-blue-500" />
                Export
              </button>
            )}

            <label className="px-4 py-2.5 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 text-xs font-bold text-[#2D2D2D] dark:text-zinc-300 hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-500" />
              Import
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportJSON} 
                className="hidden" 
              />
            </label>
            
            <Link
              to="/planner"
              className="inline-flex items-center justify-center px-5 py-3 text-xs font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Plan New Trip
            </Link>
          </div>
        </div>

        {/* Category Segmented Tabs: [ All | Upcoming | Completed | Wishlist ] */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {[
            { id: 'all', label: 'All Trips', count: categoryCounts.all, icon: Compass },
            { id: 'upcoming', label: 'Upcoming', count: categoryCounts.upcoming, icon: Calendar },
            { id: 'completed', label: 'Completed', count: categoryCounts.completed, icon: CheckCircle2 },
            { id: 'wishlist', label: 'Wishlist', count: categoryCounts.wishlist, icon: Heart },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as TripCategory)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#2D2D2D] text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 text-[#7D7A74] dark:text-zinc-400 hover:text-[#2D2D2D] dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white dark:bg-zinc-900/30 dark:text-zinc-900' : 'bg-[#FAF9F6] dark:bg-zinc-800 text-[#7D7A74]'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        {savedTrips.length === 0 ? (
          <EmptyTripsState />
        ) : (
          <div className="space-y-6">
            {/* Grid View */}
            {filteredTrips.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 p-12 text-center space-y-4">
                <p className="text-base font-bold text-[#2D2D2D] dark:text-zinc-100">No trips found in this category</p>
                <p className="text-xs text-[#7D7A74] dark:text-zinc-400 max-w-sm mx-auto">
                  Select "All Trips" to view your full travel portfolio.
                </p>
                <button
                  onClick={() => setActiveCategory('all')}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  View All Trips
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onEdit={handleEditOpen}
                      onToggleWishlist={handleToggleWishlist}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        <TripEditModal
          isOpen={isEditModalOpen}
          trip={editingTrip}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTrip(null);
          }}
          onSave={handleSaveEdit}
        />

      </div>
    </div>
  );
}
