import { AppShell } from "@/components/design-system/AppShell";
import { CardSkeleton } from "@/components/design-system/Skeleton";

export default function FeedLoading() {
  return (
    <AppShell activeTab="feed">
      <main
        className="flex-1 bg-[#050505] border-[#1a1a1a] flex flex-col overflow-hidden relative"
        style={{
          background: "rgba(14, 18, 19, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
        }}
      >
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  );
}

