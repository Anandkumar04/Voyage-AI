import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Trip } from './types';

interface AppState {
  savedTrips: Trip[];
  currentTrip: Trip | null;
  isChatOpen: boolean;
  setChatOpen: (isOpen: boolean) => void;
  toggleChat: () => void;
  addTrip: (trip: Trip) => void;
  setCurrentTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  updateTripItinerary: (id: string, itinerary: any) => void;
  updateTripDetails: (id: string, updatedFields: Partial<Trip>) => void;
  toggleWishlist: (id: string) => void;
  duplicateTrip: (id: string) => Trip | null;
  saveTrip: (trip: Trip) => void;
  importTrips: (trips: Trip[]) => void;
  user: { name: string; email: string } | null;
  setUser: (user: { name: string; email: string } | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      savedTrips: [],
      currentTrip: null,
      isChatOpen: false,
      setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      addTrip: (trip) => set((state) => ({ 
        savedTrips: [trip, ...state.savedTrips.filter(t => t.id !== trip.id)] 
      })),
      saveTrip: (trip) => set((state) => {
        const exists = state.savedTrips.some(t => t.id === trip.id);
        if (exists) {
          return {
            savedTrips: state.savedTrips.map(t => t.id === trip.id ? { ...t, ...trip, updatedAt: new Date().toISOString() } : t)
          };
        }
        return {
          savedTrips: [{ ...trip, createdAt: trip.createdAt || new Date().toISOString() }, ...state.savedTrips]
        };
      }),
      setCurrentTrip: (trip) => set({ currentTrip: trip }),
      deleteTrip: (id) => set((state) => ({
        savedTrips: state.savedTrips.filter(t => t.id !== id),
        currentTrip: state.currentTrip?.id === id ? null : state.currentTrip
      })),
      updateTripItinerary: (id, itinerary) => set((state) => ({
        savedTrips: state.savedTrips.map(t => t.id === id ? { ...t, itinerary, updatedAt: new Date().toISOString() } : t),
        currentTrip: state.currentTrip?.id === id ? { ...state.currentTrip, itinerary, updatedAt: new Date().toISOString() } : state.currentTrip
      })),
      updateTripDetails: (id, updatedFields) => set((state) => {
        const now = new Date().toISOString();
        const updatedTrips = state.savedTrips.map(t => 
          t.id === id ? { ...t, ...updatedFields, updatedAt: now } : t
        );
        const updatedCurrent = state.currentTrip?.id === id 
          ? { ...state.currentTrip, ...updatedFields, updatedAt: now } 
          : state.currentTrip;
        return { savedTrips: updatedTrips, currentTrip: updatedCurrent };
      }),
      toggleWishlist: (id) => set((state) => {
        const updatedTrips = state.savedTrips.map(t => 
          t.id === id ? { ...t, isWishlist: !t.isWishlist } : t
        );
        const updatedCurrent = state.currentTrip?.id === id 
          ? { ...state.currentTrip, isWishlist: !state.currentTrip.isWishlist } 
          : state.currentTrip;
        return { savedTrips: updatedTrips, currentTrip: updatedCurrent };
      }),
      duplicateTrip: (id) => {
        const state = get();
        const existingTrip = state.savedTrips.find(t => t.id === id);
        if (!existingTrip) return null;

        const newId = Math.random().toString(36).substring(2, 9);
        const duplicated: Trip = {
          ...JSON.parse(JSON.stringify(existingTrip)),
          id: newId,
          destination: `${existingTrip.destination} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set(s => ({ savedTrips: [duplicated, ...s.savedTrips] }));
        return duplicated;
      },
      importTrips: (trips) => set((state) => {
        // Merge imported trips avoiding ID collisions
        const existingIds = new Set(state.savedTrips.map(t => t.id));
        const newUniqueTrips = trips.filter(t => !existingIds.has(t.id));
        return { savedTrips: [...newUniqueTrips, ...state.savedTrips] };
      }),
      user: null,
      setUser: (user) => set({ user })
    }),
    {
      name: 'voyage-storage',
      partialize: (state) => ({ savedTrips: state.savedTrips, user: state.user }),
    }
  )
);
