import { motion } from 'motion/react';

const shimmerAnimation = {
  backgroundPosition: ['200% 0', '-200% 0'],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear'
  }
};

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="w-20 h-9" />
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="aspect-square bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-2xl relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={shimmerAnimation}
        style={{
          backgroundSize: '200% 100%'
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/40 text-center space-y-2">
          <div className="w-16 h-16 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <div className="text-sm">Loading map...</div>
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Search Bar Skeleton */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Categories Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <Skeleton className="h-12 w-12 mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Products Grid Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SermonSkeleton() {
  return (
    <div className="space-y-6">
      {/* Video Player Skeleton */}
      <div className="aspect-video bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-2xl relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={shimmerAnimation}
          style={{
            backgroundSize: '200% 100%'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </div>

      {/* Info Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Transcript Skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <Skeleton className="h-6 w-32" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-4 flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="border-b border-white/10 last:border-0 p-4 flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar and Name */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Base Skeleton Component with Shimmer Effect
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded ${className}`}
      animate={shimmerAnimation}
      style={{
        backgroundSize: '200% 100%'
      }}
    />
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = 'md', color = 'emerald' }: { size?: 'sm' | 'md' | 'lg'; color?: 'emerald' | 'blue' | 'purple' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    emerald: 'border-white/10 border-t-emerald-500',
    blue: 'border-white/10 border-t-blue-500',
    purple: 'border-white/10 border-t-purple-500'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`} />
  );
}

// Pulse Dot Indicator
export function PulseDot({ color = 'emerald' }: { color?: 'emerald' | 'blue' | 'purple' | 'yellow' | 'red' }) {
  const colorClasses = {
    emerald: 'bg-emerald-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    yellow: 'bg-yellow-400',
    red: 'bg-red-400'
  };

  return (
    <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-pulse`} />
  );
}

// Full Page Loading State
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div className="text-lg font-medium text-white/60">{message}</div>
      </div>
    </div>
  );
}
