import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@/lib/utils";

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
          <main className="container mx-auto flex w-full max-w-6xl gap-12 pt-8">
            {children}
          </main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
