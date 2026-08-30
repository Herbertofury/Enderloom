export interface Event<T> {
  event: string;
  id: number;
  payload: T;
}

export type UnlistenFn = () => void;

export function listen<T>(
  event: string,
  handler: (event: Event<T>) => void,
): Promise<UnlistenFn> {
  return window.enderloomLauncher.listen<T>(event, (payload) =>
    handler({ event, id: 0, payload }),
  );
}
