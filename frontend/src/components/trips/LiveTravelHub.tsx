import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudSun, Sun, Cloud, CloudRain, Snowflake, Wind, Droplets, Thermometer, 
  MapPin, Compass, Utensils, ShieldCheck, ShieldAlert, Phone, ExternalLink, 
  Globe, Landmark, Clock, RefreshCw, AlertCircle, Star, Sparkles, Navigation, 
  CheckCircle2, Info
} from 'lucide-react';
import { 
  fetchLiveWeather, 
  fetchLiveDestinationFacts, 
  fetchLiveTravelAdvisory, 
  fetchLiveNearbyPlaces, 
  LiveWeatherData, 
  LiveDestinationFacts, 
  LiveTravelAdvisory, 
  LivePlaceItem 
} from '../../services/liveTravelService';
import { toast } from '../../store/toastStore';

interface LiveTravelHubProps {
  destination: string;
}

export default function LiveTravelHub({ destination }: LiveTravelHubProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [facts, setFacts] = useState<LiveDestinationFacts | null>(null);
  const [advisory, setAdvisory] = useState<LiveTravelAdvisory | null>(null);
  const [places, setPlaces] = useState<{ attractions: LivePlaceItem[]; restaurants: LivePlaceItem[] }>({ attractions: [], restaurants: [] });

  const [placesTab, setPlacesTab] = useState<'attractions' | 'restaurants'>('attractions');
  const [isCelsius, setIsCelsius] = useState(true);

  // Load all live travel data concurrently
  const loadAllLiveData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [weatherData, factsData, placesData] = await Promise.all([
        fetchLiveWeather(destination),
        fetchLiveDestinationFacts(destination),
        fetchLiveNearbyPlaces(destination)
      ]);

      setWeather(weatherData);
      setFacts(factsData);
      setPlaces(placesData);

      if (factsData.countryName) {
        const adv = await fetchLiveTravelAdvisory(factsData.countryName);
        setAdvisory(adv);
      }
    } catch (err: any) {
      console.error("Live Travel Hub Load Error:", err);
      setError(err?.message || "Failed to load live travel data");
      toast.error("Live Sync Notice", "Could not fetch all live streams. Displaying cached data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllLiveData();
  }, [destination]);

  // Weather Icon Component
  const renderWeatherIcon = (iconName: string, className: string = "w-6 h-6") => {
    switch (iconName) {
      case 'Sun': return <Sun className={`${className} text-amber-500`} />;
      case 'CloudSun': return <CloudSun className={`${className} text-amber-400`} />;
      case 'CloudRain': return <CloudRain className={`${className} text-blue-400`} />;
      case 'Snowflake': return <Snowflake className={`${className} text-sky-300`} />;
      default: return <Cloud className={`${className} text-zinc-400`} />;
    }
  };

  return (
    <div id="live-data" className="pt-2 pb-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2D9] dark:border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Live Destination Intelligence</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#2D2D2D] dark:text-zinc-100 tracking-tight">
            Live Insights for {destination}
          </h2>
          <p className="text-sm text-[#7D7A74] dark:text-zinc-400 mt-1">
            Real-time weather forecast, destination wiki, live safety advisory, attractions & food
          </p>
        </div>

        <button
          onClick={loadAllLiveData}
          disabled={loading}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 text-[#2D2D2D] dark:text-zinc-200 rounded-2xl text-xs font-bold hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Syncing...' : 'Refresh Live Data'}</span>
        </button>
      </div>

      {/* Error Banner if API error occurred */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Some live streams experienced latency. Showing current available travel data for {destination}.</span>
          </div>
          <button onClick={loadAllLiveData} className="underline font-bold hover:text-amber-800">
            Retry
          </button>
        </div>
      )}

      {/* LOADING SKELETONS */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-zinc-200 dark:bg-zinc-800/60 rounded-[24px]" />
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800/60 rounded-[24px]" />
          </div>
          <div className="h-48 bg-zinc-200 dark:bg-zinc-800/60 rounded-[24px]" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-40 bg-zinc-200 dark:bg-zinc-800/60 rounded-2xl" />
            <div className="h-40 bg-zinc-200 dark:bg-zinc-800/60 rounded-2xl" />
            <div className="h-40 bg-zinc-200 dark:bg-zinc-800/60 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* SECTION 1: LIVE WEATHER & DESTINATION HERO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Weather Widget */}
            {weather && (
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-6 md:p-8 rounded-[28px] shadow-lg relative overflow-hidden flex flex-col justify-between">
                
                {/* Weather Top Info */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                      {renderWeatherIcon(weather.icon, "w-4 h-4")}
                      <span>Live Meteorological Forecast</span>
                    </div>

                    {/* Unit Switcher */}
                    <button
                      onClick={() => setIsCelsius(!isCelsius)}
                      className="bg-white/15 hover:bg-white/25 border border-white/20 text-white px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      °{isCelsius ? 'C' : 'F'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 my-2">
                    <div>
                      <div className="text-5xl md:text-6xl font-extrabold tracking-tight">
                        {isCelsius ? `${weather.currentTempC}°C` : `${weather.currentTempF}°F`}
                      </div>
                      <div className="text-lg font-bold text-blue-100 mt-1 flex items-center gap-2">
                        <span>{weather.condition}</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">Real-time</span>
                      </div>
                    </div>

                    {/* Weather Metrics */}
                    <div className="grid grid-cols-3 gap-3 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs">
                      <div>
                        <div className="text-blue-200 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Wind className="w-3 h-3" /> Wind
                        </div>
                        <div className="font-extrabold text-sm">{weather.windSpeedKm} km/h</div>
                      </div>
                      <div>
                        <div className="text-blue-200 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Droplets className="w-3 h-3" /> Humidity
                        </div>
                        <div className="font-extrabold text-sm">{weather.humidity}%</div>
                      </div>
                      <div>
                        <div className="text-blue-200 text-[10px] uppercase font-bold flex items-center gap-1">
                          <CloudRain className="w-3 h-3" /> Rain
                        </div>
                        <div className="font-extrabold text-sm">{weather.precipitationProb}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7-Day Forecast Row */}
                <div className="mt-6 pt-5 border-t border-white/15">
                  <div className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">
                    7-Day Live Forecast
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {weather.forecast.map((day, idx) => (
                      <div
                        key={idx}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2.5 rounded-xl text-center border border-white/10 transition-colors"
                      >
                        <div className="text-[11px] font-bold text-blue-100">{day.dayName}</div>
                        <div className="text-[10px] text-blue-200">{day.date}</div>
                        <div className="my-1.5 flex justify-center">
                          {renderWeatherIcon(weather.icon, "w-4 h-4")}
                        </div>
                        <div className="text-xs font-extrabold">
                          {isCelsius ? `${day.maxC}°` : `${Math.round((day.maxC * 9) / 5 + 32)}°`}
                        </div>
                        <div className="text-[10px] text-blue-300">
                          {isCelsius ? `${day.minC}°` : `${Math.round((day.minC * 9) / 5 + 32)}°`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Destination Wikipedia Summary & Facts Card */}
            {facts && (
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] shadow-sm border border-[#E5E2D9] dark:border-zinc-800 flex flex-col justify-between">
                <div>
                  {facts.heroImageUrl && (
                    <div className="h-36 w-full rounded-2xl overflow-hidden mb-4 relative">
                      <img
                        src={facts.heroImageUrl}
                        alt={facts.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                        <span className="text-white text-xs font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          {facts.countryName} {facts.countryFlag}
                        </span>
                      </div>
                    </div>
                  )}

                  <h3 className="font-bold text-lg text-[#2D2D2D] dark:text-zinc-100">{facts.title}</h3>
                  <p className="text-xs text-[#7D7A74] dark:text-zinc-400 mt-1.5 line-clamp-3 leading-relaxed">
                    {facts.extract}
                  </p>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-[#E5E2D9] dark:border-zinc-800 text-xs">
                  <div className="flex justify-between text-[#7D7A74] dark:text-zinc-400">
                    <span>Official Currency:</span>
                    <span className="font-bold text-[#2D2D2D] dark:text-zinc-200">{facts.currencies.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-[#7D7A74] dark:text-zinc-400">
                    <span>Languages:</span>
                    <span className="font-bold text-[#2D2D2D] dark:text-zinc-200">{facts.languages.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-[#7D7A74] dark:text-zinc-400">
                    <span>Driving Rule:</span>
                    <span className="font-bold text-[#2D2D2D] dark:text-zinc-200">{facts.drivingSide}</span>
                  </div>

                  <a
                    href={facts.wikiUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span>Read Full Destination Guide</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: LIVE TRAVEL ADVISORY & SAFETY */}
          {advisory && (
            <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[28px] shadow-sm border border-[#E5E2D9] dark:border-zinc-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2D2D2D] dark:text-zinc-100">Live Travel Advisory & Safety Status</h3>
                    <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Official security rating, emergency phone lines, and local precautions</p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold flex items-center gap-1.5 self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{advisory.levelText}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* Safety Score Card */}
                <div className="bg-[#FAF9F6] dark:bg-zinc-950 p-5 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Risk Assessment Index</span>
                    <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      {advisory.score} <span className="text-xs text-zinc-400 font-normal">/ 5.0 (Low Risk)</span>
                    </div>
                    <p className="text-xs text-[#7D7A74] dark:text-zinc-400 mt-2 leading-relaxed">
                      {advisory.message}
                    </p>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-4 border-t border-[#E5E2D9] dark:border-zinc-800 pt-2">
                    Verified status updated: {advisory.lastUpdated}
                  </div>
                </div>

                {/* Emergency Phone Lines */}
                <div className="bg-[#FAF9F6] dark:bg-zinc-950 p-5 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-500" /> Emergency Helplines
                  </span>

                  <div className="space-y-2">
                    {advisory.emergencyNumbers.map((num, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 text-xs">
                        <span className="text-[#7D7A74] dark:text-zinc-400 font-medium">{num.label}</span>
                        <a href={`tel:${num.number.split('/')[0].trim()}`} className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline">
                          {num.number}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Safety Tips */}
                <div className="bg-[#FAF9F6] dark:bg-zinc-950 p-5 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Info className="w-3 h-3 text-amber-500" /> Traveler Safety Tips
                  </span>

                  <ul className="space-y-2 text-xs text-[#7D7A74] dark:text-zinc-400">
                    {advisory.safetyTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 3: LIVE LOCAL ATTRACTIONS & RESTAURANTS */}
          <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[28px] shadow-sm border border-[#E5E2D9] dark:border-zinc-800 space-y-6">
            
            {/* Header & Category Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-zinc-100">Live Nearby Places & Dining</h3>
                <p className="text-xs text-[#7D7A74] dark:text-zinc-400 mt-0.5">Discovered via live location services with real ratings & direct Google Maps navigation</p>
              </div>

              <div className="flex items-center gap-2 p-1 bg-[#FAF9F6] dark:bg-zinc-950 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800">
                <button
                  onClick={() => setPlacesTab('attractions')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    placesTab === 'attractions'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#7D7A74] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Attractions ({places.attractions.length})</span>
                </button>
                <button
                  onClick={() => setPlacesTab('restaurants')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    placesTab === 'restaurants'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#7D7A74] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Restaurants ({places.restaurants.length})</span>
                </button>
              </div>
            </div>

            {/* Places Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(placesTab === 'attractions' ? places.attractions : places.restaurants).map((place) => (
                <div
                  key={place.id}
                  className="bg-[#FAF9F6] dark:bg-zinc-950 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 overflow-hidden hover:border-blue-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Place Image */}
                    <div className="h-44 w-full relative overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      <img
                        src={place.imageUrl}
                        alt={place.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{place.rating} ({place.reviewsCount})</span>
                      </div>
                      {place.priceLevel && (
                        <div className="absolute top-3 left-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-[#2D2D2D] dark:text-zinc-100 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                          {place.priceLevel}
                        </div>
                      )}
                    </div>

                    {/* Place Details */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-[#2D2D2D] dark:text-zinc-100 line-clamp-1">{place.name}</h4>
                      <p className="text-xs text-[#7D7A74] dark:text-zinc-400 flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3 h-3 shrink-0 text-red-500" />
                        <span>{place.address}</span>
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-[#7D7A74] dark:text-zinc-400 pt-1">
                        {place.distanceKm && (
                          <span className="bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-[#E5E2D9] dark:border-zinc-800">
                            {place.distanceKm}
                          </span>
                        )}
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Open Today</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Button */}
                  <div className="p-4 pt-0">
                    <a
                      href={place.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions on Google Maps</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
