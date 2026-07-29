import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Share2, Copy, FileText, Printer, Download, 
  DollarSign, Check, Sparkles, Link as LinkIcon, FileSpreadsheet, ExternalLink
} from 'lucide-react';
import { Trip } from '../../types';
import { toast } from '../../store/toastStore';

interface ExportShareModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onPrint: () => void;
}

export const ExportShareModal: React.FC<ExportShareModalProps> = ({
  isOpen,
  trip,
  onClose,
  onPrint
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen || !trip) return null;

  const itinerary = trip.itinerary;
  const shareUrl = `${window.location.origin}/trip/${trip.id}`;

  // 1. Share Link Handler
  const handleShareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Voyage AI: ${trip.destination} Itinerary`,
          text: `Check out my ${trip.days}-day trip to ${trip.destination} planned with Voyage AI!`,
          url: shareUrl,
        });
        toast.success("Link Shared", "Opened native share sheet.");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast.success("Link Copied!", "Itinerary URL copied to clipboard.");
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success("Link Copied!", "Itinerary URL copied to clipboard.");
    }
  };

  // 2. Copy Formatted Text Handler
  const handleCopyText = async () => {
    let text = `✈️ VOYAGE AI TRAVEL ITINERARY: ${trip.destination.toUpperCase()}\n`;
    text += `Duration: ${trip.days} Days | Budget: ${trip.budget} | Style: ${trip.style}\n`;
    if (itinerary?.estimatedTotalCost) {
      text += `Estimated Cost: ${itinerary.estimatedTotalCost}\n`;
    }
    text += `\nSUMMARY:\n${itinerary?.summary || ''}\n\n`;

    if (itinerary?.days && itinerary.days.length > 0) {
      text += `===========================================\n`;
      text += `DAY-BY-DAY ITINERARY\n`;
      text += `===========================================\n`;
      itinerary.days.forEach(day => {
        text += `\nDAY ${day.day}: ${day.theme} (${day.totalDailyCost || ''})\n`;
        (day.activities || []).forEach(act => {
          text += `  • [${act.time || 'Activity'}] ${act.title}\n`;
          text += `    ${act.description}\n`;
          text += `    Location: ${act.location || 'N/A'} | Cost: ${act.cost || 'Free'}\n`;
        });
      });
    }

    if (itinerary?.hotels && itinerary.hotels.length > 0) {
      text += `\n===========================================\n`;
      text += `RECOMMENDED ACCOMMODATIONS\n`;
      text += `===========================================\n`;
      itinerary.hotels.forEach(h => {
        text += `  • ${h.name} (${h.pricePerNight || ''})\n`;
        text += `    ${h.description}\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      toast.success("Itinerary Copied!", "Full itinerary copied as text to clipboard.");
    } catch {
      toast.error("Copy Failed", "Could not copy to clipboard.");
    }
  };

  // 3. Download Summary (.md / .txt)
  const handleDownloadSummary = () => {
    let content = `# Voyage AI Travel Itinerary: ${trip.destination}\n\n`;
    content += `**Duration:** ${trip.days} Days  \n`;
    content += `**Budget Level:** ${trip.budget}  \n`;
    content += `**Travel Style:** ${trip.style}  \n`;
    content += `**Group Type:** ${trip.groupSize}  \n`;
    if (itinerary?.estimatedTotalCost) {
      content += `**Estimated Total Cost:** ${itinerary.estimatedTotalCost}  \n`;
    }
    content += `\n## Summary\n${itinerary?.summary || 'N/A'}\n\n`;

    if (itinerary?.days && itinerary.days.length > 0) {
      content += `## Day-by-Day Plan\n\n`;
      itinerary.days.forEach(d => {
        content += `### Day ${d.day}: ${d.theme} (${d.totalDailyCost || ''})\n\n`;
        (d.activities || []).forEach(a => {
          content += `#### ${a.time || 'Activity'}: ${a.title}\n`;
          content += `- **Description:** ${a.description}\n`;
          content += `- **Location:** ${a.location || 'N/A'}\n`;
          content += `- **Cost:** ${a.cost || 'N/A'}\n`;
          if (a.openingHours) content += `- **Hours:** ${a.openingHours}\n`;
          content += `\n`;
        });
      });
    }

    if (itinerary?.hotels && itinerary.hotels.length > 0) {
      content += `## Recommended Hotels\n\n`;
      itinerary.hotels.forEach(h => {
        content += `### ${h.name}\n`;
        content += `- **Price:** ${h.pricePerNight || 'N/A'}\n`;
        content += `- **Rating:** ⭐ ${h.rating || '4.8'}\n`;
        content += `- **Overview:** ${h.description}\n\n`;
      });
    }

    if (itinerary?.packingAdvice && itinerary.packingAdvice.length > 0) {
      content += `## Packing Checklist\n\n`;
      itinerary.packingAdvice.forEach(item => {
        content += `- [ ] ${item}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.destination.toLowerCase().replace(/\s+/g, '_')}_itinerary_summary.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Summary Downloaded", "Saved Markdown file to your device.");
  };

  // 4. Export Budget (.csv)
  const handleExportBudget = () => {
    let csv = "Category,Item Name,Estimated Cost,Day/Notes\n";
    
    // Overall total
    csv += `Total Estimate,Overall Trip,${itinerary?.estimatedTotalCost || trip.budget},Full Duration\n`;

    // Hotels
    if (itinerary?.hotels) {
      itinerary.hotels.forEach((h, i) => {
        csv += `Accommodation,"${h.name.replace(/"/g, '""')}","${h.pricePerNight}",Hotel ${i + 1}\n`;
      });
    }

    // Daily activities
    if (itinerary?.days) {
      itinerary.days.forEach(d => {
        (d.activities || []).forEach(a => {
          csv += `Activity,"Day ${d.day}: ${a.title.replace(/"/g, '""')}","${a.cost || 'Included'}","${a.location ? a.location.replace(/"/g, '""') : 'Day ' + d.day}"\n`;
        });
      });
    }

    // Expense breakdown approximations
    csv += `Estimate Allocation,Accommodation (35%),~35%,Estimated\n`;
    csv += `Estimate Allocation,Activities & Sightseeing (30%),~30%,Estimated\n`;
    csv += `Estimate Allocation,Food & Local Dining (20%),~20%,Estimated\n`;
    csv += `Estimate Allocation,Transport & Misc (15%),~15%,Estimated\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.destination.toLowerCase().replace(/\s+/g, '_')}_budget_breakdown.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Budget Exported", "Downloaded CSV file for budget analysis.");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-zinc-900 rounded-[28px] border border-[#E5E2D9] dark:border-zinc-800 shadow-2xl max-w-lg w-full overflow-hidden my-8"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-[#E5E2D9] dark:border-zinc-800 flex items-center justify-between bg-[#FAF9F6] dark:bg-zinc-950">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#3b82f6]/10 text-[#3b82f6] dark:text-blue-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2D2D2D] dark:text-zinc-100">Export & Share Itinerary</h3>
                <p className="text-xs text-[#7D7A74] dark:text-zinc-400">{trip.destination} • {trip.days} Days</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#7D7A74] hover:text-[#2D2D2D] dark:hover:text-zinc-100 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Options */}
          <div className="p-6 space-y-4">

            {/* Print & PDF Export Option */}
            <div className="bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 rounded-[20px] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D2D2D] dark:text-zinc-100">Print & PDF Document</h4>
                  <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Print or save as a beautifully formatted PDF document</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onPrint();
                }}
                className="px-4 py-2.5 rounded-xl bg-[#3b82f6] text-white text-xs font-bold hover:bg-[#1d4ed8] transition-all cursor-pointer shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / PDF
              </button>
            </div>

            {/* Share Link Option */}
            <div className="bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 rounded-[20px] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D2D2D] dark:text-zinc-100">Share Web Link</h4>
                  <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Copy shareable URL or open native share menu</p>
                </div>
              </div>
              <button
                onClick={handleShareLink}
                className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#2D2D2D] dark:text-zinc-200 text-xs font-bold hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                {copiedLink ? "Copied!" : "Share Link"}
              </button>
            </div>

            {/* Copy Formatted Text */}
            <div className="bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 rounded-[20px] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D2D2D] dark:text-zinc-100">Copy Itinerary Text</h4>
                  <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Copy formatted text to paste into WhatsApp or Email</p>
                </div>
              </div>
              <button
                onClick={handleCopyText}
                className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#2D2D2D] dark:text-zinc-200 text-xs font-bold hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedText ? "Copied!" : "Copy Text"}
              </button>
            </div>

            {/* Download Summary (.md / .txt) */}
            <div className="bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 rounded-[20px] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D2D2D] dark:text-zinc-100">Download Summary (.md)</h4>
                  <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Download readable trip summary & checklist file</p>
                </div>
              </div>
              <button
                onClick={handleDownloadSummary}
                className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#2D2D2D] dark:text-zinc-200 text-xs font-bold hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                Download
              </button>
            </div>

            {/* Export Budget (.csv) */}
            <div className="bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 rounded-[20px] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D2D2D] dark:text-zinc-100">Export Budget Spreadsheet (.csv)</h4>
                  <p className="text-xs text-[#7D7A74] dark:text-zinc-400">Download itemized expense spreadsheet for Excel or Sheets</p>
                </div>
              </div>
              <button
                onClick={handleExportBudget}
                className="px-4 py-2.5 rounded-xl border border-[#E5E2D9] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#2D2D2D] dark:text-zinc-200 text-xs font-bold hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
                Export CSV
              </button>
            </div>

          </div>

          <div className="px-6 py-4 bg-[#FAF9F6] dark:bg-zinc-950 border-t border-[#E5E2D9] dark:border-zinc-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 text-xs font-bold text-[#2D2D2D] dark:text-zinc-200 hover:bg-[#FAF9F6] dark:hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExportShareModal;
