import type { Metadata } from "next";
import { AppShell } from "@/components/design-system/AppShell";
import { ToastProvider } from "@/components/design-system/Toast";
import { MediaLibraryView } from "@/components/media/MediaLibraryView";

export const metadata: Metadata = {
  title: "Media Library — Asset & Content Studio — PostPilot",
  description:
    "High-fidelity social asset and content studio for managing multi-channel media, creative assets, and visual assets.",
};

export default function MediaPage() {
  return (
    <ToastProvider>
      <AppShell activeTab="media">
        <MediaLibraryView />
      </AppShell>
    </ToastProvider>
  );
}

