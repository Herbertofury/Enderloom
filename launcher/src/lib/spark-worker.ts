import { analyzeSpark } from "./performance-evidence";
self.onmessage = (
  event: MessageEvent<{ bytes: Uint8Array; title: string }>,
) => {
  try {
    self.postMessage({
      report: analyzeSpark(event.data.bytes, event.data.title),
    });
  } catch (e) {
    self.postMessage({ error: String(e) });
  }
};
