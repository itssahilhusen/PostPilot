import type { Metadata } from "next";
import { AppShell } from "@/components/design-system/AppShell";
import { ToastProvider } from "@/components/design-system/Toast";
import { FeedView } from "@/components/feed/FeedView";

export const metadata: Metadata = {
  title: "Ideas & Feeds — PostPilot Social Media Publishing Hub",
  description:
    "Real-time social intelligence feed and AI carousel synthesis engine. Monitor live web trends, research breakthroughs, X, Reddit, and newsletters.",
};

export default function FeedPage() {
  return (
    <ToastProvider>
      <AppShell activeTab="feed">
        <FeedView />
      </AppShell>
    </ToastProvider>
  );
}

