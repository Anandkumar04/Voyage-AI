import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Wallet, Users, Clock, MoreVertical, 
  Eye, Edit3, Heart, Trash2, MapPin, Sparkles, AlertTriangle, Share2, Printer, X
} from 'lucide-react';
import { Trip } from '../../types';
import { Badge } from '../ui/Badge';
import ExportShareModal from './ExportShareModal';
import PrintableItinerary from './PrintableItinerary';

interface TripCardProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onToggleWishlist: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = React.memo(({
  trip,
  onEdit,
  onToggleWishlist,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const handleTriggerPrint = () => {
    setIsPrintPreviewOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const formatDate = (dateValue: string | Date) => {
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const imagePrompt = trip.thumbnailUrl || `${trip.destination} travel landmark scenery photography`;
  const formattedCreated = formatDate(trip.createdAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative"
    >
      {/* Top Image Container */}
      <div className="h-52 bg-[#E5E2D9] dark:bg-zinc-800 relative overflow-hidden">
        <img 
          src={`https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=600&height=400&nologo=true`}
          alt={trip.destination}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.onerror = null;
            img.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge variant="blue" icon={<MapPin className="w-3 h-3" />}>
            {trip.style || 'Custom'}
          </Badge>
          {trip.isWishlist && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm backdrop-blur-md">
              <Heart className="w-3 h-3 fill-white text-white" />
              Wishlist
            </div>
          )}
        </div>

        {/* Top Right Action Menu */}
        <div className="absolute top-4 right-4 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all cursor-pointer"
            aria-label="Trip options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Action Menu Dropdown */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 shadow-xl rounded-[18px] py-2 overflow-hidden text-xs font-semibold"
                >
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(`/trip/${trip.id}`);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 text-[#2D2D2D] dark:text-zinc-200 hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <Eye className="w-4 h-4 text-[#3b82f6]" />
                    View Itinerary
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsExportModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 text-[#2D2D2D] dark:text-zinc-200 hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <Share2 className="w-4 h-4 text-emerald-500" />
                    Share & Export
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit(trip);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 text-[#2D2D2D] dark:text-zinc-200 hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <Edit3 className="w-4 h-4 text-amber-500" />
                    Edit Details
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleWishlist(trip);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 text-[#2D2D2D] dark:text-zinc-200 hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <Heart className={`w-4 h-4 ${trip.isWishlist ? 'text-rose-500 fill-rose-500' : 'text-rose-500'}`} />
                    {trip.isWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>

                  <div className="my-1 border-t border-[#E5E2D9] dark:border-zinc-800" />

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Trip
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Title & Metadata Over Image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold leading-tight drop-shadow-sm line-clamp-1 mb-1">
            {trip.destination}
          </h3>
          <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              {trip.days} Days
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-300" />
              {trip.itinerary?.estimatedTotalCost || trip.budget}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div>
          <p className="text-[#7D7A74] dark:text-zinc-400 text-xs leading-relaxed line-clamp-2">
            {trip.notes || trip.itinerary?.summary || `${trip.style} vacation for ${trip.groupSize} highlighting ${trip.interests}.`}
          </p>
        </div>

        {/* Details & Action Footer */}
        <div className="pt-4 border-t border-[#E5E2D9] dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#7D7A74] dark:text-zinc-500">
            <Clock className="w-3.5 h-3.5 text-[#A8A399]" />
            <span>Saved {formattedCreated}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(trip)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                trip.isWishlist
                  ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
                  : 'text-[#7D7A74] dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              }`}
              title={trip.isWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-4 h-4 ${trip.isWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={() => onEdit(trip)}
              className="p-2 rounded-xl text-[#7D7A74] dark:text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all"
              title="Edit trip"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/trip/${trip.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3b82f6]/10 text-[#3b82f6] dark:text-blue-400 hover:bg-[#3b82f6] hover:text-white dark:hover:bg-blue-600 text-xs font-bold transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#2D2D2D] dark:text-zinc-100">Delete Itinerary?</h4>
                <p className="text-xs text-[#7D7A74] dark:text-zinc-400 mt-1">
                  Are you sure you want to remove your trip to <strong className="text-[#2D2D2D] dark:text-zinc-200">{trip.destination}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 text-xs font-bold text-[#2D2D2D] dark:text-zinc-300 hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onDelete(trip);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-[14px] bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export & Share Modal */}
      <ExportShareModal
        isOpen={isExportModalOpen}
        trip={trip}
        onClose={() => setIsExportModalOpen(false)}
        onPrint={handleTriggerPrint}
      />

      {/* Printable Preview Overlay & Print Layout */}
      <AnimatePresence>
        {isPrintPreviewOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col items-center no-print">
            <div className="sticky top-0 z-20 w-full max-w-4xl bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 p-4 rounded-2xl shadow-xl mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D2D2D] dark:text-zinc-100">Printable Document Preview</h3>
                  <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Save as PDF or send directly to printer</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#3b82f6] text-white text-xs font-bold hover:bg-[#1d4ed8] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="p-2 text-[#7D7A74] hover:text-[#2D2D2D] dark:hover:text-zinc-100 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl border border-zinc-200">
              <PrintableItinerary trip={trip} />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Printable Container for Direct Print */}
      <div className="hidden print:block">
        <PrintableItinerary trip={trip} />
      </div>
    </motion.div>
  );
});

export default TripCard;
