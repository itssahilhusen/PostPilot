import { AppShell } from "@/components/design-system/AppShell";
import { Skeleton } from "@/components/design-system/Skeleton";

export default function CalendarLoading() {
  return (
    <AppShell activeTab="calendar">
      <div className="flex flex-1 overflow-hidden w-full h-full gap-3">
        {/* Left Signal Array Skeleton */}
        <aside
          className="w-[260px] hidden md:flex flex-col justify-between p-3.5 shrink-0"
          style={{
            background: "rgba(14, 18, 19, 0.75)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="space-y-4">
            <Skeleton className="w-28 h-5 rounded-lg" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="w-12 h-12 rounded-full mx-auto" />
              <Skeleton className="w-12 h-12 rounded-full mx-auto" />
              <Skeleton className="w-12 h-12 rounded-full mx-auto" />
            </div>
            <Skeleton className="w-full h-8 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-10 rounded-xl" />
          </div>
          <Skeleton className="w-full h-36 rounded-2xl" />
        </aside>

        {/* Calendar Workspace Skeleton */}
        <main
          className="flex-1 flex flex-col overflow-hidden relative min-w-0"
          style={{
            background: "rgba(14, 18, 19, 0.75)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="h-14 border-b border-white/10 px-5 flex items-center justify-between">
            <Skeleton className="w-32 h-8 rounded-lg" />
            <Skeleton className="w-44 h-8 rounded-xl" />
          </div>
          <div className="flex-1 p-4 grid grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="w-full h-10 rounded-lg" />
                <Skeleton className="w-full h-64 rounded-2xl" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </AppShell>
  );
}

