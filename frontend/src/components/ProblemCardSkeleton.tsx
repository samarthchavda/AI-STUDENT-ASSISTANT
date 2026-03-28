/**
 * Beautiful Shimmer Loading Skeleton for Problem Cards
 * Used while fetching 1000+ questions
 */

export default function ProblemCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      {/* Title Skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
        </div>
        <div className="w-16 h-8 bg-gray-200 rounded-full"></div>
      </div>

      {/* Tags Skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-28 bg-gray-200 rounded-full"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

export function ProblemListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ProblemCardSkeleton key={idx} />
      ))}
    </div>
  )
}

export function ShimmerSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gray-200 rounded-lg">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  )
}
