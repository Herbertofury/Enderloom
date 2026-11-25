import {
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { api } from "../lib/api";
import {
  ContentInstallerContext,
  type ContentInstallOptions,
} from "../lib/contentInstaller";
import type {
  InstallPlan,
  ManualDownload,
  ManualDownloadSource,
  SearchProvider,
} from "../lib/types";
import { useStore } from "../store";

const InstallPlanPrompt = lazy(() =>
  import("./InstallPlanPrompt").then((module) => ({
    default: module.InstallPlanPrompt,
  })),
);

const ManualDownloadDialog = lazy(() =>
  import("./CurseForgeDownloadModal").then((module) => ({
    default: module.ManualDownloadDialog,
  })),
);

interface InstallRequest {
  provider: SearchProvider;
  projectId: string;
  versionId: string;
  downloads: ManualDownload[];
  resolve: (sources: ManualDownloadSource[] | null) => void;
  reject: (error: unknown) => void;
}

interface ContentPlanRequest {
  plan: InstallPlan;
  resolve: (withDependencies: boolean | null) => void;
}

export function ContentInstallerProvider({ children }: { children: React.ReactNode }) {
  const installModpack = useStore((state) => state.installModpack);
  const installContentShared = useStore((state) => state.installContent);
  const beginOptimisticTask = useStore((state) => state.beginOptimisticTask);
  const endOptimisticTask = useStore((state) => state.endOptimisticTask);
  const [request, setRequest] = useState<InstallRequest | null>(null);
  const [contentRequest, setContentRequest] = useState<ContentPlanRequest | null>(null);
  const [installingVersionId, setInstallingVersionId] = useState<string | null>(null);

  const collectSources = useCallback(
    async (
      provider: SearchProvider,
      projectId: string,
      versionId: string,
    ): Promise<ManualDownloadSource[] | null> => {
      let sources: ManualDownloadSource[] = [];
      if (provider === "curseforge") {
        const plan = await api.planModpackInstall(provider, projectId, versionId);
        if (plan.manual_downloads.length > 0) {
          const collected = await new Promise<ManualDownloadSource[] | null>(
            (resolve, reject) => {
              setRequest({
                provider,
                projectId,
                versionId,
                downloads: plan.manual_downloads,
                resolve,
                reject,
              });
            },
          );
          if (!collected) return null;
          sources = collected;
          toast.info("Browser downloads verified", {
            description: "Installing the pack.",
          });
        }
      }
      return sources;
    },
    [],
  );

  const runInstall = useCallback(
    async (provider: SearchProvider, projectId: string, versionId: string) => {
      const sources = await collectSources(provider, projectId, versionId);
      if (!sources) return null;
      return await installModpack(provider, projectId, versionId, sources);
    },
    [collectSources, installModpack],
  );

  const installServerPack = useCallback(
    async (provider: SearchProvider, projectId: string, versionId: string) => {
      const sources = await collectSources(provider, projectId, versionId);
      if (!sources) return null;
      return await api.installServerPack(provider, projectId, versionId, sources);
    },
    [collectSources],
  );

  const installPack = useCallback(
    async (
      provider: SearchProvider,
      projectId: string,
      versionId: string,
      title = "Modpack",
      iconUrl: string | null = null,
    ) => {
      setInstallingVersionId(versionId);
      const taskId = beginOptimisticTask("modpack_install", title, {
        subtitle: "Preparing the pack",
        iconUrl,
        projectId,
      });
      try {
        return await runInstall(provider, projectId, versionId);
      } catch (error) {
        toast.error(`Could not install ${title}`, { description: String(error) });
        throw error;
      } finally {
        endOptimisticTask(taskId);
        setInstallingVersionId(null);
      }
    },
    [beginOptimisticTask, endOptimisticTask, runInstall],
  );

  const installLatestPack = useCallback(
    async (
      provider: SearchProvider,
      projectId: string,
      title = "Modpack",
      iconUrl: string | null = null,
    ) => {
      const taskId = beginOptimisticTask("modpack_install", title, {
        subtitle: "Finding a compatible version",
        iconUrl,
        projectId,
      });
      try {
        const versions = await api.listProjectVersions(
          provider,
          projectId,
          "modpacks",
          "",
          null,
        );
        const preferred =
          versions.find((version) => version.channel === "release") ?? versions[0];
        if (!preferred) {
          throw new Error("This pack has no installable versions.");
        }
        setInstallingVersionId(preferred.id);
        return await runInstall(provider, projectId, preferred.id);
      } catch (error) {
        toast.error(`Could not install ${title}`, { description: String(error) });
        throw error;
      } finally {
        endOptimisticTask(taskId);
        setInstallingVersionId(null);
      }
    },
    [beginOptimisticTask, endOptimisticTask, runInstall],
  );

  const installContent = useCallback(
    async (options: ContentInstallOptions) => {
      const taskId = beginOptimisticTask(
        "content_install",
        options.title ?? "Content",
        {
          subtitle: "Planning install",
          iconUrl: options.iconUrl,
          instanceId: options.instanceId,
          projectId: options.projectId,
        },
      );
      try {
        const plan = options.serverId
          ? await api.planServerContentInstall(
              options.serverId,
              options.provider,
              options.projectId,
              options.versionId ?? null,
            )
          : await api.planContentInstall(
              options.provider,
              options.projectId,
              options.instanceId ?? "",
              options.kind,
              options.gameVersion,
              options.loader,
              options.versionId ?? null,
            );
        const replaces =
          !!plan.primary?.replaces || plan.dependencies.some((file) => !!file.replaces);
        const trivial =
          plan.dependencies.length === 0 &&
          plan.skipped.length === 0 &&
          plan.conflicts.length === 0 &&
          !replaces;
        let withDependencies = true;
        if (!trivial) {
          const choice = await new Promise<boolean | null>((resolve) => {
            setContentRequest({ plan, resolve });
          });
          if (choice === null) return null;
          withDependencies = choice;
        }
        return await installContentShared({
          provider: options.provider,
          projectId: options.projectId,
          instanceId: options.instanceId,
          serverId: options.serverId,
          kind: options.kind,
          gameVersion: options.gameVersion,
          loader: options.loader,
          versionId: options.versionId,
          withDependencies,
        });
      } catch (error) {
        toast.error(`Could not install ${options.title ?? "content"}`, {
          description: String(error),
        });
        throw error;
      } finally {
        endOptimisticTask(taskId);
      }
    },
    [beginOptimisticTask, endOptimisticTask, installContentShared],
  );

  const finishContentRequest = useCallback(
    (withDependencies: boolean | null) => {
      contentRequest?.resolve(withDependencies);
      setContentRequest(null);
    },
    [contentRequest],
  );

  const finishRequest = useCallback(
    (sources: ManualDownloadSource[] | null) => {
      request?.resolve(sources);
      setRequest(null);
    },
    [request],
  );

  const failRequest = useCallback(
    (error: string) => {
      request?.reject(new Error(error));
      setRequest(null);
    },
    [request],
  );

  const value = useMemo(
    () => ({
      installContent,
      installPack,
      installLatestPack,
      installServerPack,
      installingVersionId,
    }),
    [installContent, installPack, installLatestPack, installServerPack, installingVersionId],
  );

  return (
    <ContentInstallerContext.Provider value={value}>
      {children}
      {contentRequest && (
        <Suspense fallback={null}>
          <InstallPlanPrompt
            plan={contentRequest.plan}
            busy={false}
            progress={null}
            onConfirm={() => finishContentRequest(true)}
            onSkipDependencies={() => finishContentRequest(false)}
            onCancel={() => finishContentRequest(null)}
          />
        </Suspense>
      )}
      {request && (
        <Suspense fallback={null}>
          <ManualDownloadDialog
            request={request}
            resolveMore={(sources) =>
              api
                .planModpackInstall(request.provider, request.projectId, request.versionId, sources)
                .then((plan) => plan.manual_downloads)
            }
            onClose={() => finishRequest(null)}
            onReady={finishRequest}
            onError={failRequest}
          />
        </Suspense>
      )}
    </ContentInstallerContext.Provider>
  );
}
