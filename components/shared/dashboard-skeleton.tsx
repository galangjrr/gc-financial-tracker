import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 KPI Summary Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-full">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="bg-surface-card p-3.5 sm:p-4 rounded-2xl border border-hairline min-w-0"
          >
            <Skeleton className="h-3 w-24 mb-2 bg-hairline" />
            <Skeleton className="h-7 w-36 bg-hairline" />
          </div>
        ))}
      </div>

      {/* Trend Chart Skeleton */}
      <div className="bg-surface-card rounded-3xl p-6 border border-hairline">
        <Skeleton className="h-5 w-40 mb-2 bg-hairline" />
        <Skeleton className="h-3 w-56 mb-6 bg-hairline" />
        <Skeleton className="h-56 w-full rounded-2xl bg-hairline" />
      </div>

      {/* Wallets Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-36 bg-hairline" />
          <Skeleton className="h-8 w-24 rounded-full bg-hairline" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-surface-card border border-hairline rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-7 h-7 rounded-full bg-hairline" />
                <Skeleton className="h-4 w-20 bg-hairline" />
              </div>
              <Skeleton className="h-5 w-28 bg-hairline" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Category Spend & Recent Transactions Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-card border border-hairline rounded-3xl p-6">
          <Skeleton className="h-6 w-52 mb-6 bg-hairline" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-28 bg-hairline" />
                  <Skeleton className="h-4 w-16 bg-hairline" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-hairline" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-card border border-hairline rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-36 bg-hairline" />
            <Skeleton className="h-4 w-16 bg-hairline" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-canvas rounded-2xl border border-hairline">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full bg-hairline" />
                  <div>
                    <Skeleton className="h-4 w-28 mb-1 bg-hairline" />
                    <Skeleton className="h-3 w-36 bg-hairline" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20 bg-hairline" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
