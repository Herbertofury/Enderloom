export function open(
  options: Record<string, unknown> = {},
): Promise<string | string[] | null> {
  return window.enderloomLauncher.openDialog(options);
}

export function save(
  options: Record<string, unknown> = {},
): Promise<string | null> {
  return window.enderloomLauncher.saveDialog(options);
}
