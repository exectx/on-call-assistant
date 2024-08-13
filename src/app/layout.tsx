import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { nanoid } from "nanoid";
import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { Provider } from "jotai";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "On-Call Assistant",
  description: "Get help and information about what you are on-call for.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const runtime = "edge";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full`}>
      <body
        className={cn("h-full bg-stone-100 text-blue-800 dark:bg-stone-900")}
      >
        <TRPCReactProvider>
          <Provider>
            {/* <Script src="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort-wasm-simd-threaded.wasm"></Script> */}
            <Script src="https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.18/dist/bundle.min.js"></Script>
            <div id="layouts" className="flex h-full">
              <div
                id="sidebar"
                className="w-[255px] border-r border-input bg-zinc-50"
              >
                <div className="flex h-12 items-center justify-start border-b border-input px-5">
                  Home icon
                </div>
                <div className="flex flex-col gap-2 border-b border-[rgb(223,223,223)] px-5 py-6">
                  <div className="text-primary/75">Conversations</div>
                  <Link href={"/"}>All convos</Link>
                </div>
                <div className="flex flex-col gap-2 border-b border-input px-5 py-6">
                  <div className="text-primary/75">Settings</div>
                  <Link href="/settings/devices">Microphone</Link>
                  <Link href="/settings/api-keys">API Keys</Link>
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                {/* #E0DFE0 */}
                <div className="flex h-12 items-center border-b border-input bg-zinc-50 px-6">
                  Conversations
                </div>
                <main className="flex w-full flex-1 px-6 pt-6">{children}</main>
              </div>
            </div>
            <Toaster />
          </Provider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
