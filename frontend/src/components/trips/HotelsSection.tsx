import React from 'react';
import { Hotel as HotelIcon, Star, MapPin, ExternalLink, Award } from 'lucide-react';
import { Hotel } from '../../types';

interface HotelsSectionProps {
  hotels: Hotel[];
  destination: string;
}

export default function HotelsSection({ hotels = [], destination }: HotelsSectionProps) {
  // Select 3 to 5 curated hotels representing Luxury, Mid-range, and Budget
  const curatedHotels = (hotels.length > 0 ? hotels : [
    {
      name: `Grand Palace Hotel ${destination}`,
      description: '5-star luxury stay with panoramic ocean views, infinity pool, and world-class dining.',
      pricePerNight: '$320',
      rating: '4.9',
      distanceFromCenter: '0.4 km from city center',
      badge: 'Luxury',
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent('luxury resort hotel ' + destination)}?width=600&height=400&nologo=true`
    },
    {
      name: `Boutique Heritage Suites`,
      description: 'Charming boutique hotel with modern amenities, central location, and breakfast included.',
      pricePerNight: '$165',
      rating: '4.7',
      distanceFromCenter: '0.8 km from city center',
      badge: 'Mid-Range',
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent('boutique hotel room ' + destination)}?width=600&height=400&nologo=true`
    },
    {
      name: `Traveler Urban Lodge`,
      description: 'Clean, stylish, budget-friendly accommodation close to transit hubs and top attractions.',
      pricePerNight: '$85',
      rating: '4.5',
      distanceFromCenter: '1.2 km from city center',
      badge: 'Budget Choice',
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent('modern lodge hotel ' + destination)}?width=600&height=400&nologo=true`
    }
  ]).slice(0, 5);

  return (
    <div id="hotels" className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
          <HotelIcon className="w-3.5 h-3.5" />
          <span>Curated Stays</span>
        </div>
        <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100">Where to Stay in {destination}</h2>
        <p className="text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-400 mt-1">
          Handpicked top-rated accommodations across Luxury, Mid-Range, and Budget categories.
        </p>
      </div>

      {/* 3-Card Curated Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {curatedHotels.map((hotel, idx) => {
          const bookingUrl = hotel.bookingUrl || `https://www.google.com/travel/hotels?q=${encodeURIComponent(hotel.name + ' ' + destination)}`;
          const rating = hotel.rating || '4.8';
          const badge = hotel.badge || (idx === 0 ? 'Luxury' : idx === 1 ? 'Mid-Range' : 'Budget');

          return (
            <div 
              key={idx}
              className="bg-[#FAF9F6] dark:bg-zinc-950 rounded-[20px] border border-[#E5E2D9] dark:border-zinc-800 overflow-hidden flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-sm group"
            >
              <div>
                {/* Image & Badge */}
                <div className="relative h-44 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={hotel.imageUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent(hotel.name + ' ' + destination)}?width=600&height=400&nologo=true`}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.onerror = null;
                      img.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#2D2D2D] dark:text-zinc-100 shadow-sm flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-500" />
                    <span>{badge}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-[#2D2D2D] dark:text-zinc-100 leading-snug">{hotel.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{rating}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#7D7A74] dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#7D7A74] dark:text-zinc-400 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{hotel.distanceFromCenter || 'Centrally located'}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-[#E5E2D9] dark:border-zinc-800/80 mt-2">
                <div>
                  <span className="text-lg font-extrabold text-[#2D2D2D] dark:text-zinc-100">{hotel.pricePerNight}</span>
                  <span className="text-[10px] text-[#7D7A74] dark:text-zinc-400 font-normal"> / night</span>
                </div>

                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Book</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
