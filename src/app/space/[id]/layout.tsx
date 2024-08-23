import { HydrateClient } from "@/trpc/server";
import { LiveNavTools, VapiFetcher } from "./live-call";

export default function SpaceLayout(props: { children: React.ReactNode }) {
  return (
    <HydrateClient>
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
        <VapiFetcher></VapiFetcher>
        <LiveNavTools />
        {/* <div className="flex h-10 border-b border-input bg-zinc-50"></div> */}
        {/* <div> */}
        {/*   <VapiFetcher /> */}
        {/*   <div className="p-6"> */}
        {/*     <LiveNavTools /> */}
        {/*   </div> */}
        {/*   <div className="flex h-full items-center justify-center p-6"> */}
        {/*     <VadDebug /> */}
        {/*   </div> */}
        {/* </div> */}
        <div className="w-full flex-1 overflow-y-auto">{props.children}</div>
      </div>
    </HydrateClient>
  );
}
