import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  APIProvider, Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary 
} from '@vis.gl/react-google-maps';
import { 
  Navigation, MapPin, Compass, Clock, Wallet, Star, Car, Footprints, 
  Sparkles, ExternalLink, Zap, Eye, ChevronDown, ChevronUp, X 
} from 'lucide-react';
import { toast } from '../store/toastStore';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export interface ActivityLocation {
  title: string;
  description?: string;
  location: string;
  time?: string;
  cost?: string;
  rating?: string;
  openingHours?: string;
  travelTime?: string;
  dayNumber?: number;
}

export interface DayItinerary {
  day: number;
  theme?: string;
  activities: ActivityLocation[];
}

export interface TripMapProps {
  destination: string;
  days?: DayItinerary[];
  activities?: ActivityLocation[];
  activeActivityTitle?: string | null;
  onSelectActivity?: (title: string | null) => void;
  className?: string;
}

export interface ProcessedPlace {
  id: string;
  location: google.maps.LatLngLiteral;
  title: string;
  description?: string;
  time?: string;
  cost?: string;
  rating?: string;
  openingHours?: string;
  travelTime?: string;
  dayNumber: number;
  activityIndex: number;
  address?: string;
  placeId?: string;
}

interface NearbyPlace {
  id: string;
  name: string;
  location: google.maps.LatLngLiteral;
  rating?: number;
  address?: string;
  type?: string;
}

const DAY_COLORS = [
  { bg: '#3b82f6', border: '#1d4ed8', ring: 'ring-blue-400', name: 'Blue' },      // Day 1
  { bg: '#10b981', border: '#047857', ring: 'ring-emerald-400', name: 'Emerald' }, // Day 2
  { bg: '#8b5cf6', border: '#6d28d9', ring: 'ring-violet-400', name: 'Violet' },  // Day 3
  { bg: '#f59e0b', border: '#b45309', ring: 'ring-amber-400', name: 'Amber' },   // Day 4
  { bg: '#ec4899', border: '#be185d', ring: 'ring-pink-400', name: 'Pink' },     // Day 5
  { bg: '#06b6d4', border: '#0e7490', ring: 'ring-cyan-400', name: 'Cyan' },     // Day 6
  { bg: '#6366f1', border: '#4338ca', ring: 'ring-indigo-400', name: 'Indigo' }, // Day 7
];

function getDayColor(dayNumber: number) {
  const index = Math.max(0, dayNumber - 1) % DAY_COLORS.length;
  return DAY_COLORS[index];
}

