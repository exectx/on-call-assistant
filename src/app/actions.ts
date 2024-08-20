"use server";

import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export async function newSpace() {
  const space = await api.space.create();
  if (!space) {
    throw new Error("Failed to create conversation");
  }
  redirect(`/space/${space.id}`);
}
