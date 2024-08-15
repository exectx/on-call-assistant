"use client";
import Show from "@/components/show";
import Groq from "groq-sdk";
import { Button } from "@/components/ui/button";
import { api, type RouterOutputs } from "@/trpc/react";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import { useEffect, useRef, useState } from "react";
import { useCallStore } from "./live-call-store";
import { MicIcon, MicOffIcon, PhoneIcon, SettingsIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
// import { getOptionalRequestContext } from "@cloudflare/next-on-pages";

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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { atom, useAtom } from "jotai";
// import { env } from "@/env";

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
      secondarySrcState: state.secondaryState,
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
                  disabled={
                    secondaryMicEnabled ||
                    state.secondarySrcState === "screen-stream"
                  }
                  onClick={() => {
                    state.setSecondarySrc("screen");
                  }}
                >
                  {state.secondarySrcState === "screen-stream"
                    ? "Sharing"
                    : "Share tab"}
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

function JoinORLeaveCall() {
  const state = useCallStore(
    useShallow((state) => ({
      vapi: state.vapi,
      call: state.call,
      start: state.start,
      stop: state.stop,
      streamStatus: state.secondaryState,
    })),
  );
  const startCall_mut = useMutation({
    mutationFn: async () => state.start(),
  });
  return (
    <div className="flex">
      <Button
        size={"sm"}
        variant={state.call ? "destructive" : "default"}
        disabled={startCall_mut.isPending || state.streamStatus === "no-stream"}
        onClick={() => {
          if (state.call) {
            state.stop();
          } else {
            startCall_mut.mutate();
          }
        }}
      >
        <PhoneIcon
          className={cn("mr-1 size-4 rotate-[135deg]", !state.call && "hidden")}
        />
        <PhoneIcon className={cn("mr-1 size-4", state.call && "hidden")} />
        {state.call?.status ?? "undefined"}
      </Button>
      <Button
        size={"sm"}
        variant={"outline"}
        onClick={() => {
          console.log(state.call);
          console.log("messages", state.call?.messages);
        }}
      >
        log call
      </Button>
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
      <JoinORLeaveCall />
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

type Transcription = Array<string>;
const transcriptionAtom = atom<Transcription>([]);

// const x = getOptionalRequestContext();

console.log("GROQ:", process.env.NEXT_PUBLIC_GROQ_API_KEY);
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

function useTranscriptions() {
  const [transcription, setTranscriptionAt, increase, vapi] = useCallStore(
    useShallow(
      (state) =>
        [
          state.transcriptions,
          state.setTranscriptionAt,
          state.incrementTranscriptionSpace,
          state.vapi,
        ] as const,
    ),
  );
  const transcription_mut = useMutation({
    mutationFn: async (file: File) => {
      const idx = transcription.length;
      console.time(`groq-whisper-${idx}`);
      increase();
      const result = await groq.audio.transcriptions.create({
        file,
        model: "whisper-large-v3",
      });
      if (result.text) {
        setTranscriptionAt(idx, result.text);
      }
      console.timeEnd(`groq-whisper-${idx}`);
      return { idx, text: result.text };
    },
    onSuccess: ({ idx, text }) => {
      const stateTranscriptions = useCallStore.getState().transcriptions;
      console.log({
        "getState().transcriptions": stateTranscriptions,
        text,
        transcription,
      });
      let msg = transcription.join(" ");
      // const hasMarkers = transcription.find(text => text === '');
      const hasMarkerOnSelectedIndex = transcription[idx] === "";
      const hasMarkerOnOtherIndex = transcription.find(
        (text, i) => i !== idx && text === "",
      );

      if (hasMarkerOnSelectedIndex && !hasMarkerOnOtherIndex) {
        console.log(
          "Selected index has marker, react hasn't updated yet, manually updating",
        );
        transcription[idx] = text;
        msg = transcription.join(" ");
        // msg = transcription.slice(0, idx).join(" ");
      }
      if (hasMarkerOnOtherIndex) {
        console.log(
          "Skipping transcription update, other marker found, waiting for next update",
        );
        return;
      }
      // if (hasMarkerOnOtherIndex) {}

      if (vapi) {
        console.log("Sending message", msg, transcription);
      } else {
        console.log("Vapi not found");
      }
      vapi?.send({
        type: "add-message",
        message: {
          role: "system",
          content: `Latest updated transcription: ${msg}`,
        },
      });
    },
  });
  return {
    transcription,
    transcribe: transcription_mut.mutate,
    isPending: transcription_mut.isPending,
    status: transcription_mut.status,
  };
}

function VadWithStream(props: { stream: MediaStream }) {
  const vadClock = useRef(0);
  const { transcription, transcribe, status } = useTranscriptions();
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
    onSpeechEnd: (audio) => {
      console.log("speech end", Date.now() - vadClock.current);
      const wav = utils.encodeWAV(audio);
      const blob = new Blob([wav], { type: "audio/wav" });
      const file = new File([blob], "audio.wav", {
        type: "audio/wav",
      });
      transcribe(file);
    },
  });
  return (
    <>
      <div>Vad status: {vad.userSpeaking ? "speaking" : "silence"}</div>
      <div>
        {status === "pending"
          ? "Transcribing..."
          : status === "success"
            ? "Transcribed"
            : status}
      </div>
      <div className="whitespace-pre-line">
        Current: {transcription.join(" ")}
      </div>
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
    <div className="w-[500px]">
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
    <div className="contents">
      <VapiFetcher />
      <div className="p-6">
        <LiveNavTools />
      </div>
      <div className="flex h-full items-center justify-center p-6">
        <VadDebug />
      </div>
    </div>
  );
}
