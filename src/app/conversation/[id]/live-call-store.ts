import type Vapi from "@vapi-ai/web";
import { create } from "zustand";
// import { persist } from "zustand/middleware";
import { vapiLoader } from "./vapi-loader";
import { env } from "@/env";

const VAPI_ASSISTANT_ID = env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

type Call = Exclude<Awaited<ReturnType<Vapi["start"]>>, null>;
// type SecondaryInputConfig =
//   | { src: "mic"; deviceId: string; enabled: boolean }
// type PrimaryInputConfig = { deviceId: string };
//   | { src: "screen"; sharing: boolean };

export type CallState = {
  vapi: Vapi | undefined;
  call: Call | undefined;
  stream: MediaStream | undefined;
  transcriptions: Array<string>;
  incrementTranscriptionSpace: () => void;
  setTranscriptionAt: (idx: number, text: string) => void;
  init: () => Promise<void>;
  start: () => Promise<void>;
  stop: () => void;
  enabledSecondarySrc: "screen" | "mic"; // toggle
  secondaryState: "screen-stream" | "mic-stream" | "no-stream";
  secondarySrcMicId: string | undefined;
  mutedPrimary: boolean;
  toggleMutePrimary: () => void;
  mutedSecondary: boolean;
  toggleMuteSecondary: () => void;
  // secondaryStream: MediaStream | undefined;
  primarySrcDeviceId: string | undefined;
  setPrimarySrc: (deviceId: string) => void; // managed by event listener
  setSecondarySrc: (config: "screen" | { deviceId: string }) => void;
  setEnabledSecondarySrc: (src: "screen" | "mic") => void;
  logMediaStream: () => void;
};

export const useCallStore = create<CallState>((set, get) => {
  // let secondaryStream: MediaStream | undefined;
  return {
    vapi: undefined,
    call: undefined,
    stream: undefined,
    transcriptions: [],
    incrementTranscriptionSpace: () => {
      set((state) => {
        const transcriptions = [...state.transcriptions, ""];
        return { transcriptions };
      });
    },
    setTranscriptionAt: (idx, text) => {
      set((state) => {
        const transcriptions = [...state.transcriptions];
        if (typeof transcriptions[idx] === "undefined") {
          console.log(
            "fatal error, trying to set transcription at invalid idx, ignoring",
          );
          return { transcriptions: state.transcriptions };
        }
        transcriptions[idx] = text;
        return { transcriptions };
      });
    },
    init: async () => {
      const defaultDeviceId = localStorage.getItem("mic-src");
      if (!defaultDeviceId) {
        console.log("No default device id found, critical");
      } else {
        set(() => ({ primarySrcDeviceId: defaultDeviceId }));
      }
      if (get().vapi) return;
      const vapi = await vapiLoader.get();
      set(() => ({ vapi }));
    },
    start: async (opts: { forceCall: boolean } = { forceCall: false }) => {
      const vapi = get().vapi;
      if (!vapi) {
        console.log("VAPI not loaded");
        return;
      }
      const _call = get().call;
      if (_call) {
        console.log("Call already started");
      }
      if (_call && !opts.forceCall) {
        console.log("Call already started, ignoring");
        return;
      }
      if (_call && opts.forceCall) {
        vapi.stop();
      }
      const primarySrcDeviceId = get().primarySrcDeviceId;
      console.log("starting call with primarySrcDeviceId", primarySrcDeviceId);
      if (primarySrcDeviceId) {
        vapi.setInputDevicesAsync({ audioDeviceId: primarySrcDeviceId });
      }
      const call = (await vapi.start(VAPI_ASSISTANT_ID)) ?? undefined;
      if (call && primarySrcDeviceId) {
        vapi.setInputDevicesAsync({ audioDeviceId: primarySrcDeviceId });
      }
      set(() => ({ call }));
    },
    stop: () => {
      const vapi = get().vapi;
      if (!vapi) {
        console.log("VAPI not loaded");
        return;
      }
      vapi.stop();
      set(() => ({ call: undefined }));
    },
    enabledSecondarySrc: "screen",
    secondaryState: "no-stream",
    secondarySrcMicId: undefined,
    mutedPrimary: false,
    toggleMutePrimary: () => {
      const muted = get().mutedPrimary;
      if (muted) {
        get().vapi?.setMuted(false);
      } else {
        get().vapi?.setMuted(true);
      }
      set((state) => ({ mutedPrimary: !state.mutedPrimary }));
    },
    mutedSecondary: false,
    toggleMuteSecondary: () => {
      console.log("toggling mute secondary");
    },
    primarySrcDeviceId: undefined,
    setPrimarySrc: (deviceId) => set(() => ({ primarySrcDeviceId: deviceId })),
    setSecondarySrc: (config) => {
      const enabledSrc = get().enabledSecondarySrc;
      if (config === "screen") {
        if (enabledSrc !== "screen") {
          console.log(
            "fatal error, trying to set screen source when it's not enabled",
          );
          return;
        }
        navigator.mediaDevices
          .getDisplayMedia({
            video: {
              displaySurface: "browser",
            },
            audio: {
              autoGainControl: true,
              echoCancellation: false,
              noiseSuppression: false,
            },
          })
          .then((stream) => {
            // secondaryStream = stream;
            set(() => ({ secondaryState: "screen-stream", stream }));
          })
          .catch((err) => {
            console.log(`Couldn't get user stream: ${err}`);
            set(() => ({ secondaryState: "no-stream" }));
          });
      } else {
        if (enabledSrc !== "mic") {
          console.log(
            "fatal error, trying to set mic source when it's not enabled",
          );
          return;
        }
        navigator.mediaDevices
          .getUserMedia({
            video: false,
            audio: {
              deviceId: config.deviceId,
              autoGainControl: true,
              echoCancellation: false,
              noiseSuppression: false,
            },
          })
          .then((stream) => {
            // secondaryStream = stream;
            set(() => ({
              secondaryState: "mic-stream",
              stream,
              secondarySrcMicId: config.deviceId,
            }));
          })
          .catch((err) => {
            console.log(`Couldn't get user stream: ${err}`);
            set(() => ({ secondaryState: "no-stream" }));
          });
      }
    },
    setEnabledSecondarySrc: (src) => {
      // const previousSrc = get().enabledSecondarySrc;
      console.log(
        `stopping previous stream if found and setting new src=${src}`,
      );
      // if new src is mic, then by default the id is empty
      get()
        .stream?.getTracks()
        .forEach((track) => {
          console.log(`stopping track ${track.kind}:${track.id}`);
          track.stop();
        });
      set(() => ({
        enabledSecondarySrc: src,
        secondaryState: "no-stream",
        stream: undefined,
      }));
    },
    logMediaStream: () => {
      console.log(get().stream);
    },
    // captureSecondarySource: () => {}
  };
});
