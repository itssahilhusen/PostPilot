import { AppShell } from "@/components/design-system/AppShell";
import { Skeleton } from "@/components/design-system/Skeleton";

export default function RawLoading() {
  return (
    <AppShell activeTab="raw">
      <main className="flex-1 flex flex-col min-w-0 bg-[#08090a] overflow-hidden rounded-2xl border border-white/[0.08]">
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
          {/* Stage Skeleton */}
          <div className="flex-1 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0c0d10] p-6 items-center justify-center">
            <Skeleton className="w-full max-w-[680px] aspect-[4/5] rounded-2xl" />
          </div>

          {/* Right Panel Skeleton */}
          <div className="w-full lg:w-80 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0c0d10] p-4 space-y-4 shrink-0">
            <Skeleton className="w-full h-14 rounded-xl" />
            <Skeleton className="w-full h-24 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
          </div>
        </div>
      </main>
    </AppShell>
  );
}

