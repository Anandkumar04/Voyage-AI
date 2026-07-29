import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  destination: { type: String, required: true },
  budget: String,
  days: String,
  dates: String,
  groupSize: String,
  style: String,
  notes: String,
  isWishlist: { type: Boolean, default: false },
  itinerary: Object,
  createdAt: { type: Date, default: Date.now }
});

export const TripModel = mongoose.model('Trip', tripSchema);