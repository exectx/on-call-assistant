"use client";
import For from "@/components/for";
import Show from "@/components/show";
import { api } from "@/trpc/react";
import Link from "next/link";

function ConversationCard() {
  return (
    <div className="gap-3 rounded-md border border-input bg-zinc-50 p-5">
      <div className="font-medium">title</div>
      <div>Summary</div>
    </div>
  );
}

export function Conversations() {
  const [convs] = api.conversations.getAll.useSuspenseQuery();

  return (
    <Show when={convs.length > 0} fallback={<div>No conversations yet</div>}>
      <For each={convs}>
        {(conv) => (
          <Link href={`/conversation/${conv.id}`} key={conv.id}>
            <ConversationCard />
          </Link>
        )}
      </For>
    </Show>
  );
}
