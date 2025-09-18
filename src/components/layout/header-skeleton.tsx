import { Skeleton } from '@/components/ui/skeleton'

export default function HeaderSkeleton() {
  return (
    <header className="hidden lg:block border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 relative z-50">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-2xl" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>

        {/* Navigation Skeleton */}
        <nav className="flex items-center space-x-8">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </nav>

        {/* User section Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
    </header>
  )
}