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
  providerSurface(request: {
    action:
      | "open"
      | "layout"
      | "hide"
      | "dispose"
      | "back"
      | "forward"
      | "reload"
      | "promote"
      | "external"
      | "copy-url"
      | "state";
    provider?: string;
    projectKey?: string;
    url?: string;
    rect?: { x: number; y: number; width: number; height: number };
  }): Promise<{
    open: boolean;
    visible: boolean;
    provider: string;
    projectKey: string;
    url: string;
    title: string;
    favicon: string;
    zoom: number;
    loading: boolean;
    canBack: boolean;
    canForward: boolean;
    error: { code: number; description: string; url: string } | null;
    promoted?: boolean;
    tabId?: string;
    promotedUrl?: string;
  }>;
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
