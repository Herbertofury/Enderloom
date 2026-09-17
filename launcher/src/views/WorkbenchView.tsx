import { useState } from "react";
import { ArrowUpRight, Braces, Package, Plus } from "lucide-react";
import { WorkbenchPanel } from "../components/config/WorkbenchPanel";
import { useStore } from "../store";
import { useCreative } from "../creative-store";

function WorkbenchView({ mode }: { mode: "config" | "addons" }) {
  const instances = useStore((s) => s.instances);
  const target = useCreative((s) => s.workbenchTarget);
  const [chosen, setChosen] = useState(
    () =>
      useCreative.getState().workbenchTarget?.instanceId ??
      useStore.getState().detailInstanceId ??
      useStore.getState().selectedInstanceId ??
      instances[0]?.id ??
      "",
  );
  const instance = instances.find((i) => i.id === chosen) ?? instances[0];
  const Icon = mode === "config" ? Braces : Package;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border-soft bg-surface-2/30 px-6 py-3">
        <Icon className="size-4 text-violet-300" />
        <h1 className="text-sm font-semibold text-content">
          {mode === "config" ? "Config" : "Addons"}
        </h1>
        <span className="mr-auto text-xs text-content-faint">
          {mode === "config"
            ? "Settings, shared presets, health & history"
            : "Custom installs, updates & original files"}
        </span>
        {instance && (
          <>
            <label className="flex items-center gap-2 text-xs text-content-muted">
              Instance
              <select
                aria-label={`${mode === "config" ? "Config" : "Addons"} instance`}
                value={instance.id}
                onChange={(e) => {
                  setChosen(e.target.value);
                  useStore.setState({ detailInstanceId: e.target.value });
                }}
                className="max-w-72 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-content"
              >
                {instances.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="inline-flex items-center gap-1 text-xs text-content-muted"
              onClick={() => useStore.getState().openInstance(instance.id)}
            >
              Instance <ArrowUpRight size={13} />
            </button>
          </>
        )}
      </div>
      {instance ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <WorkbenchPanel
            key={`${instance.id}:${mode}:${target?.path ?? ""}`}
            instance={instance}
            mode={mode}
            initialPath={
              target?.instanceId === instance.id ? target.path : null
            }
          />
        </div>
      ) : (
        <div className="cr-empty">
          <Icon size={40} />
          <h3>
            {mode === "config"
              ? "A home for every setting."
              : "A place for every extra."}
          </h3>
          <p>
            Create or connect an instance to manage its config files and custom
            content.
          </p>
          <button
            className="cr-button cr-primary"
            onClick={() => useStore.getState().startInstanceCreate()}
          >
            <Plus size={15} />
            Create instance
          </button>
        </div>
      )}
    </div>
  );
}
export function ConfigView() {
  return <WorkbenchView mode="config" />;
}
export function AddonsView() {
  return <WorkbenchView mode="addons" />;
}
