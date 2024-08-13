"use server";

import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export async function newConversation() {
  const conv = await api.conversations.create();
  if (!conv) {
    throw new Error("Failed to create conversation");
  }
  redirect(`/conversation/${conv.id}`);
}
