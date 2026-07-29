import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-[#E5E2D9] dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/40 rounded-3xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            404 Error
          </span>
          <h1 className="text-3xl font-black text-[#2D2D2D] dark:text-zinc-100 tracking-tight">
            Destination Not Found
          </h1>
          <p className="text-sm text-[#7D7A74] dark:text-zinc-400">
            The page or travel route you are looking for has been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/planner"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#3b82f6] hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-md"
          >
            <Compass className="w-4 h-4" />
            Plan New Trip
          </Link>
          <Link
            to="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#FAF9F6] dark:bg-zinc-800 border border-[#E5E2D9] dark:border-zinc-700 text-[#2D2D2D] dark:text-zinc-200 font-bold rounded-xl text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
