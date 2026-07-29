import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Luggage, BookOpen, Gift, Sparkles, CheckSquare, Square, Plus, 
  PenTool, Heart, Camera, Trash2, CheckCircle2
} from 'lucide-react';
import { toast } from '../../store/toastStore';

interface TripToolkitProps {
  destination: string;
  packingList?: string[];
}

export default function TripToolkit({ destination, packingList = [] }: TripToolkitProps) {
  const [activeToolkitTab, setActiveToolkitTab] = useState<'PACKING' | 'JOURNAL' | 'SOUVENIRS' | 'REFLECTION'>('PACKING');

  // Packing state
  const defaultItems = packingList.length > 0 
    ? packingList 
    : ['Passport & Visa Documents', 'Universal Adapter & Charger', 'Comfortable Walking Shoes', 'Sunscreen & Sunglasses', 'Reusable Water Bottle', 'Medications & First Aid'];
  
  const [packedState, setPackedState] = useState<Record<number, boolean>>({});
  const [customPackingInput, setCustomPackingInput] = useState('');
  const [itemsList, setItemsList] = useState<string[]>(defaultItems);

  // Journal state
  const [journalEntries, setJournalEntries] = useState([
    {
      id: 1,
      date: 'Day 1 Evening',
      title: 'First Impressions',
      content: `Arrived safely in ${destination}. The atmosphere is vibrant and warm. Can't wait to explore tomorrow!`
    }
  ]);
  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalText, setNewJournalText] = useState('');

  // Souvenirs state
  const [souvenirList, setSouvenirList] = useState([
    { id: 1, name: 'Local Artisan Coffee / Tea', targetPerson: 'Self / Family', bought: false },
    { id: 2, name: 'Handcrafted Postcards', targetPerson: 'Friends', bought: true }
  ]);
  const [newSouvenirName, setNewSouvenirName] = useState('');

  // Reflection
  const [reflectionText, setReflectionText] = useState('');
  const [isSavedReflection, setIsSavedReflection] = useState(false);

  const togglePacked = (index: number, name: string) => {
    const isNowPacked = !packedState[index];
    setPackedState(prev => ({ ...prev, [index]: isNowPacked }));
    if (isNowPacked) {
      toast.success(`Packed "${name}"`, 'Added to your packed bag.');
    }
  };

  const addCustomPackingItem = () => {
    if (!customPackingInput.trim()) return;
    setItemsList(prev => [...prev, customPackingInput.trim()]);
    toast.success('Item Added', `Added "${customPackingInput}" to packing list.`);
    setCustomPackingInput('');
  };

  const addJournalEntry = () => {
    if (!newJournalText.trim()) return;
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      title: newJournalTitle.trim() || 'Trip Memory',
      content: newJournalText.trim()
    };
    setJournalEntries(prev => [entry, ...prev]);
    setNewJournalTitle('');
    setNewJournalText('');
    toast.success('Journal Saved', 'Added new travel note.');
  };

  const addSouvenir = () => {
    if (!newSouvenirName.trim()) return;
    setSouvenirList(prev => [...prev, { id: Date.now(), name: newSouvenirName.trim(), targetPerson: 'Friends', bought: false }]);
    setNewSouvenirName('');
    toast.success('Souvenir Added', 'Added to shopping wishlist.');
  };

  const toggleSouvenirBought = (id: number) => {
    setSouvenirList(prev => prev.map(s => s.id === id ? { ...s, bought: !s.bought } : s));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
          <Luggage className="w-3.5 h-3.5" />
          <span>Trip Toolkit & Memories</span>
        </div>
        <h2 className="text-2xl font-bold text-[#2D2D2D] dark:text-zinc-100">Trip Toolkit</h2>
        <p className="text-xs sm:text-sm text-[#7D7A74] dark:text-zinc-400 mt-1">
          Packing checklist, travel journal, souvenir tracker, and post-trip reflections.
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E2D9] dark:border-zinc-800 pb-3 overflow-x-auto hide-scrollbar">
        {[
          { id: 'PACKING', label: 'Before You Go (Packing)', icon: CheckSquare },
          { id: 'JOURNAL', label: 'Travel Journal', icon: BookOpen },
          { id: 'SOUVENIRS', label: 'Souvenirs Wishlist', icon: Gift },
          { id: 'REFLECTION', label: 'Trip Reflection', icon: PenTool },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeToolkitTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveToolkitTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#7D7A74] dark:text-zinc-400 hover:text-[#2D2D2D] dark:hover:text-zinc-100 hover:bg-[#FAF9F6] dark:hover:bg-zinc-950'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PACKING CHECKLIST */}
      {activeToolkitTab === 'PACKING' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#2D2D2D] dark:text-zinc-100">Smart Packing Checklist</h3>
              <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Keep track of everything you need for {destination}</p>
            </div>

            {(() => {
              const packedCount = Object.values(packedState).filter(Boolean).length;
              const total = itemsList.length;
              return (
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                  {packedCount}/{total} Packed
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {itemsList.map((item, idx) => {
              const isChecked = !!packedState[idx];
              return (
                <button
                  key={idx}
                  onClick={() => togglePacked(idx, item)}
                  className={`flex items-center p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-[#FAF9F6] dark:bg-zinc-950 border-[#E5E2D9] dark:border-zinc-800 text-[#2D2D2D] dark:text-zinc-200 hover:border-blue-500/50'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 mr-3 text-[#A8A399] dark:text-zinc-500 flex-shrink-0" />
                  )}
                  <span className={`text-xs font-semibold ${isChecked ? 'line-through opacity-70' : ''}`}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Add custom item */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add custom item to packing list..."
              value={customPackingInput}
              onChange={(e) => setCustomPackingInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomPackingItem()}
              className="flex-1 px-4 py-2 bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 rounded-xl text-xs text-[#2D2D2D] dark:text-zinc-100 focus:outline-none"
            />
            <button
              onClick={addCustomPackingItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Add Item
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: TRAVEL JOURNAL */}
      {activeToolkitTab === 'JOURNAL' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-xs text-[#2D2D2D] dark:text-zinc-100 uppercase tracking-wider">Record a Memory</h3>
            <input
              type="text"
              placeholder="Title (e.g. Sunset over the cliffs)"
              value={newJournalTitle}
              onChange={(e) => setNewJournalTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 rounded-xl text-xs text-[#2D2D2D] dark:text-zinc-100 focus:outline-none"
            />
            <textarea
              rows={3}
              placeholder="Write your travel reflection, story, or highlights..."
              value={newJournalText}
              onChange={(e) => setNewJournalText(e.target.value)}
              className="w-full p-3.5 bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 rounded-xl text-xs text-[#2D2D2D] dark:text-zinc-100 focus:outline-none resize-none"
            />
            <button
              onClick={addJournalEntry}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Save Journal Entry
            </button>
          </div>

          <div className="space-y-3">
            {journalEntries.map((entry) => (
              <div key={entry.id} className="p-4 rounded-2xl border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#2D2D2D] dark:text-zinc-100">
                  <span>{entry.title}</span>
                  <span className="text-[10px] text-[#7D7A74] dark:text-zinc-400">{entry.date}</span>
                </div>
                <p className="text-xs text-[#7D7A74] dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOUVENIRS */}
      {activeToolkitTab === 'SOUVENIRS' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add souvenir / gift idea..."
              value={newSouvenirName}
              onChange={(e) => setNewSouvenirName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSouvenir()}
              className="flex-1 px-4 py-2 bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 rounded-xl text-xs text-[#2D2D2D] dark:text-zinc-100 focus:outline-none"
            />
            <button
              onClick={addSouvenir}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Add Gift
            </button>
          </div>

          <div className="space-y-2">
            {souvenirList.map((item) => (
              <div 
                key={item.id}
                onClick={() => toggleSouvenirBought(item.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  item.bought
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-[#FAF9F6] dark:bg-zinc-950 border-[#E5E2D9] dark:border-zinc-800 text-[#2D2D2D] dark:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.bought ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Gift className="w-4 h-4 text-indigo-500" />}
                  <span className={`text-xs font-bold ${item.bought ? 'line-through opacity-70' : ''}`}>{item.name}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 text-[#7D7A74]">
                  {item.bought ? 'Purchased' : 'To Buy'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REFLECTION */}
      {activeToolkitTab === 'REFLECTION' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#2D2D2D] dark:text-zinc-100">Post-Trip Reflection</h3>
          <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Summarize what you learned, your favorite spots, and tips for future travelers.</p>
          <textarea
            rows={4}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="What was the highlight of this trip? Would you visit again?"
            className="w-full p-4 bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 rounded-2xl text-xs text-[#2D2D2D] dark:text-zinc-100 focus:outline-none resize-none"
          />
          <button
            onClick={() => {
              setIsSavedReflection(true);
              toast.success('Reflection Saved', 'Stored your post-trip thoughts.');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {isSavedReflection ? 'Reflection Saved ✓' : 'Save Reflection'}
          </button>
        </div>
      )}

    </div>
  );
}
