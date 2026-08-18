import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

type ResponseValue = { source: "cache" | "network"; ok: boolean; clone: () => ResponseValue };
type FetchHandler = (event: { request: { method: string; mode: string; url: string }; respondWith: (response: Promise<ResponseValue>) => void }) => void;

const serviceWorkerSource = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

function runNavigationRequest() {
  const cachedResponse: ResponseValue = { source: "cache", ok: true, clone: () => cachedResponse };
  const networkResponse: ResponseValue = { source: "network", ok: true, clone: () => networkResponse };
  let fetchCalls = 0;
  let responsePromise: Promise<ResponseValue> | undefined;
  let fetchHandler: FetchHandler | undefined;

  const cache = {
    addAll: async () => undefined,
    put: async () => undefined
  };
  const cachesApi = {
    match: async () => cachedResponse,
    open: async () => cache,
    keys: async () => [],
    delete: async () => true
  };
  const serviceWorker = {
    location: { origin: "http://localhost:3000" },
    addEventListener: (type: string, handler: FetchHandler) => {
      if (type === "fetch") fetchHandler = handler;
    },
    skipWaiting: () => undefined,
    clients: { claim: async () => undefined }
  };

  runInNewContext(serviceWorkerSource, {
    URL,
    caches: cachesApi,
    fetch: async () => {
      fetchCalls += 1;
      return networkResponse;
    },
    Response: { error: () => ({ source: "network", ok: false, clone: () => networkResponse }) },
    self: serviceWorker
  });

  fetchHandler?.({
    request: { method: "GET", mode: "navigate", url: "http://localhost:3000/" },
    respondWith: (response) => { responsePromise = response; }
  });

  return { fetchCalls, responsePromise };
}

describe("service worker", () => {
  it("invalide le cache applicatif précédent", () => {
    expect(serviceWorkerSource).toContain('"english-adventure-v2"');
  });

  it("privilégie la version réseau pour le document de navigation", async () => {
    const result = runNavigationRequest();

    expect(result.fetchCalls).toBe(1);
    await expect(result.responsePromise).resolves.toMatchObject({ source: "network" });
  });
});
