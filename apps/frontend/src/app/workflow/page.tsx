import type { Metadata } from "next";
import { AppShell } from "@/components/design-system/AppShell";
import { ToastProvider } from "@/components/design-system/Toast";
import { WorkflowView } from "@/components/workflow/WorkflowView";

export const metadata: Metadata = {
  title: "Workflow Page — Automation & Pipeline Studio — PostPilot",
  description:
    "Visual node-based social intelligence and generative media workflow pipeline studio for high-velocity AI content orchestration.",
};

export default function WorkflowPage() {
  return (
    <ToastProvider>
      <AppShell activeTab="workflow">
        <WorkflowView />
      </AppShell>
    </ToastProvider>
  );
}

