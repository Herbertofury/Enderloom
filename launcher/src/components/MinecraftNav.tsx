import { useStore } from "../store";
import { cn } from "../lib/cn";

const workspaceViews = new Set([
  "instances",
  "instance",
  "discover",
  "project",
  "servers",
  "server",
  "accounts",
]);

export function MinecraftNav() {
  const view = useStore((state) => state.view);
  const discoverKind = useStore((state) => state.discoverKind);
  const setView = useStore((state) => state.setView);
  const openDiscover = useStore((state) => state.openDiscover);

  if (!workspaceViews.has(view)) return null;

  const entries = [
    {
      label: "My Modpacks",
      active: view === "instances" || view === "instance",
      select: () => setView("instances"),
    },
    {
      label: "Discover",
      active: (view === "discover" || view === "project") && discoverKind === "modpacks",
      select: () => openDiscover("modpacks", null),
    },
    {
      label: "Browse",
      active: (view === "discover" || view === "project") && discoverKind !== "modpacks",
      select: () => openDiscover("mods", null),
    },
    {
      label: "Servers",
      active: view === "servers" || view === "server",
      select: () => setView("servers"),
    },
    {
      label: "Skins & accounts",
      active: view === "accounts",
      select: () => setView("accounts"),
    },
  ];

  return (
    <nav
      aria-label="Minecraft workspace"
      className="flex h-11 shrink-0 items-end gap-1 border-b border-border-soft bg-void/96 px-6"
    >
      {entries.map((entry) => (
        <button
          key={entry.label}
          onClick={entry.select}
          aria-current={entry.active ? "page" : undefined}
          className={cn(
            "relative h-10 px-3 text-xs font-semibold transition-colors",
            entry.active ? "text-content" : "text-content-faint hover:text-content-muted",
          )}
        >
          {entry.label}
          {entry.active && (
            <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-(--accent)" />
          )}
        </button>
      ))}
    </nav>
  );
}
