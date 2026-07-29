import React from 'react';
import { 
  Compass, MapPin, Calendar, Wallet, Sun, Hotel, 
  Clock, CheckSquare, PieChart, Star, Luggage, Navigation
} from 'lucide-react';
import { Trip } from '../../types';

interface PrintableItineraryProps {
  trip: Trip;
}

export const PrintableItinerary: React.FC<PrintableItineraryProps> = ({ trip }) => {
  const itinerary = trip.itinerary;

  // Unsplash image query for destination
  const encodedDest = encodeURIComponent(trip.destination);
  const destinationImageUrl = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80`;

  return (
    <div id="printable-itinerary" className="bg-white text-zinc-900 p-8 max-w-4xl mx-auto space-y-8 print:p-0 print:max-w-none print:shadow-none">
      
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200 shadow-sm print:rounded-none">
        <div className="h-48 sm:h-64 w-full relative bg-zinc-800">
          <img 
            src={`https://source.unsplash.com/featured/?${encodedDest},travel`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = destinationImageUrl;
            }}
            alt={trip.destination}
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-6 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>VOYAGE AI ITINERARY</span>
              </div>
              <span className="text-xs text-white/80 font-mono">ID: {trip.id.substring(0, 8)}</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{trip.destination}</h1>
              <p className="text-sm text-white/90 mt-1 max-w-2xl">{itinerary?.summary}</p>
            </div>
          </div>
        </div>

        {/* Key Trip Meta Strip */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Duration</span>
              <span className="font-bold text-zinc-900">{trip.days} Days ({trip.dates || 'Upcoming'})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Budget Tier</span>
              <span className="font-bold text-zinc-900">{trip.budget} ({itinerary?.estimatedTotalCost || 'Est.'})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Weather Forecast</span>
              <span className="font-bold text-zinc-900">{itinerary?.weather || 'Pleasant'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Luggage className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold">Style & Group</span>
              <span className="font-bold text-zinc-900">{trip.style} • {trip.groupSize}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accommodations Table */}
      {itinerary?.hotels && itinerary.hotels.length > 0 && (
        <div className="space-y-3 page-break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
            <Hotel className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-zinc-900">Recommended Accommodations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {itinerary.hotels.map((h, idx) => (
              <div key={idx} className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-zinc-900">{h.name}</h3>
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    {h.pricePerNight}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 line-clamp-2">{h.description}</p>
                {h.amenities && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {h.amenities.map((am, aIdx) => (
                      <span key={aIdx} className="text-[10px] font-medium bg-zinc-200/70 text-zinc-700 px-2 py-0.5 rounded">
                        {am}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Breakdown Summary Table */}
      <div className="space-y-3 page-break-inside-avoid">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
          <PieChart className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-zinc-900">Budget & Cost Breakdown</h2>
        </div>

        <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 font-bold text-zinc-700">
                <th className="p-3">Expense Category</th>
                <th className="p-3">Share (%)</th>
                <th className="p-3">Coverage Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="p-3 font-semibold text-zinc-900">Accommodation</td>
                <td className="p-3 font-bold text-indigo-600">35%</td>
                <td className="p-3 text-zinc-600">Resorts, boutique stays, hotels</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-900">Activities & Experiences</td>
                <td className="p-3 font-bold text-blue-600">30%</td>
                <td className="p-3 text-zinc-600">Guided tours, tickets, watersports</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-900">Food & Local Dining</td>
                <td className="p-3 font-bold text-emerald-600">20%</td>
                <td className="p-3 text-zinc-600">Cafes, street food, fine dining</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-zinc-900">Transport & Local Transit</td>
                <td className="p-3 font-bold text-orange-600">15%</td>
                <td className="p-3 text-zinc-600">Taxis, shuttles, bicycle rentals</td>
              </tr>
              <tr className="bg-zinc-50 font-bold">
                <td className="p-3 text-zinc-900">Estimated Total Cost</td>
                <td className="p-3 text-emerald-700 font-extrabold text-sm">{itinerary?.estimatedTotalCost || trip.budget}</td>
                <td className="p-3 text-zinc-500">Subject to seasonality and preferences</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Day-by-Day Detailed Itinerary Schedule */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-zinc-900">Day-by-Day Schedule</h2>
        </div>

        {(itinerary?.days || []).map((day) => (
          <div key={day.day} className="border border-zinc-200 rounded-xl p-5 space-y-4 page-break-inside-avoid bg-zinc-50/30">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
              <h3 className="font-bold text-base text-zinc-900">
                Day {day.day}: <span className="text-blue-600">{day.theme}</span>
              </h3>
              {day.totalDailyCost && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                  Daily Est: {day.totalDailyCost}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {(day.activities || []).map((act, aIdx) => (
                <div key={aIdx} className="bg-white border border-zinc-200 rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-zinc-900 text-sm">
                      <span className="text-blue-600 mr-2">[{act.time || 'Activity'}]</span>
                      {act.title}
                    </span>
                    {act.cost && (
                      <span className="font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                        {act.cost}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-600 leading-relaxed">{act.description}</p>
                  <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-zinc-500 font-medium">
                    {act.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {act.location}
                      </span>
                    )}
                    {act.openingHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {act.openingHours}
                      </span>
                    )}
                    {act.travelTime && (
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-blue-500" />
                        {act.travelTime}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Packing Checklist */}
      {itinerary?.packingAdvice && itinerary.packingAdvice.length > 0 && (
        <div className="space-y-3 page-break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
            <CheckSquare className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-zinc-900">Essential Packing Checklist</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {itinerary.packingAdvice.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 border border-zinc-200 rounded-lg bg-zinc-50">
                <div className="w-4 h-4 border-2 border-zinc-400 rounded flex-shrink-0"></div>
                <span className="font-medium text-zinc-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Footer */}
      <div className="pt-6 border-t border-zinc-200 text-center text-xs text-zinc-500 flex justify-between items-center print:pt-4">
        <span>Generated by Voyage AI Travel Assistant</span>
        <span>www.voyage.ai • Happy Travels!</span>
      </div>

    </div>
  );
};

export default PrintableItinerary;
