import type { Metadata } from "next";
import { AppShell } from "@/components/design-system/AppShell";
import { ToastProvider } from "@/components/design-system/Toast";
import { RawVideoStudioView } from "@/components/raw/RawVideoStudioView";

export const metadata: Metadata = {
  title: "AI Video Studio & Raw Footage — PostPilot",
  description:
    "AI-powered viral short-form video generator, kinetic caption styler, and raw footage studio.",
};

export default function RawVideoPage() {
  return (
    <ToastProvider>
      <AppShell activeTab="raw">
        <RawVideoStudioView />
      </AppShell>
    </ToastProvider>
  );
}

