/// <reference types="vite/client" />

type EnderloomUnlisten = () => void;

interface EnderloomLauncherBridge {
  readonly embedded: true;
  readonly selfTest: boolean;
  invoke<T>(command: string, args?: Record<string, unknown>): Promise<T>;
  listen<T>(
    event: string,
    handler: (payload: T) => void,
  ): Promise<EnderloomUnlisten>;
  openDialog(options: Record<string, unknown>): Promise<string | string[] | null>;
  saveDialog(options: Record<string, unknown>): Promise<string | null>;
  openExternal(url: string): Promise<void>;
  openCatalogResearch(request: {
    query: string;
    provider?: string;
    projectId?: string;
    kind?: string;
  }): Promise<{ opened: true; query: string }>;
  revealInFolder(path: string): Promise<void>;
  assetUrl(path: string): string;
  windowCommand(command: string, payload?: unknown): Promise<unknown>;
  onDragDrop(
    handler: (payload: { type: string; paths: string[] }) => void,
  ): Promise<EnderloomUnlisten>;
}

interface Window {
  enderloomLauncher: EnderloomLauncherBridge;
}
