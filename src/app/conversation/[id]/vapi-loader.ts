import { env } from "@/env";
import type Vapi from "@vapi-ai/web";

const PUBLIC_VAPI_KEY = env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

class VapiLoader {
  #vapiPromise: Promise<void> | undefined;
  vapi: Vapi | undefined;

  async get() {
    // if (typeof window === "undefined") return;
    console.log("getting");
    if (!this.vapi) {
      await this.load();
    }
    return this.vapi!;
  }

  retrieve() {
    if (!this.vapi) {
      throw new Error("Vapi not loaded");
    }
    return this.vapi;
  }

  async load() {
    const shouldLoad = !this.vapi;
    if (!shouldLoad) return;
    if (!this.#vapiPromise) {
      this.#vapiPromise = this.loadInternal();
    }
    await this.#vapiPromise;
  }

  async loadInternal() {
    try {
      console.log("actual instantiation");
      this.vapi = new (await import("@vapi-ai/web").then((m) => m.default))(
        PUBLIC_VAPI_KEY,
      );
    } catch (e) {
      console.log("Error loading Vapi", e);
    }
    this.#vapiPromise = undefined;
  }
}

export const vapiLoader = new VapiLoader();
