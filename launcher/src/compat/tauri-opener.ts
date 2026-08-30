export function openUrl(url: string): Promise<void> {
  return window.enderloomLauncher.openExternal(url);
}

export function revealItemInDir(filePath: string): Promise<void> {
  return window.enderloomLauncher.revealInFolder(filePath);
}
