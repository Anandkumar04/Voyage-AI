import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, X, Send, Loader2, CheckCircle2, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store';
import { toast } from '../store/toastStore';
import { Trip } from '../types';

const quickCommands = [
  "🏛️ Remove museums",
  "🏖️ Add beaches",
  "👑 Make luxury",
  "🎒 Backpacker friendly",
  "🧸 Kid-friendly",
  "🔄 Regenerate Day 2",
  "🏨 Replace hotel",
  "🍕 Add restaurants",
  "🛍️ Add shopping",
];

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isModification?: boolean;
  modifiedTitle?: string;
}

export default function ChatAssistant() {
  const { isChatOpen: isOpen, setChatOpen: setIsOpen } = useAppStore();
  const savedTrips = useAppStore(state => state.savedTrips);
  const currentTrip = useAppStore(state => state.currentTrip);
  const updateTripDetails = useAppStore(state => state.updateTripDetails);

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  
  const activeTrip: Trip | null = 
    savedTrips.find(t => t.id === selectedTripId) || 
    currentTrip || 
    (savedTrips.length > 0 ? savedTrips[0] : null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      content: "Hello! I am Voyage AI. I can answer travel questions and modify your itinerary in real-time. Try asking me to 'Remove museums', 'Add beaches', or 'Make luxury'!" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim()) return;

    const newMessages: ChatMessage[] = [
      ...messages, 
      { role: 'user', content: textToSend }
    ];
    
    setMessages(newMessages);
    if (!customMessage) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          currentTrip: activeTrip 
        })
      });

      const data = await response.json();

      if (data.isModification && data.modifiedTrip && activeTrip) {
        updateTripDetails(activeTrip.id, data.modifiedTrip);

        toast.success(
          data.toastTitle || "Itinerary Updated!",
          data.toastDescription || `Applied changes to ${activeTrip.destination}.`
        );

        setMessages(prev => [
          ...prev, 
          { 
            role: 'model', 
            content: data.reply || "I've updated your itinerary!",
            isModification: true,
            modifiedTitle: data.toastTitle || "Itinerary Updated"
          }
        ]);
      } else if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev, 
          { role: 'model', content: "I've processed your request." }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { role: 'model', content: "Sorry, I'm having trouble connecting right now." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Pill in Bottom-Right Corner */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-[#2D2D2D] dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl font-bold text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <Sparkles className="w-4 h-4 text-blue-400 dark:text-blue-600 animate-pulse" />
          <span>Ask Voyage AI</span>
        </button>
      )}

      {/* Expanded Glass Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 sm:bottom-6 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-[400px] h-[480px] sm:h-[540px] max-h-[calc(100vh-110px)] bg-white dark:bg-zinc-900 rounded-[24px] shadow-2xl border border-[#E5E2D9] dark:border-zinc-800 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#2D2D2D] text-white flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-wider text-xs uppercase text-white/90">Voyage AI Assistant</h3>
                    <p className="text-[10px] text-white/60">Real-time Travel Intelligence</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Active Trip Indicator */}
              {activeTrip && (
                <div className="mt-1 bg-black/40 rounded-xl p-2 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="font-medium text-white/80">Context:</span>
                    <span className="font-bold text-white truncate">{activeTrip.destination}</span>
                  </div>

                  {savedTrips.length > 1 && (
                    <select
                      value={activeTrip.id}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="bg-zinc-800 text-white text-[10px] font-bold py-1 px-2 rounded-lg border border-white/20 focus:outline-none cursor-pointer"
                    >
                      {savedTrips.map(t => (
                        <option key={t.id} value={t.id}>{t.destination}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Quick Commands */}
            <div className="bg-[#FAF9F6] dark:bg-zinc-950 px-3 py-2 border-b border-[#E5E2D9] dark:border-zinc-800 overflow-x-auto hide-scrollbar flex gap-1.5 flex-shrink-0">
              {quickCommands.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(cmd)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 text-[11px] font-medium text-[#2D2D2D] dark:text-zinc-200 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer disabled:opacity-50"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto bg-[#FAF9F6] dark:bg-zinc-950 flex flex-col gap-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-[18px] px-4 py-2.5 ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                      : 'bg-white dark:bg-zinc-900 text-[#2D2D2D] dark:text-zinc-100 border border-[#E5E2D9] dark:border-zinc-800 rounded-bl-none shadow-sm'
                  }`}>
                    {m.isModification && (
                      <div className="mb-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        {m.modifiedTitle || "Itinerary Modified"}
                      </div>
                    )}
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 rounded-[18px] rounded-bl-none px-4 py-2.5 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span className="text-xs font-semibold text-[#7D7A74] animate-pulse">Processing request...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-zinc-900 border-t border-[#E5E2D9] dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={activeTrip ? `Ask to modify ${activeTrip.destination}...` : "Ask a travel question..."}
                  className="flex-grow px-3.5 py-2 rounded-xl border border-[#E5E2D9] dark:border-zinc-800 focus:outline-none bg-[#FAF9F6] dark:bg-zinc-950 text-xs text-[#2D2D2D] dark:text-zinc-100 font-medium"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
