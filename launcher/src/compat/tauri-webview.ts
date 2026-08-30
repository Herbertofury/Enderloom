export function getCurrentWebview() {
  return {
    onDragDropEvent: (
      handler: (event: {
        payload: { type: string; paths: string[] };
      }) => void,
    ) =>
      window.enderloomLauncher.onDragDrop((payload) => handler({ payload })),
  };
}