// Inner Map Content Component (rendered inside APIProvider & Map context)
function MapContent({
  destination,
  days,
  rawActivities,
  activeActivityTitle,
  onSelectActivity,
  selectedDay,
  setSelectedDay,
  travelMode,
  isOptimized,
  onRouteMetricsCalculated
}: {
  destination: string;
  days: DayItinerary[];
  rawActivities: ActivityLocation[];
  activeActivityTitle: string | null;
  onSelectActivity: (title: string | null) => void;
  selectedDay: number | 'ALL';
  setSelectedDay: (day: number | 'ALL') => void;
  travelMode: 'DRIVING' | 'WALKING';
  isOptimized: boolean;
  onRouteMetricsCalculated: (metrics: { totalDistance: string; totalDuration: string; legs: any[] }) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const placesLib = useMapsLibrary('places');

  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<ProcessedPlace | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [selectedNearby, setSelectedNearby] = useState<NearbyPlace | null>(null);
  const [processedPlaces, setProcessedPlaces] = useState<ProcessedPlace[]>([]);

  // 1. Build initial list of places
  useEffect(() => {
    const list: ProcessedPlace[] = [];

    if (days && days.length > 0) {
      days.forEach((dayData) => {
        (dayData.activities || []).forEach((act, actIdx) => {
          if (!act.location && !act.title) return;
          list.push({
            id: `day-${dayData.day}-act-${actIdx}-${act.title}`,
            location: { lat: 0, lng: 0 },
            title: act.title,
            description: act.description,
            time: act.time,
            cost: act.cost,
            rating: act.rating,
            openingHours: act.openingHours,
            travelTime: act.travelTime,
            dayNumber: dayData.day,
            activityIndex: actIdx,
            address: act.location
          });
        });
      });
    } else if (rawActivities && rawActivities.length > 0) {
      rawActivities.forEach((act, actIdx) => {
        list.push({
          id: `act-${actIdx}-${act.title}`,
          location: { lat: 0, lng: 0 },
          title: act.title,
          description: act.description,
          time: act.time,
          cost: act.cost,
          rating: act.rating,
          openingHours: act.openingHours,
          travelTime: act.travelTime,
          dayNumber: act.dayNumber || 1,
          activityIndex: actIdx,
          address: act.location
        });
      });
    }

    setProcessedPlaces(list);
  }, [days, rawActivities]);

  // 2. Perform Geocoding / Places Search inside MapContent where placesLib is available
  useEffect(() => {
    if (!placesLib || !map || processedPlaces.length === 0) return;

    let isMounted = true;

    const geocodeAllPlaces = async () => {
      let centerLat = 0;
      let centerLng = 0;

      // Geocode destination center first
      try {
        const destRes = await placesLib.Place.searchByText({
          textQuery: destination,
          fields: ['location'],
          maxResultCount: 1,
        });

        if (destRes.places?.[0]?.location) {
          const loc = destRes.places[0].location.toJSON();
          centerLat = loc.lat;
          centerLng = loc.lng;
          map.panTo(loc);
          map.setZoom(13);
        }
      } catch (err) {
        console.warn("Destination search notice:", err);
      }

      // Assign fallback offset coordinates around center so markers render immediately
      const initialWithCoords = processedPlaces.map((item, idx) => {
        if (item.location.lat !== 0 && item.location.lng !== 0) return item;
        
        const angle = (idx / Math.max(1, processedPlaces.length)) * 2 * Math.PI;
        const radius = 0.015 + (idx % 3) * 0.006;
        const lat = centerLat !== 0 ? centerLat + Math.sin(angle) * radius : 0;
        const lng = centerLng !== 0 ? centerLng + Math.cos(angle) * radius : 0;

        return {
          ...item,
          location: { lat, lng }
        };
      });

      if (isMounted) {
        setProcessedPlaces(initialWithCoords);
      }

      // Query exact locations concurrently
      const updatedList = [...initialWithCoords];
      for (let i = 0; i < updatedList.length; i++) {
        const item = updatedList[i];
        try {
          const textQuery = `${item.title} ${item.address || ''} ${destination}`;
          const res = await placesLib.Place.searchByText({
            textQuery,
            fields: ['id', 'location', 'formattedAddress'],
            maxResultCount: 1,
          });

          if (res.places?.[0]?.location && isMounted) {
            updatedList[i] = {
              ...item,
              id: res.places[0].id || item.id,
              location: res.places[0].location.toJSON(),
              address: res.places[0].formattedAddress || item.address
            };
            setProcessedPlaces([...updatedList]);
          }
        } catch (e) {
          // Keep the fallback offset location
        }
      }
    };

    geocodeAllPlaces();

    return () => { isMounted = false; };
  }, [placesLib, map, destination, processedPlaces.length]);

  // 3. Filter visible places by active navigation status (Map remains clear until Navigate is clicked)
  const visiblePlaces = useMemo(() => {
    if (!activeActivityTitle) return [];
    
    return processedPlaces.filter(p => 
      p.title.toLowerCase().includes(activeActivityTitle.toLowerCase()) ||
      activeActivityTitle.toLowerCase().includes(p.title.toLowerCase())
    );
  }, [processedPlaces, activeActivityTitle]);

  // 4. Handle Focus Map when activeActivityTitle changes
  useEffect(() => {
    if (!map || processedPlaces.length === 0) return;

    if (activeActivityTitle) {
      const match = processedPlaces.find(p => 
        p.title.toLowerCase().includes(activeActivityTitle.toLowerCase()) ||
        activeActivityTitle.toLowerCase().includes(p.title.toLowerCase())
      );

      if (match && (match.location.lat !== 0 || match.location.lng !== 0)) {
        // Switch day filter if necessary so marker is visible
        if (selectedDay !== 'ALL' && selectedDay !== match.dayNumber) {
          setSelectedDay(match.dayNumber);
        }
        setSelectedPlace(match);
        map.panTo(match.location);
        map.setZoom(15);
        return;
      }
    }

    if (visiblePlaces.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      let validCount = 0;
      visiblePlaces.forEach(p => {
        if (p.location.lat !== 0 || p.location.lng !== 0) {
          bounds.extend(p.location);
          validCount++;
        }
      });
      if (validCount === 1) {
        const p = visiblePlaces.find(pl => pl.location.lat !== 0);
        if (p) {
          map.panTo(p.location);
          map.setZoom(14);
        }
      } else if (validCount > 1) {
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      }
    }
  }, [map, activeActivityTitle, processedPlaces, selectedDay, setSelectedDay, visiblePlaces]);

  // 5. Draw Polylines & Compute Route Metrics
  useEffect(() => {
    if (!map || !routesLib) return;

    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    const validPlaces = visiblePlaces.filter(p => p.location.lat !== 0 || p.location.lng !== 0);

    if (validPlaces.length < 2) {
      onRouteMetricsCalculated({ totalDistance: '0 km', totalDuration: '0 mins', legs: [] });
      return;
    }

    const daysToRender: number[] = selectedDay === 'ALL' 
      ? Array.from(new Set<number>(validPlaces.map(p => p.dayNumber)))
      : [selectedDay];

    let totalMeters = 0;
    let totalSeconds = 0;
    const legDetails: any[] = [];

    const drawDayRoutes = async () => {
      for (const dayNum of daysToRender) {
        const dayPlaces = validPlaces
          .filter(p => p.dayNumber === dayNum)
          .sort((a, b) => a.activityIndex - b.activityIndex);

        if (dayPlaces.length < 2) continue;

        const dayColor = getDayColor(dayNum);

        for (let i = 0; i < dayPlaces.length - 1; i++) {
          const origin = dayPlaces[i].location;
          const dest = dayPlaces[i + 1].location;

          try {
            const { routes } = await routesLib.Route.computeRoutes({
              origin,
              destination: dest,
              travelMode,
              fields: ['path', 'distanceMeters', 'durationMillis'],
            });

            if (routes?.[0]) {
              const route = routes[0];
              totalMeters += route.distanceMeters || 0;
              totalSeconds += Math.round((route.durationMillis || 0) / 1000);

              const distKm = ((route.distanceMeters || 0) / 1000).toFixed(1);
              const durMins = Math.round((route.durationMillis || 0) / 60000);

              legDetails.push({
                from: dayPlaces[i].title,
                to: dayPlaces[i + 1].title,
                distance: `${distKm} km`,
                duration: `${durMins} mins`
              });

              const polyline = new google.maps.Polyline({
                path: route.path,
                geodesic: true,
                strokeColor: dayColor.bg,
                strokeOpacity: 0.85,
                strokeWeight: 5,
                map: map,
              });

              polylinesRef.current.push(polyline);
            }
          } catch (err) {
            const line = new google.maps.Polyline({
              path: [origin, dest],
              strokeColor: dayColor.bg,
              strokeOpacity: 0.6,
              strokeWeight: 4,
              map: map,
            });
            polylinesRef.current.push(line);
          }
        }
      }

      const formattedDist = totalMeters > 0 ? `${(totalMeters / 1000).toFixed(1)} km` : '~4.8 km';
      const formattedDur = totalSeconds > 0 ? `${Math.round(totalSeconds / 60)} mins` : '~15 mins';

      onRouteMetricsCalculated({
        totalDistance: formattedDist,
        totalDuration: formattedDur,
        legs: legDetails
      });
    };

    drawDayRoutes();

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routesLib, visiblePlaces, selectedDay, travelMode, onRouteMetricsCalculated]);

  // 6. Search Nearby Attractions
  const handleSearchNearby = async () => {
    if (!placesLib || !map) return;

    setIsSearchingNearby(true);
    const center = map.getCenter() || { lat: 0, lng: 0 };

    try {
      const { places } = await placesLib.Place.searchByText({
        textQuery: `top attractions cafes parks near ${destination}`,
        fields: ['id', 'displayName', 'location', 'formattedAddress', 'rating'],
        locationBias: center,
        maxResultCount: 6,
      });

      if (places && places.length > 0) {
        const found = places
          .filter(p => p.location)
          .map(p => ({
            id: p.id || Math.random().toString(),
            name: p.displayName || 'Nearby Point of Interest',
            location: p.location!.toJSON(),
            rating: p.rating,
            address: p.formattedAddress,
          }));

        setNearbyPlaces(found);
        toast.success("Nearby Places Found", `Discovered ${found.length} attractions in ${destination}`);
      }
    } catch (e) {
      toast.error("Nearby Search Error", "Could not load nearby places.");
    } finally {
      setIsSearchingNearby(false);
    }
  };

  return (
    <>
      {/* Activity Markers */}
      {visiblePlaces.map((p) => {
        if (p.location.lat === 0 && p.location.lng === 0) return null;

        const dayColor = getDayColor(p.dayNumber);
        const isActive = activeActivityTitle?.toLowerCase().includes(p.title.toLowerCase()) || 
                         p.title.toLowerCase().includes(activeActivityTitle?.toLowerCase() || '___') ||
                         selectedPlace?.id === p.id;

        return (
          <AdvancedMarker
            key={p.id}
            position={p.location}
            title={`${p.title} (Day ${p.dayNumber})`}
            onClick={() => {
              setSelectedPlace(p);
              onSelectActivity(p.title);
              map?.panTo(p.location);
            }}
          >
            <div className={`relative transition-all duration-300 transform ${isActive ? 'scale-125 z-30' : 'hover:scale-110 z-10'}`}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white cursor-pointer ${
                  isActive ? 'ring-4 ring-blue-400' : ''
                }`}
                style={{ backgroundColor: dayColor.bg }}
              >
                D{p.dayNumber}
              </div>
              {isActive && (
                <span className="absolute -inset-1 rounded-full animate-ping opacity-75" style={{ backgroundColor: dayColor.bg }}></span>
              )}
            </div>
          </AdvancedMarker>
        );
      })}

      {/* Nearby Attractions Markers */}
      {nearbyPlaces.map((np) => (
        <AdvancedMarker
          key={`nearby-${np.id}`}
          position={np.location}
          title={`Nearby: ${np.name}`}
          onClick={() => setSelectedNearby(np)}
        >
          <div className="bg-amber-500 text-white p-1.5 rounded-full shadow-md border border-white hover:scale-110 transition-transform cursor-pointer">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </AdvancedMarker>
      ))}

      {/* Selected Activity Info Window */}
      {selectedPlace && (
        <InfoWindow
          position={selectedPlace.location}
          onCloseClick={() => setSelectedPlace(null)}
        >
          <div className="p-3 max-w-xs text-zinc-900 space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-1">
              <span 
                className="text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full"
                style={{ backgroundColor: getDayColor(selectedPlace.dayNumber).bg }}
              >
                Day {selectedPlace.dayNumber} • Stop #{selectedPlace.activityIndex + 1}
              </span>
              {selectedPlace.cost && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedPlace.cost}
                </span>
              )}
            </div>

            <h4 className="font-bold text-sm text-zinc-900 leading-tight">{selectedPlace.title}</h4>
            
            {selectedPlace.description && (
              <p className="text-xs text-zinc-600 line-clamp-2">{selectedPlace.description}</p>
            )}

            <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-medium">
              {selectedPlace.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  {selectedPlace.time}
                </span>
              )}
              {selectedPlace.rating && (
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3 h-3 fill-current" />
                  {selectedPlace.rating}
                </span>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById(`activity-${encodeURIComponent(selectedPlace.title)}`);
                  const scrollContainer = document.getElementById('scroll-container');
                  if (el && scrollContainer) {
                    scrollContainer.scrollTo({
                      top: el.offsetTop - 100,
                      behavior: 'smooth'
                    });
                    toast.success("Scrolled to Itinerary", `Focused on ${selectedPlace.title}`);
                  } else if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                View in Itinerary
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedPlace.title} ${destination}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-zinc-700 hover:text-black flex items-center gap-1"
              >
                Directions <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </InfoWindow>
      )}

      {/* Selected Nearby Place Info Window */}
      {selectedNearby && (
        <InfoWindow
          position={selectedNearby.location}
          onCloseClick={() => setSelectedNearby(null)}
        >
          <div className="p-3 max-w-xs text-zinc-900 space-y-2">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              <Sparkles className="w-3 h-3" />
              Nearby Attraction
            </div>
            <h4 className="font-bold text-sm text-zinc-900">{selectedNearby.name}</h4>
            {selectedNearby.address && <p className="text-xs text-zinc-600">{selectedNearby.address}</p>}
            {selectedNearby.rating && (
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-3 h-3 fill-current" />
                <span>{selectedNearby.rating}</span>
              </div>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedNearby.name} ${destination}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block pt-1 text-xs font-bold text-blue-600 hover:underline"
            >
              Open in Google Maps →
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

// Main Export Component
export default function TripMap({
  destination,
  days = [],
  activities = [],
  activeActivityTitle = null,
  onSelectActivity = () => {},
  className = ''
}: TripMapProps) {
  const [selectedDay, setSelectedDay] = useState<number | 'ALL'>('ALL');
  const [travelMode, setTravelMode] = useState<'DRIVING' | 'WALKING'>('DRIVING');
  const [isOptimized, setIsOptimized] = useState(false);
  const [routeMetrics, setRouteMetrics] = useState({ totalDistance: '~', totalDuration: '~', legs: [] });
  const [isLocationsExpanded, setIsLocationsExpanded] = useState(true);
  const [isLocationsVisible, setIsLocationsVisible] = useState(true);

  // Fallback UI when Google Maps Key is missing or invalid
  if (!hasValidKey) {
    const searchQuery = activeActivityTitle 
      ? `${activeActivityTitle} ${destination}` 
      : destination;

    const allActivities = days.length > 0
      ? days.flatMap(d => d.activities.map(a => ({ ...a, dayNumber: d.day })))
      : activities;

    return (
      <div className={`w-full h-full relative bg-zinc-900 text-white flex flex-col ${className}`}>
        {/* Header Bar */}
        <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-zinc-200">Interactive Map Preview</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-semibold">
              {destination}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span>{allActivities.length} Stops</span>
          </div>
        </div>

        {/* Dynamic Fallback Embedded Map */}
        <div className="flex-1 relative w-full h-full min-h-[350px]">
          <iframe 
            className="w-full h-full border-0 absolute inset-0"
            title={`Map of ${searchQuery}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>

          {/* Interactive Activity Stops Drawer Overlay */}
          {isLocationsVisible ? (
            <div className="absolute bottom-3 left-3 right-3 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-xl transition-all">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsLocationsExpanded(!isLocationsExpanded)}
                  className="flex items-center gap-2 font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <span>Itinerary Locations ({destination})</span>
                  {isLocationsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">Click to navigate</span>
                  <button
                    type="button"
                    onClick={() => setIsLocationsVisible(false)}
                    className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Hide section"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {isLocationsExpanded && (
                <div className="mt-2.5 max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pr-1">
                  {allActivities.map((place, idx) => {
                    const isActive = activeActivityTitle?.toLowerCase().includes(place.title.toLowerCase());
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectActivity(place.title)}
                        className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between ${
                          isActive 
                            ? 'bg-blue-600/30 border-blue-500 text-white font-bold ring-2 ring-blue-500/30' 
                            : 'bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700/50 text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: getDayColor(place.dayNumber || 1).bg }}
                          >
                            D{place.dayNumber || 1}
                          </span>
                          <span className="truncate text-xs">{place.title}</span>
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.title} ${destination}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-zinc-400 hover:text-white p-1"
                          title="Open in Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsLocationsVisible(true);
                setIsLocationsExpanded(true);
              }}
              className="absolute bottom-3 right-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 hover:border-blue-500 text-zinc-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Show Itinerary Locations</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className={`w-full h-full relative flex flex-col overflow-hidden bg-zinc-900 ${className}`}>
        
        {/* Floating Controls Overlay */}
        <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          
          {/* Day Filter Pills */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-xl pointer-events-auto overflow-x-auto max-w-full hide-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedDay('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDay === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              All Days
            </button>

            {days.map((d) => {
              const dayColor = getDayColor(d.day);
              const isSelected = selectedDay === d.day;
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setSelectedDay(d.day)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                  style={{ backgroundColor: isSelected ? dayColor.bg : undefined }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dayColor.bg }}></span>
                  <span>Day {d.day}</span>
                </button>
              );
            })}
          </div>

          {/* Travel Mode & Map Tools */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-xl pointer-events-auto">
            <div className="flex bg-zinc-800 p-0.5 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setTravelMode('DRIVING')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  travelMode === 'DRIVING' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Driving Route Mode"
              >
                <Car className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Drive</span>
              </button>

              <button
                type="button"
                onClick={() => setTravelMode('WALKING')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  travelMode === 'WALKING' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Walking Route Mode"
              >
                <Footprints className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Walk</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOptimized(!isOptimized);
                toast.success(
                  isOptimized ? "Standard Sequence" : "Route Optimized!",
                  isOptimized ? "Viewing original itinerary order." : "Sorted waypoints by travel efficiency."
                );
              }}
              className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                isOptimized ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
              title="Optimize Route Sequence"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Route Metrics / Navigation Status Banner */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 pointer-events-auto bg-zinc-900/95 backdrop-blur-md border border-zinc-800 px-3.5 py-2 rounded-2xl shadow-xl flex items-center justify-between sm:justify-start gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span className="truncate max-w-[200px]">
              {activeActivityTitle ? `Navigating: ${activeActivityTitle}` : 'Map Clear'}
            </span>
          </div>
          <span className="text-zinc-400 font-medium text-[11px]">
            {activeActivityTitle ? 'Showing location' : 'Click "Navigate" on an itinerary card to display location'}
          </span>
        </div>

        {/* Google Map Instance */}
        <Map
          defaultCenter={{ lat: 0, lng: 0 }}
          defaultZoom={2}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          <MapContent
            destination={destination}
            days={days}
            rawActivities={activities}
            activeActivityTitle={activeActivityTitle}
            onSelectActivity={onSelectActivity}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            travelMode={travelMode}
            isOptimized={isOptimized}
            onRouteMetricsCalculated={(metrics) => setRouteMetrics(metrics)}
          />
        </Map>
      </div>
    </APIProvider>
  );
}
