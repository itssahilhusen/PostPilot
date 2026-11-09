import { AppShell } from "@/components/design-system/AppShell";
import { Skeleton } from "@/components/design-system/Skeleton";

export default function MediaLoading() {
  return (
    <AppShell activeTab="media">
      <main
        className="flex-1 h-full flex flex-col bg-[#0D0F10] border border-white/10 rounded-2xl overflow-hidden"
        style={{
          background: "rgba(13, 16, 17, 0.85)",
        }}
      >
        <div className="flex-1 w-full h-full flex overflow-hidden">
          {/* Left Channels Skeleton */}
          <aside className="w-[320px] h-full border-r border-white/10 hidden lg:flex flex-col p-3 space-y-3 shrink-0">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                <Skeleton className="w-10 h-10 rounded-full mb-2" />
                <Skeleton className="w-20 h-3 rounded-md mb-1" />
                <Skeleton className="w-32 h-2.5 rounded-md mb-2" />
                <Skeleton className="w-full h-6 rounded-lg" />
              </div>
            ))}
          </aside>

          {/* Right Workspace Skeleton */}
          <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#090A0B]">
            <div className="h-14 border-b border-white/10 px-5 flex items-center justify-between">
              <div className="flex gap-2">
                <Skeleton className="w-24 h-8 rounded-lg" />
                <Skeleton className="w-20 h-8 rounded-lg" />
                <Skeleton className="w-28 h-8 rounded-lg" />
              </div>
              <Skeleton className="w-36 h-8 rounded-lg" />
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-[#141718] p-3 space-y-3">
                  <Skeleton className="w-full h-44 rounded-xl" />
                  <Skeleton className="w-3/4 h-4 rounded-md" />
                  <Skeleton className="w-1/2 h-3 rounded-md" />
                  <div className="flex justify-between pt-1">
                    <Skeleton className="w-20 h-5 rounded-full" />
                    <Skeleton className="w-16 h-5 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

