import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Calendar, Users, Wallet, Plane, Sparkles, 
  ArrowRight, ArrowLeft, Check, Compass, Coffee, Hotel, X, RefreshCw
} from 'lucide-react';
import { useAppStore } from '../store';
import { toast } from '../store/toastStore';
import { Trip } from '../types';
import { useSEO } from '../hooks/useSEO';
const API_BASE_URL = import.meta.env.VITE_API_URL;


const loadingSteps = [
  { icon: MapPin, text: 'Analyzing destination highlights...' },
  { icon: Coffee, text: 'Curating dining & local experiences...' },
  { icon: Hotel, text: 'Selecting premier stays...' },
  { icon: Sparkles, text: 'Polishing your custom itinerary...' }
];

const WIZARD_STEPS = [
  { id: 1, title: 'Destination', subtitle: 'Where do you want to go?' },
  { id: 2, title: 'Duration', subtitle: 'How long will your journey be?' },
  { id: 3, title: 'Travelers', subtitle: 'Who is traveling with you?' },
  { id: 4, title: 'Budget', subtitle: 'Select your target spending level' },
  { id: 5, title: 'Style', subtitle: 'Choose your preferred pace' },
  { id: 6, title: 'Interests', subtitle: 'What experiences do you love?' }
];

const POPULAR_DESTINATIONS = [
  'Kyoto, Japan', 'Amalfi Coast, Italy', 'Banff, Canada', 
  'Santorini, Greece', 'Bali, Indonesia', 'Paris, France'
];

const INTEREST_TAGS = [
  'Culture & History', 'Local Cuisine', 'Outdoor Adventure', 
  'Art & Museums', 'Relaxation & Spa', 'Photography', 'Nightlife', 'Hidden Gems'
];

