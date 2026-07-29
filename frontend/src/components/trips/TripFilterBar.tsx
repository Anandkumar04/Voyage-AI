import React from 'react';
import { Search, Filter, X, ArrowUpDown, SlidersHorizontal } from 'lucide-react';

interface TripFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedBudget: string;
  onBudgetChange: (value: string) => void;
  selectedStyle: string;
  onStyleChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  totalResults: number;
  onReset: () => void;
}

export const TripFilterBar: React.FC<TripFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedBudget,
  onBudgetChange,
  selectedStyle,
  onStyleChange,
  sortBy,
  onSortChange,
  totalResults,
  onReset,
}) => {
  const budgets = ['All', 'Budget', 'Moderate', 'Luxury'];
  const styles = ['All', 'Relaxed', 'Balanced', 'Action-packed', 'Cultural', 'Romantic'];

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedBudget !== 'All' || 
    selectedStyle !== 'All' || 
    sortBy !== 'newest';

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 p-5 shadow-sm space-y-4">
      {/* Top Row: Search Input + Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D7A74] dark:text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by destination or interest (e.g. Kyoto, Beach)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-xs font-medium text-[#2D2D2D] dark:text-zinc-100 placeholder-[#A8A399] dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7D7A74] hover:text-[#2D2D2D] dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-[14px] border border-[#E5E2D9] dark:border-zinc-800 bg-[#FAF9F6] dark:bg-zinc-950 text-xs font-bold text-[#7D7A74] dark:text-zinc-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#3b82f6]" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-[#2D2D2D] dark:text-zinc-100 focus:outline-none font-bold text-xs cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="destination">Sort: Destination (A-Z)</option>
              <option value="duration">Sort: Duration (Days)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-3 py-2.5 rounded-[14px] border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E2D9] dark:border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Budget filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#7D7A74] dark:text-zinc-500 uppercase tracking-wider text-[10px]">
              Budget:
            </span>
            <div className="flex gap-1">
              {budgets.map((b) => (
                <button
                  key={b}
                  onClick={() => onBudgetChange(b)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    selectedBudget === b
                      ? 'bg-[#3b82f6] text-white shadow-sm'
                      : 'bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 text-[#7D7A74] dark:text-zinc-400 hover:text-[#2D2D2D]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Style filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#7D7A74] dark:text-zinc-500 uppercase tracking-wider text-[10px]">
              Style:
            </span>
            <div className="flex gap-1 overflow-x-auto">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => onStyleChange(s)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedStyle === s
                      ? 'bg-[#8b5cf6] text-white shadow-sm'
                      : 'bg-[#FAF9F6] dark:bg-zinc-950 border border-[#E5E2D9] dark:border-zinc-800 text-[#7D7A74] dark:text-zinc-400 hover:text-[#2D2D2D]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#7D7A74] dark:text-zinc-500">
          Showing <strong className="text-[#2D2D2D] dark:text-zinc-200">{totalResults}</strong> {totalResults === 1 ? 'trip' : 'trips'}
        </div>
      </div>
    </div>
  );
};

export default TripFilterBar;
