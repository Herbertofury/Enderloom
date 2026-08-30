export function invoke<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  return window.enderloomLauncher.invoke<T>(command, args);
}

export function convertFileSrc(filePath: string): string {
  return window.enderloomLauncher.assetUrl(filePath);
}
