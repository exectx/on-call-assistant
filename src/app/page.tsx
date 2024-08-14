import { api, HydrateClient } from "@/trpc/server";
import { Conversations } from "./conversations";
import { CreateNewConversationButton } from "./new_conv";

export default async function Home() {
  await api.conversations.getAll.prefetch();

  return (
    <HydrateClient>
      <div className="w-full p-6">
        <CreateNewConversationButton />
        <div className="mx-auto grid grid-cols-1 gap-4 pt-12 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <Conversations />
        </div>
      </div>
    </HydrateClient>
  );
}
