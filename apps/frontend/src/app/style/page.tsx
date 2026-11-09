import type { Metadata } from "next";
import { AppShell } from "@/components/design-system/AppShell";
import { ToastProvider } from "@/components/design-system/Toast";
import { StyleStudioView } from "@/components/style/StyleStudioView";

export const metadata: Metadata = {
  title: "Style & Brand Studio — PostPilot",
  description:
    "Curated high-retention social templates, carousel frameworks, and visual styling studio.",
};

export default function StylePage() {
  return (
    <ToastProvider>
      <AppShell activeTab="style">
        <StyleStudioView />
      </AppShell>
    </ToastProvider>
  );
}

