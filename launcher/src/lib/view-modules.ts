import type { ComponentType } from "react";

import type { View } from "./types";

type ViewModuleLoader = () => Promise<{ default: ComponentType }>;

export const DEFERRED_VIEW_LOADERS: Partial<Record<View, ViewModuleLoader>> = {
  accounts: () =>
    import("../views/AccountsView").then((module) => ({ default: module.AccountsView })),
  instances: () =>
    import("../views/InstancesView").then((module) => ({ default: module.InstancesView })),
  instance: () =>
    import("../views/InstanceView").then((module) => ({ default: module.InstanceView })),
  servers: () =>
    import("../views/ServersView").then((module) => ({ default: module.ServersView })),
  server: () =>
    import("../views/ServerView").then((module) => ({ default: module.ServerView })),
  convert: () =>
    import("../views/ConversionView").then((module) => ({ default: module.ConversionView })),
  logs: () =>
    import("../views/LogsView").then((module) => ({ default: module.LogsView })),
  settings: () =>
    import("../views/SettingsView").then((module) => ({ default: module.SettingsView })),
  stats: () =>
    import("../views/StatsView").then((module) => ({ default: module.StatsView })),
};

export function preloadView(view: View): void {
  void DEFERRED_VIEW_LOADERS[view]?.();
}
