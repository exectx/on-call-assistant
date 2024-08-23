"use client";
import For from "@/components/for";
import { formatDistance } from "date-fns";
import Show from "@/components/show";
import { api } from "@/trpc/react";
import Link from "next/link";

function SpaceCard(props: { title: string; summary: string; updatedAt: Date }) {
  return (
    <div className="gap-3 rounded-md border border-input bg-zinc-50 p-5">
      <div className="font-medium">{props.title}</div>
      <div>{props.summary}</div>
      <div>
        {formatDistance(props.updatedAt, new Date(), { addSuffix: true })}
      </div>
    </div>
  );
}

export function Spaces() {
  const [spaces] = api.space.getAll.useSuspenseQuery();
  console.log(spaces);

  return (
    <Show when={spaces.length > 0} fallback={<div>No spaces yet</div>}>
      <For each={spaces}>
        {(space) => (
          <Link href={`/space/${space.id}`} key={space.id}>
            <SpaceCard
              title={space.title}
              summary={space.summary}
              updatedAt={space.updatedAt}
            />
          </Link>
        )}
      </For>
    </Show>
  );
}
