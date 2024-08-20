"use client";
import For from "@/components/for";
import Show from "@/components/show";
import { api } from "@/trpc/react";
import Link from "next/link";

function SpaceCard() {
  return (
    <div className="gap-3 rounded-md border border-input bg-zinc-50 p-5">
      <div className="font-medium">title</div>
      <div>Summary</div>
    </div>
  );
}

export function Spaces() {
  const [spaces] = api.space.getAll.useSuspenseQuery();

  return (
    <Show when={spaces.length > 0} fallback={<div>No spaces yet</div>}>
      <For each={spaces}>
        {(space) => (
          <Link href={`/space/${space.id}`} key={space.id}>
            <SpaceCard />
          </Link>
        )}
      </For>
    </Show>
  );
}
