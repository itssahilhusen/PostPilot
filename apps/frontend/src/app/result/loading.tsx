import { AppShell } from "@/components/design-system/AppShell";
import { Skeleton } from "@/components/design-system/Skeleton";

export default function ResultLoading() {
  return (
    <AppShell activeTab="create">
      <main
        className="flex-1 flex flex-col h-full overflow-hidden rounded-2xl relative select-none"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(20, 26, 28, 0.6) 0%, rgba(6, 8, 9, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "rgba(0, 0, 0, 0.6) 0px 10px 40px",
        }}
      >
        {/* Central Stage Skeleton */}
        <div className="flex-1 relative flex items-center justify-center px-8 py-3">
          <div className="flex items-center gap-6 py-2">
            <Skeleton className="w-[230px] h-[340px] rounded-2xl opacity-50 shrink-0" />
            <Skeleton className="w-[310px] h-[410px] rounded-2xl border-2 border-brand-lime/30 shrink-0" />
            <Skeleton className="w-[230px] h-[340px] rounded-2xl opacity-60 shrink-0" />
            <Skeleton className="w-[210px] h-[310px] rounded-2xl opacity-40 shrink-0" />
          </div>
        </div>

        {/* Bottom Filmstrip Skeleton */}
        <div className="relative z-30 px-6 pb-2 -mt-16 flex flex-col items-center">
          <div className="w-full max-w-2xl flex flex-col gap-2 items-center">
            {/* Quick Chips Skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-7 rounded-full" />
              <Skeleton className="w-24 h-7 rounded-full" />
              <Skeleton className="w-24 h-7 rounded-full" />
            </div>

            {/* AI Bar Skeleton */}
            <Skeleton className="w-full h-12 rounded-2xl" />

            {/* Thumbs Skeleton */}
            <div className="mt-2 flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="w-16 h-20 rounded-2xl shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

