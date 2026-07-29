import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Save, MapPin, Calendar, Wallet, Compass, 
  Users, FileText, Sparkles
} from 'lucide-react';
import { Trip } from '../../types';
import Button from '../ui/Button';

interface TripEditModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onSave: (id: string, updatedFields: Partial<Trip>) => void;
}

export const TripEditModal: React.FC<TripEditModalProps> = ({
  isOpen,
  trip,
  onClose,
  onSave
}) => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('5');
  const [budget, setBudget] = useState('Moderate');
  const [style, setStyle] = useState('Balanced');
  const [groupSize, setGroupSize] = useState('Couple');
  const [dates, setDates] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (trip) {
      setDestination(trip.destination || '');
      setDays(trip.days || '5');
      setBudget(trip.budget || 'Moderate');
      setStyle(trip.style || 'Balanced');
      setGroupSize(trip.groupSize || 'Couple');
      setDates(trip.dates || '');
      setNotes(trip.notes || trip.itinerary?.summary || '');
    }
  }, [trip]);

  if (!isOpen || !trip) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    onSave(trip.id, {
      destination: destination.trim(),
      days,
      budget,
      style,
      groupSize,
      dates,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-zinc-900 rounded-[28px] border border-[#E5E2D9] dark:border-zinc-800 shadow-2xl max-w-lg w-full overflow-hidden my-8"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E5E2D9] dark:border-zinc-800 flex items-center justify-between bg-[#FAF9F6] dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#3b82f6]/10 text-[#3b82f6] dark:text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2D2D2D] dark:text-zinc-100">Edit Saved Trip</h3>
                <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Update destination details and preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#7D7A74] hover:text-[#2D2D2D] dark:hover:text-zinc-100 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Destination */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7D7A74] dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#3b82f6]" />
                Destination Name
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                placeholder="e.g. Kyoto, Japan"
              />
            </div>

            {/* Grid for Days & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7D7A74] dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#3b82f6]" />
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7D7A74] dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#3b82f6]" />
                  Travel Dates (Optional)
                </label>
                <input
                  type="text"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  placeholder="e.g. Nov 10 - Nov 17"
                  className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                />
              </div>
            </div>

            {/* Grid for Budget & Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7D7A74] dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#10b981]" />
                  Budget Level
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                >
                  <option value="Budget">Budget Friendly</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Ultra Luxury">Ultra Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7D7A74] dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  Travel Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                >
                  <option value="Relaxed">Relaxed</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Action-packed">Action-packed</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Romantic">Romantic</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>
            </div>

            {/* Group Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7D7A74] dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#3b82f6]" />
                Group Type
              </label>
              <select
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
                className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              >
                <option value="Solo Traveler">Solo Traveler</option>
                <option value="Couple">Couple</option>
                <option value="Family">Family</option>
                <option value="Group of Friends">Group of Friends</option>
              </select>
            </div>

            {/* Personal Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7D7A74] dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#3b82f6]" />
                Personal Notes & Highlights
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add custom travel reminders, favorite spots, or notes..."
                className="w-full px-4 py-3 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-[#2D2D2D] dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E5E2D9] dark:border-zinc-800 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TripEditModal;
