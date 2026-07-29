export type Trip = {
  id: string;
  destination: string;
  dates: string;
  days: string;
  budget: string;
  style: string;
  groupSize: string;
  interests: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  thumbnailUrl?: string;
  notes?: string;
  isWishlist?: boolean;
  itinerary: ItineraryData | null;
};

export type Hotel = {
  id?: string;
  name: string;
  description: string;
  pricePerNight: string;
  numericPrice?: number;
  rating?: number | string;
  reviewsCount?: number;
  badge?: string;
  distanceFromCenter?: string;
  amenities?: string[];
  imageUrl?: string;
  images?: string[];
  bookingUrl?: string;
  roomTypes?: { title: string; price: string; features: string[] }[];
  locationAddress?: string;
};

export type ItineraryData = {
  summary: string;
  estimatedTotalCost: string;
  weather: string;
  packingAdvice: string[];
  days: {
    day: number;
    theme: string;
    totalDailyCost: string;
    activities: {
      time: string;
      title: string;
      description: string;
      cost: string;
      location: string;
      rating: string;
      openingHours: string;
      travelTime: string;
      imageUrl?: string;
    }[];
  }[];
  hotels: Hotel[];
};
