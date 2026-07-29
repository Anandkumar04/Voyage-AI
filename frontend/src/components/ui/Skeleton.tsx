import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-[#E5E2D9]/70 dark:bg-zinc-800/80 rounded-xl ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 p-5 space-y-4 shadow-sm">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
};

export const HotelSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-2 pt-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const ItinerarySkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-[#E5E2D9] dark:border-zinc-800 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white dark:bg-zinc-900 p-6 rounded-[20px] border border-[#E5E2D9] dark:border-zinc-800 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
