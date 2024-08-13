import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { api, HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { cookies, headers } from "next/headers";
import Show from "@/components/show";
import For from "@/components/for";
import { Conversations } from "./conversations";
import { CreateNewConversationButton } from "./new_conv";

export default async function Home() {
  await api.conversations.getAll.prefetch();

  return (
    <HydrateClient>
      <div className="w-full">
        <CreateNewConversationButton />
        <div className="mx-auto grid grid-cols-1 gap-4 pt-12 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <Conversations />
        </div>
      </div>
    </HydrateClient>
  );
}
