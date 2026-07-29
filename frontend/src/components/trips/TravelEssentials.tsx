import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, CreditCard, Zap, Car, ShieldAlert, Sun, Languages, 
  ChevronDown, Info, AlertTriangle, Phone, CheckCircle2, DollarSign,
  Compass, MapPin
} from 'lucide-react';

interface TravelEssentialsProps {
  destination: string;
}

export default function TravelEssentials({ destination }: TravelEssentialsProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>('visa');

  const toggleAccordion = (id: string) => {
    setOpenAccordion(prev => prev === id ? null : id);
  };

  const essentialsList = [
    {
      id: 'visa',
      title: 'Entry & Visa Requirements',
      icon: Globe,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
      badge: 'Mandatory Check',
      summary: 'Passport validity minimum 6 months required upon arrival.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-300 leading-relaxed">
          <p>
            For travel to <strong className="text-[#2D2D2D] dark:text-zinc-100">{destination}</strong>, ensure your passport has at least 6 months of validity remaining from your scheduled date of return.
          </p>
          <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#2D2D2D] dark:text-zinc-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Standard Tourist E-Visa / Visa on Arrival</span>
            </div>
            <p className="text-xs text-[#7D7A74] dark:text-zinc-400">
              Most international passport holders qualify for instant 30 to 90-day tourist entry visas or online e-Visa authorization. Keep a printed copy of your return ticket and hotel bookings.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'currency',
      title: 'Currency & Payments',
      icon: CreditCard,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
      badge: 'Cards & Cash',
      summary: 'Contactless cards widely accepted. Keep minor cash for markets.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-300 leading-relaxed">
          <p>
            Credit and debit cards (Visa & MasterCard) are accepted across hotels, restaurants, and shopping centers in <strong className="text-[#2D2D2D] dark:text-zinc-100">{destination}</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800">
              <div className="font-bold text-xs text-[#2D2D2D] dark:text-zinc-100 mb-1">Tip Culture</div>
              <p className="text-xs text-[#7D7A74] dark:text-zinc-400">10-15% tipping is customary in restaurants unless service charge is included.</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800">
              <div className="font-bold text-xs text-[#2D2D2D] dark:text-zinc-100 mb-1">ATMs & FX</div>
              <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Use official bank ATMs for local currency withdrawals to avoid elevated exchange fees.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'power',
      title: 'Power Plugs & Voltage',
      icon: Zap,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
      badge: 'Universal Adapter',
      summary: 'Universal travel adapter recommended for all electronic devices.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-300 leading-relaxed">
          <p>
            Standard voltage operates on dual ranges with frequency at 50/60Hz. Hotels usually offer USB charging ports, but having a multi-plug universal adapter is recommended.
          </p>
        </div>
      )
    },
    {
      id: 'transport',
      title: 'Transport & Driving Side',
      icon: Car,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
      badge: 'Metro & Rideshare',
      summary: 'Public metro cards & ride-hailing apps offer easy navigation.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-300 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800">
              <div className="font-bold text-xs text-[#2D2D2D] dark:text-zinc-100 mb-1">Driving Side</div>
              <p className="text-xs text-[#7D7A74] dark:text-zinc-400">International Driving Permit (IDP) required alongside your native driver license for vehicle rentals.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800">
              <div className="font-bold text-xs text-[#2D2D2D] dark:text-zinc-100 mb-1">Rideshare Apps</div>
              <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Uber / local rideshare services are readily available in central tourist hubs.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'safety',
      title: 'Health, Safety & Emergencies',
      icon: ShieldAlert,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
      badge: 'Emergency Contacts',
      summary: 'Comprehensive travel insurance recommended for medical coverage.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400 text-xs">
              <Phone className="w-4 h-4" />
              <span>Emergency Helpline: Dial 112 / 911</span>
            </div>
            <p className="text-xs text-rose-800 dark:text-rose-300">
              Universal emergency services available 24/7 with English-speaking dispatch operators. Keep digital copies of your medical insurance policy on your phone.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'weather',
      title: 'Weather & Seasonal Tips',
      icon: Sun,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40',
      badge: 'Climate Info',
      summary: 'Pleasant conditions expected. Pack light layers & comfortable walking shoes.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-300 leading-relaxed">
          <p>
            Daytime temperatures in <strong className="text-[#2D2D2D] dark:text-zinc-100">{destination}</strong> average around 22°C–28°C (72°F–82°F). Evening temperatures drop comfortably. Bring breathable fabrics and sunscreen for outdoor sightseeing.
          </p>
        </div>
      )
    },
    {
      id: 'culture',
      title: 'Culture & Key Languages',
      icon: Languages,
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40',
      badge: 'Local Etiquette',
      summary: 'English widely spoken in tourist locations. Respect religious customs.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-300 leading-relaxed">
          <p>
            When visiting religious sites or historical landmarks in <strong className="text-[#2D2D2D] dark:text-zinc-100">{destination}</strong>, modest clothing covering shoulders and knees is appreciated.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Essential Travel Intelligence</span>
        </div>
        <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100">Travel Essentials for {destination}</h2>
        <p className="text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-400 mt-1">
          Key entry requirements, payment norms, voltage, health, and local etiquette in one place.
        </p>
      </div>

      {/* Single Accordion Stack */}
      <div className="space-y-3">
        {essentialsList.map((item) => {
          const Icon = item.icon;
          const isOpen = openAccordion === item.id;

          return (
            <div 
              key={item.id} 
              className="rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(item.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl ${item.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#2D2D2D] dark:text-zinc-100 truncate">{item.title}</h3>
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-zinc-900 text-[#7D7A74] dark:text-zinc-400 border border-[#E5E2D9] dark:border-zinc-800">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#7D7A74] dark:text-zinc-400 truncate mt-0.5">{item.summary}</p>
                  </div>
                </div>

                <div className={`p-1.5 rounded-full text-[#A8A399] dark:text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 sm:p-5 pt-0 border-t border-[#E5E2D9] dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40">
                      {item.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

    </div>
  );
}
