import type { Metadata } from "next";
import { AppShell } from "@/components/design-system/AppShell";
import { ToastProvider } from "@/components/design-system/Toast";
import { CalendarView } from "@/components/calendar/CalendarView";

export const metadata: Metadata = {
  title: "Content Calendar — Social Media Publishing Hub — PostPilot",
  description:
    "Intelligent multi-channel social media publishing calendar with automated AI scheduling and channel orchestration.",
};

export default function CalendarPage() {
  return (
    <ToastProvider>
      <AppShell activeTab="calendar">
        <CalendarView />
      </AppShell>
    </ToastProvider>
  );
}
