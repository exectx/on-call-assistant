import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <div className="w-full">
        {hello ? hello.greeting : "Loading tRPC query..."}
        <LatestPost />
      </div>
    </HydrateClient>
  );
}
