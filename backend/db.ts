import mongoose, { Document, Model } from 'mongoose';

export interface ITrip extends Document {
  id: string;
  destination: string;
  budget?: string;
  days?: string;
  dates?: string;
  groupSize?: string;
  style?: string;
  interests?: string;
  thumbnailUrl?: string;
  notes?: string;
  isWishlist?: boolean;
  itinerary?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser extends Document {
  email: string;
  name?: string;
  createdAt?: Date;
}

// Trip Schema
const TripSchema = new mongoose.Schema<ITrip>({
  id: { type: String, required: true, unique: true, index: true },
  destination: { type: String, required: true },
  budget: String,
  days: String,
  dates: String,
  groupSize: String,
  style: String,
  interests: String,
  thumbnailUrl: String,
  notes: String,
  isWishlist: { type: Boolean, default: false },
  itinerary: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Schema
const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: String,
  createdAt: { type: Date, default: Date.now }
});

export const TripModel: Model<ITrip> = (mongoose.models.Trip as Model<ITrip>) || mongoose.model<ITrip>('Trip', TripSchema);
export const UserModel: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

let isConnected = false;

export async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    console.info('[MongoDB] MONGODB_URI is not configured in environment variables.');
    return { connected: false, configured: false, message: 'MONGODB_URI not configured' };
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return { connected: true, configured: true, message: 'Connected to MongoDB' };
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[MongoDB] Successfully connected to MongoDB cluster.');
    return { connected: true, configured: true, message: 'Connected to MongoDB' };
  } catch (err: any) {
    console.warn('[MongoDB] Connection attempt warning:', err.message);
    isConnected = false;
    return { connected: false, configured: true, message: err.message };
  }
}

export function getDBStatus() {
  const uri = process.env.MONGODB_URI;
  const configured = Boolean(uri && uri.trim().length > 0);
  const connected = mongoose.connection.readyState === 1;
  return { configured, connected };
}