export default function Planner() {
  useSEO('AI Trip Planner', 'Customize destination, duration, budget, travel style, and interests to generate a tailored AI trip.');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addTrip = useAppStore(state => state.addTrip);
  const setCurrentTrip = useAppStore(state => state.setCurrentTrip);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const autoSubmitted = useRef(false);

  const initialDestination = searchParams.get('destination') || '';

  const [formData, setFormData] = useState({
    destination: initialDestination,
    days: '5',
    dates: '',
    groupSize: '2 Adults',
    budget: 'Moderate',
    style: 'Balanced',
    interests: 'Culture, Food, Sightseeing'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep(prev => Math.min(prev + 1, loadingSteps.length - 1));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1 && (!formData.destination || formData.destination.trim().length < 2)) {
      newErrors.destination = 'Please specify a destination to continue.';
    }
    if (step === 2) {
      const d = parseInt(formData.days);
      if (isNaN(d) || d < 1 || d > 30) {
        newErrors.days = 'Duration must be between 1 and 30 days.';
      }
    }
    if (step === 3 && (!formData.groupSize || formData.groupSize.trim().length < 2)) {
      newErrors.groupSize = 'Please specify who is traveling.';
    }
    if (step === 6 && (!formData.interests || formData.interests.trim().length < 2)) {
      newErrors.interests = 'Please pick or enter at least one interest.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep(prev => prev + 1);
      } else {
        generatePlan(formData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generatePlan = async (currentFormData: any) => {
    setIsLoading(true);
    setLoadingStep(0);
    try {
      const response = await fetch(`${API_BASE_URL}/api/plan-trip`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentFormData),
      });
      
      const itinerary = await response.json();
      
      const newTrip: Trip = {
  id: Math.random().toString(36).substr(2, 9),
  ...currentFormData,
  createdAt: new Date(),
  itinerary
};

// Save trip to MongoDB
    await fetch("/api/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTrip),
    });

    addTrip(newTrip);
    setCurrentTrip(newTrip);
    toast.success(`Trip Generated!`, `Your itinerary for ${newTrip.destination} is ready.`);
    navigate(`/trip/${newTrip.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Generation Failed', 'Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('auto') === 'true' && initialDestination && !autoSubmitted.current) {
      autoSubmitted.current = true;
      generatePlan(formData);
    }
  }, [searchParams, initialDestination]);

  const toggleInterestTag = (tag: string) => {
    const currentList = formData.interests.split(',').map(s => s.trim()).filter(Boolean);
    let nextList: string[];
    if (currentList.includes(tag)) {
      nextList = currentList.filter(t => t !== tag);
    } else {
      nextList = [...currentList, tag];
    }
    updateField('interests', nextList.join(', '));
  };

  return (
    <div className="flex-grow bg-[#FAF9F6] dark:bg-zinc-950 px-4 py-8 md:py-16 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full mx-auto relative z-10">
        
        {/* Step Wizard Container Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-[#E5E2D9] dark:border-zinc-800 shadow-lg dark:shadow-2xl overflow-hidden relative min-h-[520px] flex flex-col justify-between">
          
          {/* Loading Screen Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-20 h-20 bg-[#FAF9F6] dark:bg-zinc-950 rounded-2xl flex items-center justify-center mb-6 border border-[#E5E2D9] dark:border-zinc-800 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                  <Compass className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                
                <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100 mb-2">Crafting Your Voyage</h2>
                <p className="text-[#7D7A74] dark:text-zinc-400 text-xs sm:text-sm mb-8 max-w-sm">
                  Curating local gems, optimal daily schedules, and hotel picks for {formData.destination || 'your trip'}.
                </p>

                <div className="w-full max-w-sm space-y-3 text-left">
                  {loadingSteps.map((step, idx) => {
                    const isCompleted = idx < loadingStep;
                    const isActive = idx === loadingStep;
                    const StepIcon = step.icon;
                    return (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: isActive || isCompleted ? 1 : 0.4,
                          x: isActive || isCompleted ? 0 : -10
                        }}
                        className={`flex items-center gap-3.5 p-3 rounded-xl transition-colors ${isActive ? 'bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800' : ''}`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          isCompleted ? 'bg-emerald-500 text-white' : 
                          isActive ? 'bg-blue-600 text-white animate-pulse' : 
                          'bg-[#E5E2D9] dark:bg-zinc-800 text-[#A8A399] dark:text-zinc-500'
                        }`}>
                          <StepIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-[#2D2D2D] dark:text-zinc-100' : 'text-[#A8A399] dark:text-zinc-500'}`}>
                          {step.text}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header Progress Bar & Step Tracker */}
          <div className="p-6 sm:p-8 border-b border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6]/50 dark:bg-zinc-950/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                  Step {currentStep} of 6
                </span>
                <span className="text-xs font-bold text-[#7D7A74] dark:text-zinc-400">
                  {WIZARD_STEPS[currentStep - 1].title}
                </span>
              </div>

              <button 
                onClick={() => navigate('/dashboard')}
                className="p-1.5 rounded-full text-[#7D7A74] hover:text-[#2D2D2D] dark:text-zinc-400 dark:hover:text-white transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-[#E5E2D9] dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-blue-600 h-full rounded-full"
                animate={{ width: `${(currentStep / 6) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Wizard Body (Animated Steps) */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: DESTINATION */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-blue-600" />
                      Where are you heading?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-400">
                      Enter any city, country, or region you're dreaming of visiting.
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      autoFocus
                      value={formData.destination}
                      onChange={(e) => updateField('destination', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                      placeholder="e.g. Tokyo, Japan or Amalfi Coast"
                      className={`w-full px-5 py-4 rounded-2xl border bg-[#FAF9F6] dark:bg-zinc-950 text-base font-semibold text-[#2D2D2D] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
                        errors.destination ? 'border-red-500' : 'border-[#E5E2D9] dark:border-zinc-800'
                      }`}
                    />
                    {errors.destination && <p className="text-red-500 text-xs mt-2 font-medium">{errors.destination}</p>}
                  </div>

                  {/* Quick Select Chips */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-[#A8A399] uppercase tracking-wider">Popular Ideas</span>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_DESTINATIONS.map((dest) => (
                        <button
                          key={dest}
                          type="button"
                          onClick={() => updateField('destination', dest)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            formData.destination === dest 
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-[#FAF9F6] dark:bg-zinc-950 border-[#E5E2D9] dark:border-zinc-800 text-[#7D7A74] dark:text-zinc-400 hover:border-zinc-400'
                          }`}
                        >
                          {dest}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: DURATION */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      How long is your trip?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-400">
                      Set the total number of days for your itinerary.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['3', '5', '7', '10'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => updateField('days', d)}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer min-h-[52px] ${
                          formData.days === d
                            ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                            : 'bg-[#FAF9F6] dark:bg-zinc-950 border-[#E5E2D9] dark:border-zinc-800 text-[#2D2D2D] dark:text-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        <span className="text-lg sm:text-xl font-extrabold block">{d}</span>
                        <span className="text-[10px] sm:text-[11px] opacity-80 uppercase tracking-wider font-semibold">Days</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#7D7A74] dark:text-zinc-400">Or enter custom days:</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.days}
                      onChange={(e) => updateField('days', e.target.value)}
                      className={`w-full px-5 py-3.5 rounded-2xl border bg-[#FAF9F6] dark:bg-zinc-950 text-sm font-semibold text-[#2D2D2D] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                        errors.days ? 'border-red-500' : 'border-[#E5E2D9] dark:border-zinc-800'
                      }`}
                    />
                    {errors.days && <p className="text-red-500 text-xs mt-1">{errors.days}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#7D7A74] dark:text-zinc-400">Travel Dates (Optional):</label>
                    <input
                      type="text"
                      placeholder="e.g. Oct 12 - Oct 18"
                      value={formData.dates}
                      onChange={(e) => updateField('dates', e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-sm font-semibold text-[#2D2D2D] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: TRAVELERS */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100 flex items-center gap-2">
                      <Users className="w-6 h-6 text-blue-600" />
                      Who is traveling?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-400">
                      Select who will be joining this adventure.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Solo Traveler', value: '1 Adult' },
                      { label: 'Couple', value: '2 Adults' },
                      { label: 'Family with Kids', value: '2 Adults, 2 Kids' },
                      { label: 'Friends Group', value: '4 Adults' }
                    ].map((group) => (
                      <button
                        key={group.label}
                        type="button"
                        onClick={() => updateField('groupSize', group.value)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer min-h-[52px] ${
                          formData.groupSize === group.value
                            ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                            : 'bg-[#FAF9F6] dark:bg-zinc-950 border-[#E5E2D9] dark:border-zinc-800 text-[#2D2D2D] dark:text-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        <span className="text-sm font-bold block">{group.label}</span>
                        <span className="text-xs opacity-80 font-normal">{group.value}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#7D7A74] dark:text-zinc-400">Custom Group Specification:</label>
                    <input
                      type="text"
                      value={formData.groupSize}
                      onChange={(e) => updateField('groupSize', e.target.value)}
                      placeholder="e.g. 3 Adults, 1 Toddler"
                      className={`w-full px-5 py-3.5 rounded-2xl border bg-[#FAF9F6] dark:bg-zinc-950 text-sm font-semibold text-[#2D2D2D] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                        errors.groupSize ? 'border-red-500' : 'border-[#E5E2D9] dark:border-zinc-800'
                      }`}
                    />
                    {errors.groupSize && <p className="text-red-500 text-xs mt-1">{errors.groupSize}</p>}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: BUDGET */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100 flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-emerald-500" />
                      What is your travel budget?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-400">
                      We'll tailor dining and stay recommendations to match.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { level: 'Budget-friendly', desc: 'Hostels, public transit, street food & free sights', icon: '💰' },
                      { level: 'Moderate', desc: 'Comfortable 3-4★ hotels, mixed dining & guided tours', icon: '💳' },
                      { level: 'Luxury', desc: '5★ boutique resorts, fine dining & private transfers', icon: '💎' }
                    ].map((b) => (
                      <button
                        key={b.level}
                        type="button"
                        onClick={() => updateField('budget', b.level)}
                        className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          formData.budget === b.level
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-[#FAF9F6] dark:bg-zinc-950 border-[#E5E2D9] dark:border-zinc-800 text-[#2D2D2D] dark:text-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        <div className="text-2xl mb-2">{b.icon}</div>
                        <div>
                          <span className="text-sm font-bold block mb-1">{b.level}</span>
                          <span className="text-xs opacity-80 leading-relaxed block font-medium">{b.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 5: STYLE */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100 flex items-center gap-2">
                      <Plane className="w-6 h-6 text-blue-600" />
                      Choose your travel pace
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-400">
                      How active would you like your daily schedule to be?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { name: 'Relaxed', desc: 'Leisurely mornings, 1-2 key activities per day' },
                      { name: 'Balanced', desc: 'Optimal blend of sightseeing, dining & free time' },
                      { name: 'Action-packed', desc: 'Full daily schedules maximizing every hour' }
                    ].map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => updateField('style', s.name)}
                        className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          formData.style === s.name
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-[#FAF9F6] dark:bg-zinc-950 border-[#E5E2D9] dark:border-zinc-800 text-[#2D2D2D] dark:text-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        <span className="text-sm font-bold block mb-1">{s.name}</span>
                        <span className="text-xs opacity-80 leading-relaxed block font-medium">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 6: INTERESTS */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-amber-500" />
                      What experiences interest you?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-400">
                      Tap interest tags to add them or type custom themes below.
                    </p>
                  </div>

                  {/* Interest Tag Chips */}
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_TAGS.map((tag) => {
                      const isSelected = formData.interests.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleInterestTag(tag)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 text-[#7D7A74] dark:text-zinc-400 hover:border-zinc-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#7D7A74] dark:text-zinc-400">Custom Interests / Requirements:</label>
                    <input
                      type="text"
                      value={formData.interests}
                      onChange={(e) => updateField('interests', e.target.value)}
                      placeholder="e.g. Michelin dining, coffee shops, architectural landmarks"
                      className={`w-full px-5 py-3.5 rounded-2xl border bg-[#FAF9F6] dark:bg-zinc-950 text-sm font-semibold text-[#2D2D2D] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                        errors.interests ? 'border-red-500' : 'border-[#E5E2D9] dark:border-zinc-800'
                      }`}
                    />
                    {errors.interests && <p className="text-red-500 text-xs mt-1">{errors.interests}</p>}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer Navigation Buttons */}
          <div className="p-6 sm:p-8 border-t border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6]/50 dark:bg-zinc-950/50 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-3 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 text-xs font-bold text-[#2D2D2D] dark:text-zinc-200 hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              className="px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>{currentStep === 6 ? 'Generate Trip Plan' : 'Continue'}</span>
              {currentStep === 6 ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
