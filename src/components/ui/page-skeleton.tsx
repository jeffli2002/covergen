import { Skeleton } from '@/components/ui/skeleton'

export default function PageSkeleton() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Section Skeleton */}
      <section className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Title Skeleton */}
            <div className="mb-6 md:mb-8 flex flex-col items-center gap-4">
              <Skeleton className="h-12 md:h-16 lg:h-20 w-full max-w-3xl" />
              <Skeleton className="h-12 md:h-16 lg:h-20 w-full max-w-2xl" />
            </div>
            
            {/* Subtitle Skeleton */}
            <Skeleton className="h-6 md:h-8 w-full max-w-4xl mx-auto mb-8" />
            
            {/* Platform Icons Skeleton */}
            <div className="flex justify-center gap-6 md:gap-8 lg:gap-12 mb-8 flex-wrap px-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 md:gap-3">
                  <Skeleton className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-3xl" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            
            {/* CTA Button Skeleton */}
            <Skeleton className="h-16 md:h-20 w-80 mx-auto rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Generation Section Skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-96 mx-auto mb-6" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-3xl p-8">
                <Skeleton className="w-16 h-16 mx-auto mb-6 rounded-3xl" />
                <Skeleton className="h-6 w-32 mx-auto mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}