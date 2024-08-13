"use client";
import Show from "@/components/show";
import { Button } from "@/components/ui/button";
import { api, RouterOutputs } from "@/trpc/react";
import { useMicVAD } from "@ricky0123/vad-react";
import { useEffect, useRef, useState } from "react";
import { useCallStore } from "./live-call-store";
import { MicIcon, MicOffIcon, SettingsIcon } from "lucide-react";
import { shallow } from "zustand/shallow";
import { useShallow } from "zustand/react/shallow";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInputDevicesQuery, usePrimaryMicStorage } from "./hooks";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

function LiveCallSettings() {
  const devices_query = useInputDevicesQuery();
  const [micId, setMicId] = usePrimaryMicStorage();
  const hasPermissionError =
    devices_query.error?.message === "Permission denied";
  const state = useCallStore(
    useShallow((state) => ({
      enabledSecondarySrc: state.enabledSecondarySrc,
      setEnabledSecondarySrc: state.setEnabledSecondarySrc,
      setSecondarySrc: state.setSecondarySrc,
      optional_SecondarySrcMicId: state.secondarySrcMicId,
    })),
  );
  const secondaryMicEnabled = state.enabledSecondarySrc === "mic";
  function toggleEnabledSecondary() {
    state.setEnabledSecondarySrc(
      state.enabledSecondarySrc === "mic" ? "screen" : "mic",
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SettingsIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-md">
        <DialogHeader>
          <DialogTitle>Live call settings</DialogTitle>
          <DialogDescription>
            Configure your microphone and other settings for the live call.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-10 gap-4">
            <Label htmlFor="mic:primary" className="col-span-4">
              Primary microphone
            </Label>
            <Select
              disabled={devices_query.isPending || hasPermissionError}
              value={devices_query.data && micId}
              onValueChange={(id) => {
                const found = devices_query.data?.find(
                  ({ deviceId }) => deviceId === id,
                );
                if (!found) {
                  console.log(
                    "The device you selected is not available, refetching",
                  );
                  void devices_query.refetch();
                  return;
                }
                console.log(`mic:primary set to ${id}`);
                setMicId(id);
              }}
            >
              <SelectTrigger id="mic:primary" className="col-span-6">
                <Show when={hasPermissionError}>
                  <SelectValue placeholder="Permission needed" />
                </Show>
                <Show when={devices_query.isPending}>
                  <SelectValue placeholder="Loading input devices" />
                </Show>
                <Show when={devices_query.data}>
                  <SelectValue placeholder="Select your microphone" />
                </Show>
              </SelectTrigger>
              <Show when={devices_query.data}>
                <SelectContent>
                  {devices_query.data?.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Show>
            </Select>
          </div>
          <div className="grid grid-cols-10 gap-4">
            <Label className="col-span-4">Secondary source</Label>
            <div className="col-span-6 space-y-4">
              <div className="flex gap-4">
                <Switch
                  id="mic:secondary"
                  checked={secondaryMicEnabled}
                  disabled={hasPermissionError}
                  onCheckedChange={toggleEnabledSecondary}
                ></Switch>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="mic:secondary">
                    Allow microphone as secondary source
                  </Label>
                  <div className="text-xs text-muted-foreground">
                    If this is enabled, you could use your virtual device.
                  </div>
                </div>
              </div>
              <Select
                disabled={
                  devices_query.isPending ||
                  hasPermissionError ||
                  !secondaryMicEnabled
                }
                value={devices_query.data && state.optional_SecondarySrcMicId}
                onValueChange={(id) => {
                  const found = devices_query.data?.find(
                    ({ deviceId }) => deviceId === id,
                  );
                  if (!found) {
                    console.log(
                      "The device you selected is not available, refetching",
                    );
                    void devices_query.refetch();
                    return;
                  }
                  console.log(`mic:secondary set to ${id}`);
                  state.setSecondarySrc({ deviceId: id });
                }}
              >
                <SelectTrigger id="mic:secondary" className="col-span-6">
                  <Show when={hasPermissionError}>
                    <SelectValue placeholder="Permission needed" />
                  </Show>
                  <Show when={devices_query.isPending}>
                    <SelectValue placeholder="Loading input devices" />
                  </Show>
                  <Show when={devices_query.data}>
                    <SelectValue placeholder="Select your secondary input device" />
                  </Show>
                </SelectTrigger>
                <Show when={devices_query.data}>
                  <SelectContent>
                    {devices_query.data?.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Show>
              </Select>
              <div className="flex items-center justify-between gap-6 rounded bg-secondary px-6 py-4">
                <div className="space-y-1">
                  <p className="text-sm">Share screen</p>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Share a browser tab in order to access audio.
                    </p>
                  </div>
                </div>
                <Button
                  size={"sm"}
                  disabled={secondaryMicEnabled}
                  onClick={() => {
                    state.setSecondarySrc("screen");
                  }}
                >
                  Share tab
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MicrophoneToggle() {
  const qc = useQueryClient();
  const devices_query = useInputDevicesQuery();
  const [muted, muteToggle] = useCallStore(
    useShallow((store) => [store.mutedPrimary, store.toggleMutePrimary]),
  );
  const hasPermissionError_query =
    devices_query.error?.message === "Permission denied";
  console.log("permission query", hasPermissionError_query);
  const askForPermission = useQuery({
    enabled: hasPermissionError_query,
    queryKey: ["askForPermission"],
    queryFn: async ({ signal }) => {
      // @ts-expect-error navigator permissions
      const status = await navigator.permissions.query({ name: "microphone" });
      status.addEventListener(
        "change",
        (ev) => {
          console.log("status change", ev);
          void devices_query.refetch();
        },
        { signal },
      );
      console.log("status", status);
      return status;
    },
  });
  return (
    <div className="relative">
      <Button
        disabled={hasPermissionError_query || devices_query.isPending}
        variant={"outline"}
        className="transition-all"
        onClick={muteToggle}
      >
        <MicIcon className={cn("size-4", muted && "hidden")} />
        <MicOffIcon className={cn("size-4", !muted && "hidden")} />
      </Button>
      <Button
        variant={"destructive"}
        size={"sm"}
        disabled={!devices_query.error}
        className={cn(
          "absolute right-0 top-0 h-4 w-4 -translate-y-1/2 translate-x-1/2 transform rounded-full p-0",
          !hasPermissionError_query && "hidden",
        )}
        onClick={async () => {
          void qc.cancelQueries({ queryKey: ["askForPermission"] });
          void askForPermission.refetch();
        }}
      >
        !
      </Button>
    </div>
  );
}

function Debug() {
  const secondarySrcState = useCallStore((state) => state.secondaryState);
  const primarySrc = useCallStore((state) => state.primarySrcDeviceId);
  const enabledSrc = useCallStore((state) => state.enabledSecondarySrc);
  const optional_SecondarySrcMicId = useCallStore(
    (state) => state.secondarySrcMicId,
  );
  const log = useCallStore((state) => state.logMediaStream);
  return (
    <div>
      {secondarySrcState} - {enabledSrc} - primary:{primarySrc} -
      secondary[optional]:{JSON.stringify(optional_SecondarySrcMicId)}
      <button className="rounded border" onClick={log}>
        log
      </button>
    </div>
  );
}

function LiveNavTools() {
  return (
    <div className="flex min-h-14 w-full items-center justify-between rounded-md border border-input bg-zinc-50 px-4 py-3">
      <div className="flex gap-3 text-sm">
        <MicrophoneToggle />
        <LiveCallSettings />
        <Debug />
      </div>
      <Button>Start</Button>
    </div>
  );
}

function VapiFetcher() {
  const init = useCallStore((state) => state.init);
  useEffect(() => {
    // load();
    void init();
  }, []);
  return null;
}

function VadWithStream(props: { stream: MediaStream }) {
  const vadClock = useRef(0);
  const vad = useMicVAD({
    startOnLoad: true,
    stream: props.stream,
    // stream,
    workletURL:
      "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.18/dist/vad.worklet.bundle.min.js",
    modelURL:
      "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.18/dist/silero_vad.onnx",
    ortConfig: async (ort) => {
      await fetch(
        "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort-wasm-simd-threaded.wasm",
        {
          cache: "force-cache",
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ort.env.wasm.wasmPaths =
        "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
    },
    onSpeechStart() {
      console.log("speech start", new Date().toISOString());
      vadClock.current = Date.now();
    },
    onSpeechEnd: (_audio) => {
      console.log("speech end", Date.now() - vadClock.current);
    },
  });
  return (
    <>
      <div>Vad status: {vad.userSpeaking ? "speaking" : "silence"}</div>
      <Button onClick={vad.toggle}>
        {vad.listening ? "Stop" : "Start"} listening
      </Button>
    </>
  );
}

function VadDebug() {
  const stream = useCallStore((state) => state.stream);
  if (!stream)
    return (
      <div>
        <div>Stream not found</div>
        <div>Select a secondary stream source</div>
      </div>
    );

  return (
    <div>
      <VadWithStream stream={stream} />
    </div>
  );
}

export function LiveCallPage(props: {
  id: string;
  data: Exclude<RouterOutputs["conversations"]["getOne"], null>;
}) {
  const { data: conv = props.data } = api.conversations.getOne.useQuery(
    { id: props.id },
    { initialData: props.data },
  );

  if (!conv) return console.error("conv not found"), null;
  return (
    <div className="flex h-full w-full flex-col">
      <VapiFetcher />
      <LiveNavTools />
      <div className="flex h-full items-center justify-center">
        <VadDebug />
      </div>
    </div>
  );
}
