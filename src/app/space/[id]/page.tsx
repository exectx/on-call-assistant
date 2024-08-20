import { api, HydrateClient } from "@/trpc/server";
import { LiveCallPage } from "./live-call";
import { redirect } from "next/navigation";

export default async function SpacePage(props: {
  params: {
    id: string;
  };
}) {
  const data = await api.space.getOne({ id: props.params.id });
  if (!data) {
    console.log("no data", props.params.id);
    redirect("/404");
  }
  return (
    <HydrateClient>
      <LiveCallPage id={props.params.id} data={data} />
    </HydrateClient>
  );
}
