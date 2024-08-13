import { useLocalStorageQuery } from "@/lib/hooks/use-local-storage";
import { useQuery } from "@tanstack/react-query";
import { useCallStore } from "./live-call-store";

export function useInputDevicesQuery() {
  const inputDevices_query = useQuery({
    queryKey: ["inputDevices"],
    queryFn: async () => {
      return navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          //stop tracks
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          return navigator.mediaDevices.enumerateDevices();
        })
        .then((devices) => devices.filter((d) => d.kind === "audioinput"));
    },
    retry: false,
  });
  return inputDevices_query;
}

export function usePrimaryMicStorage() {
  const [micStorage, setMicStorage] = useLocalStorageQuery(
    "mic-src",
    "default",
  );
  const setPrimaryMic = useCallStore((state) => state.setPrimarySrc);
  function setPrimarySrcStorage(deviceId: string) {
    setMicStorage(deviceId);
    setPrimaryMic(deviceId);
  }
  return [micStorage, setPrimarySrcStorage] as const;
}
