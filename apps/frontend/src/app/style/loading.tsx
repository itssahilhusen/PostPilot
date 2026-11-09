import { AppShell } from "@/components/design-system/AppShell";
import { Skeleton } from "@/components/design-system/Skeleton";

export default function StyleLoading() {
  return (
    <AppShell activeTab="style">
      <main
        className="flex-1 bg-[#050505] border-[#1a1a1a] flex flex-col overflow-hidden relative p-5 overflow-y-auto"
        style={{
          background: "rgba(14, 18, 19, 0.75)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          boxShadow:
            "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
        }}
      >
        {[1, 2, 3].map((sec) => (
          <div key={sec} className="flex flex-col gap-3.5 mb-6 last:mb-0">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-7 h-7 rounded-lg" />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-48 h-4 rounded-md" />
                    <Skeleton className="w-20 h-4 rounded-md" />
                  </div>
                  <Skeleton className="w-72 h-3 rounded-md" />
                </div>
              </div>
              <Skeleton className="w-24 h-6 rounded-lg" />
            </div>

            {/* Cards grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
              {[1, 2, 3, 4, 5].map((card) => (
                <div
                  key={card}
                  className="bg-[#111414] border border-white/[0.08] rounded-xl p-3 flex flex-col gap-2.5"
                >
                  <Skeleton className="w-full aspect-[4/5] rounded-lg" />
                  <div className="flex items-center justify-between pt-0.5">
                    <Skeleton className="w-20 h-3 rounded" />
                    <Skeleton className="w-4 h-4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </AppShell>
  );
}

