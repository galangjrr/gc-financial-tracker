import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Net Worth Card Skeleton */}
      <div className="bg-canvas border border-hairline rounded-[32px] p-8 md:p-10">
        <Skeleton className="h-4 w-48 mb-4 bg-hairline" />
        <Skeleton className="h-14 w-72 bg-hairline" />
      </div>

      {/* Wallets Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-canvas border border-hairline rounded-[16px] p-6">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-7 w-40" />
            </div>
          ))}
        </div>
      </div>

      {/* Budget + Transactions Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-canvas border border-hairline rounded-[32px] p-8">
          <Skeleton className="h-7 w-44 mb-8" />
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-10" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-4 w-52 mt-3" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-canvas border border-hairline rounded-[32px] p-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-10 w-20 rounded-md" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-surface-card rounded-[16px]">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
