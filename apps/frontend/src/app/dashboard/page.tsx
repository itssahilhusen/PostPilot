"use client";

import React from "react";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function DashboardPage() {
  return <WorkspaceShell initialView="pipelines" />;
}
