import type { Metadata } from "next";
import { AppShell } from "@/components/design-system/AppShell";
import { ToastProvider } from "@/components/design-system/Toast";
import { ResultStudioView } from "@/components/result/ResultStudioView";

export const metadata: Metadata = {
  title: "Create Studio — PostPilot",
  description:
    "Immersive social media carousel deck creator, visual slide editor, and real-time AI copy refiner.",
};

export default function ResultPage() {
  return (
    <ToastProvider>
      <AppShell activeTab="create">
        <ResultStudioView />
      </AppShell>
    </ToastProvider>
  );
}

