"use client";

import AppShell from "@/components/AppShell";
import AssistantChat from "@/components/AssistantChat";
import AdminAssistantChat from "@/components/AdminAssistantChat";
import { useAuth } from "@/hooks/useAuth";

export default function AssistantPage() {
  const { isAdmin } = useAuth();

  return (
    <AppShell>
      <div className="flex flex-col" style={{ minHeight: "calc(100dvh - 60px)" }}>
        {isAdmin ? <AdminAssistantChat /> : <AssistantChat />}
      </div>
    </AppShell>
  );
}
