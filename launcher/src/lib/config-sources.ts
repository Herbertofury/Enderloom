import { api } from "./api";
import type { ContentItem } from "./types";
import type { ConfigAssociation } from "./config-associations";
export type ConfigOwnerProjection=Record<string, Pick<import("./workbench").WorkbenchEntry,"owner"|"automatic_owner">>;

export interface ConfigSourceReport {
  status: string; message: string; evidence: NonNullable<ConfigAssociation["evidence"]>[];
  checked_at: number; retry_at?: number | null;
}
export interface SourceProgress { completed: number; total: number; found: number; deferred: boolean; active: boolean; errors: number; retryAt?: number }
// Limit simultaneous work, never the number of mods. Leaving the view stops queued requests.
// Native code deduplicates requests and caches both discoveries and unavailable repositories.
export async function discoverConfigSources(instanceId: string, mods: ContentItem[], signal: AbortSignal, publish: (progress: SourceProgress) => void, onEvidence: () => void) {
  const queue=mods.filter(m => m.source?.provider && m.source?.project_id);
  const progress: SourceProgress={ completed:0,total:queue.length,found:0,deferred:false,active:true,errors:0 };
  let next=0;publish({...progress});
  await Promise.all(Array.from({length:Math.min(3,queue.length)},async()=>{
    while (!signal.aborted && !progress.deferred) {
      const mod=queue[next++];if(!mod)break;
      try {
        const result=await api.discoverModConfigSources(instanceId,mod.file_name);
        if(signal.aborted)return;
        progress.found+=result.evidence.length;
        if(result.evidence.length)onEvidence();
        if(result.status==="deferred"){progress.deferred=true;if(result.retry_at)progress.retryAt=result.retry_at;}
        if(result.status==="unavailable")progress.errors++;
      } catch { if(signal.aborted)return;progress.errors++; }
      progress.completed++;publish({...progress});
    }
  }));
  if(!signal.aborted){progress.active=false;publish({...progress});}
}
