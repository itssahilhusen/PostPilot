import type { Metadata } from "next";
import { AppShell } from "@/components/design-system/AppShell";
import { CalendarView } from "@/components/calendar/CalendarView";

export const metadata: Metadata = {
  title: "Content Calendar — Social Media Publishing Hub — PostPilot",
  description:
    "Intelligent multi-channel social media publishing calendar with automated AI scheduling and channel orchestration.",
};

export default function CalendarPage() {
  return (
    <AppShell activeTab="calendar">
      <CalendarView />
    </AppShell>
  );
}
