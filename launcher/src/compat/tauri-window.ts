type UnlistenFn = () => void;

function noWindowEvent(): Promise<UnlistenFn> {
  return Promise.resolve(() => {});
}

const currentWindow = {
  destroy: () => window.enderloomLauncher.windowCommand("close"),
  close: () => window.enderloomLauncher.windowCommand("close"),
  minimize: () => window.enderloomLauncher.windowCommand("minimize"),
  unminimize: () => window.enderloomLauncher.windowCommand("restore"),
  setFocus: () => window.enderloomLauncher.windowCommand("focus"),
  toggleMaximize: () => window.enderloomLauncher.windowCommand("toggle-maximize"),
  isMaximized: () =>
    window.enderloomLauncher
      .windowCommand("is-maximized")
      .then((value) => Boolean(value)),
  onResized: (_handler: () => void): Promise<UnlistenFn> => noWindowEvent(),
  onCloseRequested: (
    _handler: (event: { preventDefault(): void }) => void,
  ): Promise<UnlistenFn> => noWindowEvent(),
  startResizeDragging: (direction: string) =>
    window.enderloomLauncher.windowCommand("start-resize", direction),
};

export function getCurrentWindow() {
  return currentWindow;
}
